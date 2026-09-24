class ProcessCommentImageJob < ApplicationJob
  queue_as :default

  discard_on ActiveJob::DeserializationError

  def perform(comment_id)
    comment = Comment.find_by(id: comment_id)
    return unless comment&.image&.attached?
    return if comment.gif?

    comment.image.variant(:thumb).processed
  end
end
