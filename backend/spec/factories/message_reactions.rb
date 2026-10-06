FactoryBot.define do
  factory :message_reaction do
    association :message
    association :user
    emoji { "💜" }
  end
end
