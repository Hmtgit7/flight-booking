// src/utils/dev-utils.ts
// Development utilities to help test app functionality
// This file should NOT be included in production builds

import { bookingService } from "../services/booking-service";
import { Booking } from "../types/booking";
import { Flight } from "../types/flight";

// Key for mock bookings in localStorage
const MOCK_BOOKINGS_KEY = "skybooker_mock_bookings";

/**
 * Development utilities for testing SkyBooker functionality
 * Only use in development environments
 */
export const DevUtils = {
  /**
   * Create a test booking for the current user
   */
  createTestBooking(): Booking {
    // Create mock flight data
    const mockFlight: Partial<Flight> = {
      _id: `flight_${Math.random().toString(36).substring(2, 6)}`,
      airline: "Test Airline",
      flightNumber: "TA123",
      departureCity: "Test City A",
      departureCode: "TCA",
      departureAirport: "Test Airport A",
      arrivalCity: "Test City B",
      arrivalCode: "TCB",
      arrivalAirport: "Test Airport B",
      departureTime: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(), // 7 days from now
      arrivalTime: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(), // +2 hours
      duration: 120,
      basePrice: 2500,
      currentPrice: 2500,
      seatsAvailable: 50,
      aircraft: "Test Aircraft",
    };

    // Create booking using mock flight
    const booking = bookingService.createMockBooking({
      flightId: mockFlight._id as string,
      passengers: [{ name: "Test Passenger", age: 30, gender: "male" }],
    });

    console.log("Created test booking:", booking);
    return booking;
  },

  /**
   * Reset all mock bookings (clear booking history)
   */
  resetAllBookings(): void {
    localStorage.removeItem(MOCK_BOOKINGS_KEY);

    // Also clear any individual booking items (legacy approach)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("booking_")) {
        localStorage.removeItem(key);
      }
    }

    console.log("All booking data has been cleared");
  },

  /**
   * Reset search counts (for testing dynamic pricing)
   */
  resetSearchCounts(): void {
    localStorage.removeItem("flightSearchCounts");
    console.log("Search counts have been reset");
  },

  /**
   * Reset everything - all storage data
   */
  resetEverything(): void {
    this.resetAllBookings();
    this.resetSearchCounts();
    localStorage.removeItem("skybooker_flight_search_history");
    console.log("All application data has been reset");
  },

  /**
   * Print all local storage data for debugging
   * @returns Record of all localStorage data
   */
  printAllStorage(): Record<string, any> {
    console.log("LocalStorage contents:");
    const data: Record<string, any> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || "null");
        } catch (e) {
          data[key] = localStorage.getItem(key);
        }
      }
    }

    console.log(data);
    return data;
  },

  /**
   * Generate a bookings report
   */
  generateBookingsReport(): any {
    const bookings = bookingService.getAllStoredMockBookings();
    console.log(`Found ${bookings.length} bookings:`);

    if (bookings.length === 0) {
      console.log("No bookings found. Try creating a test booking first.");
      return [];
    }

    // Group by status
    const byStatus = bookings.reduce((acc: Record<string, number>, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate total revenue
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    // Get passenger count
    const totalPassengers = bookings.reduce(
      (sum, booking) => sum + booking.passengers.length,
      0
    );

    const report = {
      totalBookings: bookings.length,
      statusBreakdown: byStatus,
      totalRevenue,
      totalPassengers,
      avgTicketPrice: totalRevenue / totalPassengers,
      bookings: bookings.map((b) => ({
        id: b._id,
        pnr: b.pnr,
        status: b.status,
        passengers: b.passengers.length,
        amount: b.totalAmount,
        date: new Date(b.bookingDate).toLocaleDateString(),
      })),
    };

    console.log("Bookings Report:", report);
    return report;
  },
};

// Add to window for console access in development
if (process.env.NODE_ENV !== "production") {
  (window as any).skyBookerUtils = DevUtils;
  console.log(
    "SkyBooker Dev Utils loaded. Access via window.skyBookerUtils in the console"
  );
}

export default DevUtils;
