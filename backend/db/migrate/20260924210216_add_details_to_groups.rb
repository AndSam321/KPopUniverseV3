class AddDetailsToGroups < ActiveRecord::Migration[8.0]
  def change
    add_column :groups, :korean_name, :string
    add_column :groups, :company, :string
    add_column :groups, :debut_date, :date
    add_column :groups, :group_type, :string
    add_column :groups, :status, :string, default: "active", null: false
    add_column :groups, :fandom_name, :string
  end
end
