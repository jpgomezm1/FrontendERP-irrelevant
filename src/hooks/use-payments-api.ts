import { useQuery } from "@tanstack/react-query";
import { PaymentsService } from "@/api";

export const usePaymentsAPI = (projectId: number) =>
  useQuery({
    queryKey: ["payments", projectId],
    queryFn: () => PaymentsService.getPaymentList({ projectId }),
    enabled: !!projectId,
  });
