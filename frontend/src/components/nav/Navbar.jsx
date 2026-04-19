import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  ContactRound,
  Users,
  Search,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logout as logoutApi } from "../../api/authApi";
import NotificationsDropdown from "../notifications/NotificationsDropdown";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    navigate("/settings");
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logoutApi();
    logout();
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="kp-nav">
      <div className="kp-nav__inner">
        {/* Left: Logo */}
        <div className="kp-nav__left" onClick={() => navigate("/")}>
          <img
            src="/kpopuniverselogo.svg"
            alt="KPop Universe Logo"
            className="kp-nav__logo-mark"
          />
          <div className="kp-nav__logo-text">k-pop universe</div>
        </div>

        {/* Center: Nav Links (desktop + tablet) */}
        <div className="kp-nav__center">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "kp-nav__link kp-nav__link--active" : "kp-nav__link"
            }
          >
            <TrendingUp className="kp-nav__icon" />
            <span className="kp-nav__label">for you</span>
          </NavLink>

          <NavLink
            to="/following"
            className={({ isActive }) =>
              isActive ? "kp-nav__link kp-nav__link--active" : "kp-nav__link"
            }
          >
            <ContactRound className="kp-nav__icon" />
            <span className="kp-nav__label">following</span>
          </NavLink>

          <NavLink
            to="/groups"
            className={({ isActive }) =>
              isActive ? "kp-nav__link kp-nav__link--active" : "kp-nav__link"
            }
          >
            <Users className="kp-nav__icon" />
            <span className="kp-nav__label">groups</span>
          </NavLink>
        </div>

        {/* Mobile bottom tab bar */}
        <div className="kp-nav__mobile-tabs">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "kp-nav__mobile-tab kp-nav__mobile-tab--active" : "kp-nav__mobile-tab"
            }
          >
            <TrendingUp size={22} />
            <span>for you</span>
          </NavLink>
          <NavLink
            to="/following"
            className={({ isActive }) =>
              isActive ? "kp-nav__mobile-tab kp-nav__mobile-tab--active" : "kp-nav__mobile-tab"
            }
          >
            <ContactRound size={22} />
            <span>following</span>
          </NavLink>
          <NavLink
            to="/groups"
            className={({ isActive }) =>
              isActive ? "kp-nav__mobile-tab kp-nav__mobile-tab--active" : "kp-nav__mobile-tab"
            }
          >
            <Users size={22} />
            <span>groups</span>
          </NavLink>
        </div>

        {/* Right: Search + Profile */}
        <div className="kp-nav__right">
          <div className="kp-nav__search">
            <Search size={18} color="#2a214c" />
            <input
              type="text"
              className="kp-nav__search-input"
              placeholder="search artists, groups, fans..."
            />
          </div>

          {user && <NotificationsDropdown />}

          {loading ? (
            // Show nothing while loading to prevent flash
            <div style={{ width: "80px" }}></div>
          ) : user ? (
            <div className="kp-nav__profile-container" ref={dropdownRef}>
              <button
                className="kp-nav__profile"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="kp-nav__profile-circle">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="kp-nav__profile-img"
                    />
                  ) : (
                    user.username?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
              </button>

              {isDropdownOpen && (
                <div className="kp-nav__dropdown">
                  <button
                    className="kp-nav__dropdown-item"
                    onClick={handleProfileClick}
                  >
                    <User size={18} />
                    <span>view my profile</span>
                  </button>
                  <button
                    className="kp-nav__dropdown-item"
                    onClick={handleSettingsClick}
                  >
                    <Settings size={18} />
                    <span>account settings</span>
                  </button>
                  <div className="kp-nav__dropdown-divider"></div>
                  <button
                    className="kp-nav__dropdown-item kp-nav__dropdown-item--logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="kp-nav__login-button"
              onClick={() => navigate("/login")}
            >
              log in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
