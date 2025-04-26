
import { Currency, convertCurrency } from "@/lib/utils";

/**
 * Converts an amount from its original currency to the view currency
 * @param amount The original amount
 * @param fromCurrency The currency of the original amount
 * @param toCurrency The target currency to convert to
 * @returns The converted amount
 */
export const standardizeCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency = "COP"
): number => {
  if (fromCurrency === toCurrency) return amount;
  return convertCurrency(amount, fromCurrency, toCurrency);
};

/**
 * Calculates the cumulative balance from a list of transactions
 * @param transactions Array of transactions with amount and type
 * @returns Array of transactions with balance calculated
 */
export const calculateCumulativeBalance = <T extends { amount: number; type: "Ingreso" | "Gasto" }>(
  transactions: T[]
): (T & { balance: number })[] => {
  let balance = 0;
  return transactions.map(transaction => {
    balance += transaction.type === "Ingreso" ? transaction.amount : -transaction.amount;
    return { ...transaction, balance };
  });
};

/**
 * Groups financial data by month
 * @param data Array of financial records with date and amount
 * @param dateField The field containing the date
 * @param amountField The field containing the amount
 * @returns Object with months as keys and sum of amounts as values
 */
export const groupByMonth = <T extends Record<string, any>>(
  data: T[],
  dateField = "date",
  amountField = "amount"
): Record<string, number> => {
  const monthlyData: Record<string, number> = {};
  
  data.forEach(item => {
    const date = new Date(item[dateField]);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    
    monthlyData[monthKey] += Number(item[amountField]);
  });
  
  return monthlyData;
};

/**
 * Groups financial data by a specific field
 * @param data Array of financial records
 * @param field The field to group by
 * @param amountField The field containing the amount
 * @returns Array of objects with the field and sum
 */
export const groupByField = <T extends Record<string, any>>(
  data: T[],
  field: keyof T,
  amountField = "amount"
): Array<{ label: string; value: number }> => {
  const groups: Record<string, number> = {};
  
  data.forEach(item => {
    const key = String(item[field]) || "Sin definir";
    
    if (!groups[key]) {
      groups[key] = 0;
    }
    
    groups[key] += Number(item[amountField]);
  });
  
  return Object.entries(groups).map(([label, value]) => ({ label, value }));
};

/**
 * Calculates financial projections based on historical data
 * @param monthlyData Array of monthly data with income and expenses
 * @param months Number of months to project forward
 * @returns Projected values for income, expenses, and balance
 */
export const calculateFinancialProjection = (
  monthlyData: Array<{ total_income: number; total_expense: number }>,
  months = 6
): { projectedIncome: number; projectedExpense: number; projectedBalance: number } => {
  if (monthlyData.length === 0) {
    return { projectedIncome: 0, projectedExpense: 0, projectedBalance: 0 };
  }
  
  // Calculate averages
  const avgIncome = monthlyData.reduce((sum, month) => sum + month.total_income, 0) / monthlyData.length;
  const avgExpense = monthlyData.reduce((sum, month) => sum + month.total_expense, 0) / monthlyData.length;
  
  // Project forward
  const projectedIncome = avgIncome * months;
  const projectedExpense = avgExpense * months;
  const projectedBalance = projectedIncome - projectedExpense;
  
  return { projectedIncome, projectedExpense, projectedBalance };
};

/**
 * Calculates key financial metrics
 * @param totalIncome Total income amount
 * @param totalExpense Total expense amount
 * @param cashBalance Current cash balance
 * @returns Object with calculated financial metrics
 */
export const calculateFinancialMetrics = (
  totalIncome: number,
  totalExpense: number,
  cashBalance: number
): { profitMargin: number; netIncome: number; runway: number } => {
  const netIncome = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
  const monthlyExpense = totalExpense / 6; // Assuming 6-month period
  const runway = monthlyExpense > 0 ? cashBalance / monthlyExpense : 0;
  
  return { profitMargin, netIncome, runway };
};

