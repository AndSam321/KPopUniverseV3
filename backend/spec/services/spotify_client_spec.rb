require "rails_helper"

RSpec.describe SpotifyClient do
  subject(:client) { described_class.new }

  let(:json) { {"Content-Type" => "application/json"} }

  before do
    ENV["SPOTIFY_CLIENT_ID"] = "test_id"
    ENV["SPOTIFY_CLIENT_SECRET"] = "test_secret"
    Rails.cache.clear
    stub_request(:post, SpotifyClient::TOKEN_URL)
      .to_return(status: 200, body: {access_token: "tok", expires_in: 3600}.to_json, headers: json)
  end

  describe "#search_artist" do
    it "returns the first artist match" do
      stub_request(:get, %r{/v1/search})
        .to_return(status: 200, body: {artists: {items: [{id: "abc", name: "NewJeans"}]}}.to_json, headers: json)

      expect(client.search_artist("NewJeans")["id"]).to eq("abc")
    end
  end

  describe "#artist_albums" do
    it "returns the album items" do
      stub_request(:get, %r{/v1/artists/abc/albums})
        .to_return(status: 200, body: {items: [{id: "al1", name: "Get Up"}]}.to_json, headers: json)

      expect(client.artist_albums("abc").first["name"]).to eq("Get Up")
    end
  end

  describe "error handling" do
    it "raises on a non-success response" do
      stub_request(:get, %r{/v1/artists/abc$}).to_return(status: 401, body: "nope")

      expect { client.artist("abc") }.to raise_error(SpotifyClient::Error, /401/)
    end
  end

  describe "rate limiting" do
    it "retries after a 429 and then succeeds" do
      allow_any_instance_of(described_class).to receive(:sleep)
      stub_request(:get, %r{/v1/artists/abc$})
        .to_return(
          {status: 429, headers: {"Retry-After" => "0"}},
          {status: 200, body: {id: "abc"}.to_json, headers: json}
        )

      expect(client.artist("abc")["id"]).to eq("abc")
    end
  end

  describe "token caching" do
    it "fetches the token only once across calls" do
      allow(Rails).to receive(:cache).and_return(ActiveSupport::Cache::MemoryStore.new)
      stub_request(:get, %r{/v1/search})
        .to_return(status: 200, body: {artists: {items: []}}.to_json, headers: json)

      client.search_artist("a")
      client.search_artist("b")

      expect(a_request(:post, SpotifyClient::TOKEN_URL)).to have_been_made.once
    end
  end
end
