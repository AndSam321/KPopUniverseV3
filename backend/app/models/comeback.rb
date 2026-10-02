class Comeback < ApplicationRecord
  belongs_to :group, optional: true

  validates :artist_name, :title, :comeback_date, presence: true

  scope :upcoming, -> { where(comeback_date: Date.current..).order(:comeback_date) }
  scope :recent, -> { where(comeback_date: ...Date.current).order(comeback_date: :desc) }
end
