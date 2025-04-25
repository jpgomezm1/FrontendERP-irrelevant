
import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CircleDollarSign, CreditCard, TrendingUp, Users } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { FinancialDashboard } from "@/components/financial/financial-dashboard";

const Dashboard = () => {
  const { metrics, monthlyData, clientData, expenseData, isLoading } = useDashboardData();

  // Calculate financial metrics for FinancialDashboard
  const financialMetrics = {
    burnRate: metrics.currentMonthExpense,
    mrr: metrics.currentMonthIncome,
    mrrProjected: metrics.currentMonthIncome * 1.1, // 10% growth target
    topClientPercentage: clientData[0] ? (clientData[0].total / metrics.currentMonthIncome) * 100 : 0,
    monthlyVariation: metrics.monthlyVariation,
    structuralExpenses: expenseData.reduce((acc, cat) => 
      cat.category === 'Personal' || cat.category === 'Tecnología' ? acc + Number(cat.total) : acc, 0),
    avoidableExpenses: expenseData.reduce((acc, cat) => 
      cat.category !== 'Personal' && cat.category !== 'Tecnología' ? acc + Number(cat.total) : acc, 0),
    ytdProfit: monthlyData.reduce((acc, month) => acc + (month.total_income - month.total_expense), 0)
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vista general del estado financiero"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Ingresos este mes"
          value={formatCurrency(metrics.currentMonthIncome)}
          trend={metrics.monthlyVariation.income.percentage > 0 ? "up" : "down"}
          trendValue={`${metrics.monthlyVariation.income.percentage.toFixed(1)}%`}
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="Gastos este mes"
          value={formatCurrency(metrics.currentMonthExpense)}
          trend={metrics.monthlyVariation.expense.percentage > 0 ? "down" : "up"}
          trendValue={`${metrics.monthlyVariation.expense.percentage.toFixed(1)}%`}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatsCard
          title="Saldo en caja"
          value={formatCurrency(metrics.cashBalance)}
          trend={metrics.cashBalance > 0 ? "up" : "down"}
          trendValue={`${((metrics.cashBalance / metrics.currentMonthIncome) * 100).toFixed(1)}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatsCard
          title="Clientes activos"
          value={metrics.activeClients.toString()}
          trend="neutral"
          trendValue="0%"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <FinancialDashboard 
        metrics={financialMetrics}
        monthlyData={monthlyData.map(m => ({
          name: m.month,
          ingresos: Number(m.total_income),
          gastos: Number(m.total_expense),
          balance: Number(m.total_income) - Number(m.total_expense)
        }))}
        clientData={clientData.map(c => ({
          name: c.client,
          value: Number(c.total)
        }))}
        expenseData={expenseData.map(e => ({
          name: e.category,
          value: Number(e.total)
        }))}
        expenseHeatMap={[]} // This could be implemented later if needed
        onTimeFrameChange={() => {}} // This could be implemented later if needed
        timeFrame="month"
      />
    </div>
  );
};

export default Dashboard;
