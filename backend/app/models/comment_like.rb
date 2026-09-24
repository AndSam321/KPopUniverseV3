class CommentLike < ApplicationRecord
  belongs_to :user
  belongs_to :comment, counter_cache: :likes_count

  validates :user_id, uniqueness: {scope: :comment_id}
  after_create_commit :award_author_points, :notify_author
  after_destroy_commit :remove_author_points

  private

  def award_author_points
    return if user_id == comment.user_id

    comment.user.award_points(:receive_like)
  end

  def notify_author
    return if user_id == comment.user_id
    return unless comment.user.notifications_enabled?(:likes)
    return if comment_in_muted_group?(comment.user)

    Notification.create!(
      recipient: comment.user,
      actor: user,
      notifiable: self,
      action: "liked_comment"
    )
  end

  def comment_in_muted_group?(recipient)
    comment.post.groups.any? { |group| recipient.muted_group?(group.id) }
  end

  def remove_author_points
    return if user_id == comment.user_id

    comment.user.decrement!(:idol_points, Pointable::POINT_VALUES[:receive_like])
    comment.user.send(:update_title_if_needed)
  end
end
