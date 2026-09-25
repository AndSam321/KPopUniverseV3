require "rails_helper"

RSpec.describe SyncGroupDataJob do
  let(:group) { create(:group, name: "NewJeans") }
  let(:json) { {"Content-Type" => "application/json"} }

  before do
    ENV["SPOTIFY_CLIENT_ID"] = "test_id"
    ENV["SPOTIFY_CLIENT_SECRET"] = "test_secret"
    Rails.cache.clear
    stub_request(:post, SpotifyClient::TOKEN_URL)
      .to_return(status: 200, body: {access_token: "tok", expires_in: 3600}.to_json, headers: json)
  end

  it "marks the group synced on success" do
    stub_request(:get, %r{/v1/search})
      .to_return(status: 200, body: {artists: {items: [{id: "a1", name: "NewJeans", images: []}]}}.to_json, headers: json)
    stub_request(:get, %r{/v1/artists/a1/albums})
      .to_return(status: 200, body: {items: []}.to_json, headers: json)

    described_class.perform_now(group.id)

    expect(group.reload.sync_status).to eq("ok")
  end

  it "records an error status when Spotify fails" do
    stub_request(:get, %r{/v1/search}).to_return(status: 500, body: "boom")

    described_class.perform_now(group.id)
    group.reload

    expect(group.sync_status).to eq("error")
    expect(group.sync_error).to be_present
  end
end
