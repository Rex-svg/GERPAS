export type TransactionType = "Expense" | "Income";

export interface FinancialTransaction {
  id: string;
  factory_id: string;
  transaction_no?: string | null;
  transaction_date: string;
  transaction_type: TransactionType;
  category: string;
  amount: number;
  notes?: string | null;
  purchase_order_id?: string | null;
  order_id?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface TransactionCategory {
  id: string;
  factory_id: string;
  name: string;
  transaction_type: TransactionType;
}

// Backward-compatible aliases for frontend pages
// These match the shapes returned by the API route field mappings
export interface Expense extends FinancialTransaction {
  expense_date: string;
  description?: string | null;
  payment_method: string;
}

export interface Income extends FinancialTransaction {
  source: string;
  income_date: string;
  description?: string | null;
}

export interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  payment_date: string;
  created_at: string;
  supplier_id?: string | null;
  purchase_order_id?: string | null;
  employee_id?: string | null;
  employee?: { full_name: string; employee_code: string } | null;
}
