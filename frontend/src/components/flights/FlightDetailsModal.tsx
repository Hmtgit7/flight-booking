// frontend/src/components/flights/FlightDetailsModal.tsx
import React from 'react';
import { Flight } from '../../types/flight';
import { formatDate, formatTime, getDurationFromMinutes } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import PriceHistoryChart from './PriceHistoryChart';
import SeatsIndicator from './SeatsIndicator';

interface FlightDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    flight: Flight;
    onSelect: (flight: Flight) => void;
}

const FlightDetailsModal: React.FC<FlightDetailsModalProps> = ({
    isOpen,
    onClose,
    flight,
    onSelect
}) => {
    if (!flight) return null;

    const departureTime = typeof flight.departureTime === 'string'
        ? new Date(flight.departureTime)
        : flight.departureTime;

    const arrivalTime = typeof flight.arrivalTime === 'string'
        ? new Date(flight.arrivalTime)
        : flight.arrivalTime;

    const handleSelect = () => {
        onSelect(flight);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${flight.airline} - ${flight.flightNumber}`}
            className="max-w-3xl"
        >
            <div className="space-y-6">
                {/* Flight details section */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">From</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {flight.departureCity} ({flight.departureCode})
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {flight.departureAirport}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                {formatTime(departureTime)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(departureTime)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">To</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {flight.arrivalCity} ({flight.arrivalCode})
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {flight.arrivalAirport}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                {formatTime(arrivalTime)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(arrivalTime)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {getDurationFromMinutes(flight.duration)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aircraft</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {flight.aircraft}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Seats Available</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {flight.seatsAvailable}
                                </p>
                                <SeatsIndicator seatsAvailable={flight.seatsAvailable} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price history chart */}
                <PriceHistoryChart
                    departureCode={flight.departureCode}
                    arrivalCode={flight.arrivalCode}
                    departureDate={formatDate(departureTime)}
                    currentPrice={flight.currentPrice}
                />

                {/* Pricing and action */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Price</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(flight.currentPrice)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">per passenger</p>
                    </div>

                    <Button onClick={handleSelect} size="lg">
                        Select Flight
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default FlightDetailsModal;