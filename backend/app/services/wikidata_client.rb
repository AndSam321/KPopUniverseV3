require "net/http"
require "json"

class WikidataClient
  class Error < StandardError; end

  API_URL = "https://www.wikidata.org/w/api.php"
  SPARQL_URL = "https://query.wikidata.org/sparql"
  USER_AGENT = "KPopUniverse/1.0 (https://github.com/AndSam321/KPopUniverseV3)"

  def find_entity_id(name)
    data = get(API_URL, action: "wbsearchentities", search: name, language: "en", type: "item", format: "json", limit: 1)
    data["search"]&.first&.dig("id")
  end

  def group_members(entity_id)
    rows = sparql(members_query(entity_id))
    rows.filter_map do |row|
      stage_name = clean_label(row.dig("memberLabel", "value"))
      next if stage_name.blank?

      {
        stage_name: stage_name,
        birth_date: parse_date(row.dig("dob", "value")),
        photo_url: image_url(row.dig("image", "value"))
      }
    end
  end

  private

  def members_query(entity_id)
    <<~SPARQL
      SELECT ?member ?memberLabel ?dob ?image WHERE {
        wd:#{entity_id} p:P527 ?statement .
        ?statement ps:P527 ?member .
        FILTER NOT EXISTS { ?statement pq:P582 ?endTime. }
        ?member wdt:P31 wd:Q5 .
        OPTIONAL { ?member wdt:P569 ?dob. }
        OPTIONAL { ?member wdt:P18 ?image. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
    SPARQL
  end

  def sparql(query)
    data = get(SPARQL_URL, query: query, format: "json")
    data.dig("results", "bindings") || []
  end

  def get(url, params)
    uri = URI(url)
    uri.query = URI.encode_www_form(params)
    request = Net::HTTP::Get.new(uri)
    request["User-Agent"] = USER_AGENT
    request["Accept"] = "application/json"
    response = with_retries { Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(request) } }
    raise Error, "Wikidata #{response.code}" unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)
  end

  def with_retries(max = 2)
    attempts = 0
    begin
      yield
    rescue Errno::ECONNRESET, Net::OpenTimeout, Net::ReadTimeout, SocketError, EOFError
      attempts += 1
      (sleep(attempts) && retry) if attempts <= max
      raise
    end
  end

  def image_url(raw)
    return nil if raw.blank?

    url = raw.sub(/\Ahttp:/, "https:")
    "#{url}#{url.include?("?") ? "&" : "?"}width=400"
  end

  def clean_label(label)
    return nil if label.blank? || label.match?(/\AQ\d+\z/)

    label.sub(/\s*\(.*\)\z/, "").strip
  end

  def parse_date(value)
    return nil if value.blank?

    Date.parse(value)
  rescue ArgumentError
    nil
  end
end
