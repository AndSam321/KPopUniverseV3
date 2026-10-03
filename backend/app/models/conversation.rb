class Conversation < ApplicationRecord
  belongs_to :user_one, class_name: "User"
  belongs_to :user_two, class_name: "User"
  has_many :messages, dependent: :destroy

  validate :distinct_participants

  scope :for_user, ->(user) { where(user_one: user).or(where(user_two: user)) }
  scope :recent_first, -> { order(Arel.sql("last_message_at DESC NULLS LAST")) }

  def self.between(user_a, user_b)
    one, two = [user_a, user_b].minmax_by(&:id)
    create_or_find_by(user_one_id: one.id, user_two_id: two.id)
  end

  def other_participant(user)
    user_one_id == user.id ? user_two : user_one
  end

  def participant?(user)
    user_one_id == user.id || user_two_id == user.id
  end

  def unread_count_for(user)
    messages.where.not(sender_id: user.id).where(read_at: nil).count
  end

  private

  def distinct_participants
    errors.add(:base, "cannot start a conversation with yourself") if user_one_id == user_two_id
  end
end
