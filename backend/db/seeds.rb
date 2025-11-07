puts "Cleaning database..."
User.destroy_all

puts "Creating baseline users..."

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
puts "#{User.count} users in database"
puts "\nTest credentials:"
puts "  Email: test1@kpop.com"
puts "  Password: password123"
puts "\n  (All test users use 'password123' as password)"
