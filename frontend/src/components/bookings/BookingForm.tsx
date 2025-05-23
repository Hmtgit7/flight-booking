// src/components/bookings/BookingForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { bookingService } from '../../services/booking-service';
import { formatDate, formatTime, getDurationFromMinutes } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import { bookingSchema } from '../../utils/validation';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/Card';
import Modal from '../ui/Modal';

type BookingFormValues = z.infer<typeof bookingSchema>;

const BookingForm: React.FC = () => {
    const { selectedFlight } = useBooking();
    const { wallet, refreshWallet } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            flightId: selectedFlight?._id || '',
            passengers: [{ name: '', age: 30, gender: 'male' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'passengers',
    });

    // Update form when selectedFlight changes
    useEffect(() => {
        if (selectedFlight && selectedFlight._id) {
            reset({
                flightId: selectedFlight._id,
                passengers: [{ name: '', age: 30, gender: 'male' }],
            });
        }
    }, [selectedFlight, reset]);

    // Make sure we have the latest wallet data
    useEffect(() => {
        if (!wallet) {
            refreshWallet();
        }
    }, [wallet, refreshWallet]);

    const handleAddPassenger = () => {
        append({ name: '', age: 30, gender: 'male' });
    };

    const onSubmit = async (data: BookingFormValues) => {
        if (!selectedFlight) {
            navigate('/search');
            return;
        }

        setIsSubmitting(true);
        setBookingError('');

        try {
            // Ensure we have an up-to-date wallet balance before booking
            await refreshWallet();

            // Validate if we have sufficient balance
            const totalPrice = selectedFlight.currentPrice * data.passengers.length;
            if ((wallet?.balance || 0) < totalPrice) {
                throw new Error('Insufficient wallet balance for this booking');
            }

            console.log("Submitting booking with data:", {
                ...data,
                flightId: selectedFlight._id // Make sure we're using the right ID
            });

            // Create booking with the correct flight ID
            const booking = await bookingService.createBooking({
                ...data,
                flightId: selectedFlight._id
            });

            console.log("Booking created successfully:", booking);

            // Refresh wallet to reflect the new balance
            await refreshWallet();

            // Navigate to confirmation page
            navigate(`/booking/${booking._id}/confirmation`);
        } catch (error: any) {
            console.error('Error creating booking:', error);
            setBookingError(error.message || 'Failed to create booking. Please try again.');
            setShowErrorModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Redirect if no flight is selected
    if (!selectedFlight) {
        navigate('/search');
        return null;
    }

    // Calculate totals
    const totalPrice = selectedFlight.currentPrice * fields.length;
    const walletBalance = wallet?.balance || 0;
    const hasInsufficientFunds = totalPrice > walletBalance;

    return (
        <div className="mx-auto max-w-3xl">
            {/* Flight Details Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Flight Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Airline</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedFlight.airline} - {selectedFlight.flightNumber}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDate(selectedFlight.departureTime)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">From</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedFlight.departureCity} ({selectedFlight.departureCode})
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTime(selectedFlight.departureTime)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">To</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedFlight.arrivalCity} ({selectedFlight.arrivalCode})
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTime(selectedFlight.arrivalTime)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {getDurationFromMinutes(selectedFlight.duration)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Price per passenger</p>
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(selectedFlight.currentPrice)}
                                {selectedFlight.priceIncreased && (
                                    <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                                        (+10% dynamic pricing)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Passenger Details Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Passenger Details</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddPassenger}
                                disabled={fields.length >= 9}
                            >
                                Add Passenger
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="mb-6 border-b border-gray-200 pb-6 last:border-0 last:pb-0 dark:border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Passenger {index + 1}
                                    </h3>
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <Controller
                                        name={`passengers.${index}.name`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                label="Full Name"
                                                placeholder="Enter passenger's full name"
                                                error={errors.passengers?.[index]?.name?.message}
                                                {...field}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name={`passengers.${index}.age`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                label="Age"
                                                min={1}
                                                max={120}
                                                error={errors.passengers?.[index]?.age?.message}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name={`passengers.${index}.gender`}
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                label="Gender"
                                                options={[
                                                    { value: 'male', label: 'Male' },
                                                    { value: 'female', label: 'Female' },
                                                    { value: 'other', label: 'Other' },
                                                ]}
                                                error={errors.passengers?.[index]?.gender?.message}
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Pricing and Wallet Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Wallet Balance
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(walletBalance)}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => refreshWallet()}
                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
                                >
                                    Refresh balance
                                </button>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Total Price
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(totalPrice)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {fields.length} passenger{fields.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        {hasInsufficientFunds && (
                            <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                                <div className="flex">
                                    <div className="text-red-600 dark:text-red-400">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                            Insufficient wallet balance. Please reduce the number of passengers or
                                            check your wallet balance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fare breakdown */}
                        <div className="mt-6 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Base Fare ({fields.length} × {formatCurrency(selectedFlight.currentPrice)})</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Remaining Balance</span>
                                <span className={`font-medium ${walletBalance - totalPrice < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {formatCurrency(walletBalance - totalPrice)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex w-full justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/search')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || hasInsufficientFunds}
                                isLoading={isSubmitting}
                            >
                                Confirm Booking
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </form>

            {/* Error Modal */}
            <Modal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Booking Error"
            >
                <div className="space-y-4">
                    <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                        <p className="text-sm text-red-800 dark:text-red-200">
                            {bookingError}
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={() => setShowErrorModal(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BookingForm;