require "rails_helper"

RSpec.describe "Comebacks API", type: :request do
  let(:user) { create(:user) }

  it "splits comebacks into upcoming and recent" do
    create(:comeback, title: "Soon", comeback_date: Date.current + 7)
    create(:comeback, title: "Past", comeback_date: Date.current - 7)

    get "/api/v1/comebacks", headers: auth_headers(user)

    expect(response).to have_http_status(:ok)
    expect(json_response["upcoming"].map { |c| c["title"] }).to include("Soon")
    expect(json_response["recent"].map { |c| c["title"] }).to include("Past")
    expect(json_response["upcoming"].map { |c| c["title"] }).not_to include("Past")
  end

  it "orders upcoming soonest first" do
    create(:comeback, title: "Later", comeback_date: Date.current + 30)
    create(:comeback, title: "Sooner", comeback_date: Date.current + 3)

    get "/api/v1/comebacks", headers: auth_headers(user)

    expect(json_response["upcoming"].map { |c| c["title"] }).to eq(["Sooner", "Later"])
  end

  it "includes the matched group when present" do
    group = create(:group, name: "TWICE")
    create(:comeback, artist_name: "TWICE", group: group, comeback_date: Date.current + 2)

    get "/api/v1/comebacks", headers: auth_headers(user)

    expect(json_response["upcoming"].first["group"]["name"]).to eq("TWICE")
  end

  it "searches by artist or title" do
    create(:comeback, artist_name: "TWICE", title: "Strategy", comeback_date: Date.current + 1)
    create(:comeback, artist_name: "BTS", title: "Proof", comeback_date: Date.current + 1)

    get "/api/v1/comebacks?q=twice", headers: auth_headers(user)

    names = json_response["upcoming"].map { |c| c["artist_name"] }
    expect(names).to include("TWICE")
    expect(names).not_to include("BTS")
  end
end
