
import { supabase } from '@/integrations/supabase/client';
import { Currency } from '@/lib/utils';

export interface Income {
  id: number;
  description: string;
  date: Date;
  amount: number;
  type: string;
  client?: string;
  paymentMethod: string;
  receipt?: string;
  notes?: string;
  currency: Currency;
}

export interface Expense {
  id: number;
  description: string;
  date: Date;
  amount: number;
  category: string;
  paymentMethod: string;
  receipt?: string;
  notes?: string;
  currency: Currency;
}

export interface CashFlowItem {
  id: number;
  date: Date;
  description: string;
  type: 'Ingreso' | 'Gasto';
  category: string;
  paymentMethod: string;
  amount: number;
  isRecurring?: boolean;
  isScheduled?: boolean;
  client?: string;
  balance?: number;
  currency: Currency;
}

// Income functions
export async function getIncomes(): Promise<Income[]> {
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching incomes:', error);
    throw error;
  }

  // Convert date strings to Date objects
  return data.map(income => ({
    ...income,
    date: new Date(income.date)
  })) || [];
}

export async function addIncome(income: Omit<Income, 'id'>): Promise<Income> {
  const { data, error } = await supabase
    .from('incomes')
    .insert([
      {
        ...income,
        date: income.date.toISOString().split('T')[0]
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding income:', error);
    throw error;
  }

  return {
    ...data,
    date: new Date(data.date)
  };
}

// Expenses functions
export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }

  // Convert date strings to Date objects
  return data.map(expense => ({
    ...expense,
    date: new Date(expense.date)
  })) || [];
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert([
      {
        ...expense,
        date: expense.date.toISOString().split('T')[0]
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding expense:', error);
    throw error;
  }

  return {
    ...data,
    date: new Date(data.date)
  };
}

// Combined cash flow functions
export async function getCashFlow(): Promise<CashFlowItem[]> {
  // Get incomes
  const { data: incomesData, error: incomesError } = await supabase
    .from('incomes')
    .select('*')
    .order('date', { ascending: false });

  if (incomesError) {
    console.error('Error fetching incomes for cash flow:', incomesError);
    throw incomesError;
  }

  // Get expenses
  const { data: expensesData, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (expensesError) {
    console.error('Error fetching expenses for cash flow:', expensesError);
    throw expensesError;
  }

  // Convert incomes to cash flow items
  const incomeItems: CashFlowItem[] = (incomesData || []).map(income => ({
    id: income.id,
    date: new Date(income.date),
    description: income.description,
    type: 'Ingreso',
    category: income.type,
    paymentMethod: income.paymentMethod,
    amount: income.amount,
    client: income.client,
    currency: income.currency,
  }));

  // Convert expenses to cash flow items
  const expenseItems: CashFlowItem[] = (expensesData || []).map(expense => ({
    id: expense.id,
    date: new Date(expense.date),
    description: expense.description,
    type: 'Gasto',
    category: expense.category,
    paymentMethod: expense.paymentMethod,
    amount: expense.amount,
    currency: expense.currency,
  }));

  // Combine and sort by date (newest first)
  const combined = [...incomeItems, ...expenseItems].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  // Calculate running balance
  let balance = 0;
  return combined.map(item => {
    balance += item.type === 'Ingreso' ? item.amount : -item.amount;
    return { ...item, balance };
  }).reverse(); // Reverse to get oldest first for balance calculation
}

export async function getMonthlyData() {
  const { data, error } = await supabase
    .rpc('get_monthly_summary');

  if (error) {
    console.error('Error fetching monthly data:', error);
    throw error;
  }

  return data || [];
}

export async function getCategoryExpenses() {
  const { data, error } = await supabase
    .rpc('get_expense_by_category');

  if (error) {
    console.error('Error fetching category expenses:', error);
    throw error;
  }

  return data || [];
}

export async function getClientIncomes() {
  const { data, error } = await supabase
    .rpc('get_income_by_client');

  if (error) {
    console.error('Error fetching client incomes:', error);
    throw error;
  }

  return data || [];
}
