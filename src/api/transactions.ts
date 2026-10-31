import client from './client';
import type { Transaction } from '../types';

export const getTransactions = (page = 1) =>
  client.get<Transaction[]>('/transactions/', { params: { page } }).then((r) => r.data);

export const createTransaction = (data: {
  type: string;
  amount: number;
  category_id: string;
  description?: string;
}) => client.post<Transaction>('/transactions/', data).then((r) => r.data);

export const deleteTransaction = (id: string) =>
  client.delete(`/transactions/${id}`);
