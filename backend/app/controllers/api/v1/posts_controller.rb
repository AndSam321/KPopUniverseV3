class Api::V1::PostsController < Api::V1::BaseController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_post, only: [:show, :update, :destroy, :like, :unlike]
  before_action :authorize_user!, only: [:update, :destroy]
  before_action :set_active_storage_url_options

  def index
    @posts = Post.includes(:user, :groups, images_attachments: :blob)
                  .order(created_at: :desc)
                  .page(params[:page])
                  .per(params[:per_page] || 10)

    render json: @posts.map { |post| post_json(post) }, status: :ok
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
      false
    else
      like.save
      true
    end
    render json: {liked: liked, likes_count: @post.reload.likes_count}, status: :ok
  end

  def unlike
    like
  end

  private

  def set_active_storage_url_options
    ActiveStorage::Current.url_options = {host: "localhost", port: 9000}
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
    params.permit(:title, :caption, images: [])
  end

  def post_json(post)
    post.as_json(include: {
      user: { only: [:id, :username, :avatar_url] },
      groups: { only: [:id, :name, :slug] }
    }).merge(
      is_liked: current_user ? current_user.likes.exists?(post: post) : false,
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
