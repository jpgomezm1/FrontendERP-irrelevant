
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export interface DashboardMetrics {
  currentMonthIncome: number;
  currentMonthExpense: number;
  cashBalance: number;
  monthlyVariation: {
    income: { value: number; percentage: number };
    expense: { value: number; percentage: number };
  };
  activeClients: number;
  burnRate: number;
}

export type TimePeriod = 'month' | 'quarter' | 'ytd' | 'year' | 'prev-month' | 'prev-quarter';

export const useDashboardData = (period: TimePeriod = 'month') => {
  // Get date ranges based on period
  const getDateRange = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    let startDate: Date, endDate: Date;
    
    switch (period) {
      case 'month': // Current month
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0);
        break;
      case 'prev-month': // Previous month
        startDate = new Date(currentYear, currentMonth - 1, 1);
        endDate = new Date(currentYear, currentMonth, 0);
        break;
      case 'quarter': // Current quarter
        const currentQuarter = Math.floor(currentMonth / 3);
        startDate = new Date(currentYear, currentQuarter * 3, 1);
        endDate = new Date(currentYear, (currentQuarter + 1) * 3, 0);
        break;
      case 'prev-quarter': // Previous quarter
        const prevQuarter = Math.floor(currentMonth / 3) - 1;
        const prevQuarterYear = prevQuarter < 0 ? currentYear - 1 : currentYear;
        const adjustedQuarter = prevQuarter < 0 ? 3 + prevQuarter : prevQuarter;
        startDate = new Date(prevQuarterYear, adjustedQuarter * 3, 1);
        endDate = new Date(prevQuarterYear, (adjustedQuarter + 1) * 3, 0);
        break;
      case 'ytd': // Year to date
        startDate = new Date(currentYear, 0, 1);
        endDate = now;
        break;
      case 'year': // Full current year
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31);
        break;
      default:
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0);
    }
    
    return { startDate, endDate };
  };

  // Get previous period date range for comparison
  const getPreviousDateRange = () => {
    const { startDate, endDate } = getDateRange();
    const durationMs = endDate.getTime() - startDate.getTime();
    
    const prevStartDate = new Date(startDate.getTime() - durationMs);
    const prevEndDate = new Date(startDate.getTime() - 1); // 1ms before current period
    
    return { startDate: prevStartDate, endDate: prevEndDate };
  };
  
  const { startDate, endDate } = getDateRange();
  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousDateRange();

  // Format dates for queries
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Fetch monthly summary data
  const { data: monthlyData = [], isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['monthly-summary', period],
    queryFn: async () => {
      // Get income data
      const { data: incomesData, error: incomesError } = await supabase
        .from('incomes')
        .select('date, amount')
        .order('date', { ascending: false });
        
      if (incomesError) throw incomesError;
      
      // Get expense data
      const { data: expensesData, error: expensesError } = await supabase
        .from('gastos_causados')
        .select('date, amount')
        .order('date', { ascending: false });
        
      if (expensesError) throw expensesError;
      
      // Group by month and combine data
      const monthlyTotals: Record<string, any> = {};
      
      // Process incomes
      incomesData.forEach(income => {
        const date = new Date(income.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = {
            month: date.toLocaleString('default', { month: 'long' }),
            year: date.getFullYear(),
            total_income: 0,
            total_expense: 0
          };
        }
        
        monthlyTotals[monthKey].total_income += Number(income.amount);
      });
      
      // Process expenses
      expensesData.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = {
            month: date.toLocaleString('default', { month: 'long' }),
            year: date.getFullYear(),
            total_income: 0,
            total_expense: 0
          };
        }
        
        monthlyTotals[monthKey].total_expense += Number(expense.amount);
      });
      
      return Object.values(monthlyTotals)
        .sort((a: any, b: any) => {
          // Sort by year (descending) and then by month (descending)
          if (a.year !== b.year) return b.year - a.year;
          return new Date(0, b.month).getMonth() - new Date(0, a.month).getMonth();
        });
    }
  });

  // Fetch client data
  const { data: clientData = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['client-income', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incomes')
        .select('client, amount')
        .gte('date', formatDate(startDate))
        .lte('date', formatDate(endDate));
        
      if (error) throw error;
      
      // Group by client and sum amounts
      const clientTotals: Record<string, number> = {};
      data.forEach(income => {
        const client = income.client || 'Sin Cliente';
        if (!clientTotals[client]) {
          clientTotals[client] = 0;
        }
        clientTotals[client] += Number(income.amount);
      });
      
      return Object.entries(clientTotals)
        .map(([client, total]) => ({ client, total }))
        .sort((a, b) => b.total - a.total);
    }
  });

  // Fetch expense categories from gastos_causados
  const { data: expenseData = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expense-categories', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gastos_causados')
        .select('category, amount')
        .gte('date', formatDate(startDate))
        .lte('date', formatDate(endDate));

      if (error) throw error;

      // Group by category and sum amounts
      const categories = data.reduce((acc: { [key: string]: number }, curr) => {
        if (!acc[curr.category]) {
          acc[curr.category] = 0;
        }
        acc[curr.category] += Number(curr.amount);
        return acc;
      }, {});

      return Object.entries(categories)
        .map(([category, total]) => ({
          category,
          total
        }))
        .sort((a, b) => b.total - a.total);
    }
  });

  // Get current period expense and income totals
  const { data: currentPeriodTotals, isLoading: isLoadingCurrentPeriod } = useQuery({
    queryKey: ['current-period-totals', period],
    queryFn: async () => {
      // Get income total
      const { data: incomeData, error: incomeError } = await supabase
        .from('incomes')
        .select('amount')
        .gte('date', formatDate(startDate))
        .lte('date', formatDate(endDate));
        
      if (incomeError) throw incomeError;
      
      // Get expense total
      const { data: expenseData, error: expenseError } = await supabase
        .from('gastos_causados')
        .select('amount')
        .gte('date', formatDate(startDate))
        .lte('date', formatDate(endDate));
        
      if (expenseError) throw expenseError;
      
      const incomeTotal = incomeData.reduce((sum, item) => sum + Number(item.amount), 0);
      const expenseTotal = expenseData.reduce((sum, item) => sum + Number(item.amount), 0);
      
      return { incomeTotal, expenseTotal };
    }
  });

  // Get previous period expense and income totals for comparison
  const { data: previousPeriodTotals, isLoading: isLoadingPreviousPeriod } = useQuery({
    queryKey: ['previous-period-totals', period],
    queryFn: async () => {
      // Get income total for previous period
      const { data: incomeData, error: incomeError } = await supabase
        .from('incomes')
        .select('amount')
        .gte('date', formatDate(prevStartDate))
        .lte('date', formatDate(prevEndDate));
        
      if (incomeError) throw incomeError;
      
      // Get expense total for previous period
      const { data: expenseData, error: expenseError } = await supabase
        .from('gastos_causados')
        .select('amount')
        .gte('date', formatDate(prevStartDate))
        .lte('date', formatDate(prevEndDate));
        
      if (expenseError) throw expenseError;
      
      const incomeTotal = incomeData.reduce((sum, item) => sum + Number(item.amount), 0);
      const expenseTotal = expenseData.reduce((sum, item) => sum + Number(item.amount), 0);
      
      return { incomeTotal, expenseTotal };
    }
  });

  // Calculate variation percentage
  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Calculate burn rate (average monthly expenses)
  const { data: burnRateData, isLoading: isLoadingBurnRate } = useQuery({
    queryKey: ['burn-rate'],
    queryFn: async () => {
      // Get expenses for last 3 months for burn rate calculation
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const { data, error } = await supabase
        .from('gastos_causados')
        .select('date, amount')
        .gte('date', formatDate(threeMonthsAgo));
        
      if (error) throw error;
      
      // Group by month and calculate monthly totals
      const monthlyExpenses: Record<string, number> = {};
      data.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!monthlyExpenses[monthKey]) {
          monthlyExpenses[monthKey] = 0;
        }
        
        monthlyExpenses[monthKey] += Number(expense.amount);
      });
      
      // Calculate average monthly expense (burn rate)
      const monthlyValues = Object.values(monthlyExpenses);
      const burnRate = monthlyValues.length > 0 
        ? monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length
        : 0;
        
      return burnRate;
    }
  });

  // Build final metrics object based on all the data
  const metrics: DashboardMetrics = {
    currentMonthIncome: currentPeriodTotals?.incomeTotal || 0,
    currentMonthExpense: currentPeriodTotals?.expenseTotal || 0,
    cashBalance: (currentPeriodTotals?.incomeTotal || 0) - (currentPeriodTotals?.expenseTotal || 0),
    burnRate: burnRateData || 0,
    monthlyVariation: {
      income: {
        value: (currentPeriodTotals?.incomeTotal || 0) - (previousPeriodTotals?.incomeTotal || 0),
        percentage: calculateVariation(
          currentPeriodTotals?.incomeTotal || 0, 
          previousPeriodTotals?.incomeTotal || 0
        )
      },
      expense: {
        value: (currentPeriodTotals?.expenseTotal || 0) - (previousPeriodTotals?.expenseTotal || 0),
        percentage: calculateVariation(
          currentPeriodTotals?.expenseTotal || 0, 
          previousPeriodTotals?.expenseTotal || 0
        )
      }
    },
    activeClients: clientData.length
  };

  return {
    metrics,
    monthlyData,
    clientData,
    expenseData,
    dateRange: { startDate, endDate },
    isLoading: isLoadingMonthly || 
               isLoadingClients || 
               isLoadingExpenses || 
               isLoadingCurrentPeriod ||
               isLoadingPreviousPeriod ||
               isLoadingBurnRate
  };
};
