
import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/ui/stats-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { Download, ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";

// Datos simulados para movimientos de caja
const cashFlowData = [
  {
    id: 1,
    date: new Date("2023-06-20"),
    description: "Pago Proyecto Dashboard",
    type: "Ingreso",
    category: "Cliente",
    paymentMethod: "Transferencia",
    amount: 7500000,
  },
  {
    id: 2,
    date: new Date("2023-06-18"),
    description: "Nómina",
    type: "Gasto",
    category: "Personal",
    paymentMethod: "Transferencia",
    amount: 7500000,
  },
  {
    id: 3,
    date: new Date("2023-06-15"),
    description: "Pago Mensual Mantenimiento",
    type: "Ingreso",
    category: "Cliente",
    paymentMethod: "Transferencia",
    amount: 3800000,
  },
  {
    id: 4,
    date: new Date("2023-06-10"),
    description: "Consultoría UX/UI",
    type: "Ingreso",
    category: "Cliente",
    paymentMethod: "Transferencia",
    amount: 2500000,
  },
  {
    id: 5,
    date: new Date("2023-06-10"),
    description: "Servicios Cloud",
    type: "Gasto",
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    amount: 950000,
  },
  {
    id: 6,
    date: new Date("2023-06-05"),
    description: "Aporte Capital",
    type: "Ingreso",
    category: "Aporte de socio",
    paymentMethod: "Transferencia",
    amount: 10000000,
  },
  {
    id: 7,
    date: new Date("2023-06-05"),
    description: "Arriendo Oficina",
    type: "Gasto",
    category: "Arriendo",
    paymentMethod: "Transferencia",
    amount: 3200000,
  },
  {
    id: 8,
    date: new Date("2023-06-03"),
    description: "Desarrollo Landing Page",
    type: "Ingreso",
    category: "Cliente",
    paymentMethod: "Tarjeta de Crédito",
    amount: 1800000,
  },
  {
    id: 9,
    date: new Date("2023-06-03"),
    description: "Publicidad Facebook",
    type: "Gasto",
    category: "Marketing",
    paymentMethod: "Tarjeta de Crédito",
    amount: 450000,
  },
];

// Datos simulados para el gráfico de flujo de caja
const cashFlowChartData = [
  {
    name: "01/06",
    ingresos: 1800000,
    gastos: 450000,
    balance: 1350000,
  },
  {
    name: "05/06",
    ingresos: 10000000,
    gastos: 3200000,
    balance: 8150000,
  },
  {
    name: "10/06",
    ingresos: 2500000,
    gastos: 950000,
    balance: 9700000,
  },
  {
    name: "15/06",
    ingresos: 3800000,
    gastos: 0,
    balance: 13500000,
  },
  {
    name: "18/06",
    ingresos: 0,
    gastos: 7500000,
    balance: 6000000,
  },
  {
    name: "20/06",
    ingresos: 7500000,
    gastos: 0,
    balance: 13500000,
  },
];

// Datos mensuales para análisis
const monthlyBalanceData = [
  { month: "Ene", ingresos: 24500000, gastos: 18700000, balance: 5800000 },
  { month: "Feb", ingresos: 26700000, gastos: 19200000, balance: 7500000 },
  { month: "Mar", ingresos: 23900000, gastos: 17800000, balance: 6100000 },
  { month: "Abr", ingresos: 28400000, gastos: 20100000, balance: 8300000 },
  { month: "May", ingresos: 27800000, gastos: 21300000, balance: 6500000 },
  { month: "Jun", ingresos: 25600000, gastos: 22400000, balance: 3200000 },
];

// Definiciones de columnas para DataTable
const cashFlowColumns = [
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <div className="flex items-center">
        <span
          className={`flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.type === "Ingreso"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.type === "Ingreso" ? (
            <ArrowDown className="h-3 w-3 mr-1" />
          ) : (
            <ArrowUp className="h-3 w-3 mr-1" />
          )}
          {row.original.type}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Categoría",
  },
  {
    accessorKey: "paymentMethod",
    header: "Método de Pago",
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => (
      <span
        className={
          row.original.type === "Ingreso" ? "text-green-600" : "text-red-600"
        }
      >
        {row.original.type === "Ingreso" ? "+" : "-"}
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
];

const CashFlowPage = () => {
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Calcular totales
  const totalIncome = cashFlowData
    .filter((item) => item.type === "Ingreso")
    .reduce((sum, item) => sum + item.amount, 0);
  
  const totalExpenses = cashFlowData
    .filter((item) => item.type === "Gasto")
    .reduce((sum, item) => sum + item.amount, 0);
  
  const currentBalance = totalIncome - totalExpenses;
  
  // Aplicar filtros a los datos
  const filteredCashFlowData = cashFlowData.filter((item) => {
    return (
      (typeFilter === "all" || item.type === typeFilter) &&
      (dateFilter === "all" ||
        (dateFilter === "thisWeek" &&
          item.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (dateFilter === "thisMonth" &&
          item.date.getMonth() === new Date().getMonth() &&
          item.date.getFullYear() === new Date().getFullYear()))
    );
  });

  return (
    <div>
      <PageHeader
        title="Flujo de Caja"
        description="Control y seguimiento de todos los movimientos financieros"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Ingresos Totales"
          value={formatCurrency(totalIncome)}
          icon={<ArrowDown className="h-4 w-4 text-green-500" />}
          className="bg-green-50"
        />
        <StatsCard
          title="Gastos Totales"
          value={formatCurrency(totalExpenses)}
          icon={<ArrowUp className="h-4 w-4 text-red-500" />}
          className="bg-red-50"
        />
        <StatsCard
          title="Saldo Actual"
          value={formatCurrency(currentBalance)}
          icon={<Wallet className="h-4 w-4" />}
          className={currentBalance >= 0 ? "bg-blue-50" : "bg-amber-50"}
        />
      </div>

      <Tabs defaultValue="movimientos" className="mt-6">
        <TabsList>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="analisis">Análisis</TabsTrigger>
        </TabsList>

        {/* Tab de Movimientos */}
        <TabsContent value="movimientos">
          <Card>
            <CardHeader>
              <CardTitle>Movimientos de Caja</CardTitle>
              <CardDescription>
                Registro detallado de ingresos y gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Select
                    value={dateFilter}
                    onValueChange={setDateFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar por fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las fechas</SelectItem>
                      <SelectItem value="thisWeek">Esta semana</SelectItem>
                      <SelectItem value="thisMonth">Este mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los movimientos</SelectItem>
                      <SelectItem value="Ingreso">Solo ingresos</SelectItem>
                      <SelectItem value="Gasto">Solo gastos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DataTable
                columns={cashFlowColumns}
                data={filteredCashFlowData}
                searchColumn="description"
                searchPlaceholder="Buscar movimientos..."
              />
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab de Análisis */}
        <TabsContent value="analisis">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Flujo de Caja</CardTitle>
              <CardDescription>
                Visualización gráfica de los movimientos financieros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Flujo de Caja (Junio 2023)</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cashFlowChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="ingresos"
                          name="Ingresos"
                          stroke="#4ade80"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="gastos"
                          name="Gastos"
                          stroke="#f87171"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="balance"
                          name="Balance"
                          stroke="#4b4ce6"
                          strokeWidth={3}
                          dot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Balance Mensual (2023)</h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyBalanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                        <Legend />
                        <Bar
                          dataKey="ingresos"
                          name="Ingresos"
                          fill="#4ade80"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="gastos"
                          name="Gastos"
                          fill="#f87171"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="balance"
                          name="Balance"
                          fill="#4b4ce6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Tendencia Ingresos</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold">+6.8%</span>
                        <ChevronUp className="h-5 w-5 text-green-500 ml-2" />
                      </div>
                      <p className="text-xs text-muted-foreground">vs. mes anterior</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Tendencia Gastos</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold">+5.1%</span>
                        <ChevronUp className="h-5 w-5 text-red-500 ml-2" />
                      </div>
                      <p className="text-xs text-muted-foreground">vs. mes anterior</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Tendencia Balance</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold">-50.7%</span>
                        <ChevronDown className="h-5 w-5 text-red-500 ml-2" />
                      </div>
                      <p className="text-xs text-muted-foreground">vs. mes anterior</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Reporte
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashFlowPage;
