class GroupConversationCreation
  class NotFriends < StandardError; end

  def self.call(creator:, member_ids:, name: nil)
    new(creator, member_ids, name).call
  end

  def initialize(creator, member_ids, name)
    @creator = creator
    @member_ids = Array(member_ids).map(&:to_i).uniq
    @name = name
  end

  def call
    members = @creator.friends.where(id: @member_ids)
    raise NotFriends unless @member_ids.size >= 2 && members.count == @member_ids.size

    conversation = Conversation.create!(group: true, name: @name.presence, creator: @creator)
    conversation.ensure_participants([@creator, *members])
    conversation
  end
end
