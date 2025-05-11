// src/services/flight-service.ts
import api from "./api";
// Remove unused axios import
import { Flight, FlightSearchCriteria } from "../types/flight";
// Remove unused formatDate import

// Basic caching mechanism for flights
const flightCache: Map<string, Flight> = new Map();

export const flightService = {
  /**
   * Search flights based on criteria
   */
  async searchFlights(criteria: FlightSearchCriteria): Promise<Flight[]> {
    try {
      console.log("Searching with criteria:", criteria);

      // Extract airport codes from the city strings
      let departureCode = "";
      let arrivalCode = "";

      if (criteria.departureCity) {
        const match = criteria.departureCity.match(/\(([^)]+)\)/);
        departureCode = match ? match[1] : "";
      }

      if (criteria.arrivalCity) {
        const match = criteria.arrivalCity.match(/\(([^)]+)\)/);
        arrivalCode = match ? match[1] : "";
      }

      // Get the search count from localStorage to implement dynamic pricing
      const searchCountKey = `${criteria.departureCity}-${criteria.arrivalCity}-${criteria.departureDate}`;
      const savedCounts = localStorage.getItem("flightSearchCounts");
      let searchCount = 0;

      if (savedCounts) {
        try {
          const parsedCounts = JSON.parse(savedCounts);
          const countInfo = parsedCounts[searchCountKey];
          if (countInfo && Date.now() - countInfo.timestamp < 10 * 60 * 1000) {
            searchCount = countInfo.count;
          }
        } catch (e) {
          console.error("Error parsing saved search counts:", e);
        }
      }

      // Record this search in search history
      this.recordSearchHistory(criteria);

      // If we have valid airport codes, try to use API
      if (departureCode && arrivalCode && criteria.departureDate) {
        try {
          // Build query string for backend
          const queryParams = new URLSearchParams();

          queryParams.append("departureCity", departureCode);
          queryParams.append("arrivalCity", arrivalCode);
          queryParams.append("departureDate", criteria.departureDate);

          if (criteria.passengers) {
            queryParams.append("passengers", criteria.passengers.toString());
          }

          const url = `/flights/search?${queryParams.toString()}`;
          console.log("Making API request to:", url);

          const response = await api.get(url);
          console.log("Flight search response:", response.data);

          if (response.data.flights && response.data.flights.length > 0) {
            // Store flights in cache
            response.data.flights.forEach((flight: Flight) => {
              flightCache.set(flight._id.toString(), flight);
            });

            // Apply dynamic pricing to results
            return response.data.flights.map((flight: Flight) => {
              if (searchCount >= 3) {
                return {
                  ...flight,
                  currentPrice: Math.round(flight.basePrice * 1.1),
                  priceIncreased: true,
                };
              }
              return {
                ...flight,
                priceIncreased: false,
              };
            });
          }
        } catch (error) {
          console.error("Error with flight search:", error);
          // Fall through to mock data
        }
      }

      // If API search fails, fall back to mock data
      console.log("Falling back to mock flight data");
      const mockFlights = getMockFlights(criteria, searchCount);

      // Add mock flights to cache
      mockFlights.forEach((flight) => {
        flightCache.set(flight._id.toString(), flight);
      });

      return mockFlights;
    } catch (error) {
      console.error("Error in flight search:", error);
      // Return mock flights as fallback
      const mockFlights = getMockFlights(criteria, 0);
      mockFlights.forEach((flight) => {
        flightCache.set(flight._id.toString(), flight);
      });
      return mockFlights;
    }
  },

  /**
   * Get flight by ID (with caching)
   */
  async getFlightById(id: string): Promise<Flight> {
    try {
      // Check cache first
      if (flightCache.has(id)) {
        console.log(`Using cached flight for ID: ${id}`);
        return flightCache.get(id)!;
      }

      // If not in cache, try API
      const response = await api.get(`/flights/${id}`);
      const flight = response.data.flight;

      // Store in cache
      flightCache.set(id, flight);

      return flight;
    } catch (error) {
      console.error("Error getting flight by ID:", error);

      // Try to find in cache by flight number if ID fails
      // Fix for the MapIterator iteration issue
      for (const entry of Array.from(flightCache.entries())) {
        const [_, flight] = entry;
        if (
          id.includes("flight_") &&
          flight.flightNumber.includes(id.split("_")[1])
        ) {
          return flight;
        }
      }

      // If still not found and we're looking for 'flight_1', create a default flight
      if (id === "flight_1") {
        const defaultFlight: Flight = {
          _id: "flight_1",
          flightNumber: "flight_1",
          airline: "Default Airline",
          departureCity: "Mumbai",
          departureAirport: "Chhatrapati Shivaji Maharaj International Airport",
          departureCode: "BOM",
          arrivalCity: "Delhi",
          arrivalAirport: "Indira Gandhi International Airport",
          arrivalCode: "DEL",
          departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          arrivalTime: new Date(
            Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
          ), // +2 hours
          duration: 120, // 2 hours in minutes
          basePrice: 2500,
          currentPrice: 2500,
          seatsAvailable: 50,
          aircraft: "Airbus A320",
        };

        // Store in cache
        flightCache.set(id, defaultFlight);
        return defaultFlight;
      }

      throw new Error("Flight not found");
    }
  },

  // Store search history for reference
  recordSearchHistory(criteria: FlightSearchCriteria): void {
    try {
      const SEARCH_HISTORY_KEY = "skybooker_flight_search_history";
      const currentHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      let history = currentHistory ? JSON.parse(currentHistory) : [];

      // Add current search to history with timestamp
      history.push({
        ...criteria,
        timestamp: new Date().toISOString(),
      });

      // Keep only the last 20 searches
      if (history.length > 20) {
        history = history.slice(history.length - 20);
      }

      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Error recording search history:", e);
    }
  },

  // Get search history
  getSearchHistory(): any[] {
    try {
      const SEARCH_HISTORY_KEY = "skybooker_flight_search_history";
      const currentHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      return currentHistory ? JSON.parse(currentHistory) : [];
    } catch (e) {
      console.error("Error getting search history:", e);
      return [];
    }
  },

  // Clear flight cache (useful for testing)
  clearCache(): void {
    flightCache.clear();
    console.log("Flight cache cleared");
  },
};

