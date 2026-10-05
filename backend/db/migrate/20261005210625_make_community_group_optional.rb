class MakeCommunityGroupOptional < ActiveRecord::Migration[8.0]
  def change
    change_column_null :communities, :group_id, true
  end
end
