// src/services/booking-service.ts
import api from "./api";
import { Booking, BookingFormData, TicketData } from "../types/booking";
import { Flight } from "../types/flight";

export const bookingService = {
  /**
   * Create a new booking
   */
  async createBooking(data: BookingFormData): Promise<Booking> {
    try {
      console.log("Creating booking with data:", data);
      const response = await api.post("/bookings", data);
      return response.data.booking;
    } catch (error: any) {
      console.error("Error creating booking:", error);

      // Forward the specific error message from the backend if available
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to create booking. Please try again.");
    }
  },

  /**
   * Get all bookings for the current user with pagination
   */
  async getUserBookings(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    bookings: Booking[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const response = await api.get(`/bookings?page=${page}&limit=${limit}`);

      // Validate the response structure
      if (!response.data || !Array.isArray(response.data.bookings)) {
        throw new Error("Invalid response format from server");
      }

      return {
        bookings: response.data.bookings,
        total: response.data.total || response.data.bookings.length,
        page: response.data.page || page,
        pages: response.data.pages || 1,
      };
    } catch (error: any) {
      console.error("Error getting user bookings:", error);

      if (error.response?.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }

      throw new Error(
        error.response?.data?.message ||
          "Failed to load bookings. Please try again."
      );
    }
  },

  /**
   * Get booking details by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    try {
      const response = await api.get(`/bookings/${id}`);

      // Check if booking data is available in the response
      if (!response.data?.booking) {
        throw new Error("Booking not found");
      }

      return response.data.booking;
    } catch (error: any) {
      console.error("Error getting booking by ID:", error);

      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error("Booking not found");
      }
      if (error.response?.status === 403) {
        throw new Error("You don't have permission to view this booking");
      }
      if (error.response?.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }

      // Use backend message if available, otherwise use generic message
      throw new Error(
        error.response?.data?.message ||
          "Failed to load booking details. Please try again."
      );
    }
  },

  /**
   * Generate ticket for a booking
   */
  async generateTicket(id: string): Promise<TicketData> {
    try {
      const response = await api.get(`/bookings/${id}/ticket`);

      // Check if ticket data is available in the response
      if (!response.data?.ticket) {
        throw new Error("Failed to generate ticket");
      }

      return response.data.ticket;
    } catch (error: any) {
      console.error("Error generating ticket:", error);

      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error("Booking not found");
      }
      if (error.response?.status === 403) {
        throw new Error("You don't have permission to access this ticket");
      }

      // Use backend message if available, otherwise use generic message
      throw new Error(
        error.response?.data?.message ||
          "Failed to generate ticket. Please try again."
      );
    }
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string): Promise<Booking> {
    try {
      const response = await api.post(`/bookings/${id}/cancel`);

      if (!response.data?.booking) {
        throw new Error("Failed to cancel booking");
      }

      return response.data.booking;
    } catch (error: any) {
      console.error("Error cancelling booking:", error);

      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error("Booking not found");
      }
      if (error.response?.status === 403) {
        throw new Error("You don't have permission to cancel this booking");
      }
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data?.message || "Booking cannot be cancelled"
        );
      }

      throw new Error(
        error.response?.data?.message ||
          "Failed to cancel booking. Please try again."
      );
    }
  },

  /**
   * Get booking statistics
   */
  async getBookingStats(): Promise<{
    totalBookings: number;
    upcomingBookings: number;
    cancelledBookings: number;
    totalSpent: number;
  }> {
    try {
      const response = await api.get("/bookings/stats");

      if (!response.data?.stats) {
        throw new Error("Failed to load booking statistics");
      }

      return response.data.stats;
    } catch (error: any) {
      console.error("Error getting booking stats:", error);

      throw new Error(
        error.response?.data?.message || "Failed to load booking statistics."
      );
    }
  },
};

export default bookingService;
