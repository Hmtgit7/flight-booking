// src/types/wallet.ts
export interface Transaction {
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: Date | string;
}

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  transactions: Transaction[];
}
