require "rails_helper"

RSpec.describe MessageCreation do
  let(:conversation) { create(:conversation) }
  let(:sender) { conversation.user_one }

  it "creates a message in the conversation" do
    expect {
      described_class.call(conversation:, sender:, body: "Hello")
    }.to change(conversation.messages, :count).by(1)
  end

  it "advances the conversation's last_message_at" do
    conversation.update!(last_message_at: 1.day.ago)

    message = described_class.call(conversation:, sender:, body: "Hi")

    expect(conversation.reload.last_message_at).to be_within(1.second).of(message.created_at)
  end

  it "broadcasts to the recipient's inbox" do
    expect {
      described_class.call(conversation:, sender:, body: "Hi")
    }.to have_broadcasted_to(conversation.user_two).from_channel(InboxChannel)
  end
end
