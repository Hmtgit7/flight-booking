// src/pages/ProfilePage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

const ProfilePage: React.FC = () => {
    const { isAuthenticated, user, wallet } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!user || !wallet) {
        return <div>Loading...</div>;
    }

    // Get recent transactions (last 5)
    const recentTransactions = [...wallet.transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

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
                                <Button variant="outline" size="sm">
                                    View All Transactions
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Current Balance
                                    </p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(wallet.balance)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                    Recent Transactions
                                </h3>
                                {recentTransactions.length > 0 ? (
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
                                                {recentTransactions.map((transaction, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-gray-200 dark:border-gray-700"
                                                    >
                                                        <td className="whitespace-nowrap py-3 text-sm text-gray-700 dark:text-gray-300">
                                                            {new Date(transaction.date).toLocaleDateString()}
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
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No recent transactions.
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
