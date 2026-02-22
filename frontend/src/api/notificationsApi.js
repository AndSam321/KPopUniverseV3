import api from "./axios";

export const getNotifications = (page = 1) =>
  api.get(`/notifications?page=${page}`).then((res) => res.data);

export const getUnreadCount = () =>
  api.get("/notifications/unread_count").then((res) => res.data.unread_count);

export const markAllRead = () =>
  api.post("/notifications/mark_all_read").then((res) => res.data);

export const markRead = (id) =>
  api.patch(`/notifications/${id}/mark_read`).then((res) => res.data);