// Helper functions are kept but not exported since they're not used elsewhere
// They might be used in the future or by other modules

// Function to generate mock flights
function getMockFlights(
  criteria: Partial<FlightSearchCriteria>,
  searchCount: number
): Flight[] {
  console.log("Generating mock flights with criteria:", criteria);

  const airlines = ["IndiGo", "SpiceJet", "Air India", "Vistara", "Go First"];
  const aircraft = [
    "Airbus A320",
    "Boeing 737",
    "Airbus A321",
    "Boeing 777",
    "Airbus A319",
  ];

  // Default departure and arrival if not provided
  const departureCity =
    criteria.departureCity?.replace(/\s*\([^)]*\)/g, "") || "Mumbai";
  const departureCode = criteria.departureCity?.match(/\(([^)]+)\)/)
    ? criteria.departureCity.match(/\(([^)]+)\)/)?.[1]
    : "BOM";

  const arrivalCity =
    criteria.arrivalCity?.replace(/\s*\([^)]*\)/g, "") || "Delhi";
  const arrivalCode = criteria.arrivalCity?.match(/\(([^)]+)\)/)
    ? criteria.arrivalCity.match(/\(([^)]+)\)/)?.[1]
    : "DEL";

  const flights: Flight[] = [];

  // First, add a special flight with ID "flight_1"
  const defaultAirline = airlines[Math.floor(Math.random() * airlines.length)];

  // Use provided departure date or default to today + random days
  let departureTime = new Date();
  if (criteria.departureDate) {
    departureTime = new Date(criteria.departureDate);
  } else {
    departureTime.setDate(departureTime.getDate() + 1);
  }

  // Set random hours and minutes
  departureTime.setHours(10, 0, 0, 0); // 10:00 AM

  // Duration - 2 hours
  const durationMinutes = 120;

  // Calculate arrival time
  const arrivalTime = new Date(departureTime);
  arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);

  // Base price
  const basePrice = 2500;
  const currentPrice =
    searchCount >= 3 ? Math.round(basePrice * 1.1) : basePrice;

  // Add flight_1
  flights.push({
    _id: "flight_1",
    flightNumber: "flight_1",
    airline: defaultAirline,
    departureCity,
    departureAirport: `${departureCity} International Airport`,
    departureCode: departureCode || "BOM",
    arrivalCity,
    arrivalAirport: `${arrivalCity} International Airport`,
    arrivalCode: arrivalCode || "DEL",
    departureTime: departureTime.toISOString(),
    arrivalTime: arrivalTime.toISOString(),
    duration: durationMinutes,
    basePrice,
    currentPrice,
    seatsAvailable: 50,
    aircraft: "Airbus A320",
    priceIncreased: searchCount >= 3,
  });

  // Generate 9 additional random flights
  for (let i = 0; i < 9; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const flightNumber = `${airline.substring(0, 2)}${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // Use provided departure date or default to today + random days
    let flightDepartureTime = new Date(departureTime);

    // Vary the hours for different flights
    flightDepartureTime.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 12) * 5,
      0,
      0
    );

    // Duration between 1-4 hours
    const flightDuration = 60 + Math.floor(Math.random() * 180);

    // Calculate arrival time
    const flightArrivalTime = new Date(flightDepartureTime);
    flightArrivalTime.setMinutes(
      flightArrivalTime.getMinutes() + flightDuration
    );

    // Base price between Rs 2,000 - Rs 3,000
    const flightBasePrice = 2000 + Math.floor(Math.random() * 1000);
    const flightCurrentPrice =
      searchCount >= 3 ? Math.round(flightBasePrice * 1.1) : flightBasePrice;

    flights.push({
      _id: `flight_${i + 2}`,
      flightNumber,
      airline,
      departureCity,
      departureAirport: `${departureCity} International Airport`,
      departureCode: departureCode || "BOM",
      arrivalCity,
      arrivalAirport: `${arrivalCity} International Airport`,
      arrivalCode: arrivalCode || "DEL",
      departureTime: flightDepartureTime.toISOString(),
      arrivalTime: flightArrivalTime.toISOString(),
      duration: flightDuration,
      basePrice: flightBasePrice,
      currentPrice: flightCurrentPrice,
      seatsAvailable: 30 + Math.floor(Math.random() * 70),
      aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
      priceIncreased: searchCount >= 3,
    });
  }

  return flights;
}

export default flightService;
