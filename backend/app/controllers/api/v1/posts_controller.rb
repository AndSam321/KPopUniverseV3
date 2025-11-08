class Api::V1::PostsController < Api::V1::BaseController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_post, only: [:show, :update, :destroy]
  before_action :authorize_user!, only: [:update, :destroy]

  def index
    @posts = Post.recent.with_associations.page(params[:page] || 1).per(20)

    render json: {
      data: @posts.map { |post| post_json(post) },
      meta: {
        current_page: @posts.current_page,
        total_pages: @posts.total_pages,
        total_count: @posts.total_count
      }
    }
  end

  def show
    render json: {data: post_json(@post)}
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

  private

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
    {
      id: post.id,
      title: post.title,
      caption: post.caption,
      images: post.images.attached? ? post.images.map { |img| image_json(img) } : [],
      groups: post.groups.map { |g| {id: g.id, name: g.name, slug: g.slug} },
      user: {
        id: post.user.id,
        username: post.user.username,
        avatar_url: post.user.avatar_url
      },
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      created_at: post.created_at
    }
  end

  def image_json(image)
    {
      url: Rails.application.routes.url_helpers.url_for(image),
      thumbnail_url: image.variant(:thumb).processed.url,
      filename: image.filename.to_s,
      content_type: image.content_type,
      byte_size: image.byte_size
    }
  end
end
