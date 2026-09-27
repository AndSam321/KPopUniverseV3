require "rails_helper"

RSpec.describe "Posts API", type: :request do
  let(:user) { create(:user) }
  let(:post_record) { create(:post) }

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
  end

  describe "DELETE /api/v1/posts/:id/unlike" do
    it "removes an existing like" do
      create(:like, user: user, post: post_record)

      delete "/api/v1/posts/#{post_record.id}/unlike", headers: auth_headers(user)

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
  end
end
