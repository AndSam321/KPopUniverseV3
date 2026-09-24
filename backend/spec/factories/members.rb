FactoryBot.define do
  factory :member do
    association :group
    sequence(:stage_name) { |n| "Member #{n}" }
    sort_order { 0 }
  end
end
