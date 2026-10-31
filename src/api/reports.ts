import client from './client';
import type { Report } from '../types';

export const getReport = (params?: { start_date?: string; end_date?: string }) =>
  client.get<Report>('/reports/', { params }).then((r) => r.data);
