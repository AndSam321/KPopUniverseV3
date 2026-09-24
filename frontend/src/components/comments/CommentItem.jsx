import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { likeComment } from "../../api/commentsApi";
import CommentComposer from "./CommentComposer";
import ImageLightbox from "./ImageLightbox";
import "./CommentItem.css";

const CommentItem = ({ comment, onReply, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isLiked, setIsLiked] = useState(comment.is_liked || false);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    setIsLiked(comment.is_liked || false);
    setLikesCount(comment.likes_count || 0);
  }, [comment.is_liked, comment.likes_count]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((new Date() - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    if (isLiking) return;

    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    setIsLiking(true);

    try {
      const res = await likeComment(comment.id);
      setIsLiked(res.liked);
      setLikesCount(res.likes_count);
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplySubmit = async (payload) => {
    await onReply(comment.id, payload);
    setShowReplyForm(false);
    setShowReplies(true);
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
            <span className="comment-item__username">{comment.user.username}</span>
            <span className="comment-item__dot">•</span>
            <span className="comment-item__timestamp">
              {formatDate(comment.created_at)}
            </span>
          </div>

          {(comment.content || comment.reply_to) && (
            <p className="comment-item__text">
              {comment.reply_to && (
                <span className="comment-item__mention">
                  @{comment.reply_to.username}{" "}
                </span>
              )}
              {comment.content}
            </p>
          )}

          {comment.image && (
            <button
              type="button"
              className="comment-item__media"
              onClick={() => setShowLightbox(true)}
            >
              <img
                src={comment.image.thumbnail_url}
                alt="comment attachment"
                loading="lazy"
              />
            </button>
          )}

          <div className="comment-item__actions">
            <button
              className={`comment-item__like ${isLiked ? "comment-item__like--active" : ""}`}
              onClick={handleLike}
              disabled={isLiking}
              aria-label={isLiked ? "Unlike comment" : "Like comment"}
            >
              <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

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
            <div className="comment-item__reply-form">
              <CommentComposer
                onSubmit={handleReplySubmit}
                placeholder={`Reply to ${comment.user.username}...`}
                submitLabel="Reply"
                onCancel={() => setShowReplyForm(false)}
                autoFocus
                compact
              />
            </div>
          )}
        </div>
      </div>

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

      {showLightbox && comment.image && (
        <ImageLightbox
          src={comment.image.url}
          alt="comment attachment"
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );
};

export default CommentItem;
