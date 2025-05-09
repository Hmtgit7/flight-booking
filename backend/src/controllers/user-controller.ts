// backend/src/controllers/user-controller.ts
import { Request, Response } from "express";
import { UserService } from "../services/user-service";

export class UserController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res
          .status(400)
          .json({ success: false, message: "All fields are required" });
        return;
      }

      const result = await UserService.registerUser({ name, email, password });

      // Return user data (excluding password) and token
      const userData = {
        _id: result.user._id,
        name: result.user.name,
        email: result.user.email,
      };

      res.status(201).json({
        success: true,
        token: result.token,
        user: userData,
        wallet: result.wallet,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(400)
          .json({ success: false, message: "Email and password are required" });
        return;
      }

      const result = await UserService.loginUser({ email, password });

      // Return user data (excluding password) and token
      const userData = {
        _id: result.user._id,
        name: result.user.name,
        email: result.user.email,
      };

      res.status(200).json({
        success: true,
        token: result.token,
        user: userData,
        wallet: result.wallet,
      });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as string;
      const user = await UserService.getUserById(userId);

      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      // Return user data (excluding password)
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
      };

      const wallet = await UserService.getUserWallet(userId);

      res.status(200).json({
        success: true,
        user: userData,
        wallet,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
