# SkyBooker Frontend

This is the frontend application for SkyBooker, a flight booking platform built with React, TypeScript, and Tailwind CSS.

## Features

- Responsive design with mobile-first approach
- Light and dark mode support
- Real-time flight search with filters
- Airport and city autocomplete search
- Interactive booking process
- PDF ticket generation
- Booking history and management
- Wallet integration
- Dynamic pricing simulation

## Technology Stack

- **React**: Library for building user interfaces
- **TypeScript**: Static typing for JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: For navigation and routing
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation library
- **Axios**: For API requests
- **Framer Motion**: For animations and transitions
- **PDF-lib**: For PDF generation
- **date-fns**: Date manipulation library

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── bookings/         # Booking-related components
│   ├── flights/          # Flight-related components
│   ├── layout/           # Layout components
│   └── ui/               # UI components (buttons, cards, etc.)
├── context/              # React context providers
├── pages/                # Page components
├── services/             # API service functions
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
│   ├── date.ts           # Date formatting utilities
│   ├── format.ts         # Data formatting utilities
│   ├── storage.ts        # Local storage utilities
│   ├── validation.ts     # Form validation schemas
│   └── dev-utils.ts      # Development utilities
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
└── routes.tsx            # Route definitions
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AMADEUS_API_KEY=your_amadeus_api_key
REACT_APP_AMADEUS_API_SECRET=your_amadeus_api_secret
```

3. Start the development server:

```bash
npm start
```

The app will be available at http://localhost:3000.

## Key Components

### Flight Search

- `FlightSearchForm`: Form for searching flights with airport autocomplete
- `AirportSearch`: Autocomplete component for airport/city search
- `FlightList`: Display search results with filtering and sorting
- `FlightCard`: Card component to display flight information
- `FlightFilters`: Filter component for search results

### Booking Process

- `BookingForm`: Form for passenger details and booking confirmation
- `BookingConfirmation`: Displays booking confirmation details
- `TicketGenerator`: Generates and displays ticket information
- `BookingHistory`: Displays all user bookings

### Authentication

- `LoginForm`: User login form
- `RegisterForm`: User registration form
- `AuthContext`: Context provider for authentication state

## Development Utilities

The frontend includes development utilities to help with testing and debugging:

```javascript
// Create a test booking
window.skyBookerUtils.createTestBooking();

// Create multiple test bookings
window.skyBookerUtils.createTestBookings(3);

// View all data in localStorage
window.skyBookerUtils.printAllStorage();

// Reset all bookings
window.skyBookerUtils.resetAllBookings();

// Reset search counts (for dynamic pricing testing)
window.skyBookerUtils.resetSearchCounts();

// Generate a report of all bookings
window.skyBookerUtils.generateBookingsReport();
```

## Dynamic Pricing Algorithm

The frontend implements a dynamic pricing algorithm:

1. Each time a user searches for a specific flight route, the search is tracked in localStorage
2. If the same route is searched 3+ times within 5 minutes, the price increases by 10%
3. A visual indicator is shown when the price has increased
4. After 10 minutes of inactivity, the price resets to the original amount

To test this feature:

- Search for a specific route (e.g., Mumbai to Delhi) 3 times within 5 minutes
- Observe the price increase and visual indicator
- Wait 10+ minutes and search again to see the price reset

## Local Storage

The frontend uses localStorage for:

- Storing JWT token
- Tracking search history for dynamic pricing
- Storing mock bookings when working offline
- Saving theme preference (light/dark mode)

## Mock Data and Failsafes

The frontend includes comprehensive fallback mechanisms:

- If the Amadeus API is unavailable, the app falls back to mock airport and flight data
- All frontend features work offline using localStorage for persistent data
- Visual indicators show when using mock vs. real API data

## Building for Production

```bash
npm run build
```

This will create a `build` folder with optimized production files.

## Deployment

The frontend is deployed on Vercel. The deployment is automatically triggered by pushing to the main branch of the GitHub repository.

To deploy manually:

```bash
npm run build
vercel --prod
```

## Testing

```bash
npm test
```

This will run the test suite using Jest and React Testing Library.
