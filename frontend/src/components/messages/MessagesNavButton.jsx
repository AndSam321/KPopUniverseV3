import { NavLink } from "react-router-dom";
import { Mail } from "lucide-react";
import { useMessages } from "../../context/MessagesContext";
import "./MessagesNavButton.css";

export default function MessagesNavButton() {
  const { unreadCount } = useMessages();

  return (
    <NavLink to="/messages" className="msg-nav" aria-label="Messages">
      <Mail size={20} />
      {unreadCount > 0 && (
        <span className="msg-nav__badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
      )}
    </NavLink>
  );
}
