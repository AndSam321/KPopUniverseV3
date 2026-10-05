class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :sender, class_name: "User"

  has_one_attached :image do |attachable|
    attachable.variant :thumb, resize_to_limit: [400, 400]
  end

  GIPHY_URL = %r{\Ahttps://([\w-]+\.)*giphy\.com/\S*\z}

  validates :body, length: {maximum: 5000}
  validates :image_url, format: {with: GIPHY_URL, message: "must be a Giphy URL"}, allow_blank: true
  validate :sender_is_participant
  validate :body_or_image_present
  validate :single_image_source
  validate :acceptable_image

  scope :chronological, -> { order(:created_at) }
  scope :unread, -> { where(read_at: nil) }

  def gif?
    image_url.present? || (image.attached? && image.content_type == "image/gif")
  end

  def self.unread_count_for(user)
    joins(:conversation)
      .where("conversations.user_one_id = :id OR conversations.user_two_id = :id", id: user.id)
      .where.not(sender_id: user.id)
      .unread
      .count
  end

  def recipient
    conversation.other_participant(sender)
  end

  private

  def sender_is_participant
    return if conversation.blank? || sender_id.nil?
    return if [conversation.user_one_id, conversation.user_two_id].include?(sender_id)

    errors.add(:sender, "must be a conversation participant")
  end

  def body_or_image_present
    return if body.present? || image.attached? || image_url.present?

    errors.add(:base, "Message must have text or an image")
  end

  def single_image_source
    return unless image.attached? && image_url.present?

    errors.add(:base, "Message cannot have both an uploaded image and a GIF")
  end

  def acceptable_image
    return unless image.attached?

    unless image.content_type.in?(%w[image/jpeg image/jpg image/png image/gif image/webp])
      errors.add(:image, "must be a JPEG, PNG, GIF, or WebP image")
    end
    if image.byte_size > 5.megabytes
      errors.add(:image, "must be less than 5MB")
    end
  end
end
