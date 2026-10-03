require "net/http"
require "json"
require "cgi"

class ComebackScheduleScraper
  BASE_URL = ENV.fetch("COMEBACK_SCRAPER_BASE_URL", "https://www.kpopcomebacks.com")
  MONTHS_AHEAD = 2
  DEFAULT_REGION = "KR"

  def self.call
    new.call
  end

  def call
    months.sum { |year, month| scrape_month(year, month) }
  end

  private

  def months
    start = Date.current.beginning_of_month
    (0..MONTHS_AHEAD).map { |offset| (start >> offset) }.map { |date| [date.year, date.month] }
  end

  def scrape_month(year, month)
    url = format("%s/calendar/%d/%02d/", BASE_URL, year, month)
    body = fetch(url)
    return 0 unless body

    region_map = regions(body)
    releases(body).count { |item| upsert(item, url, region_map) }
  end

  def regions(body)
    body.scan(%r{<article[^>]*data-region="([A-Z]{2})"[^>]*>(.*?)</article>}m).each_with_object({}) do |(region, inner), map|
      artist = inner[%r{class="artist">(.*?)<}m, 1]
      title = inner[%r{class="release">(.*?)<}m, 1]
      map[region_key(artist, title)] = region if artist && title
    end
  end

  def region_key(artist, title)
    [normalize(artist), normalize(title)]
  end

  def normalize(text)
    CGI.unescapeHTML(text.to_s).strip.downcase
  end

  def fetch(url)
    uri = URI(url)
    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true, open_timeout: 10, read_timeout: 10) do |http|
      http.request(Net::HTTP::Get.new(uri, "User-Agent" => "KPopUniverse/1.0"))
    end
    response.body if response.is_a?(Net::HTTPSuccess)
  rescue => e
    Rails.logger.error("ComebackScheduleScraper fetch failed for #{url}: #{e.message}")
    nil
  end

  def releases(body)
    body.scan(%r{<script type="application/ld\+json">(.*?)</script>}m).flat_map do |(raw)|
      data = parse_json(raw)
      next [] unless data.is_a?(Hash) && data["@type"] == "ItemList"

      Array(data["itemListElement"]).filter_map { |element| element["item"] }
    end
  end

  def parse_json(raw)
    JSON.parse(raw)
  rescue JSON::ParserError
    nil
  end

  def upsert(item, source_url, region_map)
    artist = item.dig("byArtist", "name").to_s.strip
    title = item["name"].to_s.strip
    date = item["datePublished"]
    return false if artist.blank? || title.blank? || date.blank?

    record = Comeback.find_or_initialize_by(comeback_date: date, artist_name: artist, title: title)
    record.title_track = item.dig("track", "name")
    record.release_type = release_type(item["albumReleaseType"])
    record.region = region_map[region_key(artist, title)] || DEFAULT_REGION
    record.source_url = source_url
    record.group = Group.find_by("LOWER(name) = ?", artist.downcase)
    record.save
  end

  def release_type(schema_url)
    return if schema_url.blank?

    schema_url.split("/").last.to_s.sub(/Release\z/, "")
  end
end
