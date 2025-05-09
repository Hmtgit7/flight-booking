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
        res
          .status(400)
          .json({
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
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Get all bookings for the current user
   */
  static async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as string;

      const bookings = await BookingService.getUserBookings(userId);

      res.status(200).json({
        success: true,
        bookings,
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

      const booking = await BookingService.getBookingById(bookingId);

      if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found" });
        return;
      }

      // Check if booking belongs to current user
      const userId = req.userId as string;
      if (booking.user.toString() !== userId) {
        res.status(403).json({ success: false, message: "Unauthorized" });
        return;
      }

      res.status(200).json({
        success: true,
        booking,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Generate ticket data for a booking
   */
  static async generateTicket(req: Request, res: Response): Promise<void> {
    try {
      const bookingId = req.params.id;

      const booking = await BookingService.getBookingById(bookingId);

      if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found" });
        return;
      }

      // Check if booking belongs to current user
      const userId = req.userId as string;
      if (booking.user.toString() !== userId) {
        res.status(403).json({ success: false, message: "Unauthorized" });
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
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
