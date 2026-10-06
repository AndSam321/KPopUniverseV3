require "rails_helper"

RSpec.describe AdminStats do
  it "counts active users by last_active_at, not sign-in" do
    create(:user, last_active_at: 2.hours.ago)
    create(:user, last_active_at: 3.days.ago)
    create(:user, last_active_at: nil)

    active = described_class.new.call[:active_users]

    expect(active[:day]).to eq(1)
    expect(active[:week]).to eq(2)
    expect(active[:month]).to eq(2)
  end
end
