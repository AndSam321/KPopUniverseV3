import api from "./axios";

export const getConversations = (page = 1) =>
  api.get(`/conversations?page=${page}`).then((res) => res.data);

export const getUnreadMessageCount = () =>
  api.get("/conversations/unread_count").then((res) => res.data.unread_count);

export const createConversation = (recipientId) =>
  api
    .post("/conversations", { recipient_id: recipientId })
    .then((res) => res.data.data);

export const getMessages = (conversationId, page = 1) =>
  api
    .get(`/conversations/${conversationId}/messages?page=${page}`)
    .then((res) => res.data);

export const sendMessage = (conversationId, body) =>
  api
    .post(`/conversations/${conversationId}/messages`, { body })
    .then((res) => res.data.data);

export const markConversationRead = (conversationId) =>
  api.post(`/conversations/${conversationId}/read`).then((res) => res.data);
