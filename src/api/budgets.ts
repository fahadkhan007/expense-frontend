import client from './client';
import type { Budget } from '../types';

export const getBudgets = () =>
  client.get<Budget[]>('/budgets/').then((r) => r.data);

export const createBudget = (data: { month: string; limit: number }) =>
  client.post<Budget>('/budgets/', data).then((r) => r.data);

export const updateBudget = (id: string, data: { limit: number }) =>
  client.patch<Budget>(`/budgets/${id}`, data).then((r) => r.data);

export const deleteBudget = (id: string) =>
  client.delete(`/budgets/${id}`);
