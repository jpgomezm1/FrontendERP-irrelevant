
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

interface AnalysisTabProps {
  monthlyData: {
    name: string;
    ingresos: number;
    gastos: number;
    balance: number;
  }[];
  isLoading: boolean;
}

export function AnalysisTab({ monthlyData, isLoading }: AnalysisTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando análisis financiero...</span>
      </div>
    );
  }

  if (!monthlyData.length) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">No hay datos suficientes para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análisis Mensual (COP)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData.slice().reverse()} // Show oldest first
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value), "COP")} />
                <Legend />
                <Bar dataKey="ingresos" name="Ingresos" fill="#4ade80" />
                <Bar dataKey="gastos" name="Gastos" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle Mensual (COP)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead>Gastos</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((month, index) => (
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
                        month.balance > month.gastos * 0.5
                          ? "bg-green-100 text-green-800"
                          : month.balance >= 0
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {month.balance > month.gastos * 0.5
                        ? "Excelente"
                        : month.balance >= 0
                        ? "Aceptable"
                        : "Deficitario"}
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
