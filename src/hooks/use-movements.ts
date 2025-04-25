
import { useQuery } from "@tanstack/react-query";
import { getCashFlow } from "@/services/financeService";

export const useMovements = () => {
  return useQuery({
    queryKey: ['cash-flow-movements'],
    queryFn: getCashFlow
  });
};
