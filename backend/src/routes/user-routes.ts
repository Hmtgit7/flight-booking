// backend/src/routes/user-routes.ts
import express from "express";
import { UserController } from "../controllers/user-controller";
import { authMiddleware } from "../middleware/auth-middleware";

const router = express.Router();

// Public routes
router.post("/register", UserController.register);
router.post("/login", UserController.login);

// Protected routes
router.get("/me", authMiddleware, UserController.getCurrentUser);

export default router;
