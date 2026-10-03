class Api::V1::ConversationsController < Api::V1::BaseController
  before_action :authenticate_user!

  def index
    conversations = Conversation.for_user(current_user).recent_first
      .includes(user_one: {avatar_attachment: :blob}, user_two: {avatar_attachment: :blob}).to_a
    ids = conversations.map(&:id)

    render json: {
      status: "success",
      data: conversations.map { |conversation| serialize(conversation, ids) },
      unread_count: Message.unread_count_for(current_user)
    }
  end

  def create
    recipient = User.find(params[:recipient_id])
    if recipient == current_user
      return render json: {status: "error", message: "You cannot message yourself"}, status: :unprocessable_entity
    end

    conversation = Conversation.between(current_user, recipient)
    render json: {status: "success", data: ConversationSerializer.call(conversation, current_user)}, status: :created
  rescue ActiveRecord::RecordNotFound
    render json: {status: "error", message: "User not found"}, status: :not_found
  end

  def unread_count
    render json: {status: "success", unread_count: Message.unread_count_for(current_user)}
  end

  def read
    conversation = Conversation.for_user(current_user).find(params[:id])
    ConversationReader.call(conversation:, user: current_user)
    render json: {status: "success", unread_count: Message.unread_count_for(current_user)}
  rescue ActiveRecord::RecordNotFound
    render json: {status: "error", message: "Conversation not found"}, status: :not_found
  end

  private

  def serialize(conversation, ids)
    ConversationSerializer.call(conversation, current_user,
      last_message: last_messages(ids)[conversation.id],
      unread_count: unread_counts(ids).fetch(conversation.id, 0))
  end

  def last_messages(ids)
    @last_messages ||= Message.where(conversation_id: ids)
      .select("DISTINCT ON (conversation_id) *")
      .order("conversation_id, created_at DESC")
      .index_by(&:conversation_id)
  end

  def unread_counts(ids)
    @unread_counts ||= Message.where(conversation_id: ids)
      .where.not(sender_id: current_user.id).unread
      .group(:conversation_id).count
  end
end
