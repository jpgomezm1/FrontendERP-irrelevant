import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCashFlow } from "@/services/financeService";
import { convertCurrency, Currency } from "@/lib/utils";

export interface MovementsFilter {
  startDate?: Date;
  endDate?: Date;
  type?: "Ingreso" | "Gasto" | "all";
  category?: string;
}

export const useMovements = (filters?: MovementsFilter) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['cash-flow-movements', filters],
    queryFn: () => getCashFlow(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const refreshCashFlow = () => {
    queryClient.invalidateQueries({ queryKey: ['cash-flow-movements'] });
  };

  // Convert all amounts to COP and calculate aggregated metrics
  const convertedData = query.data?.map(item => ({
    ...item,
    originalCurrency: item.currency === 'USD' ? 'USD' as Currency : undefined,
    originalAmount: item.currency === 'USD' ? item.amount : undefined,
    amount: item.currency === 'USD' ? 
      convertCurrency(item.amount, 'USD', 'COP') : 
      item.amount,
    currency: 'COP' as Currency // Standardize to COP
  }));

  // Since data is already deduplicated in getCashFlow, we can calculate metrics directly
  // Get total income by filtering income transactions
  const totalIncome = convertedData?.filter(item => item.type === 'Ingreso')
    .reduce((sum, item) => sum + item.amount, 0) || 0;
    
  // Get total expense by filtering expense transactions
  const totalExpense = convertedData?.filter(item => item.type === 'Gasto')
    .reduce((sum, item) => sum + item.amount, 0) || 0;
    
  // Calculate the current balance
  const currentBalance = totalIncome - totalExpense;

  // Calculate monthly averages for last 6 months
  const calculateMonthlyAverages = () => {
    if (!convertedData?.length) return { avgIncome: 0, avgExpense: 0 };
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Group by month
    const monthlyData = convertedData
      .filter(item => item.date >= sixMonthsAgo)
      .reduce((acc, item) => {
        const monthKey = `${item.date.getFullYear()}-${item.date.getMonth()}`;
        if (!acc[monthKey]) {
          acc[monthKey] = { income: 0, expense: 0 };
        }
        
        if (item.type === 'Ingreso') {
          acc[monthKey].income += item.amount;
        } else {
          acc[monthKey].expense += item.amount;
        }
        
        return acc;
      }, {} as Record<string, { income: number; expense: number }>);
    
    // Calculate averages
    const months = Object.values(monthlyData);
    const avgIncome = months.length > 0 
      ? months.reduce((sum, month) => sum + month.income, 0) / months.length
      : 0;
      
    const avgExpense = months.length > 0
      ? months.reduce((sum, month) => sum + month.expense, 0) / months.length
      : 0;
      
    return { avgIncome, avgExpense };
  };
  
  const { avgIncome, avgExpense } = calculateMonthlyAverages();
  
  // Calculate runway (in months) based on current balance and average monthly expense
  const runway = avgExpense > 0 ? currentBalance / avgExpense : 999;

  // Get client breakdown (with all amounts in COP)
  const clientBreakdown = () => {
    if (!convertedData?.length) return [];
    
    // Use a Map to ensure we don't have duplicate client entries
    const clientMap = new Map<string, { 
      name: string; 
      total: number; 
      count: number; 
      average: number;
      transactions: { date: Date; amount: number; description: string }[]; 
    }>();
    
    // Process income transactions only
    convertedData
      .filter(item => item.type === 'Ingreso' && item.client)
      .forEach(item => {
        const clientName = item.client || 'Unknown';
        
        if (!clientMap.has(clientName)) {
          clientMap.set(clientName, {
            name: clientName,
            total: 0,
            count: 0,
            average: 0,
            transactions: []
          });
        }
        
        const clientData = clientMap.get(clientName)!;
        
        // Add transaction data
        clientData.transactions.push({
          date: item.date,
          amount: item.amount,
          description: item.description
        });
        
        // Update totals
        clientData.total += item.amount;
        clientData.count += 1;
      });
    
    // Calculate averages and convert to array
    return Array.from(clientMap.values()).map(client => ({
      name: client.name,
      total: client.total,
      count: client.count,
      average: client.count > 0 ? client.total / client.count : 0,
      // Exclude the transactions array from the result
      // as we only needed it for calculation
    }));
  };
  
  // Get monthly data for charts (with all amounts in COP)
  const getMonthlyData = () => {
    if (!convertedData?.length) return [];
    
    // Create a map of months with default values
    const monthlyMap: Record<string, { 
      name: string; 
      ingresos: number; 
      gastos: number; 
      balance: number;
      month: number;
      year: number;
    }> = {};
    
    // Get range of months to include (last 12 months)
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const monthKey = `${year}-${month}`;
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      
      monthlyMap[monthKey] = {
        name: `${monthName} ${year}`,
        ingresos: 0,
        gastos: 0,
        balance: 0,
        month,
        year
      };
    }
    
    // Populate with actual data (all in COP)
    convertedData?.forEach(item => {
      const year = item.date.getFullYear();
      const month = item.date.getMonth();
      const monthKey = `${year}-${month}`;
      
      // Only include if within the last 12 months
      if (monthlyMap[monthKey]) {
        if (item.type === 'Ingreso') {
          monthlyMap[monthKey].ingresos += item.amount;
        } else {
          monthlyMap[monthKey].gastos += item.amount;
        }
      }
    });
    
    // Calculate balance for each month
    Object.values(monthlyMap).forEach(month => {
      month.balance = month.ingresos - month.gastos;
    });
    
    // Convert to array and sort by date (newest first)
    return Object.values(monthlyMap).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  };

  return {
    ...query,
    data: convertedData,
    refreshCashFlow,
    metrics: {
      totalIncome,
      totalExpense,
      currentBalance,
      avgIncome,
      avgExpense,
      runway
    },
    clientBreakdown: clientBreakdown(),
    monthlyData: getMonthlyData()
  };
};