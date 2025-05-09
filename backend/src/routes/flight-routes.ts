// backend/src/routes/flight-routes.ts
import express from "express";
import { FlightController } from "../controllers/flight-controller";
import { authMiddleware } from "../middleware/auth-middleware";

const router = express.Router();

// Apply authMiddleware to specific routes instead of using router.all
router.get("/search", authMiddleware, FlightController.searchFlights);
router.get("/:id", authMiddleware, FlightController.getFlightById);

export default router;
