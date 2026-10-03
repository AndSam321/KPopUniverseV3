FactoryBot.define do
  factory :conversation do
    association :user_one, factory: :user
    association :user_two, factory: :user
    last_message_at { Time.current }
  end
end
