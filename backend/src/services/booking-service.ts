// backend/src/services/booking-service.ts
import { Booking, IBooking } from "../models/booking-model";
import { Flight } from "../models/flight-model";
import { Wallet } from "../models/wallet-model";
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

  for (let i = 0; i < count; i++) {
    const rowNumber = Math.floor(Math.random() * 30) + 1;
    const seatLetter = rows[Math.floor(Math.random() * rows.length)];
    seats.push(`${rowNumber}${seatLetter}`);
  }

  return seats;
}

export class BookingService {
  /**
   * Create a new booking
   */
  static async createBooking(bookingData: BookingData): Promise<IBooking> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { userId, flightId, passengers } = bookingData;

      // Get current flight price
      const flight = await Flight.findById(flightId);
      if (!flight) {
        throw new Error("Flight not found");
      }

      const currentPrice = await PricingService.getCurrentPrice(
        flightId,
        userId
      );
      const totalAmount = currentPrice * passengers.length;

      // Check if user has enough balance
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet || wallet.balance < totalAmount) {
        throw new Error("Insufficient wallet balance");
      }

      // Create booking
      const pnr = generatePNR();
      const seatNumbers = generateSeatNumbers(passengers.length);

      const booking = new Booking({
        user: userId,
        flight: flightId,
        passengers,
        totalAmount,
        status: "confirmed",
        pnr,
        seatNumbers,
      });

      await booking.save({ session });

      // Deduct amount from wallet
      wallet.balance -= totalAmount;
      wallet.transactions.push({
        type: "debit",
        amount: totalAmount,
        description: `Flight booking: ${flight.flightNumber} from ${flight.departureCity} to ${flight.arrivalCity}`,
        date: new Date(),
      });

      await wallet.save({ session });

      // Update flight seats available
      flight.seatsAvailable -= passengers.length;
      await flight.save({ session });

      await session.commitTransaction();
      session.endSession();

      return booking;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  /**
   * Get all bookings for a user
   */
  static async getUserBookings(userId: string): Promise<IBooking[]> {
    try {
      return await Booking.find({ user: userId })
        .populate("flight")
        .sort({ bookingDate: -1 });
    } catch (error) {
      console.error("Error getting user bookings:", error);
      throw error;
    }
  }

  /**
   * Get booking details by ID
   */
  static async getBookingById(bookingId: string): Promise<IBooking | null> {
    try {
      return await Booking.findById(bookingId).populate("flight");
    } catch (error) {
      console.error("Error getting booking by ID:", error);
      throw error;
    }
  }
}
