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
import { Loader2, PieChart } from "lucide-react";

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
      <div className="flex justify-center items-center h-48 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2">Cargando análisis financiero...</span>
      </div>
    );
  }

  if (!monthlyData.length) {
    return (
      <div className="flex justify-center items-center h-48 text-white">
        <p className="text-slate-300">No hay datos suficientes para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1756] border-purple-800/30 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-400" />
            Análisis Mensual (COP)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData.slice().reverse()} // Show oldest first
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2b70" />
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
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1e1756] border-purple-800/30 text-white">
        <CardHeader>
          <CardTitle className="text-white">Detalle Mensual (COP)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-purple-800/30 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#0f0b2a]">
                <TableRow>
                  <TableHead className="text-purple-300">Mes</TableHead>
                  <TableHead className="text-purple-300">Ingresos</TableHead>
                  <TableHead className="text-purple-300">Gastos</TableHead>
                  <TableHead className="text-purple-300">Balance</TableHead>
                  <TableHead className="text-purple-300">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((month, index) => (
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
                          month.balance > month.gastos * 0.5
                            ? "bg-green-900/50 text-green-300 border border-green-800/30"
                            : month.balance >= 0
                            ? "bg-blue-900/50 text-blue-300 border border-blue-800/30"
                            : "bg-red-900/50 text-red-300 border border-red-800/30"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}