import "./Skeleton.css";

const GroupCardSkeleton = () => (
  <div className="group-card-skeleton">
    <div className="skeleton group-card-skeleton__cover" />
    <div className="skeleton skeleton--text" style={{ width: "70%" }} />
    <div className="skeleton skeleton--text-sm" style={{ width: "45%" }} />
  </div>
);

export default GroupCardSkeleton;
