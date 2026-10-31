// Entity types

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  _id: string;
  name: string;
  type: 'debit' | 'credit' | null;
  icon: string | null;
  color: string | null;
  user_id: string;
}

export interface Transaction {
  _id: string;
  type: 'debit' | 'credit';
  amount: number;
  category_id: string;
  description: string | null;
  user_id: string;
  created_at: string;
}

export interface Budget {
  _id: string;
  month: string;
  limit: number;
  user_id: string;
}

export interface FinancialSummary {
  total_expenses: number;
  total_credits: number;
  expense_count: number;
  credit_count: number;
  transaction_count: number;
  average_expense: number;
  average_credit: number;
  net_cash_flow: number;
  savings_rate: number | null;
}

export interface CategoryBreakdownItem {
  category_id: string;
  category_name: string;
  icon: string | null;
  color: string | null;
  total_amount: number;
  transaction_count: number;
  average_amount: number;
  percentage: number;
}

export interface CashFlowTrend {
  month: string;
  total_expenses: number;
  total_credits: number;
  net_cash_flow: number;
  transaction_count: number;
}

export interface Report {
  period: { start_date: string | null; end_date: string | null; type: 'all_time' | 'custom' };
  summary: FinancialSummary;
  expenses_by_category: CategoryBreakdownItem[];
  credits_by_category: CategoryBreakdownItem[];
  cash_flow_trend: CashFlowTrend[];
  top_expenses: Transaction[];
  top_credits: Transaction[];
}
