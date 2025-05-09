// src/services/flight-service.ts
import api from "./api";
import axios from "axios";
import { Flight, FlightSearchCriteria } from "../types/flight";
import { formatDate } from "../utils/date";

// Amadeus token handling
let accessToken: string | null = null;
let tokenExpiry: number | null = null;

export const getAmadeusToken = async (): Promise<string> => {
  const AMADEUS_API_KEY = process.env.REACT_APP_AMADEUS_API_KEY;
  const AMADEUS_API_SECRET = process.env.REACT_APP_AMADEUS_API_SECRET;

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

export const flightService = {
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

      // If we have valid airport codes, try to use Amadeus API
      if (departureCode && arrivalCode && criteria.departureDate) {
        try {
          // Get Amadeus token
          const token = await getAmadeusToken();

          // Format date as YYYY-MM-DD
          const departureDate = criteria.departureDate;

          // Make the request to Amadeus Flight Offers API
          const response = await axios.get(
            `https://test.api.amadeus.com/v2/shopping/flight-offers`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                originLocationCode: departureCode,
                destinationLocationCode: arrivalCode,
                departureDate: departureDate,
                adults: criteria.passengers || 1,
                max: 10,
                currencyCode: "INR",
              },
            }
          );

          console.log("Amadeus flight search response:", response.data);

          // Transform Amadeus API response to our Flight type
          if (response.data.data && response.data.data.length > 0) {
            return response.data.data.map((offer: any, index: number) => {
              const itinerary = offer.itineraries[0];
              const firstSegment = itinerary.segments[0];
              const lastSegment =
                itinerary.segments[itinerary.segments.length - 1];

              // Extract departure and arrival information
              const departureAirport = firstSegment.departure.iataCode;
              const arrivalAirport = lastSegment.arrival.iataCode;
              const departureTime = firstSegment.departure.at;
              const arrivalTime = lastSegment.arrival.at;

              // Calculate duration in minutes
              const durationStr = itinerary.duration.replace("PT", "");
              let durationMinutes = 0;

              if (durationStr.includes("H")) {
                const hours = parseInt(durationStr.split("H")[0]);
                durationMinutes += hours * 60;

                if (durationStr.includes("M")) {
                  const minutes = parseInt(
                    durationStr.split("H")[1].replace("M", "")
                  );
                  durationMinutes += minutes;
                }
              } else if (durationStr.includes("M")) {
                const minutes = parseInt(durationStr.replace("M", ""));
                durationMinutes += minutes;
              }

              // Get price
              const basePrice = parseFloat(offer.price.total);

              // Apply dynamic pricing based on search count
              const currentPrice =
                searchCount >= 3 ? Math.round(basePrice * 1.1) : basePrice;

              // Get airline code from first segment
              const airlineCode = firstSegment.carrierCode;

              // Map to our Flight type
              return {
                _id: `flight_${offer.id || index}`,
                flightNumber: `${airlineCode}${firstSegment.number}`,
                airline: getAirlineName(airlineCode), // Helper function to map code to name
                departureCity: criteria.departureCity?.split(" (")[0],
                departureAirport: `${departureAirport} Airport`,
                departureCode: departureAirport,
                arrivalCity: criteria.arrivalCity?.split(" (")[0],
                arrivalAirport: `${arrivalAirport} Airport`,
                arrivalCode: arrivalAirport,
                departureTime: departureTime,
                arrivalTime: arrivalTime,
                duration: durationMinutes,
                basePrice: basePrice,
                currentPrice: currentPrice,
                seatsAvailable: Math.floor(Math.random() * 50) + 10, // Random seats
                aircraft: getAircraftType(firstSegment.aircraft?.code || "320"),
                priceIncreased: searchCount >= 3,
              };
            });
          }
        } catch (error) {
          console.error("Error using Amadeus Flight Offers API:", error);
          // Fall back to mock flights
        }
      }

      // If Amadeus API fails or we don't have proper codes, try querying the backend
      try {
        // Build query string for backend
        const queryParams = new URLSearchParams();

        if (criteria.departureCity) {
          const match = criteria.departureCity.match(/\(([^)]+)\)/);
          const code = match ? match[1] : criteria.departureCity;
          queryParams.append("departureCity", code);
        }

        if (criteria.arrivalCity) {
          const match = criteria.arrivalCity.match(/\(([^)]+)\)/);
          const code = match ? match[1] : criteria.arrivalCity;
          queryParams.append("arrivalCity", code);
        }

        if (criteria.departureDate) {
          queryParams.append("departureDate", criteria.departureDate);
        }

        if (criteria.passengers) {
          queryParams.append("passengers", criteria.passengers.toString());
        }

        const url = `/flights/search?${queryParams.toString()}`;
        console.log("Making backend API request to:", url);

        const response = await api.get(url);
        console.log("Backend flight search response:", response.data);

        if (response.data.flights && response.data.flights.length > 0) {
          // Apply dynamic pricing to backend results
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
        console.error("Error with backend flight search:", error);
      }

      // If both Amadeus and backend fail, fall back to mock data
      console.log("Falling back to mock flight data");
      return getMockFlights(criteria, searchCount);
    } catch (error) {
      console.error("Error in flight search:", error);
      // Return mock flights as fallback
      return getMockFlights(criteria, 0);
    }
  },

  async getFlightById(id: string): Promise<Flight> {
    try {
      const response = await api.get(`/flights/${id}`);
      return response.data.flight;
    } catch (error) {
      console.error("Error getting flight by ID:", error);
      // Return mock flight by ID
      const mockFlights = getMockFlights({}, 0);
      const flight = mockFlights.find((f) => f._id === id);
      if (flight) return flight;

      throw new Error("Flight not found");
    }
  },
};

