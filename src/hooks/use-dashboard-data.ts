
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, convertCurrency, Currency } from "@/lib/utils";
import { standardizeCurrency } from "@/utils/financial-calculations";
import { useState } from "react";

export interface DashboardMetrics {
  currentMonthIncome: number;
  currentMonthExpense: number;
  previousMonthIncome: number;
  previousMonthExpense: number;
  cashBalance: number;
  monthlyVariation: {
    income: { value: number; percentage: number };
    expense: { value: number; percentage: number };
  };
  activeClients: number;
  previousActiveClients: number;
  activeProjects: number;
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
        .select('date, amount, currency, type')
        .order('date', { ascending: false });
        
      if (incomesError) throw incomesError;
      
      // Get expense data from gastos_causados instead of expenses table
      const { data: expensesData, error: expensesError } = await supabase
        .from('gastos_causados')
        .select('date, amount, currency, status')
        .eq('status', 'pagado') // Only consider paid expenses
        .order('date', { ascending: false });
        
      if (expensesError) throw expensesError;
      
      // Group by month and combine data
      const monthlyTotals: Record<string, any> = {};
      
      // Process incomes - filter out partner contributions and convert currencies
      incomesData
        .filter(income => income.type !== 'Aporte de socio') // Exclude partner contributions
        .forEach(income => {
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
          
          // Convert all incomes to COP for consistent calculation
          const amountInCOP = standardizeCurrency(
            Number(income.amount), 
            income.currency as Currency,
            "COP"
          );
          
          monthlyTotals[monthKey].total_income += amountInCOP;
        });
      
      // Process expenses with currency conversion to COP
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
        
        // Convert all expenses to COP for consistent calculation
        const amountInCOP = standardizeCurrency(
          Number(expense.amount),
          expense.currency as Currency,
          "COP"
        );
        
