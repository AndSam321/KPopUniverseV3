require "json"

members_file = Rails.root.join("db/seeds/members.json")

if File.exist?(members_file)
  roster = JSON.parse(File.read(members_file))
  new_count = 0

  roster.each do |entry|
    group = Group.find_by(name: entry["name"])
    next unless group

    entry["members"].each do |m|
      record = group.members.find_or_initialize_by(stage_name: m["stage_name"])
      record.full_name = m["full_name"] if m["full_name"].present?
      record.birth_date = m["birth_date"] if m["birth_date"].present?
      record.position = m["position"] if m["position"].present?
      record.photo_url = m["photo_url"] if m["photo_url"].present?
      record.sort_order = m["sort_order"] || 0
      new_count += 1 if record.new_record?
      record.save!
    end
  end

  puts "Seeded members from members.json (#{new_count} new, #{Member.count} total)"
end
