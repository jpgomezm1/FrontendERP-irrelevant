import { useQuery } from "@tanstack/react-query";
import { ClientsService } from "@/api";     // ← lo generó openapi-typescript-codegen

export function useClientsAPI() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => ClientsService.getClientList()   // hace GET /clients
  });
}
