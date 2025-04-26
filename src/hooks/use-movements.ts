
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCashFlow } from "@/services/financeService";

export const useMovements = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['cash-flow-movements'],
    queryFn: getCashFlow,
    // Refetch when any of these data sources change
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const refreshCashFlow = () => {
    queryClient.invalidateQueries({ queryKey: ['cash-flow-movements'] });
  };

  return {
    ...query,
    refreshCashFlow,
  };
};
