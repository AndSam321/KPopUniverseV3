class User < ApplicationRecord
  include Pointable
  include PgSearch::Model

  pg_search_scope :search,
    against: [:username],
    using: {tsearch: {prefix: true}, trigram: {threshold: 0.3}}

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
  has_many :comment_likes, dependent: :destroy
  has_many :notifications, foreign_key: :recipient_id, dependent: :destroy
  has_many :muted_groups, dependent: :destroy
  has_many :muted_group_records, through: :muted_groups, source: :group

  has_many :community_memberships, dependent: :destroy
  has_many :joined_communities, through: :community_memberships, source: :community
  has_many :created_communities, class_name: "Community", foreign_key: :creator_id, dependent: :nullify

  has_many :active_follows, class_name: "Follow", foreign_key: :follower_id, dependent: :destroy
  has_many :passive_follows, class_name: "Follow", foreign_key: :followed_id, dependent: :destroy
  has_many :following, through: :active_follows, source: :followed
  has_many :followers, through: :passive_follows, source: :follower

  has_many :conversations_as_one, class_name: "Conversation", foreign_key: :user_one_id, dependent: :destroy
  has_many :conversations_as_two, class_name: "Conversation", foreign_key: :user_two_id, dependent: :destroy
  has_many :conversation_participants, dependent: :destroy
  has_many :sent_messages, class_name: "Message", foreign_key: :sender_id, dependent: :destroy

  def friends
    User.where(id: active_follows.select(:followed_id))
      .where(id: passive_follows.select(:follower_id))
  end

  def following?(user)
    active_follows.exists?(followed_id: user.id)
  end

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

  AVATAR_SIZE = 400

  DEFAULT_AVATAR_COUNT = 8

  def profile_avatar_url
    if avatar.attached?
      return Rails.application.routes.url_helpers.rails_representation_url(
        avatar.variant(resize_to_fill: [AVATAR_SIZE, AVATAR_SIZE])
      )
    end

    avatar_url.presence || default_avatar_url
  end

  # Deterministic fallback so every user has a branded avatar (frontend-hosted).
  def default_avatar_url
    "/avatars/avatar-#{(id || 0) % DEFAULT_AVATAR_COUNT + 1}.png"
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
