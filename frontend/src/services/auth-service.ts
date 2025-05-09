// src/services/auth-service.ts
import api from "./api";
import { LoginData, RegisterData, AuthResponse, User } from "../types/user";

// Add explicit import for storage utilities
import { setToken, getToken, removeToken } from "../utils/storage";

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/users/register", data);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/users/login", data);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User; wallet: any }> {
    const response = await api.get("/users/me");
    return response.data;
  },

  logout(): void {
    removeToken();
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },
};
