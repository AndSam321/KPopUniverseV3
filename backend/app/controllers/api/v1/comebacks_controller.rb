class Api::V1::ComebacksController < Api::V1::BaseController
  def index
    scope = Comeback.includes(:group)

    if params[:q].present?
      scope = scope.where("artist_name ILIKE :q OR title ILIKE :q", q: "%#{params[:q]}%")
    end

    render json: {
      upcoming: scope.upcoming.map { |comeback| comeback_json(comeback) },
      recent: scope.recent.limit(60).map { |comeback| comeback_json(comeback) }
    }
  end

  private

  def comeback_json(comeback)
    {
      id: comeback.id,
      artist_name: comeback.artist_name,
      title: comeback.title,
      title_track: comeback.title_track,
      release_type: comeback.release_type,
      comeback_date: comeback.comeback_date,
      region: comeback.region,
      source_url: comeback.source_url,
      group: comeback.group ? {id: comeback.group.id, name: comeback.group.name, slug: comeback.group.slug} : nil
    }
  end
end
