// backend/src/services/flight-service.ts
import { Flight, IFlight } from "../models/flight-model";
import { PricingService } from "./pricing-service";

interface FlightSearchCriteria {
  departureCity?: string;
  arrivalCity?: string;
  departureDate?: Date;
  returnDate?: Date;
  passengers?: number;
}

export class FlightService {
  /**
   * Search flights based on criteria
   */
  static async searchFlights(
    criteria: FlightSearchCriteria,
    userId: string
  ): Promise<IFlight[]> {
    try {
      const { departureCity, arrivalCity, departureDate } = criteria;

      // Basic filter object
      const filter: any = {};

      if (departureCity)
        filter.departureCity = { $regex: departureCity, $options: "i" };
      if (arrivalCity)
        filter.arrivalCity = { $regex: arrivalCity, $options: "i" };

      if (departureDate) {
        const startDate = new Date(departureDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(departureDate);
        endDate.setHours(23, 59, 59, 999);

        filter.departureTime = { $gte: startDate, $lte: endDate };
      }

      // Find flights matching criteria
      const flights = await Flight.find(filter).limit(10);

      // Update prices based on dynamic pricing
      for (const flight of flights) {
        // Ensure flight._id is properly typed
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
   * Get flight details by ID
   */
  static async getFlightById(
    flightId: string,
    userId: string
  ): Promise<IFlight | null> {
    try {
      const flight = await Flight.findById(flightId);
      if (!flight) return null;

      // Apply dynamic pricing
      const currentPrice = await PricingService.getCurrentPrice(
        flightId,
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
   * Seed initial flight data
   */
  static async seedFlights(): Promise<void> {
    try {
      const flightCount = await Flight.countDocuments();
      if (flightCount > 0) return; // Skip if already seeded

      const airlines = [
        "IndiGo",
        "SpiceJet",
        "Air India",
        "Vistara",
        "Go First",
      ];
      const cities = [
        {
          city: "Delhi",
          airport: "Indira Gandhi International Airport",
          code: "DEL",
        },
        {
          city: "Mumbai",
          airport: "Chhatrapati Shivaji Maharaj International Airport",
          code: "BOM",
        },
        {
          city: "Bangalore",
          airport: "Kempegowda International Airport",
          code: "BLR",
        },
        {
          city: "Chennai",
          airport: "Chennai International Airport",
          code: "MAA",
        },
        {
          city: "Kolkata",
          airport: "Netaji Subhas Chandra Bose International Airport",
          code: "CCU",
        },
        {
          city: "Hyderabad",
          airport: "Rajiv Gandhi International Airport",
          code: "HYD",
        },
        {
          city: "Ahmedabad",
          airport: "Sardar Vallabhbhai Patel International Airport",
          code: "AMD",
        },
        { city: "Pune", airport: "Pune Airport", code: "PNQ" },
        {
          city: "Jaipur",
          airport: "Jaipur International Airport",
          code: "JAI",
        },
        {
          city: "Lucknow",
          airport: "Chaudhary Charan Singh International Airport",
          code: "LKO",
        },
      ];

      const aircraft = [
        "Airbus A320",
        "Boeing 737",
        "Airbus A321",
        "Boeing 777",
        "Airbus A319",
      ];

      const flights = [];

      // Generate 20 random flights
      for (let i = 0; i < 20; i++) {
        const departureIndex = Math.floor(Math.random() * cities.length);
        let arrivalIndex;
        do {
          arrivalIndex = Math.floor(Math.random() * cities.length);
        } while (arrivalIndex === departureIndex);

        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const flightNumber = `${airline.substring(0, 2)}${Math.floor(
          1000 + Math.random() * 9000
        )}`;

        // Generate random departure times for the next 7 days
        const departureDate = new Date();
        departureDate.setDate(
          departureDate.getDate() + Math.floor(Math.random() * 7)
        );
        departureDate.setHours(
          Math.floor(Math.random() * 24),
          Math.floor(Math.random() * 12) * 5,
          0,
          0
        );

        // Duration between 1-4 hours
        const durationMinutes = 60 + Math.floor(Math.random() * 180);

        // Calculate arrival time
        const arrivalDate = new Date(departureDate);
        arrivalDate.setMinutes(arrivalDate.getMinutes() + durationMinutes);

        // Base price between Rs 2,000 - Rs 3,000
        const basePrice = 2000 + Math.floor(Math.random() * 1000);

        flights.push({
          flightNumber,
          airline,
          departureCity: cities[departureIndex].city,
          departureAirport: cities[departureIndex].airport,
          departureCode: cities[departureIndex].code,
          arrivalCity: cities[arrivalIndex].city,
          arrivalAirport: cities[arrivalIndex].airport,
          arrivalCode: cities[arrivalIndex].code,
          departureTime: departureDate,
          arrivalTime: arrivalDate,
          duration: durationMinutes,
          basePrice,
          currentPrice: basePrice,
          seatsAvailable: 30 + Math.floor(Math.random() * 70),
          aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
        });
      }

      await Flight.insertMany(flights);
      console.log("Flights seeded successfully");
    } catch (error) {
      console.error("Error seeding flights:", error);
      throw error;
    }
  }
}
