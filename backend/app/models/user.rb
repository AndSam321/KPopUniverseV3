class User < ApplicationRecord
  include Pointable

  devise :database_authenticatable, :registerable,
           :recoverable, :rememberable, :validatable, :trackable,
           :jwt_authenticatable, :omniauthable,
           jwt_revocation_strategy: JwtDenylist,
           omniauth_providers: [ :google_oauth2 ]

  has_one_attached :avatar

  has_many :posts, dependent: :destroy
  has_many :groups, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :liked_post, through: :likes, source: :post
  has_many :comments, dependent: :destroy
  has_many :notifications, foreign_key: :recipient_id, dependent: :destroy
  has_many :muted_groups, dependent: :destroy
  has_many :muted_group_records, through: :muted_groups, source: :group

  def notifications_enabled?(type)
    notification_preferences&.dig(type.to_s) != false
  end

  def muted_group?(group_id)
    muted_groups.exists?(group_id: group_id)
  end

  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
  validate :acceptable_avatar, if: -> { avatar.attached? }

  ALLOWED_AVATAR_TYPES = %w[image/jpeg image/png image/gif image/webp].freeze
  MAX_AVATAR_SIZE = 5.megabytes

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.password = Devise.friendly_token[0, 20]
      user.username = auth.info.name&.parameterize || "user_#{SecureRandom.hex(4)}"
      user.avatar_url = auth.info.image
    end
  end

  def profile_avatar_url
    if avatar.attached?
      Rails.application.routes.url_helpers.rails_blob_url(avatar, only_path: true)
    else
      avatar_url
    end
  end

  def jwt_payload
    { "user_id" => id, "username" => username, "email" => email }
  end

  private

  def acceptable_avatar
    unless avatar.blob.content_type.in?(ALLOWED_AVATAR_TYPES)
      errors.add(:avatar, "must be a JPEG, PNG, GIF, or WEBP image")
    end

    if avatar.blob.byte_size > MAX_AVATAR_SIZE
      errors.add(:avatar, "must be less than 5MB")
    end
  end
end
