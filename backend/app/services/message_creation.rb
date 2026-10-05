class MessageCreation
  def self.call(conversation:, sender:, attributes:)
    new(conversation, sender, attributes).call
  end

  def initialize(conversation, sender, attributes)
    @conversation = conversation
    @sender = sender
    @attributes = attributes
  end

  def call
    message = @conversation.messages.create!(@attributes.to_h.merge(sender: @sender))
    @conversation.update!(last_message_at: message.created_at)
    broadcast(message)
    message
  end

  private

  def broadcast(message)
    @conversation.participants.each do |participant|
      InboxChannel.broadcast_to(participant, {
        type: "message",
        conversation_id: @conversation.id,
        message: MessageSerializer.call(message),
        unread_count: Message.unread_count_for(participant)
      })
    end
  end
end
