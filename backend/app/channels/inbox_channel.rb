class InboxChannel < ApplicationCable::Channel
  def subscribed
    stream_for current_user
  end

  def typing(data)
    conversation = Conversation.for_user(current_user).find_by(id: data["conversation_id"])
    return unless conversation

    conversation.other_participants(current_user).each do |participant|
      InboxChannel.broadcast_to(participant, {
        type: "typing",
        conversation_id: conversation.id,
        user_id: current_user.id
      })
    end
  end
end
