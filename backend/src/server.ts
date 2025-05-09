// backend/src/server.ts
import app from "./app";
import { config } from "./config/env";
import { connectDB } from "./config/db";
import { FlightService } from "./services/flight-service";

// Connect to MongoDB
connectDB()
  .then(() => {
    // Seed initial flight data
    return FlightService.seedFlights();
  })
  .then(() => {
    // Start server
    const PORT = config.port;

    app.listen(PORT, () => {
      console.log(`Server running in ${config.node_env} mode on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error starting server:", error);
    process.exit(1);
  });
