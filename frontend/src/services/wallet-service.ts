// src/services/wallet-service.ts
import api from "./api";
import { Wallet } from "../types/wallet";

export const walletService = {
  async getUserWallet(): Promise<Wallet> {
    const response = await api.get("/wallet");
    return response.data.wallet;
  },
};
