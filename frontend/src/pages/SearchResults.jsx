import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { search as searchApi } from "../api/searchApi";
import FadeImage from "../components/common/FadeImage";
import {
  SECTIONS,
  targetFor,
  imageFor,
  titleFor,
  subtitleFor,
} from "../components/search/searchResultHelpers";
import "./SearchResults.css";

const TABS = [{ key: "all", label: "All" }, ...SECTIONS];

const ResultRow = ({ kind, item }) => {
  const navigate = useNavigate();
  const image = imageFor(kind, item);
  return (
    <button
      type="button"
      className="search-results__row"
      onClick={() => navigate(targetFor(kind, item))}
    >
      <span className="search-results__thumb">
        {kind !== "posts" && image ? (
          <FadeImage src={image} alt="" />
        ) : (
          <span className="search-results__thumb-fallback">
            {titleFor(kind, item)?.charAt(0)?.toUpperCase()}
          </span>
        )}
      </span>
      <span className="search-results__row-text">
        <span className="search-results__row-title">{titleFor(kind, item)}</span>
        {subtitleFor(kind, item) && (
          <span className="search-results__row-subtitle">
            {subtitleFor(kind, item)}
          </span>
        )}
        {kind === "posts" && item.caption && (
          <span className="search-results__row-caption">{item.caption}</span>
        )}
      </span>
    </button>
  );
};

const SearchResults = () => {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const [tab, setTab] = useState("all");
  const [preview, setPreview] = useState(null);
  const [counts, setCounts] = useState({});
  const [typed, setTyped] = useState({ items: [], meta: null });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Reset to the All tab whenever the query changes
  useEffect(() => {
    setTab("all");
    setPage(1);
  }, [q]);

  // Grouped preview (also provides per-tab counts)
  useEffect(() => {
    if (q.length < 2) return;
    let active = true;
    setLoading(true);
    searchApi(q)
      .then((res) => {
        if (!active) return;
        setPreview(res.data);
        setCounts(res.meta?.counts || {});
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [q]);

  // Typed, paginated results for a specific tab
  useEffect(() => {
    if (tab === "all" || q.length < 2) return;
    let active = true;
    setLoading(true);
    searchApi(q, { type: tab, page })
      .then((res) => {
        if (!active) return;
        setTyped({ items: res.data, meta: res.meta });
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [q, tab, page]);

  if (q.length < 2) {
    return (
      <div className="search-results">
        <p className="search-results__empty">Type at least 2 characters to search.</p>
      </div>
    );
  }

  const totalAll = SECTIONS.reduce((sum, s) => sum + (counts[s.key] || 0), 0);

  return (
    <div className="search-results">
      <h1 className="search-results__heading">
        Results for “{q}”
      </h1>

      <div className="search-results__tabs" role="tablist">
        {TABS.map((t) => {
          const count = t.key === "all" ? totalAll : counts[t.key];
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`search-results__tab ${tab === t.key ? "search-results__tab--active" : ""}`}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
            >
              {t.label}
              {count != null && <span className="search-results__tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {tab === "all" ? (
        <div className="search-results__all">
          {totalAll === 0 && !loading && (
            <p className="search-results__empty">No results found.</p>
          )}
          {SECTIONS.map((section) => {
            const items = preview?.[section.key] || [];
            if (items.length === 0) return null;
            return (
              <section className="search-results__section" key={section.key}>
                <div className="search-results__section-header">
                  <h2 className="search-results__section-title">{section.label}</h2>
                  {counts[section.key] > items.length && (
                    <button
                      className="search-results__see-all"
                      onClick={() => {
                        setTab(section.key);
                        setPage(1);
                      }}
                    >
                      See all {counts[section.key]}
                    </button>
                  )}
                </div>
                <div className="search-results__list">
                  {items.map((item) => (
                    <ResultRow key={`${section.key}-${item.id}`} kind={section.key} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="search-results__typed">
          {typed.items.length === 0 && !loading && (
            <p className="search-results__empty">No results found.</p>
          )}
          <div className="search-results__list">
            {typed.items.map((item) => (
              <ResultRow key={`${tab}-${item.id}`} kind={tab} item={item} />
            ))}
          </div>

          {typed.meta && typed.meta.total_pages > 1 && (
            <div className="search-results__pagination">
              <button
                className="search-results__page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="search-results__page-info">
                Page {typed.meta.current_page} of {typed.meta.total_pages}
              </span>
              <button
                className="search-results__page-btn"
                disabled={page >= typed.meta.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
