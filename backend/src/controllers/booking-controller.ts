// backend/src/controllers/booking-controller.ts
import { Request, Response } from "express";
import { BookingService } from "../services/booking-service";
import { PDFService } from "../services/pdf-service";
import { FlightService } from "../services/flight-service";

export class BookingController {
  /**
   * Create a new booking
   */
  static async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const { flightId, passengers } = req.body;
      const userId = req.userId as string;

      if (
        !flightId ||
        !passengers ||
        !Array.isArray(passengers) ||
        passengers.length === 0
      ) {
        res.status(400).json({
          success: false,
          message: "Flight ID and passenger details are required",
        });
        return;
      }

      const booking = await BookingService.createBooking({
        userId,
        flightId,
        passengers,
      });

      res.status(201).json({
        success: true,
        booking,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Insufficient wallet balance")
        ? 400
        : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  /**
   * Get all bookings for the current user with pagination
   */
  static async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as string;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await BookingService.getUserBookings(userId, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get booking details by ID
   */
  static async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const bookingId = req.params.id;
      const userId = req.userId as string;

      const booking = await BookingService.getBookingById(bookingId, userId);

      if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found" });
        return;
      }

      res.status(200).json({
        success: true,
        booking,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Unauthorized") ? 403 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  /**
   * Generate ticket data for a booking
   */
  static async generateTicket(req: Request, res: Response): Promise<void> {
    try {
      const bookingId = req.params.id;
      const userId = req.userId as string;

      const booking = await BookingService.getBookingById(bookingId, userId);

      if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found" });
        return;
      }

      const flight = await FlightService.getFlightById(
        booking.flight.toString(),
        userId
      );

      if (!flight) {
        res.status(404).json({ success: false, message: "Flight not found" });
        return;
      }

      const ticketData = PDFService.generateTicketData(booking, flight);

      res.status(200).json({
        success: true,
        ticket: ticketData,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Unauthorized") ? 403 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  /**
   * Cancel a booking with refund
   */
  static async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingId = req.params.id;
      const userId = req.userId as string;

      const booking = await BookingService.cancelBooking(bookingId, userId);

      res.status(200).json({
        success: true,
        booking,
        message: "Booking cancelled successfully and refund processed",
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Unauthorized")
        ? 403
        : error.message.includes("not found")
        ? 404
        : error.message.includes("already cancelled")
        ? 400
        : 500;

      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  /**
   * Get booking statistics for the current user
   */
  static async getBookingStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as string;

      const stats = await BookingService.getUserBookingStats(userId);

      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
