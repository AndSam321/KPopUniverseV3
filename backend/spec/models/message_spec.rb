require "rails_helper"

RSpec.describe Message do
  def attach_image(message, content_type: "image/png", size: 1.kilobyte)
    message.image.attach(
      io: StringIO.new("x" * size),
      filename: "test.#{content_type.split("/").last}",
      content_type: content_type
    )
  end

  it "rejects a body over 5000 characters" do
    expect(build(:message, body: "a" * 5001)).not_to be_valid
  end

  it "is invalid with neither text nor an image" do
    expect(build(:message, body: nil)).not_to be_valid
  end

  it "is valid with a GIF url and no text" do
    expect(build(:message, body: nil, image_url: "https://media.giphy.com/x.gif")).to be_valid
  end

  it "is valid with an uploaded image and no text" do
    message = build(:message, body: nil)
    attach_image(message)

    expect(message).to be_valid
  end

  it "rejects both an uploaded image and a GIF url" do
    message = build(:message, body: "hi", image_url: "https://media.giphy.com/x.gif")
    attach_image(message)

    expect(message).not_to be_valid
  end

  it "rejects a non-giphy image url" do
    expect(build(:message, image_url: "https://evil.com/x.gif")).not_to be_valid
  end

  it "rejects a sender who is not a participant" do
    conversation = create(:conversation)
    outsider = create(:user)

    expect(build(:message, conversation:, sender: outsider)).not_to be_valid
  end

  describe "#recipient" do
    it "is the participant who did not send the message" do
      conversation = create(:conversation)
      message = create(:message, conversation:, sender: conversation.user_one)

      expect(message.recipient).to eq(conversation.user_two)
    end
  end

  describe "scopes" do
    it "orders chronologically and filters unread" do
      conversation = create(:conversation)
      older = create(:message, conversation:, created_at: 1.hour.ago, read_at: Time.current)
      newer = create(:message, conversation:, created_at: Time.current, read_at: nil)

      expect(conversation.messages.chronological).to eq([older, newer])
      expect(conversation.messages.unread).to eq([newer])
    end
  end
end
