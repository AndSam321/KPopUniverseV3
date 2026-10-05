class CreateFeedbacks < ActiveRecord::Migration[8.0]
  def change
    create_table :feedbacks do |t|
      t.text :message, null: false
      t.references :user, null: true, foreign_key: true

      t.timestamps
    end
  end
end
