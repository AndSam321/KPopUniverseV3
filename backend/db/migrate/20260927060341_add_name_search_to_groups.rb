class AddNameSearchToGroups < ActiveRecord::Migration[8.0]
  def change
    add_column :groups, :name_search, :virtual,
      type: :string,
      as: "regexp_replace(lower(name), '[^a-z0-9]'::text, ''::text, 'g'::text)",
      stored: true

    add_index :groups, :name_search, using: :gin, opclass: :gin_trgm_ops, name: "index_groups_on_name_search_trgm"
  end
end
