require "net/http"
require "json"

class SpotifyClient
  class Error < StandardError; end

  TOKEN_URL = "https://accounts.spotify.com/api/token"
  API_BASE = "https://api.spotify.com/v1"
  TOKEN_CACHE_KEY = "spotify:access_token"
  ALBUM_PAGE_SIZE = 10
  MAX_ALBUMS = 50
  MAX_RETRIES = 3
  MAX_BACKOFF = 20

  def search_artist(name)
    data = get("/search", q: name, type: "artist", limit: 1, market: "US")
    data.dig("artists", "items")&.first
  end

  def artist(spotify_id)
    get("/artists/#{spotify_id}")
  end

  def artist_albums(spotify_id)
    albums = []
    offset = 0

    loop do
      items = get("/artists/#{spotify_id}/albums",
        include_groups: "album,single,compilation", limit: ALBUM_PAGE_SIZE, offset: offset, market: "US")["items"] || []
      albums.concat(items)
      break if items.size < ALBUM_PAGE_SIZE || albums.size >= MAX_ALBUMS

      offset += ALBUM_PAGE_SIZE
    end

    albums.first(MAX_ALBUMS)
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

  def perform(request, uri, attempt = 1)
    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(request) }
    return JSON.parse(response.body) if response.is_a?(Net::HTTPSuccess)

    if response.code == "429" && attempt <= MAX_RETRIES
      sleep(backoff_seconds(response))
      return perform(request, uri, attempt + 1)
    end

    raise Error, "Spotify #{response.code}: #{response.body}"
  end

  def backoff_seconds(response)
    seconds = response["Retry-After"].to_i
    seconds = 1 if seconds <= 0
    [seconds, MAX_BACKOFF].min
  end
end
