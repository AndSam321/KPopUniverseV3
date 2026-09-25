require "rails_helper"

RSpec.describe GroupMemberSync do
  let(:client) { instance_double(WikidataClient) }
  let(:group) { create(:group, name: "NewJeans") }

  it "creates members from Wikidata for a group with none" do
    allow(client).to receive(:find_entity_id).with("NewJeans").and_return("Q123")
    allow(client).to receive(:group_members).with("Q123").and_return([
      {stage_name: "Minji", birth_date: Date.new(2004, 5, 7), photo_url: "https://img/minji.jpg?width=400"},
      {stage_name: "Hanni", birth_date: Date.new(2004, 10, 6), photo_url: nil}
    ])

    expect(described_class.new(client).call(group)).to be(true)
    expect(group.members.ordered.map(&:stage_name)).to eq(%w[Minji Hanni])
    expect(group.members.find_by(stage_name: "Minji").birth_date).to eq(Date.new(2004, 5, 7))
    expect(group.members.find_by(stage_name: "Minji").photo_url).to eq("https://img/minji.jpg?width=400")
  end

  it "skips groups with a curated roster (members that carry a position)" do
    create(:member, group: group, stage_name: "Curated", position: "Leader")
    allow(client).to receive(:find_entity_id)

    expect(described_class.new(client).call(group)).to be(false)
    expect(client).not_to have_received(:find_entity_id)
    expect(group.members.pluck(:stage_name)).to eq(["Curated"])
  end

  it "returns false when the group cannot be resolved" do
    allow(client).to receive(:find_entity_id).and_return(nil)

    expect(described_class.new(client).call(group)).to be(false)
    expect(group.members).to be_empty
  end
end
