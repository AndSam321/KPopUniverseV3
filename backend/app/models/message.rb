class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :sender, class_name: "User"

  validates :body, presence: true, length: {maximum: 5000}
  validate :sender_is_participant

  scope :chronological, -> { order(:created_at) }
  scope :unread, -> { where(read_at: nil) }

  def self.unread_count_for(user)
    joins(:conversation)
      .where("conversations.user_one_id = :id OR conversations.user_two_id = :id", id: user.id)
      .where.not(sender_id: user.id)
      .unread
      .count
  end

  def recipient
    conversation.other_participant(sender)
  end

  private

  def sender_is_participant
    return if conversation.blank? || sender_id.nil?
    return if [conversation.user_one_id, conversation.user_two_id].include?(sender_id)

    errors.add(:sender, "must be a conversation participant")
  end
end
