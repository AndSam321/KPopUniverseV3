import React, { useState } from "react";
import "./CommentItem.css";

const CommentItem = ({ comment, onReply, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText("");
      setShowReplyForm(false);
      setShowReplies(true);
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`comment-item ${depth > 0 ? "comment-item--nested" : ""}`}>
      <div className="comment-item__content">
        <div className="comment-item__avatar">
          {comment.user.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={comment.user.username}
              className="comment-item__avatar-img"
            />
          ) : (
            <div className="comment-item__avatar-placeholder">
              {comment.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="comment-item__body">
          <div className="comment-item__header">
            <span className="comment-item__username">
              {comment.user.username}
            </span>
            <span className="comment-item__dot">•</span>
            <span className="comment-item__timestamp">
              {formatDate(comment.created_at)}
            </span>
          </div>

          <p className="comment-item__text">{comment.content}</p>

          <div className="comment-item__actions">
            <button
              className="comment-item__action-btn"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </button>

            {hasReplies && (
              <button
                className="comment-item__action-btn"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? "Hide" : "View"} {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {showReplyForm && (
            <form
              onSubmit={handleSubmitReply}
              className="comment-item__reply-form"
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.user.username}...`}
                className="comment-item__reply-input"
                rows="2"
                maxLength={5000}
              />
              <div className="comment-item__reply-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText("");
                  }}
                  className="comment-item__reply-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !replyText.trim()}
                  className="comment-item__reply-submit"
                >
                  {isSubmitting ? "Posting..." : "Reply"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {hasReplies && showReplies && (
        <div className="comment-item__replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
