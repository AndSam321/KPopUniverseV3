import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getComebacks } from "../api/comebacksApi";
import FadeImage from "../components/common/FadeImage";
import "./Comebacks.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const FILTERS = [
  { key: "", label: "All" },
  { key: "girl_group", label: "Girl Groups" },
  { key: "boy_group", label: "Boy Groups" },
];

const monthLabel = (dateStr) => {
  const [year, month] = dateStr.split("-");
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
};

const dayLabel = (dateStr) => {
  const [, month, day] = dateStr.split("-");
  return `${MONTHS[parseInt(month, 10) - 1].slice(0, 3)} ${parseInt(day, 10)}`;
};

const groupByMonth = (releases) => {
  const groups = [];
  releases.forEach((release) => {
    const label = monthLabel(release.release_date);
    if (groups[groups.length - 1]?.month !== label) {
      groups.push({ month: label, items: [] });
    }
    groups[groups.length - 1].items.push(release);
  });
  return groups;
};

export default function Comebacks() {
  const [releases, setReleases] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [groupType, setGroupType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getComebacks({ page: 1, groupType })
      .then((res) => {
        setReleases(res.data);
        setPage(res.meta.current_page);
        setTotalPages(res.meta.total_pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [groupType]);

  const loadMore = async () => {
    const res = await getComebacks({ page: page + 1, groupType });
    setReleases((prev) => [...prev, ...res.data]);
    setPage(res.meta.current_page);
    setTotalPages(res.meta.total_pages);
  };

  const months = groupByMonth(releases);

  return (
    <div className="comebacks">
      <div className="comebacks__header">
        <h1>Comebacks</h1>
        <p className="comebacks__subtitle">New releases across K-pop</p>
      </div>

      <div className="comebacks__filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            className={`comebacks__filter ${groupType === filter.key ? "comebacks__filter--active" : ""}`}
            onClick={() => setGroupType(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="comebacks__status">Loading...</p>
      ) : months.length === 0 ? (
        <p className="comebacks__status">No releases found.</p>
      ) : (
        <>
          {months.map((month) => (
            <section key={month.month} className="comebacks__month">
              <h2 className="comebacks__month-label">{month.month}</h2>
              <div className="comebacks__list">
                {month.items.map((release) => (
                  <div key={release.id} className="release-row">
                    <span className="release-row__date">
                      {dayLabel(release.release_date)}
                    </span>
                    <span className="release-row__cover">
                      {release.cover_url ? (
                        <FadeImage src={release.cover_url} alt="" />
                      ) : (
                        <span className="release-row__cover-fallback">
                          {release.title.charAt(0)}
                        </span>
                      )}
                    </span>
                    <span className="release-row__info">
                      <span className="release-row__title">{release.title}</span>
                      <span className="release-row__meta">
                        <Link
                          to={`/groups/${release.group.id}`}
                          className="release-row__group"
                        >
                          {release.group.name}
                        </Link>
                        {release.album_type && (
                          <>
                            <span className="release-row__dot">·</span>
                            <span className="release-row__type">
                              {release.album_type}
                            </span>
                          </>
                        )}
                      </span>
                    </span>
                    {release.external_url && (
                      <a
                        href={release.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="release-row__listen"
                      >
                        Listen
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {page < totalPages && (
            <button className="comebacks__load-more" onClick={loadMore}>
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
}
