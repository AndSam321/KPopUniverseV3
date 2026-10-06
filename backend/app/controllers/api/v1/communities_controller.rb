class Api::V1::CommunitiesController < Api::V1::BaseController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_current_user_optional, only: [:index, :show]

  rescue_from ActiveRecord::RecordNotFound do
    render json: {error: "Not found"}, status: :not_found
  end

  def index
    communities = params[:group_id] ? group_communities : browse_communities
    render json: {data: serialize(communities)}
  end

  def show
    community = Community.includes(:group).find(params[:id])
    render json: {data: serialize([community]).first}
  end

  def create
    community = CommunityCreation.new(target_group, current_user).call(community_params)

    if community.persisted?
      render json: {data: serialize([community.reload]).first}, status: :created
    else
      render json: {errors: community.errors.full_messages}, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotUnique
    render json: {errors: ["Community name is taken"]}, status: :unprocessable_entity
  end

  def join
    community = Community.includes(:group).find(params[:id])
    current_user.community_memberships.find_or_create_by(community: community)
    render json: {data: serialize([community.reload]).first}
  rescue ActiveRecord::RecordNotUnique
    render json: {data: serialize([Community.includes(:group).find(params[:id])]).first}
  end

  def leave
    community = Community.includes(:group).find(params[:id])
    current_user.community_memberships.find_by(community: community)&.destroy
    render json: {data: serialize([community.reload]).first}
  end

  def mine
    communities = current_user.joined_communities.includes(:group).popular
    render json: {data: serialize(communities)}
  end

  private

  def target_group
    params[:group_id] ? Group.find(params[:group_id]) : nil
  end

  def group_communities
    Group.find(params[:group_id]).communities.includes(:group).order(official: :desc).popular
  end

  def browse_communities
    scope = Community.includes(:group)
    # The public directory hides official communities (shown via their groups),
    # but the post-composer picker needs them too.
    scope = scope.where(official: false) unless params[:include_official] == "true"
    return scope.search(params[:q]) if params[:q].present?
    return scope.order(created_at: :desc) if params[:sort] == "new"

    scope.popular
  end

  def community_params
    params.permit(:name, :description)
  end

  def serialize(communities)
    member_ids = joined_ids(communities)
    communities.map { |community| community_json(community, member_ids) }
  end

  def joined_ids(communities)
    return Set.new unless current_user

    current_user.community_memberships
      .where(community_id: communities.map(&:id))
      .pluck(:community_id)
      .to_set
  end

  def community_json(community, member_ids)
    {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      official: community.official,
      member_count: community.member_count,
      group: community.group ? {id: community.group_id, name: community.group.name} : nil,
      is_member: member_ids.include?(community.id)
    }
  end
end
