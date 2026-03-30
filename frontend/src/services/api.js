import axios from "axios";
import storage from "./storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const storedAuth = await storage.getItem("auth");
    if (storedAuth) {
      const { token } = JSON.parse(storedAuth);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem("auth");

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    if (error.response?.status === 403) {
      if (import.meta.env.DEV) {
        console.error("Access forbidden:", error.response.data?.message);
      }
    }

    if (error.response?.status >= 500) {
      if (import.meta.env.DEV) {
        console.error("Server error:", error.response.data?.message);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
