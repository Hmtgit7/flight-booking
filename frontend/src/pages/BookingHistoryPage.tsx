// src/pages/BookingHistoryPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingHistory from '../components/bookings/BookingHistory';

const BookingHistoryPage: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                My Bookings
            </h1>
            <BookingHistory />
        </div>
    );
};

export default BookingHistoryPage;