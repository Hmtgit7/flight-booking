// // src/components/flights/FlightList.tsx
// import React, { useState } from 'react';
// import { Flight } from '../../types/flight';
// import FlightCard from './FlightCard';
// import FlightFilters from './FlightFilters';
// import { motion, AnimatePresence } from 'framer-motion';
// import { formatDate } from '../../utils/date';

// interface FlightListProps {
//     flights: Flight[];
//     onSelectFlight: (flight: Flight) => void;
// }

// const FlightList: React.FC<FlightListProps> = ({ flights, onSelectFlight }) => {
//     const [filteredFlights, setFilteredFlights] = useState<Flight[]>(flights);
//     const [sortOption, setSortOption] = useState<string>('price-asc');
//     const [currentPage, setCurrentPage] = useState<number>(1);
//     const [flightsPerPage] = useState<number>(5);

//     const handleFilter = (filtered: Flight[]) => {
//         setFilteredFlights(sortFlights(filtered, sortOption));
//         setCurrentPage(1); // Reset to first page when filtering
//     };

//     const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         const option = e.target.value;
//         setSortOption(option);
//         setFilteredFlights(sortFlights(filteredFlights, option));
//     };

//     const sortFlights = (flightsToSort: Flight[], option: string): Flight[] => {
//         const sortedFlights = [...flightsToSort];

//         switch (option) {
//             case 'price-asc':
//                 return sortedFlights.sort((a, b) => a.currentPrice - b.currentPrice);
//             case 'price-desc':
//                 return sortedFlights.sort((a, b) => b.currentPrice - a.currentPrice);
//             case 'duration-asc':
//                 return sortedFlights.sort((a, b) => a.duration - b.duration);
//             case 'departure-asc':
//                 return sortedFlights.sort((a, b) =>
//                     new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
//                 );
//             case 'arrival-asc':
//                 return sortedFlights.sort((a, b) =>
//                     new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
//                 );
//             default:
//                 return sortedFlights;
//         }
//     };

//     // Get current flights
//     const indexOfLastFlight = currentPage * flightsPerPage;
//     const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
//     const currentFlights = filteredFlights.slice(indexOfFirstFlight, indexOfLastFlight);
//     const totalPages = Math.ceil(filteredFlights.length / flightsPerPage);

//     // Handle pagination
//     const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

//     return (
//         <div>
//             <FlightFilters flights={flights} onFilter={handleFilter} />

//             {filteredFlights.length > 0 ? (
//                 <div>
//                     <div className="mb-4 flex items-center justify-between">
//                         <div className="text-sm text-gray-500 dark:text-gray-400">
//                             Showing {indexOfFirstFlight + 1} - {Math.min(indexOfLastFlight, filteredFlights.length)} of {filteredFlights.length} results
//                         </div>
//                         <div className="flex items-center space-x-2">
//                             <label htmlFor="sort" className="text-sm text-gray-700 dark:text-gray-300">
//                                 Sort by:
//                             </label>
//                             <select
//                                 id="sort"
//                                 className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
//                                 value={sortOption}
//                                 onChange={handleSortChange}
//                             >
//                                 <option value="price-asc">Price: Low to High</option>
//                                 <option value="price-desc">Price: High to Low</option>
//                                 <option value="duration-asc">Duration: Shortest</option>
//                                 <option value="departure-asc">Departure Time: Earliest</option>
//                                 <option value="arrival-asc">Arrival Time: Earliest</option>
//                             </select>
//                         </div>
//                     </div>

//                     <div className="space-y-4">
//                         <AnimatePresence>
//                             {currentFlights.map((flight) => (
//                                 <FlightCard
//                                     key={flight._id}
//                                     flight={flight}
//                                     onSelect={onSelectFlight}
//                                     searchCount={0}  // We'll get this from localStorage in real implementation
//                                 />
//                             ))}
//                         </AnimatePresence>
//                     </div>

