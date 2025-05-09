// src/utils/format.ts
// Formatting utilities for numbers, currency, etc.

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const formatNumber = (number: number): string => {
  return number.toLocaleString("en-IN");
};
