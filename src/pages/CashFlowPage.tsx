
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

const CashFlowPage = () => {
  const [analysisTimeFrame, setAnalysisTimeFrame] = useState("month");
  const { data: analytics, isLoading: isLoadingAnalytics } = useCashFlowAnalytics();
  const { data: movements, isLoading: isLoadingMovements } = useMovements();

  if (isLoadingAnalytics || isLoadingMovements) {
    return <div>Cargando datos...</div>;
  }

  // Check if analytics data is available
  if (!analytics || analytics.length === 0) {
    return <div>No hay datos disponibles para mostrar. Por favor, agregue movimientos de caja.</div>;
  }

  const monthlyData = analytics?.map(item => ({
    name: `${item.month} ${item.year}`,
    ingresos: item.ingresos,
    gastos: item.gastos,
    balance: item.balance
  })) || [];

  const categoryExpenses = analytics?.map(item => ({
    name: item.category,
    value: item.category_amount
  })) || [];

  const clientIncome = analytics?.map(item => ({
    name: item.client,
    value: item.client_amount
  })) || [];

  // Calculate totals for metrics
  const currentMonth = monthlyData[0] || { ingresos: 0, gastos: 0, balance: 0 };
  const averages = {
    income: monthlyData.reduce((sum, item) => sum + item.ingresos, 0) / (monthlyData.length || 1),
    expenses: monthlyData.reduce((sum, item) => sum + item.gastos, 0) / (monthlyData.length || 1)
  };

  // Calculate runway and break-even date
  const runway = averages.expenses > 0 ? currentMonth.balance / (averages.expenses > averages.income ? averages.expenses - averages.income : 1) : 0;
  const breakEvenDate = new Date();
  breakEvenDate.setMonth(breakEvenDate.getMonth() + Math.floor(runway));

  const handleExportAnalysis = () => {
    console.log("Exporting financial analysis...");
    // Implementation for generating PDF or Excel
  };

  // Create a complete metrics object that includes all required properties
  const dashboardMetrics = {
    burnRate: averages.expenses,
    mrr: averages.income,
    mrrProjected: averages.income * 1.1, // Projected MRR (10% growth target)
    topClientPercentage: clientIncome.length > 0 ? (clientIncome[0].value / currentMonth.ingresos) * 100 : 0,
    monthlyVariation: {
      income: { 
        value: monthlyData.length > 1 ? monthlyData[0].ingresos - monthlyData[1].ingresos : 0, 
        percentage: monthlyData.length > 1 ? ((monthlyData[0].ingresos / monthlyData[1].ingresos) - 1) * 100 : 0 
      },
      expense: { 
        value: monthlyData.length > 1 ? monthlyData[0].gastos - monthlyData[1].gastos : 0, 
        percentage: monthlyData.length > 1 ? ((monthlyData[0].gastos / monthlyData[1].gastos) - 1) * 100 : 0
      }
    },
    structuralExpenses: categoryExpenses[0]?.value || 0,
    avoidableExpenses: categoryExpenses.slice(1).reduce((sum, item) => sum + item.value, 0) * 0.3, // Assuming 30% of non-primary expenses are avoidable
    ytdProfit: monthlyData.reduce((sum, item) => sum + item.balance, 0),
  };

  return (
    <div>
      <PageHeader
        title="Flujo de Caja"
        description="Control, seguimiento y análisis financiero para decisiones estratégicas"
      />

      <FinancialMetrics
        totalIncome={currentMonth.ingresos}
        totalExpenses={currentMonth.gastos}
        currentBalance={currentMonth.balance}
        averageMonthlyIncome={averages.income}
        averageMonthlyExpenses={averages.expenses}
        runway={runway}
        breakEvenDate={breakEvenDate}
      />

      <Tabs defaultValue="dashboard" className="mt-6">
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

        <TabsContent value="dashboard">
          <FinancialDashboard 
            metrics={dashboardMetrics}
            monthlyData={monthlyData}
            clientData={clientIncome}
            expenseData={categoryExpenses}
            expenseHeatMap={[]} // This could be implemented in a future iteration
            onTimeFrameChange={setAnalysisTimeFrame}
            timeFrame={analysisTimeFrame}
          />
        </TabsContent>

        <TabsContent value="movimientos">
          <MovementsTab data={movements || []} />
        </TabsContent>

        <TabsContent value="analisis">
          <AnalysisCharts
            monthlyData={monthlyData}
            categoryExpenses={categoryExpenses}
            clientIncome={clientIncome}
          />
        </TabsContent>

        <TabsContent value="proyecciones">
          <FinancialProjections
            currentData={monthlyData[0]}
            projectionData={generateProjections(monthlyData)}
            metrics={{
              burnRate: averages.expenses,
              mrr: averages.income,
              structuralExpenses: categoryExpenses[0]?.value || 0,
              ytdProfit: monthlyData.reduce((sum, item) => sum + item.balance, 0)
            }}
          />
        </TabsContent>

        <TabsContent value="clientes">
          <ClientAnalytics
            clientProfitability={generateClientProfitability(clientIncome)}
            growingClients={[]}
            decliningClients={[]}
            mrrChanges={{
              newMrr: 0,
              churn: 0,
              netMrr: 0
            }}
            timeFrame={analysisTimeFrame}
            onTimeFrameChange={setAnalysisTimeFrame}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashFlowPage;
