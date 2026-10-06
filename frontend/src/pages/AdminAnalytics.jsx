import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Users, FileText, MessageSquare, Boxes, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAdminStats } from "../api/adminApi";
import "./AdminAnalytics.css";

function TrendChart({ data, color = "#757bc8" }) {
  const w = 600;
  const h = 160;
  const pad = 8;
  const max = Math.max(1, ...data.map((d) => d.count));
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const x = (i) => pad + i * step;
  const y = (v) => h - pad - (v / max) * (h - pad * 2);
  const line = data.map((d, i) => `${x(i)},${y(d.count)}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${x(data.length - 1)},${h - pad}`;

  return (
    <svg className="admin-chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img">
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {data.map((d, i) => (
        <circle key={d.date} cx={x(i)} cy={y(d.count)} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

function BarList({ items, labelKey }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="admin-barlist">
      {items.map((item) => (
        <div className="admin-barlist__row" key={item[labelKey]}>
          <span className="admin-barlist__label">{item[labelKey]}</span>
          <div className="admin-barlist__track">
            <div className="admin-barlist__fill" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
          <span className="admin-barlist__count">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

const CARD_ICONS = {
  users: Users,
  posts: FileText,
  comments: MessageSquare,
  communities: Boxes,
  likes: Heart,
};

export default function AdminAnalytics() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.admin) return;
    getAdminStats()
      .then(setStats)
      .catch(() => setError("Failed to load analytics."));
  }, [user?.admin]);

  if (loading) return null;
  if (!user?.admin) return <Navigate to="/" replace />;

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const timeAgo = (iso) => {
    const s = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="admin">
      <header className="admin__header">
        <h1 className="page-title">Analytics</h1>
        <p className="admin__subtitle">How people are using K-pop Universe.</p>
      </header>

      {error && <div className="admin__error">{error}</div>}

      {!stats && !error && <div className="admin__loading">Loading…</div>}

      {stats && (
        <>
          <div className="admin__cards">
            {["users", "posts", "comments", "communities", "likes"].map((key) => {
              const Icon = CARD_ICONS[key];
              return (
                <div className="admin-card" key={key}>
                  <Icon size={18} className="admin-card__icon" strokeWidth={2.5} />
                  <span className="admin-card__value">{stats.totals[key]}</span>
                  <span className="admin-card__label">{key}</span>
                </div>
              );
            })}
          </div>

          <div className="admin-card admin__active">
            <span className="admin-card__label">Active users (signed in)</span>
            <div className="admin__active-row">
              <div><strong>{stats.active_users.day}</strong><span>today</span></div>
              <div><strong>{stats.active_users.week}</strong><span>this week</span></div>
              <div><strong>{stats.active_users.month}</strong><span>this month</span></div>
            </div>
          </div>

          <div className="admin__panel">
            <div className="admin__panel-head">
              <h2>New signups</h2>
              <span>last 14 days</span>
            </div>
            <TrendChart data={stats.signups_by_day} color="#757bc8" />
            <div className="admin__axis">
              <span>{fmtDate(stats.signups_by_day[0].date)}</span>
              <span>{fmtDate(stats.signups_by_day.at(-1).date)}</span>
            </div>

            <div className="admin__recent">
              <div className="admin__recent-title">Newest members</div>
              {stats.recent_users.map((u) => (
                <div className="admin__recent-row" key={u.id}>
                  <img className="admin__recent-avatar" src={u.avatar_url} alt="" />
                  <div className="admin__recent-info">
                    <span className="admin__recent-name">{u.username}</span>
                    <span className="admin__recent-email">{u.email}</span>
                  </div>
                  <span className="admin__recent-time">{timeAgo(u.created_at)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin__panel">
            <div className="admin__panel-head">
              <h2>Posts created</h2>
              <span>last 14 days</span>
            </div>
            <TrendChart data={stats.posts_by_day} color="#ff6fb1" />
            <div className="admin__axis">
              <span>{fmtDate(stats.posts_by_day[0].date)}</span>
              <span>{fmtDate(stats.posts_by_day.at(-1).date)}</span>
            </div>
          </div>

          <div className="admin__grid">
            <div className="admin__panel">
              <div className="admin__panel-head"><h2>Top groups by posts</h2></div>
              <BarList items={stats.top_groups} labelKey="name" />
            </div>
            <div className="admin__panel">
              <div className="admin__panel-head"><h2>Top posters</h2></div>
              <BarList items={stats.top_posters} labelKey="username" />
            </div>
          </div>

          <div className="admin__panel">
            <div className="admin__panel-head">
              <h2>Feedback</h2>
              <span>{stats.feedback.length} recent</span>
            </div>
            {stats.feedback.length === 0 ? (
              <p className="admin__empty">No feedback yet.</p>
            ) : (
              <div className="admin__feedback">
                {stats.feedback.map((fb) => (
                  <div className="admin__feedback-row" key={fb.id}>
                    <p className="admin__feedback-msg">{fb.message}</p>
                    <div className="admin__feedback-meta">
                      <span className="admin__feedback-user">{fb.username}</span>
                      <span className="admin__feedback-time">{timeAgo(fb.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin__panel">
            <div className="admin__panel-head">
              <h2>Content sync</h2>
              <span>
                {stats.group_sync.filter((g) => g.status === "error").length} errors
              </span>
            </div>
            <div className="admin__sync">
              {stats.group_sync.map((g) => (
                <div className="admin__sync-row" key={g.id}>
                  <span className="admin__sync-name">{g.name}</span>
                  <span className="admin__sync-albums">{g.albums} albums</span>
                  <span
                    className={`admin__sync-badge admin__sync-badge--${g.status || "none"}`}
                  >
                    {g.status || "—"}
                  </span>
                  <span className="admin__sync-time">
                    {g.last_synced_at ? timeAgo(g.last_synced_at) : "never"}
                  </span>
                  {g.error && (
                    <span className="admin__sync-error" title={g.error}>
                      {g.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
