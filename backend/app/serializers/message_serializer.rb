class MessageSerializer
  def self.call(message)
    {
      id: message.id,
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      body: message.body,
      read_at: message.read_at,
      created_at: message.created_at
    }
  end
end
