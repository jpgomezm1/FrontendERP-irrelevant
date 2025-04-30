
import { useQuery } from "@tanstack/react-query";
import { getVariableExpenses, getRecurringExpenses, getCausedExpenses, VariableExpense, RecurringExpense, CausedExpense } from "@/services/expenseService";
import { addMonths, startOfMonth, endOfMonth } from "date-fns";
import React from "react"; 
import { Currency, convertCurrency } from "@/lib/utils";

export type { VariableExpense, RecurringExpense, CausedExpense };

export interface ExpenseSummary {
  total_expenses: number;
  recurring_expenses: number;
  variable_expenses: number;
  top_category: string;
  top_category_amount: number;
  avg_monthly_expense: number;
  expense_trend: number;
  currency: Currency;
}

export const useExpensesData = (
  timeFrame: "month" | "quarter" | "year" = "month",
  viewCurrency: Currency = "COP"
) => {
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

  // Process summary data using only caused expenses with proper currency conversion
  const expenseSummary = React.useMemo(() => {
    if (isLoadingVariable || isLoadingRecurring || isLoadingCaused) {
      return null;
    }

    const filteredCausedExpenses = causedExpenses.filter(expense => {
      // Convertir a fechas sin hora para comparación justa
      const expenseDate = new Date(
        expense.date.getFullYear(),
        expense.date.getMonth(),
        expense.date.getDate()
      );
      const startDateNoTime = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const endDateNoTime = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
      return expenseDate >= startDateNoTime && expenseDate <= endDateNoTime;
    });

    // Convert all expenses to the view currency for calculations
    const convertedExpenses = filteredCausedExpenses.map(expense => ({
      ...expense,
      convertedAmount: expense.currency === viewCurrency 
        ? expense.amount 
        : convertCurrency(expense.amount, expense.currency, viewCurrency)
    }));
    
    // Calculate total expenses using only caused expenses with currency conversion
    const total_expenses = convertedExpenses.reduce(
      (sum, expense) => sum + expense.convertedAmount, 0
    );
    
    // Calculate recurring vs variable expenses using the sourceType field with currency conversion
    const recurring_expenses = convertedExpenses
      .filter(expense => expense.sourceType === 'recurrente')
      .reduce((sum, expense) => sum + expense.convertedAmount, 0);
      
    const variable_expenses = convertedExpenses
      .filter(expense => expense.sourceType === 'variable')
      .reduce((sum, expense) => sum + expense.convertedAmount, 0);

    // Calculate top category based only on caused expenses with currency conversion
    const categoryAmounts = convertedExpenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.convertedAmount;
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

    // Calculate average monthly expense with proper time period division
    const monthsInPeriod = timeFrame === "month" ? 1 : timeFrame === "quarter" ? 3 : 12;
    const avg_monthly_expense = total_expenses / monthsInPeriod;
    
    // For trend calculation, we would need historical data to compare
    // For now, we use a placeholder or could implement a basic calculation if needed
    const expense_trend = 0; // Placeholder

    return {
      total_expenses,
      recurring_expenses,
      variable_expenses,
      top_category,
      top_category_amount,
      avg_monthly_expense,
      expense_trend,
      currency: viewCurrency
    } as ExpenseSummary;
  }, [causedExpenses, startDate, endDate, timeFrame, viewCurrency, isLoadingVariable, isLoadingRecurring, isLoadingCaused]);

  return {
    variableExpenses,
    recurringExpenses,
    causedExpenses,
    expenseSummary,
    isLoading: isLoadingVariable || isLoadingRecurring || isLoadingCaused
  };
};
