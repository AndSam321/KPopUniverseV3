import api from "./axios";

export const submitFeedback = async (message) => {
  const response = await api.post("/feedbacks", { message });
  return response.data;
};
