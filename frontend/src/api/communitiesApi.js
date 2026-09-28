import api from "./axios";

export const getGroupCommunities = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/communities`);
  return response.data.data;
};

export const createCommunity = async (groupId, attributes) => {
  const response = await api.post(`/groups/${groupId}/communities`, attributes);
  return response.data.data;
};

export const joinCommunity = async (communityId) => {
  const response = await api.post(`/communities/${communityId}/join`);
  return response.data.data;
};

export const leaveCommunity = async (communityId) => {
  const response = await api.delete(`/communities/${communityId}/leave`);
  return response.data.data;
};

export const getMyCommunities = async () => {
  const response = await api.get("/communities/mine");
  return response.data.data;
};
