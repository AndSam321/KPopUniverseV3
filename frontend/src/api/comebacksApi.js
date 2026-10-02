import api from "./axios";

export const getComebacks = async ({ q } = {}) => {
  const params = {};
  if (q) params.q = q;
  const response = await api.get("/comebacks", { params });
  return response.data;
};
