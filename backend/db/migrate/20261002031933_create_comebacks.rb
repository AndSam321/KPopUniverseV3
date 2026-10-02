class CreateComebacks < ActiveRecord::Migration[8.0]
  def change
    create_table :comebacks do |t|
      t.string :artist_name, null: false
      t.references :group, null: true, foreign_key: true
      t.string :title, null: false
      t.string :title_track
      t.string :release_type
      t.date :comeback_date, null: false
      t.string :source_url

      t.timestamps
    end

    add_index :comebacks, [:comeback_date, :artist_name, :title], unique: true, name: "index_comebacks_on_date_artist_title"
    add_index :comebacks, :comeback_date
  end
end
