class GroupMemberSync
  def initialize(client = WikidataClient.new)
    @client = client
  end

  # Fills/refreshes Wikidata-sourced rosters; never touches a curated one
  # (curated members carry a position; Wikidata ones do not).
  def call(group)
    return false if group.members.where.not(position: nil).exists?

    entity_id = client.find_entity_id(group.name)
    return false unless entity_id

    members = client.group_members(entity_id)
    return false if members.empty?

    members.each_with_index do |member, index|
      record = group.members.find_or_initialize_by(stage_name: member[:stage_name])
      record.birth_date = member[:birth_date]
      record.sort_order = index
      record.photo_url = member[:photo_url] if member[:photo_url].present?
      record.save!
    end
    true
  end

  private

  attr_reader :client
end
