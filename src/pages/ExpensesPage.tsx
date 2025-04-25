
import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccruedExpenses } from "@/components/expenses/accrued-expenses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpensesData } from "@/hooks/use-expenses-data";
import { formatCurrency } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Expense } from "@/hooks/use-expenses-data";

const ExpensesPage = () => {
  const [timeFrame, setTimeFrame] = useState<"month" | "quarter" | "year">("month");
  const { variableExpenses, recurringExpenses, expenseSummary, isLoading } = useExpensesData(timeFrame);

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
    },
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "category",
      header: "Categoría",
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => formatCurrency(row.getValue("amount")),
    },
    {
      accessorKey: "paymentmethod",
      header: "Método de pago",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gastos"
        description="Gestión y análisis de gastos"
      />

      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="variables">Gastos Variables</TabsTrigger>
          <TabsTrigger value="recurrentes">Gastos Recurrentes</TabsTrigger>
          <TabsTrigger value="causados">Gastos Causados</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          {expenseSummary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total de Gastos</CardTitle>
                  <CardDescription>Período actual</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(expenseSummary.total_expenses)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gastos Recurrentes</CardTitle>
                  <CardDescription>Del total de gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(expenseSummary.recurring_expenses)}</p>
                  <p className="text-sm text-muted-foreground">
                    {((expenseSummary.recurring_expenses / expenseSummary.total_expenses) * 100).toFixed(1)}% del total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gastos Variables</CardTitle>
                  <CardDescription>Del total de gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(expenseSummary.variable_expenses)}</p>
                  <p className="text-sm text-muted-foreground">
                    {((expenseSummary.variable_expenses / expenseSummary.total_expenses) * 100).toFixed(1)}% del total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Categoría Principal</CardTitle>
                  <CardDescription>Mayor gasto</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{expenseSummary.top_category}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(expenseSummary.top_category_amount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Promedio Mensual</CardTitle>
                  <CardDescription>Últimos 3 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(expenseSummary.avg_monthly_expense)}</p>
                  <p className="text-sm text-muted-foreground">
                    Tendencia: {expenseSummary.expense_trend > 0 ? "+" : ""}{expenseSummary.expense_trend.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="variables">
          <Card>
            <CardHeader>
              <CardTitle>Gastos Variables</CardTitle>
              <CardDescription>Listado de gastos no recurrentes</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={variableExpenses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurrentes">
          <Card>
            <CardHeader>
              <CardTitle>Gastos Recurrentes</CardTitle>
              <CardDescription>Gastos fijos y periódicos</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={recurringExpenses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="causados">
          <AccruedExpenses />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpensesPage;
