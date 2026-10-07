require "rails_helper"

RSpec.describe "Api::V1::Onboarding", type: :request do
  let(:user) { create(:user) }
  let(:bts) { create(:group) }
  let(:twice) { create(:group) }
  let!(:bts_general) { create(:community, group: bts, official: true) }
  let!(:twice_general) { create(:community, group: twice, official: true) }

  def complete_onboarding(group_ids, as: user)
    post "/api/v1/onboarding", params: {group_ids: group_ids}, headers: auth_headers(as)
  end

  describe "POST /api/v1/onboarding" do
    it "joins the official communities of the selected groups" do
      expect { complete_onboarding([bts.id, twice.id]) }
        .to change(user.community_memberships, :count).by(2)

      expect(user.joined_communities).to contain_exactly(bts_general, twice_general)
      expect(response).to have_http_status(:ok)
    end

    it "stamps onboarded_at and returns it" do
      complete_onboarding([bts.id])

      expect(user.reload.onboarded_at).to be_present
      expect(json_response["data"]["onboarded_at"]).to be_present
    end

    it "ignores non-official communities for a selected group" do
      side_community = create(:community, group: bts, official: false)
      complete_onboarding([bts.id])

      expect(user.joined_communities).to contain_exactly(bts_general)
      expect(user.joined_communities).not_to include(side_community)
    end

    it "marks onboarded even when no groups are selected (skip)" do
      expect { complete_onboarding([]) }.not_to change(user.community_memberships, :count)
      expect(user.reload.onboarded_at).to be_present
    end

    it "is idempotent when a group is already joined" do
      user.community_memberships.create!(community: bts_general)

      expect { complete_onboarding([bts.id]) }
        .not_to change(user.community_memberships, :count)
    end

    it "requires authentication" do
      post "/api/v1/onboarding", params: {group_ids: [bts.id]}
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
