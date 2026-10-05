import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  ContactRound,
  Users,
  User,
  Settings,
  CircleHelp,
  ChartColumn,
  Plus,
  LogOut,
} from "lucide-react";
import CreatePostModal from "../posts/CreatePostModal";
import { useAuth } from "../../context/AuthContext";
import { logout as logoutApi } from "../../api/authApi";
import NotificationsDropdown from "../notifications/NotificationsDropdown";
import MessagesNavButton from "../messages/MessagesNavButton";
import SearchBar from "../search/SearchBar";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const dropdownRef = useRef(null);

  const openCreate = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowCreate(true);
  };

  const handlePostCreated = (post) => {
    setShowCreate(false);
    if (post?.id) navigate(`/posts/${post.id}`);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    navigate("/settings");
  };

  const handleHelpClick = () => {
    setIsDropdownOpen(false);
    navigate("/help");
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
            <span className="kp-nav__label">explore</span>
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
          <button
            type="button"
            className="kp-nav__create-tab"
            onClick={openCreate}
            aria-label="create post"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
          <NavLink
            to="/groups"
            className={({ isActive }) =>
              isActive ? "kp-nav__mobile-tab kp-nav__mobile-tab--active" : "kp-nav__mobile-tab"
            }
          >
            <Users size={22} />
            <span>explore</span>
          </NavLink>
        </div>

        {/* Right: Search + Profile */}
        <div className="kp-nav__right">
          <SearchBar />

          <button
            type="button"
            className="kp-nav__create-desktop"
            onClick={openCreate}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>post</span>
          </button>

          {user && <MessagesNavButton />}
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
                  <button
                    className="kp-nav__dropdown-item"
                    onClick={handleHelpClick}
                  >
                    <CircleHelp size={18} />
                    <span>help &amp; support</span>
                  </button>
                  {user.admin && (
                    <button
                      className="kp-nav__dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/admin");
                      }}
                    >
                      <ChartColumn size={18} />
                      <span>analytics</span>
                    </button>
                  )}
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
            <div className="kp-nav__auth-buttons">
              <button
                className="kp-nav__login-link"
                onClick={() => navigate("/login")}
              >
                log in
              </button>
              <button
                className="kp-nav__login-button"
                onClick={() => navigate("/register")}
              >
                join
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={handlePostCreated}
        />
      )}
    </nav>
  );
}
