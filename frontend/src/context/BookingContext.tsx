// src/context/BookingContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Flight } from '../types/flight';
import { Passenger } from '../types/booking';

interface BookingContextType {
    selectedFlight: Flight | null;
    passengers: Passenger[];
    setSelectedFlight: (flight: Flight | null) => void;
    setPassengers: (passengers: Passenger[]) => void;
    addPassenger: (passenger: Passenger) => void;
    removePassenger: (index: number) => void;
    clearBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
    const [passengers, setPassengers] = useState<Passenger[]>([]);

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

    const value = {
        selectedFlight,
        passengers,
        setSelectedFlight,
        setPassengers,
        addPassenger,
        removePassenger,
        clearBooking,
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