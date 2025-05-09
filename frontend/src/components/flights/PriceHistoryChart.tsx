// frontend/src/components/flights/PriceHistoryChart.tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { priceService, PricePoint } from '../../services/price-service';
import { formatCurrency } from '../../utils/format';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import Loader from '../ui/Loader';

interface PriceHistoryChartProps {
    departureCode: string;
    arrivalCode: string;
    departureDate: string;
    currentPrice: number;
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
    departureCode,
    arrivalCode,
    departureDate,
    currentPrice
}) => {
    const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPriceHistory = async () => {
            try {
                setLoading(true);
                const history = await priceService.getPriceHistory(
                    departureCode,
                    arrivalCode,
                    departureDate
                );

                // Add current price to the end
                const today = new Date().toISOString().split('T')[0];
                history.push({
                    date: today,
                    price: currentPrice
                });

                setPriceHistory(history);
            } catch (error) {
                console.error('Error fetching price history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPriceHistory();
    }, [departureCode, arrivalCode, departureDate, currentPrice]);

    // Format date for x-axis
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-md bg-white p-2 shadow-md dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(label)}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                        Price: {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }

        return null;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Price History</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader size="md" />
                    </div>
                ) : (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={priceHistory}
                                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    tick={{ fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickFormatter={(value) => `₹${value}`}
                                    tick={{ fontSize: 12 }}
                                    width={60}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "#3b82f6" }}
                                    activeDot={{ r: 6, fill: "#2563eb" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PriceHistoryChart;