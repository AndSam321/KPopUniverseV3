class MessageSerializer
  def self.call(message)
    {
      id: message.id,
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      sender: sender_json(message.sender),
      body: message.body,
      image: image_json(message),
      created_at: message.created_at
    }
  end

  def self.sender_json(user)
    {id: user.id, username: user.username, avatar_url: user.profile_avatar_url}
  end
  private_class_method :sender_json

  def self.image_json(message)
    return {url: message.image_url, thumbnail_url: message.image_url, is_gif: true} if message.image_url.present?
    return nil unless message.image.attached?

    {
      url: attachment_url(message.image),
      thumbnail_url: thumbnail_url(message),
      is_gif: message.image.content_type == "image/gif"
    }
  end
  private_class_method :image_json

  def self.thumbnail_url(message)
    return attachment_url(message.image) if message.image.content_type == "image/gif"

    attachment_url(message.image.variant(:thumb))
  rescue => e
    Rails.logger.error("Failed to build message thumbnail for #{message.id}: #{e.message}")
    attachment_url(message.image)
  end
  private_class_method :thumbnail_url

  def self.attachment_url(attachment)
    Rails.application.routes.url_helpers.url_for(attachment)
  end
  private_class_method :attachment_url
end
