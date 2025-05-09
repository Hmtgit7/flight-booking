// src/pages/BookingPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import BookingForm from '../components/bookings/BookingForm';

const BookingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { selectedFlight } = useBooking();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!selectedFlight) {
        return <Navigate to="/search" />;
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Book Your Flight
            </h1>
            <BookingForm />
        </div>
    );
};

export default BookingPage;
