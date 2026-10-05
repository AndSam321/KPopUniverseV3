require "rails_helper"

RSpec.describe "Api::V1::Conversations", type: :request do
  let(:alice) { create(:user) }
  let(:bob) { create(:user) }

  describe "GET /api/v1/conversations" do
    it "requires authentication" do
      get "/api/v1/conversations"

      expect(response).to have_http_status(:unauthorized)
    end

    it "lists the current user's conversations with an unread count" do
      conversation = Conversation.between(alice, bob)
      MessageCreation.call(conversation:, sender: bob, attributes: {body: "Hey Alice"})

      get "/api/v1/conversations", headers: auth_headers(alice)

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].size).to eq(1)
      expect(json_response["data"].first["other_user"]["username"]).to eq(bob.username)
      expect(json_response["data"].first["last_message"]["body"]).to eq("Hey Alice")
      expect(json_response["unread_count"]).to eq(1)
      expect(json_response["pagination"]["current_page"]).to eq(1)
    end

    it "excludes conversations that have no messages yet" do
      Conversation.between(alice, bob)

      get "/api/v1/conversations", headers: auth_headers(alice)

      expect(json_response["data"]).to be_empty
    end
  end

  describe "POST /api/v1/conversations" do
    it "creates a conversation with the recipient" do
      expect {
        post "/api/v1/conversations", params: {recipient_id: bob.id}, headers: auth_headers(alice)
      }.to change(Conversation, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "reuses an existing conversation instead of duplicating" do
      Conversation.between(alice, bob)

      expect {
        post "/api/v1/conversations", params: {recipient_id: bob.id}, headers: auth_headers(alice)
      }.not_to change(Conversation, :count)
    end

    it "rejects messaging yourself" do
      post "/api/v1/conversations", params: {recipient_id: alice.id}, headers: auth_headers(alice)

      expect(response).to have_http_status(422)
    end
  end

  describe "GET /api/v1/conversations/unread_count" do
    it "returns the total unread message count" do
      conversation = Conversation.between(alice, bob)
      MessageCreation.call(conversation:, sender: bob, attributes: {body: "Hi"})

      get "/api/v1/conversations/unread_count", headers: auth_headers(alice)

      expect(json_response["unread_count"]).to eq(1)
    end
  end

  describe "POST /api/v1/conversations/:id/read" do
    it "marks the conversation's incoming messages read" do
      conversation = Conversation.between(alice, bob)
      MessageCreation.call(conversation:, sender: bob, attributes: {body: "Hi"})

      post "/api/v1/conversations/#{conversation.id}/read", headers: auth_headers(alice)

      expect(response).to have_http_status(:ok)
      expect(json_response["unread_count"]).to eq(0)
    end

    it "returns 404 for a non-participant" do
      conversation = Conversation.between(alice, bob)
      intruder = create(:user)

      post "/api/v1/conversations/#{conversation.id}/read", headers: auth_headers(intruder)

      expect(response).to have_http_status(:not_found)
    end
  end
end
