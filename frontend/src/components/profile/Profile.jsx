import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getMyProfile, getUserByUsername, updateProfile, followUser, unfollowUser } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import { Camera, Star, Award, Edit3, X, Check, Trophy, UserPlus, UserCheck } from "lucide-react";
import "./Profile.css";

function Profile() {
  const { username } = useParams();
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [followPending, setFollowPending] = useState(false);
  const [followError, setFollowError] = useState("");
  const fileInputRef = useRef(null);

  const isOwnProfile = authUser && user && authUser.id === user.id;

  const handleFollowToggle = async () => {
    if (!user || followPending) return;
    try {
      setFollowPending(true);
      setFollowError("");
      const result = user.is_following
        ? await unfollowUser(user.username)
        : await followUser(user.username);
      setUser({
        ...user,
        is_following: result.is_following,
        followers_count: result.followers_count,
        following_count: result.following_count,
      });
    } catch (err) {
      setFollowError(err.response?.data?.error || "failed to update follow");
    } finally {
      setFollowPending(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        let userData;

        if (username) {
          userData = await getUserByUsername(username);
        } else {
          userData = await getMyProfile();
        }

        setUser(userData);
      } catch (err) {
        setError(err.response?.data?.message || "failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleEditClick = () => {
    setBio(user.bio || "");
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("bio", bio);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const updatedUser = await updateProfile(formData);
      setUser(updatedUser);
      updateUser(updatedUser);
      setEditing(false);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      setAvatarFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">user not found</div>
      </div>
    );
  }

  const pointsInfo = user.points_info;
  const totalNeeded = pointsInfo
    ? pointsInfo.current_points + pointsInfo.points_to_next_title
    : 0;
  const progressPercent =
    pointsInfo && totalNeeded > 0
      ? Math.min((pointsInfo.current_points / totalNeeded) * 100, 100)
      : 100;
  const isMaxLevel = pointsInfo && !pointsInfo.next_title;

  const displayAvatar = avatarPreview || user.avatar_url;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          {isOwnProfile && !editing && (
            <button className="edit-profile-btn" onClick={handleEditClick}>
              <Edit3 size={16} />
              Edit Profile
            </button>
          )}
          {!isOwnProfile && authUser && (
            <>
              <button
                className={`follow-btn${user.is_following ? " follow-btn--following" : ""}`}
                onClick={handleFollowToggle}
                disabled={followPending}
              >
                {user.is_following ? <UserCheck size={16} /> : <UserPlus size={16} />}
                {user.is_following ? "Following" : "Follow"}
              </button>
              {followError && (
                <div className="follow-error">{followError}</div>
              )}
            </>
          )}

          <div className="profile-header">
            <div className="profile-avatar">
              {editing ? (
                <div
                  className="avatar-upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {displayAvatar ? (
                    <img src={displayAvatar} alt={user.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="avatar-upload-overlay">
                    <Camera size={24} />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    hidden
                  />
                </div>
              ) : displayAvatar ? (
                <img src={displayAvatar} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-info">
              <h2 className="profile-username">{user.username}</h2>
              <p className="profile-title">{user.title}</p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">followers</span>
              <span className="stat-value">{user.followers_count ?? 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">following</span>
              <span className="stat-value">{user.following_count ?? 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">idol points</span>
              <span className="stat-value">{user.idol_points}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">member since</span>
              <span className="stat-value">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Bio Section */}
          {editing ? (
            <div className="profile-bio">
              <h3>about</h3>
              <textarea
                className="bio-edit-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 300))}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={300}
              />
              <span className="char-count">{bio.length}/300</span>
            </div>
          ) : (
            user.bio && (
              <div className="profile-bio">
                <h3>about</h3>
                <p>{user.bio}</p>
              </div>
            )
          )}

          {/* Points Tracker */}
          {pointsInfo && (
            <div className="points-tracker">
              <h3>
                <Trophy size={16} />
                Points Progress
              </h3>
              {isMaxLevel ? (
                <div className="progress-info">
                  <span className="current-title">
                    <Star size={14} /> {pointsInfo.current_title}
                  </span>
                  <span className="max-level">Max level reached!</span>
                </div>
              ) : (
                <>
                  <div className="progress-info">
                    <span className="current-title">
                      <Star size={14} /> {pointsInfo.current_title}
                    </span>
                    <span className="next-title">
                      {pointsInfo.next_title} <Star size={14} />
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="progress-points">
                    {pointsInfo.current_points} / {totalNeeded} points
                  </p>
                </>
              )}
            </div>
          )}

          {/* Badges Section */}
          <div className="badges-section">
            <h3>
              <Award size={16} />
              Badges
            </h3>
            {user.badges && user.badges.length > 0 ? (
              <div className="badge-grid">
                {user.badges.map((badge, index) => (
                  <div className="badge-item" key={index}>
                    <span className="badge-icon">{badge.icon}</span>
                    <span className="badge-name">{badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="badges-empty">
                No badges earned yet. Keep posting and engaging!
              </p>
            )}
          </div>

          {/* Edit Actions */}
          {editing && (
            <div className="edit-actions">
              <button
                className="edit-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                className="edit-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Check size={16} />
                    Save
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
