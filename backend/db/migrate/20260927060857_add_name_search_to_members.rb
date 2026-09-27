class AddNameSearchToMembers < ActiveRecord::Migration[8.0]
  def change
    add_column :members, :stage_name_search, :virtual,
      type: :string,
      as: "regexp_replace(lower(stage_name), '[^a-z0-9]'::text, ''::text, 'g'::text)",
      stored: true

    add_column :members, :full_name_search, :virtual,
      type: :string,
      as: "regexp_replace(lower(coalesce(full_name, '')), '[^a-z0-9]'::text, ''::text, 'g'::text)",
      stored: true

    add_index :members, :stage_name_search, using: :gin, opclass: :gin_trgm_ops, name: "index_members_on_stage_name_search_trgm"
    add_index :members, :full_name_search, using: :gin, opclass: :gin_trgm_ops, name: "index_members_on_full_name_search_trgm"
  end
end
