
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader2 } from "lucide-react";

interface DashboardTabProps {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  runway: number;
  avgIncome: number;
  avgExpense: number;
  monthlyData: {
    name: string;
    ingresos: number;
    gastos: number;
    balance: number;
  }[];
  isLoading: boolean;
}

const COLORS = ["#4ade80", "#f87171", "#60a5fa", "#fcd34d"];

export function DashboardTab({
  totalIncome,
  totalExpense,
  currentBalance,
  runway,
  avgIncome,
  avgExpense,
  monthlyData,
  isLoading,
}: DashboardTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando datos financieros...</span>
      </div>
    );
  }

  // Last 3 months for the chart
  const recentMonths = monthlyData.slice(0, 3);

  const pieData = [
    { name: "Ingresos", value: totalIncome },
    { name: "Gastos", value: totalExpense },
  ];
  
  const incomeVsExpense = [
    { name: "Resumen", ingresos: avgIncome, gastos: avgExpense, balance: avgIncome - avgExpense },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Totales (COP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome, "COP")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Promedio mensual: {formatCurrency(avgIncome, "COP")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gastos Totales (COP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense, "COP")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Promedio mensual: {formatCurrency(avgExpense, "COP")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balance Actual (COP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(currentBalance, "COP")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentBalance >= 0
                ? "Balance positivo"
                : "Balance negativo"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Runway Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              runway > 6
                ? "text-green-600"
                : runway > 3
                ? "text-amber-600"
                : "text-red-600"
            }`}>
              {runway === 999 ? "∞" : `${runway.toFixed(1)} meses`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {runway > 12
                ? "Excelente estabilidad"
                : runway > 6
                ? "Buena estabilidad"
                : runway > 3
                ? "Monitorear situación"
                : "Acción requerida"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolución Reciente (COP)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {recentMonths.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={recentMonths}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value), "COP")} />
                    <Legend />
                    <Bar dataKey="ingresos" name="Ingresos" fill="#4ade80" />
                    <Bar dataKey="gastos" name="Gastos" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">No hay datos suficientes para mostrar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs Gastos (COP)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {totalIncome > 0 || totalExpense > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value), "COP")} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">No hay datos suficientes para mostrar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Averages */}
      <Card>
        <CardHeader>
          <CardTitle>Promedios Mensuales (COP)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            {avgIncome > 0 || avgExpense > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeVsExpense}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), "COP")} />
                  <Legend />
                  <Bar dataKey="ingresos" name="Ingresos Promedio" fill="#4ade80" />
                  <Bar dataKey="gastos" name="Gastos Promedio" fill="#f87171" />
                  <Bar dataKey="balance" name="Balance Promedio" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">No hay datos suficientes para mostrar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
