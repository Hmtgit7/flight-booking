// backend/src/routes/wallet-routes.ts
import express from "express";
import { WalletController } from "../controllers/wallet-controller";
import { authMiddleware } from "../middleware/auth-middleware";

const router = express.Router();

// Apply authMiddleware to specific routes instead of using router.all
router.get("/", authMiddleware, WalletController.getUserWallet);

export default router;
