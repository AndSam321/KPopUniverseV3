import { useState, useEffect } from "react";
import { Users, Check, Plus } from "lucide-react";
import {
  getGroupCommunities,
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

  if (loading || communities.length === 0) return null;

  return (
    <section className="group-detail__section">
      <h2 className="group-detail__section-title">Communities</h2>
      <div className="communities-grid">
        {communities.map((community) => (
          <div key={community.id} className="community-card">
            <div className="community-card__body">
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
            </div>
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
