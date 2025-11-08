import React from "react";
import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { TrendingUp, ContactRound, Users, Search } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="kp-nav">
      <div className="kp-nav__inner">
        {/* Left: Logo */}
        <div className="kp-nav__left">
          <div className="kp-nav__logo-mark">K</div>
          <div className="kp-nav__logo-text">KPop Universe</div>
        </div>

        {/* Center: Nav Links */}
        <div className="kp-nav__center">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? "kp-nav__link kp-nav__link--active"
                : "kp-nav__link"
            }
          >
            <TrendingUp className="kp-nav__icon" />
            <span className="kp-nav__label">for you</span>
          </NavLink>

          <NavLink
            to="/following"
            className={({ isActive }) =>
              isActive
                ? "kp-nav__link kp-nav__link--active"
                : "kp-nav__link"
            }
          >
            <ContactRound className="kp-nav__icon" />
            <span className="kp-nav__label">following</span>
          </NavLink>

          <NavLink
            to="/groups"
            className={({ isActive }) =>
              isActive
                ? "kp-nav__link kp-nav__link--active"
                : "kp-nav__link"
            }
          >
            <Users className="kp-nav__icon" />
            <span className="kp-nav__label">groups</span>
          </NavLink>
        </div>

        {/* Right: Search + Profile */}
        <div className="kp-nav__right">
          <div className="kp-nav__search">
            <Search size={18} color="#2a214c" />
            <input
              type="text"
              className="kp-nav__search-input"
              placeholder="Search..."
            />
          </div>
          <button className="kp-nav__profile">
            <div className="kp-nav__profile-circle">K</div>
          </button>
        </div>
      </div>
    </nav>
  );
}
