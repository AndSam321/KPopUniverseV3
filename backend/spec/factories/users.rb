FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    sequence(:username) { |n| "user#{n}" }
    password { "password123" }
    password_confirmation { "password123" }
    avatar_url { nil }
    bio { nil }
    idol_points { 0 }
    title { "Trainee" }

    # For OAuth users
    trait :with_google_oauth do
      provider { "google_oauth2" }
      sequence(:uid) { |n| "google_uid_#{n}" }
      avatar_url { "https://example.com/avatar.jpg" }
    end
  end
end
