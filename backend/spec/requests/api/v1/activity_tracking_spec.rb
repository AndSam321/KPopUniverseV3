require "rails_helper"

RSpec.describe "activity tracking", type: :request do
  let(:user) { create(:user) }

  it "stamps last_active_at on an authenticated request" do
    expect(user.last_active_at).to be_nil

    get "/api/v1/posts/following", headers: auth_headers(user)

    expect(user.reload.last_active_at).to be_present
  end

  it "does not re-stamp within the throttle window" do
    user.update_column(:last_active_at, 1.minute.ago)
    before = user.reload.last_active_at

    get "/api/v1/posts/following", headers: auth_headers(user)

    expect(user.reload.last_active_at).to be_within(1.second).of(before)
  end

  it "does not store an IP address on the account" do
    get "/api/v1/posts/following", headers: auth_headers(user)

    expect(user.reload.current_sign_in_ip).to be_nil
    expect(user.last_sign_in_ip).to be_nil
  end
end
