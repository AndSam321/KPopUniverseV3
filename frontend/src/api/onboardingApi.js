import api from "./axios";

export const completeOnboarding = async (groupIds) => {
  const response = await api.post("/onboarding", { group_ids: groupIds });
  return response.data.data;
};
