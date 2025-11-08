class Api::V1::GroupsController < Api::V1::BaseController
  before_action :authenticate_user!, only: [:create]
  before_action :set_active_storage_url_options

  def index
    @groups = Group.alphabetical

    render json: {
      data: @groups.map { |group| group_json(group) }
    }
  end

  def show
    @group = Group.find(params[:id])
    @pagy, @posts = pagy(@group.posts.recent.with_associations, items: 20)

    render json: {
      data: {
        group: group_json(@group),
        posts: @posts.map { |post| post_summary_json(post) },
        meta: {
          current_page: @pagy.page,
          total_pages: @pagy.pages,
          total_count: @pagy.count
        }
      }
    }
  rescue ActiveRecord::RecordNotFound
    render json: {error: "Group not found"}, status: :not_found
  end

  def create
    @group = current_user.groups.build(group_params)

    if @group.save
      render json: {data: group_json(@group)}, status: :created
    else
      render json: {errors: @group.errors.full_messages}, status: :unprocessable_entity
    end
  end

  private

  def group_params
    params.permit(:name, :description, :logo_url)
  end

  def group_json(group)
    {
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      logo_url: group.logo_url
    }
  end

  def set_active_storage_url_options
    ActiveStorage::Current.url_options = {host: "localhost", port: 9000}
  end

  def post_summary_json(post)
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
