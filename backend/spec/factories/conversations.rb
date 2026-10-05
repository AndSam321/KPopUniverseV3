FactoryBot.define do
  factory :conversation do
    association :user_one, factory: :user
    association :user_two, factory: :user
    last_message_at { Time.current }

    after(:create) do |conversation|
      conversation.ensure_participants([conversation.user_one, conversation.user_two].compact)
    end

    factory :group_conversation do
      user_one { nil }
      user_two { nil }
      group { true }
      name { "Group chat" }
      association :creator, factory: :user

      transient do
        members { [] }
      end

      after(:create) do |conversation, evaluator|
        conversation.ensure_participants([conversation.creator, *evaluator.members].compact)
      end
    end
  end
end
