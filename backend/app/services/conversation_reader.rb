class ConversationReader
  def self.call(conversation:, user:)
    return unless conversation.participant?(user)

    had_unread = conversation.unread_count_for(user).positive?
    conversation.mark_read_for(user)
    broadcast(conversation, user) if had_unread
  end

  def self.broadcast(conversation, user)
    InboxChannel.broadcast_to(user, {
      type: "read",
      conversation_id: conversation.id,
      unread_count: Message.unread_count_for(user)
    })
  end
  private_class_method :broadcast
end
