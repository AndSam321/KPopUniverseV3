require "rails_helper"

RSpec.describe "Search API", type: :request do
  describe "GET /api/v1/search" do
    before do
      group = create(:group, name: "aespa", korean_name: "에스파", group_type: "girl_group")
      create(:member, group: group, stage_name: "Karina")
      create(:user, username: "aespa_stan")
      create(:post, title: "aespa comeback", caption: "so good")
    end

    it "returns grouped previews with counts" do
      get "/api/v1/search", params: {q: "aespa"}

      expect(response).to have_http_status(:ok)
      data = json_response["data"]
      expect(data["groups"].map { |g| g["name"] }).to include("aespa")
      expect(data["users"].map { |u| u["username"] }).to include("aespa_stan")
      expect(data["posts"].map { |p| p["title"] }).to include("aespa comeback")
      expect(json_response["meta"]["counts"]["groups"]).to eq(1)
    end

    it "surfaces members with their group" do
      get "/api/v1/search", params: {q: "karin"}

      member = json_response["data"]["members"].first
      expect(member["stage_name"]).to eq("Karina")
      expect(member["group"]["name"]).to eq("aespa")
    end

    it "returns an empty payload for short queries" do
      get "/api/v1/search", params: {q: "a"}

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to eq("groups" => [], "members" => [], "users" => [], "posts" => [])
    end

    it "paginates a typed search" do
      create_list(:post, 25, title: "aespa spam")

      get "/api/v1/search", params: {q: "aespa", type: "posts"}

      expect(json_response["data"].size).to eq(20)
      expect(json_response["meta"]["total_count"]).to eq(26)
      expect(json_response["meta"]["total_pages"]).to eq(2)
    end

    it "rejects an unknown type" do
      get "/api/v1/search", params: {q: "aespa", type: "bogus"}

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
