require "rails_helper"

RSpec.describe ComebackScheduleScraper do
  let(:sample_html) do
    <<~HTML
      <html><body>
      <script type="application/ld+json">
      {"@type":"ItemList","itemListElement":[
        {"@type":"ListItem","item":{"@type":"MusicAlbum","name":"Strategy",
         "byArtist":{"@type":"MusicGroup","name":"TWICE"},
         "datePublished":"2026-11-15",
         "albumReleaseType":"https://schema.org/SingleRelease",
         "track":{"@type":"MusicRecording","name":"Strategy"}}}
      ]}
      </script>
      </body></html>
    HTML
  end

  before do
    stub_request(:get, %r{kpopcomebacks\.com/calendar/}).to_return(status: 200, body: sample_html)
  end

  it "creates comebacks from the parsed JSON-LD" do
    expect { described_class.call }.to change(Comeback, :count).by(1)

    comeback = Comeback.find_by(title: "Strategy")
    expect(comeback.artist_name).to eq("TWICE")
    expect(comeback.release_type).to eq("Single")
    expect(comeback.title_track).to eq("Strategy")
    expect(comeback.comeback_date.to_s).to eq("2026-11-15")
  end

  it "links a comeback to a group whose name matches the artist" do
    group = create(:group, name: "TWICE")

    described_class.call

    expect(Comeback.find_by(title: "Strategy").group).to eq(group)
  end

  it "is idempotent across runs" do
    described_class.call

    expect { described_class.call }.not_to change(Comeback, :count)
  end

  it "skips a month that fails to fetch without raising" do
    stub_request(:get, %r{kpopcomebacks\.com/calendar/}).to_return(status: 500, body: "")

    expect { described_class.call }.not_to change(Comeback, :count)
  end
end
