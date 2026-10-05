class BackfillConversationParticipants < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      INSERT INTO conversation_participants (conversation_id, user_id, last_read_at, created_at, updated_at)
      SELECT id, user_one_id, NOW(), NOW(), NOW() FROM conversations WHERE user_one_id IS NOT NULL
      UNION ALL
      SELECT id, user_two_id, NOW(), NOW(), NOW() FROM conversations WHERE user_two_id IS NOT NULL
    SQL
  end

  def down
    execute "DELETE FROM conversation_participants"
  end
end
