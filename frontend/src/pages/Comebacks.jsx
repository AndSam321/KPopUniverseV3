import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { getComebacks } from "../api/comebacksApi";
import "./Comebacks.css";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const dateLabel = (dateStr) => {
  const [, month, day] = dateStr.split("-");
  return `${MONTHS[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
};

const monthLabel = (dateStr) => {
  const [, month] = dateStr.split("-").map(Number);
  return FULL_MONTHS[month - 1];
};

const bucketUpcoming = (list) => {
  const thisWeek = [];
  const nextWeek = [];
  const later = [];
  const laterByMonth = new Map();

  list.forEach((cb) => {
    const diff = ddays(cb.comeback_date);
    if (diff <= 6) {
      thisWeek.push(cb);
    } else if (diff <= 13) {
      nextWeek.push(cb);
    } else {
      const label = monthLabel(cb.comeback_date);
      if (!laterByMonth.has(label)) {
        const group = { label, items: [] };
        laterByMonth.set(label, group);
        later.push(group);
      }
      laterByMonth.get(label).items.push(cb);
    }
  });

  return { thisWeek, nextWeek, later };
};

const ddays = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};

const ddayLabel = (dateStr) => {
  const diff = ddays(dateStr);
  if (diff <= 0) return "Today";
  if (diff === 1) return "1 day";
  return `${diff} days`;
};

const ComebackRow = ({ comeback, showCountdown }) => (
  <div className="cb-row">
    <span className={`cb-row__dday ${showCountdown ? "" : "cb-row__dday--past"}`}>
      {showCountdown ? ddayLabel(comeback.comeback_date) : dateLabel(comeback.comeback_date)}
    </span>
    <span className="cb-row__info">
      <span className="cb-row__line">
        {comeback.group ? (
          <Link to={`/groups/${comeback.group.id}`} className="cb-row__artist cb-row__artist--link">
            {comeback.artist_name}
          </Link>
        ) : (
          <span className="cb-row__artist">{comeback.artist_name}</span>
        )}
        <span className="cb-row__title">{comeback.title}</span>
      </span>
      <span className="cb-row__meta">
        {showCountdown && (
          <>
            <span>{dateLabel(comeback.comeback_date)}</span>
            <span className="cb-row__dot">·</span>
          </>
        )}
        {comeback.release_type && (
          <span className="cb-row__type">{comeback.release_type}</span>
        )}
        {comeback.title_track && (
          <>
            <span className="cb-row__dot">·</span>
            <span className="cb-row__track">{comeback.title_track}</span>
          </>
        )}
      </span>
    </span>
    {comeback.source_url && (
      <a
        href={comeback.source_url}
        target="_blank"
        rel="noreferrer"
        className="cb-row__source"
      >
        Details
      </a>
    )}
  </div>
);

const Bucket = ({ label, items }) =>
  items.length > 0 && (
    <div className="comebacks__bucket">
      <h3 className="comebacks__bucket-title">{label}</h3>
      <div className="cb-list">
        {items.map((cb) => (
          <ComebackRow key={cb.id} comeback={cb} showCountdown />
        ))}
      </div>
    </div>
  );

export default function Comebacks({ embedded = false }) {
  const [query, setQuery] = useState("");
  const [upcoming, setUpcoming] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      getComebacks({ q: query.trim() })
        .then((res) => {
          setUpcoming(res.upcoming);
          setRecent(res.recent);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const searching = query.trim() !== "";
  const expanded = showAll || searching;
  const { thisWeek, nextWeek, later } = bucketUpcoming(upcoming);
  const laterCount = later.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className={`comebacks ${embedded ? "comebacks--embedded" : ""}`}>
      {!embedded && (
        <div className="comebacks__header">
          <h1 className="page-title">Comebacks</h1>
          <p className="comebacks__subtitle">Upcoming and recent K-pop releases</p>
        </div>
      )}

      <div className="app-search comebacks__search">
        <Search size={18} className="app-search__icon" />
        <input
          type="text"
          placeholder="Search by artist or title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="app-search__input"
        />
      </div>

      {loading ? (
        <p className="comebacks__status">Loading...</p>
      ) : (
        <>
          <section className="comebacks__section">
            <h2 className="comebacks__section-title">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="comebacks__empty">No upcoming comebacks found.</p>
            ) : (
              <>
                <Bucket label="This week" items={thisWeek} />
                <Bucket label="Next week" items={nextWeek} />
                {expanded &&
                  later.map((group) => (
                    <Bucket key={group.label} label={group.label} items={group.items} />
                  ))}
                {laterCount > 0 && !searching && (
                  <button
                    type="button"
                    className="comebacks__more"
                    onClick={() => setShowAll((prev) => !prev)}
                  >
                    {showAll ? "Show less" : `Show ${laterCount} more upcoming`}
                  </button>
                )}
              </>
            )}
          </section>

          {recent.length > 0 && (
            <section className="comebacks__section">
              <h2 className="comebacks__section-title">Recent</h2>
              <div className="cb-list">
                {recent.map((cb) => (
                  <ComebackRow key={cb.id} comeback={cb} showCountdown={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
