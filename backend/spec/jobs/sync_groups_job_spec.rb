require "rails_helper"

RSpec.describe SyncGroupsJob do
  include ActiveJob::TestHelper

  let(:json) { {"Content-Type" => "application/json"} }

  around do |example|
    original = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    example.run
    ActiveJob::Base.queue_adapter = original
  end

  before do
    ENV["SPOTIFY_CLIENT_ID"] = "test_id"
    ENV["SPOTIFY_CLIENT_SECRET"] = "test_secret"
    Rails.cache.clear
    stub_request(:post, SpotifyClient::TOKEN_URL)
      .to_return(status: 200, body: {access_token: "tok", expires_in: 3600}.to_json, headers: json)
    # Echo a distinct artist id per search so each group resolves uniquely.
    stub_request(:get, %r{/v1/search}).to_return do |req|
      q = CGI.parse(URI(req.uri).query)["q"].first
      {status: 200, body: {artists: {items: [{id: "artist-#{q}", name: q, images: []}]}}.to_json, headers: json}
    end
    stub_request(:get, %r{/v1/artists/[^/]+/albums})
      .to_return(status: 200, body: {items: []}.to_json, headers: json)
  end

  it "syncs every group" do
    %w[Alpha Bravo Charlie].each { |n| create(:group, name: n) }

    perform_enqueued_jobs { described_class.perform_later }

    expect(Group.where(sync_status: "ok").count).to eq(3)
  end

  it "records a persistent failure for one group without aborting the rest" do
    bad = create(:group, name: "Bad")
    good = create(:group, name: "Good")
    allow_any_instance_of(GroupSpotifySync).to receive(:call).and_wrap_original do |original, group|
      raise "boom" if group.id == bad.id

      original.call(group)
    end

    perform_enqueued_jobs { described_class.perform_later }

    expect(bad.reload.sync_status).to eq("error")
    expect(bad.sync_error).to include("boom")
    expect(good.reload.sync_status).to eq("ok")
  end
end
