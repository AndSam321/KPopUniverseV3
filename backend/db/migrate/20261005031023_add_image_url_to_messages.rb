class AddImageUrlToMessages < ActiveRecord::Migration[8.0]
  def change
    add_column :messages, :image_url, :string
  end
end
