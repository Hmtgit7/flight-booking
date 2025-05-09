// src/pages/SearchPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { flightService } from '../services/flight-service';
import { Flight, FlightSearchCriteria } from '../types/flight';
import FlightSearchForm from '../components/flights/FlightSearchForm';
import FlightList from '../components/flights/FlightList';
import Loader from '../components/ui/Loader';

const SearchPage: React.FC = () => {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searched, setSearched] = useState<boolean>(false);
    const { setSelectedFlight } = useBooking();
    const navigate = useNavigate();

    const handleSearch = async (data: FlightSearchCriteria) => {
        setLoading(true);
        try {
            const searchResults = await flightService.searchFlights(data);
            setFlights(searchResults);
            setSearched(true);
        } catch (error) {
            console.error('Error searching flights:', error);
            alert('Error searching flights. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFlight = (flight: Flight) => {
        setSelectedFlight(flight);
        navigate('/booking');
    };

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Search Flights
            </h1>

            <FlightSearchForm onSubmit={handleSearch} isLoading={loading} />

            {loading ? (
                <div className="mt-8 flex justify-center">
                    <Loader size="lg" />
                </div>
            ) : searched ? (
                <div className="mt-8">
                    <FlightList flights={flights} onSelectFlight={handleSelectFlight} />
                </div>
            ) : null}
        </div>
    );
};

export default SearchPage;