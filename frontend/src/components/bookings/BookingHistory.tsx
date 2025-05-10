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
    const [flightDetails, setFlightDetails] = useState<Record<string, Flight>>({});

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Fetch bookings
                const bookingData = await bookingService.getUserBookings();
                console.log("Fetched bookings:", bookingData);
                setBookings(bookingData);

                // Fetch flight details for each booking
                const flightDetailsMap: Record<string, Flight> = {};

                for (const booking of bookingData) {
                    // Handle cases where flight is already populated or just an ID
                    const flightId = typeof booking.flight === 'string' ? booking.flight : (booking.flight as Flight)._id;

                    try {
                        // Only fetch if we don't already have details
                        if (!flightDetailsMap[flightId]) {
                            const flightDetail = await flightService.getFlightById(flightId);
                            flightDetailsMap[flightId] = flightDetail;
                        }
                    } catch (err) {
                        console.error(`Error fetching flight details for ID ${flightId}:`, err);
                        // Create a minimal flight detail if we can't fetch it
                        flightDetailsMap[flightId] = bookingService.getMockFlightDetails(flightId);
                    }
                }

                setFlightDetails(flightDetailsMap);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader size="lg" />
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
                <Link to="/search" className="mt-4 inline-block">
                    <Button>Search Flights</Button>
                </Link>
            </div>
        );
    }

    // Sort bookings by date (most recent first)
    const sortedBookings = [...bookings].sort((a, b) => {
        return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
    });

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                My Bookings
            </h1>

            <div className="space-y-6">
                {sortedBookings.map((booking) => {
                    // Get flight details either from the populated flight or from our fetched details
                    const flightId = typeof booking.flight === 'string' ? booking.flight : (booking.flight as Flight)._id;
                    const flight = flightDetails[flightId] || null;

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