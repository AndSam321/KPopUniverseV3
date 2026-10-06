require "net/http"
require "json"

# Verifies a Cloudflare Turnstile token. Inert until TURNSTILE_SECRET_KEY is set,
# so the app behaves normally before keys are configured.
class TurnstileVerifier
  VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify".freeze

  def self.configured?
    ENV["TURNSTILE_SECRET_KEY"].present?
  end

  def self.verify(token:, remote_ip: nil)
    return true unless configured?
    return false if token.blank?

    siteverify(token, remote_ip).fetch("success", false) == true
  rescue StandardError => e
    Rails.logger.warn("[Turnstile] verification error: #{e.class}: #{e.message}")
    true # fail open on infrastructure errors — the signup rate limit still applies
  end

  def self.siteverify(token, remote_ip)
    uri = URI(VERIFY_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 3
    http.read_timeout = 3

    request = Net::HTTP::Post.new(uri)
    request.set_form_data({secret: ENV["TURNSTILE_SECRET_KEY"], response: token, remoteip: remote_ip}.compact)
    JSON.parse(http.request(request).body)
  end
  private_class_method :siteverify
end
