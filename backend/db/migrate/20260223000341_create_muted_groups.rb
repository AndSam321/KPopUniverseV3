class CreateMutedGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :muted_groups do |t|
      t.references :user, null: false, foreign_key: true
      t.references :group, null: false, foreign_key: true

      t.timestamps
    end

    add_index :muted_groups, [:user_id, :group_id], unique: true
  end
end
