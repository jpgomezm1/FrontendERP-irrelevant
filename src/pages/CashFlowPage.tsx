import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown } from "lucide-react";
import { FinancialMetrics } from "@/components/cash-flow/financial-metrics";
import { AnalysisCharts } from "@/components/cash-flow/analysis-charts";
import { FinancialDashboard } from "@/components/financial/financial-dashboard";
import { FinancialProjections } from "@/components/financial/financial-projections";
import { ClientAnalytics } from "@/components/financial/client-analytics";
import { useCashFlowAnalytics } from "@/hooks/use-cash-flow-analytics";
import { useMovements } from "@/hooks/use-movements";
import { MovementsTab } from "@/components/cash-flow/movements-tab";
import { generateProjections, generateClientProfitability } from "@/utils/financial-utils";
import { TimePeriod } from "@/hooks/use-dashboard-data";

const CashFlowPage = () => {
  const [analysisTimeFrame, setAnalysisTimeFrame] = useState<TimePeriod>("month");
  const { data: analytics, isLoading: isLoadingAnalytics } = useCashFlowAnalytics();
  const { data: movements, isLoading: isLoadingMovements } = useMovements();

  // Create a handler function that correctly converts the string to TimePeriod
  const handleTimeFrameChange = (value: TimePeriod) => {
    setAnalysisTimeFrame(value);
  };

  if (isLoadingMovements) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate financial metrics from movements data
  const calculateFinancialMetrics = () => {
    if (!movements || movements.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        currentBalance: 0,
        averageMonthlyIncome: 0,
        averageMonthlyExpenses: 0,
        runway: 0,
        breakEvenDate: new Date()
      };
    }

    const incomes = movements.filter(m => m.type === 'Ingreso');
    const expenses = movements.filter(m => m.type === 'Gasto');
    
    // Group by month for average calculations
    const monthlyIncomes = new Map();
    const monthlyExpenses = new Map();
    
    incomes.forEach(income => {
      const monthKey = `${income.date.getFullYear()}-${income.date.getMonth()}`;
      const current = monthlyIncomes.get(monthKey) || 0;
      monthlyIncomes.set(monthKey, current + income.amount);
    });
    
    expenses.forEach(expense => {
      const monthKey = `${expense.date.getFullYear()}-${expense.date.getMonth()}`;
      const current = monthlyExpenses.get(monthKey) || 0;
      monthlyExpenses.set(monthKey, current + expense.amount);
    });
    
    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const currentBalance = totalIncome - totalExpenses;
    
    const averageMonthlyIncome = monthlyIncomes.size > 0 
      ? Array.from(monthlyIncomes.values()).reduce((sum, val) => sum + val, 0) / monthlyIncomes.size
      : 0;
      
    const averageMonthlyExpenses = monthlyExpenses.size > 0
      ? Array.from(monthlyExpenses.values()).reduce((sum, val) => sum + val, 0) / monthlyExpenses.size
      : 0;
    
    // Calculate runway (how many months until cash runs out)
    const monthlyNet = averageMonthlyIncome - averageMonthlyExpenses;
    const runway = monthlyNet >= 0 ? Infinity : Math.abs(currentBalance / monthlyNet);
    
    // Calculate break-even date
    const breakEvenDate = new Date();
    if (runway !== Infinity) {
      breakEvenDate.setMonth(breakEvenDate.getMonth() + Math.floor(runway));
    } else {
      breakEvenDate.setFullYear(breakEvenDate.getFullYear() + 100); // Effectively "never"
    }
    
    return {
      totalIncome,
      totalExpenses,
      currentBalance,
      averageMonthlyIncome,
      averageMonthlyExpenses,
      runway: isFinite(runway) ? runway : 999,
      breakEvenDate
    };
  };

  const metrics = calculateFinancialMetrics();

  const handleExportAnalysis = () => {
    console.log("Exporting financial analysis...");
    // Implementation for generating PDF or Excel
  };

  return (
    <div>
      <PageHeader
        title="Flujo de Caja"
        description="Control, seguimiento y análisis financiero para decisiones estratégicas"
      />

      <FinancialMetrics
        totalIncome={metrics.totalIncome}
        totalExpenses={metrics.totalExpenses}
        currentBalance={metrics.currentBalance}
        averageMonthlyIncome={metrics.averageMonthlyIncome}
        averageMonthlyExpenses={metrics.averageMonthlyExpenses}
        runway={metrics.runway}
        breakEvenDate={metrics.breakEvenDate}
      />

      <Tabs defaultValue="movimientos" className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
            <TabsTrigger value="analisis">Análisis</TabsTrigger>
            <TabsTrigger value="proyecciones">Proyecciones</TabsTrigger>
            <TabsTrigger value="clientes">Análisis de Clientes</TabsTrigger>
          </TabsList>
          
          <Button onClick={handleExportAnalysis} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Exportar Análisis
          </Button>
        </div>

        <TabsContent value="movimientos">
          <MovementsTab data={movements || []} />
        </TabsContent>

        <TabsContent value="dashboard">
          {analytics && (
            <FinancialDashboard 
              metrics={{
                burnRate: metrics.averageMonthlyExpenses,
                mrr: metrics.averageMonthlyIncome,
                mrrProjected: metrics.averageMonthlyIncome * 1.1, // 10% growth target
                topClientPercentage: analytics[0]?.client_amount / metrics.totalIncome * 100 || 0,
                monthlyVariation: {
                  income: { 
                    value: 0, 
                    percentage: 0
                  },
                  expense: { 
                    value: 0, 
                    percentage: 0
                  }
                },
                structuralExpenses: analytics[0]?.category_amount || 0,
                avoidableExpenses: 0,
                ytdProfit: metrics.currentBalance,
              }}
              monthlyData={analytics?.map(item => ({
                name: `${item.month} ${item.year}`,
                ingresos: item.ingresos,
                gastos: item.gastos,
                balance: item.balance
              })) || []}
              clientData={analytics?.map(item => ({
                name: item.client,
                value: item.client_amount
              })) || []}
              expenseData={analytics?.map(item => ({
                name: item.category,
                value: item.category_amount
              })) || []}
              expenseHeatMap={[]}
              onTimeFrameChange={handleTimeFrameChange}
              timeFrame={analysisTimeFrame}
            />
          )}
        </TabsContent>

        <TabsContent value="analisis">
          {analytics && (
            <AnalysisCharts
              monthlyData={analytics?.map(item => ({
                name: `${item.month} ${item.year}`,
                ingresos: item.ingresos,
                gastos: item.gastos,
                balance: item.balance
              })) || []}
              categoryExpenses={analytics?.map(item => ({
                name: item.category,
                value: item.category_amount
              })) || []}
              clientIncome={analytics?.map(item => ({
                name: item.client,
                value: item.client_amount
              })) || []}
            />
          )}
        </TabsContent>

        <TabsContent value="proyecciones">
          {analytics && (
            <FinancialProjections
              currentData={analytics[0] ? {
                name: `${analytics[0].month} ${analytics[0].year}`,
                ingresos: analytics[0].ingresos,
                gastos: analytics[0].gastos,
                balance: analytics[0].balance
              } : { name: 'Current', ingresos: 0, gastos: 0, balance: 0 }}
              projectionData={generateProjections(analytics?.map(item => ({
                name: `${item.month} ${item.year}`,
                ingresos: item.ingresos,
                gastos: item.gastos,
                balance: item.balance
              })) || [])}
              metrics={{
                burnRate: metrics.averageMonthlyExpenses,
                mrr: metrics.averageMonthlyIncome,
                structuralExpenses: analytics[0]?.category_amount || 0,
                ytdProfit: metrics.currentBalance
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="clientes">
          {analytics && (
            <ClientAnalytics
              clientProfitability={generateClientProfitability(analytics?.map(item => ({
                name: item.client,
                value: item.client_amount
              })) || [])}
              growingClients={[]}
              decliningClients={[]}
              mrrChanges={{
                newMrr: 0,
                churn: 0,
                netMrr: 0
              }}
              timeFrame={analysisTimeFrame}
              onTimeFrameChange={handleTimeFrameChange}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashFlowPage;
