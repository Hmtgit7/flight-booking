// src/pages/BookingDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { bookingService } from '../services/booking-service';
import { flightService } from '../services/flight-service';
import { Booking, TicketData } from '../types/booking';
import { Flight } from '../types/flight';
import TicketGenerator from '../components/bookings/TicketGenerator';
import Loader from '../components/ui/Loader';

const BookingDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useAuth();
    const { selectedFlight } = useBooking();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [flight, setFlight] = useState<Flight | null>(null);
    const [ticket, setTicket] = useState<TicketData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                if (!id) return;

                // Get the booking details
                const bookingData = await bookingService.getBookingById(id);
                setBooking(bookingData);

                // Try to generate ticket through the API
                try {
                    const ticketData = await bookingService.generateTicket(id);
                    setTicket(ticketData);
                } catch (ticketError) {
                    console.error('Error fetching ticket from API:', ticketError);

                    // Fallback: If API ticket generation fails, try to construct ticket locally
                    // First, we need to get the flight details if not already available
                    let flightData = selectedFlight;

                    // If we don't have the flight, try to get it
                    if (!flightData) {
                        try {
                            // Get the flightId from the booking
                            const flightId = typeof bookingData.flight === 'string'
                                ? bookingData.flight
                                : bookingData.flight._id;

                            // Fetch the flight details
                            flightData = await flightService.getFlightById(flightId);
                            setFlight(flightData);
                        } catch (flightError) {
                            console.error('Error fetching flight details:', flightError);
                            throw new Error('Could not load flight information');
                        }
                    }

                    // If we have both booking and flight data, generate ticket locally
                    if (bookingData && flightData) {
                        const localTicket = bookingService.generateLocalTicket(bookingData, flightData);
                        setTicket(localTicket);
                    } else {
                        throw new Error('Missing data needed to generate ticket');
                    }
                }
            } catch (error: any) {
                console.error('Error fetching booking:', error);
                setError(error.message || 'Failed to load booking information');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchBooking();
        }
    }, [id, isAuthenticated, selectedFlight]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error || !booking || !ticket) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Booking not found
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {error || "The booking you're looking for doesn't exist or you don't have permission to view it."}
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Booking Details
            </h1>
            <TicketGenerator ticket={ticket} />
        </div>
    );
};

export default BookingDetailsPage;