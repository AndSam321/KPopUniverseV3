import api from "./axios";

export const getPosts = async (page = 1) => {
  const response = await api.get("/posts", {
    params: { page },
  });
  return response.data;
};

export const getPost = async (postId) => {
  const response = await api.get(`/posts/${postId}`);
  return response.data.data;
};

export const createPost = async (postData) => {
  const formData = new FormData();

  formData.append("title", postData.title);
  if (postData.caption) {
    formData.append("caption", postData.caption);
  }

  if (postData.images && postData.images.length > 0) {
    postData.images.forEach((image) => {
      formData.append("images[]", image);
    });
  }

  if (postData.groupIds && postData.groupIds.length > 0) {
    postData.groupIds.forEach((groupId) => {
      formData.append("group_ids[]", groupId);
    });
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

  if (postData.groupIds && postData.groupIds.length > 0) {
    postData.groupIds.forEach((groupId) => {
      formData.append("group_ids[]", groupId);
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
