class ConversationReader
  def self.call(conversation:, user:)
    count = conversation.messages.where.not(sender_id: user.id).unread.update_all(read_at: Time.current)
    broadcast(conversation, user) if count.positive?
    count
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
