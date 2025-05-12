// src/services/flight-service.ts
import api from "./api";
import { Flight, FlightSearchCriteria } from "../types/flight";

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

      try {
        // Build query string for backend
        const queryParams = new URLSearchParams();

        // Send full city name with code if available
        queryParams.append("departureCity", criteria.departureCity || "");
        queryParams.append("arrivalCity", criteria.arrivalCity || "");
        queryParams.append("departureDate", criteria.departureDate || "");

        if (criteria.passengers) {
          queryParams.append("passengers", criteria.passengers.toString());
        }

        const url = `/flights/search?${queryParams.toString()}`;
        console.log("Making API request to:", url);

        const response = await api.get(url);
        console.log("Flight search response:", response.data);

        if (response.data.flights && Array.isArray(response.data.flights)) {
          // Store flights in cache
          response.data.flights.forEach((flight: Flight) => {
            flightCache.set(flight._id.toString(), flight);
          });

          // Return flights from the backend as-is (they already have dynamic pricing applied)
          return response.data.flights;
        }
      } catch (error) {
        console.error("Error with flight search:", error);
        // Don't fallback to mock data immediately - let the error propagate
        throw error;
      }

      return [];
    } catch (error) {
      console.error("Error in flight search:", error);
      throw error;
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

      // If not in cache, get from API
      console.log(`Fetching flight from API for ID: ${id}`);
      const response = await api.get(`/flights/${id}`);
      const flight = response.data.flight;

      if (!flight) {
        throw new Error(`Flight not found with ID: ${id}`);
      }

      // Store in cache
      flightCache.set(id, flight);

      return flight;
    } catch (error) {
      console.error("Error getting flight by ID:", error);
      throw error;
    }
  },

  /**
   * Store search history for reference
   */
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

  /**
   * Get search history
   */
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

  /**
   * Clear flight cache (useful for testing)
   */
  clearCache(): void {
    flightCache.clear();
    console.log("Flight cache cleared");
  },
};

export default flightService;
