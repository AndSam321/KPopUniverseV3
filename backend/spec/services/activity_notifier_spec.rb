require "rails_helper"

RSpec.describe ActivityNotifier do
  let(:recipient) { create(:user) }
  let(:actor) { create(:user) }
  let(:post_record) { create(:post, user: recipient) }
  let(:like) { create(:like, post: post_record, user: actor) }

  def notify(**overrides)
    described_class.call(**{
      recipient: recipient,
      actor: actor,
      notifiable: like,
      action: "liked",
      preference: :likes
    }.merge(overrides))
  end

  it "creates a notification for the recipient" do
    expect { notify }
      .to change { Notification.where(action: "liked", recipient: recipient).count }.by(1)
  end

  it "does not notify when the actor is the recipient" do
    expect { notify(actor: recipient) }.not_to change(Notification, :count)
  end

  it "does not notify when the recipient disabled the preference" do
    recipient.update!(notification_preferences: {"likes" => false})

    expect { notify }.not_to change(Notification, :count)
  end

  it "does not notify when the post is in a group the recipient muted" do
    group = create(:group)
    muted_post = create(:post, user: recipient, community: create(:community, group: group))
    recipient.muted_groups.create!(group: group)

    expect { notify(muted_check_post: muted_post) }.not_to change(Notification, :count)
  end
end
