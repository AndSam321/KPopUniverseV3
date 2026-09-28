class BackfillCommunities < ActiveRecord::Migration[8.0]
  def up
    official_community_per_group
    convert_user_created_groups
    assign_remaining_posts
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private

  def official_community_per_group
    Group.where(user_id: nil).find_each do |group|
      next if Community.exists?(group_id: group.id, official: true)

      Community.create!(group_id: group.id, name: group.name, official: true)
    end
  end

  def convert_user_created_groups
    officials = Group.where(user_id: nil).to_a

    Group.where.not(user_id: nil).find_each do |group|
      parent = officials.select { |o| group.name.match?(/\b#{Regexp.escape(o.name)}\b/i) }
        .max_by { |o| o.name.length }

      if parent
        community = Community.create!(
          group_id: parent.id,
          creator_id: group.user_id,
          name: group.name,
          official: false
        )
        group.posts.find_each do |post|
          post.update_columns(community_id: community.id) if post.community_id.nil?
        end
        group.destroy
      elsif !Community.exists?(group_id: group.id, official: true)
        Community.create!(group_id: group.id, name: group.name, official: true)
      end
    end
  end

  def assign_remaining_posts
    Post.where(community_id: nil).find_each do |post|
      group = post.groups.order(:id).first
      next unless group

      community = Community.find_by(group_id: group.id, official: true)
      post.update_columns(community_id: community.id) if community
    end
  end
end
