
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addMonths, startOfMonth, endOfMonth } from "date-fns";

export type ReportPeriod = "mensual" | "trimestral" | "semestral" | "anual";

export interface FinancialReportMetrics {
  total_income: number;
  total_expense: number;
  net_income: number;
  accumulated_balance: number;
  expense_by_category: Array<{
    category: string;
    total: number;
  }>;
  income_by_client: Array<{
    client: string;
    total: number;
  }>;
  monthly_data: Array<{
    month: string;
    year: number;
    total_income: number;
    total_expense: number;
    net_income: number;
  }>;
}

export const useFinancialReports = (timeFrame: ReportPeriod = "semestral") => {
  const currentDate = new Date();
  const startDate = startOfMonth(
    timeFrame === "mensual" 
      ? currentDate 
      : timeFrame === "trimestral"
        ? addMonths(currentDate, -3)
        : timeFrame === "semestral"
          ? addMonths(currentDate, -6)
          : addMonths(currentDate, -12)
  );
  const endDate = endOfMonth(currentDate);

  // Fetch monthly summary data
  const { data: monthlyData = [], isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['monthly-summary', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_monthly_summary');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch expense categories
  const { data: expenseCategories = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expense-categories', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_expense_by_category');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch client income data
  const { data: clientIncomes = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['client-income', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_income_by_client');
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate accumulated balance
  const accumulatedBalance = monthlyData.reduce((acc, month) => acc + month.net_income, 0);

  const reportMetrics: FinancialReportMetrics = {
    total_income: monthlyData[0]?.total_income || 0,
    total_expense: monthlyData[0]?.total_expense || 0,
    net_income: monthlyData[0]?.net_income || 0,
    accumulated_balance: accumulatedBalance,
    expense_by_category: expenseCategories,
    income_by_client: clientIncomes,
    monthly_data: monthlyData,
  };

  return {
    metrics: reportMetrics,
    isLoading: isLoadingMonthly || isLoadingExpenses || isLoadingClients,
  };
};
