// backend/src/models/booking-model.ts
import mongoose, { Schema, Document } from "mongoose";

interface IPassenger {
  name: string;
  age: number;
  gender: string;
}

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  flight: mongoose.Types.ObjectId;
  bookingDate: Date;
  passengers: IPassenger[];
  totalAmount: number;
  status: "confirmed" | "cancelled" | "pending";
  pnr: string;
  seatNumbers: string[];
}

const BookingSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    flight: { type: Schema.Types.ObjectId, ref: "Flight", required: true },
    bookingDate: { type: Date, default: Date.now },
    passengers: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "pending"],
      default: "confirmed",
    },
    pnr: { type: String, required: true, unique: true },
    seatNumbers: [{ type: String }],
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
