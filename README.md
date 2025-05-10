# SkyBooker - Flight Booking Application

![SkyBooker Logo](./frontend/public/airplane.svg)

SkyBooker is a full-stack flight booking application that provides users with a seamless experience to search, book, and manage flights. The application features dynamic pricing, real-time flight search, interactive booking process, and PDF ticket generation.

## Live Demo

[View Live Demo](https://flight-booking-ruby.vercel.app/)

## Project Overview

SkyBooker offers a comprehensive flight booking experience with:

- **User authentication** (register, login, profile management)
- **Real-time flight search** with filters (price, airline, departure time)
- **Airport and city search** using Amadeus API for autocompletion
- **Dynamic pricing algorithm** (10% price increase after 3 searches within 5 minutes)
- **Booking system** with support for multiple passengers
- **Wallet integration** with default balance of ₹50,000
- **PDF ticket generation** for confirmed bookings
- **Responsive design** with light/dark mode support
- **Booking history** with detailed trip information

## Tech Stack

### Frontend

- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Hook Form with Zod for form validation
- PDF-lib for PDF generation
- React Router for navigation
- Axios for API requests

### Backend

- Node.js with Express
- TypeScript for type safety
- MongoDB with Mongoose for database
- JWT for authentication
- Bcrypt for password hashing
- CORS for cross-origin support

### External APIs

- Amadeus Travel API for airport search and flight data

## Project Structure

```
flight-booking/
├── frontend/                # React frontend application
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── ...
│   └── ...
├── backend/                 # Node.js/Express backend
│   ├── src/                 # Source code
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── ...
│   └── ...
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local or cloud instance)
- Amadeus API credentials (optional)

### Installation and Setup

1. Clone the repository:

```bash
git clone https://github.com/Hmtgit7/flight-booking.git
cd flight-booking
```

2. Set up the backend:

```bash
cd backend
npm install
cp .env.example .env  # Edit with your MongoDB URI and JWT secret
npm run dev
```

3. Set up the frontend:

```bash
cd ../frontend
npm install
cp .env.example .env  # Edit with your API URLs
npm start
```

## Key Features

### Dynamic Pricing

SkyBooker implements a dynamic pricing algorithm that:

1. Tracks the number of times a specific flight route is searched
2. Increases the price by 10% if searched 3+ times within 5 minutes
3. Resets to the original price after 10 minutes of inactivity
4. Shows visual indicators when prices increase

To test this feature:

- Search for the same flight route (e.g., Mumbai to Delhi) multiple times
- After the third search within 5 minutes, you'll see the price increase by 10%
- Wait 10+ minutes, and the price will reset to the original amount

### Airport Search

The application integrates with the Amadeus API to provide real-time airport and city search:

- Start typing a city or airport name to see matching results
- Each result shows the city, airport name, and IATA code
- Select an option to automatically fill the form

### PDF Ticket Generation

After booking a flight, users can generate and download a PDF ticket that includes:

1. Flight details (airline, flight number, departure/arrival times)
2. Passenger information
3. Booking reference number (PNR)
4. Total amount paid
5. Seat assignments

### Wallet System

Each user has a digital wallet with:

- Default balance of ₹50,000
- Automatic deduction when booking flights
- Transaction history
- Insufficient funds validation

## Testing Guide

### Testing Dynamic Pricing

1. Open the flight search page
2. Search for a specific route (e.g., Mumbai to Delhi)
3. Note the initial price for any flight
4. Perform the same search 2 more times within 5 minutes
5. On the 3rd search, observe the flight price increases by 10%
6. A visual indicator will show that the price has increased
7. Wait 10+ minutes and search again to see the price reset

### Testing Mock Mode

The application includes a development mode with test utilities:

1. Open the browser console
2. Use the following commands:

   ```javascript
   // Create a test booking
   window.skyBookerUtils.createTestBooking();

   // View all localStorage data
   window.skyBookerUtils.printAllStorage();

   // Generate a booking report
   window.skyBookerUtils.generateBookingsReport();

   // Reset all bookings
   window.skyBookerUtils.resetAllBookings();
   ```

## Deployment

The application is deployed using:

- Frontend: Vercel
- Backend: Render (using Docker)
- Database: MongoDB Atlas

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Thanks to Amadeus for the Travel API
- Inspiration from MakeMyTrip for UI reference
