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
  frequency?: string;
  isRecurring?: boolean;
  nextDueDate?: Date;
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

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }

  return data.map(expense => ({
    id: expense.id,
    description: expense.description,
    date: new Date(expense.date),
    amount: expense.amount,
    category: expense.category,
    paymentMethod: expense.paymentmethod,
    receipt: expense.receipt || undefined,
    notes: expense.notes || undefined,
    currency: expense.currency as Currency,
    frequency: expense.frequency || undefined,
    isRecurring: expense.is_recurring || false,
    nextDueDate: expense.next_due_date ? new Date(expense.next_due_date) : undefined,
  })) || [];
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const adjustedDate = new Date(expense.date);
  adjustedDate.setUTCHours(12, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('expenses')
    .insert([
      {
        description: expense.description,
        date: adjustedDate.toISOString().split('T')[0],
        amount: expense.amount,
        category: expense.category,
        paymentmethod: expense.paymentMethod,
        receipt: expense.receipt,
        notes: expense.notes,
        currency: expense.currency,
        frequency: expense.frequency,
        is_recurring: expense.isRecurring,
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
    currency: data.currency as Currency,
    frequency: data.frequency || undefined,
    isRecurring: data.is_recurring || false,
    nextDueDate: data.next_due_date ? new Date(data.next_due_date) : undefined,
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

  const { data: expensesData, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (expensesError) {
    console.error('Error fetching expenses for cash flow:', expensesError);
    throw expensesError;
  }

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

  const combined = [...incomeItems, ...expenseItems].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

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

export async function getAccruedExpenses(): Promise<Expense[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all expenses from the database
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching accrued expenses:', error);
    throw error;
  }

  const accruedExpenses: Expense[] = [];
  
  // Process each expense
  data.forEach(expense => {
    // For non-recurring expenses, just add them as is
    if (!expense.is_recurring) {
      accruedExpenses.push({
        id: expense.id,
        description: expense.description,
        date: new Date(expense.date),
        amount: expense.amount,
        category: expense.category,
        paymentMethod: expense.paymentmethod,
        receipt: expense.receipt || undefined,
        notes: expense.notes || undefined,
        currency: expense.currency as Currency,
        frequency: expense.frequency || undefined,
        isRecurring: false,
      });
      return;
    }
    
    // For recurring expenses, we need to generate instances for each period
    const startDate = new Date(expense.date);
    startDate.setHours(0, 0, 0, 0);
    let currentDate = new Date(startDate);
    
    // Add the first occurrence
    accruedExpenses.push({
      id: expense.id,
      description: expense.description,
      date: new Date(startDate),
      amount: expense.amount,
      category: expense.category,
      paymentMethod: expense.paymentmethod,
      receipt: expense.receipt || undefined,
      notes: expense.notes || undefined,
      currency: expense.currency as Currency,
      frequency: expense.frequency || undefined,
      isRecurring: true,
    });
    
    if (!expense.frequency) return;
    
    // Calculate and add all recurring instances until today
    while (true) {
      let nextDate = new Date(currentDate);
      
      switch (expense.frequency.toLowerCase()) {
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'biweekly':
          nextDate.setDate(nextDate.getDate() + 14);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'bimonthly':
          nextDate.setMonth(nextDate.getMonth() + 2);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'semiannual':
          nextDate.setMonth(nextDate.getMonth() + 6);
          break;
        case 'annual':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        default:
          return;
      }
      
      // Stop adding instances once we reach a date beyond today
      if (nextDate > today) break;
      
      // Add this instance to accrued expenses
      accruedExpenses.push({
        id: expense.id,
        description: expense.description,
        date: new Date(nextDate),
        amount: expense.amount,
        category: expense.category,
        paymentMethod: expense.paymentmethod,
        receipt: expense.receipt || undefined,
        notes: expense.notes || undefined,
        currency: expense.currency as Currency,
        frequency: expense.frequency || undefined,
        isRecurring: true,
      });
      
      currentDate = nextDate;
    }
  });
  
  // Sort all accrued expenses by date, newest first
  return accruedExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
}
