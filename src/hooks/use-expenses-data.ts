
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addMonths, startOfMonth, endOfMonth } from "date-fns";

export interface Expense {
  id: number;
  description: string;
  date: string;
  amount: number;
  category: string;
  paymentmethod: string;
  receipt?: string;
  notes?: string;
  currency: string;
}

export interface ExpenseSummary {
  total_expenses: number;
  recurring_expenses: number;
  variable_expenses: number;
  top_category: string;
  top_category_amount: number;
  avg_monthly_expense: number;
  expense_trend: number;
}

export const useExpensesData = (timeFrame: "month" | "quarter" | "year" = "month") => {
  const today = new Date();
  const startDate = startOfMonth(
    timeFrame === "month" 
      ? today 
      : timeFrame === "quarter" 
        ? addMonths(today, -3) 
        : addMonths(today, -12)
  );
  const endDate = endOfMonth(today);

  const { data: variableExpenses = [], isLoading: isLoadingVariable } = useQuery({
    queryKey: ['variable-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_variable_expenses');
      if (error) throw error;
      return data as Expense[];
    }
  });

  const { data: recurringExpenses = [], isLoading: isLoadingRecurring } = useQuery({
    queryKey: ['recurring-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_recurring_expenses');
      if (error) throw error;
      return data as Expense[];
    }
  });

  const { data: expenseSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['expense-summary', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_expense_summary', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      if (error) throw error;
      return data as ExpenseSummary;
    }
  });

  return {
    variableExpenses,
    recurringExpenses,
    expenseSummary,
    isLoading: isLoadingVariable || isLoadingRecurring || isLoadingSummary
  };
};
