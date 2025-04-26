
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
