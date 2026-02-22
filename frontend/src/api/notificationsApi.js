import api from "./axios";

export const getNotifications = (page = 1, unreadOnly = false) => {
  const params = new URLSearchParams({ page });
  if (unreadOnly) params.append("unread", "true");
  return api.get(`/notifications?${params}`).then((res) => res.data);
};

export const getUnreadCount = () =>
  api.get("/notifications/unread_count").then((res) => res.data.unread_count);

export const markAllRead = () =>
  api.post("/notifications/mark_all_read").then((res) => res.data);

export const markRead = (id) =>
  api.patch(`/notifications/${id}/mark_read`).then((res) => res.data);
