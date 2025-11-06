// src/api/authApi.js
import api from "./axios";

export const signup = async ({ email, password, passwordConfirmation, username }) => {
  const response = await api.post("/auth", {
    user: {
      email,
      password,
      password_confirmation: passwordConfirmation,
      username,
    },
  });

  // Rails JSON: { success, message, data: { user, token } }
  const { data } = response.data;

  if (data?.token) {
    localStorage.setItem("authToken", data.token);
  }

  return data; // { user, token }
};
