
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
import { Loader2 } from "lucide-react";

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
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">No hay datos suficientes para generar proyecciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proyección de Flujo de Caja - 6 meses (COP)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[...combinedData].reverse()} // Chronological order
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value), "COP")} />
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
                  stroke="#60a5fa"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              * Las proyecciones se basan en el promedio de ingresos y gastos de los últimos 6 meses.
              Los valores futuros son estimados y pueden variar. Todos los montos están expresados en COP.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Proyección (COP)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead>Ingresos Estimados</TableHead>
                <TableHead>Gastos Estimados</TableHead>
                <TableHead>Balance Proyectado</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combinedData.map((month, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{month.name}</TableCell>
                  <TableCell className="text-green-600">
                    {formatCurrency(month.ingresos, "COP")}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {formatCurrency(month.gastos, "COP")}
                  </TableCell>
                  <TableCell
                    className={
                      month.balance >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {formatCurrency(month.balance, "COP")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        month.projected
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {month.projected ? "Proyectado" : "Histórico"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
