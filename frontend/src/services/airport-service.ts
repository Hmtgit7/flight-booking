// frontend/src/services/airport-service.ts
import axios from "axios";
import { Airport } from "../types/flight";

const AMADEUS_API_KEY = process.env.REACT_APP_AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.REACT_APP_AMADEUS_API_SECRET;

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

// Export this function so flight-service can use it too
export const getAmadeusToken = async (): Promise<string> => {
  // Check if we have a valid token
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // Otherwise, get a new token
  try {
    console.log("Getting new Amadeus token");
    const response = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: AMADEUS_API_KEY || "",
        client_secret: AMADEUS_API_SECRET || "",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("Amadeus token response:", response.data);
    const newToken = response.data.access_token;
    // Set expiry to 30 minutes before actual expiry to be safe
    tokenExpiry = Date.now() + (response.data.expires_in - 1800) * 1000;
    accessToken = newToken;

    return newToken;
  } catch (error) {
    console.error("Error getting Amadeus token:", error);
    throw new Error("Failed to get authentication token");
  }
};

// Store search results cache to reduce API calls
const searchCache: Record<string, { data: Airport[]; timestamp: number }> = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const airportService = {
  async searchAirports(query: string): Promise<Airport[]> {
    if (query.trim().length < 2) {
      return [];
    }

    // Check if we have a cached result that's still valid
    const cacheKey = query.toLowerCase();
    if (
      searchCache[cacheKey] &&
      Date.now() - searchCache[cacheKey].timestamp < CACHE_EXPIRY
    ) {
      console.log("Using cached airport search results for:", query);
      return searchCache[cacheKey].data;
    }

    try {
      // Get access token
      const token = await getAmadeusToken();

      // Add console logs to debug API call
      console.log("Searching for airports with query:", query);

      // Make API request to search locations
      const response = await axios.get(
        `https://test.api.amadeus.com/v1/reference-data/locations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            keyword: query,
            subType: "AIRPORT,CITY",
            "page[limit]": 10,
          },
        }
      );

      console.log("Amadeus API response:", response.data);

      // Map API response to our Airport type
      if (response.data.data && response.data.data.length > 0) {
        const airports = response.data.data.map((item: any) => ({
          name: item.name || "",
          city: item.address?.cityName || item.name || "",
          code: item.iataCode || "",
          country: item.address?.countryName || "",
        }));

        // Cache the results
        searchCache[cacheKey] = {
          data: airports,
          timestamp: Date.now(),
        };

        return airports;
      }

      // If no results from API, try mock data
      const mockData = mockSearchAirports(query);

      // Cache the mock results
      searchCache[cacheKey] = {
        data: mockData,
        timestamp: Date.now(),
      };

      return mockData;
    } catch (error) {
      console.error("Error searching airports:", error);
      console.log("Falling back to mock data");

      // Fallback to use existing mock data if API fails
      const mockData = mockSearchAirports(query);

      // Cache the mock results
      searchCache[cacheKey] = {
        data: mockData,
        timestamp: Date.now(),
      };

      return mockData;
    }
  },

  // Clear cache method for testing or manual cache invalidation
  clearCache(): void {
    Object.keys(searchCache).forEach((key) => {
      delete searchCache[key];
    });
    console.log("Airport search cache cleared");
  },
};

// Enhanced mock function with more airports
function mockSearchAirports(query: string): Airport[] {
  const airports: Airport[] = [
    {
      name: "Indira Gandhi International Airport",
      city: "Delhi",
      code: "DEL",
      country: "India",
    },
    {
      name: "Chhatrapati Shivaji Maharaj International Airport",
      city: "Mumbai",
      code: "BOM",
      country: "India",
    },
    {
      name: "Kempegowda International Airport",
      city: "Bangalore",
      code: "BLR",
      country: "India",
    },
    {
      name: "Chennai International Airport",
      city: "Chennai",
      code: "MAA",
      country: "India",
    },
    {
      name: "Netaji Subhas Chandra Bose International Airport",
      city: "Kolkata",
      code: "CCU",
      country: "India",
    },
    {
      name: "Rajiv Gandhi International Airport",
      city: "Hyderabad",
      code: "HYD",
      country: "India",
    },
    {
      name: "Sardar Vallabhbhai Patel International Airport",
      city: "Ahmedabad",
      code: "AMD",
      country: "India",
    },
    {
      name: "Pune Airport",
      city: "Pune",
      code: "PNQ",
      country: "India",
    },
    {
      name: "Jaipur International Airport",
      city: "Jaipur",
      code: "JAI",
      country: "India",
    },
    {
      name: "Goa International Airport",
      city: "Goa",
      code: "GOI",
      country: "India",
    },
    // Add international airports for better search results
    {
      name: "O'Hare International Airport",
      city: "Chicago",
      code: "ORD",
      country: "United States",
    },
    {
      name: "Midway International Airport",
      city: "Chicago",
      code: "MDW",
      country: "United States",
    },
    {
      name: "Heathrow Airport",
      city: "London",
      code: "LHR",
      country: "United Kingdom",
    },
    {
      name: "Charles de Gaulle Airport",
      city: "Paris",
      code: "CDG",
      country: "France",
    },
    {
      name: "Schiphol Airport",
      city: "Amsterdam",
      code: "AMS",
      country: "Netherlands",
    },
    {
      name: "Dubai International Airport",
      city: "Dubai",
      code: "DXB",
      country: "United Arab Emirates",
    },
    {
      name: "Changi Airport",
      city: "Singapore",
      code: "SIN",
      country: "Singapore",
    },
    {
      name: "Incheon International Airport",
      city: "Seoul",
      code: "ICN",
      country: "South Korea",
    },
    {
      name: "Sydney Airport",
      city: "Sydney",
      code: "SYD",
      country: "Australia",
    },
    {
      name: "Narita International Airport",
      city: "Tokyo",
      code: "NRT",
      country: "Japan",
    },
  ];

  // Case insensitive search on city, airport name, or code
  return airports.filter(
    (airport) =>
      airport.name.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase()) ||
      airport.code.toLowerCase().includes(query.toLowerCase())
  );
}
