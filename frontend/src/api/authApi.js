import api from "./axios";

/**
 * Register a new user
 * POST /api/v1/auth
 */
export const signup = async (userData) => {
  const response = await api.post("/auth", {
    user: {
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.passwordConfirmation,
      username: userData.username,
    },
  });

  const token = response.data?.data?.token;
  if (token) {
    localStorage.setItem("authToken", token);
  }

  return response.data.data;
};

/**
 * Log in existing user
 * POST /api/v1/auth/sign_in
 */
export const login = async (credentials) => {
  const response = await api.post("/auth/sign_in", {
    user: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  const token = response.data?.data?.token;
  if (token) {
    localStorage.setItem("authToken", token);
  }

  return response.data.data;
};

/**
 * Log out current user
 * DELETE /api/v1/auth/sign_out
 */
export const logout = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      await api.delete("/auth/sign_out", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    // Backend may return 500 due to JWT middleware, but logout still works
    // The important part is removing the token from localStorage
    if (error.response?.status !== 500) {
      console.error("Logout failed:", error);
    }
  } finally {
    localStorage.removeItem("authToken");
  }
};
