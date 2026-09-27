class Member < ApplicationRecord
  include PgSearch::Model

  pg_search_scope :search,
    against: [:stage_name],
    using: {tsearch: {prefix: true}, trigram: {threshold: 0.3}}

  belongs_to :group

  validates :stage_name, presence: true

  scope :ordered, -> { order(:sort_order, :id) }
end
