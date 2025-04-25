
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addMonths } from "date-fns";
import { Json } from "@/integrations/supabase/types";

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

      // The function returns an array with a single result, so we need to extract the first element
      if (!data || data.length === 0) {
        // Return default values if no data is available
        return {
          total_month: 0,
          avg_month: 0,
          client_income: 0,
          client_percentage: 0,
          monthly_data: []
        } as IncomeAnalytics;
      }

      // Extract the first result and handle the Json type for monthly_data
      const result = data[0];
      return {
        total_month: result.total_month,
        avg_month: result.avg_month,
        client_income: result.client_income,
        client_percentage: result.client_percentage,
        monthly_data: result.monthly_data as Array<{ month: string; ingresos: number; }>
      } as IncomeAnalytics;
    }
  });
};
