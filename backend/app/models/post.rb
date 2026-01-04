class Post < ApplicationRecord
  belongs_to :user
  has_many :post_tags, dependent: :destroy
  has_many :groups, through: :post_tags
  has_many_attached :images do |attachable|
    attachable.variant :thumb, resize_to_limit: [300, 300]
    attachable.variant :medium, resize_to_limit: [800, 800]
  end

  validates :title, presence: true, length: {maximum: 200}
  validates :caption, length: {maximum: 2000}, allow_blank: true
  validate :acceptable_images

  scope :recent, -> { order(created_at: :desc) }
  scope :with_associations, -> { includes(:user, :groups, images_attachments: :blob) }

  after_commit :generate_image_variants, on: [:create, :update]

  private

  def acceptable_images
    return unless images.attached?

    if images.count > 10
      errors.add(:images, "cannot attach more than 10 images")
    end

    images.each do |image|
      unless image.content_type.in?(%w[image/jpeg image/jpg image/png image/gif image/webp])
        errors.add(:images, "must be a JPEG, PNG, GIF, or WebP image")
      end

      if image.byte_size > 5.megabytes
        errors.add(:images, "must be less than 5MB")
      end
    end
  end

  def generate_image_variants
    return unless images.attached?

    images.each do |image|
      image.variant(:thumb).processed
      image.variant(:medium).processed
    rescue => e
      Rails.logger.error("Failed to generate variants for image #{image.id}: #{e.message}")
    end
  end
end
