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
  PieChart as PieChartIcon,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2, Users } from "lucide-react";

interface ClientsTabProps {
  clientBreakdown: {
    name: string;
    total: number;
    count: number;
    average: number;
  }[];
  totalIncome: number;
  isLoading: boolean;
}

const COLORS = [
  "#9333ea",
  "#a855f7",
  "#c084fc",
  "#d8b4fe",
  "#6b21a8",
  "#c026d3",
  "#d946ef",
  "#a21caf",
  "#86198f",
  "#701a75",
];

export function ClientsTab({ clientBreakdown, totalIncome, isLoading }: ClientsTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2">Analizando datos de clientes...</span>
      </div>
    );
  }

  if (!clientBreakdown.length) {
    return (
      <div className="flex justify-center items-center h-48 text-white">
        <p className="text-slate-300">No hay datos de clientes para mostrar</p>
      </div>
    );
  }

  // Prepare data for the pie chart
  const pieData = clientBreakdown.map((client) => ({
    name: client.name,
    value: client.total,
    percentage: totalIncome > 0 ? (client.total / totalIncome) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1756] border-purple-800/30 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-purple-400" />
            Distribución de Ingresos por Cliente (COP)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) =>
                    `${name}: ${percentage.toFixed(1)}%`
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
                  formatter={(value, name, props) => [
                    formatCurrency(Number(value), "COP"),
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#0f0b2a",
                    borderColor: "#4c1d95",
                    color: "#fff"
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1e1756] border-purple-800/30 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Detalle de Ingresos por Cliente (COP)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-purple-800/30 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#0f0b2a]">
                <TableRow>
                  <TableHead className="text-purple-300">Cliente</TableHead>
                  <TableHead className="text-purple-300">Ingreso Total</TableHead>
                  <TableHead className="text-purple-300">Pagos Realizados</TableHead>
                  <TableHead className="text-purple-300">Promedio por Pago</TableHead>
                  <TableHead className="text-purple-300">% del Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientBreakdown.map((client, index) => (
                  <TableRow key={index} className="border-b border-purple-800/30 hover:bg-[#0f0b2a]/50">
                    <TableCell className="font-medium text-white">{client.name}</TableCell>
                    <TableCell className="text-green-400">{formatCurrency(client.total, "COP")}</TableCell>
                    <TableCell className="text-white">{client.count}</TableCell>
                    <TableCell className="text-purple-300">{formatCurrency(client.average, "COP")}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-[#0f0b2a] rounded-full h-2.5 mr-2 max-w-[100px]">
                          <div
                            className="bg-purple-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                totalIncome > 0
                                  ? (client.total / totalIncome) * 100
                                  : 0
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-purple-300">
                          {totalIncome > 0
                            ? ((client.total / totalIncome) * 100).toFixed(1)
                            : "0"}
                          %
                        </span>
                      </div>
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