require "rails_helper"

RSpec.describe ConversationParticipant do
  it "is unique per user within a conversation" do
    conversation = create(:conversation)
    existing = conversation.conversation_participants.first

    duplicate = ConversationParticipant.new(conversation:, user: existing.user)

    expect(duplicate).not_to be_valid
  end
end
