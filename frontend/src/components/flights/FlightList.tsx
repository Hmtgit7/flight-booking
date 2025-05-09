// src/components/flights/FlightList.tsx
import React, { useState } from 'react';
import { Flight } from '../../types/flight';
import FlightCard from './FlightCard';
import FlightFilters from './FlightFilters';
import { motion, AnimatePresence } from 'framer-motion';

interface FlightListProps {
    flights: Flight[];
    onSelectFlight: (flight: Flight) => void;
}

const FlightList: React.FC<FlightListProps> = ({ flights, onSelectFlight }) => {
    const [filteredFlights, setFilteredFlights] = useState<Flight[]>(flights);
    const [sortOption, setSortOption] = useState<string>('price-asc');

    const handleFilter = (filtered: Flight[]) => {
        setFilteredFlights(sortFlights(filtered, sortOption));
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const option = e.target.value;
        setSortOption(option);
        setFilteredFlights(sortFlights(filteredFlights, option));
    };

    const sortFlights = (flightsToSort: Flight[], option: string): Flight[] => {
        const sortedFlights = [...flightsToSort];

        switch (option) {
            case 'price-asc':
                return sortedFlights.sort((a, b) => a.currentPrice - b.currentPrice);
            case 'price-desc':
                return sortedFlights.sort((a, b) => b.currentPrice - a.currentPrice);
            case 'duration-asc':
                return sortedFlights.sort((a, b) => a.duration - b.duration);
            case 'departure-asc':
                return sortedFlights.sort((a, b) =>
                    new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
                );
            case 'arrival-asc':
                return sortedFlights.sort((a, b) =>
                    new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
                );
            default:
                return sortedFlights;
        }
    };

    return (
        <div>
            <FlightFilters flights={flights} onFilter={handleFilter} />

            {filteredFlights.length > 0 ? (
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {filteredFlights.length} results
                        </div>
                        <div className="flex items-center space-x-2">
                            <label htmlFor="sort" className="text-sm text-gray-700 dark:text-gray-300">
                                Sort by:
                            </label>
                            <select
                                id="sort"
                                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                value={sortOption}
                                onChange={handleSortChange}
                            >
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="duration-asc">Duration: Shortest</option>
                                <option value="departure-asc">Departure Time: Earliest</option>
                                <option value="arrival-asc">Arrival Time: Earliest</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredFlights.map((flight) => (
                                <FlightCard
                                    key={flight._id}
                                    flight={flight}
                                    onSelect={onSelectFlight}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800"
                >
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                        No flights found matching your criteria.
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your filters or search criteria.
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default FlightList;