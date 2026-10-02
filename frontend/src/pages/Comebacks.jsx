import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { getComebacks } from "../api/comebacksApi";
import "./Comebacks.css";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const dateLabel = (dateStr) => {
  const [, month, day] = dateStr.split("-");
  return `${MONTHS[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
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

export default function Comebacks({ embedded = false }) {
  const [query, setQuery] = useState("");
  const [upcoming, setUpcoming] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <div className="cb-list">
                {upcoming.map((cb) => (
                  <ComebackRow key={cb.id} comeback={cb} showCountdown />
                ))}
              </div>
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
