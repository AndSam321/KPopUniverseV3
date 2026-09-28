class CommunityCreation
  def initialize(group, creator)
    @group = group
    @creator = creator
  end

  def call(attributes)
    community = @group.communities.new(attributes.merge(creator: @creator))
    community.community_memberships.build(user: @creator)
    community.save
    community
  end
end
