module RequestHelpers
  def json_response
    JSON.parse(response.body)
  end

  def auth_headers(user)
    token = JWT.encode(
      {"sub" => user.id.to_s, "exp" => 1.day.from_now.to_i},
      ENV["DEVISE_JWT_SECRET_KEY"]
    )
    {"Authorization" => "Bearer #{token}"}
  end

  RSpec.configure do |config|
    config.include RequestHelpers, type: :request
  end
end
