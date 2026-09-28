require "rails_helper"

RSpec.describe BadgeAwarder do
  describe "#sync_title_badge" do
    it "awards a badge matching the user's current title" do
      user = create(:user, title: "Idol", idol_points: 600)

      expect { described_class.new(user).sync_title_badge }
        .to change { user.reload.badges.size }.by(1)
      expect(user.badges.last).to include("name" => "Idol")
    end

    it "does not award a badge for Trainee" do
      user = create(:user, title: "Trainee")

      expect { described_class.new(user).sync_title_badge }
        .not_to change { user.reload.badges.size }
    end

    it "does not duplicate a badge already earned" do
      user = create(:user, title: "Rising Star")
      described_class.new(user).sync_title_badge

      expect { described_class.new(user).sync_title_badge }
        .not_to change { user.reload.badges.size }
    end
  end

  describe "#check_fandom_badges" do
    let(:user) { create(:user) }
    let(:group) { create(:group, fandom_name: "ONCE") }

    def contribute(count, to:)
      count.times { create(:post, user: user).groups << to }
    end

    it "awards the fandom badge once activity crosses the threshold" do
      contribute(BadgeAwarder::FANDOM_THRESHOLD, to: group)

      expect { described_class.new(user).check_fandom_badges([group]) }
        .to change { user.reload.badges.size }.by(1)
      expect(user.badges.last).to include("name" => "ONCE", "group_id" => group.id)
    end

    it "does not award before the threshold" do
      contribute(BadgeAwarder::FANDOM_THRESHOLD - 1, to: group)

      expect { described_class.new(user).check_fandom_badges([group]) }
        .not_to change { user.reload.badges.size }
    end

    it "skips groups without a fandom name" do
      plain = create(:group, fandom_name: nil)
      contribute(BadgeAwarder::FANDOM_THRESHOLD, to: plain)

      expect { described_class.new(user).check_fandom_badges([plain]) }
        .not_to change { user.reload.badges.size }
    end
  end
end
