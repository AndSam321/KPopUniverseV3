import api from "./axios";

export const getPosts = async (page = 1, { communityId, userId } = {}) => {
  const params = { page };
  if (communityId) params.community_id = communityId;
  if (userId) params.user_id = userId;
  const response = await api.get("/posts", { params });
  return response.data;
};

export const getFollowingFeed = async (page = 1) => {
  const response = await api.get("/posts/following", {
    params: { page },
  });
  return response.data;
};

export const getPost = async (postId) => {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
};

export const createPost = async (postData) => {
  const formData = new FormData();

  formData.append("title", postData.title);
  if (postData.caption) {
    formData.append("caption", postData.caption);
  }

  if (postData.flair) {
    formData.append("flair", postData.flair);
  }

  if (postData.images && postData.images.length > 0) {
    postData.images.forEach((image) => {
      formData.append("images[]", image);
    });
  }

  if (postData.communityId) {
    formData.append("community_id", postData.communityId);
  }

  const response = await api.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const updatePost = async (postId, postData) => {
  const formData = new FormData();

  if (postData.title) {
    formData.append("title", postData.title);
  }
  if (postData.caption !== undefined) {
    formData.append("caption", postData.caption);
  }

  if (postData.images && postData.images.length > 0) {
    postData.images.forEach((image) => {
      formData.append("images[]", image);
    });
  }

  const response = await api.patch(`/posts/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const deletePost = async (postId) => {
  await api.delete(`/posts/${postId}`);
};

export const likePost = async (postId) => {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
};

export const unlikePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}/unlike`);
  return response.data;
};
