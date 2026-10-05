require "rails_helper"

RSpec.describe Conversation do
  describe ".between" do
    it "creates one conversation for a pair regardless of argument order" do
      alice = create(:user)
      bob = create(:user)

      first = described_class.between(alice, bob)
      second = described_class.between(bob, alice)

      expect(second).to eq(first)
      expect(described_class.count).to eq(1)
    end

    it "normalizes participants so the lower id is user_one" do
      alice = create(:user)
      bob = create(:user)

      conversation = described_class.between(bob, alice)

      expect(conversation.user_one_id).to eq([alice.id, bob.id].min)
      expect(conversation.user_two_id).to eq([alice.id, bob.id].max)
    end
  end

  describe "#other_participant" do
    it "returns the participant who is not the given user" do
      conversation = create(:conversation)

      expect(conversation.other_participant(conversation.user_one)).to eq(conversation.user_two)
      expect(conversation.other_participant(conversation.user_two)).to eq(conversation.user_one)
    end
  end

  describe "#unread_count_for" do
    it "counts messages from others after the reader's last_read_at" do
      conversation = create(:conversation)
      reader = conversation.user_one
      writer = conversation.user_two
      create(:message, conversation:, sender: writer, created_at: 1.hour.ago)
      conversation.mark_read_for(reader)
      create(:message, conversation:, sender: writer, created_at: 1.hour.from_now)
      create(:message, conversation:, sender: reader, created_at: 2.hours.from_now)

      expect(conversation.unread_count_for(reader)).to eq(1)
    end
  end

  describe "#title_for" do
    it "uses the group name for a group conversation" do
      group = create(:group_conversation, name: "Stans")

      expect(group.title_for(group.creator)).to eq("Stans")
    end
  end

  it "is invalid when both participants are the same user" do
    user = create(:user)

    conversation = described_class.new(user_one: user, user_two: user)

    expect(conversation).not_to be_valid
  end
end
