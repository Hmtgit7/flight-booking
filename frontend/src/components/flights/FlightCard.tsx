// src/components/flights/FlightCard.tsx
import React from 'react';
import { Flight } from '../../types/flight';
import { formatTime, formatDate, getDurationFromMinutes } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { motion } from 'framer-motion';

interface FlightCardProps {
    flight: Flight;
    onSelect: (flight: Flight) => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onSelect }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
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
                                        {formatTime(flight.departureTime)}
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
                                        {formatTime(flight.arrivalTime)}
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
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col justify-between space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:flex-row md:items-center md:space-y-0">
                            <div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    {flight.departureCity} to {flight.arrivalCity}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(flight.departureTime)} • {flight.aircraft}
                                </div>
                            </div>

                            <Button
                                onClick={() => onSelect(flight)}
                                variant="primary"
                                size="md"
                            >
                                Select Flight
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FlightCard;