// backend/src/routes/booking-routes.ts
import express from "express";
import { BookingController } from "../controllers/booking-controller";
import { authMiddleware } from "../middleware/auth-middleware";

const router = express.Router();

// Apply authMiddleware to specific routes instead of using router.all
router.post("/", authMiddleware, BookingController.createBooking);
router.get("/", authMiddleware, BookingController.getUserBookings);
router.get("/:id", authMiddleware, BookingController.getBookingById);
router.get("/:id/ticket", authMiddleware, BookingController.generateTicket);

export default router;
