class ScrapeComebacksJob < ApplicationJob
  queue_as :default

  def perform
    ComebackScheduleScraper.call
  end
end
