// backend/src/services/flight-service.ts
import { Flight, IFlight } from "../models/flight-model";
import { PricingService } from "./pricing-service";
import mongoose from "mongoose";

interface FlightSearchCriteria {
  departureCity?: string;
  arrivalCity?: string;
  departureDate?: Date;
  returnDate?: Date;
  passengers?: number;
}

export class FlightService {
  /**
   * Search flights based on criteria - creates flights if none exist
   */
  static async searchFlights(
    criteria: FlightSearchCriteria,
    userId: string
  ): Promise<any[]> {
    try {
      const { departureCity, arrivalCity, departureDate } = criteria;

      // Basic filter object
      const filter: any = {};

      // Extract city names and codes from the input format "City (CODE)"
      let depCityName = departureCity;
      let depCode = "";
      let arrCityName = arrivalCity;
      let arrCode = "";

      if (departureCity) {
        const depMatch = departureCity.match(/^([^(]+)(?:\s*\(([^)]+)\))?/);
        depCityName = depMatch ? depMatch[1].trim() : departureCity;
        depCode = depMatch && depMatch[2] ? depMatch[2].trim() : "";

        filter.departureCity = depCityName;
        if (depCode) {
          filter.departureCode = depCode;
        }
      }

      if (arrivalCity) {
        const arrMatch = arrivalCity.match(/^([^(]+)(?:\s*\(([^)]+)\))?/);
        arrCityName = arrMatch ? arrMatch[1].trim() : arrivalCity;
        arrCode = arrMatch && arrMatch[2] ? arrMatch[2].trim() : "";

        filter.arrivalCity = arrCityName;
        if (arrCode) {
          filter.arrivalCode = arrCode;
        }
      }

      if (departureDate) {
        const startDate = new Date(departureDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(departureDate);
        endDate.setHours(23, 59, 59, 999);

        filter.departureTime = { $gte: startDate, $lte: endDate };
      }

      console.log("Searching for flights with filter:", filter);

      // Find existing flights
      let flights = await Flight.find(filter).limit(10);

      // If no flights found, create them dynamically
      if (flights.length === 0 && depCityName && arrCityName) {
        console.log(
          `No flights found for ${depCityName} to ${arrCityName}, creating them...`
        );

        // Create flights for this route
        flights = await this.createFlightsForRoute(
          depCityName,
          depCode || depCityName.substring(0, 3).toUpperCase(),
          arrCityName,
          arrCode || arrCityName.substring(0, 3).toUpperCase(),
          departureDate || new Date()
        );
      }

      // Update prices based on dynamic pricing
      for (const flight of flights) {
        if (flight._id) {
          const flightId = flight._id.toString();
          const currentPrice = await PricingService.getCurrentPrice(
            flightId,
            userId
          );
          flight.currentPrice = currentPrice;
          await flight.save();
        }
      }

      return flights;
    } catch (error) {
      console.error("Error searching flights:", error);
      throw error;
    }
  }

  /**
   * Create flights for a specific route dynamically
   */
  static async createFlightsForRoute(
    departureCity: string,
    departureCode: string,
    arrivalCity: string,
    arrivalCode: string,
    departureDate: Date
  ): Promise<any[]> {
    const airlines = ["IndiGo", "SpiceJet", "Air India", "Vistara", "Go First"];
    const aircraft = [
      "Airbus A320",
      "Boeing 737",
      "Airbus A321",
      "Boeing 777",
      "Airbus A319",
    ];

    const flights = [];
    const baseDate = new Date(departureDate);

    // Create 5-8 flights for this route
    const flightCount = 5 + Math.floor(Math.random() * 4);

    for (let i = 0; i < flightCount; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNumber = `${airline.substring(0, 2)}${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      // Distribute flights throughout the day
      const departureTime = new Date(baseDate);
      departureTime.setHours(
        6 + Math.floor(i * (18 / flightCount)),
        Math.floor(Math.random() * 60),
        0,
        0
      );

      // Flight duration between 1-4 hours
      const duration = 60 + Math.floor(Math.random() * 180);
      const arrivalTime = new Date(departureTime);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + duration);

      // Base price between Rs 2,000 - Rs 8,000
      const basePrice = 2000 + Math.floor(Math.random() * 6000);

      const flight = new Flight({
        flightNumber,
        airline,
        departureCity,
        departureAirport: `${departureCity} International Airport`,
        departureCode,
        arrivalCity,
        arrivalAirport: `${arrivalCity} International Airport`,
        arrivalCode,
        departureTime,
        arrivalTime,
        duration,
        basePrice,
        currentPrice: basePrice,
        seatsAvailable: 50 + Math.floor(Math.random() * 100),
        aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
      });

      const savedFlight = await flight.save();
      flights.push(savedFlight);
    }

    console.log(
      `Created ${flights.length} flights for ${departureCity} to ${arrivalCity}`
    );
    return flights;
  }

  /**
   * Get flight details by ID
   */
  static async getFlightById(flightId: string, userId: string): Promise<any> {
    try {
      let flight;

      // First try to find by MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(flightId)) {
        flight = await Flight.findById(flightId);
      }

      // If not found, try to find by flightNumber
      if (!flight) {
        // Handle IDs like "flight_1", "flight_2", etc.
        if (flightId.startsWith("flight_")) {
          // These are mock IDs from the frontend - we should not use them
          console.log(
            `Mock flight ID detected: ${flightId}. Please use real flight IDs from the database.`
          );
          return null;
        }

        // Try exact flightNumber match
        flight = await Flight.findOne({ flightNumber: flightId });
      }

      if (!flight) {
        console.log(`Flight not found for ID: ${flightId}`);
        return null;
      }

      // Apply dynamic pricing
      const currentPrice = await PricingService.getCurrentPrice(
        flight._id.toString(),
        userId
      );
      flight.currentPrice = currentPrice;
      await flight.save();

      return flight;
    } catch (error) {
      console.error("Error getting flight by ID:", error);
      throw error;
    }
  }

  /**
   * Delete all flights (for testing purposes)
   */
  static async deleteAllFlights(): Promise<void> {
    try {
      await Flight.deleteMany({});
      console.log("All flights deleted");
    } catch (error) {
      console.error("Error deleting flights:", error);
      throw error;
    }
  }

  /**
   * Seed initial flight data
   */
  static async seedFlights(): Promise<void> {
    try {
      const flightCount = await Flight.countDocuments();
      if (flightCount > 0) {
        console.log(
          `Database already has ${flightCount} flights. Skipping seed.`
        );
        return;
      }

      console.log(
        "No flights found in database. Flights will be created dynamically when users search."
      );
    } catch (error) {
      console.error("Error seeding flights:", error);
      throw error;
    }
  }
}
