class CreateMembers < ActiveRecord::Migration[8.0]
  def change
    create_table :members do |t|
      t.references :group, null: false, foreign_key: true
      t.string :stage_name, null: false
      t.string :full_name
      t.date :birth_date
      t.string :position
      t.string :photo_url
      t.integer :sort_order, default: 0, null: false

      t.timestamps
    end
  end
end
