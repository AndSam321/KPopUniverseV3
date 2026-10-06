class SyncGroupsJob < ApplicationJob
  include ActiveJob::Continuable

  queue_as :default

  # Transient Spotify/network failures: retry the whole job. The continuation
  # resumes at the group it left off on, so already-synced groups are skipped.
  TRANSIENT_ERRORS = [
    SpotifyClient::Error,
    Net::OpenTimeout,
    Net::ReadTimeout,
    Errno::ECONNRESET,
    SocketError
  ].freeze

  retry_on(*TRANSIENT_ERRORS, wait: :polynomially_longer, attempts: 5)

  # Space out groups so a single run doesn't trip Spotify's rate limit.
  THROTTLE_SECONDS = Rails.env.test? ? 0 : 1

  def perform
    step :sync_groups do |step|
      Group.where("id > ?", step.cursor || 0).order(:id).each do |group|
        sync_group(group)
        step.set!(group.id)
        sleep(THROTTLE_SECONDS)
      end
    end
  end

  private

  def sync_group(group)
    GroupSpotifySync.new.call(group)
  rescue *TRANSIENT_ERRORS
    raise # bubble up to retry_on; cursor isn't advanced past this group, so it resumes here
  rescue => e
    group.update(
      sync_status: "error",
      sync_error: e.message.to_s.truncate(500),
      last_synced_at: Time.current
    )
    Rails.logger.error("[SyncGroupsJob] #{group.name} (##{group.id}): #{e.class}: #{e.message}")
  end
end
