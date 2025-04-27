import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingUp, CalendarDays } from "lucide-react";

interface ProjectionsTabProps {
  monthlyData: {
    name: string;
    ingresos: number;
    gastos: number;
    balance: number;
  }[];
  avgIncome: number;
  avgExpense: number;
  currentBalance: number;
  isLoading: boolean;
}

export function ProjectionsTab({
  monthlyData,
  avgIncome,
  avgExpense,
  currentBalance,
  isLoading,
}: ProjectionsTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2">Calculando proyecciones financieras...</span>
      </div>
    );
  }

  // Generate projections for the next 6 months
  const generateProjections = () => {
    // If we don't have data, we can't make projections
    if (monthlyData.length === 0) {
      return [];
    }

    const today = new Date();
    const projections = [];
    let projectedBalance = currentBalance;

    for (let i = 1; i <= 6; i++) {
      const projectionDate = new Date(today);
      projectionDate.setMonth(today.getMonth() + i);
      const month = projectionDate.toLocaleString('default', { month: 'short' });
      const year = projectionDate.getFullYear();

      // Projected income and expense based on past averages
      const projectedIncome = avgIncome;
      const projectedExpense = avgExpense;
      
      // Update balance with this month's projected net
      projectedBalance += projectedIncome - projectedExpense;

      projections.push({
        name: `${month} ${year}`,
        ingresos: projectedIncome,
        gastos: projectedExpense,
        balance: projectedBalance,
        projected: true
      });
    }

    return projections;
  };

  const projections = generateProjections();

  // Combine historical (last 3 months) and projection data
  const combinedData = [
    ...monthlyData.slice(0, 3).map(month => ({
      ...month,
      projected: false
    })),
    ...projections
  ];

  if (combinedData.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 text-white">
        <p className="text-slate-300">No hay datos suficientes para generar proyecciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1756] border-purple-800/30 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Proyección de Flujo de Caja - 6 meses (COP)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[...combinedData].reverse()} // Chronological order
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2b70" />
                <XAxis dataKey="name" stroke="#a5a3c8" />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} 
                  stroke="#a5a3c8" 
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value), "COP")}
                  contentStyle={{
                    backgroundColor: "#0f0b2a",
                    borderColor: "#4c1d95",
                    color: "#fff"
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  name="Ingresos"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="gastos"
                  name="Gastos"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Balance"
                  stroke="#a78bfa"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-slate-300">
            <p>
              * Las proyecciones se basan en el promedio de ingresos y gastos de los últimos 6 meses.
              Los valores futuros son estimados y pueden variar. Todos los montos están expresados en COP.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1e1756] border-purple-800/30 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-purple-400" />
            Detalle de Proyección (COP)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-purple-800/30 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#0f0b2a]">
                <TableRow>
                  <TableHead className="text-purple-300">Mes</TableHead>
                  <TableHead className="text-purple-300">Ingresos Estimados</TableHead>
                  <TableHead className="text-purple-300">Gastos Estimados</TableHead>
                  <TableHead className="text-purple-300">Balance Proyectado</TableHead>
                  <TableHead className="text-purple-300">Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedData.map((month, index) => (
                  <TableRow key={index} className="border-b border-purple-800/30 hover:bg-[#0f0b2a]/50">
                    <TableCell className="font-medium text-white">{month.name}</TableCell>
                    <TableCell className="text-green-400">
                      {formatCurrency(month.ingresos, "COP")}
                    </TableCell>
                    <TableCell className="text-red-400">
                      {formatCurrency(month.gastos, "COP")}
                    </TableCell>
                    <TableCell
                      className={
                        month.balance >= 0 ? "text-green-400" : "text-red-400"
                      }
                    >
                      {formatCurrency(month.balance, "COP")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          month.projected
                            ? "bg-purple-900/30 text-purple-300 border border-purple-800/30"
                            : "bg-green-900/30 text-green-300 border border-green-800/30"
                        }`}
                      >
                        {month.projected ? "Proyectado" : "Histórico"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}