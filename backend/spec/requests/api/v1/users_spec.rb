require "rails_helper"

RSpec.describe "Api::V1::Users", type: :request do
  let(:user) { create(:user, username: "minji") }

  describe "GET /api/v1/users/:id/comments" do
    it "returns the user's comments newest-first with post context" do
      post = create(:post)
      create(:comment, user: user, post: post, content: "older", created_at: 2.hours.ago)
      create(:comment, user: user, post: post, content: "newer")
      create(:comment, content: "someone else's")

      get "/api/v1/users/#{user.username}/comments", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      contents = json_response["data"].map { |c| c["content"] }
      expect(contents).to eq(["newer", "older"])
      expect(json_response["data"].first.dig("post", "title")).to eq(post.title)
    end

    it "returns 404 for an unknown user" do
      get "/api/v1/users/nobody/comments", headers: auth_headers(user)

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "GET /api/v1/users/my_profile" do
    it "returns the authenticated user's profile with a JWT" do
      get "/api/v1/users/my_profile", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "username")).to eq("minji")
    end

    it "rejects requests without a token" do
      get "/api/v1/users/my_profile"

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/users/:id" do
    it "looks a user up by username" do
      other = create(:user, username: "hanni")

      get "/api/v1/users/#{other.username}", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "username")).to eq("hanni")
    end
  end

  describe "PATCH /api/v1/users/update_profile" do
    it "updates the current user's bio" do
      patch "/api/v1/users/update_profile",
        params: {bio: "new jeans stan"}, headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(user.reload.bio).to eq("new jeans stan")
    end
  end
end
