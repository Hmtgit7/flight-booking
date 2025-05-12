// backend/src/scripts/init-db.ts
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { Flight } from "../models/flight-model";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/flight-booking"
    );
    console.log("Connected to MongoDB");

    // Check if we have any flights
    const flightCount = await Flight.countDocuments();
    console.log(`Current number of flights in database: ${flightCount}`);

    if (flightCount === 0) {
      console.log(
        "No flights found. Flights will be created dynamically when users search for routes."
      );
    }

    // Create indexes for better performance
    await Flight.collection.createIndex({
      departureCity: 1,
      arrivalCity: 1,
      departureTime: 1,
    });
    await Flight.collection.createIndex({
      departureCode: 1,
      arrivalCode: 1,
      departureTime: 1,
    });
    console.log("Database indexes created");

    console.log("Database initialization completed!");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the initialization
initializeDatabase();
