import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGroups } from "../../api/groupsApi";
import { useNavigationLoading } from "../../context/NavigationLoadingContext";
import CreateGroup from "./CreateGroup";
import { useAuth } from "../../context/AuthContext";
import FadeImage from "../common/FadeImage";
import GroupCardSkeleton from "../skeletons/GroupCardSkeleton";
import "./GroupsList.css";

const CATEGORIES = [
  { key: "girl_group", label: "Girl Groups" },
  { key: "boy_group", label: "Boy Groups" },
  { key: "coed", label: "Co-ed Groups" },
  { key: "solo", label: "Soloists" },
  { key: "community", label: "Community" },
  { key: "other", label: "Other" },
];

const categoryFor = (group) => {
  if (group.user_id) return "community";
  return CATEGORIES.some((c) => c.key === group.group_type)
    ? group.group_type
    : "other";
};

const GroupsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startLoading, completeLoading } = useNavigationLoading();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      startLoading();
      const data = await getGroups();
      setGroups(data);
      setError("");
    } catch (err) {
      setError("Failed to load groups. Please try again.");
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
      completeLoading();
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
    setShowCreateGroup(false);
  };

  const handleOpenGroup = (group) => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/groups/${group.id}`);
  };

  const searchLower = searchTerm.toLowerCase();
  const filteredGroups = groups.filter((group) => {
    if (!searchLower) return true;
    const nameLower = group.name.toLowerCase();
    const nameWithoutSpecialChars = group.name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .toLowerCase();
    return (
      nameLower.includes(searchLower) ||
      nameWithoutSpecialChars.includes(searchLower) ||
      group.korean_name?.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower)
    );
  });

  const sections = CATEGORIES.map((category) => ({
    ...category,
    groups: filteredGroups.filter((group) => categoryFor(group) === category.key),
  })).filter((section) => section.groups.length > 0);

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
      </div>

      {showCreateGroup && <CreateGroup onGroupCreated={handleGroupCreated} />}

      {error && <div className="groups-list__error">{error}</div>}

      {loading ? (
        <div className="groups-list__grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="groups-list__empty">
          <p>
            {searchTerm
              ? `No communities found matching "${searchTerm}"`
              : "No communities yet. Be the first to create one!"}
          </p>
        </div>
      ) : (
        sections.map((section) => (
          <section key={section.key} className="groups-list__section">
            <div className="groups-list__section-header">
              <h2 className="groups-list__section-title">{section.label}</h2>
              <span className="groups-list__section-count">
                {section.groups.length}
              </span>
            </div>
            <div className="groups-list__grid">
              {section.groups.map((group) => (
                <button
                  key={group.id}
                  className="group-card"
                  onClick={() => handleOpenGroup(group)}
                >
                  <div className="group-card__cover">
                    {group.logo_url ? (
                      <FadeImage src={group.logo_url} alt={group.name} />
                    ) : (
                      <div className="group-card__cover-placeholder">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {!group.user_id && (
                      <span className="group-card__badge">Official</span>
                    )}
                  </div>
                  <div className="group-card__body">
                    <h3 className="group-card__name">{group.name}</h3>
                    {group.korean_name && (
                      <span className="group-card__korean">
                        {group.korean_name}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default GroupsList;
