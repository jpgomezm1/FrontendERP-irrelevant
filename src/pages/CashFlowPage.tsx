import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileDown, BarChart2, ArrowUpDown, PieChart, Users } from "lucide-react";
import { FinancialMetrics } from "@/components/cash-flow/financial-metrics";
import { MovementsTab } from "@/components/cash-flow/movements-tab";
import { DashboardTab } from "@/components/cash-flow/dashboard-tab";
import { AnalysisTab } from "@/components/cash-flow/analysis-tab";
import { ProjectionsTab } from "@/components/cash-flow/projections-tab";
import { ClientsTab } from "@/components/cash-flow/clients-tab";
import { useMovements, MovementsFilter } from "@/hooks/use-movements";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

const CashFlowPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Create filter based on date range
  const filter: MovementsFilter = {
    startDate: dateRange?.from,
    endDate: dateRange?.to
  };
  
  const { 
    data: movements, 
    isLoading, 
    metrics,
    clientBreakdown,
    monthlyData
  } = useMovements(filter);

  const handleExportAnalysis = () => {
    // Implementation for generating PDF or Excel of the analysis
    console.log("Exporting financial analysis...");
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="text-white">
      <PageHeader
        title="Flujo de Caja"
        description="Control, seguimiento y análisis financiero en COP para decisiones estratégicas"
      />

      <div className="flex justify-between items-center mb-6">
        <FinancialMetrics
          totalIncome={metrics.totalIncome}
          totalExpenses={metrics.totalExpense}
          currentBalance={metrics.currentBalance}
          averageMonthlyIncome={metrics.avgIncome}
          averageMonthlyExpenses={metrics.avgExpense}
          runway={metrics.runway}
          breakEvenDate={new Date(Date.now() + metrics.runway * 30 * 24 * 60 * 60 * 1000)}
        />
      </div>

      <Tabs defaultValue="dashboard" className="mt-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <TabsList className="bg-[#0f0b2a] border border-purple-800/30">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white flex gap-2 items-center">
              <BarChart2 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="movimientos" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white flex gap-2 items-center">
              <ArrowUpDown className="h-4 w-4" />
              Movimientos
            </TabsTrigger>
            <TabsTrigger value="analisis" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white flex gap-2 items-center">
              <PieChart className="h-4 w-4" />
              Análisis
            </TabsTrigger>
            <TabsTrigger value="proyecciones" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white flex gap-2 items-center">
              <Calendar className="h-4 w-4" />
              Proyecciones
            </TabsTrigger>
            <TabsTrigger value="clientes" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white flex gap-2 items-center">
              <Users className="h-4 w-4" />
              Análisis de Clientes
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <DatePickerWithRange
              value={dateRange}
              onChange={handleDateRangeChange}
            />
            
            <Button 
              onClick={handleExportAnalysis} 
              variant="outline"
              className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
            >
              <FileDown className="h-4 w-4 mr-2 text-purple-400" />
              Exportar Análisis
            </Button>
          </div>
        </div>

        <TabsContent value="dashboard">
          <DashboardTab 
            totalIncome={metrics.totalIncome}
            totalExpense={metrics.totalExpense}
            currentBalance={metrics.currentBalance}
            runway={metrics.runway}
            avgIncome={metrics.avgIncome}
            avgExpense={metrics.avgExpense}
            monthlyData={monthlyData}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="movimientos">
          <MovementsTab data={movements || []} />
        </TabsContent>

        <TabsContent value="analisis">
          <AnalysisTab
            monthlyData={monthlyData}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="proyecciones">
          <ProjectionsTab 
            monthlyData={monthlyData}
            avgIncome={metrics.avgIncome}
            avgExpense={metrics.avgExpense}
            currentBalance={metrics.currentBalance}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="clientes">
          <ClientsTab
            clientBreakdown={clientBreakdown}
            totalIncome={metrics.totalIncome}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashFlowPage;