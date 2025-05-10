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
import Pagination from '../components/flights/Pagination';

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

    useEffect(() => {
        if (isAuthenticated) {
            loadTransactions(1);
            loadTransactionStats();
        }
    }, [isAuthenticated]);

    const loadTransactions = async (page: number) => {
        if (!isAuthenticated) return;

        setIsLoadingTransactions(true);
        setTransactionError(null);

        try {
            const result = await walletService.getWalletTransactions(page);
            setTransactions(result.transactions);
            setCurrentPage(result.page);
            setTotalPages(result.pages);
            setTotalTransactions(result.total);
        } catch (error: any) {
            setTransactionError(error.message || 'Failed to load transactions');
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    const loadTransactionStats = async () => {
        if (!isAuthenticated) return;

        try {
            const stats = await walletService.getTransactionSummary();
            setTransactionStats(stats);
        } catch (error) {
            console.error('Error loading transaction stats:', error);
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

    if (!user || !wallet) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                My Profile
            </h1>

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
                                    Refresh
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
                                        {formatCurrency(wallet.balance)}
                                    </p>
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