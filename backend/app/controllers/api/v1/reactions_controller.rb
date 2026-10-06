class Api::V1::ReactionsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_message

  def create
    MessageReactionToggle.call(message: @message, user: current_user, emoji: params[:emoji])
    render json: {
      status: "success",
      data: {message_id: @message.id, reactions: MessageSerializer.reactions_json(@message)}
    }
  rescue ActiveRecord::RecordInvalid => e
    render json: {status: "error", message: e.record.errors.full_messages.to_sentence}, status: :unprocessable_entity
  end

  private

  def set_message
    conversation = Conversation.for_user(current_user).find(params[:conversation_id])
    @message = conversation.messages.find(params[:message_id])
  rescue ActiveRecord::RecordNotFound
    render json: {status: "error", message: "Message not found"}, status: :not_found
  end
end
