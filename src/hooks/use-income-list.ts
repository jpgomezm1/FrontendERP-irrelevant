
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
    queryClient.invalidateQueries({ queryKey: ['incomes'] });
  };
  
  return {
    ...query,
    refreshIncomes,
  };
}
