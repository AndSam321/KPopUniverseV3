require "rails_helper"

RSpec.describe "Api::V1::Reactions", type: :request do
  let(:alice) { create(:user) }
  let(:bob) { create(:user) }
  let(:conversation) { Conversation.between(alice, bob) }
  let(:message) { MessageCreation.call(conversation:, sender: bob, attributes: {body: "Hello Alice"}) }

  def post_reaction(emoji, user: alice)
    post "/api/v1/conversations/#{conversation.id}/messages/#{message.id}/reactions",
      params: {emoji: emoji}, headers: auth_headers(user)
  end

  describe "POST .../reactions" do
    it "adds a reaction and returns the grouped summary" do
      expect { post_reaction("💜") }.to change(message.message_reactions, :count).by(1)

      expect(response).to have_http_status(:ok)
      reactions = json_response["data"]["reactions"]
      expect(reactions).to contain_exactly("emoji" => "💜", "count" => 1, "user_ids" => [alice.id])
    end

    it "removes the reaction when the same emoji is sent again (toggle)" do
      post_reaction("💜")
      expect { post_reaction("💜") }.to change(message.message_reactions, :count).by(-1)

      expect(json_response["data"]["reactions"]).to be_empty
    end

    it "counts the same emoji from two users" do
      post_reaction("🔥", user: bob)
      post_reaction("🔥", user: alice)

      reaction = json_response["data"]["reactions"].first
      expect(reaction["count"]).to eq(2)
      expect(reaction["user_ids"]).to contain_exactly(alice.id, bob.id)
    end

    it "rejects an emoji outside the allowed set" do
      post_reaction("🙃")

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 404 for a non-participant" do
      post_reaction("💜", user: create(:user))

      expect(response).to have_http_status(:not_found)
    end
  end
end
