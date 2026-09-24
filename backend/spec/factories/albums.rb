FactoryBot.define do
  factory :album do
    association :group
    sequence(:title) { |n| "Album #{n}" }
    album_type { "album" }
    release_date { "2023-01-01" }
  end
end
