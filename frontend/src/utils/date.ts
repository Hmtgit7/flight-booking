// src/utils/date.ts
// Date formatting and manipulation utilities
import {
  format,
  addDays,
  differenceInMinutes,
} from "date-fns";

export const formatDate = (date: Date | string): string => {
  return format(new Date(date), "MMM dd, yyyy");
};

export const formatTime = (date: Date | string): string => {
  return format(new Date(date), "hh:mm a");
};

export const formatDateTime = (date: Date | string): string => {
  return format(new Date(date), "MMM dd, yyyy hh:mm a");
};

export const getNextNDays = (n: number): Date[] => {
  const today = new Date();
  const days: Date[] = [];

  for (let i = 0; i < n; i++) {
    days.push(addDays(today, i));
  }

  return days;
};

export const getDurationString = (
  departureTime: Date | string,
  arrivalTime: Date | string
): string => {
  const deptTime = new Date(departureTime);
  const arrTime = new Date(arrivalTime);

  const minutes = differenceInMinutes(arrTime, deptTime);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
};

export const getDurationFromMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
};