//                     {/* Pagination */}
//                     {totalPages > 1 && (
//                         <div className="mt-6 flex justify-center">
//                             <nav>
//                                 <ul className="flex items-center space-x-1">
//                                     {/* Previous button */}
//                                     <li>
//                                         <button
//                                             onClick={() => paginate(Math.max(1, currentPage - 1))}
//                                             disabled={currentPage === 1}
//                                             className={`h-9 w-9 rounded-md border flex items-center justify-center ${currentPage === 1
//                                                 ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
//                                                 : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
//                                                 }`}
//                                         >
//                                             <span className="sr-only">Previous</span>
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 className="h-5 w-5"
//                                                 viewBox="0 0 20 20"
//                                                 fill="currentColor"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </button>
//                                     </li>

//                                     {/* Page numbers */}
//                                     {Array.from({ length: totalPages }).map((_, index) => (
//                                         <li key={index + 1}>
//                                             <button
//                                                 onClick={() => paginate(index + 1)}
//                                                 className={`h-9 min-w-[2.25rem] rounded-md border flex items-center justify-center px-2 text-sm ${currentPage === index + 1
//                                                     ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
//                                                     : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
//                                                     }`}
//                                             >
//                                                 {index + 1}
//                                             </button>
//                                         </li>
//                                     ))}

//                                     {/* Next button */}
//                                     <li>
//                                         <button
//                                             onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
//                                             disabled={currentPage === totalPages}
//                                             className={`h-9 w-9 rounded-md border flex items-center justify-center ${currentPage === totalPages
//                                                 ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
//                                                 : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
//                                                 }`}
//                                         >
//                                             <span className="sr-only">Next</span>
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 className="h-5 w-5"
//                                                 viewBox="0 0 20 20"
//                                                 fill="currentColor"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </button>
//                                     </li>
//                                 </ul>
//                             </nav>
//                         </div>
//                     )}
//                 </div>
//             ) : (
//                 <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800"
//                 >
//                     <p className="text-lg text-gray-700 dark:text-gray-300">
//                         No flights found matching your criteria.
//                     </p>
//                     <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
//                         Try adjusting your filters or search criteria.
//                     </p>
//                 </motion.div>
//             )}
//         </div>
//     );
// };

// export default FlightList;

// src/components/flights/FlightList.tsx
import React, { useState } from 'react';
import { Flight } from '../../types/flight';
import FlightCard from './FlightCard';
import FlightFilters from './FlightFilters';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/date';

interface FlightListProps {
    flights: Flight[];
    onSelectFlight: (flight: Flight) => void;
}

const FlightList: React.FC<FlightListProps> = ({ flights, onSelectFlight }) => {
    const [filteredFlights, setFilteredFlights] = useState<Flight[]>(flights);
    const [sortOption, setSortOption] = useState<string>('price-asc');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [flightsPerPage] = useState<number>(5);

    const handleFilter = (filtered: Flight[]) => {
        setFilteredFlights(sortFlights(filtered, sortOption));
        setCurrentPage(1); // Reset to first page when filtering
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

    // Get current flights
    const indexOfLastFlight = currentPage * flightsPerPage;
    const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
    const currentFlights = filteredFlights.slice(indexOfFirstFlight, indexOfLastFlight);
    const totalPages = Math.ceil(filteredFlights.length / flightsPerPage);

    // Handle pagination
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div>
            <FlightFilters flights={flights} onFilter={handleFilter} />

            {filteredFlights.length > 0 ? (
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {indexOfFirstFlight + 1} - {Math.min(indexOfLastFlight, filteredFlights.length)} of {filteredFlights.length} results
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
                            {currentFlights.map((flight) => (
                                <FlightCard
                                    key={flight._id}
                                    flight={flight}
                                    onSelect={onSelectFlight}
                                    searchCount={0}  // We'll get this from localStorage in real implementation
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                            <nav>
                                <ul className="flex items-center space-x-1">
                                    {/* Previous button */}
                                    <li>
                                        <button
                                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className={`h-9 w-9 rounded-md border flex items-center justify-center ${currentPage === 1
                                                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </li>

                                    {/* Page numbers */}
                                    {Array.from({ length: totalPages }).map((_, index) => (
                                        <li key={index + 1}>
                                            <button
                                                onClick={() => paginate(index + 1)}
                                                className={`h-9 min-w-[2.25rem] rounded-md border flex items-center justify-center px-2 text-sm ${currentPage === index + 1
                                                        ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}

                                    {/* Next button */}
                                    <li>
                                        <button
                                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`h-9 w-9 rounded-md border flex items-center justify-center ${currentPage === totalPages
                                                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
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