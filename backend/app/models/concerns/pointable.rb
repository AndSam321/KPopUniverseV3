module Pointable
  extend ActiveSupport::Concern

  POINT_VALUES = {
    create_post: 10,
    receive_like: 1,
    create_comment: 2,
    create_group: 25
  }.freeze

  TITLE_THRESHOLDS = [
    { min: 0, max: 100, title: "Trainee" },
    { min: 100, max: 500, title: "Rising Star" },
    { min: 500, max: 2000, title: "Idol" },
    { min: 2000, max: Float::INFINITY, title: "Superstar" }
  ].freeze

  def award_points(action)
    points = POINT_VALUES[action] || 0
    increment!(:idol_points, points)
    update_title_if_needed
  end

  def revoke_points(action)
    points = POINT_VALUES[action] || 0
    decrement!(:idol_points, [points, idol_points].min)
    update_title_if_needed
  end

  def points_info
    current = TITLE_THRESHOLDS.find { |t| idol_points >= t[:min] && idol_points < t[:max] }
    current_index = TITLE_THRESHOLDS.index(current)
    next_tier = TITLE_THRESHOLDS[current_index + 1]

    {
      current_points: idol_points,
      current_title: current[:title],
      next_title: next_tier&.dig(:title),
      points_to_next_title: next_tier ? next_tier[:min] - idol_points : 0
    }
  end

  private

  def update_title_if_needed
    new_title = calculate_title
    update_column(:title, new_title) if title != new_title
  end

  def calculate_title
    TITLE_THRESHOLDS.find { |t| idol_points >= t[:min] && idol_points < t[:max] }&.dig(:title) || "Superstar"
  end
end
