class CreateGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :groups do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.string :logo_url

      t.timestamps
    end
    add_index :groups, :slug, unique: true
    add_index :groups, :name
  end
end
