require "rails_helper"

RSpec.describe "Posts API", type: :request do
  let(:user) { create(:user) }
  let(:post_record) { create(:post) }

  describe "POST /api/v1/posts" do
    it "awards the author creator points" do
      expect {
        post "/api/v1/posts", params: {title: "Comeback!"}, headers: auth_headers(user)
      }.to change { user.reload.idol_points }.by(Pointable::POINT_VALUES[:create_post])

      expect(response).to have_http_status(:created)
    end

    it "awards a title badge when a post pushes the user into a new tier" do
      user.update!(idol_points: 95)

      post "/api/v1/posts", params: {title: "Comeback!"}, headers: auth_headers(user)

      expect(user.reload.badges.map { |badge| badge["name"] }).to include("Rising Star")
    end
  end

  describe "POST /api/v1/posts/:id/like" do
    it "likes the post and reports the count" do
      post "/api/v1/posts/#{post_record.id}/like", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(json_response["liked"]).to be(true)
      expect(json_response["likes_count"]).to eq(1)
    end

    it "toggles a second like back off" do
      post "/api/v1/posts/#{post_record.id}/like", headers: auth_headers(user)
      post "/api/v1/posts/#{post_record.id}/like", headers: auth_headers(user)

      expect(json_response["liked"]).to be(false)
      expect(json_response["likes_count"]).to eq(0)
    end

    it "awards the post author a point and notifies them" do
      expect {
        post "/api/v1/posts/#{post_record.id}/like", headers: auth_headers(user)
      }.to change { post_record.user.reload.idol_points }.by(Pointable::POINT_VALUES[:receive_like])

      expect(Notification.where(action: "liked", recipient: post_record.user).count).to eq(1)
    end

    it "removes the awarded point when the like is toggled off" do
      post "/api/v1/posts/#{post_record.id}/like", headers: auth_headers(user)

      expect {
        post "/api/v1/posts/#{post_record.id}/like", headers: auth_headers(user)
      }.to change { post_record.user.reload.idol_points }.by(-Pointable::POINT_VALUES[:receive_like])
    end

    it "does not award a point for liking your own post" do
      own_post = create(:post, user: user)

      expect {
        post "/api/v1/posts/#{own_post.id}/like", headers: auth_headers(user)
      }.not_to change { user.reload.idol_points }
    end

    it "broadcasts a profile update to the post author" do
      expect {
        post "/api/v1/posts/#{post_record.id}/like", headers: auth_headers(user)
      }.to have_broadcasted_to(post_record.user).from_channel(ProfileChannel)
    end
  end

  describe "DELETE /api/v1/posts/:id/unlike" do
    it "removes an existing like and revokes the point" do
      create(:like, user: user, post: post_record)
      post_record.user.award_points(:receive_like)

      expect {
        delete "/api/v1/posts/#{post_record.id}/unlike", headers: auth_headers(user)
      }.to change { post_record.user.reload.idol_points }.by(-Pointable::POINT_VALUES[:receive_like])

      expect(response).to have_http_status(:ok)
      expect(json_response["liked"]).to be(false)
      expect(json_response["likes_count"]).to eq(0)
      expect(user.likes.where(post: post_record)).to be_empty
    end

    it "is a no-op when the post was not liked" do
      delete "/api/v1/posts/#{post_record.id}/unlike", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(json_response["liked"]).to be(false)
    end

    it "does not drive the author's points negative when none were awarded" do
      create(:like, user: user, post: post_record)

      expect {
        delete "/api/v1/posts/#{post_record.id}/unlike", headers: auth_headers(user)
      }.not_to change { post_record.user.reload.idol_points }

      expect(post_record.user.reload.idol_points).to eq(0)
    end
  end
end
