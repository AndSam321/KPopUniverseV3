require "rails_helper"

RSpec.describe "Api::V1::Messages", type: :request do
  let(:alice) { create(:user) }
  let(:bob) { create(:user) }
  let(:conversation) { Conversation.between(alice, bob) }

  describe "GET /api/v1/conversations/:conversation_id/messages" do
    it "returns the thread and marks incoming messages read" do
      MessageCreation.call(conversation:, sender: bob, attributes: {body: "Hello Alice"})

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

    it "sends a GIF with no text" do
      post "/api/v1/conversations/#{conversation.id}/messages",
        params: {image_url: "https://media.giphy.com/x.gif"}, headers: auth_headers(alice)

      expect(response).to have_http_status(:created)
      expect(json_response["data"]["image"]["is_gif"]).to be(true)
    end

    it "sends an uploaded photo" do
      file = fixture_file_upload("test.png", "image/png")

      expect {
        post "/api/v1/conversations/#{conversation.id}/messages",
          params: {image: file}, headers: auth_headers(alice)
      }.to change(conversation.messages, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_response["data"]["image"]["url"]).to be_present
    end

    it "rejects a message with neither text nor image" do
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

  describe "group conversations" do
    let(:carol) { create(:user) }
    let(:group) { create(:group_conversation, creator: alice, members: [bob, carol]) }

    it "lets a member post and another member read" do
      post "/api/v1/conversations/#{group.id}/messages",
        params: {body: "hi all"}, headers: auth_headers(bob)
      expect(response).to have_http_status(:created)

      get "/api/v1/conversations/#{group.id}/messages", headers: auth_headers(carol)
      expect(response).to have_http_status(:ok)
      expect(json_response["data"].last["body"]).to eq("hi all")
    end

    it "tracks unread per member and clears it on read" do
      MessageCreation.call(conversation: group, sender: alice, attributes: {body: "hey"})
      expect(group.unread_count_for(carol)).to eq(1)

      get "/api/v1/conversations/#{group.id}/messages", headers: auth_headers(carol)

      expect(group.reload.unread_count_for(carol)).to eq(0)
    end

    it "blocks a non-member from posting" do
      stranger = create(:user)

      post "/api/v1/conversations/#{group.id}/messages",
        params: {body: "sneak"}, headers: auth_headers(stranger)

      expect(response).to have_http_status(:not_found)
    end
  end
end
