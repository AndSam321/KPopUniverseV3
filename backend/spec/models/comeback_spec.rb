require "rails_helper"

RSpec.describe Comeback, type: :model do
  it "separates upcoming and recent by date" do
    future = create(:comeback, comeback_date: Date.current + 5)
    past = create(:comeback, comeback_date: Date.current - 5)

    expect(Comeback.upcoming).to include(future)
    expect(Comeback.upcoming).not_to include(past)
    expect(Comeback.recent).to include(past)
    expect(Comeback.recent).not_to include(future)
  end
end
