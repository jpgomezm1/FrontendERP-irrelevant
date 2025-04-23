// src/hooks/useClientsApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientsService, type Client } from '@/api';

export function useClientsApi() {
  const qc = useQueryClient();

  // GET /clients
  const listClients = () =>
    useQuery({
      queryKey: ['clients'],
      queryFn: () => ClientsService.getClientList(),
    });

  // POST /clients
  const createClient = () =>
    useMutation({
      mutationFn: (payload: Client) => ClientsService.postClientList(payload),
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: ['clients'] }), // ✅ forma v5
    });

  return { listClients, createClient };
}