        monthlyTotals[monthKey].total_expense += amountInCOP;
      });
      
      return Object.values(monthlyTotals)
        .sort((a: any, b: any) => {
          // Sort by year (descending) and then by month (descending)
          if (a.year !== b.year) return b.year - a.year;
          return new Date(0, b.month).getMonth() - new Date(0, a.month).getMonth();
        });
    }
  });

  // Fetch client data with currency standardization
  const { data: clientData = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['client-income', period],
    queryFn: async () => {
      // Get only operational incomes, exclude partner contributions
      const { data, error } = await supabase
        .from('incomes')
        .select('client, amount, currency, type')
        .neq('type', 'Aporte de socio') // Exclude partner contributions
        .gte('date', formatDate(startDate))
        .lte('date', formatDate(endDate));
        
      if (error) throw error;
      
      // Group by client and sum amounts with currency conversion to COP
      const clientTotals: Record<string, number> = {};
      data.forEach(income => {
        const client = income.client || 'Sin Cliente';
        if (!clientTotals[client]) {
          clientTotals[client] = 0;
        }
        
        // Convert all amounts to COP
        const amountInCOP = standardizeCurrency(
          Number(income.amount),
          income.currency as Currency,
          "COP"
        );
        
        clientTotals[client] += amountInCOP;
      });
      
      return Object.entries(clientTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    }
  });

  // Count active projects
  const { data: activeProjectsCount = 0, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['active-projects'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Activo');
        
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch expense categories with currency standardization
  const { data: expenseData = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expense-categories', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gastos_causados')
        .select('category, amount, currency, status')
        .eq('status', 'pagado') // Only consider paid expenses
        .gte('date', formatDate(startDate))
        .lte('date', formatDate(endDate));

      if (error) throw error;

      // Group by category and sum amounts with currency conversion to COP
      const categories = data.reduce((acc: { [key: string]: number }, curr) => {
        if (!acc[curr.category]) {
          acc[curr.category] = 0;
        }
        
        // Convert all expenses to COP for consistent calculation
        const amountInCOP = standardizeCurrency(
          Number(curr.amount),
          curr.currency as Currency,
          "COP"
        );
          
        acc[curr.category] += amountInCOP;
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

  // Get current period expense and income totals with currency standardization
  const { data: currentPeriodTotals, isLoading: isLoadingCurrentPeriod } = useQuery({
    queryKey: ['current-period-totals', period],
    queryFn: async () => {
      // Get operational income total (exclude partner contributions)
      const { data: incomeData, error: incomeError } = await supabase
        .from('incomes')
        .select('amount, currency, type')
        .neq('type', 'Aporte de socio')
        .gte('date', formatDate(startDate))
        .lte('date', formatDate(endDate));
        
      if (incomeError) throw incomeError;
      
      // Get expense total from gastos_causados with currency conversion
      const { data: expenseData, error: expenseError } = await supabase
        .from('gastos_causados')
        .select('amount, currency, status')
        .eq('status', 'pagado') // Only consider paid expenses
        .gte('date', formatDate(startDate))
        .lte('date', formatDate(endDate));
        
      if (expenseError) throw expenseError;
      
      // Calculate income total with currency conversion to COP
      const incomeTotal = incomeData.reduce((sum, item) => {
        const amountInCOP = standardizeCurrency(
          Number(item.amount),
          item.currency as Currency,
          "COP"
        );
        return sum + amountInCOP;
      }, 0);
      
      // Calculate expense total with currency conversion to COP
      const expenseTotal = expenseData.reduce((sum, item) => {
        const amountInCOP = standardizeCurrency(
          Number(item.amount),
          item.currency as Currency,
          "COP"
        );
        return sum + amountInCOP;
      }, 0);
      
      return { incomeTotal, expenseTotal };
    }
  });

  // Get previous period expense and income totals for comparison
  const { data: previousPeriodTotals, isLoading: isLoadingPreviousPeriod } = useQuery({
    queryKey: ['previous-period-totals', period],
    queryFn: async () => {
      // Get operational income total for previous period (exclude partner contributions)
      const { data: incomeData, error: incomeError } = await supabase
        .from('incomes')
        .select('amount, currency, type')
        .neq('type', 'Aporte de socio')
        .gte('date', formatDate(prevStartDate))
        .lte('date', formatDate(prevEndDate));
        
      if (incomeError) throw incomeError;
      
      // Get expense total for previous period with currency conversion
      const { data: expenseData, error: expenseError } = await supabase
        .from('gastos_causados')
        .select('amount, currency, status')
        .eq('status', 'pagado') // Only consider paid expenses
        .gte('date', formatDate(prevStartDate))
        .lte('date', formatDate(prevEndDate));
        
      if (expenseError) throw expenseError;
      
      // Calculate income total with currency conversion to COP
      const incomeTotal = incomeData.reduce((sum, item) => {
        const amountInCOP = standardizeCurrency(
          Number(item.amount),
          item.currency as Currency,
          "COP"
        );
        return sum + amountInCOP;
      }, 0);
      
      // Calculate expense total with currency conversion to COP
      const expenseTotal = expenseData.reduce((sum, item) => {
        const amountInCOP = standardizeCurrency(
          Number(item.amount),
          item.currency as Currency,
          "COP"
        );
        return sum + amountInCOP;
      }, 0);
      
      return { incomeTotal, expenseTotal };
    }
  });

  // Get active clients count for current and previous periods
  const { data: clientsData, isLoading: isLoadingClientsData } = useQuery({
    queryKey: ['active-clients', period],
    queryFn: async () => {
      // Current period active clients
      const { data: currentClientsData, error: currentClientsError } = await supabase
        .from('incomes')
        .select('client')
        .gte('date', formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))) // Last 30 days
        .order('client');
        
      if (currentClientsError) throw currentClientsError;
      
      // Previous period active clients
      const { data: previousClientsData, error: previousClientsError } = await supabase
        .from('incomes')
        .select('client')
        .gte('date', formatDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)))
        .lt('date', formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
        .order('client');
        
      if (previousClientsError) throw previousClientsError;
      
      // Count unique clients
      const currentActiveClients = new Set(
        currentClientsData.map(item => item.client).filter(Boolean)
      ).size;
      
      const previousActiveClients = new Set(
        previousClientsData.map(item => item.client).filter(Boolean)
      ).size;
      
      return { currentActiveClients, previousActiveClients };
    }
  });

  // Calculate burn rate (average monthly expenses) from gastos_causados
  const { data: burnRateData, isLoading: isLoadingBurnRate } = useQuery({
    queryKey: ['burn-rate'],
    queryFn: async () => {
      // Get expenses for last 6 months for burn rate calculation
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      // Fetch from gastos_causados with currency information
      const { data, error } = await supabase
        .from('gastos_causados')
        .select('date, amount, currency, status')
        .eq('status', 'pagado') // Only consider paid expenses
        .gte('date', formatDate(sixMonthsAgo));
        
      if (error) throw error;
      
      // Group by month and calculate monthly totals with currency conversion to COP
      const monthlyExpenses: Record<string, number> = {};
      data.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!monthlyExpenses[monthKey]) {
          monthlyExpenses[monthKey] = 0;
        }
        
        // Convert all expenses to COP for consistent calculation
        const amountInCOP = standardizeCurrency(
          Number(expense.amount),
          expense.currency as Currency,
          "COP"
        );
        
        monthlyExpenses[monthKey] += amountInCOP;
      });
      
      // Calculate average monthly expense (burn rate)
      const monthlyValues = Object.values(monthlyExpenses);
      const burnRate = monthlyValues.length > 0 
        ? monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length
        : 0;
        
      return burnRate;
    }
  });

  // Calculate variation percentage
  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Build final metrics object based on all the data
  const metrics: DashboardMetrics = {
    currentMonthIncome: currentPeriodTotals?.incomeTotal || 0,
    currentMonthExpense: currentPeriodTotals?.expenseTotal || 0,
    previousMonthIncome: previousPeriodTotals?.incomeTotal || 0,
    previousMonthExpense: previousPeriodTotals?.expenseTotal || 0,
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
    activeClients: clientsData?.currentActiveClients || 0,
    previousActiveClients: clientsData?.previousActiveClients || 0,
    activeProjects: activeProjectsCount
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
               isLoadingBurnRate ||
               isLoadingProjects ||
               isLoadingClientsData
  };
};
