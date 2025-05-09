// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
    return (
        <div className="mx-auto max-w-7xl">
            {/* Hero Section */}
            <div className="flex flex-col-reverse items-center py-12 md:flex-row md:py-16 lg:py-20">
                <motion.div
                    className="mt-8 flex-1 text-center md:mt-0 md:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                        <span className="block">Book Your</span>
                        <span className="block text-blue-600 dark:text-blue-400">
                            Dream Flight
                        </span>
                    </h1>
                    <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
                        Find and book flights to any destination at the best prices.
                        Enjoy hassle-free booking with SkyBooker.
                    </p>
                    <div className="mt-8 flex justify-center space-x-4 md:justify-start">
                        <Link to="/search">
                            <Button size="lg">Search Flights</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="outline" size="lg">
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </motion.div>
                <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <img
                        className="mx-auto h-64 w-auto sm:h-72 md:h-80 lg:h-96"
                        src="/airplane.svg" // You'll need to add this SVG or replace with your image
                        alt="Airplane illustration"
                    />
                </motion.div>
            </div>

            {/* Features Section */}
            <motion.div
                className="py-12 md:py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Why Choose SkyBooker?
                        </h2>
                        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                            We make booking flights simple and affordable
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                Best Prices
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We guarantee the best prices for your flights with no hidden fees.
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                Fast Booking
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Book your flights in minutes with our simple and intuitive booking process.
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                Secure Payments
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                All your transactions are secure and your data is protected.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
                className="bg-blue-600 dark:bg-blue-800 py-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <h2 className="text-3xl font-bold text-white">
                    Ready to Start Your Journey?
                </h2>
                <p className="mt-4 text-xl text-blue-100">
                    Book your flight now and get the best deals
                </p>
                <div className="mt-8">
                    <Link to="/search">
                        <Button
                            variant="secondary"
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                        >
                            Search Flights
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default HomePage;