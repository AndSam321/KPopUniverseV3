FactoryBot.define do
  factory :community do
    association :group
    sequence(:name) { |n| "Community #{n}" }
    official { false }
  end
end
