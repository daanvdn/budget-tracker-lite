export enum TransactionType {
  EXPENSE = 'expense',
  INCOME = 'income'
}

export enum CategoryType {
  EXPENSE = 'expense',
  INCOME = 'income',
  BOTH = 'both'
}

export interface User {
  id: number;
  name: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
}

export interface Beneficiary {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  transaction_date: string;
  image_path?: string;
  notes?: string;
  tags?: string[];
  category_id: number;
  beneficiary_id: number;
  created_by_user_id: number;
  created_at: string;
  category: Category;
  beneficiary: Beneficiary;
  created_by_user: User;
}

export interface TransactionCreate {
  type: TransactionType;
  amount: number;
  description: string;
  transaction_date: string;
  category_id: number;
  beneficiary_id: number;
  created_by_user_id: number;
  image_path?: string;
  notes?: string;
  tags?: string[];
}

export interface AggregationSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  transaction_count: number;
}
