class AddTrigramSearchIndexes < ActiveRecord::Migration[8.0]
  def change
    enable_extension "pg_trgm"

    add_index :groups, :name, using: :gin, opclass: :gin_trgm_ops, name: "index_groups_on_name_trgm"
    add_index :groups, :korean_name, using: :gin, opclass: :gin_trgm_ops, name: "index_groups_on_korean_name_trgm"
    add_index :members, :stage_name, using: :gin, opclass: :gin_trgm_ops, name: "index_members_on_stage_name_trgm"
    add_index :users, :username, using: :gin, opclass: :gin_trgm_ops, name: "index_users_on_username_trgm"
    add_index :posts, :title, using: :gin, opclass: :gin_trgm_ops, name: "index_posts_on_title_trgm"
    add_index :posts, :caption, using: :gin, opclass: :gin_trgm_ops, name: "index_posts_on_caption_trgm"
  end
end
