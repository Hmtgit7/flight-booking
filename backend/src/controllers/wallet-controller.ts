// backend/src/controllers/wallet-controller.ts
import { Request, Response } from "express";
import { WalletService } from "../services/wallet-service";

export class WalletController {
  /**
   * Get user wallet
   */
  static async getUserWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as string;

      const wallet = await WalletService.getUserWallet(userId);

      if (!wallet) {
        res.status(404).json({ success: false, message: "Wallet not found" });
        return;
      }

      res.status(200).json({
        success: true,
        wallet,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get wallet transactions with pagination
   */
  static async getWalletTransactions(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId as string;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await WalletService.getWalletTransactions(
        userId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get transaction history summary
   */
  static async getTransactionSummary(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId as string;

      const wallet = await WalletService.getUserWallet(userId);

      if (!wallet) {
        res.status(404).json({ success: false, message: "Wallet not found" });
        return;
      }

      // Calculate total spent (debit) and received (credit)
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

      res.status(200).json({
        success: true,
        balance: wallet.balance,
        totalSpent,
        totalReceived,
        monthlyTransactions,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
