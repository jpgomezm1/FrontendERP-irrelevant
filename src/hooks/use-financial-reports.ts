
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { Currency, convertCurrency } from "@/lib/utils";

export type ReportPeriod = "mensual" | "trimestral" | "semestral" | "anual" | "personalizado";

// Define the date range type for our custom filter
export interface DateRangeFilter {
  from: Date;
  to: Date;
}

export interface FinancialReportMetrics {
  total_income: number;
  total_expense: number;
  net_income: number;
  accumulated_balance: number;
  expense_by_category: Array<{
    category: string;
    total: number;
  }>;
  income_by_client: Array<{
    client: string;
    total: number;
  }>;
  monthly_data: Array<{
    month: string;
    year: number;
    total_income: number;
    total_expense: number;
    net_income: number;
  }>;
  cash_flow_runway: number; // Added for runway calculation
  burn_rate: number; // Added for burn rate calculation
}

export const useFinancialReports = (
  period: ReportPeriod = "semestral",
  dateRange?: DateRangeFilter,
  viewCurrency: Currency = "COP"
) => {
  // Calculate date range based on period
  const today = new Date();
  
  // Determine the appropriate date range
  const calculateDateRange = (): DateRangeFilter => {
    if (dateRange) {
      return {
        from: startOfDay(dateRange.from),
        to: endOfDay(dateRange.to)
      };
    }

    const endDate = endOfDay(today);
    let startDate;

    switch (period) {
      case "mensual":
        startDate = startOfMonth(today);
        break;
      case "trimestral":
        startDate = startOfMonth(subMonths(today, 3));
        break;
      case "semestral":
        startDate = startOfMonth(subMonths(today, 6));
        break;
      case "anual":
        startDate = startOfMonth(subMonths(today, 12));
        break;
      default:
        // Default to semestral if not specified
        startDate = startOfMonth(subMonths(today, 6));
    }

    return {
      from: startDate,
      to: endDate
    };
  };

  const { from: startDate, to: endDate } = calculateDateRange();

  // Format dates for database queries
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(endDate, 'yyyy-MM-dd');

  // Fetch incomes data - only PAID incomes
  const { data: incomesData = [], isLoading: isLoadingIncomes } = useQuery({
    queryKey: ['financial-reports-incomes', formattedStartDate, formattedEndDate],
    queryFn: async () => {
      // Get incomes from the incomes table
      const { data: manualIncomes, error: manualIncomesError } = await supabase
        .from('incomes')
        .select('*')
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate);

      if (manualIncomesError) {
        console.error("Error fetching manual incomes:", manualIncomesError);
        throw manualIncomesError;
      }

      // Get incomes from the payments table (only paid payments)
      const { data: projectPayments, error: projectPaymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          projects (name),
          clients (name)
        `)
        .eq('status', 'Pagado')  // Only paid payments
        .not('paiddate', 'is', null) // Must have a payment date
        .gte('paiddate', formattedStartDate)
        .lte('paiddate', formattedEndDate);

      if (projectPaymentsError) {
        console.error("Error fetching project payments:", projectPaymentsError);
        throw projectPaymentsError;
      }

      // Process and standardize all incomes to COP
      const processedIncomes = [
        // Process manual incomes
        ...(manualIncomes || []).map(income => {
          const amountInCOP = income.currency === "COP" 
            ? income.amount 
            : convertCurrency(income.amount, income.currency as Currency, "COP");
          
          return {
            id: income.id,
            date: new Date(income.date),
            description: income.description,
            client: income.client || "Sin cliente",
            amount: amountInCOP,
            originalAmount: income.amount,
            originalCurrency: income.currency as Currency,
            category: income.type,
            source: "Manual"
          };
        }),
        
        // Process project payments
        ...(projectPayments || []).map(payment => {
          const amountInCOP = payment.currency === "COP" 
            ? payment.amount 
            : convertCurrency(payment.amount, payment.currency as Currency, "COP");
          
          return {
            id: payment.id,
            date: new Date(payment.paiddate || payment.date),
            description: `Payment for ${payment.projects?.name || 'Project'}`,
            client: payment.clients?.name || "Sin cliente",
            amount: amountInCOP,
            originalAmount: payment.amount,
            originalCurrency: payment.currency as Currency,
            category: payment.type === 'Implementación' ? 'Ingreso Implementación' : 'Ingreso Recurrente',
            source: "Project"
          };
        })
      ];

      return processedIncomes;
    }
  });

  // Fetch paid expenses data
  const { data: expensesData = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['financial-reports-expenses', formattedStartDate, formattedEndDate],
    queryFn: async () => {
      // Use gastos_causados table for actual expenses, filtered by status "pagado"
      const { data: causedExpenses, error: expensesError } = await supabase
        .from('gastos_causados')
        .select('*')
        .eq('status', 'pagado')
        .not('paid_date', 'is', null) // Must have a paid date
        .gte('paid_date', formattedStartDate)
        .lte('paid_date', formattedEndDate);

      if (expensesError) {
        console.error("Error fetching expenses:", expensesError);
        throw expensesError;
      }

      // Process and standardize all expenses to COP
      const processedExpenses = (causedExpenses || []).map(expense => {
        const amountInCOP = expense.currency === "COP" 
          ? expense.amount 
          : convertCurrency(expense.amount, expense.currency as Currency, "COP");
        
        return {
          id: expense.id,
          date: new Date(expense.paid_date || expense.date),
          description: expense.description,
          amount: amountInCOP,
          originalAmount: expense.amount,
          originalCurrency: expense.currency as Currency,
          category: expense.category,
          source: expense.source_type === "recurrente" ? "Recurrente" : "Variable"
        };
      });

      return processedExpenses;
    }
  });

  // Calculate monthly summary data for the charts
  const { data: monthlyData = [], isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['monthly-summary', formattedStartDate, formattedEndDate, incomesData, expensesData],
    queryFn: async () => {
      // Group data by month
      const monthlyMap = new Map();
      
      // Add incomes to monthly data
      incomesData.forEach(income => {
        const date = new Date(income.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthName = date.toLocaleString('default', { month: 'long' });
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthName,
            year: date.getFullYear(),
            total_income: 0,
            total_expense: 0,
            net_income: 0
          });
        }
        
        const monthData = monthlyMap.get(monthKey);
        monthData.total_income += income.amount;
        monthData.net_income = monthData.total_income - monthData.total_expense;
      });
      
      // Add expenses to monthly data
      expensesData.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthName = date.toLocaleString('default', { month: 'long' });
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthName,
            year: date.getFullYear(),
            total_income: 0,
            total_expense: 0,
            net_income: 0
          });
        }
        
        const monthData = monthlyMap.get(monthKey);
        monthData.total_expense += expense.amount;
        monthData.net_income = monthData.total_income - monthData.total_expense;
      });
      
      // Convert map to array and sort by date
      const monthlyArray = Array.from(monthlyMap.values());
      
      // Sort months chronologically
      monthlyArray.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return new Date(Date.parse(`1 ${a.month} 2000`)).getMonth() - 
               new Date(Date.parse(`1 ${b.month} 2000`)).getMonth();
      });
      
      return monthlyArray;
    },
    enabled: !isLoadingIncomes && !isLoadingExpenses
  });

  // Calculate expense categories
  const { data: expenseCategories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['expense-categories', formattedStartDate, formattedEndDate, expensesData],
    queryFn: async () => {
      // Group expenses by category
      const categoryMap = new Map();
      
      expensesData.forEach(expense => {
        const category = expense.category || "Sin categoría";
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            total: 0
          });
        }
        
        const categoryData = categoryMap.get(category);
        categoryData.total += expense.amount;
      });
      
      // Convert map to array and sort by total
      const categoryArray = Array.from(categoryMap.values());
      categoryArray.sort((a, b) => b.total - a.total);
      
      return categoryArray;
    },
    enabled: !isLoadingExpenses
  });

  // Calculate income by client
  const { data: incomeByClient = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['income-by-client', formattedStartDate, formattedEndDate, incomesData],
    queryFn: async () => {
      // Group incomes by client
      const clientMap = new Map();
      
      incomesData.forEach(income => {
        const client = income.client || "Sin cliente";
        
        if (!clientMap.has(client)) {
          clientMap.set(client, {
            client,
            total: 0
          });
        }
        
        const clientData = clientMap.get(client);
        clientData.total += income.amount;
      });
      
      // Convert map to array and sort by total
      const clientArray = Array.from(clientMap.values());
      clientArray.sort((a, b) => b.total - a.total);
      
      return clientArray;
    },
    enabled: !isLoadingIncomes
  });

  // Calculate total income, expense and accumulated balance
  const totalIncome = incomesData.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
  const accumulatedBalance = totalIncome - totalExpense;
  
  // Calculate burn rate (average monthly expense)
  const burnRate = monthlyData.length > 0 
    ? monthlyData.reduce((sum, month) => sum + month.total_expense, 0) / monthlyData.length
    : 0;
  
  // Calculate cash flow runway (in months)
  const cashFlowRunway = burnRate > 0 ? accumulatedBalance / burnRate : 0;

  const reportMetrics: FinancialReportMetrics = {
    total_income: totalIncome,
    total_expense: totalExpense,
    net_income: totalIncome - totalExpense,
    accumulated_balance: accumulatedBalance,
    expense_by_category: expenseCategories,
    income_by_client: incomeByClient,
    monthly_data: monthlyData,
    burn_rate: burnRate,
    cash_flow_runway: cashFlowRunway
  };

  return {
    metrics: reportMetrics,
    dateRange: { startDate, endDate },
    period,
    isLoading: isLoadingIncomes || isLoadingExpenses || isLoadingMonthly || isLoadingCategories || isLoadingClients,
    incomesData,
    expensesData,
  };
};
