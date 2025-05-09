// frontend/src/services/price-service.ts
export interface PricePoint {
  date: string;
  price: number;
}

export const priceService = {
  // This is a mock service that returns simulated price history
  async getPriceHistory(
    departureCode: string,
    arrivalCode: string,
    departureDate: string
  ): Promise<PricePoint[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate random price history for the past 7 days
        const priceHistory: PricePoint[] = [];
        const basePrice = 7000 + Math.random() * 3000;
        const endDate = new Date(departureDate);

        // Generate prices for 7 days before the departure date
        for (let i = 7; i >= 0; i--) {
          const date = new Date(endDate);
          date.setDate(date.getDate() - i);

          // Add some randomness to the price
          const randomFactor = 0.9 + Math.random() * 0.3; // 0.9 to 1.2
          const price = Math.round(basePrice * randomFactor);

          priceHistory.push({
            date: date.toISOString().split("T")[0],
            price,
          });
        }

        resolve(priceHistory);
      }, 500);
    });
  },
};
