class Api::V1::NotificationsController < Api::V1::BaseController
  before_action :authenticate_user!

  def index
    notifications = current_user.notifications.recent.includes(:actor, :notifiable)
    notifications = notifications.unread if params[:unread] == "true"
    pagy, records = pagy(notifications, items: 20)

    render json: {
      status: "success",
      data: records.map { |n| notification_data(n) },
      unread_count: current_user.notifications.unread.count,
      pagination: {
        current_page: pagy.page,
        total_pages: pagy.pages,
        total_count: pagy.count
      }
    }
  end

  def mark_all_read
    Notification.mark_all_read!(current_user)
    render json: {status: "success"}
  end

  def mark_read
    notification = current_user.notifications.find(params[:id])
    notification.update!(read_at: Time.current)
    render json: {status: "success"}
  end

  def unread_count
    render json: {
      status: "success",
      unread_count: current_user.notifications.unread.count
    }
  end

  private

  def notification_data(notification)
    {
      id: notification.id,
      action: notification.action,
      read_at: notification.read_at,
      created_at: notification.created_at,
      actor: {
        id: notification.actor.id,
        username: notification.actor.username,
        avatar_url: notification.actor.profile_avatar_url
      },
      notifiable_type: notification.notifiable_type,
      notifiable_id: notification.notifiable_id,
      post: extract_post(notification)
    }
  end

  def extract_post(notification)
    case notification.notifiable
    when Like
      post = notification.notifiable.post
    when Comment
      post = notification.notifiable.post
    end

    return nil unless post

    {id: post.id, title: post.title}
  end
end
