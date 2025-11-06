// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`, 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

export default api;
