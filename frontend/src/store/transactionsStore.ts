import { create } from "zustand";
import { api } from "../api";

export type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
};

export type Transaction = {
  id: number;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
  category: Category;
};

type TransactionData = {
  amount: number;
  description: string;
  categoryId: number;
  date: string;
};

type Filters = {
  categoryId?: string;
  from?: string;
  to?: string;
};

type TransactionStore = {
  transactions: Transaction[];

  loadTransactions: (filters?: Filters) => Promise<void>;

  addTransaction: (data: TransactionData) => Promise<void>;

  updateTransaction: (id: number, data: TransactionData) => Promise<void>;

  deleteTransaction: (id: number) => Promise<void>;
};

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],

  loadTransactions: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.categoryId) {
      params.append("categoryId", filters.categoryId);
    }

    if (filters.from) {
      params.append("from", filters.from);
    }

    if (filters.to) {
      params.append("to", filters.to);
    }

    const query = params.toString();

    const response = await api.get(
      query ? `/transactions?${query}` : "/transactions",
    );

    set({
      transactions: response.data,
    });
  },

  addTransaction: async (data) => {
    await api.post("/transactions", data);

    await get().loadTransactions();
  },

  updateTransaction: async (id, data) => {
    await api.put(`/transactions/${id}`, data);

    await get().loadTransactions();
  },

  deleteTransaction: async (id) => {
    await api.delete(`/transactions/${id}`);

    await get().loadTransactions();
  },
}));
