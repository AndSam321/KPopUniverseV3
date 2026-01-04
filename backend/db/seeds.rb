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
  {
    email: "test1@kpop.com",
    username: "kpop_fan_1",
    password: "password123",
    bio: "Just a K-pop enthusiast",
    title: "Trainee",
    idol_points: 0
  },
  {
    email: "test2@kpop.com",
    username: "idol_lover_2",
    password: "password123",
    bio: "Momo's biggest fan",
    title: "Trainee",
    idol_points: 0
  },
  {
    email: "test3@kpop.com",
    username: "lightstick_collector",
    password: "password123",
    bio: "jungkookie",
    title: "Trainee",
    idol_points: 0
  },
  {
    email: "dev1@kpop.com",
    username: "developer_1",
    password: "password123",
    bio: "andrew",
    title: "Trainee",
    idol_points: 0
  },
  {
    email: "dev2@kpop.com",
    username: "developer_2",
    password: "password123",
    bio: "kevin",
    title: "Trainee",
    idol_points: 0
  }
]

baseline_users.each do |user_data|
  user = User.find_or_create_by!(email: user_data[:email]) do |u|
    u.username = user_data[:username]
    u.password = user_data[:password]
    u.password_confirmation = user_data[:password]
    u.bio = user_data[:bio]
    u.title = user_data[:title]
    u.idol_points = user_data[:idol_points]
  end
  puts "  Created/Found: #{user.username} (#{user.email})"
end

puts "\nCreating sample posts..."

sample_posts = [
  {
    title: "BTS just announced their comeback!",
    caption: "I'm so excited for the new album! Who else is ready for this? 💜",
    group_names: ["BTS"]
  },
  {
    title: "BLACKPINK's new music video is amazing",
    caption: "The visuals, the choreography, everything is perfect! 🖤💗",
    group_names: ["BLACKPINK"]
  },
  {
    title: "Just got into Stray Kids",
    caption: "Any song recommendations for a new STAY? I've been obsessed with God's Menu!",
    group_names: ["Stray Kids"]
  },
  {
    title: "NewJeans performance was incredible",
    caption: "Their stage presence is unmatched! Rookie of the year for sure 🐰",
    group_names: ["NewJeans"]
  },
  {
    title: "TWICE concert experience",
    caption: "Just came back from their concert and I'm still crying. Best night of my life! 🍭",
    group_names: ["TWICE"]
  },
  {
    title: "My favorite K-pop groups",
    caption: "Can't decide between BTS, SEVENTEEN, and ATEEZ. All three are incredible!",
    group_names: ["BTS", "SEVENTEEN", "ATEEZ"]
  },
  {
    title: "aespa's concept is so unique",
    caption: "The whole AI concept and their music style is revolutionary in K-pop 🤖",
    group_names: ["aespa"]
  },
  {
    title: "ITZY's new album thoughts?",
    caption: "What's everyone's favorite track? Mine is definitely the title track!",
    group_names: ["ITZY"]
  }
]

users = User.all
if users.any?
  sample_posts.each do |post_data|
    user = users.sample
    post = user.posts.create!(
      title: post_data[:title],
      caption: post_data[:caption]
    )

    # Add groups to the post
    post_data[:group_names].each do |group_name|
      group = Group.find_by(name: group_name)
      post.groups << group if group
    end

    puts "  Created post: #{post.title}"
  end
end

puts "\n✓ Seeding complete!"
puts "#{Group.count} K-pop groups in database"
puts "#{User.count} users in database"
puts "#{Post.count} posts in database"
puts "\nTest credentials:"
puts "  Email: test1@kpop.com"
puts "  Password: password123"
puts "\n  (All test users use 'password123' as password)"
