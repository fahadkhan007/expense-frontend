import client from './client';
import type { Category } from '../types';

export const getCategories = () =>
  client.get<Category[]>('/categories/').then((r) => r.data);

export const createCategory = (data: { name: string; type: string | null; icon: string; color: string }) =>
  client.post<Category>('/categories/', data).then((r) => r.data);

export const deleteCategory = (id: string) =>
  client.delete(`/categories/${id}`);
