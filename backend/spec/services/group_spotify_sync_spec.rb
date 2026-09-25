require "rails_helper"

RSpec.describe GroupSpotifySync do
  let(:group) { create(:group, name: "NewJeans") }
  let(:json) { {"Content-Type" => "application/json"} }

  before do
    ENV["SPOTIFY_CLIENT_ID"] = "test_id"
    ENV["SPOTIFY_CLIENT_SECRET"] = "test_secret"
    Rails.cache.clear
    stub_request(:post, SpotifyClient::TOKEN_URL)
      .to_return(status: 200, body: {access_token: "tok", expires_in: 3600}.to_json, headers: json)
    stub_request(:get, %r{/v1/search})
      .to_return(status: 200, body: {
        artists: {items: [{id: "artist1", name: "NewJeans", images: [{url: "https://img/artist.jpg"}]}]}
      }.to_json, headers: json)
    stub_request(:get, %r{/v1/artists/artist1/albums})
      .to_return(status: 200, body: {
        items: [{
          id: "al1",
          name: "Get Up",
          album_type: "single",
          release_date: "2023-07-21",
          release_date_precision: "day",
          images: [{url: "https://img/getup.jpg"}],
          external_urls: {spotify: "https://open.spotify.com/album/al1"}
        }]
      }.to_json, headers: json)
  end

  it "sets the group's spotify id, image, and sync status" do
    described_class.new.call(group)
    group.reload

    expect(group.spotify_id).to eq("artist1")
    expect(group.logo_url).to eq("https://img/artist.jpg")
    expect(group.sync_status).to eq("ok")
    expect(group.last_synced_at).to be_present
  end

  it "upserts albums from the discography" do
    expect { described_class.new.call(group) }.to change { group.albums.count }.by(1)

    album = group.albums.find_by(spotify_id: "al1")
    expect(album.title).to eq("Get Up")
    expect(album.release_date).to eq(Date.new(2023, 7, 21))
    expect(album.cover_url).to eq("https://img/getup.jpg")
  end

  it "adopts an existing seeded album by title instead of duplicating" do
    group.albums.create!(title: "Get Up", album_type: "ep")

    expect { described_class.new.call(group) }.not_to change { group.albums.count }
    expect(group.albums.find_by(title: "Get Up").spotify_id).to eq("al1")
  end
end
