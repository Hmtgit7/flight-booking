// src/components/bookings/BookingHistory.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/booking-service';
import { flightService } from '../../services/flight-service';
import { Booking } from '../../types/booking';
import { Flight } from '../../types/flight';
import { formatDate, formatTime } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import Button from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import Loader from '../ui/Loader';

const BookingHistory: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [flightDetails, setFlightDetails] = useState<Record<string, Flight | any>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Initialize test data if in development environment
                if (process.env.NODE_ENV === 'development' && (window as any).skyBookerUtils) {
                    console.log("Initializing test data from BookingHistory component");
                    (window as any).skyBookerUtils.initializeTestData();
                }

                // Fetch bookings
                const bookingData = await bookingService.getUserBookings();
                console.log("Fetched bookings:", bookingData);
                setBookings(bookingData);

                if (bookingData.length === 0) {
                    console.log("No bookings found, checking mock storage directly");
                    // Try accessing mock bookings directly (development fallback)
                    const mockBookings = bookingService.getAllStoredMockBookings();
                    if (mockBookings.length > 0) {
                        console.log("Found bookings in mock storage:", mockBookings);
                        setBookings(mockBookings);
                    }
                }

                // Fetch flight details for each booking
                await populateFlightDetails(bookingData.length > 0 ? bookingData : bookingService.getAllStoredMockBookings());
            } catch (error) {
                console.error('Error fetching bookings:', error);
                setError('Failed to load bookings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Helper function to get flight details for each booking
    const populateFlightDetails = async (bookingList: Booking[]) => {
        const detailsMap: Record<string, any> = {};

        for (const booking of bookingList) {
            // Handle cases where flight is already populated or just an ID
            const flightId = typeof booking.flight === 'string' ? booking.flight : (booking.flight as any)._id;

            if (!flightId) {
                console.error("Missing flight ID for booking:", booking);
                continue;
            }

            try {
                // Skip if we already have details for this flight
                if (detailsMap[flightId]) continue;

                // Try to get the real flight details
                if (flightId.match(/^[0-9a-fA-F]{24}$/)) {
                    // Looks like a MongoDB ObjectId, try the API
                    try {
                        const flightDetail = await flightService.getFlightById(flightId);
                        detailsMap[flightId] = flightDetail;
                        continue;
                    } catch (err) {
                        console.log(`Could not fetch real flight data for ${flightId}, using mock`);
                    }
                }

                // If that fails or it's a mock ID, use mock flight details
                const mockFlightDetails = bookingService.getMockFlightDetails(flightId);

                // Create a minimal flight object from the mock details
                detailsMap[flightId] = {
                    _id: flightId,
                    flightNumber: mockFlightDetails.flightNumber || 'UNKNOWN',
                    airline: mockFlightDetails.airline || 'Unknown Airline',
                    departureCity: mockFlightDetails.departureCity || 'Unknown Origin',
                    departureCode: mockFlightDetails.departureCode || '???',
                    departureAirport: `${mockFlightDetails.departureCity || 'Unknown'} Airport`,
                    arrivalCity: mockFlightDetails.arrivalCity || 'Unknown Destination',
                    arrivalCode: mockFlightDetails.arrivalCode || '???',
                    arrivalAirport: `${mockFlightDetails.arrivalCity || 'Unknown'} Airport`,
                    // Use dates from the near future for mock display
                    departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    arrivalTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                    duration: 120,
                    basePrice: mockFlightDetails.price || 2500,
                    currentPrice: mockFlightDetails.price || 2500,
                    seatsAvailable: 50,
                    aircraft: 'Airbus A320',
                };
            } catch (err) {
                console.error(`Error processing flight details for ${flightId}:`, err);
                // Create a fallback flight detail
                detailsMap[flightId] = {
                    _id: flightId,
                    flightNumber: 'UNKNOWN',
                    airline: 'Unknown Airline',
                    departureCity: 'Unknown Origin',
                    departureCode: '???',
                    departureAirport: 'Unknown Airport',
                    arrivalCity: 'Unknown Destination',
                    arrivalCode: '???',
                    arrivalAirport: 'Unknown Airport',
                    departureTime: new Date().toISOString(),
                    arrivalTime: new Date().toISOString(),
                    duration: 0,
                    basePrice: 0,
                    currentPrice: 0,
                    seatsAvailable: 0,
                    aircraft: 'Unknown',
                };
            }
        }

        setFlightDetails(detailsMap);
    };

    const handleRefresh = async () => {
        setLoading(true);

        try {
            // Create default bookings if none exist
            if (process.env.NODE_ENV === 'development' && (window as any).skyBookerUtils) {
                console.log("Creating default test bookings");
                (window as any).skyBookerUtils.initializeTestData();
            }

            // Fetch bookings again
            const bookingData = await bookingService.getUserBookings();
            console.log("Refreshed bookings:", bookingData);

            // If API call returned bookings, use them
            if (bookingData && bookingData.length > 0) {
                setBookings(bookingData);
                await populateFlightDetails(bookingData);
            } else {
                // Otherwise check for mock bookings directly
                const mockBookings = bookingService.getAllStoredMockBookings();
                if (mockBookings.length > 0) {
                    console.log("Found bookings in mock storage:", mockBookings);
                    setBookings(mockBookings);
                    await populateFlightDetails(mockBookings);
                }
            }

            setError(null);
        } catch (error) {
            console.error('Error refreshing bookings:', error);
            setError('Failed to refresh bookings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center">
                <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {error}
                    </p>
                </div>
                <Button onClick={handleRefresh}>Try Again</Button>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    No bookings yet
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    You haven't made any bookings yet. Start by searching for flights.
                </p>
                <div className="mt-4 flex justify-center space-x-4">
                    <Link to="/search">
                        <Button>Search Flights</Button>
                    </Link>
                    {process.env.NODE_ENV === 'development' && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                if ((window as any).skyBookerUtils) {
                                    (window as any).skyBookerUtils.createTestBooking();
                                    handleRefresh();
                                } else {
                                    console.error("Development utilities not available");
                                    alert("Development utilities not available");
                                }
                            }}
                        >
                            Create Test Booking
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Sort bookings by date (most recent first)
    const sortedBookings = [...bookings].sort((a, b) => {
        return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
    });

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    My Bookings
                </h1>
                <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            <div className="space-y-6">
                {sortedBookings.map((booking) => {
                    // Get flight details either from the populated flight or from our fetched details
                    const flightId = typeof booking.flight === 'string' ? booking.flight : (booking.flight as any)._id;
                    const flight = flightDetails[flightId];

                    if (!flight) {
                        return (
                            <Card key={booking._id} className="border-amber-200 dark:border-amber-800">
                                <CardContent className="p-4">
                                    <p className="text-amber-700 dark:text-amber-300">
                                        Booking details loading... PNR: {booking.pnr}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    }

                    return (
                        <Card key={booking._id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        {flight.departureCity} to {flight.arrivalCity}
                                    </CardTitle>
                                    <div
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${booking.status === 'confirmed'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : booking.status === 'cancelled'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}
                                    >
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Booking Reference
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {booking.pnr}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Flight
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {flight.airline} {flight.flightNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Date
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatDate(flight.departureTime)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Departure
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatTime(flight.departureTime)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {flight.departureCity} ({flight.departureCode})
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Arrival
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatTime(flight.arrivalTime)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {flight.arrivalCity} ({flight.arrivalCode})
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Total Amount
                                        </p>
                                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(booking.totalAmount)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {booking.passengers.length} passenger
                                            {booking.passengers.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <Link to={`/booking/${booking._id}`}>
                                        <Button variant="outline">View Details</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default BookingHistory;