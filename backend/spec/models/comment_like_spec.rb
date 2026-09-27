require "rails_helper"

RSpec.describe CommentLike, type: :model do
  describe "associations and validations" do
    subject { build(:comment_like) }

    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:comment) }

    it "is unique per user and comment" do
      like = create(:comment_like)
      duplicate = build(:comment_like, user: like.user, comment: like.comment)

      expect(duplicate).not_to be_valid
    end
  end

  describe "counter cache" do
    it "increments the comment likes_count on create" do
      comment = create(:comment)

      expect { create(:comment_like, comment: comment) }
        .to change { comment.reload.likes_count }.by(1)
    end

    it "decrements the comment likes_count on destroy" do
      like = create(:comment_like)
      comment = like.comment

      expect { like.destroy }.to change { comment.reload.likes_count }.by(-1)
    end
  end
end
