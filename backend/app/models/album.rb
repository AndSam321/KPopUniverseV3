class Album < ApplicationRecord
  belongs_to :group

  validates :title, presence: true

  scope :newest_first, -> { order(Arel.sql("release_date DESC NULLS LAST"), id: :desc) }
  scope :released, -> { where.not(release_date: nil) }
  scope :chronological, -> { order(release_date: :desc, id: :desc) }
end
