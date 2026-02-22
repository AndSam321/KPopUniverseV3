import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Heart, MessageCircle, Reply } from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
} from "../../api/notificationsApi";
import { useAuth } from "../../context/AuthContext";
import "./NotificationsDropdown.css";

function formatNotification(notification) {
  const { actor, action, post } = notification;
  const postTitle = post?.title
    ? post.title.length > 40
      ? post.title.slice(0, 40) + "..."
      : post.title
    : "a post";

  switch (action) {
    case "liked":
      return `liked your post "${postTitle}"`;
    case "commented":
      return `commented on your post "${postTitle}"`;
    case "replied":
      return `replied to your comment on "${postTitle}"`;
    default:
      return `interacted with "${postTitle}"`;
  }
}

function getActionIcon(action) {
  switch (action) {
    case "liked":
      return <Heart size={14} className="notif-icon notif-icon--like" />;
    case "commented":
      return (
        <MessageCircle size={14} className="notif-icon notif-icon--comment" />
      );
    case "replied":
      return <Reply size={14} className="notif-icon notif-icon--reply" />;
    default:
      return <Bell size={14} className="notif-icon" />;
  }
}

function timeAgo(dateString) {
  const seconds = Math.floor(
    (new Date() - new Date(dateString)) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // silently fail - non-critical
    }
  }, [user]);

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full notifications when dropdown opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(data.data);
        setUnreadCount(data.unread_count);
      } catch (err) {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read_at) {
      await markRead(notification.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
    }

    setIsOpen(false);
    if (notification.post) {
      navigate(`/posts/${notification.post.id}`);
    }
  };

  if (!user) return null;

  return (
    <div className="notif-container" ref={dropdownRef}>
      <button
        className="notif-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h3 className="notif-title">notifications</h3>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={handleMarkAllRead}>
                <CheckCheck size={14} />
                mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {loading ? (
              <div className="notif-loading">loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={32} strokeWidth={1} />
                <p>no notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`notif-item ${!notification.read_at ? "notif-item--unread" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notif-item__icon">
                    {getActionIcon(notification.action)}
                  </div>
                  <div className="notif-item__content">
                    <p className="notif-item__text">
                      <strong>{notification.actor.username}</strong>{" "}
                      {formatNotification(notification)}
                    </p>
                    <span className="notif-item__time">
                      {timeAgo(notification.created_at)}
                    </span>
                  </div>
                  {!notification.read_at && (
                    <div className="notif-item__dot" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
