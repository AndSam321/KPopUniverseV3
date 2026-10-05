FactoryBot.define do
  factory :conversation_participant do
    association :conversation
    association :user
    last_read_at { nil }
  end
end
