require "rails_helper"

RSpec.describe "Comebacks API", type: :request do
  let(:user) { create(:user) }

  it "returns releases newest first with their group" do
    group = create(:group, group_type: "girl_group")
    create(:album, group: group, title: "Older", release_date: "2024-01-01")
    create(:album, group: group, title: "Newer", release_date: "2025-01-01")

    get "/api/v1/comebacks", headers: auth_headers(user)

    expect(response).to have_http_status(:ok)
    titles = json_response["data"].map { |release| release["title"] }
    expect(titles.first).to eq("Newer")
    expect(json_response["data"].first["group"]["name"]).to eq(group.name)
  end

  it "filters by group type" do
    girl = create(:group, group_type: "girl_group")
    boy = create(:group, group_type: "boy_group")
    create(:album, group: girl, title: "Girl Release", release_date: "2025-01-01")
    create(:album, group: boy, title: "Boy Release", release_date: "2025-01-01")

    get "/api/v1/comebacks?group_type=girl_group", headers: auth_headers(user)

    titles = json_response["data"].map { |release| release["title"] }
    expect(titles).to include("Girl Release")
    expect(titles).not_to include("Boy Release")
  end

  it "omits releases without a date" do
    group = create(:group)
    create(:album, group: group, title: "Undated", release_date: nil)

    get "/api/v1/comebacks", headers: auth_headers(user)

    expect(json_response["data"].map { |r| r["title"] }).not_to include("Undated")
  end
end
