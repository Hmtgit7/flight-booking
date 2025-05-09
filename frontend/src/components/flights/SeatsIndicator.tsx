// frontend/src/components/flights/SeatsIndicator.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface SeatsIndicatorProps {
    seatsAvailable: number;
}

const SeatsIndicator: React.FC<SeatsIndicatorProps> = ({ seatsAvailable }) => {
    // Only show if seats are limited (less than 10)
    if (seatsAvailable >= 10) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
            <div className="flex items-center">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                Only {seatsAvailable} {seatsAvailable === 1 ? 'seat' : 'seats'} left
            </div>
        </motion.div>
    );
};

export default SeatsIndicator;