import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, UserPlus, UserCheck, Users, Search } from "lucide-react";
import {
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
} from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import "./FollowListModal.css";

function FollowListModal({ username, initialTab = "followers", onClose }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingIds, setPendingIds] = useState(new Set());
  const [query, setQuery] = useState("");
  const dialogRef = useRef(null);

  const fetchList = useCallback(async (whichTab) => {
    setLoading(true);
    setError("");
    try {
      const data =
        whichTab === "followers"
          ? await getFollowers(username)
          : await getFollowing(username);
      setUsers(data);
    } catch (err) {
      setError("couldn't load list — try again");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchList(tab);
  }, [tab, fetchList]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleNavigate = (u) => {
    onClose();
    navigate(`/profile/${u.username}`);
  };

  const handleToggleFollow = async (e, targetUser) => {
    e.stopPropagation();
    if (pendingIds.has(targetUser.id)) return;

    setPendingIds((prev) => new Set(prev).add(targetUser.id));
    try {
      const result = targetUser.is_following
        ? await unfollowUser(targetUser.username)
        : await followUser(targetUser.username);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? { ...u, is_following: result.is_following }
            : u
        )
      );
    } catch (err) {
      // silent fail; button returns to previous state
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUser.id);
        return next;
      });
    }
  };

  const filtered = query
    ? users.filter((u) =>
        u.username.toLowerCase().includes(query.toLowerCase())
      )
    : users;

  return (
    <div
      className="follow-modal__backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="follow-modal" ref={dialogRef}>
        <header className="follow-modal__header">
          <div className="follow-modal__title-wrap">
            <span className="follow-modal__eyebrow">@{username}</span>
            <h2 className="follow-modal__title">
              {tab === "followers" ? "followers" : "following"}
            </h2>
          </div>
          <button
            className="follow-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </header>

        <div className="follow-modal__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "followers"}
            className={`follow-modal__tab${
              tab === "followers" ? " follow-modal__tab--active" : ""
            }`}
            onClick={() => setTab("followers")}
          >
            followers
          </button>
          <button
            role="tab"
            aria-selected={tab === "following"}
            className={`follow-modal__tab${
              tab === "following" ? " follow-modal__tab--active" : ""
            }`}
            onClick={() => setTab("following")}
          >
            following
          </button>
          <div
            className="follow-modal__tab-indicator"
            data-pos={tab}
            aria-hidden="true"
          />
        </div>

        <div className="follow-modal__search">
          <Search size={14} strokeWidth={2.5} />
          <input
            type="text"
            placeholder={`search ${tab}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="follow-modal__body">
          {loading ? (
            <div className="follow-modal__state">
              <div className="follow-modal__spinner" />
              <p>gathering the crowd…</p>
            </div>
          ) : error ? (
            <div className="follow-modal__state follow-modal__state--error">
              <p>{error}</p>
              <button onClick={() => fetchList(tab)}>retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="follow-modal__state">
              <Users size={32} strokeWidth={1.5} />
              <p>
                {query
                  ? "no matches"
                  : tab === "followers"
                    ? "no followers yet"
                    : "not following anyone yet"}
              </p>
            </div>
          ) : (
            <ul className="follow-modal__list">
              {filtered.map((u, idx) => {
                const isSelf = authUser && authUser.id === u.id;
                const isPending = pendingIds.has(u.id);
                return (
                  <li
                    key={u.id}
                    className="follow-row"
                    style={{ "--row-delay": `${idx * 30}ms` }}
                    onClick={() => handleNavigate(u)}
                  >
                    <div className="follow-row__avatar-wrap">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt={u.username}
                          className="follow-row__avatar"
                        />
                      ) : (
                        <div className="follow-row__avatar follow-row__avatar--placeholder">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="follow-row__info">
                      <span className="follow-row__username">
                        {u.username}
                      </span>
                      {u.title && (
                        <span className="follow-row__title">{u.title}</span>
                      )}
                    </div>

                    {!isSelf && authUser && (
                      <button
                        className={`follow-row__btn${
                          u.is_following ? " follow-row__btn--active" : ""
                        }`}
                        onClick={(e) => handleToggleFollow(e, u)}
                        disabled={isPending}
                      >
                        {u.is_following ? (
                          <UserCheck size={13} strokeWidth={2.5} />
                        ) : (
                          <UserPlus size={13} strokeWidth={2.5} />
                        )}
                        <span>{u.is_following ? "following" : "follow"}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowListModal;
