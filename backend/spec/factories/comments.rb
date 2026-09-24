FactoryBot.define do
  factory :comment do
    association :user
    association :post
    content { "A sample comment" }
  end
end
