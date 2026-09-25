namespace :kpop do
  desc "Sync every group's metadata and discography from Spotify"
  task sync: :environment do
    Group.find_each do |group|
      print "Syncing #{group.name}... "
      SyncGroupDataJob.perform_now(group.id)
      group.reload
      puts "#{group.sync_status} (#{group.albums.count} albums)"
      sleep 1
    end
  end

  desc "Backfill members from Wikidata for groups that have none"
  task sync_members: :environment do
    sync = GroupMemberSync.new
    Group.find_each do |group|
      print "Members for #{group.name}... "
      begin
        filled = sync.call(group)
        puts filled ? "added #{group.members.count}" : "skipped"
      rescue => e
        puts "error: #{e.message}"
      end
      sleep 1
    end
  end
end
