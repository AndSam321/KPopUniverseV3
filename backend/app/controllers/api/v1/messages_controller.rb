class Api::V1::MessagesController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_conversation

  def index
    pagy, records = pagy(@conversation.messages.includes(:message_reactions).order(created_at: :desc), items: 50)
    ConversationReader.call(conversation: @conversation, user: current_user)

    render json: {
      status: "success",
      data: records.reverse.map { |message| MessageSerializer.call(message) },
      conversation: ConversationSerializer.call(@conversation, current_user),
      pagination: {current_page: pagy.page, total_pages: pagy.pages, total_count: pagy.count}
    }
  end

  def create
    message = MessageCreation.call(conversation: @conversation, sender: current_user, attributes: message_params)
    render json: {status: "success", data: MessageSerializer.call(message)}, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: {status: "error", message: e.record.errors.full_messages.to_sentence}, status: :unprocessable_entity
  end

  private

  def message_params
    params.permit(:body, :image, :image_url)
  end

  def set_conversation
    @conversation = Conversation.for_user(current_user).find(params[:conversation_id])
  rescue ActiveRecord::RecordNotFound
    render json: {status: "error", message: "Conversation not found"}, status: :not_found
  end
end
