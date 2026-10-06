require "json"

albums_file = Rails.root.join("db/seeds/albums.json")

if File.exist?(albums_file)
  catalog = JSON.parse(File.read(albums_file))
  new_count = 0

  catalog.each do |group_name, albums|
    group = Group.find_by(name: group_name)
    next unless group

    albums.each do |a|
      record =
        (a["spotify_id"].present? && group.albums.find_by(spotify_id: a["spotify_id"])) ||
        group.albums.find_by("LOWER(title) = ?", a["title"].to_s.downcase) ||
        group.albums.new

      record.spotify_id = a["spotify_id"] if a["spotify_id"].present?
      record.title = a["title"]
      record.album_type = a["album_type"]
      record.release_date = a["release_date"]
      record.cover_url = a["cover_url"]
      record.external_url = a["external_url"]
      new_count += 1 if record.new_record?
      record.save!
    end
  end

  puts "Seeded discography from albums.json (#{new_count} new, #{Album.count} total)"
end
