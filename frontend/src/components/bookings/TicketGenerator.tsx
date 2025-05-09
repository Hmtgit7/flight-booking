// src/components/bookings/TicketGenerator.tsx
import React, { useState } from 'react';
import { TicketData } from '../../types/booking';
import { formatDate, formatTime } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { pdfService } from '../../services/pdf-service';

interface TicketGeneratorProps {
    ticket: TicketData;
}

const TicketGenerator: React.FC<TicketGeneratorProps> = ({ ticket }) => {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

    const handleDownloadTicket = async () => {
        setIsGeneratingPdf(true);
        try {
            const pdfBytes = await pdfService.generateTicketPDF(ticket);

            // Create a blob from the PDF bytes
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // Create a temporary link and click it to download
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket-${ticket.pnr}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Release the object URL
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <Card className="mb-6 overflow-hidden">
            <CardHeader className="bg-blue-600 text-white dark:bg-blue-800">
                <CardTitle className="text-center">E-Ticket</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Passenger Name
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {ticket.passengers[0].name}
                                {ticket.passengers.length > 1 ? ` +${ticket.passengers.length - 1} more` : ''}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Booking Reference (PNR)
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {ticket.pnr}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                    <div className="mb-4">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {ticket.airline} - {ticket.flightNumber}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(ticket.departureTime)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatTime(ticket.departureTime)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {ticket.departureCode}
                            </div>
                            <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                {ticket.departureCity}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {ticket.departureAirport}
                            </div>
                        </div>

                        <div className="mx-4 flex-1">
                            <div className="flex items-center">
                                <div className="h-1 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                <div className="flex-1 border-t border-dashed border-gray-300 dark:border-gray-600"></div>
                                <div className="h-1 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                            </div>
                            <div className="flex justify-center">
                                <div className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-1 h-3 w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                        />
                                    </svg>
                                    {ticket.aircraft}
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatTime(ticket.arrivalTime)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {ticket.arrivalCode}
                            </div>
                            <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                {ticket.arrivalCity}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {ticket.arrivalAirport}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Passenger Information
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="whitespace-nowrap py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        Name
                                    </th>
                                    <th className="whitespace-nowrap py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        Seat
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {ticket.passengers.map((passenger, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-200 dark:border-gray-700"
                                    >
                                        <td className="whitespace-nowrap py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {passenger.name}
                                        </td>
                                        <td className="whitespace-nowrap py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {passenger.seat}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total Amount
                            </p>
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(ticket.totalAmount)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Booking Date
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDate(ticket.bookingDate)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleDownloadTicket}
                    isLoading={isGeneratingPdf}
                    fullWidth
                >
                    Download Ticket
                </Button>
            </CardFooter>
        </Card>
    );
};

export default TicketGenerator;