import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMyProfile,
  getUserByUsername,
  updateProfile,
  followUser,
  unfollowUser,
} from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import {
  Star,
  Award,
  Edit3,
  X,
  Check,
  Trophy,
  UserPlus,
  UserCheck,
  Quote,
  CalendarDays,
  Mail,
} from "lucide-react";
import { createConversation } from "../../api/messagesApi";
import FollowListModal from "./FollowListModal";
import AvatarCropper from "./AvatarCropper";
import ProfileToast from "./ProfileToast";
import ProfileActivity from "./ProfileActivity";
import BackButton from "../common/BackButton";
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
  const [messagePending, setMessagePending] = useState(false);
  const navigate = useNavigate();
  const [modalTab, setModalTab] = useState(null);
  const [cropSource, setCropSource] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const isOwnProfile = authUser && user && authUser.id === user.id;

  const handleMessage = async () => {
    if (!user || messagePending) return;
    setMessagePending(true);
    try {
      const conversation = await createConversation(user.id);
      navigate(`/messages/${conversation.id}`);
    } catch {
      setMessagePending(false);
    }
  };

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
        const userData = username
          ? await getUserByUsername(username)
          : await getMyProfile();
        setUser(userData);
      } catch (err) {
        setError(err.response?.data?.message || "failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  // Reflect live progression (points/title/badges) pushed into AuthContext
  useEffect(() => {
    if (!isOwnProfile || !authUser) return;
    setUser((prev) =>
      prev
        ? {
            ...prev,
            idol_points: authUser.idol_points,
            title: authUser.title,
            points_info: authUser.points_info,
            badges: authUser.badges,
          }
        : prev
    );
  }, [isOwnProfile, authUser?.idol_points, authUser?.title, authUser?.badges]);

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
    setCropSource(file);
    e.target.value = "";
  };

  const handleCropSave = async (croppedBlob) => {
    const croppedFile = new File([croppedBlob], "avatar.jpg", {
      type: "image/jpeg",
    });
    setCropSource(null);

    if (editing) {
      setAvatarFile(croppedFile);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(URL.createObjectURL(croppedBlob));
      return;
    }

    const optimisticUrl = URL.createObjectURL(croppedBlob);
    const previousAvatarUrl = user.avatar_url;
    setUser((prev) => ({ ...prev, avatar_url: optimisticUrl }));
    updateUser({ ...user, avatar_url: optimisticUrl });

    try {
      const formData = new FormData();
      formData.append("avatar", croppedFile);
      const updatedUser = await updateProfile(formData);
      setUser(updatedUser);
      updateUser(updatedUser);
      URL.revokeObjectURL(optimisticUrl);
    } catch (err) {
      setUser((prev) => ({ ...prev, avatar_url: previousAvatarUrl }));
      updateUser({ ...user, avatar_url: previousAvatarUrl });
      URL.revokeObjectURL(optimisticUrl);
      setToast({
        variant: "error",
        message: err.response?.data?.message || "couldn't save avatar — try again",
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("bio", bio);
      if (avatarFile) formData.append("avatar", avatarFile);

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
        <div className="profile-loading">
          <div className="profile-loading__ring" />
          <p>tuning in…</p>
        </div>
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

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="profile-page">
      <div className="profile-container">
        <BackButton fallback="/" />
        {/* ========== HERO ========== */}
        <section className="profile-hero">
          <div className="profile-hero__top">
            <div className="profile-avatar-frame">
              {isOwnProfile ? (
                <div
                  className="profile-avatar-frame__upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {displayAvatar ? (
                    <img src={displayAvatar} alt={user.username} />
                  ) : (
                    <div className="profile-avatar-frame__placeholder">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="profile-avatar-frame__overlay">
                    <Edit3 size={18} strokeWidth={2.2} />
                    <span>change</span>
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
                <img
                  className="profile-avatar-frame__img"
                  src={displayAvatar}
                  alt={user.username}
                />
              ) : (
                <div className="profile-avatar-frame__placeholder">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-identity">
              <h1 className="profile-identity__name">{user.username}</h1>
              <div className="profile-identity__titleRow">
                <span className="profile-identity__rank">
                  <Star size={12} strokeWidth={2.5} />
                  {user.title}
                  <span className="profile-identity__rankPts">
                    · {user.idol_points} pts
                  </span>
                </span>
                <span className="profile-identity__since">
                  <CalendarDays size={12} strokeWidth={2.2} />
                  since {memberSince}
                </span>
              </div>
            </div>

            <div className="profile-hero__action">
              {isOwnProfile && !editing && (
                <button className="hero-btn hero-btn--edit" onClick={handleEditClick}>
                  <Edit3 size={14} strokeWidth={2.5} />
                  edit
                </button>
              )}
              {!isOwnProfile && authUser && (
                <>
                  <button
                    className={`hero-btn hero-btn--follow${
                      user.is_following ? " hero-btn--following" : ""
                    }`}
                    onClick={handleFollowToggle}
                    disabled={followPending}
                  >
                    {user.is_following ? (
                      <UserCheck size={14} strokeWidth={2.5} />
                    ) : (
                      <UserPlus size={14} strokeWidth={2.5} />
                    )}
                    {user.is_following ? "following" : "follow"}
                  </button>
                  <button
                    className="hero-btn hero-btn--message"
                    onClick={handleMessage}
                    disabled={messagePending}
                  >
                    <Mail size={14} strokeWidth={2.5} />
                    message
                  </button>
                  {followError && (
                    <div className="hero-btn__error">{followError}</div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ========== STATS STRIP ========== */}
          <div className="profile-stats">
            <button
              type="button"
              className="profile-stat profile-stat--interactive"
              onClick={() => setModalTab("followers")}
            >
              <span className="profile-stat__value">
                {user.followers_count ?? 0}
              </span>
              <span className="profile-stat__label">followers</span>
            </button>

            <span className="profile-stat__divider" aria-hidden="true" />

            <button
              type="button"
              className="profile-stat profile-stat--interactive"
              onClick={() => setModalTab("following")}
            >
              <span className="profile-stat__value">
                {user.following_count ?? 0}
              </span>
              <span className="profile-stat__label">following</span>
            </button>
          </div>
        </section>

        {/* ========== BIO CARD ========== */}
        {(editing || user.bio) && (
          <section className="profile-block profile-bio">
            <div className="profile-block__label">
              <Quote size={12} strokeWidth={2.5} />
              <span>about</span>
            </div>
            {editing ? (
              <>
                <textarea
                  className="profile-bio__textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 300))}
                  placeholder="About me..."
                  rows={4}
                  maxLength={300}
                />
                <span className="profile-bio__count">{bio.length}/300</span>
              </>
            ) : (
              <p className="profile-bio__body">{user.bio}</p>
            )}
          </section>
        )}

        {/* ========== POINTS TRACKER ========== */}
        {pointsInfo && (
          <section className="profile-block profile-progress">
            <div className="profile-block__label">
              <Trophy size={12} strokeWidth={2.5} />
              <span>progress</span>
            </div>

            {isMaxLevel ? (
              <div className="profile-progress__max">
                <div className="profile-progress__tier profile-progress__tier--current">
                  <Star size={14} strokeWidth={2.2} fill="currentColor" />
                  {pointsInfo.current_title}
                </div>
                <span className="profile-progress__maxBadge">max tier reached</span>
              </div>
            ) : (
              <>
                <div className="profile-progress__tiers">
                  <div className="profile-progress__tier profile-progress__tier--current">
                    <Star size={14} strokeWidth={2.2} fill="currentColor" />
                    {pointsInfo.current_title}
                  </div>
                  <div className="profile-progress__tier profile-progress__tier--next">
                    {pointsInfo.next_title}
                    <Star size={14} strokeWidth={2.2} />
                  </div>
                </div>

                <div className="profile-progress__bar">
                  <div
                    className="profile-progress__fill"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <span className="profile-progress__shimmer" />
                  </div>
                </div>

                <p className="profile-progress__meta">
                  <span>{pointsInfo.current_points}</span>
                  <span className="profile-progress__sep">/</span>
                  <span>{totalNeeded} idol points</span>
                </p>
              </>
            )}
          </section>
        )}

        {/* ========== BADGES ========== */}
        <section className="profile-block profile-badges">
          <div className="profile-block__label">
            <Award size={12} strokeWidth={2.5} />
            <span>badges</span>
          </div>

          {user.badges && user.badges.length > 0 ? (
            <div className="profile-badges__grid">
              {user.badges.map((badge, index) => (
                <div className="profile-badge" key={index}>
                  <span className="profile-badge__icon">{badge.icon}</span>
                  <span className="profile-badge__name">{badge.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="profile-badges__empty">
              no badges yet — post, comment, and hype up the community to earn your first.
            </p>
          )}
        </section>

        {/* ========== POSTS & COMMENTS ========== */}
        {!editing && <ProfileActivity user={user} />}

        {/* ========== EDIT ACTION BAR ========== */}
        {editing && (
          <div className="profile-edit-actions">
            <button
              className="profile-edit-btn profile-edit-btn--cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={14} strokeWidth={2.5} />
              cancel
            </button>
            <button
              className="profile-edit-btn profile-edit-btn--save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>saving…</>
              ) : (
                <>
                  <Check size={14} strokeWidth={2.5} />
                  save
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {modalTab && (
        <FollowListModal
          username={user.username}
          initialTab={modalTab}
          onClose={() => setModalTab(null)}
        />
      )}

      {cropSource && (
        <AvatarCropper
          file={cropSource}
          onSave={handleCropSave}
          onCancel={() => setCropSource(null)}
        />
      )}

      {toast && (
        <ProfileToast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Profile;
