# SkyBooker - Flight Booking Application

SkyBooker is a full-stack web application for booking flights. It features a responsive interface with real-time dynamic pricing, flight search functionality with filters, booking management, and an integrated e-wallet system.

## Live Demo

[View Live Demo](https://flight-booking-ruby.vercel.app/)

## Features

- User authentication (register, login, profile management)
- Real-time flight search with filters (price, airline, departure time)
- Airport and city autocomplete search using Amadeus API
- Dynamic pricing (price increases by 10% after 3 searches within 5 minutes, resets after 10 minutes)
- Booking system with passenger management
- Wallet system with a default balance of ₹50,000
- PDF ticket generation
- Responsive design with light/dark mode
- Booking history and management

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT
- **State Management**: React Context
- **Form Handling**: React Hook Form, Zod
- **PDF Generation**: PDF-lib
- **APIs**: Amadeus for airport search and flight offers
- **Deployment**: Frontend on Vercel, Backend on Render

## API Integration

SkyBooker integrates with two main APIs:

1. **Amadeus Travel API**: Used for:

   - Airport and city search autocomplete
   - Flight search with real-time availability

2. **Custom Backend API**: Used for:
   - User authentication
   - Booking management
   - Wallet operations

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local or cloud instance)
- Amadeus API credentials

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Hmtgit7/flight-booking.git
cd flight-booking
```

2. Set up the backend:

```bash
cd backend
npm install
cp .env.example .env  # Then edit .env with your configuration
npm run dev
```

3. Set up the frontend:

```bash
cd ../frontend
npm install
cp .env.example .env  # Then edit .env with your configuration
npm start
```

### Environment Variables

#### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000/api  # URL of the backend API
REACT_APP_AMADEUS_API_KEY=your_amadeus_api_key
REACT_APP_AMADEUS_API_SECRET=your_amadeus_api_secret
```

#### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flight-booking
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## Dynamic Pricing Algorithm

The application implements a dynamic pricing algorithm that:

1. Tracks searches for specific flight routes
2. Increases prices by 10% if the same route is searched 3+ times within 5 minutes
3. Resets prices to baseline after 10 minutes of inactivity
4. Displays visual indicators when prices have increased

## Mock Data & Failsafe Mechanisms

SkyBooker includes comprehensive fallback mechanisms:

- When Amadeus API is unavailable, the app falls back to mock airport and flight data
- All frontend features work offline with localStorage for persistent booking data
- Visual indicators are shown when using mock data vs. real API data

## Deployment

The application is deployed using:

- Frontend: Vercel
- Backend: Render (using Docker)
- Database: MongoDB Atlas

## Project Structure

```
flight-booking/
├── backend/               # Node.js & Express backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── app.ts         # Express app setup
│   │   └── server.ts      # Server entry point
│   └── ...
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   └── ...
│   └── ...
└── ...
```

## Key Features in Detail

### Airport Search

- Real-time search with Amadeus API integration
- City and airport code matching
- Caching for performance optimization

### Flight Search

- Comprehensive filters (price, airline, time)
- Dynamic pricing display
- Seat availability indicators

### Booking Process

- Multi-passenger booking support
- Wallet integration for payment
- PDF ticket generation

### User Account

- Secure authentication
- Booking history with detailed view
- Wallet transaction history

## License

This project is licensed under the MIT License.

## Acknowledgements

- Amadeus for Travel API
- Inspiration from MakeMyTrip for UI reference
