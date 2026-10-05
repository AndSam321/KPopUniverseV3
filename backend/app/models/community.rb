class Community < ApplicationRecord
  include PgSearch::Model

  pg_search_scope :search,
    against: :name,
    using: {tsearch: {prefix: true}, trigram: {threshold: 0.3}}

  belongs_to :group, optional: true
  belongs_to :creator, class_name: "User", optional: true

  has_many :community_memberships, dependent: :destroy
  has_many :members, through: :community_memberships, source: :user
  has_many :posts, dependent: :nullify

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true

  scope :official, -> { where(official: true) }
  scope :popular, -> { order(member_count: :desc) }

  before_validation :generate_slug, if: -> { name.present? && slug.blank? }

  private

  def generate_slug
    base = name.parameterize.presence || "community"
    candidate = base
    suffix = 1
    while Community.where.not(id: id).exists?(slug: candidate)
      suffix += 1
      candidate = "#{base}-#{suffix}"
    end
    self.slug = candidate
  end
end
