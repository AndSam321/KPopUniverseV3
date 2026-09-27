require "rails_helper"

RSpec.describe FandomImage do
  describe ".thumbnail" do
    it "inserts a scale segment into a fandom url" do
      url = "https://static.wikia.nocookie.net/kpop/images/0/05/x.webp/revision/latest?cb=1"

      expect(described_class.thumbnail(url, width: 300)).to eq(
        "https://static.wikia.nocookie.net/kpop/images/0/05/x.webp/revision/latest/scale-to-width-down/300?cb=1"
      )
    end

    it "leaves non-fandom urls untouched" do
      url = "https://i.scdn.co/image/abc123"

      expect(described_class.thumbnail(url, width: 300)).to eq(url)
    end

    it "does not double-scale an already scaled url" do
      url = "https://static.wikia.nocookie.net/kpop/images/0/05/x.webp/revision/latest/scale-to-width-down/300?cb=1"

      expect(described_class.thumbnail(url, width: 300)).to eq(url)
    end

    it "returns nil unchanged" do
      expect(described_class.thumbnail(nil, width: 300)).to be_nil
    end
  end
end
