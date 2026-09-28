require "rails_helper"

RSpec.describe "Notifications API", type: :request do
  let(:user) { create(:user) }
  let(:actor) { create(:user) }
  let(:post_record) { create(:post, user: user) }
  let(:like) { create(:like, post: post_record, user: actor) }

  def make_notification(action: "liked", read: false)
    Notification.create!(
      recipient: user,
      actor: actor,
      notifiable: like,
      action: action,
      read_at: read ? Time.current : nil
    )
  end

  describe "GET /api/v1/notifications" do
    it "reports the accurate unread count" do
      make_notification
      make_notification
      make_notification(read: true)

      get "/api/v1/notifications", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(json_response["unread_count"]).to eq(2)
    end

    it "returns only unread notifications when filtered" do
      make_notification
      make_notification(read: true)

      get "/api/v1/notifications?unread=true", headers: auth_headers(user)

      expect(json_response["data"].size).to eq(1)
      expect(json_response["unread_count"]).to eq(1)
    end
  end

  describe "GET /api/v1/notifications/unread_count" do
    it "returns the number of unread notifications" do
      make_notification
      make_notification

      get "/api/v1/notifications/unread_count", headers: auth_headers(user)

      expect(json_response["unread_count"]).to eq(2)
    end
  end

  describe "POST /api/v1/notifications/mark_all_read" do
    it "marks every notification read and zeroes the unread count" do
      make_notification
      make_notification

      post "/api/v1/notifications/mark_all_read", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(user.notifications.unread.count).to eq(0)
    end
  end

  describe "PATCH /api/v1/notifications/:id/mark_read" do
    it "marks a single notification read" do
      unread = make_notification
      make_notification

      patch "/api/v1/notifications/#{unread.id}/mark_read", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(unread.reload.read_at).to be_present
      expect(user.notifications.unread.count).to eq(1)
    end
  end
end
