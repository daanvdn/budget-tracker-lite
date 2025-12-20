export interface Transaction {
  id?: number;
  amount: number;
  date: string;
  description?: string;
  type: 'expense' | 'income';
  category_id: number;
  beneficiary_id: number;
  user_id: number;
  image_path?: string;
}

export interface Category {
  id?: number;
  name: string;
  type: 'expense' | 'income' | 'both';
}

export interface Beneficiary {
  id?: number;
  name: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
}

export interface AggregationSummary {
  total_income: number;
  total_expenses: number;
  net_total: number;
  by_category: CategoryTotal[];
  by_beneficiary: BeneficiaryTotal[];
}

export interface CategoryTotal {
  category_id: number;
  category_name: string;
  total: number;
}

export interface BeneficiaryTotal {
  beneficiary_id: number;
  beneficiary_name: string;
  total: number;
}
