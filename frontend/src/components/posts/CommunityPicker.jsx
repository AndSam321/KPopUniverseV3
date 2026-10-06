import { useEffect, useState } from "react";
import { X, Search, Check, Users } from "lucide-react";
import { getMyCommunities, getCommunities } from "../../api/communitiesApi";
import "./CommunityPicker.css";

const label = (c) => (c.group?.name ? `${c.group.name} › ${c.name}` : c.name);

export default function CommunityPicker({ onSelect, onClose, currentId }) {
  const [query, setQuery] = useState("");
  const [joined, setJoined] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    getMyCommunities().then(setJoined).catch(() => {});
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(() => {
      getCommunities({ q, includeOfficial: true })
        .then(setResults)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const searching = query.trim().length > 0;
  const list = searching ? results : joined;

  return (
    <div className="community-picker__overlay" onClick={onClose}>
      <div className="community-picker" onClick={(e) => e.stopPropagation()}>
        <div className="community-picker__head">
          <h2 className="community-picker__title">Choose community</h2>
          <button className="community-picker__close" onClick={onClose} aria-label="close">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="community-picker__search">
          <Search size={18} className="community-picker__search-icon" />
          <input
            autoFocus
            type="text"
            placeholder="Search communities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="community-picker__list">
          {!searching && list.length > 0 && (
            <div className="community-picker__section">Your communities</div>
          )}
          {loading && <div className="community-picker__empty">Searching…</div>}
          {!loading && list.length === 0 && (
            <div className="community-picker__empty">
              {searching
                ? "No communities found."
                : "You haven't joined any yet — search to find one."}
            </div>
          )}
          {list.map((c) => (
            <button
              key={c.id}
              type="button"
              className="community-picker__row"
              onClick={() => onSelect(c)}
            >
              <span className="community-picker__avatar">
                {c.name.charAt(0).toUpperCase()}
              </span>
              <span className="community-picker__info">
                <span className="community-picker__name">{label(c)}</span>
                <span className="community-picker__meta">
                  <Users size={12} strokeWidth={2.5} /> {c.member_count}{" "}
                  {c.member_count === 1 ? "member" : "members"}
                  {c.is_member && <span className="community-picker__joined"> · Joined</span>}
                </span>
              </span>
              {c.id === currentId && (
                <Check size={16} strokeWidth={2.5} className="community-picker__check" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
