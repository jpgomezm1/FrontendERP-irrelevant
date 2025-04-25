
import { supabase } from '@/integrations/supabase/client';
import { Currency } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';
import { getCausedExpenses, CausedExpense } from '@/services/expenseService';

type DbIncome = Database['public']['Tables']['incomes']['Row'];

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

  return data.map(income => ({
    id: income.id,
    description: income.description,
    date: new Date(income.date),
    amount: income.amount,
    type: income.type,
    client: income.client || undefined,
    paymentMethod: income.paymentmethod,
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
      paymentmethod: income.paymentMethod,
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

export async function getCashFlow(): Promise<CashFlowItem[]> {
  const { data: incomesData, error: incomesError } = await supabase
    .from('incomes')
    .select('*')
    .order('date', { ascending: false });

  if (incomesError) {
    console.error('Error fetching incomes for cash flow:', incomesError);
    throw incomesError;
  }

  // Get expenses from our new service
  const causedExpensesData = await getCausedExpenses();

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

  // Convert caused expenses to cash flow items
  const expenseItems: CashFlowItem[] = causedExpensesData.map(expense => ({
    id: expense.id,
    date: expense.date,
    description: expense.description,
    type: 'Gasto',
    category: expense.category,
    paymentMethod: expense.paymentMethod,
    amount: expense.amount,
    isRecurring: expense.sourceType === 'recurrente',
    currency: expense.currency,
  }));

  // Combine and sort
  const combined = [...incomeItems, ...expenseItems].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  // Calculate running balance
  let balance = 0;
  return combined.map(item => {
    balance += item.type === 'Ingreso' ? item.amount : -item.amount;
    return { ...item, balance };
  }).reverse();
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

// This function is no longer needed as we use getCausedExpenses from expenseService
export async function getAccruedExpenses(): Promise<CausedExpense[]> {
  return getCausedExpenses();
}
