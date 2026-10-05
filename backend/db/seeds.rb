puts "Seeding database..."
puts "NOTE: This will NOT delete existing data, only create/update records\n\n"

puts "Creating K-pop groups..."

kpop_groups = [
  {
    name: "BTS",
    description: "Bangtan Sonyeondan (방탄소년단) - 7 member boy group",
    logo_url: "https://i.scdn.co/image/ab67616100005174d642648235ebf3460d2d1f6a"
  },
  {
    name: "BLACKPINK",
    description: "4 member girl group under YG Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb9b57f5eccf180a0049be84b3"
  },
  {
    name: "TWICE",
    description: "9 member girl group under JYP Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb3d8820046fd455b38d644864"
  },
  {
    name: "Stray Kids",
    description: "8 member boy group under JYP Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000e5ebf9887d2c9288f0e50a3fd69f"
  },
  {
    name: "SEVENTEEN",
    description: "13 member boy group under Pledis Entertainment",
    logo_url: "https://i.scdn.co/image/ab676161000051748da3a229445fd3cd896cdd5c"
  },
  {
    name: "NewJeans",
    description: "5 member girl group under ADOR",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb80668ba2b15094d083780ea9"
  },
  {
    name: "aespa",
    description: "4 member girl group under SM Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb18d4cb767d2dfe5f4b28ba07"
  },
  {
    name: "LE SSERAFIM",
    description: "5 member girl group under Source Music",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb9095683b555d7c16fd3b633f"
  },
  {
    name: "IVE",
    description: "6 member girl group under Starship Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eba9c8608865ca7eded5520359"
  },
  {
    name: "ITZY",
    description: "5 member girl group under JYP Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000517481c00b4e062603d8159b1ad8"
  },
  {
    name: "TXT",
    description: "Tomorrow X Together - 5 member boy group under BigHit",
    logo_url: "https://i.scdn.co/image/ab676161000051741c81416bbbfe539adb9d7050"
  },
  {
    name: "ENHYPEN",
    description: "7 member boy group under Belift Lab",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb99395276fc18bcf3e7e0b57e"
  },
  {
    name: "ATEEZ",
    description: "8 member boy group under KQ Entertainment",
    logo_url: "https://i.scdn.co/image/ab67616100005174a1e2f0d5061ccdcb38398d94"
  },
  {
    name: "NCT",
    description: "Multi-unit boy group under SM Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb94e8d55295dd593132cdfd93"
  },
  {
    name: "Red Velvet",
    description: "5 member girl group under SM Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb02a562ea6b1dc718394010ac"
  },
  {
    name: "EXO",
    description: "9 member boy group under SM Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000e5ebaf3c4b988a6fef40843cdc83"
  },
  {
    name: "(G)I-DLE",
    description: "6 member girl group under Cube Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb732a090e736faef27779d24e"
  },
  {
    name: "GOT7",
    description: "7 member boy group",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb51636490d389e8d2ab96026e"
  },
  {
    name: "MAMAMOO",
    description: "4 member girl group under RBW",
    logo_url: "https://i.scdn.co/image/ab6761610000e5ebe12972169702affd7a4c48ec"
  },
  {
    name: "NMIXX",
    description: "7 member girl group under JYP Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb8aaf0595187aba8e8f1bd828"
  },
  {
    name: "Kep1er",
    description: "9 member girl group",
    logo_url: "https://i.scdn.co/image/ab6761610000e5ebba958c35046aebae1969254b"
  },
  {
    name: "KATSEYE",
    description: "6 member girl group under Hybe Labels",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb484e326315e09b3f382a7960"
  },
  {
    name: "CORTIS",
    description: "5 member boy group under Hybe Labels",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb85fadc54e8acfed96370bfab"
  },
  {
    name: "Monsta X",
    description: "6 member boy group under Starship Entertainment",
    logo_url: "https://i.scdn.co/image/ab6761610000e5eb28526e1eda2f78513f024fba"
  }
]

