class AddSyncFieldsToGroupsAndAlbums < ActiveRecord::Migration[8.0]
  def change
    add_column :groups, :spotify_id, :string
    add_column :groups, :last_synced_at, :datetime
    add_column :groups, :sync_status, :string, default: "pending", null: false
    add_column :groups, :sync_error, :text
    add_index :groups, :spotify_id, unique: true

    add_column :albums, :spotify_id, :string
    add_index :albums, :spotify_id, unique: true
  end
end
