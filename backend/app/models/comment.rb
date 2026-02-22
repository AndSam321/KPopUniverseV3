class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post, counter_cache: :comments_count
  belongs_to :parent, class_name: "Comment", optional: true

  has_many :replies, class_name: "Comment", foreign_key: :parent_id, dependent: :destroy

  validates :content, presence: true, length: { maximum: 5000 }

  scope :top_level, -> { where(parent_id: nil) }
  scope :recent, -> { order(created_at: :desc) }

  after_create_commit :award_commenter_points, :notify_post_owner, :notify_parent_author

  private

  def award_commenter_points
    user.award_points(:create_comment)
  end

  def notify_post_owner
    return if user_id == post.user_id
    return if parent.present? && parent.user_id == post.user_id

    Notification.create!(
      recipient: post.user,
      actor: user,
      notifiable: self,
      action: "commented"
    )
  end

  def notify_parent_author
    return unless parent.present?
    return if user_id == parent.user_id

    Notification.create!(
      recipient: parent.user,
      actor: user,
      notifiable: self,
      action: "replied"
    )
  end
end
