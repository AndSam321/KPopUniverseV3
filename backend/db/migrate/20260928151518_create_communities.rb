class CreateCommunities < ActiveRecord::Migration[8.0]
  def change
    create_table :communities do |t|
      t.references :group, null: false, foreign_key: true
      t.references :creator, null: true, foreign_key: {to_table: :users}
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.boolean :official, null: false, default: false
      t.integer :member_count, null: false, default: 0

      t.timestamps
    end

    add_index :communities, :slug, unique: true
  end
end
