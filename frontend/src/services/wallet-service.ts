// src/services/wallet-service.ts
import api from "./api";
import { Wallet, Transaction } from "../types/wallet";
import { getToken } from "../utils/storage";

export const walletService = {
  /**
   * Get user wallet balance and basic info with timeout and fallback
   */
  async getUserWallet(timeout: number = 5000): Promise<Wallet> {
    try {
      // Use Promise.race to implement timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Wallet request timed out")),
          timeout
        );
      });

      const fetchPromise = api.get("/wallet");

      // Race between the API call and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.data || !response.data.wallet) {
        throw new Error("Invalid wallet data format received from server");
      }

      // Validate wallet properties
      const walletData = response.data.wallet;
      if (typeof walletData.balance !== "number") {
        throw new Error("Invalid wallet balance received");
      }

      return walletData;
    } catch (error: any) {
      console.error("Error getting user wallet:", error);

      // Check if this is a network error
      if (
        error.message === "Network Error" ||
        error.message.includes("timed out")
      ) {
        console.log("Network error, trying to create fallback wallet");
        return this.createFallbackWallet();
      }

      // Handle specific error situations
      const status = error.response?.status;
      if (status === 401) {
        throw new Error("Authentication required. Please log in again.");
      } else if (status === 404) {
        // Wallet not found, create a new one
        return this.createFallbackWallet();
      }

      throw new Error(
        error.response?.data?.message ||
          "Failed to load wallet information. Please try again."
      );
    }
  },

  /**
   * Create a fallback wallet for use when API is unavailable
   */
  createFallbackWallet(): Wallet {
    // Check if we have a persisted fallback wallet in localStorage
    const persistedWallet = localStorage.getItem("fallbackWallet");
    if (persistedWallet) {
      try {
        const wallet = JSON.parse(persistedWallet);
        console.log("Using persisted fallback wallet:", wallet);
        return wallet;
      } catch (e) {
        console.error("Error parsing persisted wallet:", e);
      }
    }

    // Create new fallback wallet
    const defaultWallet: Wallet = {
      _id: "fallback_wallet_" + new Date().getTime(),
      user: "current_user",
      balance: 50000,
      transactions: [
        {
          type: "credit",
          amount: 50000,
          description: "Initial wallet balance",
          date: new Date(),
        },
      ],
    };

    // Persist the fallback wallet
    localStorage.setItem("fallbackWallet", JSON.stringify(defaultWallet));

    return defaultWallet;
  },

  /**
   * Get wallet transactions with pagination and fallbacks
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

      // Handle inconsistent API response
      if (!response.data.transactions) {
        throw new Error("Invalid transaction data format");
      }

      return {
        transactions: response.data.transactions,
        total: response.data.total || response.data.transactions.length,
        page: response.data.page || page,
        pages: response.data.pages || 1,
      };
    } catch (error: any) {
      console.error("Error getting wallet transactions:", error);

      // Check for backend API errors
      if (error.response && error.response.status === 500) {
        console.log("Server error, using fallback transactions");
        return this.getFallbackTransactions(page, limit);
      }

      throw new Error(
        error.response?.data?.message ||
          "Failed to load transaction history. Please try again."
      );
    }
  },

  /**
   * Get fallback transactions for when the API fails
   */
  getFallbackTransactions(
    page: number = 1,
    limit: number = 10
  ): {
    transactions: Transaction[];
    total: number;
    page: number;
    pages: number;
  } {
    // Get the fallback wallet if it exists
    const persistedWallet = localStorage.getItem("fallbackWallet");
    let transactions: Transaction[] = [];

    if (persistedWallet) {
      try {
        const wallet = JSON.parse(persistedWallet);
        transactions = wallet.transactions || [];
      } catch (e) {
        console.error("Error parsing persisted wallet transactions:", e);
      }
    }

    // Calculate pagination
    const total = transactions.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(
      startIndex,
      startIndex + limit
    );

    return {
      transactions: paginatedTransactions,
      total,
      page,
      pages,
    };
  },

  /**
   * Get transaction summary with fallback
   */
  async getTransactionSummary(): Promise<{
    balance: number;
    totalSpent: number;
    totalReceived: number;
    monthlyTransactions: Record<string, { spent: number; received: number }>;
  }> {
    try {
      const response = await api.get("/wallet/summary");

      if (!response.data || typeof response.data.balance !== "number") {
        throw new Error("Invalid transaction summary data");
      }

      return response.data;
    } catch (error: any) {
      console.error("Error getting transaction summary:", error);

      // Use fallback data
      const fallbackWallet = await this.getFallbackWallet();
      const summary = this.calculateTransactionSummary(fallbackWallet);

      return summary;
    }
  },

  /**
   * Calculate transaction summary from wallet
   */
  calculateTransactionSummary(wallet: Wallet): {
    balance: number;
    totalSpent: number;
    totalReceived: number;
    monthlyTransactions: Record<string, { spent: number; received: number }>;
  } {
    // Calculate total spent and received
    const totalSpent = wallet.transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReceived = wallet.transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);

    // Group transactions by month
    const monthlyTransactions: Record<
      string,
      { spent: number; received: number }
    > = {};

    wallet.transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyTransactions[monthKey]) {
        monthlyTransactions[monthKey] = { spent: 0, received: 0 };
      }

      if (t.type === "debit") {
        monthlyTransactions[monthKey].spent += t.amount;
      } else {
        monthlyTransactions[monthKey].received += t.amount;
      }
    });

    return {
      balance: wallet.balance,
      totalSpent,
      totalReceived,
      monthlyTransactions,
    };
  },

  /**
   * Get fallback wallet with transactions
   */
  async getFallbackWallet(): Promise<Wallet> {
    // Try to get the persisted fallback wallet
    const persistedWallet = localStorage.getItem("fallbackWallet");
    if (persistedWallet) {
      try {
        return JSON.parse(persistedWallet);
      } catch (e) {
        console.error("Error parsing persisted wallet:", e);
      }
    }

    // Create a new fallback wallet
    return this.createFallbackWallet();
  },

  /**
   * Simulate wallet update (for offline mode)
   */
  async updateFallbackWalletBalance(
    amount: number,
    type: "credit" | "debit",
    description: string
  ): Promise<Wallet> {
    const wallet = await this.getFallbackWallet();

    // Update balance
    if (type === "credit") {
      wallet.balance += amount;
    } else {
      if (wallet.balance < amount) {
        throw new Error("Insufficient wallet balance");
      }
      wallet.balance -= amount;
    }

    // Add transaction
    wallet.transactions.unshift({
      type,
      amount,
      description,
      date: new Date(),
    });

    // Persist updated wallet
    localStorage.setItem("fallbackWallet", JSON.stringify(wallet));

    return wallet;
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
