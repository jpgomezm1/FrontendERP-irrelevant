import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpensesService, type Expense } from "@/api";

const KEY = ["expenses"];

export const useExpensesAPI = () =>
  useQuery({ queryKey: KEY, queryFn: () => ExpensesService.getExpenseList({}) });

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Expense) => ExpensesService.postExpenseList(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
