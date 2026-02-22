import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Heart,
  MessageCircle,
  Reply,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { getNotifications, markAllRead, markRead } from "../api/notificationsApi";
import "./NotificationsPage.css";

function formatNotification(notification) {
  const { action, post } = notification;
  const postTitle = post?.title
    ? post.title.length > 50
      ? post.title.slice(0, 50) + "..."
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
      return <Heart size={18} className="notif-page-icon notif-page-icon--like" />;
    case "commented":
      return <MessageCircle size={18} className="notif-page-icon notif-page-icon--comment" />;
    case "replied":
      return <Reply size={18} className="notif-page-icon notif-page-icon--reply" />;
    default:
      return <Bell size={18} className="notif-page-icon" />;
  }
}

function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const data = await getNotifications(pageNum, false);
      setNotifications(data.data);
      setUnreadCount(data.unread_count);
      setTotalPages(data.pagination.total_pages);
    } catch (err) {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(page);
  }, [page, fetchNotifications]);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
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

    if (notification.post) {
      navigate(`/posts/${notification.post.id}`);
    }
  };

  return (
    <div className="notif-page">
      <div className="notif-page__container">
        <button className="notif-page__back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>

        <div className="notif-page__card">
          <div className="notif-page__header">
            <h1 className="notif-page__title">
              <Bell size={24} />
              notifications
            </h1>
            {unreadCount > 0 && (
              <button className="notif-page__mark-all" onClick={handleMarkAllRead}>
                <CheckCheck size={16} />
                mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div className="notif-page__loading">loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="notif-page__empty">
              <Bell size={48} strokeWidth={1} />
              <p>no notifications yet</p>
              <span>when someone likes or comments on your posts, you'll see it here</span>
            </div>
          ) : (
            <>
              <div className="notif-page__list">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`notif-page__item ${!notification.read_at ? "notif-page__item--unread" : ""}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notif-page__item-icon">
                      {getActionIcon(notification.action)}
                    </div>
                    <div className="notif-page__item-content">
                      <p className="notif-page__item-text">
                        <strong>{notification.actor.username}</strong>{" "}
                        {formatNotification(notification)}
                      </p>
                      <span className="notif-page__item-time">
                        {timeAgo(notification.created_at)}
                      </span>
                    </div>
                    {!notification.read_at && <div className="notif-page__item-dot" />}
                  </button>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="notif-page__pagination">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="notif-page__page-btn"
                  >
                    previous
                  </button>
                  <span className="notif-page__page-info">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="notif-page__page-btn"
                  >
                    next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
