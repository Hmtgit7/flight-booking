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
   * Update wallet balance with proper transaction recording
   */
  static async updateWalletBalance(
    userId: string,
    amount: number,
    type: "credit" | "debit",
    description: string,
    existingSession?: mongoose.ClientSession
  ): Promise<IWallet | null> {
    // Use provided session or create a new one
    const session = existingSession || (await mongoose.startSession());

    // Only start a new transaction if we created the session
    const shouldCommitTransaction = !existingSession;
    if (shouldCommitTransaction) {
      session.startTransaction();
    }

    try {
      // Find wallet with session for transaction consistency
      const wallet = await Wallet.findOne({ user: userId }).session(session);

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Validate sufficient balance for debit operations
      if (type === "debit" && wallet.balance < amount) {
        throw new Error("Insufficient wallet balance");
      }

      // Update balance based on transaction type
      if (type === "credit") {
        wallet.balance += amount;
      } else {
        wallet.balance -= amount;
      }

      // Record transaction with detailed information
      wallet.transactions.push({
        type,
        amount,
        description,
        date: new Date(),
      });

      await wallet.save({ session });

      // Only commit if we started the transaction
      if (shouldCommitTransaction) {
        await session.commitTransaction();
      }

      return wallet;
    } catch (error) {
      // Only abort if we started the transaction
      if (shouldCommitTransaction) {
        await session.abortTransaction();
      }
      console.error("Error updating wallet balance:", error);
      throw error;
    } finally {
      // Only end the session if we created it
      if (shouldCommitTransaction) {
        session.endSession();
      }
    }
  }

  /**
   * Get wallet transactions with pagination
   */
  static async getWalletTransactions(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    transactions: IWallet["transactions"];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Sort transactions by date (newest first)
      const sortedTransactions = [...wallet.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Implement pagination
      const total = sortedTransactions.length;
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      const paginatedTransactions = sortedTransactions.slice(
        skip,
        skip + limit
      );

      return {
        transactions: paginatedTransactions,
        total,
        page,
        pages,
      };
    } catch (error) {
      console.error("Error getting wallet transactions:", error);
      throw error;
    }
  }

  /**
   * Create new wallet (for new users)
   */
  static async createWallet(
    userId: string,
    initialBalance: number = 50000
  ): Promise<IWallet> {
    try {
      const existingWallet = await Wallet.findOne({ user: userId });

      if (existingWallet) {
        throw new Error("Wallet already exists");
      }

      const wallet = new Wallet({
        user: userId,
        balance: initialBalance,
        transactions: [
          {
            type: "credit",
            amount: initialBalance,
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
