require "rails_helper"

RSpec.describe "Api::V1::Messages", type: :request do
  let(:alice) { create(:user) }
  let(:bob) { create(:user) }
  let(:conversation) { Conversation.between(alice, bob) }

  describe "GET /api/v1/conversations/:conversation_id/messages" do
    it "returns the thread and marks incoming messages read" do
      MessageCreation.call(conversation:, sender: bob, body: "Hello Alice")

      get "/api/v1/conversations/#{conversation.id}/messages", headers: auth_headers(alice)

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].size).to eq(1)
      expect(conversation.reload.unread_count_for(alice)).to eq(0)
    end

    it "returns 404 for a non-participant" do
      intruder = create(:user)

      get "/api/v1/conversations/#{conversation.id}/messages", headers: auth_headers(intruder)

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/conversations/:conversation_id/messages" do
    it "creates a message" do
      expect {
        post "/api/v1/conversations/#{conversation.id}/messages",
          params: {body: "Hi Bob"}, headers: auth_headers(alice)
      }.to change(conversation.messages, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "rejects a blank body" do
      post "/api/v1/conversations/#{conversation.id}/messages",
        params: {body: ""}, headers: auth_headers(alice)

      expect(response).to have_http_status(422)
    end

    it "returns 404 when a non-participant tries to post" do
      intruder = create(:user)

      post "/api/v1/conversations/#{conversation.id}/messages",
        params: {body: "sneaky"}, headers: auth_headers(intruder)

      expect(response).to have_http_status(:not_found)
    end
  end
end
