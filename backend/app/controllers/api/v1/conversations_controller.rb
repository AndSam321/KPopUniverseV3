class Api::V1::ConversationsController < Api::V1::BaseController
  before_action :authenticate_user!

  def index
    pagy, conversations = pagy(
      Conversation.for_user(current_user).with_activity.recent_first
        .includes(participants: {avatar_attachment: :blob}),
      items: 20
    )
    ids = conversations.map(&:id)

    render json: {
      status: "success",
      data: conversations.map { |conversation| serialize(conversation, ids) },
      unread_count: Message.unread_count_for(current_user),
      pagination: {current_page: pagy.page, total_pages: pagy.pages, total_count: pagy.count}
    }
  end

  def create
    return create_group if params[:member_ids].present?

    recipient = User.find(params[:recipient_id])
    if recipient == current_user
      return render json: {status: "error", message: "You cannot message yourself"}, status: :unprocessable_entity
    end

    conversation = Conversation.between(current_user, recipient)
    render json: {status: "success", data: ConversationSerializer.call(conversation, current_user)}, status: :created
  rescue ActiveRecord::RecordNotFound
    render json: {status: "error", message: "User not found"}, status: :not_found
  end

  def create_group
    conversation = GroupConversationCreation.call(creator: current_user, member_ids: params[:member_ids], name: params[:name])
    render json: {status: "success", data: ConversationSerializer.call(conversation, current_user)}, status: :created
  rescue GroupConversationCreation::NotFriends
    render json: {status: "error", message: "You can only start a group with friends (people who follow you back)"}, status: :unprocessable_entity
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
      .includes(sender: {avatar_attachment: :blob})
      .index_by(&:conversation_id)
  end

  def unread_counts(ids)
    @unread_counts ||= Message.joins(conversation: :conversation_participants)
      .where(conversation_participants: {user_id: current_user.id})
      .where(conversation_id: ids)
      .where.not(sender_id: current_user.id)
      .where("messages.created_at > COALESCE(conversation_participants.last_read_at, to_timestamp(0))")
      .group(:conversation_id).count
  end
end
