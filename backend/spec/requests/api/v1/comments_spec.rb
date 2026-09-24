require "rails_helper"

RSpec.describe "Comments API", type: :request do
  let(:author) { create(:user) }
  let(:post_record) { create(:post) }

  describe "POST /api/v1/posts/:post_id/comments" do
    it "creates a top-level comment" do
      post "/api/v1/posts/#{post_record.id}/comments",
        params: {content: "great post"}, headers: auth_headers(author)

      expect(response).to have_http_status(:created)
      expect(json_response["data"]["content"]).to eq("great post")
      expect(json_response["data"]["likes_count"]).to eq(0)
      expect(json_response["data"]["is_liked"]).to be(false)
    end

    it "creates an image-only comment from a gif url" do
      post "/api/v1/posts/#{post_record.id}/comments",
        params: {image_url: "https://media.giphy.com/x.gif"}, headers: auth_headers(author)

      expect(response).to have_http_status(:created)
      expect(json_response["data"]["image"]["is_gif"]).to be(true)
      expect(json_response["data"]["image"]["url"]).to eq("https://media.giphy.com/x.gif")
    end

    it "rejects an empty comment" do
      post "/api/v1/posts/#{post_record.id}/comments",
        params: {content: ""}, headers: auth_headers(author)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "requires authentication" do
      post "/api/v1/posts/#{post_record.id}/comments", params: {content: "hi"}

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "flattened threading" do
    let(:root_author) { create(:user) }
    let(:replier) { create(:user) }
    let(:nested_replier) { create(:user) }
    let!(:root) { create(:comment, post: post_record, user: root_author) }

    it "attaches a direct reply to the top-level comment" do
      post "/api/v1/posts/#{post_record.id}/comments",
        params: {content: "reply", parent_id: root.id}, headers: auth_headers(replier)

      expect(json_response["data"]["parent_id"]).to eq(root.id)
      expect(json_response["data"]["reply_to"]).to be_nil
    end

    it "re-points a reply-to-a-reply onto the root and records who was replied to" do
      reply = create(:comment, post: post_record, user: replier, parent: root)

      post "/api/v1/posts/#{post_record.id}/comments",
        params: {content: "nested", parent_id: reply.id}, headers: auth_headers(nested_replier)

      expect(json_response["data"]["parent_id"]).to eq(root.id)
      expect(json_response["data"]["reply_to"]["username"]).to eq(replier.username)
    end
  end

  describe "liking comments" do
    let!(:comment) { create(:comment, post: post_record, user: author) }
    let(:liker) { create(:user) }

    it "likes a comment" do
      post "/api/v1/comments/#{comment.id}/like", headers: auth_headers(liker)

      expect(response).to have_http_status(:ok)
      expect(json_response["liked"]).to be(true)
      expect(json_response["likes_count"]).to eq(1)
    end

    it "toggles a like off when liked again" do
      post "/api/v1/comments/#{comment.id}/like", headers: auth_headers(liker)
      post "/api/v1/comments/#{comment.id}/like", headers: auth_headers(liker)

      expect(json_response["liked"]).to be(false)
      expect(json_response["likes_count"]).to eq(0)
    end

    it "unlikes via DELETE" do
      create(:comment_like, comment: comment, user: liker)

      delete "/api/v1/comments/#{comment.id}/unlike", headers: auth_headers(liker)

      expect(json_response["liked"]).to be(false)
      expect(json_response["likes_count"]).to eq(0)
    end
  end

  describe "uploaded image comments" do
    include ActiveJob::TestHelper

    around do |example|
      original = ActiveJob::Base.queue_adapter
      ActiveJob::Base.queue_adapter = :test
      example.run
      ActiveJob::Base.queue_adapter = original
    end

    it "accepts an uploaded image and enqueues variant processing" do
      file = fixture_file_upload("test.png", "image/png")

      expect {
        post "/api/v1/posts/#{post_record.id}/comments",
          params: {image: file}, headers: auth_headers(author)
      }.to have_enqueued_job(ProcessCommentImageJob)

      expect(response).to have_http_status(:created)
      expect(json_response["data"]["image"]["is_gif"]).to be(false)
      expect(json_response["data"]["image"]["thumbnail_url"]).to be_present
    end
  end

  describe "GET /api/v1/posts/:post_id/comments" do
    let!(:comment) { create(:comment, post: post_record, user: author) }
    let(:liker) { create(:user) }

    it "marks comments the current user has liked" do
      create(:comment_like, comment: comment, user: liker)

      get "/api/v1/posts/#{post_record.id}/comments", headers: auth_headers(liker)

      expect(json_response["data"].first["is_liked"]).to be(true)
    end

    it "returns is_liked false for anonymous requests" do
      create(:comment_like, comment: comment, user: liker)

      get "/api/v1/posts/#{post_record.id}/comments"

      expect(json_response["data"].first["is_liked"]).to be(false)
    end
  end
end
