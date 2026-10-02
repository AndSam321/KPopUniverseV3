FactoryBot.define do
  factory :comeback do
    sequence(:artist_name) { |n| "Artist #{n}" }
    sequence(:title) { |n| "Release #{n}" }
    comeback_date { Date.current }
    release_type { "Album" }
  end
end
