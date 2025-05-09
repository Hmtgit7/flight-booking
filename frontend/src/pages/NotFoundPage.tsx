// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
                404
            </h1>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                Page Not Found
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className="mt-8">
                <Button>Back to Home</Button>
            </Link>
        </div>
    );
};

export default NotFoundPage;