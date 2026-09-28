class Api::V1::CommentsController < Api::V1::BaseController
  before_action :authenticate_user!, except: [:index]
  before_action :set_current_user_optional, only: [:index]
  before_action :set_post, only: [:index, :create]
  before_action :set_comment, only: [:update, :destroy, :like, :unlike]
  before_action :authorize_user!, only: [:update, :destroy]

  def index
    @comments = @post.comments.includes(:user, :reply_to_user, replies: [:user, :reply_to_user])
                      .where(parent_id: nil)
                      .order(created_at: :desc)
    @liked_ids = liked_comment_ids(@comments)

    render json: {
      data: @comments.map { |comment| comment_json(comment) }
    }, status: :ok
  end

  def create
    @comment = @post.comments.build(comment_params)
    @comment.user = current_user
    assign_thread_target

    if @comment.save
      CommentCreation.new(@comment).call
      render json: { data: comment_json(@comment) }, status: :created
    else
      render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @comment.update(comment_params)
      render json: { data: comment_json(@comment) }, status: :ok
    else
      render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @comment.destroy
    head :no_content
  end

  def like
    comment_like = current_user.comment_likes.find_or_initialize_by(comment: @comment)

    liked = if comment_like.persisted?
      comment_like.destroy
      revoke_comment_author_points
      false
    elsif comment_like.save
      award_comment_author_points
      notify_comment_author(comment_like)
      true
    else
      false
    end
    ProfileBroadcaster.call(@comment.user)
    render json: { liked: liked, likes_count: @comment.reload.likes_count }, status: :ok
  end

  def unlike
    if current_user.comment_likes.find_by(comment: @comment)&.destroy
      revoke_comment_author_points
    end
    ProfileBroadcaster.call(@comment.user)
    render json: { liked: false, likes_count: @comment.reload.likes_count }, status: :ok
  end

  private

  def set_post
    @post = Post.find(params[:post_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Post not found" }, status: :not_found
  end

  def set_comment
    @comment = Comment.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Comment not found" }, status: :not_found
  end

  def authorize_user!
    unless @comment.user_id == current_user.id
      render json: { error: "You are not authorized to modify this comment" }, status: :forbidden
    end
  end

  def award_comment_author_points
    return if current_user.id == @comment.user_id

    @comment.user.award_points(:receive_like)
  end

  def revoke_comment_author_points
    return if current_user.id == @comment.user_id

    @comment.user.revoke_points(:receive_like)
  end

  def notify_comment_author(comment_like)
    ActivityNotifier.call(
      recipient: @comment.user,
      actor: current_user,
      notifiable: comment_like,
      action: "liked_comment",
      preference: :likes,
      muted_check_post: @comment.post
    )
  end

  def assign_thread_target
    parent = @comment.parent
    return unless parent&.parent_id

    @comment.parent_id = parent.parent_id
    @comment.reply_to_user_id = parent.user_id
  end

  def liked_comment_ids(top_level)
    return Set.new unless current_user

    ids = top_level.flat_map { |comment| [comment.id] + comment.replies.map(&:id) }
    current_user.comment_likes.where(comment_id: ids).pluck(:comment_id).to_set
  end

  def comment_params
    params.permit(:content, :parent_id, :image, :image_url)
  end

  def comment_json(comment)
    {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      parent_id: comment.parent_id,
      likes_count: comment.likes_count,
      is_liked: @liked_ids ? @liked_ids.include?(comment.id) : false,
      image: comment_image_json(comment),
      reply_to: reply_to_json(comment),
      user: {
        id: comment.user.id,
        username: comment.user.username,
        avatar_url: comment.user.profile_avatar_url
      },
      replies_count: reply_children(comment).size,
      replies: reply_children(comment).sort_by(&:created_at).map { |reply| comment_json(reply) }
    }
  end

  def reply_children(comment)
    comment.parent_id ? [] : comment.replies
  end

  def reply_to_json(comment)
    return nil unless comment.reply_to_user

    { id: comment.reply_to_user.id, username: comment.reply_to_user.username }
  end

  def comment_image_json(comment)
    if comment.image_url.present?
      return { url: comment.image_url, thumbnail_url: comment.image_url, is_gif: true }
    end
    return nil unless comment.image.attached?

    {
      url: attachment_url(comment.image),
      thumbnail_url: comment_thumbnail_url(comment),
      is_gif: comment.image.content_type == "image/gif"
    }
  end

  def comment_thumbnail_url(comment)
    return attachment_url(comment.image) if comment.image.content_type == "image/gif"

    attachment_url(comment.image.variant(:thumb))
  rescue => e
    Rails.logger.error("Failed to build comment thumbnail for #{comment.id}: #{e.message}")
    attachment_url(comment.image)
  end

  def attachment_url(attachment)
    Rails.application.routes.url_helpers.url_for(attachment)
  end
end
