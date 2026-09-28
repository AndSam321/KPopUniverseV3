require "rails_helper"

RSpec.describe "Communities API", type: :request do
  let(:user) { create(:user) }
  let(:group) { create(:group) }

  describe "GET /api/v1/groups/:group_id/communities" do
    it "lists a group's communities, official first" do
      create(:community, group: group, name: "Fan Art", member_count: 2)
      create(:community, group: group, name: "Official", official: true)

      get "/api/v1/groups/#{group.id}/communities", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      names = json_response["data"].map { |c| c["name"] }
      expect(names.first).to eq("Official")
    end

    it "reports whether the current user is a member" do
      community = create(:community, group: group)
      create(:community_membership, user: user, community: community)

      get "/api/v1/groups/#{group.id}/communities", headers: auth_headers(user)

      expect(json_response["data"].first["is_member"]).to be(true)
    end
  end

  describe "POST /api/v1/groups/:group_id/communities" do
    it "creates a community and auto-joins the creator" do
      expect {
        post "/api/v1/groups/#{group.id}/communities",
          params: {name: "Theories"}, headers: auth_headers(user)
      }.to change(Community, :count).by(1)

      expect(response).to have_http_status(:created)
      community = Community.last
      expect(community.creator).to eq(user)
      expect(community.member_count).to eq(1)
      expect(json_response["data"]["is_member"]).to be(true)
    end
  end

  describe "POST /api/v1/communities/:id/join" do
    let(:community) { create(:community, group: group) }

    it "joins the community and bumps the member count" do
      expect {
        post "/api/v1/communities/#{community.id}/join", headers: auth_headers(user)
      }.to change { community.reload.member_count }.by(1)

      expect(json_response["data"]["is_member"]).to be(true)
    end

    it "is idempotent when already joined" do
      create(:community_membership, user: user, community: community)

      expect {
        post "/api/v1/communities/#{community.id}/join", headers: auth_headers(user)
      }.not_to change { community.reload.member_count }
    end
  end

  describe "DELETE /api/v1/communities/:id/leave" do
    let(:community) { create(:community, group: group) }

    it "leaves the community" do
      create(:community_membership, user: user, community: community)

      expect {
        delete "/api/v1/communities/#{community.id}/leave", headers: auth_headers(user)
      }.to change { community.reload.member_count }.by(-1)

      expect(json_response["data"]["is_member"]).to be(false)
    end
  end

  describe "GET /api/v1/communities/mine" do
    it "returns only the communities the user joined" do
      joined = create(:community, group: group)
      create(:community, group: group)
      create(:community_membership, user: user, community: joined)

      get "/api/v1/communities/mine", headers: auth_headers(user)

      expect(json_response["data"].map { |c| c["id"] }).to eq([joined.id])
    end
  end
end
