class Api::V1::ComebacksController < Api::V1::BaseController
  def index
    scope = Album.released.includes(:group).chronological

    if params[:group_type].present?
      scope = scope.where(groups: {group_type: params[:group_type]}).references(:group)
    end

    @pagy, @albums = pagy(scope, items: params[:per_page] || 30)

    render json: {
      data: @albums.map { |album| release_json(album) },
      meta: {
        current_page: @pagy.page,
        total_pages: @pagy.pages,
        total_count: @pagy.count
      }
    }
  end

  private

  def release_json(album)
    {
      id: album.id,
      title: album.title,
      album_type: album.album_type,
      release_date: album.release_date,
      cover_url: album.cover_url,
      external_url: album.external_url,
      group: {
        id: album.group.id,
        name: album.group.name,
        slug: album.group.slug,
        group_type: album.group.group_type
      }
    }
  end
end
