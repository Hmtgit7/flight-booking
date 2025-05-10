// backend/src/routes/wallet-routes.ts
import express from "express";
import { WalletController } from "../controllers/wallet-controller";
import { authMiddleware } from "../middleware/auth-middleware";

const router = express.Router();

// All wallet routes require authentication
router.use(authMiddleware);

// Get wallet balance
router.get("/", WalletController.getUserWallet);

// Get wallet transactions
router.get("/transactions", WalletController.getWalletTransactions);

// Get transaction summary
router.get("/summary", WalletController.getTransactionSummary);

export default router;
