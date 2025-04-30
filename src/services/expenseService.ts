
import { supabase } from '@/integrations/supabase/client';
import { Currency } from '@/lib/utils';

function createDateWithCorrectDay(dateStr: string): Date {
  // Crear fecha con el offset de la zona horaria para preservar el día
  // Usamos hora 12:00:00 para evitar problemas con zonas horarias
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

// Función para formatear fechas antes de enviarlas a la base de datos
function formatDateForDB(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export interface VariableExpense {
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

export interface RecurringExpense {
  id: number;
  description: string;
  startDate: Date;
  amount: number;
  category: string;
  paymentMethod: string;
  frequency: string;
  receipt?: string;
  notes?: string;
  currency: Currency;
  isActive: boolean;
  endDate?: Date;
  isAutoDebit: boolean;
}

export interface CausedExpense {
  id: number;
  sourceType: 'variable' | 'recurrente';
  sourceId: number;
  date: Date;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  currency: Currency;
  status: 'pendiente' | 'pagado' | 'vencido';
  paidDate?: Date;
  receipt?: string;
  notes?: string;
}

export async function getVariableExpenses(): Promise<VariableExpense[]> {
  const { data, error } = await supabase
    .from('gastos_variables')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching variable expenses:', error);
    throw error;
  }

  return data.map(expense => ({
    id: expense.id,
    description: expense.description,
    date: createDateWithCorrectDay(expense.date),
    amount: expense.amount,
    category: expense.category,
    paymentMethod: expense.paymentmethod,
    receipt: expense.receipt || undefined,
    notes: expense.notes || undefined,
    currency: expense.currency as Currency
  })) || [];
}

export async function getRecurringExpenses(): Promise<RecurringExpense[]> {
  const { data, error } = await supabase
    .from('gastos_recurrentes')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching recurring expenses:', error);
    throw error;
  }

  return data.map(expense => ({
    id: expense.id,
    description: expense.description,
    startDate: new Date(expense.start_date),
    amount: expense.amount,
    category: expense.category,
    paymentMethod: expense.paymentmethod,
    frequency: expense.frequency,
    receipt: expense.receipt || undefined,
    notes: expense.notes || undefined,
    currency: expense.currency as Currency,
    isActive: expense.is_active,
    endDate: expense.end_date ? createDateWithCorrectDay(expense.end_date) : undefined,
    isAutoDebit: expense.is_auto_debit
  })) || [];
}

export async function getCausedExpenses(): Promise<CausedExpense[]> {
  const { data, error } = await supabase
    .from('gastos_causados')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching caused expenses:', error);
    throw error;
  }

  return data.map(expense => ({
    id: expense.id,
    sourceType: expense.source_type as 'variable' | 'recurrente',
    sourceId: expense.source_id,
    date: createDateWithCorrectDay(expense.date),
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    paymentMethod: expense.paymentmethod,
    currency: expense.currency as Currency,
    status: expense.status as 'pendiente' | 'pagado' | 'vencido',
    paidDate: expense.paid_date ? createDateWithCorrectDay(expense.paid_date) : undefined,
    receipt: expense.receipt || undefined,
    notes: expense.notes || undefined,
  })) || [];
}

