class Api::V1::SearchController < Api::V1::BaseController
  TYPES = %w[groups members users posts].freeze

  def index
    query = SearchQuery.new(params[:q])

    unless query.valid?
      return render json: {data: empty_payload, meta: {query: params[:q].to_s}}
    end

    params[:type].present? ? render_typed(query) : render_preview(query)
  end

  private

  def render_preview(query)
    render json: {
      data: {
        groups: query.groups.limit(SearchQuery::PREVIEW_LIMIT).map { |g| group_json(g) },
        members: query.members.limit(SearchQuery::PREVIEW_LIMIT).map { |m| member_json(m) },
        users: query.users.limit(SearchQuery::PREVIEW_LIMIT).map { |u| user_json(u) },
        posts: query.posts.limit(SearchQuery::PREVIEW_LIMIT).map { |p| post_json(p) }
      },
      meta: {
        query: params[:q].to_s,
        counts: {
          groups: query.groups.count,
          members: query.members.count,
          users: query.users.count,
          posts: query.posts.count
        }
      }
    }
  end

  def render_typed(query)
    type = params[:type]
    return render json: {error: "Invalid type"}, status: :unprocessable_entity unless TYPES.include?(type)

    pagy, records = pagy(query.public_send(type), items: 20)
    render json: {
      data: records.map { |record| send("#{type.singularize}_json", record) },
      meta: {
        query: params[:q].to_s,
        type: type,
        current_page: pagy.page,
        total_pages: pagy.pages,
        total_count: pagy.count
      }
    }
  end

  def empty_payload
    {groups: [], members: [], users: [], posts: []}
  end

  def group_json(group)
    {
      id: group.id,
      name: group.name,
      slug: group.slug,
      korean_name: group.korean_name,
      logo_url: group.logo_url,
      group_type: group.group_type
    }
  end

  def member_json(member)
    {
      id: member.id,
      stage_name: member.stage_name,
      position: member.position,
      photo_url: FandomImage.thumbnail(member.photo_url, width: 100),
      group: {id: member.group.id, name: member.group.name, slug: member.group.slug}
    }
  end

  def user_json(user)
    {
      id: user.id,
      username: user.username,
      avatar_url: user.profile_avatar_url,
      title: user.title
    }
  end

  def post_json(post)
    {
      id: post.id,
      title: post.title,
      caption: post.caption&.truncate(140),
      created_at: post.created_at,
      user: {id: post.user.id, username: post.user.username},
      groups: post.community&.group ? [{id: post.community.group.id, name: post.community.group.name, slug: post.community.group.slug}] : []
    }
  end
end
