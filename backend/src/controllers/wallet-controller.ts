// backend/src/controllers/wallet-controller.ts
import { Request, Response } from "express";
import { UserService } from "../services/user-service";

export class WalletController {
  /**
   * Get user wallet
   */
  static async getUserWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as string;

      const wallet = await UserService.getUserWallet(userId);

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
}
