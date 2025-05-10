# SkyBooker Backend API

This is the backend API for the SkyBooker flight booking application, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- RESTful API architecture
- JWT authentication
- MongoDB database integration
- Dynamic pricing algorithm
- Flight search and management
- Booking management
- Wallet system
- PDF ticket generation

## Technology Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Static typing for JavaScript
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Token for authentication
- **Bcrypt**: Password hashing
- **dotenv**: Environment variable management
- **CORS**: Cross-Origin Resource Sharing

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile

### Flights

- `GET /api/flights/search` - Search flights with filters
- `GET /api/flights/:id` - Get flight by ID

### Bookings

- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get all bookings for current user
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/:id/ticket` - Generate ticket for booking

### Wallet

- `GET /api/wallet` - Get user wallet
- `GET /api/wallet/transactions` - Get wallet transactions

## Project Structure

```
src/
├── config/            # Configuration files
│   ├── db.ts          # Database connection
│   ├── env.ts         # Environment variables
├── controllers/       # Request handlers
│   ├── booking-controller.ts
│   ├── flight-controller.ts
│   ├── user-controller.ts
│   ├── wallet-controller.ts
├── middleware/        # Express middleware
│   ├── auth-middleware.ts
│   ├── error-middleware.ts
├── models/            # MongoDB models
│   ├── booking-model.ts
│   ├── flight-model.ts
│   ├── price-history-model.ts
│   ├── user-model.ts
│   ├── wallet-model.ts
├── routes/            # API routes
│   ├── booking-routes.ts
│   ├── flight-routes.ts
│   ├── user-routes.ts
│   ├── wallet-routes.ts
├── services/          # Business logic
│   ├── booking-service.ts
│   ├── flight-service.ts
│   ├── pdf-service.ts
│   ├── pricing-service.ts
│   ├── user-service.ts
│   ├── wallet-service.ts
├── app.ts             # Express app setup
└── server.ts          # Server entry point
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flight-booking
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

3. Start the development server:

```bash
npm run dev
```

The API will be available at http://localhost:5000.

## Key Features Implementation

### Dynamic Pricing

The backend implements a dynamic pricing algorithm in the `pricing-service.ts` file:

1. Each flight has a base price between ₹2,000-₹3,000
2. The `PriceHistory` model tracks search behavior for each user and flight
3. If a user searches for the same flight 3+ times within 5 minutes, the price increases by 10%
4. After 10 minutes of inactivity, the price resets to the base price

### Authentication

The authentication system uses JWT tokens:

1. When a user registers or logs in, a JWT token is generated
2. The token contains the user ID and is signed with the JWT secret
3. Protected routes use the `auth-middleware.ts` to verify the token
4. The middleware extracts the user ID and adds it to the request object

### Wallet System

Each user has a digital wallet:

1. When a user registers, a wallet is created with a default balance of ₹50,000
2. When a booking is made, the amount is deducted from the wallet
3. All transactions are recorded in the wallet's transaction history
4. The wallet balance is verified before confirming a booking

### Booking Process

The booking process involves several steps:

1. User selects a flight and enters passenger details
2. The system verifies the flight availability and wallet balance
3. If successful, a booking is created with a unique PNR
4. The flight's available seats are updated
5. The amount is deducted from the user's wallet
6. A transaction record is added to the wallet

### PDF Ticket Generation

The backend generates ticket data that includes:

1. Flight details (airline, flight number, departure/arrival times)
2. Passenger information
3. Booking reference (PNR)
4. Total amount paid
5. Seat assignments

## Data Models

### User Model

```typescript
interface IUser {
  name: string;
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
```

### Wallet Model

```typescript
interface IWallet {
  user: mongoose.Types.ObjectId;
  balance: number;
  transactions: {
    type: "credit" | "debit";
    amount: number;
    description: string;
    date: Date;
  }[];
}
```

### Flight Model

```typescript
interface IFlight {
  flightNumber: string;
  airline: string;
  departureCity: string;
  departureAirport: string;
  departureCode: string;
  arrivalCity: string;
  arrivalAirport: string;
  arrivalCode: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number;
  basePrice: number;
  currentPrice: number;
  searchCount: number;
  lastSearched: Date;
  seatsAvailable: number;
  aircraft: string;
}
```

