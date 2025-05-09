// backend/src/config/env.ts
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Validate required environment variables
const requiredEnvVars = ["PORT", "MONGODB_URI", "JWT_SECRET"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`Warning: Environment variable ${envVar} is not set.`);
  }
});

export const config = {
  port: process.env.PORT || 5000,
  mongodb_uri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/flight-booking",
  jwt_secret: process.env.JWT_SECRET || "your-secret-key",
  node_env: process.env.NODE_ENV || "development",
};
