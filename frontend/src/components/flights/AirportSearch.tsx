// frontend/src/components/flights/AirportSearch.tsx
import React, { useState, useEffect, useRef } from 'react';
import { airportService } from '../../services/airport-service';
import { Airport } from '../../types/flight';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface AirportSearchProps {
    id: string;
    name: string;
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string, code: string) => void;
    error?: string;
    className?: string;
}

const AirportSearch: React.FC<AirportSearchProps> = ({
    id,
    name,
    label,
    placeholder = 'Search for city or airport',
    value,
    onChange,
    error,
    className,
}) => {
    const [query, setQuery] = useState<string>(value);
    const [results, setResults] = useState<Airport[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Search airports when query changes
    useEffect(() => {
        const searchAirports = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                console.log("Searching airports with query:", query);
                const airports = await airportService.searchAirports(query);
                console.log("Search results:", airports);
                setResults(airports);
            } catch (error) {
                console.error('Error searching airports:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(searchAirports, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    // Handle click outside to close results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                resultsRef.current &&
                !resultsRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (!showResults) {
            setShowResults(true);
        }
    };

    const handleSelectAirport = (airport: Airport) => {
        const displayValue = `${airport.city} (${airport.code})`;
        setQuery(displayValue);
        onChange(displayValue, airport.code);
        setShowResults(false);
    };

    return (
        <div className={cn('relative w-full', className)}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    name={name}
                    ref={inputRef}
                    type="text"
                    className={cn(
                        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:ring-offset-gray-800 dark:placeholder:text-gray-400',
                        error && 'border-red-500 focus-visible:ring-red-500'
                    )}
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    onFocus={() => setShowResults(true)}
                />
                {loading && (
                    <div className="absolute right-3 top-3">
                        <svg
                            className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

            <AnimatePresence>
                {showResults && query.trim().length >= 2 && (
                    <motion.div
                        ref={resultsRef}
                        className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg dark:bg-gray-800"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                            {results.length > 0 ? (
                                results.map((airport, index) => (
                                    <li
                                        key={`${airport.code}-${index}`} // Add index to make keys unique
                                        className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => handleSelectAirport(airport)}
                                    >
                                        <div className="font-medium">
                                            {airport.city} ({airport.code})
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {airport.name}, {airport.country}
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                    No results found. Try a different search term.
                                </li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AirportSearch;