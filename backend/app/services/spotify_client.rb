require "net/http"
require "json"

class SpotifyClient
  class Error < StandardError; end

  TOKEN_URL = "https://accounts.spotify.com/api/token"
  API_BASE = "https://api.spotify.com/v1"
  TOKEN_CACHE_KEY = "spotify:access_token"

  def search_artist(name)
    data = get("/search", q: name, type: "artist", limit: 1, market: "US")
    data.dig("artists", "items")&.first
  end

  def artist(spotify_id)
    get("/artists/#{spotify_id}")
  end

  def artist_albums(spotify_id)
    data = get("/artists/#{spotify_id}/albums", include_groups: "album,single,compilation", limit: 50, market: "US")
    data["items"] || []
  end

  private

  def get(path, params = {})
    uri = URI("#{API_BASE}#{path}")
    uri.query = URI.encode_www_form(params) if params.any?
    request = Net::HTTP::Get.new(uri)
    request["Authorization"] = "Bearer #{access_token}"
    perform(request, uri)
  end

  def access_token
    Rails.cache.fetch(TOKEN_CACHE_KEY, expires_in: 55.minutes) { fetch_token }
  end

  def fetch_token
    uri = URI(TOKEN_URL)
    request = Net::HTTP::Post.new(uri)
    request.set_form_data(grant_type: "client_credentials")
    request.basic_auth(ENV.fetch("SPOTIFY_CLIENT_ID"), ENV.fetch("SPOTIFY_CLIENT_SECRET"))
    perform(request, uri).fetch("access_token")
  end

  def perform(request, uri)
    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(request) }
    raise Error, "Spotify #{response.code}: #{response.body}" unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)
  end
end
