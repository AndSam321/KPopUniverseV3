class Conversation < ApplicationRecord
  belongs_to :user_one, class_name: "User", optional: true
  belongs_to :user_two, class_name: "User", optional: true
  belongs_to :creator, class_name: "User", optional: true

  has_many :conversation_participants, dependent: :destroy
  has_many :participants, through: :conversation_participants, source: :user
  has_many :messages, dependent: :destroy

  validate :distinct_pair

  scope :for_user, ->(user) {
    joins(:conversation_participants).where(conversation_participants: {user_id: user.id})
  }
  scope :with_activity, -> { where.not(last_message_at: nil) }
  scope :recent_first, -> { order(Arel.sql("last_message_at DESC NULLS LAST")) }

  def self.between(user_a, user_b)
    one, two = [user_a, user_b].minmax_by(&:id)
    conversation = create_or_find_by(user_one_id: one.id, user_two_id: two.id)
    conversation.ensure_participants([one, two])
    conversation
  end

  def ensure_participants(users)
    users.each { |user| conversation_participants.find_or_create_by(user:) }
  end

  def participant?(user)
    return true if [user_one_id, user_two_id].include?(user.id)

    conversation_participants.exists?(user_id: user.id)
  end

  def other_participants(user)
    participants.reject { |participant| participant.id == user.id }
  end

  def other_participant(user)
    other_participants(user).first
  end

  def title_for(user)
    return name if name.present?

    other_participants(user).map(&:username).to_sentence
  end

  def unread_count_for(user)
    participant = conversation_participants.find_by(user_id: user.id)
    return 0 unless participant

    unread = messages.where.not(sender_id: user.id)
    unread = unread.where("created_at > ?", participant.last_read_at) if participant.last_read_at
    unread.count
  end

  def mark_read_for(user)
    conversation_participants.where(user_id: user.id).update_all(last_read_at: Time.current)
  end

  private

  def distinct_pair
    return if user_one_id.blank? || user_two_id.blank?

    errors.add(:base, "cannot start a conversation with yourself") if user_one_id == user_two_id
  end
end
