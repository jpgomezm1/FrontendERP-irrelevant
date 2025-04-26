
import { StatsCard } from "@/components/ui/stats-card";
import { formatCurrency } from "@/lib/utils";
import { ArrowDown, ArrowUp, CalendarDays, Clock, Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface FinancialMetricsProps {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  runway: number;
  breakEvenDate: Date;
}

export function FinancialMetrics({
  totalIncome,
  totalExpenses,
  currentBalance,
  averageMonthlyIncome,
  averageMonthlyExpenses,
  runway,
  breakEvenDate,
}: FinancialMetricsProps) {
  const runwayStatus = runway < 3 ? "danger" : runway < 6 ? "warning" : "success";
  const runwayColors = {
    danger: "bg-red-50",
    warning: "bg-amber-50",
    success: "bg-green-50",
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Ingresos Totales"
        value={formatCurrency(totalIncome, "COP")}
        icon={<ArrowDown className="h-4 w-4 text-green-500" />}
        className="bg-green-50"
      />
      <StatsCard
        title="Gastos Totales"
        value={formatCurrency(totalExpenses, "COP")}
        icon={<ArrowUp className="h-4 w-4 text-red-500" />}
        className="bg-red-50"
      />
      <StatsCard
        title="Saldo Actual (COP)"
        value={formatCurrency(currentBalance, "COP")}
        icon={<Wallet className="h-4 w-4" />}
        className={currentBalance >= 0 ? "bg-blue-50" : "bg-amber-50"}
      />
      <StatsCard
        title="Runway Estimado"
        value={`${runway.toFixed(1)} meses`}
        icon={<Clock className="h-4 w-4" />}
        description={`Quiebre estimado: ${breakEvenDate.toLocaleDateString()}`}
        className={runwayColors[runwayStatus]}
      />
      <StatsCard
        title="Ingreso Mensual Promedio"
        value={formatCurrency(averageMonthlyIncome, "COP")}
        icon={<TrendingUp className="h-4 w-4 text-green-500" />}
        description="Últimos 6 meses"
        className="bg-green-50"
      />
      <StatsCard
        title="Gasto Mensual Promedio"
        value={formatCurrency(averageMonthlyExpenses, "COP")}
        icon={<TrendingDown className="h-4 w-4 text-red-500" />}
        description="Últimos 6 meses"
        className="bg-red-50"
      />
    </div>
  );
}
