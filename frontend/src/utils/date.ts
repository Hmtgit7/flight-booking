// frontend/src/utils/date.ts
import { format, addDays, differenceInMinutes } from "date-fns";

export const formatDate = (date: Date | string): string => {
  try {
    return format(new Date(date), "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

export const formatTime = (date: Date | string): string => {
  try {
    return format(new Date(date), "hh:mm a");
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid time";
  }
};

export const formatDateTime = (date: Date | string): string => {
  try {
    return format(new Date(date), "MMM dd, yyyy hh:mm a");
  } catch (error) {
    console.error("Error formatting date time:", error);
    return "Invalid date/time";
  }
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
  try {
    const deptTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);

    const minutes = differenceInMinutes(arrTime, deptTime);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "Invalid duration";
  }
};

export const getDurationFromMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
};
