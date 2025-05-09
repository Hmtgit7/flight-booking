// backend/src/models/price-history-model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPriceHistory extends Document {
  flight: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; // To track per user
  searchCount: number;
  lastSearchTime: Date;
  originalPrice: number;
  increasedPrice: number;
}

const PriceHistorySchema: Schema = new Schema(
  {
    flight: { type: Schema.Types.ObjectId, ref: "Flight", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    searchCount: { type: Number, default: 0 },
    lastSearchTime: { type: Date, default: Date.now },
    originalPrice: { type: Number, required: true },
    increasedPrice: { type: Number },
  },
  { timestamps: true }
);

export const PriceHistory = mongoose.model<IPriceHistory>(
  "PriceHistory",
  PriceHistorySchema
);
