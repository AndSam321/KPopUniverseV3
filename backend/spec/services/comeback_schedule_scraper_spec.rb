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
         "track":{"@type":"MusicRecording","name":"Strategy"}}},
        {"@type":"ListItem","item":{"@type":"MusicAlbum","name":"Welcome to Heaven",
         "byArtist":{"@type":"MusicGroup","name":"tripleS"},
         "datePublished":"2026-11-20",
         "albumReleaseType":"https://schema.org/SingleRelease",
         "track":{"@type":"MusicRecording","name":"Welcome to Heaven"}}}
      ]}
      </script>
      <article class="cb-card" data-comeback-card data-region="KR" data-type-group="single">
        <div class="artist">TWICE</div><div class="release">Strategy</div>
      </article>
      <article class="cb-card" data-comeback-card data-region="JP" data-type-group="single">
        <div class="artist">tripleS</div><div class="release">Welcome to Heaven</div>
      </article>
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

  it "excludes releases outside the Korean market" do
    described_class.call

    expect(Comeback.find_by(artist_name: "tripleS")).to be_nil
  end

  it "removes a previously stored non-Korean release on the next run" do
    stale = create(:comeback, artist_name: "tripleS", title: "Welcome to Heaven", comeback_date: "2026-11-20")

    described_class.call

    expect(Comeback.exists?(stale.id)).to be(false)
  end

  context "when a release has no matching region article" do
    let(:sample_html) do
      <<~HTML
        <html><body>
        <script type="application/ld+json">
        {"@type":"ItemList","itemListElement":[
          {"@type":"ListItem","item":{"@type":"MusicAlbum","name":"Strategy",
           "byArtist":{"@type":"MusicGroup","name":"TWICE"},
           "datePublished":"2026-11-15",
           "albumReleaseType":"https://schema.org/SingleRelease"}}
        ]}
        </script>
        </body></html>
      HTML
    end

    it "keeps it (fails open rather than dropping)" do
      expect { described_class.call }.to change(Comeback, :count).by(1)
      expect(Comeback.find_by(title: "Strategy")).to be_present
    end
  end

  context "when the article title is HTML-entity encoded" do
    let(:sample_html) do
      <<~HTML
        <html><body>
        <script type="application/ld+json">
        {"@type":"ItemList","itemListElement":[
          {"@type":"ListItem","item":{"@type":"MusicAlbum","name":"Lost&Found",
           "byArtist":{"@type":"MusicGroup","name":"HYOJUNG"},
           "datePublished":"2026-11-18",
           "albumReleaseType":"https://schema.org/EPRelease"}}
        ]}
        </script>
        <article class="cb-card" data-region="KR">
          <div class="artist">HYOJUNG</div><div class="release">Lost&amp;Found</div>
        </article>
        </body></html>
      HTML
    end

    it "matches the region despite the encoding and keeps the Korean release" do
      expect { described_class.call }.to change(Comeback, :count).by(1)
      expect(Comeback.find_by(title: "Lost&Found")).to be_present
    end
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
