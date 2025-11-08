puts "Cleaning database..."
User.destroy_all
Group.destroy_all
Post.destroy_all

puts "Creating K-pop groups..."

kpop_groups = [
  {name: "BTS", description: "Bangtan Sonyeondan (방탄소년단) - 7 member boy group"},
  {name: "BLACKPINK", description: "4 member girl group under YG Entertainment"},
  {name: "TWICE", description: "9 member girl group under JYP Entertainment"},
  {name: "Stray Kids", description: "8 member boy group under JYP Entertainment"},
  {name: "SEVENTEEN", description: "13 member boy group under Pledis Entertainment"},
  {name: "NewJeans", description: "5 member girl group under ADOR"},
  {name: "aespa", description: "4 member girl group under SM Entertainment"},
  {name: "LE SSERAFIM", description: "5 member girl group under Source Music"},
  {name: "IVE", description: "6 member girl group under Starship Entertainment"},
  {name: "ITZY", description: "5 member girl group under JYP Entertainment"},
  {name: "TXT", description: "Tomorrow X Together - 5 member boy group under BigHit"},
  {name: "ENHYPEN", description: "7 member boy group under Belift Lab"},
  {name: "ATEEZ", description: "8 member boy group under KQ Entertainment"},
  {name: "NCT", description: "Multi-unit boy group under SM Entertainment"},
  {name: "Red Velvet", description: "5 member girl group under SM Entertainment"},
  {name: "EXO", description: "9 member boy group under SM Entertainment"},
  {name: "(G)I-DLE", description: "6 member girl group under Cube Entertainment"},
  {name: "GOT7", description: "7 member boy group"},
  {name: "MAMAMOO", description: "4 member girl group under RBW"},
  {name: "NMIXX", description: "7 member girl group under JYP Entertainment"},
  {name: "Kep1er", description: "9 member girl group"},
  {name: "TREASURE", description: "10 member boy group under YG Entertainment"},
  {name: "THE BOYZ", description: "11 member boy group under IST Entertainment"},
  {name: "Monsta X", description: "6 member boy group under Starship Entertainment"},
  {name: "BTOB", description: "Born To Beat - 6 member boy group"}
]

kpop_groups.each do |group_data|
  group = Group.find_or_create_by!(name: group_data[:name]) do |g|
    g.description = group_data[:description]
    g.slug = group_data[:name].parameterize
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

puts "\n✓ Seeding complete!"
puts "#{Group.count} K-pop groups in database"
puts "#{User.count} users in database"
puts "\nTest credentials:"
puts "  Email: test1@kpop.com"
puts "  Password: password123"
puts "\n  (All test users use 'password123' as password)"
