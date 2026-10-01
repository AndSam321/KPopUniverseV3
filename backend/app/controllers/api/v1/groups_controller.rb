class Api::V1::GroupsController < Api::V1::BaseController
  before_action :authenticate_user!, only: [:create]

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
        group: group_detail_json(@group),
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
      logo_url: group.logo_url,
      korean_name: group.korean_name,
      company: group.company,
      debut_date: group.debut_date,
      group_type: group.group_type,
      status: group.status,
      fandom_name: group.fandom_name,
      user_id: group.user_id
    }
  end

  def group_detail_json(group)
    group_json(group).merge(
      members: group.members.ordered.map { |member| member_json(member) },
      albums: group.albums.newest_first.map { |album| album_json(album) }
    )
  end

  def member_json(member)
    {
      id: member.id,
      stage_name: member.stage_name,
      full_name: member.full_name,
      birth_date: member.birth_date,
      position: member.position,
      photo_url: FandomImage.thumbnail(member.photo_url, width: 300)
    }
  end

  def album_json(album)
    {
      id: album.id,
      title: album.title,
      album_type: album.album_type,
      release_date: album.release_date,
      cover_url: album.cover_url,
      external_url: album.external_url
    }
  end

  def post_summary_json(post)
    {
      id: post.id,
      title: post.title,
      caption: post.caption,
      flair: post.flair,
      images: post.images.attached? ? post.images.map { |img| image_json(img) } : [],
      groups: post.community&.group ? [{id: post.community.group.id, name: post.community.group.name, slug: post.community.group.slug}] : [],
      community: post.community ? {id: post.community.id, name: post.community.name, slug: post.community.slug, official: post.community.official} : nil,
      user: {
        id: post.user.id,
        username: post.user.username,
        avatar_url: post.user.profile_avatar_url
      },
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      created_at: post.created_at
    }
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
