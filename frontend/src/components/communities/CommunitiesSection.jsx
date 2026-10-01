import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Check, Plus, X } from "lucide-react";
import {
  getGroupCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity,
} from "../../api/communitiesApi";
import { useAuth } from "../../context/AuthContext";
import "./CommunitiesSection.css";

export default function CommunitiesSection({ groupId }) {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getGroupCommunities(groupId)
      .then((data) => active && setCommunities(data))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [groupId]);

  const toggleMembership = async (community) => {
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
      // leave the current state in place on failure
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
      const created = await createCommunity(groupId, {
        name: name.trim(),
        description: description.trim(),
      });
      setCommunities((prev) => [created, ...prev]);
      setName("");
      setDescription("");
      setCreating(false);
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || "could not create community");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <section className="group-detail__section">
      <div className="communities-header">
        <h2 className="group-detail__section-title">Communities</h2>
        {user && !creating && (
          <button
            type="button"
            className="communities-create-btn"
            onClick={() => setCreating(true)}
          >
            <Plus size={14} strokeWidth={2.5} /> Create community
          </button>
        )}
      </div>

      {creating && (
        <form className="community-form" onSubmit={handleCreate}>
          <input
            className="community-form__input"
            type="text"
            placeholder="community name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoFocus
          />
          <textarea
            className="community-form__textarea"
            placeholder="what's this community about? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={300}
          />
          {error && <p className="community-form__error">{error}</p>}
          <div className="community-form__actions">
            <button
              type="button"
              className="community-form__cancel"
              onClick={() => {
                setCreating(false);
                setError("");
              }}
            >
              <X size={14} strokeWidth={2.5} /> Cancel
            </button>
            <button
              type="submit"
              className="community-form__submit"
              disabled={!name.trim() || submitting}
            >
              {submitting ? "creating..." : "Create"}
            </button>
          </div>
        </form>
      )}

      <div className="communities-grid">
        {communities.map((community) => (
          <div key={community.id} className="community-card">
            <Link
              to={`/communities/${community.id}`}
              className="community-card__body"
            >
              <div className="community-card__title-row">
                <span className="community-card__name">{community.name}</span>
                {community.official && (
                  <span className="community-card__badge">Official</span>
                )}
              </div>
              {community.description && (
                <p className="community-card__desc">{community.description}</p>
              )}
              <span className="community-card__members">
                <Users size={13} strokeWidth={2.5} />
                {community.member_count}{" "}
                {community.member_count === 1 ? "member" : "members"}
              </span>
            </Link>
            {user && (
              <button
                type="button"
                className={`community-card__join ${
                  community.is_member ? "community-card__join--member" : ""
                }`}
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
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
