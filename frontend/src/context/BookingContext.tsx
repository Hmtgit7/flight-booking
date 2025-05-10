// src/context/BookingContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Flight } from '../types/flight';
import { Passenger, Booking } from '../types/booking';
import { bookingService } from '../services/booking-service';
import { useAuth } from './AuthContext';

interface BookingContextType {
    selectedFlight: Flight | null;
    passengers: Passenger[];
    bookings: Booking[];
    totalBookings: number;
    isLoadingBookings: boolean;
    bookingsError: string | null;
    currentPage: number;
    totalPages: number;
    setSelectedFlight: (flight: Flight | null) => void;
    setPassengers: (passengers: Passenger[]) => void;
    addPassenger: (passenger: Passenger) => void;
    removePassenger: (index: number) => void;
    clearBooking: () => void;
    loadBookings: (page?: number) => Promise<void>;
    cancelBooking: (bookingId: string) => Promise<boolean>;
    refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [totalBookings, setTotalBookings] = useState<number>(0);
    const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(false);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const addPassenger = (passenger: Passenger) => {
        setPassengers((prevPassengers) => [...prevPassengers, passenger]);
    };

    const removePassenger = (index: number) => {
        setPassengers((prevPassengers) =>
            prevPassengers.filter((_, i) => i !== index)
        );
    };

    const clearBooking = () => {
        setSelectedFlight(null);
        setPassengers([]);
    };

    const loadBookings = async (page: number = 1) => {
        if (!isAuthenticated) return;

        setIsLoadingBookings(true);
        setBookingsError(null);

        try {
            const result = await bookingService.getUserBookings(page);
            setBookings(result.bookings);
            setTotalBookings(result.total);
            setCurrentPage(result.page);
            setTotalPages(result.pages);
        } catch (error) {
            console.error('Error loading bookings:', error);
            setBookingsError('Failed to load bookings. Please try again.');
        } finally {
            setIsLoadingBookings(false);
        }
    };

    const cancelBooking = async (bookingId: string): Promise<boolean> => {
        try {
            await bookingService.cancelBooking(bookingId);
            // Refresh bookings list after cancellation
            await loadBookings(currentPage);
            return true;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return false;
        }
    };

    const refreshBookings = async () => {
        await loadBookings(currentPage);
    };

    // Load bookings when authenticated and component mounts
    useEffect(() => {
        if (isAuthenticated) {
            loadBookings();
        }
    }, [isAuthenticated]);

    const value = {
        selectedFlight,
        passengers,
        bookings,
        totalBookings,
        isLoadingBookings,
        bookingsError,
        currentPage,
        totalPages,
        setSelectedFlight,
        setPassengers,
        addPassenger,
        removePassenger,
        clearBooking,
        loadBookings,
        cancelBooking,
        refreshBookings,
    };

    return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};