class DropPostTags < ActiveRecord::Migration[8.0]
  def up
    drop_table :post_tags
  end

  def down
    create_table :post_tags do |t|
      t.references :post, null: false, foreign_key: true
      t.references :group, null: false, foreign_key: true
      t.timestamps
    end
    add_index :post_tags, [:post_id, :group_id], unique: true
  end
end
