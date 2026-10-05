import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Search, Plus, X, Check } from "lucide-react";
import {
  getCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity,
} from "../api/communitiesApi";
import { useAuth } from "../context/AuthContext";
import "./Communities.css";

export default function Communities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("popular");
  const [pendingId, setPendingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    const handle = setTimeout(() => {
      getCommunities({ q: searchTerm.trim(), sort })
        .then((data) => active && setCommunities(data))
        .catch(() => {})
        .finally(() => active && setLoading(false));
    }, 250);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [searchTerm, sort]);

  const toggleMembership = async (community) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (pendingId) return;
    setPendingId(community.id);
    try {
      const updated = community.is_member
        ? await leaveCommunity(community.id)
        : await joinCommunity(community.id);
      setCommunities((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch {
      // keep current state on failure
    } finally {
      setPendingId(null);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await createCommunity(null, {
        name: name.trim(),
        description: description.trim(),
      });
      setCommunities((prev) => [created, ...prev]);
      setName("");
      setDescription("");
      setCreating(false);
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || "Could not create community");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="communities-page">
      <div className="communities-page__header">
        <div>
          <h1 className="page-title">Communities</h1>
          <p className="communities-page__subtitle">
            Browse and join communities — or start your own on any topic
          </p>
        </div>
        {user && !creating && (
          <button
            type="button"
            className="communities-page__create-btn"
            onClick={() => setCreating(true)}
          >
            <Plus size={16} strokeWidth={2.5} /> Create Community
          </button>
        )}
      </div>

      {creating && (
        <form className="communities-page__form" onSubmit={handleCreate}>
          <input
            className="communities-page__input"
            type="text"
            placeholder="Community name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoFocus
          />
          <textarea
            className="communities-page__textarea"
            placeholder="What's this community about? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={300}
          />
          {error && <p className="communities-page__error">{error}</p>}
          <div className="communities-page__form-actions">
            <button
              type="button"
              className="communities-page__cancel"
              onClick={() => {
                setCreating(false);
                setError("");
              }}
            >
              <X size={14} strokeWidth={2.5} /> Cancel
            </button>
            <button
              type="submit"
              className="communities-page__submit"
              disabled={!name.trim() || submitting}
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      )}

      <div className="communities-page__controls">
        <div className="app-search">
          <Search size={18} className="app-search__icon" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="app-search__input"
          />
        </div>
        <div className="communities-page__sort">
          <button
            className={`communities-page__sort-btn ${sort === "popular" ? "communities-page__sort-btn--active" : ""}`}
            onClick={() => setSort("popular")}
          >
            Popular
          </button>
          <button
            className={`communities-page__sort-btn ${sort === "new" ? "communities-page__sort-btn--active" : ""}`}
            onClick={() => setSort("new")}
          >
            New
          </button>
        </div>
      </div>

      {loading ? (
        <div className="communities-page__empty">Loading…</div>
      ) : communities.length === 0 ? (
        <div className="communities-page__empty">
          {searchTerm
            ? `No communities found matching "${searchTerm}"`
            : "No communities yet. Be the first to create one!"}
        </div>
      ) : (
        <div className="communities-page__grid">
          {communities.map((community) => (
            <div key={community.id} className="communities-page__card">
              <Link
                to={`/communities/${community.id}`}
                className="communities-page__card-body"
              >
                <div className="communities-page__card-top">
                  <span className="communities-page__card-name">
                    {community.name}
                  </span>
                  {community.official && (
                    <span className="communities-page__badge">Official</span>
                  )}
                </div>
                <span className="communities-page__card-group">
                  {community.group ? `in ${community.group.name}` : "Community"}
                </span>
                {community.description && (
                  <p className="communities-page__card-desc">
                    {community.description}
                  </p>
                )}
                <span className="communities-page__card-members">
                  <Users size={13} strokeWidth={2.5} />
                  {community.member_count}{" "}
                  {community.member_count === 1 ? "member" : "members"}
                </span>
              </Link>
              <button
                type="button"
                className={`communities-page__join ${community.is_member ? "communities-page__join--member" : ""}`}
                onClick={() => toggleMembership(community)}
                disabled={pendingId === community.id}
              >
                {community.is_member ? (
                  <>
                    <Check size={14} strokeWidth={2.5} /> Joined
                  </>
                ) : (
                  <>
                    <Plus size={14} strokeWidth={2.5} /> Join
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
