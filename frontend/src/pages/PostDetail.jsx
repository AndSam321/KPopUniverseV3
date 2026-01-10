import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPost } from "../api/postsApi";
import { getComments, createComment } from "../api/commentsApi";
import { likePost } from "../api/postsApi";
import CommentItem from "../components/comments/CommentItem";
import "./PostDetail.css";

const FLAIRS = {
  discussion: { label: "Discussion", color: "#757bc8" },
  question: { label: "Question", color: "#6ee7d8" },
  music: { label: "Music", color: "#ff6fb1" },
  news: { label: "News", color: "#ffd166" },
  media: { label: "Media/Photos", color: "#9fa0ff" },
  "fan-content": { label: "Fan Content", color: "#ff8ccf" },
};

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  const fetchPostAndComments = async () => {
    try {
      setLoading(true);
      const [postData, commentsResponse] = await Promise.all([
        getPost(id),
        getComments(id),
      ]);
      setPost(postData);
      setIsLiked(postData.is_liked || false);
      setLikesCount(postData.likes_count || 0);
      setComments(commentsResponse.data || []);
    } catch (err) {
      setError("Failed to load post. Please try again.");
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await createComment(id, newComment.trim());
      setComments([response.data, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error("Error creating comment:", err);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      const response = await createComment(id, content, parentId);
      const commentsResponse = await getComments(id);
      setComments(commentsResponse.data || []);
    } catch (err) {
      console.error("Error creating reply:", err);
      throw err;
    }
  };

  const handleLikeClick = async () => {
    if (isLiking) return;

    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    setIsLiking(true);

    try {
      const response = await likePost(id);
      setIsLiked(response.liked);
      setLikesCount(response.likes_count);
    } catch (error) {
      console.error("Failed to like post:", error);
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentClick = () => {
    const commentForm = document.querySelector(".post-detail__comment-form");
    if (commentForm) {
      commentForm.scrollIntoView({ behavior: "smooth", block: "center" });
      const textarea = commentForm.querySelector("textarea");
      if (textarea) {
        setTimeout(() => textarea.focus(), 300);
      }
    }
  };

  if (loading) {
    return <div className="post-detail__loading">Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div className="post-detail__error">{error || "Post not found"}</div>
    );
  }

  return (
    <div className="post-detail">
      <div className="post-detail__header">
        <button onClick={() => navigate(-1)} className="post-detail__back">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="20"
            height="20"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Post Content */}
      <div className="post-detail__post">
        {/* Group badge */}
        {post.groups && post.groups.length > 0 && (
          <div
            className="post-detail__group"
            onClick={() => navigate(`/groups/${post.groups[0].id}`)}
            style={{ cursor: "pointer" }}
          >
            {post.groups[0].name}
          </div>
        )}

        {/* Author and time */}
        <div className="post-detail__meta">
          Posted by @{post.user.username} •{" "}
          {new Date(post.created_at).toLocaleString()}
          {post.flair && FLAIRS[post.flair] && (
            <>
              {" • "}
              <span
                className="post-detail__flair"
                style={{
                  color: FLAIRS[post.flair].color,
                  borderColor: FLAIRS[post.flair].color,
                  backgroundColor: `${FLAIRS[post.flair].color}15`,
                }}
              >
                {FLAIRS[post.flair].label}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="post-detail__title">{post.title}</h1>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="post-detail__images">
            {post.images.map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt={post.title}
                className="post-detail__image"
              />
            ))}
          </div>
        )}

        {/* Caption */}
        {post.caption && <p className="post-detail__caption">{post.caption}</p>}

        {/* Actions */}
        <div className="post-detail__actions">
          <button
            className={`post-detail__action post-detail__action--like ${
              isLiked ? "liked" : ""
            }`}
            onClick={handleLikeClick}
            disabled={isLiking}
          >
            {isLiked ? (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="20"
                height="20"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
            <span>{likesCount}</span>
          </button>
          <button
            className="post-detail__action post-detail__action--comment"
            onClick={handleCommentClick}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            <span>{post.comments_count}</span>
          </button>
        </div>
      </div>

      {/* Comment Form */}
      <form
        onSubmit={handleSubmitComment}
        className="post-detail__comment-form"
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="What are your thoughts?"
          className="post-detail__comment-input"
          rows="3"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="post-detail__comment-submit"
        >
          {isSubmitting ? "Posting..." : "Comment"}
        </button>
      </form>

      {/* Comments Section */}
      <div className="post-detail__comments">
        <h2 className="post-detail__comments-header">
          {post.comments_count}{" "}
          {post.comments_count === 1 ? "Comment" : "Comments"}
        </h2>

        {comments.length === 0 ? (
          <p className="post-detail__no-comments">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="post-detail__comments-list">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