export async function addVariableExpense(expense: Omit<VariableExpense, 'id'>): Promise<VariableExpense> {
  const { data, error } = await supabase
    .from('gastos_variables')
    .insert([{
      description: expense.description,
      date: formatDateForDB(expense.date),
      amount: expense.amount,
      category: expense.category,
      paymentmethod: expense.paymentMethod,
      receipt: expense.receipt,
      notes: expense.notes,
      currency: expense.currency
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding variable expense:', error);
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

export async function updateVariableExpense(expense: VariableExpense): Promise<VariableExpense> {
  const { data, error } = await supabase
    .from('gastos_variables')
    .update({
      description: expense.description,
      date: formatDateForDB(expense.date),
      amount: expense.amount,
      category: expense.category,
      paymentmethod: expense.paymentMethod,
      receipt: expense.receipt,
      notes: expense.notes,
      currency: expense.currency
    })
    .eq('id', expense.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating variable expense:', error);
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

export async function addRecurringExpense(expense: Omit<RecurringExpense, 'id' | 'isActive'>): Promise<RecurringExpense> {
  // First, add the recurring expense to the database
  const { data, error } = await supabase
    .from('gastos_recurrentes')
    .insert([{
      description: expense.description,
      start_date: formatDateForDB(expense.startDate),
      end_date: expense.endDate ? expense.endDate.toISOString().split('T')[0] : null,
      amount: expense.amount,
      category: expense.category,
      paymentmethod: expense.paymentMethod,
      frequency: expense.frequency,
      receipt: expense.receipt,
      notes: expense.notes,
      currency: expense.currency,
      is_active: true,
      is_auto_debit: expense.isAutoDebit
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding recurring expense:', error);
    throw error;
  }

  // After adding the recurring expense, trigger the edge function to generate the caused expenses
  try {
    await supabase.functions.invoke("recurring-expenses");
  } catch (error) {
    console.error("Error syncing recurring expenses after adding a new one:", error);
    // Don't throw here, as the recurring expense was already created successfully
  }

  return {
    id: data.id,
    description: data.description,
    startDate: new Date(data.start_date),
    endDate: data.end_date ? new Date(data.end_date) : undefined,
    amount: data.amount,
    category: data.category,
    paymentMethod: data.paymentmethod,
    frequency: data.frequency,
    receipt: data.receipt || undefined,
    notes: data.notes || undefined,
    currency: data.currency as Currency,
    isActive: data.is_active,
    isAutoDebit: data.is_auto_debit
  };
}

export async function updateRecurringExpense(expense: RecurringExpense): Promise<RecurringExpense> {
  // Update the recurring expense in the database
  const { data, error } = await supabase
    .from('gastos_recurrentes')
    .update({
      description: expense.description,
      start_date: formatDateForDB(expense.startDate),
      end_date: expense.endDate ? expense.endDate.toISOString().split('T')[0] : null,
      amount: expense.amount,
      category: expense.category,
      paymentmethod: expense.paymentMethod,
      frequency: expense.frequency,
      receipt: expense.receipt,
      notes: expense.notes,
      currency: expense.currency,
      is_active: expense.isActive,
      is_auto_debit: expense.isAutoDebit
    })
    .eq('id', expense.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating recurring expense:', error);
    throw error;
  }

  // After updating the recurring expense, trigger the edge function to update the caused expenses
  try {
    // Remove future caused expenses and regenerate them
    await supabase
      .from('gastos_causados')
      .delete()
      .eq('source_type', 'recurrente')
      .eq('source_id', expense.id)
      .gt('date', new Date().toISOString().split('T')[0]);
      
    // Sync to generate new caused expenses based on the updated recurring expense
    await supabase.functions.invoke("recurring-expenses");
  } catch (error) {
    console.error("Error syncing recurring expenses after update:", error);
    // Don't throw here, as the recurring expense was already updated successfully
  }

  return {
    id: data.id,
    description: data.description,
    startDate: new Date(data.start_date),
    endDate: data.end_date ? new Date(data.end_date) : undefined,
    amount: data.amount,
    category: data.category,
    paymentMethod: data.paymentmethod,
    frequency: data.frequency,
    receipt: data.receipt || undefined,
    notes: data.notes || undefined,
    currency: data.currency as Currency,
    isActive: data.is_active,
    isAutoDebit: data.is_auto_debit
  };
}

export async function updateCausedExpenseStatus(id: number, status: 'pendiente' | 'pagado' | 'vencido', paidDate?: Date): Promise<void> {
  const updateData: any = { status };
  if (paidDate) {
    updateData.paid_date = formatDateForDB(paidDate);
  }

  const { error } = await supabase
    .from('gastos_causados')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating caused expense status:', error);
    throw error;
  }
}

// New function to sync recurring expenses manually
export async function syncRecurringExpenses(): Promise<{ 
  success: boolean, 
  newExpensesCount: number 
}> {
  try {
    const { data, error } = await supabase.functions.invoke("recurring-expenses");
    
    if (error) {
      console.error("Error calling recurring-expenses function:", error);
      throw error;
    }
    
    return {
      success: data.success,
      newExpensesCount: data.details?.length || 0
    };
  } catch (error) {
    console.error("Error syncing recurring expenses:", error);
    throw error;
  }
}