/**
 * Calculates Monthly Recurring Revenue (MRR) excluding partner contributions
 * @param incomes Array of income records
 * @param recurringPayments Array of recurring payments
 * @returns MRR value in COP
 */
export const calculateMRR = (
  incomes: Array<{ amount: number; currency: Currency; type: string; date: Date }>,
  recurringPayments: Array<{ amount: number; currency: Currency; type: string; frequency: string }>
): number => {
  // Filter out partner contributions
  const operationalIncomes = incomes.filter(income => income.type !== "Aporte de socio");
  
  // Get monthly income from standard income records
  const monthlyIncome = operationalIncomes.reduce((sum, income) => {
    // Convert to COP if needed
    const amountInCOP = standardizeCurrency(income.amount, income.currency, "COP");
    return sum + amountInCOP;
  }, 0);
  
  // Add normalized recurring payments
  const normalizedRecurringIncome = recurringPayments.reduce((sum, payment) => {
    if (payment.type !== "Recurrente") return sum;
    
    // Convert to COP first
    const amountInCOP = standardizeCurrency(payment.amount, payment.currency, "COP");
    
    // Normalize based on frequency
    switch (payment.frequency) {
      case "Mensual":
        return sum + amountInCOP;
      case "Trimestral":
        return sum + amountInCOP / 3;
      case "Semestral":
        return sum + amountInCOP / 6;
      case "Anual":
        return sum + amountInCOP / 12;
      case "Semanal":
        return sum + amountInCOP * 4; // Approximate 4 weeks per month
      case "Quincenal":
        return sum + amountInCOP * 2; // 2 fortnights per month
      default:
        return sum + amountInCOP;
    }
  }, 0);
  
  return monthlyIncome + normalizedRecurringIncome;
};

/**
 * Calculate average ticket size (average income per client)
 * @param totalOperationalIncome Total operational income (excluding partner contributions)
 * @param activeClientCount Number of active clients
 * @returns Average ticket size
 */
export const calculateAverageTicket = (
  totalOperationalIncome: number,
  activeClientCount: number
): number => {
  if (activeClientCount === 0) return 0;
  return totalOperationalIncome / activeClientCount;
};

/**
 * Calculates the estimated client lifetime value
 * @param averageTicket The average monthly revenue per client
 * @param averageDuration The average client duration in months
 * @returns The lifetime value
 */
export const calculateLTV = (averageTicket: number, averageDuration = 12): number => {
  return averageTicket * averageDuration;
};

/**
 * Calculates monthly variation as a percentage
 * @param currentValue The current month's value
 * @param previousValue The previous month's value
 * @returns Percentage variation
 */
export const calculateMonthlyVariation = (currentValue: number, previousValue: number): number => {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};

/**
 * Normalize monthly data for charting
 * @param data Raw monthly data
 * @returns Formatted data for charts
 */
export const normalizeMonthlyData = (
  data: Array<{ month: string; year: number; ingresos?: number; gastos?: number; total_income?: number; total_expense?: number }>
): Array<{ name: string; ingresos: number; gastos: number; balance: number }> => {
  return data.map(item => {
    const ingresos = item.ingresos || item.total_income || 0;
    const gastos = item.gastos || item.total_expense || 0;
    
    return {
      name: `${item.month.substring(0, 3)} ${item.year}`,
      ingresos,
      gastos,
      balance: ingresos - gastos
    };
  });
};

/**
 * Filter operational incomes (excluding partner contributions)
 * @param incomes Array of income records
 * @returns Filtered operational incomes with amounts in COP
 */
export const filterOperationalIncomes = (
  incomes: Array<{ amount: number; currency: Currency; type: string; date: Date }>
): Array<{ amount: number; currency: Currency; type: string; date: Date }> => {
  return incomes
    .filter(income => income.type !== "Aporte de socio")
    .map(income => ({
      ...income,
      amount: standardizeCurrency(income.amount, income.currency, "COP"),
      currency: "COP" as Currency
    }));
};
