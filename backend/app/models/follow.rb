class Follow < ApplicationRecord
  belongs_to :follower, class_name: "User"
  belongs_to :followed, class_name: "User"

  validates :follower_id, uniqueness: {scope: :followed_id}
  validate :cannot_follow_self

  after_create_commit :notify_followed

  private

  def cannot_follow_self
    errors.add(:followed_id, "can't follow yourself") if follower_id == followed_id
  end

  def notify_followed
    return unless followed.notifications_enabled?(:follows)

    Notification.create!(
      recipient: followed,
      actor: follower,
      notifiable: self,
      action: "followed"
    )
  end
end
