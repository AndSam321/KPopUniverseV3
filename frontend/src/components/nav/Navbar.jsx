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
  Menu,
  House,
  Mail,
} from "lucide-react";
import CreatePostModal from "../posts/CreatePostModal";
import NavDrawer from "./NavDrawer";
import { useAuth } from "../../context/AuthContext";
import { useMessages } from "../../context/MessagesContext";
import { logout as logoutApi } from "../../api/authApi";
import NotificationsDropdown from "../notifications/NotificationsDropdown";
import MessagesNavButton from "../messages/MessagesNavButton";
import SearchBar from "../search/SearchBar";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const { unreadCount } = useMessages();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logoutApi();
    logout();
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Only reserve space for the bottom tab bar when it's actually shown (logged in)
  useEffect(() => {
    document.body.classList.toggle("has-bottom-nav", !!user);
    return () => document.body.classList.remove("has-bottom-nav");
  }, [user]);

  const tabClass = ({ isActive }) =>
    isActive ? "kp-nav__mobile-tab kp-nav__mobile-tab--active" : "kp-nav__mobile-tab";

  return (
    <nav className="kp-nav">
      <div className="kp-nav__inner">
        {/* Mobile hamburger */}
        <button
          className="kp-nav__burger"
          onClick={() => setDrawerOpen(true)}
          aria-label="menu"
        >
          <Menu size={24} />
        </button>

        {/* Left: Logo (desktop) */}
        <div className="kp-nav__left" onClick={() => navigate("/")}>
          <img
            src="/kpopuniverselogo.svg"
            alt="KPop Universe Logo"
            className="kp-nav__logo-mark"
          />
          <div className="kp-nav__logo-text">k-pop universe</div>
        </div>

        {/* Center: Nav Links (desktop) */}
        <div className="kp-nav__center">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "kp-nav__link kp-nav__link--active" : "kp-nav__link")}>
            <TrendingUp className="kp-nav__icon" />
            <span className="kp-nav__label">for you</span>
          </NavLink>
          <NavLink to="/following" className={({ isActive }) => (isActive ? "kp-nav__link kp-nav__link--active" : "kp-nav__link")}>
            <ContactRound className="kp-nav__icon" />
            <span className="kp-nav__label">following</span>
          </NavLink>
          <NavLink to="/groups" className={({ isActive }) => (isActive ? "kp-nav__link kp-nav__link--active" : "kp-nav__link")}>
            <Users className="kp-nav__icon" />
            <span className="kp-nav__label">explore</span>
          </NavLink>
        </div>

        {/* Right cluster */}
        <div className="kp-nav__right">
          <SearchBar />

          {user && (
            <>
              <button className="kp-nav__create-desktop" onClick={openCreate}>
                <Plus size={18} strokeWidth={2.5} />
                <span>post</span>
              </button>
              <button className="kp-nav__create-mobile" onClick={openCreate} aria-label="create post">
                <Plus size={22} strokeWidth={2.5} />
              </button>
            </>
          )}

          <span className="kp-nav__desktop-only">
            {user && <MessagesNavButton />}
          </span>
          {user && <NotificationsDropdown />}

          {loading ? (
            <div style={{ width: "40px" }}></div>
          ) : user ? (
            <div className="kp-nav__profile-container kp-nav__desktop-only" ref={dropdownRef}>
              <button className="kp-nav__profile" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <div className="kp-nav__profile-circle">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="kp-nav__profile-img" />
                  ) : (
                    user.username?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
              </button>

              {isDropdownOpen && (
                <div className="kp-nav__dropdown">
                  <button className="kp-nav__dropdown-item" onClick={() => { setIsDropdownOpen(false); navigate("/profile"); }}>
                    <User size={18} />
                    <span>view my profile</span>
                  </button>
                  <button className="kp-nav__dropdown-item" onClick={() => { setIsDropdownOpen(false); navigate("/settings"); }}>
                    <Settings size={18} />
                    <span>account settings</span>
                  </button>
                  <button className="kp-nav__dropdown-item" onClick={() => { setIsDropdownOpen(false); navigate("/help"); }}>
                    <CircleHelp size={18} />
                    <span>help &amp; support</span>
                  </button>
                  {user.admin && (
                    <button className="kp-nav__dropdown-item" onClick={() => { setIsDropdownOpen(false); navigate("/admin"); }}>
                      <ChartColumn size={18} />
                      <span>analytics</span>
                    </button>
                  )}
                  <div className="kp-nav__dropdown-divider"></div>
                  <button className="kp-nav__dropdown-item kp-nav__dropdown-item--logout" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="kp-nav__auth-buttons">
              <button className="kp-nav__login-link" onClick={() => navigate("/login")}>
                log in
              </button>
              <button className="kp-nav__login-button" onClick={() => navigate("/register")}>
                join
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom tab bar — members only */}
      {user && (
        <div className="kp-nav__mobile-tabs">
          <NavLink to="/" end className={tabClass}>
            <House size={22} />
            <span>home</span>
          </NavLink>
          <NavLink to="/messages" className={tabClass}>
            <span className="kp-nav__tab-icon">
              <Mail size={22} />
              {unreadCount > 0 && (
                <span className="kp-nav__tab-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </span>
            <span>inbox</span>
          </NavLink>
          <NavLink to="/profile" className={tabClass}>
            <span className="kp-nav__tab-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" />
              ) : (
                user.username?.charAt(0).toUpperCase() || "U"
              )}
            </span>
            <span>you</span>
          </NavLink>
        </div>
      )}

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {showCreate && (
        <CreatePostModal onClose={() => setShowCreate(false)} onCreated={handlePostCreated} />
      )}
    </nav>
  );
}
