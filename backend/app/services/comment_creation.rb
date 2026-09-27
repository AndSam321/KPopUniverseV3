class CommentCreation
  def initialize(comment)
    @comment = comment
  end

  def call
    award_points
    notify_post_author
    notify_parent_author
    enqueue_image_processing
    comment
  end

  private

  attr_reader :comment

  def award_points
    comment.user.award_points(:create_comment)
  end

  def notify_post_author
    return if comment.parent && comment.parent.user_id == comment.post.user_id

    ActivityNotifier.call(
      recipient: comment.post.user,
      actor: comment.user,
      notifiable: comment,
      action: "commented",
      preference: :comments,
      muted_check_post: comment.post
    )
  end

  def notify_parent_author
    return unless comment.parent

    ActivityNotifier.call(
      recipient: comment.reply_to_user || comment.parent.user,
      actor: comment.user,
      notifiable: comment,
      action: "replied",
      preference: :replies,
      muted_check_post: comment.post
    )
  end

  def enqueue_image_processing
    return unless comment.image.attached? && !comment.gif?

    ProcessCommentImageJob.perform_later(comment.id)
  end
end
