module Pointable
  extend ActiveSupport::Concern

  POINT_VALUES = {
    create_post: 10,
    receive_like: 1,
    create_comment: 2,
    create_group: 25
  }.freeze

  def award_points(action)
    points = POINT_VALUES[action] || 0
    increment!(:idol_points, points)
    update_title_if_needed
  end

  private

  def update_title_if_needed
    new_title = calculate_title
    update_column(:title, new_title) if title != new_title
  end

  def calculate_title
    case idol_points
    when 0...100 then "Trainee"
    when 100...500 then "Rising Star"
    when 500...2000 then "Idol"
    else "Superstar"
    end
  end
end