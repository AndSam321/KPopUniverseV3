class CommunityCreation
  def initialize(group, creator)
    @group = group
    @creator = creator
  end

  def call(attributes)
    community = Community.new(attributes.merge(creator: @creator, group: @group))
    community.community_memberships.build(user: @creator)
    community.save
    community
  end
end
