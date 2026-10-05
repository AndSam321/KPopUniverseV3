class AddGroupFieldsToConversations < ActiveRecord::Migration[8.0]
  def change
    add_column :conversations, :name, :string
    add_column :conversations, :group, :boolean, null: false, default: false
    add_reference :conversations, :creator, null: true, foreign_key: {to_table: :users}

    change_column_null :conversations, :user_one_id, true
    change_column_null :conversations, :user_two_id, true
  end
end
