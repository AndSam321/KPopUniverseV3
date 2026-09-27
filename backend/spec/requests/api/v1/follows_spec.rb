require "rails_helper"

RSpec.describe "Follows API", type: :request do
  let(:follower) { create(:user) }
  let(:target) { create(:user) }

  describe "POST /api/v1/users/:id/follow" do
    it "follows the user and notifies them" do
      expect {
        post "/api/v1/users/#{target.username}/follow", headers: auth_headers(follower)
      }.to change { Notification.where(action: "followed", recipient: target).count }.by(1)

      expect(response).to have_http_status(:ok)
      expect(json_response["is_following"]).to be(true)
    end

    it "does not notify again when already following" do
      post "/api/v1/users/#{target.username}/follow", headers: auth_headers(follower)

      expect {
        post "/api/v1/users/#{target.username}/follow", headers: auth_headers(follower)
      }.not_to change(Notification, :count)
    end
  end
end