// Helper function to map airline codes to airline names
function getAirlineName(code: string): string {
  const airlines: { [key: string]: string } = {
    AF: "Air France",
    BA: "British Airways",
    LH: "Lufthansa",
    EK: "Emirates",
    QF: "Qantas",
    SQ: "Singapore Airlines",
    UA: "United Airlines",
    DL: "Delta Air Lines",
    AA: "American Airlines",
    AC: "Air Canada",
    AI: "Air India",
    IX: "Air India Express",
    UK: "Vistara",
    "6E": "IndiGo",
    SG: "SpiceJet",
    G8: "GoAir",
    I5: "AirAsia India",
  };

  return airlines[code] || `Airline (${code})`;
}

// Helper function to map aircraft codes to readable names
function getAircraftType(code: string): string {
  const aircraft: { [key: string]: string } = {
    "320": "Airbus A320",
    "321": "Airbus A321",
    "319": "Airbus A319",
    "738": "Boeing 737-800",
    "737": "Boeing 737",
    "777": "Boeing 777",
    "787": "Boeing 787 Dreamliner",
    "380": "Airbus A380",
  };

  return aircraft[code] || `Aircraft (${code})`;
}

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

  // Generate 10 random flights
  for (let i = 0; i < 10; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const flightNumber = `${airline.substring(0, 2)}${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // Use provided departure date or default to today + random days
    let departureTime = new Date();
    if (criteria.departureDate) {
      departureTime = new Date(criteria.departureDate);
    } else {
      departureTime.setDate(
        departureTime.getDate() + Math.floor(Math.random() * 7)
      );
    }

    // Set random hours and minutes
    departureTime.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 12) * 5,
      0,
      0
    );

    // Duration between 1-4 hours
    const durationMinutes = 60 + Math.floor(Math.random() * 180);

    // Calculate arrival time
    const arrivalTime = new Date(departureTime);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);

    // Base price between Rs 2,000 - Rs 3,000
    const basePrice = 2000 + Math.floor(Math.random() * 1000);

    // Apply dynamic pricing
    const currentPrice =
      searchCount >= 3 ? Math.round(basePrice * 1.1) : basePrice;

    flights.push({
      _id: `flight_${i + 1}`,
      flightNumber,
      airline,
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
      seatsAvailable: 30 + Math.floor(Math.random() * 70),
      aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
      priceIncreased: searchCount >= 3,
    });
  }

  return flights;
}
