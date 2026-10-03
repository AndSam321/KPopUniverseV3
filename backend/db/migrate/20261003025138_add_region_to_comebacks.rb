class AddRegionToComebacks < ActiveRecord::Migration[8.0]
  def change
    add_column :comebacks, :region, :string
  end
end
