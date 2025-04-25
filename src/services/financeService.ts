
import { supabase } from '@/integrations/supabase/client';
import { Currency } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type DbIncome = Database['public']['Tables']['incomes']['Row'];
type DbExpense = Database['public']['Tables']['expenses']['Row'];

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

export async function getIncomes(): Promise<Income[]> {
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching incomes:', error);
    throw error;
  }

  // Convert date strings to Date objects and map db fields
  return data.map(income => ({
    id: income.id,
    description: income.description,
    date: new Date(income.date),
    amount: income.amount,
    type: income.type,
    client: income.client || undefined,
    paymentMethod: income.paymentmethod, // Map from DB field
    receipt: income.receipt || undefined,
    notes: income.notes || undefined,
    currency: income.currency as Currency
  })) || [];
}

export async function addIncome(income: Omit<Income, 'id'>): Promise<Income> {
  const { data, error } = await supabase
    .from('incomes')
    .insert([{
      description: income.description,
      date: income.date.toISOString().split('T')[0],
      amount: income.amount,
      type: income.type,
      client: income.client,
      paymentmethod: income.paymentMethod, // Map to DB field
      receipt: income.receipt,
      notes: income.notes,
      currency: income.currency
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding income:', error);
    throw error;
  }

  return {
    id: data.id,
    description: data.description,
    date: new Date(data.date),
    amount: data.amount,
    type: data.type,
    client: data.client || undefined,
    paymentMethod: data.paymentmethod,
    receipt: data.receipt || undefined,
    notes: data.notes || undefined,
    currency: data.currency as Currency
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

  // Convert date strings to Date objects and map db fields
  return data.map(expense => ({
    id: expense.id,
    description: expense.description,
    date: new Date(expense.date),
    amount: expense.amount,
    category: expense.category,
    paymentMethod: expense.paymentmethod, // Map from DB field
    receipt: expense.receipt || undefined,
    notes: expense.notes || undefined,
    currency: expense.currency as Currency
  })) || [];
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert([
      {
        description: expense.description,
        date: expense.date.toISOString().split('T')[0],
        amount: expense.amount,
        category: expense.category,
        paymentmethod: expense.paymentMethod, // Map to DB field
        receipt: expense.receipt,
        notes: expense.notes,
        currency: expense.currency
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding expense:', error);
    throw error;
  }

  return {
    id: data.id,
    description: data.description,
    date: new Date(data.date),
    amount: data.amount,
    category: data.category,
    paymentMethod: data.paymentmethod,
    receipt: data.receipt || undefined,
    notes: data.notes || undefined,
    currency: data.currency as Currency
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
    paymentMethod: income.paymentmethod,
    amount: income.amount,
    client: income.client || undefined,
    currency: income.currency as Currency,
  }));

  // Convert expenses to cash flow items
  const expenseItems: CashFlowItem[] = (expensesData || []).map(expense => ({
    id: expense.id,
    date: new Date(expense.date),
    description: expense.description,
    type: 'Gasto',
    category: expense.category,
    paymentMethod: expense.paymentmethod,
    amount: expense.amount,
    currency: expense.currency as Currency,
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
