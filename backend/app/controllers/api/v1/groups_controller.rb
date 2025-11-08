class Api::V1::GroupsController < Api::V1::BaseController
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
