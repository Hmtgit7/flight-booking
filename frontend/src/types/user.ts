import { Wallet } from "./wallet";

// src/types/user.ts
export interface User {
    _id: string;
    name: string;
    email: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
    wallet: Wallet;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    name: string;
    email: string;
    password: string;
  }
  
  