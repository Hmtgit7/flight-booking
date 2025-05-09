# SkyBooker - Flight Booking Application

SkyBooker is a full-stack web application for booking flights. It features a responsive interface with real-time dynamic pricing, flight search functionality with filters, booking management, and an integrated e-wallet system.

## Live Demo

[View Live Demo](https://flight-booking-ruby.vercel.app/)

## Features

- User authentication (register, login, profile management)
- Real-time flight search with filters (price, airline, departure time)
- Airport and city autocomplete search API integration
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
- **PDF Generation**: React-PDF/PDF-lib
- **Deployment**: Frontend on Vercel, Backend on Render

## Repository

[GitHub Repository](https://github.com/Hmtgit7/flight-booking)

## Project Structure

The project consists of two main parts:

- `flight-booking/` - Frontend application (React with TypeScript)
- `backend/` - Backend API (Node.js, Express, MongoDB)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local or cloud instance)

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
cd ../flight-booking
npm install
cp .env.example .env  # Then edit .env with your configuration
npm start
```

### Using Docker

You can run the application using Docker:

```bash
docker-compose up -d
```

This will start the frontend, backend, and MongoDB in separate containers.

## Environment Variables

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000/api  # URL of the backend API
REACT_APP_AIRPORT_API_URL=https://aviation-edge.com/v2/public/autocomplete  # Airport API URL
REACT_APP_AVIATION_API_KEY=your_aviation_edge_api_key  # Aviation Edge API key
```

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flight-booking
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## Deployment

The application is deployed using:

- Frontend: Vercel
- Backend: Render (using Docker)
- Database: MongoDB Atlas

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Airport and City Search API from [Aviation Edge](https://aviation-edge.com/)
- Inspiration from [MakeMyTrip](https://www.makemytrip.com/) for UI reference
