// src/components/flights/FlightFilters.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flight } from '../../types/flight';
import { Card, CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';

interface FlightFiltersProps {
    flights: Flight[];
    onFilter: (filteredFlights: Flight[]) => void;
}

const FlightFilters: React.FC<FlightFiltersProps> = ({ flights, onFilter }) => {
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
    const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
    const [departureTimeRange, setDepartureTimeRange] = useState<[number, number]>([0, 24]);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    // Get unique airlines from flights
    const uniqueAirlines = Array.from(new Set(flights.map(flight => flight.airline)));

    // Get min and max price from flights
    const minPrice = Math.min(...flights.map(flight => flight.currentPrice));
    const maxPrice = Math.max(...flights.map(flight => flight.currentPrice));

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        const index = e.target.name === 'minPrice' ? 0 : 1;
        const newPriceRange = [...priceRange] as [number, number];
        newPriceRange[index] = value;
        setPriceRange(newPriceRange);
    };

    const handleAirlineChange = (airline: string) => {
        if (selectedAirlines.includes(airline)) {
            setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
        } else {
            setSelectedAirlines([...selectedAirlines, airline]);
        }
    };

    const handleDepartureTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        const index = e.target.name === 'minTime' ? 0 : 1;
        const newTimeRange = [...departureTimeRange] as [number, number];
        newTimeRange[index] = value;
        setDepartureTimeRange(newTimeRange);
    };

    const applyFilters = () => {
        let filteredFlights = [...flights];

        // Filter by price
        filteredFlights = filteredFlights.filter(
            flight =>
                flight.currentPrice >= priceRange[0] && flight.currentPrice <= priceRange[1]
        );

        // Filter by airline
        if (selectedAirlines.length > 0) {
            filteredFlights = filteredFlights.filter(flight =>
                selectedAirlines.includes(flight.airline)
            );
        }

        // Filter by departure time
        filteredFlights = filteredFlights.filter(flight => {
            const departureHour = new Date(flight.departureTime).getHours();
            return (
                departureHour >= departureTimeRange[0] && departureHour <= departureTimeRange[1]
            );
        });

        onFilter(filteredFlights);
    };

    const resetFilters = () => {
        setPriceRange([minPrice, maxPrice]);
        setSelectedAirlines([]);
        setDepartureTimeRange([0, 24]);
        onFilter(flights);
    };

    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                >
                    {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
                </Button>
            </CardHeader>

            {isFilterVisible && (
                <CardContent>
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Price Filter */}
                            <div>
                                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Price Range</h3>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(priceRange[0])}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(priceRange[1])}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Min</label>
                                        <input
                                            type="range"
                                            name="minPrice"
                                            min={minPrice}
                                            max={maxPrice}
                                            value={priceRange[0]}
                                            onChange={handlePriceChange}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Max</label>
                                        <input
                                            type="range"
                                            name="maxPrice"
                                            min={minPrice}
                                            max={maxPrice}
                                            value={priceRange[1]}
                                            onChange={handlePriceChange}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Airlines Filter */}
                            <div>
                                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Airlines</h3>
                                <div className="space-y-2">
                                    {uniqueAirlines.map(airline => (
                                        <div key={airline} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={airline}
                                                checked={selectedAirlines.includes(airline)}
                                                onChange={() => handleAirlineChange(airline)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                            />
                                            <label
                                                htmlFor={airline}
                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                {airline}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Departure Time Filter */}
                            <div>
                                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Departure Time</h3>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {departureTimeRange[0]}:00
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {departureTimeRange[1]}:00
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">From</label>
                                        <input
                                            type="range"
                                            name="minTime"
                                            min={0}
                                            max={24}
                                            value={departureTimeRange[0]}
                                            onChange={handleDepartureTimeChange}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">To</label>
                                        <input
                                            type="range"
                                            name="maxTime"
                                            min={0}
                                            max={24}
                                            value={departureTimeRange[1]}
                                            onChange={handleDepartureTimeChange}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <Button variant="outline" onClick={resetFilters}>
                                Reset
                            </Button>
                            <Button onClick={applyFilters}>Apply Filters</Button>
                        </div>
                    </motion.div>
                </CardContent>
            )}
        </Card>
    );
};

export default FlightFilters;