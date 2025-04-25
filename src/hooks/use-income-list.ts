
import { useQuery } from "@tanstack/react-query";
import { getIncomes } from "@/services/financeService";
import type { Income } from "@/services/financeService";

export function useIncomeList() {
  return useQuery({
    queryKey: ['incomes'],
    queryFn: getIncomes,
  });
}
