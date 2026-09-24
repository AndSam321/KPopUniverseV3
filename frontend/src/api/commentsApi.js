import api from "./axios";

export const getComments = async (postId) => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
};

export const createComment = async (
  postId,
  { content = "", parentId = null, imageFile = null, imageUrl = null } = {}
) => {
  const formData = new FormData();
  if (content) formData.append("content", content);
  if (parentId) formData.append("parent_id", parentId);
  if (imageUrl) formData.append("image_url", imageUrl);
  if (imageFile) formData.append("image", imageFile);

  const response = await api.post(`/posts/${postId}/comments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const likeComment = async (commentId) => {
  const response = await api.post(`/comments/${commentId}/like`);
  return response.data;
};

export const updateComment = async (commentId, content) => {
  const response = await api.patch(`/comments/${commentId}`, {
    content,
  });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};
