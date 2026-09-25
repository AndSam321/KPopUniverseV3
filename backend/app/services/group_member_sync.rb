class GroupMemberSync
  def initialize(client = WikidataClient.new)
    @client = client
  end

  # Only fills groups with no members yet; never clobbers a curated roster.
  def call(group)
    return false if group.members.exists?

    entity_id = client.find_entity_id(group.name)
    return false unless entity_id

    members = client.group_members(entity_id)
    return false if members.empty?

    members.each_with_index do |member, index|
      group.members.find_or_initialize_by(stage_name: member[:stage_name]).update!(
        birth_date: member[:birth_date],
        sort_order: index
      )
    end
    true
  end

  private

  attr_reader :client
end
