require "rails_helper"

RSpec.describe "Rack::Attack throttling", type: :request do
  around do |example|
    original = Rack::Attack.cache.store
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    Rack::Attack.reset!
    example.run
    Rack::Attack.cache.store = original
  end

  it "throttles repeated login attempts from one IP" do
    11.times do
      post "/api/v1/auth/sign_in", params: {user: {email: "x@example.com", password: "nope"}}
    end

    expect(response).to have_http_status(:too_many_requests)
    expect(JSON.parse(response.body)["message"]).to match(/too many/i)
  end
end
