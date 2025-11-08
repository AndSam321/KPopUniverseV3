import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import "./AccountSettings.css";

function AccountSettings() {
  const { isDarkMode, toggleTheme } = useTheme();

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
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
