# SkyBooker Frontend

This is the frontend of the SkyBooker flight booking application, built with React, TypeScript, and Tailwind CSS.

## Live Demo

[View Live Demo](https://flight-booking-ruby.vercel.app/)

## Features

- Responsive, mobile-friendly design
- Light and dark mode
- Real-time flight search and filtering
- Airport and city autocomplete search using Aviation Edge API
- Interactive booking process
- Booking history and management
- PDF ticket generation
- Dynamic pricing simulation

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AIRPORT_API_URL=https://aviation-edge.com/v2/public/autocomplete
REACT_APP_AVIATION_API_KEY=your_aviation_edge_api_key
```

3. Start the development server:

```bash
npm start
```

The app will be available at http://localhost:3000.

### Building for Production

```bash
npm run build
```

This will create a `build` folder with optimized production files.

## Project Structure

```
flight-booking/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   ├── flights/     # Flight-related components
│   │   ├── bookings/    # Booking-related components
│   │   └── auth/        # Authentication components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API service functions
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── styles/          # CSS and Tailwind styles
│   ├── App.tsx          # Main App component
│   ├── index.tsx        # Entry point
│   └── routes.tsx       # Route definitions
├── package.json
├── tailwind.config.js
├── Dockerfile           # Docker configuration
└── tsconfig.json
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from create-react-app

## Technologies

- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- React Hook Form for form handling
- Zod for validation
- Axios for API requests
- PDF-lib for PDF generation

## API Integration

The frontend integrates with:

1. Backend API for:

   - User authentication
   - Flight search and data
   - Booking management
   - Wallet operations
   - PDF ticket generation

2. Aviation Edge API for:
   - Airport and city autocomplete search
   - Real-time flight data

## Local Storage

The application uses local storage for:

- JWT token persistence (via TOKEN_KEY)
- Theme preference (light/dark mode)
- Temporary user preferences during the session

## Docker

To build and run the frontend using Docker:

```bash
# Build the Docker image
docker build -t skybooker-frontend .

# Run the container
docker run -p 3000:80 skybooker-frontend
```

## Deployment

This project is deployed on Vercel. The deployment process is automatic via GitHub integration.

To deploy a new version:

1. Push changes to the main branch
2. Vercel will automatically build and deploy the updated application

## Environment Variables on Vercel

Make sure to set these environment variables in your Vercel project settings:

- `REACT_APP_API_URL`
- `REACT_APP_AIRPORT_API_URL`
- `REACT_APP_AVIATION_API_KEY`
