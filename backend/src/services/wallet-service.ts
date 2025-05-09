// backend/src/services/wallet-service.ts
import { Wallet, IWallet } from "../models/wallet-model";
import mongoose from "mongoose";

export class WalletService {
  /**
   * Get user wallet
   */
  static async getUserWallet(userId: string): Promise<IWallet | null> {
    try {
      return await Wallet.findOne({ user: userId });
    } catch (error) {
      console.error("Error getting user wallet:", error);
      throw error;
    }
  }

  /**
   * Update wallet balance
   */
  static async updateWalletBalance(
    userId: string,
    amount: number,
    type: "credit" | "debit",
    description: string
  ): Promise<IWallet | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ user: userId }).session(session);

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (type === "debit" && wallet.balance < amount) {
        throw new Error("Insufficient wallet balance");
      }

      // Update balance
      if (type === "credit") {
        wallet.balance += amount;
      } else {
        wallet.balance -= amount;
      }

      // Add transaction
      wallet.transactions.push({
        type,
        amount,
        description,
        date: new Date(),
      });

      await wallet.save({ session });

      await session.commitTransaction();
      session.endSession();

      return wallet;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error updating wallet balance:", error);
      throw error;
    }
  }

  /**
   * Get wallet transactions
   */
  static async getWalletTransactions(
    userId: string
  ): Promise<IWallet["transactions"] | null> {
    try {
      const wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      return wallet.transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error("Error getting wallet transactions:", error);
      throw error;
    }
  }

  /**
   * Create new wallet (for testing)
   */
  static async createWallet(userId: string): Promise<IWallet> {
    try {
      const existingWallet = await Wallet.findOne({ user: userId });

      if (existingWallet) {
        throw new Error("Wallet already exists");
      }

      const wallet = new Wallet({
        user: userId,
        balance: 50000, // Default balance
        transactions: [
          {
            type: "credit",
            amount: 50000,
            description: "Initial wallet balance",
            date: new Date(),
          },
        ],
      });

      await wallet.save();

      return wallet;
    } catch (error) {
      console.error("Error creating wallet:", error);
      throw error;
    }
  }
}
