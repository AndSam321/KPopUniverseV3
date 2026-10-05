class Rack::Attack
  # Backed by solid_cache in production; a no-op where the cache store is null (dev/test default).
  Rack::Attack.cache.store = Rails.cache

  # Global safety net: cap total requests per IP.
  throttle("req/ip", limit: 300, period: 5.minutes) do |req|
    req.ip unless req.path.start_with?("/up")
  end

  # Brute-force protection on login.
  throttle("logins/ip", limit: 10, period: 1.minute) do |req|
    req.ip if req.post? && req.path.end_with?("/auth/sign_in")
  end

  # Limit new account creation per IP.
  throttle("signups/ip", limit: 5, period: 1.hour) do |req|
    req.ip if req.post? && req.path.end_with?("/auth")
  end

  # Limit password-reset requests per IP.
  throttle("password_resets/ip", limit: 5, period: 1.hour) do |req|
    req.ip if req.post? && req.path.end_with?("/auth/password")
  end

  # Throttle message sending to curb DM spam.
  throttle("messages/ip", limit: 30, period: 1.minute) do |req|
    req.ip if req.post? && req.path.match?(%r{/conversations/\d+/messages\z})
  end

  # Throttle starting new conversations/groups.
  throttle("conversations/ip", limit: 20, period: 1.hour) do |req|
    req.ip if req.post? && req.path.end_with?("/conversations")
  end

  self.throttled_responder = lambda do |_req|
    headers = {"Content-Type" => "application/json"}
    body = {status: "error", message: "Too many requests. Please slow down and try again shortly."}.to_json
    [429, headers, [body]]
  end
end

Rails.application.config.middleware.use Rack::Attack
