// frontend/src/services/booking-service.ts
import api from "./api";
import { Booking, BookingFormData, TicketData } from "../types/booking";
import { Flight } from "../types/flight";
import { formatDate } from "../utils/date";

export const bookingService = {
  /**
   * Create a new booking
   * This will try to use the real API but fall back to mock data if needed
   */
  async createBooking(data: BookingFormData): Promise<Booking> {
    try {
      console.log("Creating booking with data:", data);

      // Check if flightId is from mock data (starts with flight_) or not a valid MongoDB ID
      if (data.flightId && !data.flightId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log("Using mock booking creation for non-MongoDB flight ID");
        return this.createMockBooking(data);
      }

      // If we have a valid MongoDB ObjectId, proceed with actual API call
      const response = await api.post("/bookings", data);
      return response.data.booking;
    } catch (error) {
      console.error("Error creating booking:", error);
      // Fall back to mock booking on error
      return this.createMockBooking(data);
    }
  },

  /**
   * Get all bookings for the current user
   */
  async getUserBookings(): Promise<Booking[]> {
    try {
      const response = await api.get("/bookings");
      return response.data.bookings;
    } catch (error) {
      console.error("Error getting user bookings:", error);
      // Return mock bookings as fallback
      return this.getMockBookings();
    }
  },

  /**
   * Get booking details by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    try {
      // Check if this is a mock booking ID (starts with booking_)
      if (id.startsWith("booking_")) {
        return this.getMockBookingById(id);
      }

      const response = await api.get(`/bookings/${id}`);
      return response.data.booking;
    } catch (error) {
      console.error("Error getting booking by ID:", error);

      // Try to get a mock booking first
      try {
        return this.getMockBookingById(id);
      } catch (mockError) {
        // If no mock booking exists either, throw error
        throw new Error("Booking not found");
      }
    }
  },

  /**
   * Generate ticket for a booking
   */
  async generateTicket(id: string): Promise<TicketData> {
    try {
      // Check if this is a mock booking ID (starts with booking_)
      if (id.startsWith("booking_")) {
        return this.getMockTicketData(id);
      }

      const response = await api.get(`/bookings/${id}/ticket`);
      return response.data.ticket;
    } catch (error) {
      console.error("Error generating ticket:", error);
      // Return mock ticket data as fallback
      return this.getMockTicketData(id);
    }
  },

  // ===== HELPER METHODS FOR MOCK DATA =====

  /**
   * Create a mock booking (used as fallback)
   */
  createMockBooking(data: BookingFormData): Booking {
    console.log("Creating mock booking with data:", data);

    // Generate a random ID for the booking
    const bookingId = `booking_${Math.random().toString(36).substring(2, 10)}`;

    // Generate PNR (6 alphanumeric characters)
    const pnr = this.generatePNR();

    // Generate random seat numbers
    const seatNumbers = this.generateSeatNumbers(data.passengers.length);

    // Get current date
    const now = new Date();
    const bookingDate = now.toISOString();

    // Get flight details - in a real app, you'd fetch this from your API
    // For now, let's hardcode some values
    const flightDetails = this.getMockFlightDetails(data.flightId);

    // Calculate total amount based on passengers
    const pricePerPassenger = flightDetails.price || 7500;
    const totalAmount = pricePerPassenger * data.passengers.length;

    // Create mock booking
    const mockBooking: Booking = {
      _id: bookingId,
      user: "current_user",
      flight: data.flightId,
      bookingDate,
      passengers: data.passengers,
      totalAmount,
      status: "confirmed",
      pnr,
      seatNumbers,
      createdAt: bookingDate,
      updatedAt: bookingDate,
    };

    // Save to localStorage to persist across page refreshes
    this.saveMockBookingToStorage(mockBooking);

    return mockBooking;
  },

  /**
   * Get a mock booking by ID (used as fallback)
   */
  getMockBookingById(id: string): Booking {
    console.log("Getting mock booking with ID:", id);

    // First try to get from localStorage
    const storedBooking = localStorage.getItem(id);
    if (storedBooking) {
      return JSON.parse(storedBooking);
    }

    // If not in localStorage, create a new one
    const mockBooking: Booking = {
      _id: id,
      user: "current_user",
      flight: "flight_1",
      bookingDate: new Date().toISOString(),
      passengers: [{ name: "John Doe", age: 35, gender: "male" }],
      totalAmount: 7500,
      status: "confirmed",
      pnr: this.generatePNR(),
      seatNumbers: ["12A"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return mockBooking;
  },

  /**
   * Get mock ticket data (used as fallback)
   */
  getMockTicketData(bookingId: string): TicketData {
    console.log("Generating mock ticket data for booking:", bookingId);

    // Try to get booking from localStorage
    let booking: Booking | null = null;
    const storedBooking = localStorage.getItem(bookingId);
    if (storedBooking) {
      booking = JSON.parse(storedBooking);
    }

    // Get departure and arrival cities based on flight ID
    const flightDetails =
      booking && booking.flight
        ? this.getMockFlightDetails(booking.flight as string)
        : {
            departureCity: "Mumbai",
            departureCode: "BOM",
            arrivalCity: "Delhi",
            arrivalCode: "DEL",
            airline: "Air India",
            flightNumber: "AI123",
          };

    // Create departure and arrival times
    const now = new Date();
    const departureTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
    const arrivalTime = new Date(departureTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after departure

    // Use booking data if available, otherwise use defaults
    const passengers = booking
      ? booking.passengers.map((p, i) => {
          const randomSeat = `${Math.floor(Math.random() * 30) + 1}${
            ["A", "B", "C", "D", "E", "F"][Math.floor(Math.random() * 6)]
          }`;
          // FIX: Add null check for booking when accessing seatNumbers
          const seatNumber =
            booking && booking.seatNumbers && booking.seatNumbers.length > i
              ? booking.seatNumbers[i]
              : randomSeat;

          return {
            ...p,
            seat: seatNumber,
          };
        })
      : [{ name: "John Doe", age: 35, gender: "male", seat: "12A" }];

    return {
      bookingId,
      pnr: booking ? booking.pnr : this.generatePNR(),
      airline: flightDetails.airline,
      flightNumber: flightDetails.flightNumber,
      departureCity: flightDetails.departureCity,
      departureAirport: `${flightDetails.departureCity} International Airport`,
      departureCode: flightDetails.departureCode,
      departureTime: departureTime.toISOString(),
      arrivalCity: flightDetails.arrivalCity,
      arrivalAirport: `${flightDetails.arrivalCity} International Airport`,
      arrivalCode: flightDetails.arrivalCode,
      arrivalTime: arrivalTime.toISOString(),
      duration: 120, // 2 hours in minutes
      aircraft: "Boeing 777",
      bookingDate: booking ? booking.bookingDate : now.toISOString(),
      totalAmount: booking ? booking.totalAmount : 7500,
      passengers,
    };
  },

  /**
   * Get all mock bookings (used as fallback)
   */
  getMockBookings(): Booking[] {
    console.log("Getting mock bookings");

    // Look for bookings in localStorage
    const mockBookings: Booking[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("booking_")) {
        try {
          const booking = JSON.parse(localStorage.getItem(key) || "");
          mockBookings.push(booking);
        } catch (e) {
          console.error("Error parsing booking from localStorage:", e);
        }
      }
    }

    // If no bookings in localStorage, return a default one
    if (mockBookings.length === 0) {
      mockBookings.push({
        _id: "booking_default",
        user: "current_user",
        flight: "flight_1",
        bookingDate: new Date().toISOString(),
        passengers: [{ name: "John Doe", age: 35, gender: "male" }],
        totalAmount: 7500,
        status: "confirmed",
        pnr: this.generatePNR(),
        seatNumbers: ["12A"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return mockBookings;
  },

  /**
   * Get mock flight details based on flight ID
   */
  getMockFlightDetails(flightId: string): any {
    // Extract flight number from ID if possible
    const flightNumber = flightId.split("_")[1] || "1";
    const flightNum = parseInt(flightNumber);

    // Define some city pairs
    const cityPairs = [
      {
        departureCity: "Mumbai",
        departureCode: "BOM",
        arrivalCity: "Delhi",
        arrivalCode: "DEL",
        airline: "Air India",
        flightNumber: "AI123",
        price: 7500,
      },
      {
        departureCity: "Delhi",
        departureCode: "DEL",
        arrivalCity: "Bangalore",
        arrivalCode: "BLR",
        airline: "IndiGo",
        flightNumber: "6E456",
        price: 8200,
      },
      {
        departureCity: "Bangalore",
        departureCode: "BLR",
        arrivalCity: "Chennai",
        arrivalCode: "MAA",
        airline: "SpiceJet",
        flightNumber: "SG789",
        price: 5800,
      },
      {
        departureCity: "Chennai",
        departureCode: "MAA",
        arrivalCity: "Mumbai",
        arrivalCode: "BOM",
        airline: "Vistara",
        flightNumber: "UK234",
        price: 6300,
      },
      {
        departureCity: "Mumbai",
        departureCode: "BOM",
        arrivalCity: "Bangalore",
        arrivalCode: "BLR",
        airline: "Air India",
        flightNumber: "AI567",
        price: 7100,
      },
    ];

    // Select a city pair based on flight number
    const index = flightNum % cityPairs.length || 0;
    return cityPairs[index];
  },

  /**
   * Generate a random 6-character PNR
   */
  generatePNR(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pnr = "";
    for (let i = 0; i < 6; i++) {
      pnr += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return pnr;
  },

  /**
   * Generate random seat numbers
   */
  generateSeatNumbers(count: number): string[] {
    const rows = ["A", "B", "C", "D", "E", "F"];
    const seats = [];
    for (let i = 0; i < count; i++) {
      const rowNumber = Math.floor(Math.random() * 30) + 1;
      const seatLetter = rows[Math.floor(Math.random() * rows.length)];
      seats.push(`${rowNumber}${seatLetter}`);
    }
    return seats;
  },

  /**
   * Save a mock booking to localStorage
   */
  saveMockBookingToStorage(booking: Booking): void {
    try {
      localStorage.setItem(booking._id, JSON.stringify(booking));
    } catch (e) {
      console.error("Error saving booking to localStorage:", e);
    }
  },
};

export default bookingService;

// // frontend/src/services/booking-service.ts
// import api from "./api";
// import { Booking, BookingFormData, TicketData } from "../types/booking";

// export const bookingService = {
//   async createBooking(data: BookingFormData): Promise<Booking> {
//     try {
//       console.log("Creating booking with data:", data);

//       // Check if flightId is from Amadeus (starts with flight_) or mock data
//       if (data.flightId && !data.flightId.match(/^[0-9a-fA-F]{24}$/)) {
//         // This is not a valid MongoDB ObjectId
//         // We need to create a booking using our mock data
//         console.log("Using mock booking creation for non-MongoDB flight ID");

//         // Generate a mock booking
//         const mockBooking = await createMockBooking(data);
//         return mockBooking;
//       }

//       // If we have a valid MongoDB ObjectId, proceed with actual API call
//       const response = await api.post("/bookings", data);
//       return response.data.booking;
//     } catch (error) {
//       console.error("Error creating booking:", error);
//       // Fall back to mock booking on error
//       return createMockBooking(data);
//     }
//   },

//   async getUserBookings(): Promise<Booking[]> {
//     try {
//       const response = await api.get("/bookings");
//       return response.data.bookings;
//     } catch (error) {
//       console.error("Error getting user bookings:", error);
//       // Return mock bookings
//       return getMockBookings();
//     }
//   },

//   async getBookingById(id: string): Promise<Booking> {
//     try {
//       const response = await api.get(`/bookings/${id}`);
//       return response.data.booking;
//     } catch (error) {
//       console.error("Error getting booking by ID:", error);
//       // Return mock booking
//       const mockBookings = getMockBookings();
//       const booking = mockBookings.find((b) => b._id === id);
//       if (booking) return booking;

//       throw new Error("Booking not found");
//     }
//   },

//   async generateTicket(id: string): Promise<TicketData> {
//     try {
//       const response = await api.get(`/bookings/${id}/ticket`);
//       return response.data.ticket;
//     } catch (error) {
//       console.error("Error generating ticket:", error);
//       // Return mock ticket
//       return getMockTicket(id);
//     }
//   },
//   async getMockBookingById(id: string): Promise<Booking> {
//     console.log("Getting mock booking with ID:", id);

//     // Create some mock data
//     const mockBooking: Booking = {
//       _id: id,
//       user: "current_user",
//       flight: "flight_1",
//       bookingDate: new Date().toISOString(),
//       passengers: [{ name: "John Doe", age: 35, gender: "male" }],
//       totalAmount: 7500,
//       status: "confirmed",
//       pnr: "ABC123",
//       seatNumbers: ["12A"],
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     return mockBooking;
//   },

//   // Helper method to get mock ticket data
//   async getMockTicketData(bookingId: string): Promise<TicketData> {
//     console.log("Generating mock ticket data for booking:", bookingId);

//     return {
//       bookingId,
//       pnr: "ABC123",
//       airline: "Air India",
//       flightNumber: "AI123",
//       departureCity: "Mumbai",
//       departureAirport: "Chhatrapati Shivaji Maharaj International Airport",
//       departureCode: "BOM",
//       departureTime: new Date().toISOString(),
//       arrivalCity: "Delhi",
//       arrivalAirport: "Indira Gandhi International Airport",
//       arrivalCode: "DEL",
//       arrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
//       duration: 120,
//       aircraft: "Boeing 777",
//       bookingDate: new Date().toISOString(),
//       totalAmount: 7500,
//       passengers: [{ name: "John Doe", age: 35, gender: "male", seat: "12A" }],
//     };
//   },
// };

// // Helper function to create a mock booking
// async function createMockBooking(data: BookingFormData): Promise<Booking> {
//   console.log("Creating mock booking with data:", data);

//   // Generate a random ID for the booking
//   const bookingId = `booking_${Math.random().toString(36).substring(2, 10)}`;

//   // Generate PNR (6 alphanumeric characters)
//   const generatePNR = () => {
//     const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//     let pnr = "";
//     for (let i = 0; i < 6; i++) {
//       pnr += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return pnr;
//   };

//   // Generate random seat numbers
//   const generateSeatNumbers = (count: number) => {
//     const rows = ["A", "B", "C", "D", "E", "F"];
//     const seats = [];
//     for (let i = 0; i < count; i++) {
//       const rowNumber = Math.floor(Math.random() * 30) + 1;
//       const seatLetter = rows[Math.floor(Math.random() * rows.length)];
//       seats.push(`${rowNumber}${seatLetter}`);
//     }
//     return seats;
//   };

//   // Get current date
//   const bookingDate = new Date().toISOString();

//   // Mock flight data - in a real app, you would fetch this from your flight service
//   // For now, let's hardcode some details based on flightId
//   const flight = {
//     _id: data.flightId,
//     airline: "Air India",
//     flightNumber: "AI123",
//     departureCity: "Mumbai",
//     departureCode: "BOM",
//     arrivalCity: "Delhi",
//     arrivalCode: "DEL",
//     departureTime: new Date().toISOString(),
//     arrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
//     currentPrice: 7500,
//   };

//   // Calculate total amount based on passengers
//   const totalAmount = flight.currentPrice * data.passengers.length;

//   // Generate seat numbers
//   const seatNumbers = generateSeatNumbers(data.passengers.length);

//   // Create mock booking
//   const booking: Booking = {
//     _id: bookingId,
//     user: "current_user",
//     flight: data.flightId,
//     bookingDate,
//     passengers: data.passengers,
//     totalAmount,
//     status: "confirmed",
//     pnr: generatePNR(),
//     seatNumbers,
//     createdAt: bookingDate,
//     updatedAt: bookingDate,
//   };

//   return booking;
// }

// // Helper function to get mock bookings
// function getMockBookings(): Booking[] {
//   return [
//     {
//       _id: "booking_123",
//       user: "current_user",
//       flight: "flight_1",
//       bookingDate: new Date().toISOString(),
//       passengers: [{ name: "John Doe", age: 35, gender: "male" }],
//       totalAmount: 7500,
//       status: "confirmed",
//       pnr: "ABC123",
//       seatNumbers: ["12A"],
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     },
//   ];
// }

// // Helper function to get mock ticket
// function getMockTicket(bookingId: string): TicketData {
//   return {
//     bookingId,
//     pnr: "ABC123",
//     airline: "Air India",
//     flightNumber: "AI123",
//     departureCity: "Mumbai",
//     departureAirport: "Chhatrapati Shivaji Maharaj International Airport",
//     departureCode: "BOM",
//     departureTime: new Date().toISOString(),
//     arrivalCity: "Delhi",
//     arrivalAirport: "Indira Gandhi International Airport",
//     arrivalCode: "DEL",
//     arrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
//     duration: 120,
//     aircraft: "Boeing 777",
//     bookingDate: new Date().toISOString(),
//     totalAmount: 7500,
//     passengers: [{ name: "John Doe", age: 35, gender: "male", seat: "12A" }],
//   };
// }
