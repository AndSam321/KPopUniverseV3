import api from "./axios";

export const getConversations = (page = 1) =>
  api.get(`/conversations?page=${page}`).then((res) => res.data);

export const getUnreadMessageCount = () =>
  api.get("/conversations/unread_count").then((res) => res.data.unread_count);

export const createConversation = (recipientId) =>
  api
    .post("/conversations", { recipient_id: recipientId })
    .then((res) => res.data.data);

export const createGroupConversation = (memberIds, name) =>
  api
    .post("/conversations", { member_ids: memberIds, name })
    .then((res) => res.data.data);

export const getFriends = () =>
  api.get("/users/friends").then((res) => res.data.data);

export const getMessages = (conversationId, page = 1) =>
  api
    .get(`/conversations/${conversationId}/messages?page=${page}`)
    .then((res) => res.data);

export const sendMessage = (conversationId, { body, image, imageUrl } = {}) => {
  const form = new FormData();
  if (body) form.append("body", body);
  if (image) form.append("image", image);
  if (imageUrl) form.append("image_url", imageUrl);
  return api
    .post(`/conversations/${conversationId}/messages`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data.data);
};

export const markConversationRead = (conversationId) =>
  api.post(`/conversations/${conversationId}/read`).then((res) => res.data);

export const toggleReaction = (conversationId, messageId, emoji) =>
  api
    .post(`/conversations/${conversationId}/messages/${messageId}/reactions`, {
      emoji,
    })
    .then((res) => res.data.data);
