class ChangeAlbumSpotifyIdIndexToComposite < ActiveRecord::Migration[8.0]
  def change
    remove_index :albums, :spotify_id
    add_index :albums, [:group_id, :spotify_id], unique: true
  end
end
