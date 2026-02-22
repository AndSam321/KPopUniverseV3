class Notification < ApplicationRecord
  belongs_to :recipient, class_name: "User"
  belongs_to :actor, class_name: "User"
  belongs_to :notifiable, polymorphic: true

  validates :action, presence: true

  scope :unread, -> { where(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }

  after_create_commit :broadcast_to_recipient

  def self.mark_all_read!(user)
    where(recipient: user, read_at: nil).update_all(read_at: Time.current)
  end

  private

  def broadcast_to_recipient
    post = case notifiable
    when Like then notifiable.post
    when Comment then notifiable.post
    end

    NotificationChannel.broadcast_to(recipient, {
      id: id,
      action: action,
      read_at: nil,
      created_at: created_at,
      actor: {
        id: actor.id,
        username: actor.username,
        avatar_url: actor.profile_avatar_url
      },
      notifiable_type: notifiable_type,
      notifiable_id: notifiable_id,
      post: post ? {id: post.id, title: post.title} : nil
    })
  end
end
