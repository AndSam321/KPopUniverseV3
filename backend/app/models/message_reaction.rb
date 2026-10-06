class MessageReaction < ApplicationRecord
  ALLOWED = %w[💜 ❤️ 😂 😮 😢 🔥 👍].freeze

  belongs_to :message
  belongs_to :user

  validates :emoji, presence: true, inclusion: {in: ALLOWED}
  validates :user_id, uniqueness: {scope: [:message_id, :emoji]}
end
