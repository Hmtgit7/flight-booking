// src/services/booking-service.ts
import api from "./api";
import { Booking, BookingFormData, TicketData } from "../types/booking";

export const bookingService = {
  async createBooking(data: BookingFormData): Promise<Booking> {
    const response = await api.post("/bookings", data);
    return response.data.booking;
  },

  async getUserBookings(): Promise<Booking[]> {
    const response = await api.get("/bookings");
    return response.data.bookings;
  },

  async getBookingById(id: string): Promise<Booking> {
    const response = await api.get(`/bookings/${id}`);
    return response.data.booking;
  },

  async generateTicket(id: string): Promise<TicketData> {
    const response = await api.get(`/bookings/${id}/ticket`);
    return response.data.ticket;
  },
};
