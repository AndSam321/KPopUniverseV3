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
  { email: "remy@kpop.com", username: "remy_reacts", bio: "hot takes & reaction threads 🎧", idol_points: 25, title: "Trainee" }
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

# Remove the earlier generic sample posts so the seeded feed reads realistically.
OLD_SAMPLE_TITLES = [
  "BTS just announced their comeback!",
  "BLACKPINK's new music video is amazing",
  "Just got into Stray Kids",
  "NewJeans performance was incredible",
  "TWICE concert experience",
  "My favorite K-pop groups",
  "aespa's concept is so unique",
  "ITZY's new album thoughts?",
  # Retired titles from an earlier realistic-seed pass (replaced below)
  "11 years of TWICE 🥹",
  "the b-sides on this mini are underrated",
  "IVE's vocal growth this era is real",
  "dance practice >>> the MV sometimes",
  "hot take: (G)I-DLE has no skips",
  "comeback season predictions?",
  "ATEEZ live vocals are no joke"
]
Post.where(title: OLD_SAMPLE_TITLES).destroy_all

sample_posts = [
  { author: "seoul_sonyeondan", group: "BTS", title: "Jin's solo era is treating us so well", caption: "been replaying the whole thing all week ngl. what's everyone's favorite b-side? i keep coming back to the ballad one", hours_ago: 2 },
  { author: "comeback_szn", group: "Stray Kids", title: "new STAY here — where do I start?", caption: "just fell down the rabbit hole after god's menu and thunderous lol. the discography is huge… do i go chronological or just hit the title tracks first?", hours_ago: 5 },
  { author: "newjeans_daily", group: "NewJeans", title: "the choreo detail in their latest stage", caption: "slowed the dance practice down and the formations are so clean. the footwork is way harder than people give them credit for", hours_ago: 9 },
  { author: "woozi_vocalline", group: "SEVENTEEN", title: "13 members and not one weak link", caption: "the self-producing really is insane. name another group this size where it doesn't feel crowded. woozi carrying fr", hours_ago: 14 },
  { author: "aria_aurora", group: "aespa", title: "aespa's KWANGYA lore is actually elite", caption: "everyone just streams the title tracks but the whole worldbuilding thing is so detailed when you actually dig into it", hours_ago: 21 },
  { author: "moonlight_mina", group: "TWICE", title: "11 years of TWICE and i'm not normal about it", caption: "saw the anniversary pop-up photos and got way too emotional. from the sixteen days to stadiums. once for life", hours_ago: 28 },
  { author: "biaswrecked_again", group: "LE SSERAFIM", title: "the b-sides on this mini are so underrated", caption: "the non-title tracks go so hard, not a single skip for me. everyone sleeps on them and i genuinely don't get it", hours_ago: 34 },
  { author: "lunar_eclipse97", group: "IVE", title: "IVE's live vocals have improved so much", caption: "caught a music show recording and they sounded so stable live. the growth since debut is actually crazy", hours_ago: 45 },
  { author: "danceline_kai", group: "ENHYPEN", title: "hot take: the dance practice > the MV", caption: "the raw practice vids hit different, no cuts just pure sync. wish more of their stages were one-takes honestly", hours_ago: 52 },
  { author: "remy_reacts", group: "(G)I-DLE", title: "(G)I-DLE genuinely has no skips", caption: "soyeon producing banger after banger. the whole discography slaps and i said what i said", hours_ago: 61 },
  { author: "seoul_sonyeondan", group: "BTS", title: "comeback predictions for this year?", caption: "manifesting a full comeback soon. what concept are you hoping for? personally praying for another darker era", hours_ago: 73 },
  { author: "danceline_kai", group: "ATEEZ", title: "ATEEZ live vocals while doing that choreo??", caption: "performing like it's their last stage every single time. the stamina is unreal, how are they not out of breath", hours_ago: 90 }
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
