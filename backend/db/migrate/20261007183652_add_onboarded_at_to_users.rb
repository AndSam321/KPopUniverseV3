class AddOnboardedAtToUsers < ActiveRecord::Migration[8.1]
  def up
    add_column :users, :onboarded_at, :datetime

    # Existing users have already joined communities, so backfill them as
    # onboarded. Only new signups (onboarded_at IS NULL) see the flow.
    execute("UPDATE users SET onboarded_at = NOW() WHERE onboarded_at IS NULL")
  end

  def down
    remove_column :users, :onboarded_at
  end
end
