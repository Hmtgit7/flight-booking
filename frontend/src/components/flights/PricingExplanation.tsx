// src/components/flights/PricingExplanation.tsx
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';

const PricingExplanation: React.FC = () => {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Understanding Dynamic Pricing</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Our flight prices are dynamic and change based on several factors:
                </p>
                <ul className="ml-5 list-disc space-y-2 text-gray-700 dark:text-gray-300">
                    <li>
                        <strong>Base price:</strong> Each flight has a base price between ₹2,000-₹3,000.
                    </li>
                    <li>
                        <strong>Search behavior:</strong> If you search for the same flight 3 times in a 5-minute window, the price increases by 10%.
                    </li>
                    <li>
                        <strong>Time-based reset:</strong> Prices will revert to the original base price after 10 minutes of inactivity.
                    </li>
                </ul>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Try searching for the same flight multiple times to see this functionality in action!
                </p>
            </CardContent>
        </Card>
    );
};

export default PricingExplanation;