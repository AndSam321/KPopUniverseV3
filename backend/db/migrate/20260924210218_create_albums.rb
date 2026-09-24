class CreateAlbums < ActiveRecord::Migration[8.0]
  def change
    create_table :albums do |t|
      t.references :group, null: false, foreign_key: true
      t.string :title, null: false
      t.string :album_type
      t.date :release_date
      t.string :cover_url
      t.string :external_url

      t.timestamps
    end
  end
end
