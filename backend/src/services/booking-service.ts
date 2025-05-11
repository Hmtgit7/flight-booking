// backend/src/services/booking-service.ts
import { Booking, IBooking } from "../models/booking-model";
import { Flight } from "../models/flight-model";
import { WalletService } from "./wallet-service";
import { PricingService } from "./pricing-service";
import mongoose from "mongoose";

interface BookingData {
  userId: string;
  flightId: string;
  passengers: {
    name: string;
    age: number;
    gender: string;
  }[];
}

function generatePNR() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pnr = "";
  for (let i = 0; i < 6; i++) {
    pnr += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return pnr;
}

function generateSeatNumbers(count: number): string[] {
  const rows = ["A", "B", "C", "D", "E", "F"];
  const seats = [];

  // Use a set to avoid duplicate seat numbers
  const assignedSeats = new Set<string>();

  for (let i = 0; i < count; i++) {
    let seat;
    do {
      const rowNumber = Math.floor(Math.random() * 30) + 1;
      const seatLetter = rows[Math.floor(Math.random() * rows.length)];
      seat = `${rowNumber}${seatLetter}`;
    } while (assignedSeats.has(seat));

    assignedSeats.add(seat);
    seats.push(seat);
  }

  return seats;
}

export class BookingService {
  /**
   * Create a new booking with wallet integration
   */
  static async createBooking(bookingData: BookingData): Promise<IBooking> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { userId, flightId, passengers } = bookingData;

      let flight;
      // Check if flightId is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(flightId)) {
        // If it's a valid ObjectId, find by that ID
        flight = await Flight.findById(flightId);
      } else {
        // If it's not a valid ObjectId (e.g., "flight_1"), find by flightNumber or another field
        const flightIdParts = flightId.split("_");
        const flightNumber =
          flightIdParts.length > 1 ? flightIdParts[1] : flightId;

        flight = await Flight.findOne({
          $or: [
            { flightNumber: flightNumber },
            { flightNumber: `flight_${flightNumber}` },
          ],
        });

        // If still not found, try to find the first flight (for demo purposes)
        if (!flight && flightId === "flight_1") {
          flight = await Flight.findOne();
        }
      }

      if (!flight) {
        throw new Error(`Flight not found for ID: ${flightId}`);
      }

      // Validate seats availability
      if (flight.seatsAvailable < passengers.length) {
        throw new Error(
          `Only ${flight.seatsAvailable} seats available on this flight`
        );
      }

      // Get current price with dynamic pricing
      const currentPrice = await PricingService.getCurrentPrice(
        flight._id.toString(),
        userId
      );
      const totalAmount = currentPrice * passengers.length;

      // Generate PNR and seat numbers
      const pnr = generatePNR();
      const seatNumbers = generateSeatNumbers(passengers.length);

      // Create booking
      const booking = new Booking({
        user: userId,
        flight: flight._id, // Use the actual MongoDB ObjectId
        passengers,
        totalAmount,
        status: "confirmed",
        pnr,
        seatNumbers,
      });

      await booking.save({ session });

      // Update wallet - deduct booking amount
      try {
        await WalletService.updateWalletBalance(
          userId,
          totalAmount,
          "debit",
          `Flight booking: ${flight.flightNumber} from ${flight.departureCity} to ${flight.arrivalCity}`,
          session
        );
      } catch (walletError) {
        // If wallet update fails, abort transaction and throw error
        await session.abortTransaction();
        throw walletError;
      }

      // Update flight seats available
      flight.seatsAvailable -= passengers.length;
      await flight.save({ session });

      await session.commitTransaction();
      return booking;
    } catch (error) {
      await session.abortTransaction();
      console.error("Error creating booking:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get all bookings for a user with pagination
   */
  static async getUserBookings(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    bookings: IBooking[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const total = await Booking.countDocuments({ user: userId });
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const bookings = await Booking.find({ user: userId })
        .populate("flight")
        .sort({ bookingDate: -1 })
        .skip(skip)
        .limit(limit);

      return {
        bookings,
        total,
        page,
        pages,
      };
    } catch (error) {
      console.error("Error getting user bookings:", error);
      throw error;
    }
  }

  /**
   * Get booking details by ID
   */
  static async getBookingById(
    bookingId: string,
    userId: string
  ): Promise<IBooking | null> {
    try {
      const booking = await Booking.findById(bookingId).populate("flight");

      // Security check: ensure the booking belongs to the requesting user
      if (booking && booking.user.toString() !== userId) {
        throw new Error("Unauthorized access to booking");
      }

      return booking;
    } catch (error) {
      console.error("Error getting booking by ID:", error);
      throw error;
    }
  }

  /**
   * Cancel a booking and refund wallet
   */
  static async cancelBooking(
    bookingId: string,
    userId: string
  ): Promise<IBooking> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find booking and validate user ownership
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.user.toString() !== userId) {
        throw new Error("Unauthorized access to booking");
      }

      if (booking.status === "cancelled") {
        throw new Error("Booking is already cancelled");
      }

      // Calculate refund amount based on cancellation policy
      // For simplicity, let's return 90% of the booking amount
      const refundAmount = Math.floor(booking.totalAmount * 0.9);

      // Update booking status
      booking.status = "cancelled";
      await booking.save({ session });

      // Restore flight seat availability
      const flight = await Flight.findById(booking.flight).session(session);
      if (flight) {
        flight.seatsAvailable += booking.passengers.length;
        await flight.save({ session });
      }

      // Refund wallet
      await WalletService.updateWalletBalance(
        userId,
        refundAmount,
        "credit",
        `Refund for cancelled booking: ${booking.pnr}`,
        session
      );

      await session.commitTransaction();
      return booking;
    } catch (error) {
      await session.abortTransaction();
      console.error("Error cancelling booking:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get booking statistics for a user
   */
  static async getUserBookingStats(userId: string): Promise<any> {
    try {
      const totalBookings = await Booking.countDocuments({ user: userId });
      const upcomingBookings = await Booking.countDocuments({
        user: userId,
        status: "confirmed",
        "flight.departureTime": { $gt: new Date() },
      });
      const cancelledBookings = await Booking.countDocuments({
        user: userId,
        status: "cancelled",
      });

      const totalSpent = await Booking.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      return {
        totalBookings,
        upcomingBookings,
        cancelledBookings,
        totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0,
      };
    } catch (error) {
      console.error("Error getting booking statistics:", error);
      throw error;
    }
  }
}
