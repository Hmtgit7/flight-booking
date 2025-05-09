// backend/src/app.ts
import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { errorMiddleware } from "./middleware/error-middleware";

// Import routes
import userRoutes from "./routes/user-routes";
import flightRoutes from "./routes/flight-routes";
import bookingRoutes from "./routes/booking-routes";
import walletRoutes from "./routes/wallet-routes";

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wallet", walletRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use(errorMiddleware);

export default app;
