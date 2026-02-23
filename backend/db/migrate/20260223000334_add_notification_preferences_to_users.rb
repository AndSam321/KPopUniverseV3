class AddNotificationPreferencesToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :notification_preferences, :jsonb, default: {
      likes: true,
      comments: true,
      replies: true
    }, null: false
  end
end
