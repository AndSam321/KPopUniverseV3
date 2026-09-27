import api from "./axios";

export const search = async (q, { type, page, signal } = {}) => {
  const response = await api.get("/search", {
    params: { q, type, page },
    signal,
  });
  return response.data;
};
