import api from "./axios";

export const getCommunities = async ({ q, sort } = {}) => {
  const params = {};
  if (q) params.q = q;
  if (sort) params.sort = sort;
  const response = await api.get("/communities", { params });
  return response.data.data;
};

export const getCommunity = async (communityId) => {
  const response = await api.get(`/communities/${communityId}`);
  return response.data.data;
};

export const getGroupCommunities = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/communities`);
  return response.data.data;
};

export const createCommunity = async (groupId, attributes) => {
  const url = groupId ? `/groups/${groupId}/communities` : "/communities";
  const response = await api.post(url, attributes);
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