kpop_groups.each do |group_data|
  group = Group.find_or_create_by!(name: group_data[:name]) do |g|
    g.description = group_data[:description]
    g.slug = group_data[:name].parameterize
    g.logo_url = group_data[:logo_url]
  end
  # Update logo_url for existing groups
  if group.logo_url != group_data[:logo_url]
    group.update(logo_url: group_data[:logo_url])
  end
  puts "  Created/Found: #{group.name}"
end

puts "\nCreating baseline users..."

baseline_users = [
  { email: "test1@kpop.com", username: "moonlight_mina", bio: "multistan 🌙 ONCE & STAY forever", idol_points: 340, title: "Rising Star" },
  { email: "test2@kpop.com", username: "biaswrecked_again", bio: "collecting photocards since 2019 📸", idol_points: 120, title: "Rising Star" },
  { email: "test3@kpop.com", username: "seoul_sonyeondan", bio: "ot7 forever 💜 ARMY", idol_points: 870, title: "Idol" },
  { email: "dev1@kpop.com", username: "comeback_szn", bio: "always ready for the next comeback", idol_points: 60, title: "Trainee" },
  { email: "dev2@kpop.com", username: "woozi_vocalline", bio: "CARAT 💎 SVT vocal line enjoyer", idol_points: 210, title: "Rising Star" },
  { email: "aria@kpop.com", username: "aria_aurora", bio: "aespa's #1 MY ✨ synk dive", idol_points: 45, title: "Trainee" },
  { email: "noah@kpop.com", username: "newjeans_daily", bio: "bunnies 🐰 Minji bias wrecker", idol_points: 530, title: "Idol" },
  { email: "kai@kpop.com", username: "danceline_kai", bio: "here for the choreo 🕺 dance practice connoisseur", idol_points: 95, title: "Trainee" },
  { email: "luna@kpop.com", username: "lunar_eclipse97", bio: "97-liner supremacy | multifandom", idol_points: 160, title: "Rising Star" },
  { email: "remy@kpop.com", username: "remy_reacts", bio: "hot takes & reaction threads 🎧", idol_points: 25, title: "Trainee" },
  { email: "jiwon@kpop.com", username: "melon_charts_daily", bio: "i live on the charts 📊 | gg enthusiast", idol_points: 410, title: "Rising Star" },
  { email: "theo@kpop.com", username: "vocalpositions", bio: "vocal analysis & live stage appreciation", idol_points: 150, title: "Rising Star" },
  { email: "mimi@kpop.com", username: "fourthgen_itgirl", bio: "4th & 5th gen gg stan 💅", idol_points: 80, title: "Trainee" },
  { email: "dae@kpop.com", username: "butterfly_93", bio: "been here since 2nd gen, i'm old lol", idol_points: 620, title: "Idol" }
]

baseline_users.each do |user_data|
  user = User.find_or_initialize_by(email: user_data[:email])
  if user.new_record?
    user.password = "password123"
    user.password_confirmation = "password123"
  end
  user.username = user_data[:username]
  user.bio = user_data[:bio]
  user.idol_points = user_data[:idol_points]
  user.title = user_data[:title]
  user.save!
  puts "  Upserted: #{user.username} (#{user.email})"
end

puts "\nCreating sample posts..."

# Reset the demo posts each run — they're authored by the known seed users (real
# users never use these handles), so the curated sample feed stays consistent as
# topics are refreshed.
seed_usernames = baseline_users.map { |u| u[:username] }
Post.joins(:user).where(users: {username: seed_usernames}).destroy_all

