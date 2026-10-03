class MessageCreation
  def self.call(conversation:, sender:, body:)
    new(conversation, sender, body).call
  end

  def initialize(conversation, sender, body)
    @conversation = conversation
    @sender = sender
    @body = body
  end

  def call
    message = @conversation.messages.create!(sender: @sender, body: @body)
    @conversation.update!(last_message_at: message.created_at)
    broadcast(message)
    message
  end

  private

  def broadcast(message)
    [@conversation.user_one, @conversation.user_two].each do |participant|
      InboxChannel.broadcast_to(participant, {
        type: "message",
        conversation_id: @conversation.id,
        message: MessageSerializer.call(message),
        unread_count: Message.unread_count_for(participant)
      })
    end
  end
end
