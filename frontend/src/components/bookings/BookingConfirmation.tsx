// src/components/bookings/BookingConfirmation.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../../services/booking-service';
import { pdfService } from '../../services/pdf-service';
import { Booking, TicketData } from '../../types/booking';
import { formatDate, formatTime, getDurationFromMinutes } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import Button from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/Card';
import Loader from '../ui/Loader';

const BookingConfirmation: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [ticket, setTicket] = useState<TicketData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                if (!id) return;

                const bookingData = await bookingService.getBookingById(id);
                setBooking(bookingData);

                const ticketData = await bookingService.generateTicket(id);
                setTicket(ticketData);
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    const handleDownloadTicket = async () => {
        if (!ticket) return;

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

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (!booking || !ticket) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Booking not found
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    The booking you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Link to="/bookings" className="mt-4 inline-block">
                    <Button>Go to My Bookings</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-green-600 dark:text-green-400"
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
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Booking Confirmed!
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                    Your booking has been confirmed. Here are your booking details.
                </p>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Booking Reference (PNR)
                            </dt>
                            <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                {ticket.pnr}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Booking Date
                            </dt>
                            <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDate(ticket.bookingDate)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total Amount
                            </dt>
                            <dd className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(ticket.totalAmount)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Status
                            </dt>
                            <dd className="text-lg font-semibold text-green-600 dark:text-green-400">
                                Confirmed
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Flight Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Airline
                                </dt>
                                <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {ticket.airline} - {ticket.flightNumber}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Date
                                </dt>
                                <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formatDate(ticket.departureTime)}
                                </dd>
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
                            </div>

                            <div className="mx-4 flex-1">
                                <div className="flex items-center">
                                    <div className="h-1 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                    <div className="flex-1 border-t border-dashed border-gray-300 dark:border-gray-600"></div>
                                    <div className="h-1 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                </div>
                                <div className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
                                    {getDurationFromMinutes(ticket.duration)}
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
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Passenger Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="whitespace-nowrap py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        Name
                                    </th>
                                    <th className="whitespace-nowrap py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        Age
                                    </th>
                                    <th className="whitespace-nowrap py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        Gender
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
                                            {passenger.age}
                                        </td>
                                        <td className="whitespace-nowrap py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {passenger.gender.charAt(0).toUpperCase() + passenger.gender.slice(1)}
                                        </td>
                                        <td className="whitespace-nowrap py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {passenger.seat}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full justify-end space-x-4">
                        <Link to="/bookings">
                            <Button variant="outline">My Bookings</Button>
                        </Link>
                        <Button
                            onClick={handleDownloadTicket}
                            isLoading={isGeneratingPdf}
                        >
                            Download Ticket
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default BookingConfirmation;