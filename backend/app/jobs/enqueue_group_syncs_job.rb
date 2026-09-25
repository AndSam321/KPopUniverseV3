class EnqueueGroupSyncsJob < ApplicationJob
  queue_as :default

  STAGGER = 30.seconds

  def perform
    Group.find_each.with_index do |group, index|
      SyncGroupDataJob.set(wait: index * STAGGER).perform_later(group.id)
    end
  end
end
