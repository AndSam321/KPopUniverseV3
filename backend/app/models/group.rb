class Group < ApplicationRecord
  include PgSearch::Model

  pg_search_scope :search,
    against: [:name, :korean_name, :name_search],
    using: {tsearch: {prefix: true}, trigram: {threshold: 0.3}}

  belongs_to :user, optional: true
  has_many :communities, dependent: :destroy
  has_many :posts, through: :communities
  has_many :members, dependent: :destroy
  has_many :albums, dependent: :destroy

  validates :name, presence: true, uniqueness: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, if: -> { name.present? && slug.blank? }

  scope :alphabetical, -> { order(Arel.sql("LOWER(REGEXP_REPLACE(name, '^[^A-Za-z]+', ''))")) }

  private

  def generate_slug
    self.slug = name.parameterize
  end
end
