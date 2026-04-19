import api from "./axios";

export const getMyProfile = async () => {
  const response = await api.get("/users/my_profile");
  return response.data.data;
};

export const getUserByUsername = async (username) => {
  const response = await api.get(`/users/${username}`);
  return response.data.data;
};

export const updateProfile = async (formData) => {
  const response = await api.patch("/users/update_profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const updateNotificationPreferences = async (preferences) => {
  const response = await api.patch("/users/update_notification_preferences", {
    notification_preferences: preferences,
  });
  return response.data.data;
};

export const toggleMuteGroup = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/toggle_mute`);
  return response.data;
};

export const followUser = async (username) => {
  const response = await api.post(`/users/${username}/follow`);
  return response.data;
};

export const unfollowUser = async (username) => {
  const response = await api.delete(`/users/${username}/follow`);
  return response.data;
};

export const getFollowers = async (username) => {
  const response = await api.get(`/users/${username}/followers`);
  return response.data.data;
};

export const getFollowing = async (username) => {
  const response = await api.get(`/users/${username}/following`);
  return response.data.data;
};
