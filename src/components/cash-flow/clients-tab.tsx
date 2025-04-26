
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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";

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
  "#4ade80",
  "#60a5fa",
  "#f97316",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#f59e0b",
  "#84cc16",
  "#14b8a6",
  "#8b5cf6",
];

export function ClientsTab({ clientBreakdown, totalIncome, isLoading }: ClientsTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Analizando datos de clientes...</span>
      </div>
    );
  }

  if (!clientBreakdown.length) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">No hay datos de clientes para mostrar</p>
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
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Ingresos por Cliente (COP)</CardTitle>
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
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Ingresos por Cliente (COP)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Ingreso Total</TableHead>
                <TableHead>Pagos Realizados</TableHead>
                <TableHead>Promedio por Pago</TableHead>
                <TableHead>% del Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientBreakdown.map((client, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{formatCurrency(client.total, "COP")}</TableCell>
                  <TableCell>{client.count}</TableCell>
                  <TableCell>{formatCurrency(client.average, "COP")}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
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
                      {totalIncome > 0
                        ? ((client.total / totalIncome) * 100).toFixed(1)
                        : "0"}
                      %
                    </div>
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
