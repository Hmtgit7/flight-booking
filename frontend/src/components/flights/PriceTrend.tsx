// frontend/src/components/flights/PriceTrend.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface PriceTrendProps {
    searchCount: number;
    isIncreased: boolean;
}

const PriceTrend: React.FC<PriceTrendProps> = ({ searchCount, isIncreased }) => {
    // Only show if price has increased or search count >= 2
    if (!isIncreased && searchCount < 2) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-1 flex items-center text-xs ${isIncreased ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                }`}
        >
            {isIncreased ? (
                <>
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
                </>
            ) : (
                <>
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
                    Price may increase soon
                </>
            )}
        </motion.div>
    );
};

export default PriceTrend;