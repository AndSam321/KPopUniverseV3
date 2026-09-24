FactoryBot.define do
  factory :post do
    association :user
    sequence(:title) { |n| "Post title #{n}" }
    caption { "A sample caption" }
  end
end
