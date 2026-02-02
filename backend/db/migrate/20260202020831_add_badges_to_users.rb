class AddBadgesToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :badges, :jsonb, default: []
    add_index :users, :badges, using: :gin
    add_index :users, :idol_points
    add_index :users, :title
  end
end
