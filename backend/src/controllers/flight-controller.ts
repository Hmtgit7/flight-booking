// backend/src/controllers/flight-controller.ts
import { Request, Response } from "express";
import { FlightService } from "../services/flight-service";

export class FlightController {
  /**
   * Search flights based on criteria
   */
  static async searchFlights(req: Request, res: Response): Promise<void> {
    try {
      const {
        departureCity,
        arrivalCity,
        departureDate,
        returnDate,
        passengers,
      } = req.query;
      const userId = req.userId as string;

      console.log("Received search request with criteria:", {
        departureCity,
        arrivalCity,
        departureDate,
        returnDate,
        passengers,
      });

      const searchCriteria = {
        departureCity: departureCity as string,
        arrivalCity: arrivalCity as string,
        departureDate: departureDate
          ? new Date(departureDate as string)
          : undefined,
        returnDate: returnDate ? new Date(returnDate as string) : undefined,
        passengers: passengers ? parseInt(passengers as string) : undefined,
      };

      const flights = await FlightService.searchFlights(searchCriteria, userId);

      res.status(200).json({
        success: true,
        flights,
      });
    } catch (error: any) {
      console.error("Error in searchFlights controller:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get flight details by ID
   */
  static async getFlightById(req: Request, res: Response): Promise<void> {
    try {
      const flightId = req.params.id;
      const userId = req.userId as string;

      console.log(`Getting flight by ID: ${flightId}`);

      const flight = await FlightService.getFlightById(flightId, userId);

      if (!flight) {
        res.status(404).json({ success: false, message: "Flight not found" });
        return;
      }

      res.status(200).json({
        success: true,
        flight,
      });
    } catch (error: any) {
      console.error("Error in getFlightById controller:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
