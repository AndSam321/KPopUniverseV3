class Group < ApplicationRecord
  has_many :post_tags, dependent: :destroy
  has_many :posts, through: :post_tags

  validates :name, presence: true, uniqueness: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, if: -> { name.present? && slug.blank? }

  scope :alphabetical, -> { order(name: :asc) }

  private

  def generate_slug
    self.slug = name.parameterize
  end
end
