import "./Skeleton.css";

const GroupItemSkeleton = () => (
  <div className="group-item-skeleton">
    <div className="skeleton skeleton--circle group-item-skeleton__icon" />
    <div className="group-item-skeleton__info">
      <div className="skeleton skeleton--text" style={{ width: "45%" }} />
      <div className="skeleton skeleton--text-sm" style={{ width: "75%" }} />
    </div>
  </div>
);

export default GroupItemSkeleton;
