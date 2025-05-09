// backend/src/services/user-service.ts - Complete
import { User, IUser } from "../models/user-model";
import { Wallet, IWallet } from "../models/wallet-model";
import jwt from "jsonwebtoken";

interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
}

interface UserLoginData {
  email: string;
  password: string;
}

export class UserService {
  /**
   * Register a new user
   */
  static async registerUser(
    userData: UserRegistrationData
  ): Promise<{ user: IUser; token: string; wallet: IWallet }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Create user
      const user = new User(userData);
      await user.save();

      // Create wallet with default balance
      const wallet = new Wallet({
        user: user._id,
        balance: 50000, // Default balance as per requirements
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

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      return { user, token, wallet };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async loginUser(
    userData: UserLoginData
  ): Promise<{ user: IUser; token: string; wallet: IWallet }> {
    try {
      // Find user by email
      const user = await User.findOne({ email: userData.email });
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Check password
      const isMatch = await user.comparePassword(userData.password);
      if (!isMatch) {
        throw new Error("Invalid email or password");
      }

      // Get wallet
      const wallet = await Wallet.findOne({ user: user._id });
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      return { user, token, wallet };
    } catch (error) {
      console.error("Error logging in user:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<IUser | null> {
    try {
      return await User.findById(userId);
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }

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
}
