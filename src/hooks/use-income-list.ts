import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getIncomes } from "@/services/financeService";
import type { Income } from "@/services/financeService";

export function useIncomeList() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['incomes'],
    queryFn: getIncomes,
  });
  
  const refreshIncomes = () => {
    // Also invalidate cash flow movements to ensure they stay in sync
    // This is critical to prevent duplication issues between modules
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['incomes'] }),
      queryClient.invalidateQueries({ queryKey: ['cash-flow-movements'] })
    ]);
  };
  
  return {
    ...query,
    refreshIncomes,
  };
}