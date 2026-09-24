require "rails_helper"

RSpec.describe Like, type: :model do
  let(:author) { create(:user) }
  let!(:post_record) { create(:post, user: author) }
  let(:liker) { create(:user) }

  it "awards the post author a point on like" do
    expect { create(:like, post: post_record, user: liker) }
      .to change { author.reload.idol_points }.by(Pointable::POINT_VALUES[:receive_like])
  end

  it "removes the awarded point on unlike" do
    like = create(:like, post: post_record, user: liker)

    expect { like.destroy }
      .to change { author.reload.idol_points }.by(-Pointable::POINT_VALUES[:receive_like])
  end
end
