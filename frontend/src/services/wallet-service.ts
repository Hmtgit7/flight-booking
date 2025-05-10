// src/services/wallet-service.ts
import api from "./api";
import { Wallet, Transaction } from "../types/wallet";

export const walletService = {
  /**
   * Get user wallet balance and basic info
   */
  async getUserWallet(): Promise<Wallet> {
    try {
      const response = await api.get("/wallet");
      return response.data.wallet;
    } catch (error) {
      console.error("Error getting user wallet:", error);
      throw new Error("Failed to load wallet information. Please try again.");
    }
  },

  /**
   * Get wallet transactions with pagination
   */
  async getWalletTransactions(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const response = await api.get(
        `/wallet/transactions?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting wallet transactions:", error);
      throw new Error("Failed to load transaction history. Please try again.");
    }
  },

  /**
   * Get transaction summary (total spent, received, and monthly breakdown)
   */
  async getTransactionSummary(): Promise<{
    balance: number;
    totalSpent: number;
    totalReceived: number;
    monthlyTransactions: Record<string, { spent: number; received: number }>;
  }> {
    try {
      const response = await api.get("/wallet/summary");
      return response.data;
    } catch (error) {
      console.error("Error getting transaction summary:", error);
      throw new Error("Failed to load transaction summary. Please try again.");
    }
  },

  /**
   * Format transaction date for display
   */
  formatTransactionDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Format transaction type as a friendly description
   */
  formatTransactionType(type: "credit" | "debit"): string {
    return type === "credit" ? "Received" : "Spent";
  },
};

export default walletService;
