import { Flight } from "./flight";
import { User } from "./user";

// src/types/booking.ts
export interface Passenger {
  name: string;
  age: number;
  gender: string;
}

export interface Booking {
  _id: string;
  user: string | User;
  flight: string | Flight;
  bookingDate: string | Date;
  passengers: Passenger[];
  totalAmount: number;
  status: "confirmed" | "cancelled" | "pending";
  pnr: string;
  seatNumbers: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BookingFormData {
  flightId: string;
  passengers: Passenger[];
}

export interface TicketData {
  bookingId: string;
  pnr: string;
  airline: string;
  flightNumber: string;
  departureCity: string;
  departureAirport: string;
  departureCode: string;
  departureTime: string | Date;
  arrivalCity: string;
  arrivalAirport: string;
  arrivalCode: string;
  arrivalTime: string | Date;
  duration: number;
  aircraft: string;
  bookingDate: string | Date;
  totalAmount: number;
  passengers: (Passenger & { seat: string })[];
}
