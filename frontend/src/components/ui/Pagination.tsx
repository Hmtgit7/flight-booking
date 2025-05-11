// frontend/src/components/flights/Pagination.tsx
import React from 'react';
import { cn } from '../../utils/cn';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    // Generate page numbers
    const pageNumbers = [];
    const maxVisiblePages = 5;

    // Logic to determine which page numbers to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="flex justify-center">
            <ul className="flex items-center space-x-1">
                {/* Previous button */}
                <li>
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-md border",
                            currentPage === 1
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        )}
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

                {/* First page */}
                {startPage > 1 && (
                    <>
                        <li>
                            <button
                                onClick={() => onPageChange(1)}
                                className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                1
                            </button>
                        </li>
                        {startPage > 2 && (
                            <li className="text-gray-500 dark:text-gray-400">...</li>
                        )}
                    </>
                )}

                {/* Page numbers */}
                {pageNumbers.map(number => (
                    <li key={number}>
                        <button
                            onClick={() => onPageChange(number)}
                            className={cn(
                                "flex h-9 min-w-[2.25rem] items-center justify-center rounded-md border px-2 text-sm",
                                currentPage === number
                                    ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            )}
                        >
                            {number}
                        </button>
                    </li>
                ))}

                {/* Last page */}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <li className="text-gray-500 dark:text-gray-400">...</li>
                        )}
                        <li>
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                {totalPages}
                            </button>
                        </li>
                    </>
                )}

                {/* Next button */}
                <li>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-md border",
                            currentPage === totalPages
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        )}
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
    );
};

export default Pagination;