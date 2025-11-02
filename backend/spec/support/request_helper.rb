module RequestHelpers
  def json_response
    JSON.parse(response.body)
  end

  RSpec.configure do |config|
    config.include RequestHelpers, type: :request
  end
end
