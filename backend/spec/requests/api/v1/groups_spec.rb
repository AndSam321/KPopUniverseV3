require "rails_helper"

RSpec.describe "Groups API", type: :request do
  describe "GET /api/v1/groups/:id" do
    let(:group) do
      create(:group,
        name: "NewJeans",
        korean_name: "뉴진스",
        company: "ADOR",
        group_type: "girl_group",
        fandom_name: "Bunnies")
    end

    before do
      create(:member, group: group, stage_name: "Hanni", sort_order: 1)
      create(:member, group: group, stage_name: "Minji", sort_order: 0)
      create(:album, group: group, title: "Get Up", release_date: "2023-07-21")
      create(:album, group: group, title: "New Jeans", release_date: "2022-08-01")
    end

    it "returns the enriched group with ordered members and newest-first albums" do
      get "/api/v1/groups/#{group.id}"

      expect(response).to have_http_status(:ok)
      data = json_response["data"]["group"]
      expect(data["company"]).to eq("ADOR")
      expect(data["fandom_name"]).to eq("Bunnies")
      expect(data["members"].map { |m| m["stage_name"] }).to eq(%w[Minji Hanni])
      expect(data["albums"].map { |a| a["title"] }).to eq(["Get Up", "New Jeans"])
    end
  end
end
