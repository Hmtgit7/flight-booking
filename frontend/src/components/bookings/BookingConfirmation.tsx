// src/components/bookings/BookingConfirmation.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/booking-service';
import { pdfService } from '../../services/pdf-service';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { Booking, TicketData } from '../../types/booking';
import { Flight } from '../../types/flight';
import { formatDate, formatTime, getDurationFromMinutes } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import Button from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/Card';
import Loader from '../ui/Loader';
import Modal from '../ui/Modal';

const BookingConfirmation: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { refreshWallet } = useAuth();
    const { clearBooking } = useBooking();

    // State management
    const [booking, setBooking] = useState<Booking | null>(null);
    const [flight, setFlight] = useState<Flight | null>(null);
    const [ticket, setTicket] = useState<TicketData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

    // Fetch booking data
    useEffect(() => {
        const fetchBookingData = async () => {
            if (!id) {
                setError("Missing booking ID");
                setShowErrorModal(true);
                setLoading(false);
                return;
            }

            try {
                // Refresh wallet to ensure balance is up-to-date after booking
                await refreshWallet();

                // Fetch booking details from API
                console.log("Fetching booking with ID:", id);
                const bookingData = await bookingService.getBookingById(id);
                console.log("Booking data received:", bookingData);
                setBooking(bookingData);

                // Extract flight data from the booking
                if (bookingData && bookingData.flight) {
                    // The flight should be populated by the backend
                    if (typeof bookingData.flight !== 'string') {
                        setFlight(bookingData.flight);

                        // Generate ticket data from the booking and flight
                        const ticketData: TicketData = {
                            bookingId: bookingData._id,
                            pnr: bookingData.pnr,
                            airline: bookingData.flight.airline,
                            flightNumber: bookingData.flight.flightNumber,
                            departureCity: bookingData.flight.departureCity,
                            departureAirport: bookingData.flight.departureAirport,
                            departureCode: bookingData.flight.departureCode,
                            departureTime: bookingData.flight.departureTime,
                            arrivalCity: bookingData.flight.arrivalCity,
                            arrivalAirport: bookingData.flight.arrivalAirport,
                            arrivalCode: bookingData.flight.arrivalCode,
                            arrivalTime: bookingData.flight.arrivalTime,
                            duration: bookingData.flight.duration,
                            aircraft: bookingData.flight.aircraft,
                            bookingDate: bookingData.bookingDate,
                            totalAmount: bookingData.totalAmount,
                            passengers: bookingData.passengers.map((passenger, index) => ({
                                ...passenger,
                                seat: bookingData.seatNumbers[index] || "Not assigned"
                            }))
                        };
                        setTicket(ticketData);
                    } else {
                        // If flight is just an ID string, try to get the ticket from backend
                        try {
                            const ticketData = await bookingService.generateTicket(id);
                            setTicket(ticketData);
                        } catch (error) {
                            console.error('Error generating ticket:', error);
                            throw new Error("Could not load flight details");
                        }
                    }
                } else {
                    throw new Error("Invalid booking data received");
                }

                // Clear the booking context after successful confirmation
                clearBooking();
            } catch (error: any) {
                console.error('Error fetching booking:', error);
                setError(error.message || 'Unable to load booking information. Please try again.');
                setShowErrorModal(true);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingData();
    }, [id, refreshWallet, clearBooking]);

    // Handle PDF ticket download
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
        } catch (error: any) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF: ' + (error.message || 'Please try again.'));
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // Handle closing error modal
    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
        navigate('/bookings'); // Navigate back to bookings list on error
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader size="lg" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading booking details...</span>
            </div>
        );
    }

    // Error state - show modal
    if (error || !booking || !ticket) {
        return (
            <Modal
                isOpen={showErrorModal}
                onClose={handleCloseErrorModal}
                title="Error Loading Booking"
            >
                <div className="space-y-4">
                    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Booking Not Found
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    <p>
                                        {error || "We couldn't find this booking or you don't have permission to view it."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleCloseErrorModal}>
                            Go to My Bookings
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }

    // Success state - show booking confirmation
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
                    Your booking has been successfully processed. Here are your booking details.
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
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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

                        <div className="mt-6 flex flex-col md:flex-row md:items-center">
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

                            <div className="my-4 md:mx-4 md:flex-1">
                                <div className="flex items-center">
                                    <div className="h-1 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                    <div className="flex-1 border-t border-dashed border-gray-300 dark:border-gray-600"></div>
                                    <div className="h-1 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                </div>
                                <div className="mt-1 text-center">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {getDurationFromMinutes(ticket.duration)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Non-stop
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

                        <div className="mt-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-blue-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Flight Information
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                        <p>
                                            Aircraft: {ticket.aircraft} • {ticket.passengers.length} passenger{ticket.passengers.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
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
                    <div className="flex w-full flex-col space-y-3 sm:flex-row sm:justify-end sm:space-x-4 sm:space-y-0">
                        <Link to="/bookings">
                            <Button variant="outline" fullWidth>
                                View All Bookings
                            </Button>
                        </Link>
                        <Button
                            onClick={handleDownloadTicket}
                            isLoading={isGeneratingPdf}
                            fullWidth
                        >
                            {isGeneratingPdf ? 'Generating PDF...' : 'Download Ticket'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg
                            className="h-5 w-5 text-green-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                            Booking Successful
                        </h3>
                        <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                            <p>
                                Your booking has been confirmed and your wallet has been updated.
                                You can view this booking anytime from your bookings page.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;