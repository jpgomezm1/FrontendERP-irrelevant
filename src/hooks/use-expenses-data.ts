
import { useQuery } from "@tanstack/react-query";
import { getVariableExpenses, getRecurringExpenses, getCausedExpenses, VariableExpense, RecurringExpense, CausedExpense } from "@/services/expenseService";
import { addMonths, startOfMonth, endOfMonth } from "date-fns";
import React from "react"; 

export type { VariableExpense, RecurringExpense, CausedExpense };

export interface ExpenseSummary {
  total_expenses: number;
  recurring_expenses: number;
  variable_expenses: number;
  top_category: string;
  top_category_amount: number;
  avg_monthly_expense: number;
  expense_trend: number;
}

export const useExpensesData = (timeFrame: "month" | "quarter" | "year" = "month") => {
  const today = new Date();
  const startDate = startOfMonth(
    timeFrame === "month" 
      ? today 
      : timeFrame === "quarter" 
        ? addMonths(today, -3) 
        : addMonths(today, -12)
  );
  const endDate = endOfMonth(today);

  const { data: variableExpenses = [], isLoading: isLoadingVariable } = useQuery({
    queryKey: ['variable-expenses'],
    queryFn: getVariableExpenses
  });

  const { data: recurringExpenses = [], isLoading: isLoadingRecurring } = useQuery({
    queryKey: ['recurring-expenses'],
    queryFn: getRecurringExpenses
  });

  const { data: causedExpenses = [], isLoading: isLoadingCaused } = useQuery({
    queryKey: ['caused-expenses'],
    queryFn: getCausedExpenses
  });

  // Process summary data using only caused expenses
  const expenseSummary = React.useMemo(() => {
    if (isLoadingVariable || isLoadingRecurring || isLoadingCaused) {
      return null;
    }

    const filteredCausedExpenses = causedExpenses.filter(expense => 
      expense.date >= startDate && expense.date <= endDate
    );

    // Calculate total expenses using only caused expenses
    const total_expenses = filteredCausedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate recurring vs variable expenses using the sourceType field
    const recurring_expenses = filteredCausedExpenses
      .filter(expense => expense.sourceType === 'recurrente')
      .reduce((sum, expense) => sum + expense.amount, 0);
      
    const variable_expenses = filteredCausedExpenses
      .filter(expense => expense.sourceType === 'variable')
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate top category based only on caused expenses
    const categoryAmounts = filteredCausedExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    let top_category = '';
    let top_category_amount = 0;

    Object.entries(categoryAmounts).forEach(([category, amount]) => {
      if (amount > top_category_amount) {
        top_category = category;
        top_category_amount = amount;
      }
    });

    // Calculate average monthly expense
    const avg_monthly_expense = total_expenses / 
      (timeFrame === "month" ? 1 : timeFrame === "quarter" ? 3 : 12);
    
    // For trend calculation, we currently use a placeholder
    // In a real implementation, we would compare with previous periods
    const expense_trend = 0;

    return {
      total_expenses,
      recurring_expenses,
      variable_expenses,
      top_category,
      top_category_amount,
      avg_monthly_expense,
      expense_trend
    } as ExpenseSummary;
  }, [causedExpenses, startDate, endDate, timeFrame, isLoadingVariable, isLoadingRecurring, isLoadingCaused]);

  return {
    variableExpenses,
    recurringExpenses,
    causedExpenses,
    expenseSummary,
    isLoading: isLoadingVariable || isLoadingRecurring || isLoadingCaused
  };
};
