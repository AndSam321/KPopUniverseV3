class AddImageFieldsToComments < ActiveRecord::Migration[8.0]
  def change
    add_column :comments, :image_url, :string
    add_reference :comments, :reply_to_user, null: true, foreign_key: { to_table: :users }
  end
end
