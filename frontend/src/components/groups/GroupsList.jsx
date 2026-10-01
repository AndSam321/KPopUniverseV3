import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users } from "lucide-react";
import { getGroups } from "../../api/groupsApi";
import { getCommunities } from "../../api/communitiesApi";
import { useNavigationLoading } from "../../context/NavigationLoadingContext";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [communities, setCommunities] = useState([]);
  const [communitySort, setCommunitySort] = useState("popular");

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      getCommunities({ q: searchTerm.trim(), sort: communitySort })
        .then(setCommunities)
        .catch(() => {});
    }, 250);
    return () => clearTimeout(handle);
  }, [searchTerm, communitySort]);

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
          <h1>Explore</h1>
          <p className="groups-list__subtitle">
            Browse K-pop groups and their communities
          </p>
        </div>
      </div>

      <div className="groups-list__controls">
        <input
          type="text"
          placeholder="Search groups and communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="groups-list__search-input"
        />
      </div>

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

      <section className="groups-list__section">
        <div className="groups-list__section-header">
          <h2 className="groups-list__section-title">Communities</h2>
          <div className="explore-sort">
            <button
              className={`explore-sort__btn ${communitySort === "popular" ? "explore-sort__btn--active" : ""}`}
              onClick={() => setCommunitySort("popular")}
            >
              Popular
            </button>
            <button
              className={`explore-sort__btn ${communitySort === "new" ? "explore-sort__btn--active" : ""}`}
              onClick={() => setCommunitySort("new")}
            >
              New
            </button>
          </div>
        </div>

        {communities.length === 0 ? (
          <div className="groups-list__empty">
            <p>
              {searchTerm
                ? `No communities found matching "${searchTerm}"`
                : "No communities yet."}
            </p>
          </div>
        ) : (
          <div className="explore-communities">
            {communities.map((community) => (
              <Link
                key={community.id}
                to={`/communities/${community.id}`}
                className="explore-community"
              >
                <div className="explore-community__top">
                  <span className="explore-community__name">
                    {community.name}
                  </span>
                  {community.official && (
                    <span className="explore-community__badge">Official</span>
                  )}
                </div>
                <span className="explore-community__group">
                  in {community.group.name}
                </span>
                <span className="explore-community__members">
                  <Users size={13} strokeWidth={2.5} />
                  {community.member_count}{" "}
                  {community.member_count === 1 ? "member" : "members"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default GroupsList;
