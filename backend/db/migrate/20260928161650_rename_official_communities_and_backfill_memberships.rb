class RenameOfficialCommunitiesAndBackfillMemberships < ActiveRecord::Migration[8.0]
  def up
    Community.where(official: true).update_all(name: "General")

    Community.where.not(creator_id: nil).find_each do |community|
      CommunityMembership.find_or_create_by!(user_id: community.creator_id, community_id: community.id)
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
