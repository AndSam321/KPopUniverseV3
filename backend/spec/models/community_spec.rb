require "rails_helper"

RSpec.describe Community, type: :model do
  it "generates a slug from the name" do
    community = create(:community, name: "TWICE Theories")

    expect(community.slug).to eq("twice-theories")
  end

  it "disambiguates a slug that is already taken" do
    create(:community, name: "Memes")
    second = create(:community, name: "Memes")

    expect(second.slug).to eq("memes-2")
  end

  it "counts members through a counter cache" do
    community = create(:community)

    expect { create(:community_membership, community: community) }
      .to change { community.reload.member_count }.by(1)
  end
end
