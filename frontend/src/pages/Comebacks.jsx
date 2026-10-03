import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { getComebacks } from "../api/comebacksApi";
import "./Comebacks.css";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const slug = (label) => label.toLowerCase().replace(/\s+/g, "-");

const youtubeSearchUrl = (comeback) => {
  const query = `${comeback.artist_name} ${comeback.title_track || comeback.title}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
};

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

const ddayTone = (diff) => {
  if (diff <= 0) return "now";
  if (diff <= 3) return "urgent";
  if (diff <= 7) return "soon";
  return "later";
};

const ComebackRow = ({ comeback, showCountdown }) => {
  const diff = ddays(comeback.comeback_date);
  return (
  <div className="cb-row">
    {showCountdown ? (
      <span className={`cb-row__dday cb-row__dday--${ddayTone(diff)}`}>
        {diff <= 0 ? (
          <strong className="cb-row__dday-now">Today</strong>
        ) : (
          <>
            <strong className="cb-row__dday-num">{diff}</strong>
            <span className="cb-row__dday-unit">{diff === 1 ? "day" : "days"}</span>
          </>
        )}
      </span>
    ) : (
      <span className="cb-row__date">{dateLabel(comeback.comeback_date)}</span>
    )}
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
        {showCountdown && <span>{dateLabel(comeback.comeback_date)}</span>}
        {showCountdown && comeback.title_track && (
          <span className="cb-row__dot">·</span>
        )}
        {comeback.title_track && (
          <span className="cb-row__track">{comeback.title_track}</span>
        )}
      </span>
    </span>
    <span className="cb-row__end">
      {comeback.release_type && (
        <span className="cb-row__type-chip">{comeback.release_type}</span>
      )}
      <a
        href={youtubeSearchUrl(comeback)}
        target="_blank"
        rel="noreferrer"
        className="cb-row__source"
      >
        View
      </a>
    </span>
  </div>
  );
};

const Bucket = ({ id, label, items }) =>
  items.length > 0 && (
    <div className="comebacks__bucket" id={id}>
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
  const [activeId, setActiveId] = useState("");
  const [animate] = useState(() => !prefersReducedMotion());
  const contentRef = useRef(null);

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

  const sections = [];
  if (thisWeek.length) sections.push({ id: "this-week", label: "This week" });
  if (nextWeek.length) sections.push({ id: "next-week", label: "Next week" });
  if (expanded) later.forEach((g) => sections.push({ id: slug(g.label), label: g.label }));
  if (recent.length) sections.push({ id: "recent", label: "Recent" });

  const sectionKey = sections.map((s) => s.id).join("|");
  const activeIndex = Math.max(0, sections.findIndex((s) => s.id === activeId));

  useEffect(() => {
    if (loading || !animate || !contentRef.current) return;
    const rows = contentRef.current.querySelectorAll(".cb-row");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [loading, animate, upcoming, recent, expanded]);

  useEffect(() => {
    if (loading || !sectionKey) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -70% 0px", threshold: 0 }
    );
    sectionKey.split("|").forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading, sectionKey]);

  const jumpTo = (event, id) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    setActiveId(id);
  };

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
        <div className={`comebacks__layout ${sections.length > 1 ? "comebacks__layout--rail" : ""}`}>
          {sections.length > 1 && (
            <nav className="comebacks__outline" aria-label="Comeback sections">
              <div className="comebacks__outline-inner">
                <span
                  className="comebacks__outline-thumb"
                  style={{ transform: `translateY(${activeIndex * 36}px)` }}
                  aria-hidden="true"
                />
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`comebacks__outline-link ${
                      activeId === section.id ? "is-active" : ""
                    }`}
                    onClick={(event) => jumpTo(event, section.id)}
                  >
                    {section.label}
                  </a>
                ))}
              </div>
            </nav>
          )}

          <div
            ref={contentRef}
            className={`comebacks__content ${animate ? "cb-animate" : ""}`}
          >
            <section className="comebacks__section">
              <h2 className="comebacks__section-title">Upcoming</h2>
              {upcoming.length === 0 ? (
                <p className="comebacks__empty">No upcoming comebacks found.</p>
              ) : (
                <>
                  <Bucket id="this-week" label="This week" items={thisWeek} />
                  <Bucket id="next-week" label="Next week" items={nextWeek} />
                  {expanded &&
                    later.map((group) => (
                      <Bucket
                        key={group.label}
                        id={slug(group.label)}
                        label={group.label}
                        items={group.items}
                      />
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
              <section id="recent" className="comebacks__section">
                <h2 className="comebacks__section-title">Recent</h2>
                <div className="cb-list">
                  {recent.map((cb) => (
                    <ComebackRow key={cb.id} comeback={cb} showCountdown={false} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
