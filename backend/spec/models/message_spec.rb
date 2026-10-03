require "rails_helper"

RSpec.describe Message do
  it "requires a body" do
    expect(build(:message, body: nil)).not_to be_valid
  end

  it "rejects a body over 5000 characters" do
    expect(build(:message, body: "a" * 5001)).not_to be_valid
  end

  it "rejects a sender who is not a participant" do
    conversation = create(:conversation)
    outsider = create(:user)

    expect(build(:message, conversation:, sender: outsider)).not_to be_valid
  end

  describe "#recipient" do
    it "is the participant who did not send the message" do
      conversation = create(:conversation)
      message = create(:message, conversation:, sender: conversation.user_one)

      expect(message.recipient).to eq(conversation.user_two)
    end
  end

  describe "scopes" do
    it "orders chronologically and filters unread" do
      conversation = create(:conversation)
      older = create(:message, conversation:, created_at: 1.hour.ago, read_at: Time.current)
      newer = create(:message, conversation:, created_at: Time.current, read_at: nil)

      expect(conversation.messages.chronological).to eq([older, newer])
      expect(conversation.messages.unread).to eq([newer])
    end
  end
end
