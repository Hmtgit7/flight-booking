// frontend/src/services/api.ts
import axios, { AxiosError } from "axios";
import { getToken } from "../utils/storage";

// Use environment variable or default to localhost
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

console.log("API URL configured as:", API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Add a longer timeout to accommodate slow connections
  timeout: 15000,
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    } else if (!error.response) {
      console.error("Network error - no response received");
    } else {
      console.error(`API Error: ${error.response.status}`, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
