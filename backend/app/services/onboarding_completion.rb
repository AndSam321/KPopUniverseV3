class OnboardingCompletion
  def initialize(user:, group_ids: [])
    @user = user
    @group_ids = Array(group_ids).map(&:to_i).uniq
  end

  def call
    ActiveRecord::Base.transaction do
      join_official_communities
      @user.update!(onboarded_at: Time.current)
    end
    @user
  end

  private

  def join_official_communities
    official_communities.each do |community|
      @user.community_memberships.find_or_create_by!(community: community)
    end
  end

  def official_communities
    Community.where(official: true, group_id: @group_ids)
  end
end
