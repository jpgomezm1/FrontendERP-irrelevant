
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addMonths } from "date-fns";
import { Currency } from "@/lib/utils";

export interface IncomeAnalytics {
  total_month: number;
  avg_month: number;
  client_income: number;
  client_percentage: number;
  monthly_data: Array<{
    month: string;
    ingresos: number;
  }>;
}

export const useIncomeAnalytics = (timeFrame: "month" | "quarter" | "year" = "month") => {
  const endDate = new Date();
  const startDate = timeFrame === "month" 
    ? addMonths(endDate, -1)
    : timeFrame === "quarter"
      ? addMonths(endDate, -3)
      : addMonths(endDate, -12);

  return useQuery({
    queryKey: ['income-analytics', timeFrame],
    queryFn: async () => {
      // Instead of using RPC which might be having issues, let's query the database directly
      const { data: incomes, error: incomesError } = await supabase
        .from('incomes')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (incomesError) {
        console.error('Error fetching income data:', incomesError);
        throw incomesError;
      }

      if (!incomes || incomes.length === 0) {
        // Return default values if no data is available
        return {
          total_month: 0,
          avg_month: 0,
          client_income: 0,
          client_percentage: 0,
          monthly_data: []
        } as IncomeAnalytics;
      }

      // Calculate metrics manually from the incomes data
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Total this month
      const totalMonth = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === currentMonth && 
               incomeDate.getFullYear() === currentYear;
      }).reduce((sum, income) => sum + Number(income.amount), 0);
      
      // Group by months to get monthly data and calculate average
      const monthlyData = incomes.reduce((acc: Record<string, number>, income) => {
        const date = new Date(income.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthName = date.toLocaleString('default', { month: 'long' });
        
        acc[monthKey] = (acc[monthKey] || 0) + Number(income.amount);
        return acc;
      }, {});
      
      const monthlyDataArray = Object.entries(monthlyData).map(([key, value]) => {
        const [year, month] = key.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        return {
          month: date.toLocaleString('default', { month: 'long' }),
          ingresos: value
        };
      }).sort((a, b) => {
        // Sort by month chronologically (most recent last)
        const monthA = new Date(Date.parse(`1 ${a.month} 2000`)).getMonth();
        const monthB = new Date(Date.parse(`1 ${b.month} 2000`)).getMonth();
        return monthA - monthB;
      });
      
      // Average monthly income
      const avgMonth = Object.values(monthlyData).reduce((sum, amount) => sum + Number(amount), 0) / 
                      Math.max(1, Object.keys(monthlyData).length);
      
      // Client income and percentage
      const clientIncome = incomes
        .filter(income => income.client && income.client.trim() !== '')
        .reduce((sum, income) => sum + Number(income.amount), 0);
      
      const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
      const clientPercentage = totalIncome > 0 ? (clientIncome / totalIncome) * 100 : 0;
      
      return {
        total_month: totalMonth,
        avg_month: avgMonth,
        client_income: clientIncome,
        client_percentage: clientPercentage,
        monthly_data: monthlyDataArray
      } as IncomeAnalytics;
    }
  });
};
