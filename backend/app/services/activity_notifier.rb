class ActivityNotifier
  def self.call(recipient:, actor:, notifiable:, action:, preference:, muted_check_post: nil)
    return if recipient == actor
    return unless recipient.notifications_enabled?(preference)
    return if muted_check_post && muted?(recipient, muted_check_post)

    notification = Notification.create!(
      recipient: recipient,
      actor: actor,
      notifiable: notifiable,
      action: action
    )
    broadcast(notification)
    notification
  end

  def self.muted?(recipient, post)
    post.groups.any? { |group| recipient.muted_group?(group.id) }
  end
  private_class_method :muted?

  def self.broadcast(notification)
    NotificationChannel.broadcast_to(notification.recipient, payload(notification))
  end
  private_class_method :broadcast

  def self.payload(notification)
    post = post_for(notification.notifiable)
    {
      id: notification.id,
      action: notification.action,
      read_at: nil,
      created_at: notification.created_at,
      actor: {
        id: notification.actor.id,
        username: notification.actor.username,
        avatar_url: notification.actor.profile_avatar_url
      },
      notifiable_type: notification.notifiable_type,
      notifiable_id: notification.notifiable_id,
      post: post ? {id: post.id, title: post.title} : nil
    }
  end
  private_class_method :payload

  def self.post_for(notifiable)
    case notifiable
    when Like then notifiable.post
    when Comment then notifiable.post
    when CommentLike then notifiable.comment.post
    end
  end
  private_class_method :post_for
end
