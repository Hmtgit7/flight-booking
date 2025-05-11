// backend/src/scripts/seed.ts
import mongoose from "mongoose";
import { config } from "../config/env";
import { Flight } from "../models/flight-model";

// Connect to MongoDB
const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongodb_uri);
    console.log("Connected to MongoDB for seeding");

    // Check if flights already exist
    const flightCount = await Flight.countDocuments();

    if (flightCount > 0) {
      console.log(
        `Database already has ${flightCount} flights. Skipping seed.`
      );
      return;
    }

    // Define airlines and cities
    const airlines = ["IndiGo", "SpiceJet", "Air India", "Vistara", "Go First"];
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
    ];
    const aircraft = [
      "Airbus A320",
      "Boeing 737",
      "Airbus A321",
      "Boeing 777",
      "Airbus A319",
    ];

    // Prepare flight data
    const flights = [];

    // Create one flight with ID "flight_1" to handle the special test case
    console.log("Creating special test flight with flightNumber 'flight_1'");
    const testFlight = new Flight({
      flightNumber: "flight_1",
      airline: "Test Airline",
      departureCity: "Mumbai",
      departureAirport: "Chhatrapati Shivaji Maharaj International Airport",
      departureCode: "BOM",
      arrivalCity: "Delhi",
      arrivalAirport: "Indira Gandhi International Airport",
      arrivalCode: "DEL",
      departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      arrivalTime: new Date(
        Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ), // 2 hours later
      duration: 120, // 2 hours in minutes
      basePrice: 2500,
      currentPrice: 2500,
      seatsAvailable: 50,
      aircraft: "Airbus A320",
    });

    await testFlight.save();
    console.log("Created test flight:", testFlight);

    // Generate random flights
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

    // Insert flights into database
    await Flight.insertMany(flights);
    console.log(
      `Successfully seeded ${
        flights.length + 1
      } flights (including test flight)`
    );
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the seed function
seedDatabase();
