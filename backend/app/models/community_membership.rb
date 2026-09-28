class CommunityMembership < ApplicationRecord
  belongs_to :user
  belongs_to :community, counter_cache: :member_count

  validates :user_id, uniqueness: {scope: :community_id}
end
