
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CashFlowAnalytics {
  month: string;
  year: number;
  ingresos: number;
  gastos: number;
  balance: number;
  category: string;
  category_amount: number;
  client: string;
  client_amount: number;
}

export const useCashFlowAnalytics = () => {
  return useQuery({
    queryKey: ['cash-flow-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_cash_flow_analytics');

      if (error) throw error;

      return data as CashFlowAnalytics[];
    }
  });
};
