class Api::V1::PostsController < Api::V1::BaseController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_current_user_optional, only: [:index, :show]
  before_action :set_post, only: [:show, :update, :destroy, :like, :unlike]
  before_action :authorize_user!, only: [:update, :destroy]

  def following
    followed_ids = current_user.following.pluck(:id) + [current_user.id]
    @pagy, @posts = pagy(
      Post.includes(:user, :groups, images_attachments: :blob)
        .where(user_id: followed_ids)
        .order(created_at: :desc),
      items: params[:per_page] || 10
    )

    @liked_post_ids = current_user.likes.where(post_id: @posts.map(&:id)).pluck(:post_id).to_set

    render json: {
      data: @posts.map { |post| post_json(post, @liked_post_ids) },
      meta: {
        current_page: @pagy.page,
        total_pages: @pagy.pages,
        total_count: @pagy.count
      }
    }, status: :ok
  end

  def index
    @pagy, @posts = pagy(Post.includes(:user, :groups, images_attachments: :blob)
                              .order(created_at: :desc), items: params[:per_page] || 10)

    @liked_post_ids = if current_user
      current_user.likes.where(post_id: @posts.map(&:id)).pluck(:post_id).to_set
    else
      Set.new
    end

    render json: {
      data: @posts.map { |post| post_json(post, @liked_post_ids) },
      meta: {
        current_page: @pagy.page,
        total_pages: @pagy.pages,
        total_count: @pagy.count
      }
    }, status: :ok
  end

  def show
    render json: post_json(@post), status: :ok
  end

  def create
    @post = current_user.posts.build(post_params)

    if params[:group_ids].present?
      @post.group_ids = params[:group_ids]
    end

    if @post.save
      @post.user.award_points(:create_post)
      BadgeAwarder.new(@post.user).check_fandom_badges(@post.groups)
      ProfileBroadcaster.call(@post.user)
      render json: {data: post_json(@post)}, status: :created
    else
      render json: {errors: @post.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def update
    if params[:group_ids].present?
      @post.group_ids = params[:group_ids]
    end

    if @post.update(post_params)
      BadgeAwarder.new(@post.user).check_fandom_badges(@post.groups)
      ProfileBroadcaster.call(@post.user)
      render json: {data: post_json(@post)}
    else
      render json: {errors: @post.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def destroy
    @post.destroy
    head :no_content
  end

  def like
    like = current_user.likes.find_or_initialize_by(post: @post)

    liked = if like.persisted?
      like.destroy
      revoke_post_author_points
      false
    elsif like.save
      award_post_author_points
      notify_post_owner(like)
      true
    else
      false
    end
    ProfileBroadcaster.call(@post.user)
    render json: {liked: liked, likes_count: @post.reload.likes_count}, status: :ok
  end

  def unlike
    if current_user.likes.find_by(post: @post)&.destroy
      revoke_post_author_points
    end
    ProfileBroadcaster.call(@post.user)
    render json: {liked: false, likes_count: @post.reload.likes_count}, status: :ok
  end

  private

  def award_post_author_points
    return if current_user.id == @post.user_id

    @post.user.award_points(:receive_like)
  end

  def revoke_post_author_points
    return if current_user.id == @post.user_id

    @post.user.revoke_points(:receive_like)
  end

  def notify_post_owner(like)
    ActivityNotifier.call(
      recipient: @post.user,
      actor: current_user,
      notifiable: like,
      action: "liked",
      preference: :likes,
      muted_check_post: @post
    )
  end

  def set_post
    @post = Post.includes(:user, :groups, images_attachments: :blob).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {error: "Post not found"}, status: :not_found
  end

  def authorize_user!
    unless @post.user_id == current_user.id
      render json: {error: "You are not authorized to edit this post"}, status: :forbidden
    end
  end

  def post_params
    params.permit(:title, :caption, :flair, images: [])
  end

  def post_json(post, liked_post_ids = nil)
    is_liked = if liked_post_ids
      liked_post_ids.include?(post.id)
    elsif current_user
      current_user.likes.exists?(post: post)
    else
      false
    end

    post.as_json(include: {groups: {only: [:id, :name, :slug]}}).merge(
      user: {
        id: post.user.id,
        username: post.user.username,
        avatar_url: post.user.profile_avatar_url
      },
      is_liked: is_liked,
      images: post.images.map { |img| image_json(img) }
    )
  end

  def image_json(image)
    begin
      thumbnail_url = Rails.application.routes.url_helpers.url_for(image.variant(:thumb))
    rescue => e
      Rails.logger.error("Failed to generate thumbnail for image #{image.id}: #{e.message}")
      thumbnail_url = Rails.application.routes.url_helpers.url_for(image)
    end

    {
      url: Rails.application.routes.url_helpers.url_for(image),
      thumbnail_url: thumbnail_url,
      filename: image.filename.to_s,
      content_type: image.content_type,
      byte_size: image.byte_size
    }
  end
end
