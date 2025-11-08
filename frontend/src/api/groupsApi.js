import api from "./axios";

export const getGroups = async () => {
  const response = await api.get("/groups");
  return response.data.data;
};

export const getGroup = async (groupId, page = 1) => {
  const response = await api.get(`/groups/${groupId}`, {
    params: { page },
  });
  return response.data.data;
};

export const createGroup = async (groupData) => {
  const response = await api.post("/groups", groupData);
  return response.data.data;
};
