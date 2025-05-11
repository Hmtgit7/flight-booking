// backend/src/models/flight-model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IFlight extends Document {
  _id: mongoose.Types.ObjectId;
  flightNumber: string;
  airline: string;
  departureCity: string;
  departureAirport: string;
  departureCode: string;
  arrivalCity: string;
  arrivalAirport: string;
  arrivalCode: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number; // in minutes
  basePrice: number;
  currentPrice: number;
  searchCount: number;
  lastSearched: Date;
  seatsAvailable: number;
  aircraft: string;
}

const FlightSchema: Schema = new Schema(
  {
    flightNumber: {
      type: String,
      required: true,
      // Add index to improve lookups by flightNumber
      index: true,
    },
    airline: { type: String, required: true },
    departureCity: { type: String, required: true },
    departureAirport: { type: String, required: true },
    departureCode: { type: String, required: true },
    arrivalCity: { type: String, required: true },
    arrivalAirport: { type: String, required: true },
    arrivalCode: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    basePrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    searchCount: { type: Number, default: 0 },
    lastSearched: { type: Date },
    seatsAvailable: { type: Number, default: 60 },
    aircraft: { type: String, required: true },
  },
  { timestamps: true }
);

// Add a pre-save hook to handle special case for flightNumber "flight_1"
FlightSchema.pre<IFlight>("save", async function (next) {
  // If this is a new flight with flightNumber "flight_1"
  if (this.isNew && this.flightNumber === "flight_1") {
    console.log("Special case: Saving flight with flightNumber 'flight_1'");
  }
  next();
});

export const Flight = mongoose.model<IFlight>("Flight", FlightSchema);
