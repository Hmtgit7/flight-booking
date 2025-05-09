// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  [key: string]: any;
}
