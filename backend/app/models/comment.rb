class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post, counter_cache: :comments_count
  belongs_to :parent, class_name: "Comment", optional: true
  belongs_to :reply_to_user, class_name: "User", optional: true

  has_many :replies, class_name: "Comment", foreign_key: :parent_id, dependent: :destroy
  has_many :comment_likes, dependent: :destroy
  has_one_attached :image do |attachable|
    attachable.variant :thumb, resize_to_limit: [400, 400]
  end

  GIPHY_URL = %r{\Ahttps://[\w.-]*giphy\.com/}

  validates :content, length: {maximum: 5000}
  validates :image_url, format: {with: GIPHY_URL, message: "must be a Giphy URL"}, allow_blank: true
  validate :content_or_image_present
  validate :single_image_source
  validate :acceptable_image

  scope :top_level, -> { where(parent_id: nil) }
  scope :recent, -> { order(created_at: :desc) }

  def gif?
    image_url.present? || (image.attached? && image.content_type == "image/gif")
  end

  private

  def content_or_image_present
    return if content.present? || image.attached? || image_url.present?

    errors.add(:base, "Comment must have text or an image")
  end

  def single_image_source
    return unless image.attached? && image_url.present?

    errors.add(:base, "Comment cannot have both an uploaded image and a GIF")
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
