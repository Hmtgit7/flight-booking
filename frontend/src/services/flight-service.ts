// src/services/flight-service.ts
import api from "./api";
import { Flight, FlightSearchCriteria } from "../types/flight";

export const flightService = {
  async searchFlights(criteria: FlightSearchCriteria): Promise<Flight[]> {
    // Build query string
    const queryParams = new URLSearchParams();

    if (criteria.departureCity) {
      queryParams.append("departureCity", criteria.departureCity);
    }

    if (criteria.arrivalCity) {
      queryParams.append("arrivalCity", criteria.arrivalCity);
    }

    if (criteria.departureDate) {
      queryParams.append("departureDate", criteria.departureDate);
    }

    if (criteria.returnDate) {
      queryParams.append("returnDate", criteria.returnDate);
    }

    if (criteria.passengers) {
      queryParams.append("passengers", criteria.passengers.toString());
    }

    const response = await api.get(`/flights/search?${queryParams.toString()}`);
    return response.data.flights;
  },

  async getFlightById(id: string): Promise<Flight> {
    const response = await api.get(`/flights/${id}`);
    return response.data.flight;
  },
};
