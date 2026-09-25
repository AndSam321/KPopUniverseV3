require "rails_helper"

RSpec.describe EnqueueGroupSyncsJob do
  include ActiveJob::TestHelper

  around do |example|
    original = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    example.run
    ActiveJob::Base.queue_adapter = original
  end

  it "enqueues a sync job for every group" do
    create_list(:group, 3)

    expect { described_class.perform_now }
      .to have_enqueued_job(SyncGroupDataJob).exactly(3).times
  end
end
