class AllowNullContentOnComments < ActiveRecord::Migration[8.0]
  def change
    change_column_null :comments, :content, true
  end
end
