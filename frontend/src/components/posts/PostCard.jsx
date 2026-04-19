import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import "./PostCard.css";
import { likePost } from "../../api/postsApi";
import { useAuth } from "../../context/AuthContext";

const FLAIRS = {
  discussion: { label: "Discussion", color: "#757bc8" },
  question: { label: "Question", color: "#6ee7d8" },
  music: { label: "Music", color: "#ff6fb1" },
  news: { label: "News", color: "#ffd166" },
  media: { label: "Media/Photos", color: "#9fa0ff" },
  "fan-content": { label: "Fan Content", color: "#ff8ccf" },
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

const LikeIconFilled = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const LikeIconOutline = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showToast, setShowToast] = useState(false);
  const shareButtonRef = useRef(null);

  useEffect(() => {
    setIsLiked(post.is_liked || false);
    setLikesCount(post.likes_count || 0);
  }, [post.is_liked, post.likes_count]);

  const nextImage = useCallback((e) => {
    e.stopPropagation();
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
    }
  }, [post.images]);

  const prevImage = useCallback((e) => {
    e.stopPropagation();
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? post.images.length - 1 : prev - 1
      );
    }
  }, [post.images]);

  const handleShareClick = useCallback((e) => {
    e.stopPropagation();

    if (!showShareMenu && shareButtonRef.current) {
      const rect = shareButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }

    setShowShareMenu(!showShareMenu);
  }, [showShareMenu]);

  const handleCopyLink = useCallback((e) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      setShowShareMenu(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }).catch(err => {
      console.error("Failed to copy link:", err);
    });
  }, [post.id]);

  const handleLikeClick = useCallback(async (e) => {
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
  }, [isLiked, likesCount, isLiking, post.id]);

  return (
    <div
      className="post-card"
      onClick={() => navigate(`/posts/${post.id}`)}
      style={{ cursor: "pointer" }}
    >
      {/* Header: User + Group */}
      <div className="post-card__header">
        <div className="post-card__user">
          {post.user.avatar_url ? (
            <img
              src={post.user.avatar_url}
              alt={post.user.username}
              className="post-card__avatar post-card__avatar--link"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${post.user.username}`);
              }}
            />
          ) : (
            <div
              className="post-card__avatar post-card__avatar--placeholder post-card__avatar--link"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${post.user.username}`);
              }}
            >
              {post.user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="post-card__user-info">
            {post.groups && post.groups.length > 0 && (
              <span
                className="post-card__group-name"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/groups/${post.groups[0].id}`);
                }}
                style={{ cursor: "pointer" }}
              >
                {post.groups[0].name}
              </span>
            )}
            <div className="post-card__meta">
              <span
                className="post-card__username post-card__username--link"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${post.user.username}`);
                }}
              >
                {post.user.username}
              </span>
              <span className="post-card__dot">•</span>
              <span className="post-card__timestamp">
                {formatDate(post.created_at)}
              </span>
              {post.flair && FLAIRS[post.flair] && (
                <>
                  <span className="post-card__dot">•</span>
                  <span
                    className="post-card__flair"
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
          {isLiked ? <LikeIconFilled /> : <LikeIconOutline />}
          <span>{likesCount}</span>
        </button>
        <button
          className="post-card__action post-card__action--comment"
          onClick={(e) => {
            e.stopPropagation();
            if (!user) {
              navigate("/login");
              return;
            }
            navigate(`/posts/${post.id}`);
          }}
        >
          <CommentIcon />
          <span>{post.comments_count}</span>
        </button>
        <div className="post-card__share-container">
          <button
            ref={shareButtonRef}
            className="post-card__action post-card__action--share"
            onClick={handleShareClick}
          >
            <ShareIcon />
            <span>Share</span>
          </button>
        </div>
        {showShareMenu && ReactDOM.createPortal(
          <div
            className="post-card__share-menu"
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button className="post-card__share-option" onClick={handleCopyLink}>
              <LinkIcon />
              Copy link
            </button>
          </div>,
          document.body
        )}
        {showToast && ReactDOM.createPortal(
          <div className="post-card__toast">
            <CheckIcon />
            Link copied!
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default React.memo(PostCard);
