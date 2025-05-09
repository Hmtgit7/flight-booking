// backend/src/services/pricing-service.ts
import { IPriceHistory, PriceHistory } from "../models/price-history-model";
import { Flight, IFlight } from "../models/flight-model";
import mongoose from "mongoose";

export class PricingService {
  /**
   * Calculate dynamic pricing based on user search behavior
   * Increases price by 10% if searched 3 times within 5 minutes
   * Resets price after 10 minutes
   */
  static async calculateDynamicPrice(
    flightId: string,
    userId: string
  ): Promise<number> {
    try {
      const flight = await Flight.findById(flightId);
      if (!flight) {
        throw new Error("Flight not found");
      }

      // Find existing price history or create new
      let priceHistory = await PriceHistory.findOne({
        flight: new mongoose.Types.ObjectId(flightId),
        user: new mongoose.Types.ObjectId(userId),
      });

      if (!priceHistory) {
        priceHistory = new PriceHistory({
          flight: flightId,
          user: userId,
          searchCount: 1,
          lastSearchTime: new Date(),
          originalPrice: flight.basePrice,
        });
        await priceHistory.save();
        return flight.basePrice;
      }

      const now = new Date();
      const lastSearched = new Date(priceHistory.lastSearchTime);
      const minutesSinceLastSearch =
        (now.getTime() - lastSearched.getTime()) / (1000 * 60);

      // Reset after 10 minutes
      if (minutesSinceLastSearch > 10) {
        priceHistory.searchCount = 1;
        priceHistory.lastSearchTime = now;
        await priceHistory.save();

        // Reset flight's current price to base price
        flight.currentPrice = flight.basePrice;
        await flight.save();

        return flight.basePrice;
      }

      // Increment search count
      priceHistory.searchCount += 1;
      priceHistory.lastSearchTime = now;

      // Apply 10% increase if searched 3 or more times within 5 minutes
      let finalPrice = flight.basePrice;
      if (priceHistory.searchCount >= 3 && minutesSinceLastSearch <= 5) {
        finalPrice = flight.basePrice * 1.1; // 10% increase
        priceHistory.increasedPrice = finalPrice;

        // Update flight's current price
        flight.currentPrice = finalPrice;
        await flight.save();
      }

      await priceHistory.save();
      return finalPrice;
    } catch (error) {
      console.error("Error calculating dynamic price:", error);
      throw error;
    }
  }

  /**
   * Get current price for a flight
   */
  static async getCurrentPrice(
    flightId: string,
    userId: string
  ): Promise<number> {
    try {
      const flight = await Flight.findById(flightId);
      if (!flight) {
        throw new Error("Flight not found");
      }

      return this.calculateDynamicPrice(flightId, userId);
    } catch (error) {
      console.error("Error getting current price:", error);
      throw error;
    }
  }
}
