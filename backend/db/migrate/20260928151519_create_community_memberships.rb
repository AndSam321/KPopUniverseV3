class CreateCommunityMemberships < ActiveRecord::Migration[8.0]
  def change
    create_table :community_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :community, null: false, foreign_key: true

      t.timestamps
    end

    add_index :community_memberships, [:user_id, :community_id], unique: true
  end
end
