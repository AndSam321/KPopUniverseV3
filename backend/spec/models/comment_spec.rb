require "rails_helper"

RSpec.describe Comment, type: :model do
  def attach_image(comment, content_type: "image/png", size: 1.kilobyte)
    comment.image.attach(
      io: StringIO.new("x" * size),
      filename: "test.#{content_type.split('/').last}",
      content_type: content_type
    )
  end

  describe "content or image presence" do
    it "is valid with text only" do
      expect(build(:comment, content: "hello")).to be_valid
    end

    it "is valid with an image_url and no text" do
      expect(build(:comment, content: nil, image_url: "https://media.giphy.com/x.gif")).to be_valid
    end

    it "is valid with an uploaded image and no text" do
      comment = build(:comment, content: nil)
      attach_image(comment)

      expect(comment).to be_valid
    end

    it "is invalid with neither text nor image" do
      comment = build(:comment, content: nil)

      expect(comment).not_to be_valid
      expect(comment.errors[:base]).to include("Comment must have text or an image")
    end
  end

  describe "image_url validation" do
    it "accepts a giphy url" do
      expect(build(:comment, image_url: "https://media3.giphy.com/media/abc/giphy.gif")).to be_valid
    end

    it "rejects a non-giphy url" do
      comment = build(:comment, image_url: "https://attacker.example/track.gif")

      expect(comment).not_to be_valid
      expect(comment.errors[:image_url]).to include("must be a Giphy URL")
    end
  end

  describe "image validations" do
    it "rejects a non-image content type" do
      comment = build(:comment)
      attach_image(comment, content_type: "application/pdf")

      expect(comment).not_to be_valid
      expect(comment.errors[:image]).to be_present
    end

    it "rejects an image larger than 5MB" do
      comment = build(:comment)
      attach_image(comment, size: 6.megabytes)

      expect(comment).not_to be_valid
      expect(comment.errors[:image]).to be_present
    end

    it "rejects having both an uploaded image and a gif url" do
      comment = build(:comment, image_url: "https://media.giphy.com/x.gif")
      attach_image(comment)

      expect(comment).not_to be_valid
      expect(comment.errors[:base]).to include("Comment cannot have both an uploaded image and a GIF")
    end
  end

  describe "#gif?" do
    it "is true for a remote gif url" do
      expect(build(:comment, image_url: "https://media.giphy.com/x.gif")).to be_gif
    end

    it "is true for an uploaded gif" do
      comment = build(:comment)
      attach_image(comment, content_type: "image/gif")

      expect(comment).to be_gif
    end

    it "is false for an uploaded png" do
      comment = build(:comment)
      attach_image(comment, content_type: "image/png")

      expect(comment).not_to be_gif
    end
  end
end
