// src/utils/validation.ts
// Form validation utilities
import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const flightSearchSchema = z.object({
  departureCity: z.string().min(1, "Please select a departure city"),
  arrivalCity: z.string().min(1, "Please select an arrival city"),
  departureDate: z.string().min(1, "Please select a departure date"),
  passengers: z
    .number()
    .int()
    .min(1, "Please select at least 1 passenger")
    .max(9, "Maximum 9 passengers allowed"),
});

export const passengerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z
    .number()
    .int()
    .min(1, "Age must be at least 1")
    .max(120, "Age must be less than 120"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
});

export const bookingSchema = z.object({
  flightId: z.string().min(1, "Flight ID is required"),
  passengers: z
    .array(passengerSchema)
    .min(1, "At least one passenger is required"),
});
