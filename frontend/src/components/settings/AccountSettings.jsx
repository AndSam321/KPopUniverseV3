import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { updateNotificationPreferences } from "../../api/userApi";
import { Moon, Sun, Heart, MessageCircle, Reply } from "lucide-react";
import "./AccountSettings.css";

function AccountSettings() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const [prefs, setPrefs] = useState({
    likes: true,
    comments: true,
    replies: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.notification_preferences) {
      setPrefs(user.notification_preferences);
    }
  }, [user]);

  const handleTogglePref = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      const userData = await updateNotificationPreferences(updated);
      updateUser(userData);
    } catch (err) {
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-card">
          <h1 className="settings-title">account settings</h1>

          <div className="settings-section">
            <h2 className="settings-section-title">appearance</h2>

            <div className="settings-item">
              <div className="settings-item-info">
                <div className="settings-item-label">
                  {isDarkMode ? (
                    <Moon size={20} className="settings-icon" />
                  ) : (
                    <Sun size={20} className="settings-icon" />
                  )}
                  <span>dark mode</span>
                </div>
                <p className="settings-item-description">
                  toggle between light and dark theme
                </p>
              </div>

              <button
                className={`settings-toggle ${isDarkMode ? "settings-toggle--active" : ""}`}
                onClick={toggleTheme}
                aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              >
                <div className="settings-toggle-slider"></div>
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h2 className="settings-section-title">notifications</h2>

            <div className="settings-items-stack">
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">
                    <Heart size={20} className="settings-icon" />
                    <span>likes</span>
                  </div>
                  <p className="settings-item-description">
                    notify me when someone likes my post
                  </p>
                </div>

                <button
                  className={`settings-toggle ${prefs.likes ? "settings-toggle--active" : ""}`}
                  onClick={() => handleTogglePref("likes")}
                  disabled={saving}
                >
                  <div className="settings-toggle-slider"></div>
                </button>
              </div>

              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">
                    <MessageCircle size={20} className="settings-icon" />
                    <span>comments</span>
                  </div>
                  <p className="settings-item-description">
                    notify me when someone comments on my post
                  </p>
                </div>

                <button
                  className={`settings-toggle ${prefs.comments ? "settings-toggle--active" : ""}`}
                  onClick={() => handleTogglePref("comments")}
                  disabled={saving}
                >
                  <div className="settings-toggle-slider"></div>
                </button>
              </div>

              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">
                    <Reply size={20} className="settings-icon" />
                    <span>replies</span>
                  </div>
                  <p className="settings-item-description">
                    notify me when someone replies to my comment
                  </p>
                </div>

                <button
                  className={`settings-toggle ${prefs.replies ? "settings-toggle--active" : ""}`}
                  onClick={() => handleTogglePref("replies")}
                  disabled={saving}
                >
                  <div className="settings-toggle-slider"></div>
                </button>
              </div>
            </div>

            <p className="settings-mute-hint">
              you can also mute notifications from specific groups on their group page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
