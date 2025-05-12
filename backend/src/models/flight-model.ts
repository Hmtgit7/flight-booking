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
      unique: true, // Ensure unique flight numbers
      index: true,
    },
    airline: { type: String, required: true },
    departureCity: { type: String, required: true, index: true },
    departureAirport: { type: String, required: true },
    departureCode: { type: String, required: true, index: true },
    arrivalCity: { type: String, required: true, index: true },
    arrivalAirport: { type: String, required: true },
    arrivalCode: { type: String, required: true, index: true },
    departureTime: { type: Date, required: true, index: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    searchCount: { type: Number, default: 0 },
    lastSearched: { type: Date },
    seatsAvailable: { type: Number, default: 60 },
    aircraft: { type: String, required: true },
  },
  { timestamps: true }
);

// Create compound index for efficient route searches
FlightSchema.index({ departureCity: 1, arrivalCity: 1, departureTime: 1 });
FlightSchema.index({ departureCode: 1, arrivalCode: 1, departureTime: 1 });

export const Flight = mongoose.model<IFlight>("Flight", FlightSchema);
