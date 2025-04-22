import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FinancialMetrics } from "@/components/cash-flow/financial-metrics";
import { AnalysisCharts } from "@/components/cash-flow/analysis-charts";

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

// Datos de gastos por categoría
const categoryExpensesData = [
  { name: "Personal", value: 7500000 },
  { name: "Tecnología", value: 950000 },
  { name: "Arriendo", value: 3200000 },
  { name: "Marketing", value: 450000 },
];

// Datos de ingresos por cliente
const clientIncomeData = [
  { name: "Cliente A", value: 7500000 },
  { name: "Cliente B", value: 3800000 },
  { name: "Cliente C", value: 2500000 },
  { name: "Cliente D", value: 1800000 },
];

// Columnas actualizadas para DataTable
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
    accessorKey: "client",
    header: "Cliente/Proyecto",
    cell: ({ row }) => row.original.client || "N/A",
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
    accessorKey: "isRecurring",
    header: "Tipo",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        {row.original.isRecurring && (
          <Badge variant="secondary">Recurrente</Badge>
        )}
        {row.original.isScheduled && (
          <Badge variant="warning">Programado</Badge>
        )}
      </div>
    ),
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
  {
    accessorKey: "balance",
    header: "Saldo",
    cell: ({ row }) => formatCurrency(row.original.balance),
  },
];

const CashFlowPage = () => {
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setcategoryFilter] = useState("all");
  
  // Calcular métricas financieras
  const totalIncome = cashFlowData
    .filter((item) => item.type === "Ingreso")
    .reduce((sum, item) => sum + item.amount, 0);
  
  const totalExpenses = cashFlowData
    .filter((item) => item.type === "Gasto")
    .reduce((sum, item) => sum + item.amount, 0);
  
  const currentBalance = totalIncome - totalExpenses;
  
  // Calcular promedios mensuales (últimos 6 meses)
  const averageMonthlyIncome = totalIncome / 6;
  const averageMonthlyExpenses = totalExpenses / 6;
  
  // Calcular runway y fecha de quiebre
  const runway = currentBalance / averageMonthlyExpenses;
  const breakEvenDate = new Date();
  breakEvenDate.setMonth(breakEvenDate.getMonth() + Math.floor(runway));
  
  // Calcular saldo acumulado para cada movimiento
  const movimientosConSaldo = cashFlowData.map((item, index) => {
    let balanceAcumulado = cashFlowData
      .slice(0, index + 1)
      .reduce((sum, mov) => sum + (mov.type === "Ingreso" ? mov.amount : -mov.amount), 0);
    
    return {
      ...item,
      balance: balanceAcumulado,
    };
  });

  // Aplicar filtros a los datos
  const filteredCashFlowData = movimientosConSaldo.filter((item) => {
    return (
      (typeFilter === "all" || item.type === typeFilter) &&
      (categoryFilter === "all" || item.category === categoryFilter) &&
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

      <FinancialMetrics
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        currentBalance={currentBalance}
        averageMonthlyIncome={averageMonthlyIncome}
        averageMonthlyExpenses={averageMonthlyExpenses}
        runway={runway}
        breakEvenDate={breakEvenDate}
      />

      <Tabs defaultValue="movimientos" className="mt-6">
        <TabsList>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="analisis">Análisis</TabsTrigger>
        </TabsList>

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
                    <SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los movimientos</SelectItem>
                      <SelectItem value="Ingreso">Solo ingresos</SelectItem>
                      <SelectItem value="Gasto">Solo gastos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select
                    value={categoryFilter}
                    onValueChange={setcategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Tecnología">Tecnología</SelectItem>
                      <SelectItem value="Arriendo">Arriendo</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Cliente">Cliente</SelectItem>
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

        <TabsContent value="analisis">
          <AnalysisCharts
            monthlyData={monthlyBalanceData}
            categoryExpenses={categoryExpensesData}
            clientIncome={clientIncomeData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashFlowPage;
