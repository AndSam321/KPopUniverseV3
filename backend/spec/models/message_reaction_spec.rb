require "rails_helper"

RSpec.describe MessageReaction do
  it "is valid with an allowed emoji" do
    expect(build(:message_reaction, emoji: "❤️")).to be_valid
  end

  it "rejects an emoji outside the allowed set" do
    expect(build(:message_reaction, emoji: "🙃")).not_to be_valid
  end

  it "rejects a duplicate emoji from the same user on the same message" do
    reaction = create(:message_reaction)
    duplicate = build(:message_reaction, message: reaction.message, user: reaction.user, emoji: reaction.emoji)

    expect(duplicate).not_to be_valid
  end

  it "allows the same user to react with a different emoji" do
    reaction = create(:message_reaction, emoji: "💜")
    other = build(:message_reaction, message: reaction.message, user: reaction.user, emoji: "🔥")

    expect(other).to be_valid
  end
end
