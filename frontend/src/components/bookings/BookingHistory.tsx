// src/components/bookings/BookingHistory.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTime } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import Button from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import Loader from '../ui/Loader';
import Pagination from '../flights/Pagination';
import Modal from '../ui/Modal';

const BookingHistory: React.FC = () => {
    const { bookings, totalBookings, isLoadingBookings, bookingsError, currentPage, totalPages, loadBookings, cancelBooking, refreshBookings } = useBooking();
    const { refreshWallet } = useAuth();
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [cancellationInProgress, setCancellationInProgress] = useState<boolean>(false);
    const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
    const [cancelError, setCancelError] = useState<string | null>(null);

    // Handle page change for pagination
    const handlePageChange = (page: number) => {
        loadBookings(page);
    };

    // Handle booking cancellation
    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;

        setCancellationInProgress(true);
        setCancelSuccess(null);
        setCancelError(null);

        try {
            const success = await cancelBooking(bookingToCancel);
            if (success) {
                setCancelSuccess('Booking cancelled successfully! Your refund has been processed.');
                refreshWallet(); // Refresh wallet to show updated balance
            } else {
                setCancelError('Failed to cancel booking. Please try again.');
            }
        } catch (error: any) {
            setCancelError(error.message || 'Failed to cancel booking. Please try again.');
        } finally {
            setCancellationInProgress(false);
        }
    };

    // Handle booking refresh
    const handleRefresh = async () => {
        await refreshBookings();
    };

    if (isLoadingBookings && bookings.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (bookingsError) {
        return (
            <div className="text-center">
                <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {bookingsError}
                    </p>
                </div>
                <Button onClick={handleRefresh}>Try Again</Button>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    No bookings yet
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    You haven't made any bookings yet. Start by searching for flights.
                </p>
                <div className="mt-4">
                    <Link to="/search">
                        <Button>Search Flights</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Your Bookings ({totalBookings})
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {bookings.length} of {totalBookings} bookings
                    </p>
                </div>
                <Button variant="outline" onClick={handleRefresh} disabled={isLoadingBookings}>
                    {isLoadingBookings ? <Loader size="sm" /> : 'Refresh'}
                </Button>
            </div>

            <div className="space-y-6">
                {bookings.map((booking) => {
                    // Get flight details
                    const flight = typeof booking.flight === 'string'
                        ? null
                        : booking.flight;

                    // Check if booking is for a future date
                    const bookingDate = new Date(booking.bookingDate);
                    const now = new Date();
                    const isPastBooking = bookingDate < now;

                    // Check if flight departure is in the future (can be cancelled)
                    const canCancel = booking.status === 'confirmed' && flight &&
                        new Date(flight.departureTime) > new Date();

                    return (
                        <Card key={booking._id} className={booking.status === 'cancelled' ? 'border-red-200 dark:border-red-800' : ''}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        {flight ? `${flight.departureCity} to ${flight.arrivalCity}` : 'Flight Details Loading...'}
                                    </CardTitle>
                                    <div
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${booking.status === 'confirmed'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : booking.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}
                                    >
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Booking Reference
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {booking.pnr}
                                        </p>
                                    </div>
                                    {flight && (
                                        <>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Flight
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {flight.airline} {flight.flightNumber}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Date
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {formatDate(flight.departureTime)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Departure
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {formatTime(flight.departureTime)}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {flight.departureCity} ({flight.departureCode})
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Arrival
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {formatTime(flight.arrivalTime)}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {flight.arrivalCity} ({flight.arrivalCode})
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Total Amount
                                        </p>
                                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(booking.totalAmount)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {booking.passengers.length} passenger
                                            {booking.passengers.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end space-x-2">
                                    {canCancel && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => {
                                                setBookingToCancel(booking._id);
                                                setShowCancelModal(true);
                                            }}
                                        >
                                            Cancel Booking
                                        </Button>
                                    )}
                                    <Link to={`/booking/${booking._id}`}>
                                        <Button variant="outline" size="sm">View Details</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Cancellation Confirmation Modal */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Cancel Booking"
            >
                <div className="space-y-4">
                    {!cancelSuccess ? (
                        <>
                            <p className="text-gray-700 dark:text-gray-300">
                                Are you sure you want to cancel this booking? You will receive a refund of 90% of the booking amount to your wallet.
                            </p>
                            {cancelError && (
                                <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                                    <p className="text-sm text-red-800 dark:text-red-200">{cancelError}</p>
                                </div>
                            )}
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCancelModal(false)}
                                    disabled={cancellationInProgress}
                                >
                                    No, Keep Booking
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleCancelBooking}
                                    isLoading={cancellationInProgress}
                                >
                                    Yes, Cancel Booking
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                                <p className="text-sm text-green-800 dark:text-green-200">{cancelSuccess}</p>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => setShowCancelModal(false)}>
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default BookingHistory;