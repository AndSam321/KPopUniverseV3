require "rails_helper"

RSpec.describe Album, type: :model do
  it { is_expected.to belong_to(:group) }

  it "requires a title" do
    expect(build(:album, title: nil)).not_to be_valid
  end

  describe ".newest_first" do
    it "orders by release_date descending with nulls last" do
      group = create(:group)
      older = create(:album, group: group, release_date: "2020-01-01")
      newer = create(:album, group: group, release_date: "2024-01-01")
      undated = create(:album, group: group, release_date: nil)

      expect(group.albums.newest_first).to eq([newer, older, undated])
    end
  end
end
