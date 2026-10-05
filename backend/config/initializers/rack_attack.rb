require "digest"

class Rack::Attack
  # Backed by solid_cache in production; a no-op where the cache store is null (dev/test default).
  Rack::Attack.cache.store = Rails.cache

  # Identify the client for authenticated writes by their JWT (so one account can't
  # dodge limits by rotating IPs), falling back to IP for anonymous requests.
  def self.client_key(req)
    token = req.get_header("HTTP_AUTHORIZATION").to_s.split(" ").last
    token.present? ? "tok:#{Digest::SHA256.hexdigest(token)[0, 20]}" : "ip:#{req.ip}"
  end

  # Heavy writes that can attach many images to S3 — the main cost driver.
  # (Posts allow up to 10 images; comments are lighter and throttled separately.)
  def self.upload_write?(req)
    path = req.path
    (req.post? && path.end_with?("/posts")) ||
      ((req.patch? || req.put?) && path.match?(%r{/posts/\d+\z})) ||
      (req.patch? && path.end_with?("/users/update_profile"))
  end

  # Global safety net: cap total requests per IP.
  throttle("req/ip", limit: 300, period: 5.minutes) do |req|
    req.ip unless req.path.start_with?("/up")
  end

  # Sustained-abuse timeout: an IP that blows far past the global cap is held off
  # for the rest of the hour.
  throttle("req/ip/sustained", limit: 1500, period: 1.hour) do |req|
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

  # Cap image-bearing writes (posts, post edits, comments, avatar) — these hit S3.
  # Two windows: a burst limit and a sustained hourly limit, keyed per account.
  throttle("uploads/burst", limit: 8, period: 1.minute) do |req|
    client_key(req) if upload_write?(req)
  end

  throttle("uploads/hour", limit: 60, period: 1.hour) do |req|
    client_key(req) if upload_write?(req)
  end

  # Comments are lighter (one image max) and more frequent in active threads —
  # generous enough for real discussion, tight enough to stop bot floods.
  throttle("comments/client", limit: 15, period: 1.minute) do |req|
    client_key(req) if req.post? && req.path.match?(%r{/posts/\d+/comments\z})
  end

  throttle("comments/client/hour", limit: 150, period: 1.hour) do |req|
    client_key(req) if req.post? && req.path.match?(%r{/posts/\d+/comments\z})
  end

  # Avatar changes are rare for real users; keep them tight.
  throttle("avatar/hour", limit: 12, period: 1.hour) do |req|
    client_key(req) if req.patch? && req.path.end_with?("/users/update_profile")
  end

  # Public feedback endpoint — guard against spam flooding the table.
  throttle("feedback/ip", limit: 6, period: 1.hour) do |req|
    req.ip if req.post? && req.path.end_with?("/feedbacks")
  end

  # Curb scripted like-bombing (posts and comments).
  throttle("likes/client", limit: 60, period: 1.minute) do |req|
    client_key(req) if req.post? && req.path.match?(%r{/(posts|comments)/\d+/like\z})
  end

  # Curb mass-follow bots.
  throttle("follows/client", limit: 40, period: 1.hour) do |req|
    client_key(req) if req.post? && req.path.match?(%r{/users/\d+/follow\z})
  end

  self.throttled_responder = lambda do |req|
    match_data = req.env["rack.attack.match_data"] || {}
    period = match_data[:period].to_i
    now = match_data[:epoch_time] || Time.now.to_i
    retry_after = period.zero? ? 60 : (period - (now % period))

    headers = {
      "Content-Type" => "application/json",
      "Retry-After" => retry_after.to_s
    }
    body = {
      status: "error",
      message: "Too many requests. Please slow down and try again in #{retry_after} seconds."
    }.to_json
    [429, headers, [body]]
  end
end

Rails.application.config.middleware.use Rack::Attack
