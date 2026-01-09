import api from "./axios";

export const getComments = async (postId) => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
};

export const createComment = async (postId, content, parentId = null) => {
  const response = await api.post(`/posts/${postId}/comments`, {
    content,
    parent_id: parentId,
  });
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
