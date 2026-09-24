require "rails_helper"

RSpec.describe Member, type: :model do
  it { is_expected.to belong_to(:group) }

  it "requires a stage name" do
    expect(build(:member, stage_name: nil)).not_to be_valid
  end

  describe ".ordered" do
    it "orders by sort_order then id" do
      group = create(:group)
      second = create(:member, group: group, stage_name: "B", sort_order: 1)
      first = create(:member, group: group, stage_name: "A", sort_order: 0)

      expect(group.members.ordered).to eq([first, second])
    end
  end
end
