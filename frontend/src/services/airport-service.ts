// src/services/airport-service.ts
import { Airport } from "../types/flight";

// This is a mock service since we're not using a real airport API for the demo
// In a real application, you would call an actual API endpoint
export const airportService = {
  async searchAirports(query: string): Promise<Airport[]> {
    // Simulating API call with setTimeout
    return new Promise((resolve) => {
      setTimeout(() => {
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
          { name: "Pune Airport", city: "Pune", code: "PNQ", country: "India" },
          {
            name: "Jaipur International Airport",
            city: "Jaipur",
            code: "JAI",
            country: "India",
          },
          {
            name: "Chaudhary Charan Singh International Airport",
            city: "Lucknow",
            code: "LKO",
            country: "India",
          },
          {
            name: "Goa International Airport",
            city: "Goa",
            code: "GOI",
            country: "India",
          },
          {
            name: "Lokpriya Gopinath Bordoloi International Airport",
            city: "Guwahati",
            code: "GAU",
            country: "India",
          },
          {
            name: "Thiruvananthapuram International Airport",
            city: "Thiruvananthapuram",
            code: "TRV",
            country: "India",
          },
          {
            name: "Biju Patnaik International Airport",
            city: "Bhubaneswar",
            code: "BBI",
            country: "India",
          },
          {
            name: "Jay Prakash Narayan International Airport",
            city: "Patna",
            code: "PAT",
            country: "India",
          },
        ];

        const filteredAirports = airports.filter(
          (airport) =>
            airport.name.toLowerCase().includes(query.toLowerCase()) ||
            airport.city.toLowerCase().includes(query.toLowerCase()) ||
            airport.code.toLowerCase().includes(query.toLowerCase())
        );

        resolve(filteredAirports);
      }, 300); // Simulate API delay
    });
  },
};
