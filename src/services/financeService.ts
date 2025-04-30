import { supabase } from '@/integrations/supabase/client';
import { Currency } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';
import { getCausedExpenses, CausedExpense } from '@/services/expenseService';
import { MovementsFilter } from '@/hooks/use-movements';

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
  source?: string;
  sourceId?: number;
  balance?: number;
  currency: Currency;
  originalCurrency?: Currency;
  originalAmount?: number;
}

export async function getIncomes(): Promise<Income[]> {
  console.log('Fetching incomes from database');
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching incomes:', error);
    throw error;
  }

  console.log('Fetched incomes:', data);
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
  console.log('Adding income to database:', income);
  
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

  console.log('Income added successfully:', data);
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

export async function getCashFlow(filters?: MovementsFilter): Promise<CashFlowItem[]> {
  console.log('Fetching cash flow data with filters:', filters);
  
  // 1. Get all incomes from the incomes table
  const { data: incomesData, error: incomesError } = await supabase
    .from('incomes')
    .select('*')
    .order('date', { ascending: false });

  if (incomesError) {
    console.error('Error fetching incomes for cash flow:', incomesError);
    throw incomesError;
  }

  // 2. Get all paid project payments 
  const { data: paidPaymentsData, error: paymentsError } = await supabase
    .from('payments')
    .select(`
      *,
      projects (name),
      clients (name)
    `)
    .eq('status', 'Pagado')
    .order('paiddate', { ascending: false });

  if (paymentsError) {
    console.error('Error fetching paid payments for cash flow:', paymentsError);
    throw paymentsError;
  }

  // 3. Get expenses with status "pagado" (only paid expenses)
  const { data: paidExpensesData, error: expensesError } = await supabase
    .from('gastos_causados')
    .select('*')
    .eq('status', 'pagado')
    .order('date', { ascending: false });

  if (expensesError) {
    console.error('Error fetching paid expenses for cash flow:', expensesError);
    throw expensesError;
  }

  // Convert manual incomes to cash flow items
  const incomeItems: CashFlowItem[] = (incomesData || []).map(income => ({
    id: income.id,
    date: new Date(income.date),
    description: income.description,
    type: 'Ingreso',
    category: income.type,
    paymentMethod: income.paymentmethod,
    amount: income.amount,
    client: income.client || undefined,
    source: 'income', // Simplified source identifier
    sourceId: income.id,
    currency: income.currency as Currency,
    originalCurrency: income.currency as Currency,
    originalAmount: income.amount
  }));

  // Convert paid project payments to cash flow items
  const paymentItems: CashFlowItem[] = (paidPaymentsData || []).map(payment => {
    const description = `Payment for ${payment.projects?.name || 'Project'} - ${payment.type === 'Implementación' ? 
      `Implementation Fee${payment.installmentnumber ? ` (Installment ${payment.installmentnumber})` : ''}` : 
      'Recurring Fee'}`;
    
    return {
      id: payment.id + 100000, // Add offset to avoid ID collisions
      date: new Date(payment.paiddate || payment.date), // Use paid date if available
      description,
      type: 'Ingreso',
      category: payment.type === 'Implementación' ? 'Ingreso Implementación' : 'Ingreso Recurrente',
      paymentMethod: 'Transferencia', // Default payment method
      amount: payment.amount,
      client: payment.clients?.name || undefined,
      source: 'project_payment', // Simplified source identifier
      sourceId: payment.id,
      currency: payment.currency as Currency,
      originalCurrency: payment.currency as Currency,
      originalAmount: payment.amount
    };
  });

  // Convert paid expenses to cash flow items
  const expenseItems: CashFlowItem[] = (paidExpensesData || []).map(expense => ({
    id: expense.id + 200000, // Add offset to avoid ID collisions
    date: new Date(expense.paid_date || expense.date),
    description: expense.description,
    type: 'Gasto',
    category: expense.category,
    paymentMethod: expense.paymentmethod,
    amount: expense.amount,
    isRecurring: expense.source_type === 'recurrente',
    source: 'expense', // Simplified source identifier
    sourceId: expense.id,
    currency: expense.currency as Currency,
    originalCurrency: expense.currency as Currency,
    originalAmount: expense.amount
  }));

  // Create a deduplication map to identify potential duplicates
  // Use a Map with composite key for efficient lookup
  const deduplicationMap = new Map<string, CashFlowItem>();
  
  // Helper function to check for duplicates by key properties
  const generateDuplicationKey = (item: CashFlowItem): string => {
    // Create a unique identifier based on key properties
    return `${item.date.toISOString().split('T')[0]}-${item.amount}-${item.description}`;
  };

  // First add all expense items (these shouldn't be duplicated)
  expenseItems.forEach(item => {
    deduplicationMap.set(generateDuplicationKey(item), item);
  });

  // Next add project payments (these should take precedence over manual income entries)
  paymentItems.forEach(item => {
    deduplicationMap.set(generateDuplicationKey(item), item);
  });

  // Finally add manual income items, but only if they don't duplicate a project payment
  incomeItems.forEach(item => {
    const key = generateDuplicationKey(item);
    // Only add if there's no existing entry with this key
    if (!deduplicationMap.has(key)) {
      deduplicationMap.set(key, item);
    } else {
      // Verify if this might be an actual duplicate or just a coincidence
      // If descriptions are completely different but other properties match, keep both
      const existingItem = deduplicationMap.get(key)!;
      if (existingItem.source === 'project_payment' && 
          !item.description.includes(existingItem.description) && 
          !existingItem.description.includes(item.description)) {
        // This is likely a different transaction that happens to have same date/amount
        // Generate a modified key to keep both
        deduplicationMap.set(`${key}-manual`, item);
      }
      // Otherwise, we assume it's a duplicate and prefer the project payment
    }
  });

  // Convert back to array
  let combined: CashFlowItem[] = Array.from(deduplicationMap.values());
  
  // Apply filters if provided
  if (filters) {
    if (filters.startDate) {
      combined = combined.filter(item => item.date >= filters.startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      combined = combined.filter(item => item.date <= endDate);
    }
    
    if (filters.type && filters.type !== 'all') {
      combined = combined.filter(item => item.type === filters.type);
    }
    
    if (filters.category && filters.category !== 'all') {
      combined = combined.filter(item => item.category === filters.category);
    }
  }
  
  // Sort by date (most recent first)
  combined.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Calculate running balance (in descending date order)
  let balance = 0;
  const result = combined.map(item => {
    if (item.type === 'Ingreso') {
      balance += item.amount;
    } else {
      balance -= item.amount;
    }
    return { ...item, balance };
  });

  console.log(`Returning ${result.length} items after deduplication (original total: ${incomeItems.length + paymentItems.length + expenseItems.length})`);
  return result;
}

export async function getMonthlyData() {
  const { data, error } = await supabase
    .from('gastos_causados')
    .select('date, amount')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching monthly data:', error);
    throw error;
  }

  // Group by month and calculate totals
  const monthlyTotals = data.reduce((acc: any, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: date.toLocaleString('default', { month: 'long' }),
        year: date.getFullYear(),
        total_expense: 0
      };
    }
    
    acc[monthKey].total_expense += Number(expense.amount);
    return acc;
  }, {});

  return Object.values(monthlyTotals);
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

export async function getAccruedExpenses(): Promise<CausedExpense[]> {
  return getCausedExpenses();
}