require "rails_helper"

RSpec.describe ProfileBroadcaster do
  it "broadcasts the user's progression snapshot to their profile channel" do
    user = create(:user, idol_points: 120, title: "Rising Star")

    expect { described_class.call(user) }
      .to have_broadcasted_to(user)
      .from_channel(ProfileChannel)
      .with(hash_including("type" => "profile", "title" => "Rising Star", "idol_points" => 120))
  end
end
