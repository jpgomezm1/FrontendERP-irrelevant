
import { addMonths } from "date-fns";

interface MonthlyData {
  name: string;
  ingresos: number;
  gastos: number;
  balance: number;
}

export function generateProjections(historicalData: MonthlyData[]) {
  // Calculate average growth rates
  const avgIncomeGrowth = calculateGrowthRate(historicalData.map(d => d.ingresos));
  const avgExpenseGrowth = calculateGrowthRate(historicalData.map(d => d.gastos));

  // Generate 6 months of projections
  return Array(6).fill(0).map((_, i) => {
    const lastMonth = historicalData[0];
    const projectedMonth = addMonths(new Date(), i + 1);
    
    return {
      month: projectedMonth.toLocaleString('default', { month: 'short' }),
      year: projectedMonth.getFullYear(),
      projectedIncome: lastMonth.ingresos * Math.pow(1 + avgIncomeGrowth, i + 1),
      projectedExpense: lastMonth.gastos * Math.pow(1 + avgExpenseGrowth, i + 1),
      projectedBalance: lastMonth.ingresos * Math.pow(1 + avgIncomeGrowth, i + 1) - 
                       lastMonth.gastos * Math.pow(1 + avgExpenseGrowth, i + 1)
    };
  });
}

export function generateClientProfitability(clientIncome: Array<{ name: string, value: number }>) {
  return clientIncome.map(client => ({
    name: client.name,
    revenue: client.value,
    cost: client.value * 0.7, // Simplified cost calculation
    profit: client.value * 0.3,
    margin: 30
  }));
}

function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0;
  const oldest = values[values.length - 1];
  const newest = values[0];
  return oldest === 0 ? 0 : (newest / oldest - 1) / values.length;
}
