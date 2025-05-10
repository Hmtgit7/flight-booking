// backend/src/routes/booking-routes.ts
import express from "express";
import { BookingController } from "../controllers/booking-controller";
import { authMiddleware } from "../middleware/auth-middleware";

const router = express.Router();

// All booking routes require authentication
router.use(authMiddleware);

// Create a new booking
router.post("/", BookingController.createBooking);

// Get all bookings for the current user
router.get("/", BookingController.getUserBookings);

// Get booking statistics
router.get("/stats", BookingController.getBookingStats);

// Get a specific booking by ID
router.get("/:id", BookingController.getBookingById);

// Generate ticket for a booking
router.get("/:id/ticket", BookingController.generateTicket);

// Cancel a booking
router.post("/:id/cancel", BookingController.cancelBooking);

export default router;
