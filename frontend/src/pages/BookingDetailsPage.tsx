// src/pages/BookingDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/booking-service';
import { Booking, TicketData } from '../types/booking';
import TicketGenerator from '../components/bookings/TicketGenerator';
import Loader from '../components/ui/Loader';

const BookingDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useAuth();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [ticket, setTicket] = useState<TicketData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                if (!id) return;

                const bookingData = await bookingService.getBookingById(id);
                setBooking(bookingData);

                const ticketData = await bookingService.generateTicket(id);
                setTicket(ticketData);
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchBooking();
        }
    }, [id, isAuthenticated]);

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

    if (!booking || !ticket) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Booking not found
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    The booking you're looking for doesn't exist or you don't have permission to view it.
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