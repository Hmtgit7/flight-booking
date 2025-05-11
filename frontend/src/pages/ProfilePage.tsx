// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { walletService } from '../services/wallet-service';
import { Transaction } from '../types/wallet';
import { formatCurrency } from '../utils/format';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Pagination from '../components/ui/Pagination';
import { getConnectionStatus } from '../services/api';

const ProfilePage: React.FC = () => {
    const { isAuthenticated, user, wallet, refreshWallet, isRefreshingWallet, walletError } = useAuth();
    const { loadBookings } = useBooking();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionStats, setTransactionStats] = useState<any>(null);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);
    const [transactionError, setTransactionError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalTransactions, setTotalTransactions] = useState<number>(0);
    const [isOffline, setIsOffline] = useState<boolean>(false);
    const [fallbackWallet, setFallbackWallet] = useState<any>(null);

    // Track if we're in online or offline mode
    useEffect(() => {
        const checkOfflineStatus = () => {
            const offline = !getConnectionStatus();
            setIsOffline(offline);
        };

        checkOfflineStatus();

        // Periodically check online status
        const interval = setInterval(checkOfflineStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    // Get fallback wallet if needed
    useEffect(() => {
        const getFallbackWallet = async () => {
            if (!wallet && !isRefreshingWallet) {
                try {
                    const fallback = await walletService.getFallbackWallet();
                    setFallbackWallet(fallback);
                } catch (error) {
                    console.error("Error getting fallback wallet:", error);
                }
            }
        };

        getFallbackWallet();
    }, [wallet, isRefreshingWallet]);

    useEffect(() => {
        if (isAuthenticated) {
            loadTransactions(1);
            loadTransactionStats();
        }
    }, [isAuthenticated, isOffline]);

    const loadTransactions = async (page: number) => {
        if (!isAuthenticated) return;

        setIsLoadingTransactions(true);
        setTransactionError(null);

        try {
            // Use API if online, otherwise use local data
            let result;
            if (!isOffline && wallet) {
                result = await walletService.getWalletTransactions(page);
            } else {
                // Use fallback wallet
                const currentWallet = wallet || fallbackWallet || await walletService.getFallbackWallet();
                result = walletService.getFallbackTransactions(page);
            }

            setTransactions(result.transactions);
            setCurrentPage(result.page);
            setTotalPages(result.pages);
            setTotalTransactions(result.total);
        } catch (error: any) {
            console.error('Error loading transactions:', error);
            setTransactionError(error.message || 'Failed to load transactions');

            // Try to use fallback transactions
            try {
                const fallbackResult = walletService.getFallbackTransactions(page);
                setTransactions(fallbackResult.transactions);
                setCurrentPage(fallbackResult.page);
                setTotalPages(fallbackResult.pages);
                setTotalTransactions(fallbackResult.total);
                setTransactionError(null);
            } catch (fallbackError) {
                console.error('Error loading fallback transactions:', fallbackError);
            }
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    const loadTransactionStats = async () => {
        if (!isAuthenticated) return;

        try {
            let stats;
            if (!isOffline && wallet) {
                stats = await walletService.getTransactionSummary();
            } else {
                // Use fallback wallet
                const currentWallet = wallet || fallbackWallet || await walletService.getFallbackWallet();
                stats = walletService.calculateTransactionSummary(currentWallet);
            }

            setTransactionStats(stats);
        } catch (error) {
            console.error('Error loading transaction stats:', error);

            // Try to calculate stats from fallback wallet
            try {
                const currentWallet = wallet || fallbackWallet || await walletService.getFallbackWallet();
                const fallbackStats = walletService.calculateTransactionSummary(currentWallet);
                setTransactionStats(fallbackStats);
            } catch (fallbackError) {
                console.error('Error calculating fallback stats:', fallbackError);
            }
        }
    };

    const handlePageChange = (page: number) => {
        loadTransactions(page);
    };

    const handleRefresh = async () => {
        await refreshWallet();
        await loadTransactions(currentPage);
        await loadTransactionStats();

        // Also refresh bookings since they're related to wallet transactions
        await loadBookings(1);
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Display wallet loading state
    if (isRefreshingWallet && !wallet && !fallbackWallet) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Loading wallet information...
                </p>
            </div>
        );
    }

    // Use fallback wallet if main wallet is not available
    const displayWallet = wallet || fallbackWallet;

    // Still loading and no fallback
    if (!user || !displayWallet) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader size="lg" />
                <p className="ml-3 text-gray-600 dark:text-gray-400">Loading user profile...</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                My Profile
            </h1>

            {isOffline && (
                <div className="mb-6 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-yellow-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Offline Mode
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                <p>
                                    You're currently in offline mode. Some features may be limited, and changes will be stored locally until connection is restored.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Name
                                </p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {user.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Email
                                </p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {user.email}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Wallet</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefresh}
                                    isLoading={isRefreshingWallet}
                                >
                                    {isRefreshingWallet ? 'Refreshing...' : 'Refresh'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {walletError && (
                                <div className="mb-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                                    <p className="text-sm text-red-800 dark:text-red-200">{walletError}</p>
                                </div>
                            )}

                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Current Balance
                                    </p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(displayWallet.balance)}
                                    </p>

                                    {isOffline && (
                                        <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                                            Using locally stored wallet data
                                        </p>
                                    )}
                                </div>

                                {transactionStats && (
                                    <div className="text-right">
                                        <div className="flex space-x-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</p>
                                                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                                    {formatCurrency(transactionStats.totalSpent)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Received</p>
                                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                    {formatCurrency(transactionStats.totalReceived)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                    Transaction History
                                </h3>

                                {isLoadingTransactions && transactions.length === 0 ? (
                                    <div className="flex h-32 items-center justify-center">
                                        <Loader size="md" />
                                    </div>
                                ) : transactionError ? (
                                    <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                                        <p className="text-sm text-red-800 dark:text-red-200">{transactionError}</p>
                                    </div>
                                ) : transactions.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                                    <th className="whitespace-nowrap py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                        Date
                                                    </th>
                                                    <th className="whitespace-nowrap py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                        Description
                                                    </th>
                                                    <th className="whitespace-nowrap py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map((transaction, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-gray-200 dark:border-gray-700"
                                                    >
                                                        <td className="whitespace-nowrap py-3 text-sm text-gray-700 dark:text-gray-300">
                                                            {walletService.formatTransactionDate(transaction.date.toString())}
                                                        </td>
                                                        <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                                                            {transaction.description}
                                                        </td>
                                                        <td
                                                            className={`whitespace-nowrap py-3 text-sm font-medium ${transaction.type === 'credit'
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                                }`}
                                                        >
                                                            {transaction.type === 'credit' ? '+' : '-'}
                                                            {formatCurrency(transaction.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="mt-4">
                                                <Pagination
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={handlePageChange}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No transactions found.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;