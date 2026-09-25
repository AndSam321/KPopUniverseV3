class SyncGroupDataJob < ApplicationJob
  queue_as :default

  def perform(group_id)
    group = Group.find_by(id: group_id)
    return unless group

    GroupSpotifySync.new.call(group)
  rescue => e
    group&.update(sync_status: "error", sync_error: e.message.truncate(500))
    Rails.logger.error("SyncGroupDataJob failed for group #{group_id}: #{e.message}")
  end
end
