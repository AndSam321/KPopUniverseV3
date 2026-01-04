class Group < ApplicationRecord
  belongs_to :user, optional: true
  has_many :post_tags, dependent: :destroy
  has_many :posts, through: :post_tags

  validates :name, presence: true, uniqueness: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, if: -> { name.present? && slug.blank? }

  scope :alphabetical, -> { order(Arel.sql("LOWER(REGEXP_REPLACE(name, '^[^A-Za-z]+', ''))")) }

  private

  def generate_slug
    self.slug = name.parameterize
  end
end
