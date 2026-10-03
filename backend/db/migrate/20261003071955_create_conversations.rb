class CreateConversations < ActiveRecord::Migration[8.0]
  def change
    create_table :conversations do |t|
      t.references :user_one, null: false, foreign_key: {to_table: :users}
      t.references :user_two, null: false, foreign_key: {to_table: :users}
      t.datetime :last_message_at

      t.timestamps
    end

    add_index :conversations, [:user_one_id, :user_two_id], unique: true
    add_index :conversations, :last_message_at
  end
end
