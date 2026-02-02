class Like < ApplicationRecord
  belongs_to :user
  belongs_to :post, counter_cache: :likes_count

  validates :user_id, uniqueness: {scope: :post_id}
  after_create_commit :award_post_owner_points
  after_destroy_commit :remove_post_owner_points

  private

  def award_post_owner_points
    post.user.award_points(:receive_like)
  end

  def remove_post_owner_points
    post.user.decrement!(:idol_points, -Pointable::POINT_VALUES[:receive_like])
    post.user.send(:update_title_if_needed)
  end
end
