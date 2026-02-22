import "./Skeleton.css";

const PostCardSkeleton = ({ showImage = true }) => (
  <div className="post-card-skeleton">
    <div className="post-card-skeleton__header">
      <div className="skeleton skeleton--circle post-card-skeleton__avatar" />
      <div className="post-card-skeleton__header-lines">
        <div className="skeleton skeleton--text" style={{ width: "35%" }} />
        <div className="skeleton skeleton--text-sm" style={{ width: "55%" }} />
      </div>
    </div>
    <div className="post-card-skeleton__content">
      <div className="skeleton skeleton--title" style={{ width: "80%" }} />
      <div className="skeleton skeleton--text" style={{ width: "100%" }} />
      <div className="skeleton skeleton--text" style={{ width: "65%" }} />
      {showImage && (
        <div className="skeleton skeleton--image post-card-skeleton__image" />
      )}
    </div>
    <div className="post-card-skeleton__footer">
      <div className="skeleton skeleton--button" style={{ width: 60 }} />
      <div className="skeleton skeleton--button" style={{ width: 60 }} />
      <div className="skeleton skeleton--button" style={{ width: 72 }} />
    </div>
  </div>
);

export default PostCardSkeleton;
