// src/components/flights/FlightSearchForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import AirportSearch from './AirportSearch';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { flightSearchSchema } from '../../utils/validation';

type FlightSearchFormValues = z.infer<typeof flightSearchSchema>;

interface FlightSearchFormProps {
    onSubmit: (data: FlightSearchFormValues) => void;
    isLoading?: boolean;
}

const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
    onSubmit,
    isLoading = false,
}) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<FlightSearchFormValues>({
        resolver: zodResolver(flightSearchSchema),
        defaultValues: {
            departureCity: '',
            arrivalCity: '',
            departureDate: format(new Date(), 'yyyy-MM-dd'),
            passengers: 1,
        },
    });

    const handleDepartureCityChange = (value: string, code: string) => {
        setValue('departureCity', value);
    };

    const handleArrivalCityChange = (value: string, code: string) => {
        setValue('arrivalCity', value);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800"
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <Controller
                    name="departureCity"
                    control={control}
                    render={({ field }) => (
                        <AirportSearch
                            id="departureCity"
                            name="departureCity"
                            label="From"
                            placeholder="Enter city or airport"
                            value={field.value}
                            onChange={handleDepartureCityChange}
                            error={errors.departureCity?.message}
                        />
                    )}
                />

                <Controller
                    name="arrivalCity"
                    control={control}
                    render={({ field }) => (
                        <AirportSearch
                            id="arrivalCity"
                            name="arrivalCity"
                            label="To"
                            placeholder="Enter city or airport"
                            value={field.value}
                            onChange={handleArrivalCityChange}
                            error={errors.arrivalCity?.message}
                        />
                    )}
                />

                <Controller
                    name="departureDate"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="date"
                            label="Departure Date"
                            error={errors.departureDate?.message}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            {...field}
                        />
                    )}
                />

                <Controller
                    name="passengers"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label="Passengers"
                            options={[
                                { value: '1', label: '1 Passenger' },
                                { value: '2', label: '2 Passengers' },
                                { value: '3', label: '3 Passengers' },
                                { value: '4', label: '4 Passengers' },
                                { value: '5', label: '5 Passengers' },
                                { value: '6', label: '6 Passengers' },
                                { value: '7', label: '7 Passengers' },
                                { value: '8', label: '8 Passengers' },
                                { value: '9', label: '9 Passengers' },
                            ]}
                            error={errors.passengers?.message}
                            {...field}
                            value={field.value.toString()}
                            onChange={(value) => field.onChange(parseInt(value))}
                        />
                    )}
                />
            </div>

            <div className="mt-6">
                <Button type="submit" isLoading={isLoading} fullWidth>
                    Search Flights
                </Button>
            </div>
        </form>
    );
};

export default FlightSearchForm;