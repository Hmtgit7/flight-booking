// src/types/flight.ts
export interface Flight {
  _id: string;
  flightNumber: string;
  airline: string;
  departureCity: string;
  departureAirport: string;
  departureCode: string;
  arrivalCity: string;
  arrivalAirport: string;
  arrivalCode: string;
  departureTime: string | Date;
  arrivalTime: string | Date;
  duration: number; // in minutes
  basePrice: number;
  currentPrice: number;
  seatsAvailable: number;
  aircraft: string;
}

export interface FlightSearchCriteria {
  departureCity?: string;
  arrivalCity?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
}

export interface Airport {
  name: string;
  city: string;
  code: string;
  country: string;
}
