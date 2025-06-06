import API from "./api";
import type {Transaction} from "../types";

export const fetchAllTransactions = () => API.get<Transaction[]>("/api/transactions");
export const addTransaction = (data: Omit<Transaction, "_id" | "user">) => API.post("/api/transactions", data);
export const deleteTransaction = (id: string) => API.delete(`/api/transactions/${id}`);
export const updateTransaction = (id: string, data: Partial<Omit<Transaction, "_id" | "user">>) =>
    API.put(`/api/transactions/${id}`, data);