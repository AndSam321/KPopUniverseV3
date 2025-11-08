import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMyProfile, getUserByUsername } from "../../api/userApi";
import "./Profile.css";

function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} />
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

          {user.bio && (
            <div className="profile-bio">
              <h3>about</h3>
              <p>{user.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
