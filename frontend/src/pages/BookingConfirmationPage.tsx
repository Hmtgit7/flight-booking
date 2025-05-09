// src/pages/BookingConfirmationPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingConfirmation from '../components/bookings/BookingConfirmation';

const BookingConfirmationPage: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <div>
            <BookingConfirmation />
        </div>
    );
};

export default BookingConfirmationPage;