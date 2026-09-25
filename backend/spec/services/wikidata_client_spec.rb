require "rails_helper"

RSpec.describe WikidataClient do
  subject(:client) { described_class.new }

  let(:json) { {"Content-Type" => "application/json"} }

  describe "#find_entity_id" do
    it "returns the first search result's id" do
      stub_request(:get, %r{wikidata\.org/w/api\.php})
        .to_return(status: 200, body: {search: [{id: "Q123"}]}.to_json, headers: json)

      expect(client.find_entity_id("NewJeans")).to eq("Q123")
    end
  end

  describe "#group_members" do
    it "maps member labels and birth dates, cleaning disambiguation suffixes" do
      body = {
        results: {
          bindings: [
            {memberLabel: {value: "Minji"}, dob: {value: "2004-05-07T00:00:00Z"},
             image: {value: "http://commons.wikimedia.org/wiki/Special:FilePath/Minji.jpg"}},
            {memberLabel: {value: "Hanni (singer)"}, dob: {value: "2004-10-06T00:00:00Z"}}
          ]
        }
      }
      stub_request(:get, %r{query\.wikidata\.org/sparql})
        .to_return(status: 200, body: body.to_json, headers: json)

      members = client.group_members("Q123")

      expect(members.map { |m| m[:stage_name] }).to eq(%w[Minji Hanni])
      expect(members.first[:birth_date]).to eq(Date.new(2004, 5, 7))
      expect(members.first[:photo_url]).to eq("https://commons.wikimedia.org/wiki/Special:FilePath/Minji.jpg?width=400")
      expect(members.last[:photo_url]).to be_nil
    end

    it "drops rows whose label is an unresolved Q-id" do
      body = {results: {bindings: [{memberLabel: {value: "Q999"}}]}}
      stub_request(:get, %r{query\.wikidata\.org/sparql})
        .to_return(status: 200, body: body.to_json, headers: json)

      expect(client.group_members("Q123")).to be_empty
    end
  end
end
