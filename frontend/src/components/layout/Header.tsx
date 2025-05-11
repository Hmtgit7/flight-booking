// src/components/layout/Header.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import WalletDisplay from './WalletDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { getConnectionStatus } from '../../services/api';

const Header: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    // Check connection status periodically
    useEffect(() => {
        const checkConnection = () => {
            setIsOffline(!getConnectionStatus());
        };

        // Initial check
        checkConnection();

        // Check every 10 seconds
        const interval = setInterval(checkConnection, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsProfileOpen(false);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {/* Offline indicator */}
            {isOffline && (
                <div className="bg-yellow-500 text-yellow-900 text-center text-xs py-1 px-2">
                    You are currently offline. Some features may be limited.
                </div>
            )}

            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                <div className="flex items-center">
                    <Link to="/" className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-blue-600 dark:text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                            SkyBooker
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex md:items-center md:space-x-6">
                    <Link
                        to="/"
                        className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                    >
                        Home
                    </Link>
                    <Link
                        to="/search"
                        className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                    >
                        Search Flights
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/bookings"
                                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                            >
                                My Bookings
                            </Link>
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                                >
                                    <span>{user?.name}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="ml-1 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700"
                                        >
                                            {/* Integrated Wallet Display */}
                                            <WalletDisplay />

                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
                                            >
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                            >
                                Register
                            </Link>
                        </>
                    )}
                    <ThemeToggle />
                </nav>

                {/* Mobile Menu Button */}
                <div className="flex items-center space-x-4 md:hidden">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-700 dark:text-gray-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden"
                    >
                        <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
                            {isAuthenticated && (
                                // Display wallet in mobile menu
                                <div className="mb-2">
                                    <WalletDisplay />
                                </div>
                            )}

                            <Link
                                to="/"
                                className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                to="/search"
                                className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Search Flights
                            </Link>
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/bookings"
                                        className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Bookings
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <div className="border-t border-gray-200 py-2 dark:border-gray-700">
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full py-2 text-left text-base font-medium text-red-600 dark:text-red-400"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="border-t border-gray-200 py-2 dark:border-gray-700">
                                    <Link
                                        to="/login"
                                        className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block py-2 text-base font-medium text-blue-600 dark:text-blue-400"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;