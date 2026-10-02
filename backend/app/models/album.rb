class Album < ApplicationRecord
  belongs_to :group

  validates :title, presence: true

  scope :newest_first, -> { order(Arel.sql("release_date DESC NULLS LAST"), id: :desc) }
end
