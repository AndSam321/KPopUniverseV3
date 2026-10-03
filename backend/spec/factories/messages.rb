FactoryBot.define do
  factory :message do
    association :conversation
    sender { conversation.user_one }
    body { "Hey there!" }
  end
end
