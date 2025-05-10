// src/utils/dev-utils/index.ts
// This file ensures that DevUtils are properly loaded in development environment
import DevUtils from "../dev-utils";

// Immediately initialize the utils and add to window
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("Initializing DevUtils globally from index.ts");
  (window as any).skyBookerUtils = DevUtils;

  // Create some default bookings if needed
  setTimeout(() => {
    if (typeof window !== "undefined" && (window as any).skyBookerUtils) {
      console.log("Creating default bookings from index.ts");
      (window as any).skyBookerUtils.initializeTestData();

      // Log a helper message for developers
      console.log(
        "%c SkyBooker Development Utilities",
        "background: #3b82f6; color: white; padding: 2px 4px; border-radius: 4px; font-weight: bold;"
      );
      console.log("%c Available commands:", "font-weight: bold;");
      console.log("%c • skyBookerUtils.createTestBooking()", "color: #3b82f6");
      console.log("%c • skyBookerUtils.resetAllBookings()", "color: #3b82f6");
      console.log("%c • skyBookerUtils.printAllStorage()", "color: #3b82f6");
      console.log(
        "%c • skyBookerUtils.generateBookingsReport()",
        "color: #3b82f6"
      );
    }
  }, 1000);
}

export default DevUtils;
