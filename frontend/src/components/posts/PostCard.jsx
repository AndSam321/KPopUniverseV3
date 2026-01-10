import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PostCard.css";
import { likePost } from "../../api/postsApi";
import { useAuth } from "../../context/AuthContext";

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setIsLiked(post.is_liked || false);
    setLikesCount(post.likes_count || 0);
  }, [post.is_liked, post.likes_count]);

  const nextImage = () => {
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
    }
  };

  const prevImage = () => {
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? post.images.length - 1 : prev - 1
      );
    }
  };

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

  const handleLikeClick = async (e) => {
    e.stopPropagation();

    if (isLiking) return;

    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    setIsLiking(true);

    try {
      const response = await likePost(post.id);

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

  return (
    <div className="post-card">
      {/* Header: User + Group */}
      <div className="post-card__header">
        <div className="post-card__user">
          {post.user.avatar_url ? (
            <img
              src={post.user.avatar_url}
              alt={post.user.username}
              className="post-card__avatar"
            />
          ) : (
            <div className="post-card__avatar post-card__avatar--placeholder">
              {post.user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="post-card__user-info">
            {post.groups && post.groups.length > 0 && (
              <span className="post-card__group-name">
                {post.groups[0].name}
              </span>
            )}
            <div className="post-card__meta">
              <span className="post-card__username">{post.user.username}</span>
              <span className="post-card__dot">•</span>
              <span className="post-card__timestamp">
                {formatDate(post.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="post-card__content">
        {/* Tags */}
        {post.groups && post.groups.length > 1 && (
          <div className="post-card__tags">
            {post.groups.slice(1).map((group) => (
              <span key={group.id} className="post-card__tag">
                {group.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="post-card__title">{post.title}</h3>

        {/* Caption/Body */}
        {post.caption && <p className="post-card__caption">{post.caption}</p>}

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="post-card__images">
            <img
              src={post.images[currentImageIndex].url}
              alt={`${post.title} - ${currentImageIndex + 1}`}
              className="post-card__image"
            />

            {post.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="post-card__nav post-card__nav--prev"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="post-card__nav post-card__nav--next"
                  aria-label="Next image"
                >
                  ›
                </button>
                <div className="post-card__image-counter">
                  {currentImageIndex + 1} / {post.images.length}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer: Hearts & Comments */}
      <div className="post-card__footer">
        <button
          className={`post-card__action post-card__action--like ${
            isLiked ? "liked" : ""
          }`}
          onClick={handleLikeClick}
          disabled={isLiking}
        >
          {isLiked ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
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
          className="post-card__action post-card__action--comment"
          onClick={() => {
            if (!user) {
              navigate("/login");
              return;
            }
            navigate(`/posts/${post.id}`);
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
          <span>{post.comments_count}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
