namespace :kpop do
  desc "Sync every group's metadata and discography from Spotify"
  task sync: :environment do
    Group.find_each do |group|
      print "Syncing #{group.name}... "
      SyncGroupDataJob.perform_now(group.id)
      group.reload
      puts "#{group.sync_status} (#{group.albums.count} albums)"
    end
  end
end
