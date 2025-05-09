// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
                <div className="flex items-center justify-center space-x-6 md:order-2">
                    <Link
                        to="/about"
                        className="text-gray-700 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400"
                    >
                        About
                    </Link>
                    <Link
                        to="/contact"
                        className="text-gray-700 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400"
                    >
                        Contact
                    </Link>
                    <Link
                        to="/privacy"
                        className="text-gray-700 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400"
                    >
                        Privacy
                    </Link>
                    <Link
                        to="/terms"
                        className="text-gray-700 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400"
                    >
                        Terms
                    </Link>
                </div>
                <div className="mt-8 md:order-1 md:mt-0">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} SkyBooker. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;