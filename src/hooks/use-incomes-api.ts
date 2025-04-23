import {
    useQuery,
    useMutation,
    useQueryClient,
    MutationOptions,
    QueryKey,
  } from "@tanstack/react-query";
  import {
    IncomesService,
    type Income, // modelo generado por el SDK
  } from "@/api";
  
  const KEY: QueryKey = ["incomes"];
  
  /* ───────── 1. LISTAR ───────── */
  export function useIncomesAPI() {
    return useQuery({
      queryKey: KEY,
      /* 👇 pasamos {} porque la función espera un objeto (aunque esté vacío) */
      queryFn: () => IncomesService.getIncomeList({}),
    });
  }
  
  /* ───────── 2. CREAR ───────── */
  export function useCreateIncome(
    options?: MutationOptions<unknown, unknown, Income>
  ) {
    const qc = useQueryClient();
  
    return useMutation({
      mutationFn: (payload: Income) => IncomesService.postIncomeList(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
      ...options,
    });
  }
  
  /* ───────── 3. ACTUALIZAR ───────── */
  export function useUpdateIncome(
    options?: MutationOptions<
      unknown,
      unknown,
      { id: number; data: Income }
    >
  ) {
    const qc = useQueryClient();
  
    return useMutation({
      mutationFn: ({ id, data }) =>
        IncomesService.putIncomeDetail(id, data),
      onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
      ...options,
    });
  }
  
  /* ───────── 4. ELIMINAR ───────── */
  export function useDeleteIncome(
    options?: MutationOptions<unknown, unknown, number>
  ) {
    const qc = useQueryClient();
  
    return useMutation({
      mutationFn: (id: number) => IncomesService.deleteIncomeDetail(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
      ...options,
    });
  }
  