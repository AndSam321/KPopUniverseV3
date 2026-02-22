import "./Skeleton.css";

const PostDetailSkeleton = () => (
  <div className="post-detail-skeleton">
    {/* Back button */}
    <div className="skeleton skeleton--circle post-detail-skeleton__back" />

    {/* Group badge */}
    <div className="skeleton post-detail-skeleton__group" />

    {/* Meta line */}
    <div className="post-detail-skeleton__meta">
      <div className="skeleton skeleton--text" style={{ width: 140 }} />
      <div className="skeleton skeleton--text" style={{ width: 100 }} />
    </div>

    {/* Title */}
    <div className="post-detail-skeleton__title">
      <div className="skeleton skeleton--title" style={{ width: "90%" }} />
      <div className="skeleton skeleton--title" style={{ width: "55%" }} />
    </div>

    {/* Image */}
    <div className="skeleton skeleton--image post-detail-skeleton__image" />

    {/* Caption */}
    <div className="post-detail-skeleton__caption">
      <div className="skeleton skeleton--text" style={{ width: "100%" }} />
      <div className="skeleton skeleton--text" style={{ width: "85%" }} />
      <div className="skeleton skeleton--text" style={{ width: "40%" }} />
    </div>

    {/* Actions */}
    <div className="post-detail-skeleton__actions">
      <div className="skeleton skeleton--button" style={{ width: 60 }} />
      <div className="skeleton skeleton--button" style={{ width: 60 }} />
      <div className="skeleton skeleton--button" style={{ width: 72 }} />
    </div>

    {/* Comment form */}
    <div className="skeleton post-detail-skeleton__comment-form" />

    {/* Comments header */}
    <div className="skeleton post-detail-skeleton__comments-header" />

    {/* Comment skeletons */}
    {[1, 2, 3].map((i) => (
      <div key={i} className="post-detail-skeleton__comment">
        <div className="skeleton skeleton--circle post-detail-skeleton__comment-avatar" />
        <div className="post-detail-skeleton__comment-body">
          <div className="skeleton skeleton--text-sm" style={{ width: "30%" }} />
          <div className="skeleton skeleton--text" style={{ width: "90%" }} />
          <div className="skeleton skeleton--text" style={{ width: "60%" }} />
        </div>
      </div>
    ))}
  </div>
);

export default PostDetailSkeleton;
