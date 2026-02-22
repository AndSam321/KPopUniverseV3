import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Heart, MessageCircle, Reply } from "lucide-react";
import { createConsumer } from "@rails/actioncable";
import {
  getNotifications,
  markAllRead,
  markRead,
} from "../../api/notificationsApi";
import { useAuth } from "../../context/AuthContext";
import "./NotificationsDropdown.css";

function formatNotification(notification) {
  const { action, post } = notification;
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
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
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
  const subscriptionRef = useRef(null);

  // Connect to ActionCable for real-time notifications
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    const consumer = createConsumer(
      `ws://localhost:9000/cable?token=${token}`
    );

    subscriptionRef.current = consumer.subscriptions.create(
      "NotificationChannel",
      {
        received(data) {
          setNotifications((prev) => [data, ...prev]);
          setUnreadCount((prev) => prev + 1);
        },
      }
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
      consumer.disconnect();
    };
  }, [user]);

  // Fetch unread notifications when dropdown opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await getNotifications(1, true);
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
    setNotifications([]);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read_at) {
      await markRead(notification.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
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
                  className="notif-item notif-item--unread"
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
                  <div className="notif-item__dot" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
