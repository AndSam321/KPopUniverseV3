import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Users,
  CalendarDays,
  CircleHelp,
  Settings,
  ChartColumn,
  LogOut,
  User,
  ContactRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logout as logoutApi } from "../../api/authApi";
import "./NavDrawer.css";

export default function NavDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const go = (path) => () => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    onClose();
    await logoutApi();
    logout();
    navigate("/login");
  };

  return (
    <div className="nav-drawer__overlay" onClick={onClose}>
      <aside className="nav-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="nav-drawer__head">
          <div className="nav-drawer__brand">
            <img src="/kpopuniverselogo.svg" alt="" className="nav-drawer__logo" />
            <span>K-pop Universe</span>
          </div>
          <button className="nav-drawer__close" onClick={onClose} aria-label="close">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <nav className="nav-drawer__links">
          <button className="nav-drawer__link" onClick={go("/following")}>
            <ContactRound size={20} /> <span>Following</span>
          </button>
          <button className="nav-drawer__link" onClick={go("/groups")}>
            <Users size={20} /> <span>Explore groups</span>
          </button>
          <button className="nav-drawer__link" onClick={go("/comebacks")}>
            <CalendarDays size={20} /> <span>Comebacks</span>
          </button>
          <button className="nav-drawer__link" onClick={go("/help")}>
            <CircleHelp size={20} /> <span>Help &amp; support</span>
          </button>

          {user && (
            <>
              <div className="nav-drawer__divider" />
              <button className="nav-drawer__link" onClick={go("/profile")}>
                <User size={20} /> <span>My profile</span>
              </button>
              <button className="nav-drawer__link" onClick={go("/settings")}>
                <Settings size={20} /> <span>Account settings</span>
              </button>
              {user.admin && (
                <button className="nav-drawer__link" onClick={go("/admin")}>
                  <ChartColumn size={20} /> <span>Analytics</span>
                </button>
              )}
              <button
                className="nav-drawer__link nav-drawer__link--logout"
                onClick={handleLogout}
              >
                <LogOut size={20} /> <span>Log out</span>
              </button>
            </>
          )}

          {!user && (
            <>
              <div className="nav-drawer__divider" />
              <button className="nav-drawer__cta nav-drawer__cta--primary" onClick={go("/register")}>
                Join the community
              </button>
              <button className="nav-drawer__cta" onClick={go("/login")}>
                Log in
              </button>
            </>
          )}
        </nav>
      </aside>
    </div>
  );
}
