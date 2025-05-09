// src/routes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
            <Route path="/search" element={<Layout><SearchPage /></Layout>} />
            <Route path="/booking" element={<Layout><BookingPage /></Layout>} />
            <Route path="/booking/:id/confirmation" element={<Layout><BookingConfirmationPage /></Layout>} />
            <Route path="/booking/:id" element={<Layout><BookingDetailsPage /></Layout>} />
            <Route path="/bookings" element={<Layout><BookingHistoryPage /></Layout>} />
            <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
            <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
    );
};

export default AppRoutes;