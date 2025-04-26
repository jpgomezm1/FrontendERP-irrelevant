
import { useMemo } from 'react';
import { Currency, convertCurrency } from '@/lib/utils';

export interface FinancialKPI {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: number;
  previousValue?: number;
  description: string;
}

export interface FinancialKPIsOptions {
  totalIncome: number;
  totalExpense: number;
  previousIncome?: number;
  previousExpense?: number;
  cashBalance: number;
  burnRate: number;
  marketingExpense?: number;
}

export const useFinancialKPIs = (options: FinancialKPIsOptions, viewCurrency: Currency = 'COP') => {
  const {
    totalIncome,
    totalExpense,
    previousIncome,
    previousExpense,
    cashBalance,
    burnRate,
    marketingExpense
  } = options;

  const kpis = useMemo(() => {
    // Calculate net income (profit margin)
    const netIncome = totalIncome - totalExpense;
    const previousNetIncome = (previousIncome && previousExpense) 
      ? previousIncome - previousExpense 
      : undefined;
    
    // Calculate profit margin percentage
    const profitMargin = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
    const previousProfitMargin = (previousIncome && previousIncome > 0 && previousNetIncome !== undefined)
      ? (previousNetIncome / previousIncome) * 100
      : undefined;
    
    const profitMarginTrend = previousProfitMargin !== undefined
      ? profitMargin > previousProfitMargin ? 'up' : profitMargin < previousProfitMargin ? 'down' : 'neutral'
      : 'neutral';
    
    // Calculate marketing ROI
    const marketingROI = marketingExpense && marketingExpense > 0
      ? totalIncome / marketingExpense
      : null;

    // Calculate runway (months of operation covered)
    const runway = burnRate > 0
      ? cashBalance / burnRate
      : Infinity;

    // Calculate burn rate trend
    const burnRateTrend = previousExpense !== undefined
      ? burnRate > previousExpense ? 'up' : burnRate < previousExpense ? 'down' : 'neutral'
      : 'neutral';

    return {
      profitMargin: {
        label: 'Margen de Utilidad',
        value: profitMargin,
        unit: '%',
        trend: profitMarginTrend,
        trendValue: previousProfitMargin !== undefined ? profitMargin - previousProfitMargin : undefined,
        previousValue: previousProfitMargin,
        description: 'Utilidad / Ingresos Totales'
      },
      marketingROI: marketingROI !== null ? {
        label: 'ROI Marketing',
        value: marketingROI,
        unit: 'x',
        trend: marketingROI > 1 ? 'up' : 'down',
        description: 'Ingresos / Gastos de Marketing'
      } : null,
      cashBalance: {
        label: 'Efectivo Disponible',
        value: cashBalance,
        unit: viewCurrency,
        trend: cashBalance > 0 ? 'up' : 'down',
        description: 'Saldo acumulado actual'
      },
      runway: {
        label: 'Meses de Operación Cubiertos',
        value: runway === Infinity ? 0 : runway,
        unit: 'meses',
        trend: runway > 6 ? 'up' : runway < 3 ? 'down' : 'neutral',
        description: 'Efectivo / Burn Rate Mensual'
      },
      burnRate: {
        label: 'Burn Rate Mensual',
        value: burnRate,
        unit: viewCurrency,
        trend: burnRateTrend,
        previousValue: previousExpense,
        description: 'Gasto mensual promedio'
      }
    };
  }, [totalIncome, totalExpense, previousIncome, previousExpense, cashBalance, burnRate, marketingExpense, viewCurrency]);

  return { kpis };
};
