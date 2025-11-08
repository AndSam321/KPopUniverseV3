import api from "./axios";

export const getMyProfile = async () => {
  const response = await api.get("/users/my_profile");
  return response.data.data;
};

export const getUserByUsername = async (username) => {
  const response = await api.get(`/users/${username}`);
  return response.data.data;
};
