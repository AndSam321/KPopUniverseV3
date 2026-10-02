import api from "./axios";

export const getComebacks = async ({ page = 1, groupType } = {}) => {
  const params = { page };
  if (groupType) params.group_type = groupType;
  const response = await api.get("/comebacks", { params });
  return response.data;
};
