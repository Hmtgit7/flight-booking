// src/pages/SearchPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { flightService } from '../services/flight-service';
import { Flight, FlightSearchCriteria } from '../types/flight';
import FlightSearchForm from '../components/flights/FlightSearchForm';
import FlightList from '../components/flights/FlightList';
import PricingExplanation from '../components/flights/PricingExplanation';
import Loader from '../components/ui/Loader';
import { formatDate } from '../utils/date';

type SearchCountInfo = {
    count: number;
    timestamp: number;
};

type SearchCountsRecord = Record<string, SearchCountInfo>;

const SearchPage: React.FC = () => {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searched, setSearched] = useState<boolean>(false);
    const [searchCounts, setSearchCounts] = useState<SearchCountsRecord>({});
    const { setSelectedFlight } = useBooking();
    const navigate = useNavigate();

    // Load search counts from localStorage on component mount
    useEffect(() => {
        const savedCounts = localStorage.getItem('flightSearchCounts');
        if (savedCounts) {
            try {
                const parsedCounts = JSON.parse(savedCounts) as SearchCountsRecord;

                // Clean up any expired counts (older than 10 minutes)
                const now = Date.now();
                const cleanedCounts: SearchCountsRecord = {};
                Object.entries(parsedCounts).forEach(([key, value]) => {
                    if (now - value.timestamp < 10 * 60 * 1000) {
                        cleanedCounts[key] = value;
                    }
                });

                setSearchCounts(cleanedCounts);
                localStorage.setItem('flightSearchCounts', JSON.stringify(cleanedCounts));
            } catch (e) {
                console.error('Error parsing saved search counts:', e);
                localStorage.removeItem('flightSearchCounts');
            }
        }
    }, []);

    const handleSearch = async (data: FlightSearchCriteria) => {
        console.log("Search initiated with data:", data);
        setLoading(true);

        // Create a key for this search
        const searchKey = `${data.departureCity}-${data.arrivalCity}-${data.departureDate}`;

        // Update search count
        const now = Date.now();
        const currentCount = searchCounts[searchKey] || { count: 0, timestamp: now };

        // Check if we should reset the count (after 10 minutes)
        const newCount = now - currentCount.timestamp > 10 * 60 * 1000 ?
            { count: 1, timestamp: now } :
            { count: currentCount.count + 1, timestamp: now };

        const updatedCounts = {
            ...searchCounts,
            [searchKey]: newCount
        };

        setSearchCounts(updatedCounts);
        localStorage.setItem('flightSearchCounts', JSON.stringify(updatedCounts));

        try {
            // Perform search
            const searchResults = await flightService.searchFlights(data);
            console.log("Search results:", searchResults);

            // Apply dynamic pricing based on search count if not already applied
            const resultsWithDynamicPricing = searchResults.map(flight => {
                if (newCount.count >= 3 && !flight.priceIncreased) {
                    return {
                        ...flight,
                        currentPrice: Math.round(flight.basePrice * 1.1),
                        priceIncreased: true
                    };
                }
                return flight;
            });

            setFlights(resultsWithDynamicPricing);
            setSearched(true);
        } catch (error) {
            console.error('Error searching flights:', error);
            alert('Error searching flights. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFlight = (flight: Flight) => {
        console.log("Selected flight:", flight);
        setSelectedFlight(flight);
        navigate('/booking');
    };

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Search Flights
            </h1>

            <PricingExplanation />

            <FlightSearchForm onSubmit={handleSearch} isLoading={loading} />

            {loading ? (
                <div className="mt-8 flex justify-center">
                    <Loader size="lg" />
                </div>
            ) : searched ? (
                <div className="mt-8">
                    {flights.length > 0 ? (
                        <FlightList
                            flights={flights}
                            onSelectFlight={handleSelectFlight}
                        />
                    ) : (
                        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
                            <p className="text-lg text-gray-700 dark:text-gray-300">
                                No flights found matching your criteria.
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Try adjusting your search criteria.
                            </p>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default SearchPage;