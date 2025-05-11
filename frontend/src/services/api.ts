// src/services/api.ts
import axios, { AxiosError, AxiosResponse } from "axios";
import { getToken, removeToken } from "../utils/storage";

// Use environment variable or default to localhost
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

console.log("API URL configured as:", API_URL);

// Create axios instance with proper timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Add a reasonable timeout to prevent indefinite waiting
  timeout: 10000, // 10 seconds
});

// Keep track of retry counts to prevent infinite loops
const retryCount = new Map<string, number>();

// Track connection status
let isOfflineMode = false;

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Check if we're in offline mode
    if (
      isOfflineMode &&
      !config.url?.includes("login") &&
      !config.url?.includes("register")
    ) {
      console.log(`Request to ${config.url} cancelled due to offline mode.`);
      // Cancel the request
      return {
        ...config,
        signal: AbortSignal.timeout(1), // Abort immediately
      };
    }

    // Add authorization token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For debugging
    console.log(
      `Making request to: ${config.method?.toUpperCase()} ${config.url}`
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Reset retry count for successful requests
    if (response.config.url) {
      retryCount.delete(response.config.url);
    }

    // Reset offline mode on successful connection
    if (isOfflineMode) {
      console.log("Connection restored. Exiting offline mode.");
      isOfflineMode = false;
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // No retry for these status codes
    const noRetryStatuses = [400, 401, 403, 404, 422];

    // Handle request timeout
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      console.error("Request timeout");

      // Switch to offline mode after multiple timeouts
      if (!isOfflineMode) {
        const currentUrl = originalRequest?.url || "";
        const currentRetryCount = (retryCount.get(currentUrl) || 0) + 1;
        retryCount.set(currentUrl, currentRetryCount);

        if (currentRetryCount >= 3) {
          console.log("Multiple timeouts detected. Switching to offline mode.");
          isOfflineMode = true;
        }
      }
    }
    // Handle network errors
    else if (!error.response) {
      console.error("Network error - no response received");
      isOfflineMode = true;
    }
    // Handle token expiration/invalidation
    else if (
      error.response.status === 401 &&
      originalRequest?.url !== "/users/login"
    ) {
      console.log("Unauthorized access - token may be expired");
      removeToken();

      // Redirect to login if unauthorized and not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    // Handle server errors with retry
    else if (
      error.response.status >= 500 &&
      !noRetryStatuses.includes(error.response.status)
    ) {
      console.error(`Server error: ${error.response.status}`);

      // Retry logic for server errors
      const currentUrl = originalRequest?.url || "";
      const currentRetryCount = (retryCount.get(currentUrl) || 0) + 1;

      // Try up to 3 times
      if (
        currentRetryCount <= 3 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        console.log(
          `Retrying request to ${currentUrl} (Attempt ${currentRetryCount})`
        );
        retryCount.set(currentUrl, currentRetryCount);

        originalRequest._retry = true;

        // Exponential backoff
        const delay = Math.pow(2, currentRetryCount) * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));

        return api(originalRequest);
      }
    } else {
      console.error(
        `API Error: ${error.response?.status}`,
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

// Public API function to check online status
export const checkConnection = async (): Promise<boolean> => {
  try {
    await api.get("/health", { timeout: 3000 });
    isOfflineMode = false;
    return true;
  } catch (error) {
    isOfflineMode = true;
    return false;
  }
};

// Helper to force offline mode (for testing)
export const setOfflineMode = (offline: boolean): void => {
  isOfflineMode = offline;
  console.log(`Manually ${offline ? "enabled" : "disabled"} offline mode`);
};

// Get current connection status
export const getConnectionStatus = (): boolean => {
  return !isOfflineMode;
};

export default api;
