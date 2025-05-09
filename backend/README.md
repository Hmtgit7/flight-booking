# SkyBooker Backend API

This is the backend API for the SkyBooker flight booking application, built with Node.js, Express, TypeScript, and MongoDB.

## Live API

The API is hosted on Render at: [Backend API URL]

## Features

- RESTful API architecture
- JWT authentication
- MongoDB database integration
- Flight search and management
- Dynamic pricing algorithm
- Booking management
- Wallet system
- PDF ticket generation

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

2. Create a `.env` file:

```bash
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

### Building for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile

### Flights

- `GET /api/flights/search` - Search flights
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
backend/
├── src/
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
├── package.json
├── tsconfig.json
└── Dockerfile             # Docker configuration
```

## Technologies

- Node.js with TypeScript
- Express.js for API routing
- MongoDB with Mongoose for database
- JWT for authentication
- PDF generation utilities

## Seeded Data

The backend automatically seeds flight data on startup if none exists. This includes:

- Random flights between major Indian cities
- Various airlines (IndiGo, SpiceJet, Air India, Vistara, Go First)
- Flights scheduled over the next 7 days
- Price range between ₹2,000 - ₹3,000

## Docker

To build and run the backend using Docker:

```bash
# Build the Docker image
docker build -t skybooker-backend .

# Run the container
docker run -p 5000:5000 -e MONGODB_URI=your_mongodb_uri -e JWT_SECRET=your_jwt_secret skybooker-backend
```

## Deployment

The backend is deployed on Render using a Docker container. The deployment process is:

1. Build Docker image from the Dockerfile
2. Push the image to Render
3. Configure environment variables on Render
4. Connect to MongoDB Atlas for production database

## Environment Variables on Render

Make sure to set these environment variables in your Render service:

- `PORT`
- `MONGODB_URI` (pointing to MongoDB Atlas or your production database)
- `JWT_SECRET`
- `NODE_ENV=production`
