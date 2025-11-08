import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getGroups } from "../../api/groupsApi";
import CreateGroup from "./CreateGroup";
import "./GroupsList.css";

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await getGroups();
      setGroups(data);
      setError("");
    } catch (err) {
      setError("Failed to load groups. Please try again.");
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
    setShowCreateGroup(false);
  };

  const officialGroups = groups.filter(group => !group.user_id);
  const userGroups = groups.filter(group => group.user_id);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" ||
                         (filter === "official" && !group.user_id) ||
                         (filter === "community" && group.user_id);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="groups-list">
      <div className="groups-list__header">
        <div className="groups-list__title-section">
          <h1>Communities</h1>
          <p className="groups-list__subtitle">
            Discover and join K-pop communities
          </p>
        </div>
        <button
          onClick={() => setShowCreateGroup(!showCreateGroup)}
          className="groups-list__create-btn"
        >
          {showCreateGroup ? "Cancel" : "+ Create Community"}
        </button>
      </div>

      <div className="groups-list__controls">
        <div className="groups-list__search">
          <input
            type="text"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="groups-list__search-input"
          />
        </div>
        <div className="groups-list__filters">
          <button
            onClick={() => setFilter("all")}
            className={`groups-list__filter ${filter === "all" ? "active" : ""}`}
          >
            All ({groups.length})
          </button>
          <button
            onClick={() => setFilter("official")}
            className={`groups-list__filter ${filter === "official" ? "active" : ""}`}
          >
            Official ({officialGroups.length})
          </button>
          <button
            onClick={() => setFilter("community")}
            className={`groups-list__filter ${filter === "community" ? "active" : ""}`}
          >
            User Communities ({userGroups.length})
          </button>
        </div>
      </div>

      {showCreateGroup && <CreateGroup onGroupCreated={handleGroupCreated} />}

      {error && <div className="groups-list__error">{error}</div>}

      {loading ? (
        <div className="groups-list__loading">Loading communities...</div>
      ) : filteredGroups.length === 0 ? (
        <div className="groups-list__empty">
          <p>
            {searchTerm
              ? `No communities found matching "${searchTerm}"`
              : "No communities yet. Be the first to create one!"}
          </p>
        </div>
      ) : (
        <div className="groups-list__content">
          {filteredGroups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="group-item"
            >
              <div className="group-item__icon">
                {group.logo_url ? (
                  <img src={group.logo_url} alt={group.name} />
                ) : (
                  <div className="group-item__icon-placeholder">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="group-item__info">
                <div className="group-item__header">
                  <h3 className="group-item__name">{group.name}</h3>
                  {!group.user_id && (
                    <span className="group-item__badge">Official</span>
                  )}
                </div>
                {group.description && (
                  <p className="group-item__description">{group.description}</p>
                )}
              </div>
              <div className="group-item__arrow">›</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsList;