### Booking Model

```typescript
interface IBooking {
  user: mongoose.Types.ObjectId;
  flight: mongoose.Types.ObjectId;
  bookingDate: Date;
  passengers: {
    name: string;
    age: number;
    gender: string;
  }[];
  totalAmount: number;
  status: "confirmed" | "cancelled" | "pending";
  pnr: string;
  seatNumbers: string[];
}
```

### Price History Model

```typescript
interface IPriceHistory {
  flight: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  searchCount: number;
  lastSearchTime: Date;
  originalPrice: number;
  increasedPrice: number;
}
```

## Database Seeding

The backend automatically seeds flight data on startup if none exists. This includes:

- Random flights between major Indian cities
- Various airlines (IndiGo, SpiceJet, Air India, Vistara, Go First)
- Flights scheduled over the next 7 days
- Price range between ₹2,000 - ₹3,000
- Random seat availability

## Testing the Dynamic Pricing Algorithm

To test the dynamic pricing algorithm:

1. Search for flights between two specific cities (e.g., Delhi to Mumbai)
2. Note the initial prices
3. Perform the same search 2 more times within 5 minutes
4. On the 3rd search, observe the prices increase by 10%
5. Wait 10+ minutes and search again to see the prices reset

The algorithm works on a per-user basis, so each user has their own search history and dynamic pricing.

## Error Handling

The backend includes comprehensive error handling:

1. Centralized error middleware for consistent error responses
2. Validation for all incoming requests
3. Proper HTTP status codes for different error scenarios
4. Descriptive error messages for debugging

## Authentication Middleware

Protected routes use the authentication middleware:

```typescript
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ success: false, message: "No token provided, access denied" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: string };

    // Add user ID to request
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid token, access denied" });
  }
};
```

## API Response Format

All API responses follow a consistent format:

```typescript
{
  success: boolean;
  message?: string;
  [key: string]: any;
}
```

For example, a successful response might look like:

```json
{
  "success": true,
  "flight": {
    "_id": "60f7b5b3e6b31b2b4c9b3b3b",
    "flightNumber": "AI123",
    "airline": "Air India",
    "departureCity": "Delhi",
    "arrivalCity": "Mumbai",
    "departureTime": "2023-07-20T10:00:00.000Z",
    "arrivalTime": "2023-07-20T12:00:00.000Z",
    "basePrice": 2500,
    "currentPrice": 2500
  }
}
```

And an error response might look like:

```json
{
  "success": false,
  "message": "Flight not found"
}
```

## Building for Production

```bash
npm run build
```

This will create a `dist` folder with compiled JavaScript files.

## Deployment

The backend is deployed on Render using Docker. The deployment process is:

1. Build Docker image from the Dockerfile
2. Push the image to Render
3. Configure environment variables on Render
4. Connect to MongoDB Atlas for production database

### Environment Variables on Render

Make sure to set these environment variables in your Render service:

- `PORT`
- `MONGODB_URI` (pointing to MongoDB Atlas or your production database)
- `JWT_SECRET`
- `NODE_ENV=production`

## Docker

To build and run the backend using Docker:

```bash
# Build the Docker image
docker build -t skybooker-backend .

# Run the container
docker run -p 5000:5000 -e MONGODB_URI=your_mongodb_uri -e JWT_SECRET=your_jwt_secret skybooker-backend
```

## Testing

You can test the API endpoints using tools like Postman or curl:

```bash
# Get all flights
curl -X GET http://localhost:5000/api/flights/search

# Get flight by ID
curl -X GET http://localhost:5000/api/flights/60f7b5b3e6b31b2b4c9b3b3b

# Register user
curl -X POST http://localhost:5000/api/users/register -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login user
curl -X POST http://localhost:5000/api/users/login -H "Content-Type: application/json" -d '{"email":"john@example.com","password":"password123"}'
```

## License

This project is licensed under the MIT License.
