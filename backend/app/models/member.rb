class Member < ApplicationRecord
  belongs_to :group

  validates :stage_name, presence: true

  scope :ordered, -> { order(:sort_order, :id) }
end