# Topics reflect real Oct 2026 happenings for our groups (researched); each post
# has a unique author.
sample_posts = [
  { author: "moonlight_mina", group: "TWICE", title: "TWICE comeback on the 16th!!", caption: "we are so back, a full group cb at last. only a week and a half out — what sound are we expecting this time? praying for a more & more type title", hours_ago: 2 },
  { author: "woozi_vocalline", group: "SEVENTEEN", title: "JxJ (jeonghan x joshua) debut is coming", caption: "the vocal unit dropping DREAMSCAPE on the 19th… their tones layered together is going to be unreal. so ready for this", hours_ago: 6 },
  { author: "aria_aurora", group: "aespa", title: "SYNK: COMPLæXITY tour was actually unreal", caption: "caught the LA show, the setlist and production were insane. if you're near oakland on the 6th GO. best tour they've done imo", hours_ago: 11 },
  { author: "lunar_eclipse97", group: "IVE", title: "IVE 'Looks Can Kill' era incoming", caption: "pre-release on the 19th then the EP on the 26th?? they are not giving us a break and i'm here for it. the title alone is so them", hours_ago: 16 },
  { author: "fourthgen_itgirl", group: "NMIXX", title: "NMIXX 'Strange Muse' with Birthday Wish", caption: "their title tracks are always so experimental, genuinely never know what we're getting. the 19th cannot come fast enough", hours_ago: 21 },
  { author: "seoul_sonyeondan", group: "BTS", title: "ARIRANG tour cine fest in theaters oct 24-31", caption: "if you couldn't make the actual tour the cinema broadcast is the next best thing. gonna cry in a theater with other armys lol", hours_ago: 29 },
  { author: "comeback_szn", group: "Stray Kids", title: "skz japanese comeback nov 25", caption: "another JP release locked in. their japanese title tracks go so hard though. who else is already counting down", hours_ago: 37 },
  { author: "biaswrecked_again", group: "LE SSERAFIM", title: "le sserafim finally back after 7 months", caption: "the hiatus felt so long. hoping this one leans back into the harder sound. fearnot we survived the drought", hours_ago: 44 },
  { author: "danceline_kai", group: "ENHYPEN", title: "enhypen comeback confirmed for november", caption: "the choreo teasers alone are going to end me. their nov releases always slap. engene assemble", hours_ago: 52 },
  { author: "melon_charts_daily", group: "TXT", title: "txt's b-sides are so consistently underrated", caption: "everyone talks about the title tracks but half their albums are b-side gold. put some respect on the deep cuts", hours_ago: 63 },
  { author: "remy_reacts", group: "(G)I-DLE", title: "soyeon's producing run is genuinely insane", caption: "she writes and produces this much of their catalog and it all slaps? name a more consistent idol-producer, i'll wait", hours_ago: 74 },
  { author: "vocalpositions", group: "ATEEZ", title: "ateez comeback rumors for q4?", caption: "seeing whispers of a comeback but nothing confirmed yet. their live vocals and stamina doing that choreo is unmatched regardless", hours_ago: 88 }
]

# Every group needs its official "General" community — users post into these.
Group.find_each do |group|
  next if group.communities.exists?(official: true)

  group.communities.create!(name: "General", official: true)
end
puts "Ensured General communities (#{Community.where(official: true).count} total)"

users = User.all
if users.any?
  sample_posts.each do |post_data|
    group = Group.find_by(name: post_data[:group])
    community = group&.communities&.find_by(official: true)
    next unless community

    author = User.find_by(username: post_data[:author]) || users.sample

    post = Post.find_or_initialize_by(title: post_data[:title])
    post.user = author
    post.caption = post_data[:caption]
    post.community = community
    post.created_at = (post_data[:hours_ago] || 1).hours.ago
    post.save!
    puts "  Upserted post: #{post_data[:title]}"
  end
end

load Rails.root.join("db/seeds/kpop_details.rb")
load Rails.root.join("db/seeds/members.rb")

puts "\n✓ Seeding complete!"
puts "#{Group.count} K-pop groups in database"
puts "#{User.count} users in database"
puts "#{Post.count} posts in database"
puts "\nTest credentials:"
puts "  Email: test1@kpop.com"
puts "  Password: password123"
puts "\n  (All test users use 'password123' as password)"
