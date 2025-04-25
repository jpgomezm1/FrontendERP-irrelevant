
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

export interface DashboardMetrics {
  currentMonthIncome: number;
  currentMonthExpense: number;
  cashBalance: number;
  monthlyVariation: {
    income: { value: number; percentage: number };
    expense: { value: number; percentage: number };
  };
  activeClients: number;
}

export const useDashboardData = () => {
  // Fetch monthly summary data
  const { data: monthlyData = [], isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['monthly-summary'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_monthly_summary');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch client data
  const { data: clientData = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['client-income'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_income_by_client');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch expense categories
  const { data: expenseData = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_expense_by_category');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch active clients count
  const { data: activeClientsCount = 0, isLoading: isLoadingActiveClients } = useQuery({
    queryKey: ['active-clients'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('status', 'active');
      if (error) throw error;
      return count || 0;
    }
  });

  // Calculate metrics
  const currentMonth = monthlyData[0] || { total_income: 0, total_expense: 0 };
  const previousMonth = monthlyData[1] || { total_income: 0, total_expense: 0 };

  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const metrics: DashboardMetrics = {
    currentMonthIncome: currentMonth.total_income,
    currentMonthExpense: currentMonth.total_expense,
    cashBalance: currentMonth.total_income - currentMonth.total_expense,
    monthlyVariation: {
      income: {
        value: currentMonth.total_income - previousMonth.total_income,
        percentage: calculateVariation(currentMonth.total_income, previousMonth.total_income)
      },
      expense: {
        value: currentMonth.total_expense - previousMonth.total_expense,
        percentage: calculateVariation(currentMonth.total_expense, previousMonth.total_expense)
      }
    },
    activeClients: activeClientsCount
  };

  return {
    metrics,
    monthlyData,
    clientData,
    expenseData,
    isLoading: isLoadingMonthly || isLoadingClients || isLoadingExpenses || isLoadingActiveClients
  };
};
