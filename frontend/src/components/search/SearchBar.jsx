import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Mic2, User, FileText } from "lucide-react";
import { search as searchApi } from "../../api/searchApi";
import FadeImage from "../common/FadeImage";
import { targetFor, imageFor, titleFor, subtitleFor } from "./searchResultHelpers";
import "./SearchBar.css";

const MIN_LENGTH = 2;
const DEBOUNCE_MS = 250;

const SECTIONS = [
  { key: "groups", label: "Groups", icon: Users },
  { key: "members", label: "Artists", icon: Mic2 },
  { key: "users", label: "Fans", icon: User },
  { key: "posts", label: "Posts", icon: FileText },
];

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const abortRef = useRef(null);

  const term = query.trim();

  // Debounced fetch with stale-request cancellation
  useEffect(() => {
    if (term.length < MIN_LENGTH) {
      setResults(null);
      setLoading(false);
      return;
    }

    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const { data } = await searchApi(term, { signal: controller.signal });
        setResults(data);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          setResults({ groups: [], members: [], users: [], posts: [] });
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [term]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Flatten visible results in render order for keyboard navigation
  const flatItems = results
    ? SECTIONS.flatMap((s) => (results[s.key] || []).map((item) => ({ kind: s.key, item })))
    : [];
  const hasResults = flatItems.length > 0;

  const goToResults = useCallback(() => {
    if (term.length < MIN_LENGTH) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  }, [term, navigate]);

  const goToItem = useCallback(
    ({ kind, item }) => {
      setOpen(false);
      setQuery("");
      navigate(targetFor(kind, item));
    },
    [navigate]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open) return;

    // activeIndex === flatItems.length is the "see all" row
    const max = flatItems.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i >= max ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= -1 ? max : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flatItems.length) {
        goToItem(flatItems[activeIndex]);
      } else {
        goToResults();
      }
    }
  };

  let renderIndex = -1;

  return (
    <div className="kp-search" ref={containerRef}>
      <div className="kp-search__field">
        <Search size={18} className="kp-search__icon" />
        <input
          type="text"
          className="kp-search__input"
          placeholder="search artists, groups, fans..."
          value={query}
          role="combobox"
          aria-expanded={open}
          aria-controls="kp-search-listbox"
          aria-autocomplete="list"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open && term.length >= MIN_LENGTH && (
        <div className="kp-search__dropdown" id="kp-search-listbox" role="listbox">
          {loading && !hasResults && (
            <div className="kp-search__status">Searching…</div>
          )}

          {!loading && !hasResults && (
            <div className="kp-search__status">No results for “{term}”</div>
          )}

          {SECTIONS.map((section) => {
            const items = results?.[section.key] || [];
            if (items.length === 0) return null;
            const SectionIcon = section.icon;
            return (
              <div className="kp-search__section" key={section.key}>
                <div className="kp-search__section-title">{section.label}</div>
                {items.map((item) => {
                  renderIndex += 1;
                  const index = renderIndex;
                  const active = index === activeIndex;
                  return (
                    <button
                      type="button"
                      key={`${section.key}-${item.id}`}
                      role="option"
                      aria-selected={active}
                      className={`kp-search__item ${active ? "kp-search__item--active" : ""}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goToItem({ kind: section.key, item })}
                    >
                      <span className="kp-search__thumb">
                        {section.key === "posts" ? (
                          <SectionIcon size={16} />
                        ) : imageFor(section.key, item) ? (
                          <FadeImage src={imageFor(section.key, item)} alt="" />
                        ) : (
                          <SectionIcon size={16} />
                        )}
                      </span>
                      <span className="kp-search__item-text">
                        <span className="kp-search__item-title">
                          {titleFor(section.key, item)}
                        </span>
                        {subtitleFor(section.key, item) && (
                          <span className="kp-search__item-subtitle">
                            {subtitleFor(section.key, item)}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {hasResults && (
            <button
              type="button"
              role="option"
              aria-selected={activeIndex === flatItems.length}
              className={`kp-search__see-all ${activeIndex === flatItems.length ? "kp-search__item--active" : ""}`}
              onMouseEnter={() => setActiveIndex(flatItems.length)}
              onClick={goToResults}
            >
              See all results for “{term}”
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
