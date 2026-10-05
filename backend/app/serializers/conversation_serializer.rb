class ConversationSerializer
  def self.call(conversation, current_user, last_message: :unset, unread_count: nil)
    new(conversation, current_user, last_message, unread_count).call
  end

  def initialize(conversation, current_user, last_message, unread_count)
    @conversation = conversation
    @current_user = current_user
    @last_message = last_message
    @unread_count = unread_count
  end

  def call
    others = @conversation.other_participants(@current_user)
    {
      id: @conversation.id,
      group: @conversation.group,
      title: @conversation.title_for(@current_user),
      last_message_at: @conversation.last_message_at,
      unread_count: @unread_count || @conversation.unread_count_for(@current_user),
      other_user: @conversation.group ? nil : user_json(others.first),
      participants: others.map { |participant| user_json(participant) },
      last_message: last_message && MessageSerializer.call(last_message)
    }
  end

  private

  def last_message
    @last_message == :unset ? @conversation.messages.chronological.last : @last_message
  end

  def user_json(user)
    return nil unless user

    {id: user.id, username: user.username, avatar_url: user.profile_avatar_url}
  end
end
