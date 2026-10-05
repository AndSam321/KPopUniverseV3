require "rails_helper"

RSpec.describe GroupConversationCreation do
  def befriend(user_a, user_b)
    Follow.create!(follower: user_a, followed: user_b)
    Follow.create!(follower: user_b, followed: user_a)
  end

  let(:creator) { create(:user) }
  let(:friend_one) { create(:user) }
  let(:friend_two) { create(:user) }

  before do
    befriend(creator, friend_one)
    befriend(creator, friend_two)
  end

  it "creates a group with the creator and friends as participants" do
    conversation = described_class.call(creator:, member_ids: [friend_one.id, friend_two.id], name: "Squad")

    expect(conversation.group).to be(true)
    expect(conversation.name).to eq("Squad")
    expect(conversation.participants).to contain_exactly(creator, friend_one, friend_two)
  end

  it "raises when a member is not a friend" do
    stranger = create(:user)

    expect {
      described_class.call(creator:, member_ids: [friend_one.id, stranger.id])
    }.to raise_error(described_class::NotFriends)
  end

  it "raises when fewer than two members are given" do
    expect {
      described_class.call(creator:, member_ids: [friend_one.id])
    }.to raise_error(described_class::NotFriends)
  end

  it "rejects a one-directional follow (not mutual)" do
    follower_only = create(:user)
    Follow.create!(follower: follower_only, followed: creator) # creator does not follow back

    expect {
      described_class.call(creator:, member_ids: [friend_one.id, follower_only.id])
    }.to raise_error(described_class::NotFriends)
  end
end
