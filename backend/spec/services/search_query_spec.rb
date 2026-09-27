require "rails_helper"

RSpec.describe SearchQuery do
  describe "#valid?" do
    it "is false for terms shorter than the minimum" do
      expect(described_class.new("a").valid?).to be(false)
      expect(described_class.new("  ").valid?).to be(false)
    end

    it "is true for terms at or above the minimum" do
      expect(described_class.new("ab").valid?).to be(true)
    end
  end

  describe "#groups" do
    it "returns nothing for an invalid term" do
      create(:group, name: "aespa")
      expect(described_class.new("a").groups).to be_empty
    end

    it "matches by substring" do
      match = create(:group, name: "aespa")
      create(:group, name: "BTS")

      expect(described_class.new("aes").groups).to contain_exactly(match)
    end

    it "matches Korean names" do
      match = create(:group, name: "NewJeans", korean_name: "뉴진스")

      expect(described_class.new("뉴진").groups).to contain_exactly(match)
    end

    it "ranks prefix matches ahead of interior matches" do
      interior = create(:group, name: "Superstar")
      prefix = create(:group, name: "Star Kids")

      expect(described_class.new("star").groups.to_a).to eq([prefix, interior])
    end

    it "tolerates typos via trigram similarity" do
      match = create(:group, name: "NewJeans")

      expect(described_class.new("newjeens").groups).to contain_exactly(match)
    end

    it "treats wildcard characters literally" do
      create(:group, name: "aXc")

      expect(described_class.new("a_c").groups).to be_empty
    end
  end

  describe "#members" do
    it "matches stage names and eager-loads the group" do
      group = create(:group, name: "aespa")
      karina = create(:member, group: group, stage_name: "Karina")
      create(:member, stage_name: "Wonyoung")

      expect(described_class.new("karin").members).to contain_exactly(karina)
    end
  end

  describe "#users" do
    it "matches usernames" do
      match = create(:user, username: "kpop_fan_1")
      create(:user, username: "someone_else")

      expect(described_class.new("kpop").users).to contain_exactly(match)
    end
  end

  describe "#posts" do
    it "matches titles and captions" do
      by_title = create(:post, title: "TWICE concert", caption: "nothing")
      by_caption = create(:post, title: "nothing", caption: "loved the TWICE show")
      create(:post, title: "unrelated", caption: "unrelated")

      expect(described_class.new("twice").posts).to contain_exactly(by_title, by_caption)
    end
  end
end
