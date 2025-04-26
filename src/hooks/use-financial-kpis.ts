
import { useMemo } from 'react';
import { Currency } from '@/lib/utils';
import { 
  standardizeCurrency, 
  calculateMRR, 
  calculateAverageTicket, 
  calculateLTV,
  calculateMonthlyVariation 
} from '@/utils/financial-calculations';

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
  operationalIncome: number;  // Income excluding partner contributions
  previousIncome?: number;
  previousExpense?: number;
  previousOperationalIncome?: number;
  cashBalance: number;
  burnRate: number;
  marketingExpense?: number;
  activeClients: number;
  previousActiveClients?: number;
  activeProjects: number;
  recurringPayments?: Array<{ amount: number; currency: Currency; type: string; frequency: string }>;
}

export const useFinancialKPIs = (options: FinancialKPIsOptions, viewCurrency: Currency = 'COP') => {
  const {
    totalIncome,
    totalExpense,
    operationalIncome,
    previousIncome,
    previousExpense,
    previousOperationalIncome,
    cashBalance,
    burnRate,
    marketingExpense,
    activeClients,
    previousActiveClients,
    activeProjects,
    recurringPayments = []
  } = options;

  const kpis = useMemo(() => {
    // Calculate net income (profit margin)
    const netIncome = totalIncome - totalExpense;
    const previousNetIncome = (previousIncome !== undefined && previousExpense !== undefined) 
      ? previousIncome - previousExpense 
      : undefined;
    
    // Calculate profit margin percentage based on operational income
    const profitMargin = operationalIncome > 0 ? (netIncome / operationalIncome) * 100 : 0;
    const previousProfitMargin = (previousOperationalIncome !== undefined && previousOperationalIncome > 0 && previousNetIncome !== undefined)
      ? (previousNetIncome / previousOperationalIncome) * 100
      : undefined;
    
    const profitMarginTrend = previousProfitMargin !== undefined
      ? profitMargin > previousProfitMargin ? 'up' : profitMargin < previousProfitMargin ? 'down' : 'neutral'
      : 'neutral';
    
    // Calculate MRR (Monthly Recurring Revenue) - excluding partner contributions
    const mrr = calculateMRR([], recurringPayments);
    
    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12;
    
    // Calculate average ticket size (revenue per client)
    const averageTicket = calculateAverageTicket(operationalIncome, activeClients);
    
    // Calculate projects per client
    const projectsPerClient = activeClients > 0 ? activeProjects / activeClients : 0;
    
    // Calculate client LTV (Lifetime Value)
    const ltv = calculateLTV(averageTicket);
    
    // Calculate marketing ROI
    const marketingROI = marketingExpense && marketingExpense > 0
      ? operationalIncome / marketingExpense
      : null;

    // Calculate runway (months of operation covered)
    const runway = burnRate > 0
      ? cashBalance / burnRate
      : Infinity;

    // Calculate burn rate trend
    const burnRateTrend = previousExpense !== undefined
      ? burnRate > previousExpense ? 'up' : burnRate < previousExpense ? 'down' : 'neutral'
      : 'neutral';
      
    // Calculate monthly income variation
    const incomeVariation = previousOperationalIncome !== undefined
      ? calculateMonthlyVariation(operationalIncome, previousOperationalIncome)
      : 0;
      
    // Calculate client variation (churn approximation)
    const clientsVariation = previousActiveClients !== undefined
      ? calculateMonthlyVariation(activeClients, previousActiveClients)
      : 0;

    return {
      mrr: {
        label: 'MRR',
        value: mrr,
        unit: viewCurrency,
        trend: previousOperationalIncome !== undefined 
          ? mrr > previousOperationalIncome ? 'up' : 'down' 
          : 'neutral',
        description: 'Ingresos Mensuales Recurrentes'
      },
      arr: {
        label: 'ARR',
        value: arr,
        unit: viewCurrency,
        trend: 'neutral',  // We don't track ARR variation directly
        description: 'Ingresos Anuales Recurrentes'
      },
      profitMargin: {
        label: 'Margen de Utilidad',
        value: profitMargin,
        unit: '%',
        trend: profitMarginTrend,
        trendValue: previousProfitMargin !== undefined ? profitMargin - previousProfitMargin : undefined,
        previousValue: previousProfitMargin,
        description: 'Utilidad / Ingresos Totales'
      },
      activeClients: {
        label: 'Clientes Activos',
        value: activeClients,
        unit: 'clientes',
        trend: clientsVariation > 0 ? 'up' : clientsVariation < 0 ? 'down' : 'neutral',
        trendValue: clientsVariation,
        description: 'Clientes con proyectos activos'
      },
      activeProjects: {
        label: 'Proyectos Activos',
        value: activeProjects,
        unit: 'proyectos',
        trend: 'neutral', // We don't track project variation directly
        description: 'Proyectos con estado activo'
      },
      projectsPerClient: {
        label: 'Proyectos por Cliente',
        value: projectsPerClient,
        unit: 'x',
        trend: 'neutral', // We don't track this variation directly
        description: 'Proyectos Activos / Clientes Activos'
      },
      marketingROI: marketingROI !== null ? {
        label: 'ROI Marketing',
        value: marketingROI,
        unit: 'x',
        trend: marketingROI > 1 ? 'up' : 'down',
        description: 'Ingresos / Gastos de Marketing'
      } : null,
      averageTicket: {
        label: 'Ticket Promedio',
        value: averageTicket,
        unit: viewCurrency,
        trend: 'neutral', // We don't track ticket variation directly
        description: 'Ingreso Promedio por Cliente'
      },
      ltv: {
        label: 'Lifetime Value (LTV)',
        value: ltv,
        unit: viewCurrency,
        trend: 'neutral', // We don't track LTV variation directly
        description: 'Valor de vida del cliente'
      },
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
      },
      incomeVariation: {
        label: 'Variación de Ingresos',
        value: incomeVariation,
        unit: '%',
        trend: incomeVariation > 0 ? 'up' : incomeVariation < 0 ? 'down' : 'neutral',
        description: 'Variación vs mes anterior'
      }
    };
  }, [
    totalIncome, 
    totalExpense, 
    operationalIncome,
    previousIncome, 
    previousExpense, 
    previousOperationalIncome,
    cashBalance, 
    burnRate, 
    marketingExpense,
    activeClients,
    previousActiveClients,
    activeProjects,
    recurringPayments,
    viewCurrency
  ]);

  return { kpis };
};
