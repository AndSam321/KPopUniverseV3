class Api::V1::PostsController < Api::V1::BaseController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_current_user_optional, only: [:index, :show]
  before_action :set_post, only: [:show, :update, :destroy, :like, :unlike]
  before_action :authorize_user!, only: [:update, :destroy]

  def following
    community_ids = current_user.joined_communities.ids
    @pagy, @posts = pagy(
      Post.includes(:user, community: :group, images_attachments: :blob)
        .where(community_id: community_ids)
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
    scope = Post.includes(:user, community: :group, images_attachments: :blob).order(created_at: :desc)
    scope = scope.where(community_id: params[:community_id]) if params[:community_id].present?
    scope = scope.where(user_id: params[:user_id]) if params[:user_id].present?
    @pagy, @posts = pagy(scope, items: params[:per_page] || 10)

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

    if @post.save
      join_community(@post.community)
      @post.user.award_points(:create_post)
      BadgeAwarder.new(@post.user).check_fandom_badges([@post.community&.group].compact)
      ProfileBroadcaster.call(@post.user)
      render json: {data: post_json(@post)}, status: :created
    else
      render json: {errors: @post.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def update
    if @post.update(post_params.except(:community_id))
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

  def join_community(community)
    return unless community

    current_user.community_memberships.find_or_create_by(community: community)
  rescue ActiveRecord::RecordNotUnique
    # already a member
  end

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
    @post = Post.includes(:user, community: :group, images_attachments: :blob).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {error: "Post not found"}, status: :not_found
  end

  def authorize_user!
    unless @post.user_id == current_user.id
      render json: {error: "You are not authorized to edit this post"}, status: :forbidden
    end
  end

  def post_params
    params.permit(:title, :caption, :flair, :community_id, images: [])
  end

  def post_json(post, liked_post_ids = nil)
    is_liked = if liked_post_ids
      liked_post_ids.include?(post.id)
    elsif current_user
      current_user.likes.exists?(post: post)
    else
      false
    end

    post.as_json.merge(
      user: {
        id: post.user.id,
        username: post.user.username,
        avatar_url: post.user.profile_avatar_url
      },
      groups: group_json(post.community&.group),
      community: community_json(post.community),
      is_liked: is_liked,
      images: post.images.map { |img| image_json(img) }
    )
  end

  def community_json(community)
    return nil unless community

    {id: community.id, name: community.name, slug: community.slug, official: community.official}
  end

  def group_json(group)
    return [] unless group

    [{id: group.id, name: group.name, slug: group.slug}]
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
