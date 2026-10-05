require "rails_helper"

RSpec.describe InboxChannel, type: :channel do
  let(:alice) { create(:user) }
  let(:bob) { create(:user) }
  let(:conversation) { Conversation.between(alice, bob) }

  it "broadcasts a typing event to the other participant" do
    stub_connection current_user: alice
    subscribe

    expect {
      perform :typing, conversation_id: conversation.id
    }.to have_broadcasted_to(bob).from_channel(InboxChannel)
  end

  it "does not broadcast typing for a conversation the user is not part of" do
    intruder = create(:user)
    stub_connection current_user: intruder
    subscribe

    expect {
      perform :typing, conversation_id: conversation.id
    }.not_to have_broadcasted_to(bob).from_channel(InboxChannel)
  end
end
