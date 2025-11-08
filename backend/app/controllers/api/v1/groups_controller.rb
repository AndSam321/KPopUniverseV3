class Api::V1::GroupsController < Api::V1::BaseController
  def index
    @groups = Group.alphabetical

    render json: {
      data: @groups.map { |group| group_json(group) }
    }
  end

  def show
    @group = Group.find(params[:id])
    @posts = @group.posts.recent.with_associations.page(params[:page] || 1).per(20)

    render json: {
      data: {
        group: group_json(@group),
        posts: @posts.map { |post| post_summary_json(post) },
        meta: {
          current_page: @posts.current_page,
          total_pages: @posts.total_pages,
          total_count: @posts.total_count
        }
      }
    }
  rescue ActiveRecord::RecordNotFound
    render json: {error: "Group not found"}, status: :not_found
  end

  private

  def group_json(group)
    {
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      logo_url: group.logo_url
    }
  end

  def post_summary_json(post)
    {
      id: post.id,
      title: post.title,
      user: {
        id: post.user.id,
        username: post.user.username
      },
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      created_at: post.created_at
    }
  end
end
