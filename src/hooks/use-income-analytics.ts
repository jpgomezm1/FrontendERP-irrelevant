
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addMonths } from "date-fns";

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
      const { data, error } = await supabase.rpc(
        'get_income_analytics',
        {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      );

      if (error) throw error;
      return data as IncomeAnalytics;
    }
  });
};
