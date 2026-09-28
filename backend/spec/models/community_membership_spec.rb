require "rails_helper"

RSpec.describe CommunityMembership, type: :model do
  it "is unique per user and community" do
    membership = create(:community_membership)
    duplicate = build(:community_membership, user: membership.user, community: membership.community)

    expect(duplicate).not_to be_valid
  end

  it "decrements the member count when destroyed" do
    membership = create(:community_membership)
    community = membership.community

    expect { membership.destroy }.to change { community.reload.member_count }.by(-1)
  end
end
