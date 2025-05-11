// src/components/flights/FlightCard.tsx
import React, { useState } from 'react';
import { Flight } from '../../types/flight';
import { formatTime, formatDate, getDurationFromMinutes } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { motion } from 'framer-motion';

// Import optional components - add these if you've implemented them
import PriceTrend from './PriceTrend';
import SeatsIndicator from './SeatsIndicator';
import FlightDetailsModal from './FlightDetailsModal';

interface FlightCardProps {
    flight: Flight;
    onSelect: (flight: Flight) => void;
    searchCount?: number;
}

const FlightCard: React.FC<FlightCardProps> = ({
    flight,
    onSelect,
    searchCount = 0
}) => {
    const [showDetails, setShowDetails] = useState<boolean>(false);

    // Ensure we have proper date objects or strings for formatting
    const departureTime = typeof flight.departureTime === 'string'
        ? new Date(flight.departureTime)
        : flight.departureTime;

    const arrivalTime = typeof flight.arrivalTime === 'string'
        ? new Date(flight.arrivalTime)
        : flight.arrivalTime;

    // Handle selection and ensure the flight ID is correctly passed
    const handleSelect = () => {
        // Make sure we preserve the flight._id even if it's not a standard MongoDB ObjectId
        onSelect({
            ...flight,
            _id: flight._id || flight.flightNumber // Fallback to flightNumber if _id is missing
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >

            {showDetails && (
                <FlightDetailsModal
                    isOpen={showDetails}
                    onClose={() => setShowDetails(false)}
                    flight={flight}
                    onSelect={onSelect}
                />
            )}


            <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-0">
                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {flight.airline}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                                Flight {flight.flightNumber}
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                            <div className="flex items-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatTime(departureTime)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {flight.departureCode}
                                    </div>
                                </div>

                                <div className="mx-4 flex-1">
                                    <div className="flex items-center">
                                        <div className="h-1 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                        <div className="flex-1 border-t border-dashed border-gray-300 dark:border-gray-600"></div>
                                        <div className="h-1 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                    </div>
                                    <div className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
                                        {getDurationFromMinutes(flight.duration)}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatTime(arrivalTime)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {flight.arrivalCode}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(flight.currentPrice)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    per passenger
                                </div>

                                {/* Price increase indicator */}
                                {flight.priceIncreased && (
                                    <div className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-1 h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                            />
                                        </svg>
                                        Price increased by 10%
                                    </div>
                                )}


                                <PriceTrend
                                    searchCount={searchCount}
                                    isIncreased={flight.priceIncreased || false}
                                />

                            </div>
                        </div>

                        <div className="mt-4 flex flex-col justify-between space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:flex-row md:items-center md:space-y-0">
                            <div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    {flight.departureCity} to {flight.arrivalCity}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(departureTime)} • {flight.aircraft}
                                </div>

                                <SeatsIndicator seatsAvailable={flight.seatsAvailable} />


                                {/* Basic seats indicator */}
                                {flight.seatsAvailable < 10 && (
                                    <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        Only {flight.seatsAvailable} seats left!
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => setShowDetails(true)}
                                    variant="outline"
                                    size="md"
                                >
                                    View Details
                                </Button>


                                <Button
                                    onClick={handleSelect}
                                    variant="primary"
                                    size="md"
                                >
                                    Select Flight
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FlightCard;