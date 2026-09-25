class GroupSpotifySync
  def initialize(client = SpotifyClient.new)
    @client = client
  end

  def call(group)
    artist = fetch_artist(group)
    return false unless artist

    apply_artist(group, artist)
    sync_albums(group, artist["id"])
    group.update!(last_synced_at: Time.current, sync_status: "ok", sync_error: nil)
    true
  end

  private

  attr_reader :client

  def fetch_artist(group)
    return client.artist(group.spotify_id) if group.spotify_id.present?

    client.search_artist(group.name)
  end

  def apply_artist(group, artist)
    group.spotify_id = artist["id"]
    image = artist.dig("images", 0, "url")
    group.logo_url = image if image.present?
    group.save!
  end

  def sync_albums(group, artist_id)
    client.artist_albums(artist_id).each do |album|
      next if album["id"].blank?

      record = find_album(group, album)
      record.spotify_id = album["id"]
      record.update!(
        title: album["name"],
        album_type: album["album_type"],
        release_date: parse_release_date(album),
        cover_url: album.dig("images", 0, "url"),
        external_url: album.dig("external_urls", "spotify")
      )
    end
  end

  def find_album(group, album)
    group.albums.find_by(spotify_id: album["id"]) ||
      group.albums.where("LOWER(title) = ?", album["name"].to_s.downcase).first ||
      group.albums.new
  end

  def parse_release_date(album)
    raw = album["release_date"]
    return nil if raw.blank?

    case album["release_date_precision"]
    when "year" then Date.new(raw.to_i, 1, 1)
    when "month" then Date.parse("#{raw}-01")
    else Date.parse(raw)
    end
  rescue ArgumentError
    nil
  end
end
