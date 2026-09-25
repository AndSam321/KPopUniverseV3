class EnqueueGroupSyncsJob < ApplicationJob
  queue_as :default

  def perform
    Group.find_each { |group| SyncGroupDataJob.perform_later(group.id) }
  end
end
