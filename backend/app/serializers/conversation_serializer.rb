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
    {
      id: @conversation.id,
      last_message_at: @conversation.last_message_at,
      unread_count: @unread_count || @conversation.unread_count_for(@current_user),
      other_user: other_user_json,
      last_message: last_message && MessageSerializer.call(last_message)
    }
  end

  private

  def last_message
    @last_message == :unset ? @conversation.messages.chronological.last : @last_message
  end

  def other_user_json
    other = @conversation.other_participant(@current_user)
    {id: other.id, username: other.username, avatar_url: other.profile_avatar_url}
  end
end
