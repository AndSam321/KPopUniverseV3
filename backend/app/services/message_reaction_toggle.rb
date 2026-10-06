class MessageReactionToggle
  def self.call(message:, user:, emoji:)
    new(message, user, emoji).call
  end

  def initialize(message, user, emoji)
    @message = message
    @user = user
    @emoji = emoji
  end

  def call
    toggle
    @message.message_reactions.reset
    broadcast
    @message
  end

  private

  def toggle
    existing = @message.message_reactions.find_by(user: @user, emoji: @emoji)
    existing ? existing.destroy! : @message.message_reactions.create!(user: @user, emoji: @emoji)
  end

  def broadcast
    conversation = @message.conversation
    conversation.participants.each do |participant|
      InboxChannel.broadcast_to(participant, {
        type: "reaction",
        conversation_id: conversation.id,
        message_id: @message.id,
        reactions: MessageSerializer.reactions_json(@message)
      })
    end
  end
end
