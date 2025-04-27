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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader2, TrendingUp, BarChart2, PieChart, ArrowUpDown } from "lucide-react";

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

const COLORS = ["#a855f7", "#f87171", "#60a5fa", "#fcd34d"];

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
      <div className="flex justify-center items-center h-48 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
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
        <Card className="bg-[#1e1756] border-purple-800/30 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">
              Ingresos Totales (COP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(totalIncome, "COP")}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Promedio mensual: {formatCurrency(avgIncome, "COP")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1756] border-purple-800/30 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">
              Gastos Totales (COP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(totalExpense, "COP")}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Promedio mensual: {formatCurrency(avgExpense, "COP")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1756] border-purple-800/30 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">
              Balance Actual (COP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentBalance >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatCurrency(currentBalance, "COP")}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentBalance >= 0
                ? "Balance positivo"
                : "Balance negativo"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1756] border-purple-800/30 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">
              Runway Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              runway > 6
                ? "text-green-400"
                : runway > 3
                ? "text-amber-400"
                : "text-red-400"
            }`}>
              {runway === 999 ? "∞" : `${runway.toFixed(1)} meses`}
            </div>
            <p className="text-xs text-slate-300 mt-1">
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
        <Card className="bg-[#1e1756] border-purple-800/30 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-purple-400" />
              Evolución Reciente (COP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {recentMonths.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={recentMonths}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" stroke="#a5a3c8" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} stroke="#a5a3c8" />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value), "COP")}
                      contentStyle={{
                        backgroundColor: "#0f0b2a",
                        borderColor: "#4c1d95",
                        color: "#fff"
                      }}
                    />
                    <Legend />
                    <Bar dataKey="ingresos" name="Ingresos" fill="#a78bfa" />
                    <Bar dataKey="gastos" name="Gastos" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-slate-300">No hay datos suficientes para mostrar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1756] border-purple-800/30 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-400" />
              Ingresos vs Gastos (COP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {totalIncome > 0 || totalExpense > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
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
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value), "COP")}
                      contentStyle={{
                        backgroundColor: "#0f0b2a",
                        borderColor: "#4c1d95",
                        color: "#fff"
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-slate-300">No hay datos suficientes para mostrar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Averages */}
      <Card className="bg-[#1e1756] border-purple-800/30 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Promedios Mensuales (COP)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            {avgIncome > 0 || avgExpense > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeVsExpense}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" stroke="#a5a3c8" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} stroke="#a5a3c8" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value), "COP")}
                    contentStyle={{
                      backgroundColor: "#0f0b2a",
                      borderColor: "#4c1d95",
                      color: "#fff"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="ingresos" name="Ingresos Promedio" fill="#a78bfa" />
                  <Bar dataKey="gastos" name="Gastos Promedio" fill="#f87171" />
                  <Bar dataKey="balance" name="Balance Promedio" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-slate-300">No hay datos suficientes para mostrar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}