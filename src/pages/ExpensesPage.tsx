
import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccruedExpenses } from "@/components/expenses/accrued-expenses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpensesData } from "@/hooks/use-expenses-data";
import { formatCurrency, convertCurrency, Currency } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog";
import { EditExpenseDialog } from "@/components/expenses/edit-expense-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VariableExpense, RecurringExpense } from "@/services/expenseService";
import { Button } from "@/components/ui/button";

const ExpensesPage = () => {
  const [timeFrame, setTimeFrame] = useState<"month" | "quarter" | "year">("month");
  const [viewCurrency, setViewCurrency] = useState<Currency>("COP");
  const { variableExpenses, recurringExpenses, expenseSummary, isLoading } = useExpensesData(timeFrame);
  const [selectedVariableExpense, setSelectedVariableExpense] = useState<VariableExpense | null>(null);
  const [selectedRecurringExpense, setSelectedRecurringExpense] = useState<RecurringExpense | null>(null);
  const [isEditVariableOpen, setIsEditVariableOpen] = useState(false);
  const [isEditRecurringOpen, setIsEditRecurringOpen] = useState(false);

  const handleEditVariableExpense = (expense: VariableExpense) => {
    setSelectedVariableExpense(expense);
    setIsEditVariableOpen(true);
  };

  const handleEditRecurringExpense = (expense: RecurringExpense) => {
    setSelectedRecurringExpense(expense);
    setIsEditRecurringOpen(true);
  };

  const formatAmountInViewCurrency = (amount: number, originalCurrency: Currency) => {
    if (originalCurrency === viewCurrency) {
      return formatCurrency(amount, viewCurrency);
    }
    
    const convertedAmount = convertCurrency(amount, originalCurrency, viewCurrency);
    return formatCurrency(convertedAmount, viewCurrency);
  };

  const variableColumns: ColumnDef<VariableExpense>[] = [
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
      cell: ({ row }) => formatAmountInViewCurrency(row.getValue("amount"), row.original.currency),
    },
    {
      accessorKey: "currency",
      header: "Moneda Original",
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de pago",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleEditVariableExpense(row.original)}
        >
          Editar
        </Button>
      ),
    }
  ];

  const recurringColumns: ColumnDef<RecurringExpense>[] = [
    {
      accessorKey: "startDate",
      header: "Fecha de inicio",
      cell: ({ row }) => new Date(row.getValue("startDate")).toLocaleDateString(),
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
      cell: ({ row }) => formatAmountInViewCurrency(row.getValue("amount"), row.original.currency),
    },
    {
      accessorKey: "currency",
      header: "Moneda Original",
    },
    {
      accessorKey: "frequency",
      header: "Frecuencia",
      cell: ({ row }) => {
        const freq = row.getValue("frequency") as string;
        const labels = {
          "weekly": "Semanal",
          "biweekly": "Quincenal",
          "monthly": "Mensual",
          "bimonthly": "Bimensual",
          "quarterly": "Trimestral",
          "semiannual": "Semestral",
          "annual": "Anual"
        };
        return labels[freq as keyof typeof labels] || freq;
      }
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de pago",
    },
    {
      accessorKey: "endDate",
      header: "Fecha de fin",
      cell: ({ row }) => row.original.endDate 
        ? new Date(row.original.endDate).toLocaleDateString() 
        : "Sin fecha de fin",
    },
    {
      accessorKey: "isAutoDebit",
      header: "Débito automático",
      cell: ({ row }) => row.original.isAutoDebit ? "Sí" : "No",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleEditRecurringExpense(row.original)}
        >
          Editar
        </Button>
      ),
    }
  ];

  return (
    <div>
      <PageHeader
        title="Gastos"
        description="Gestión y análisis de gastos"
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 items-center">
          <Select
            value={timeFrame}
            onValueChange={(value) => setTimeFrame(value as "month" | "quarter" | "year")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={viewCurrency}
            onValueChange={(value) => setViewCurrency(value as Currency)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ver en moneda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COP">Ver en COP</SelectItem>
              <SelectItem value="USD">Ver en USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
                  <p className="text-2xl font-bold">{formatCurrency(expenseSummary.total_expenses, viewCurrency)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gastos Recurrentes</CardTitle>
                  <CardDescription>Del total de gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(expenseSummary.recurring_expenses, viewCurrency)}</p>
                  <p className="text-sm text-muted-foreground">
                    {expenseSummary.total_expenses > 0 
                      ? ((expenseSummary.recurring_expenses / expenseSummary.total_expenses) * 100).toFixed(1) 
                      : "0"}% del total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gastos Variables</CardTitle>
                  <CardDescription>Del total de gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(expenseSummary.variable_expenses, viewCurrency)}</p>
                  <p className="text-sm text-muted-foreground">
                    {expenseSummary.total_expenses > 0 
                      ? ((expenseSummary.variable_expenses / expenseSummary.total_expenses) * 100).toFixed(1) 
                      : "0"}% del total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Categoría Principal</CardTitle>
                  <CardDescription>Mayor gasto</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{expenseSummary.top_category || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(expenseSummary.top_category_amount, viewCurrency)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Promedio Mensual</CardTitle>
                  <CardDescription>Período actual</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(expenseSummary.avg_monthly_expense, viewCurrency)}</p>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gastos Variables</CardTitle>
                <CardDescription>Listado de gastos no recurrentes</CardDescription>
              </div>
              <AddExpenseDialog isRecurring={false} />
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={variableColumns} 
                data={variableExpenses} 
                isLoading={isLoading}
                searchColumn="description"
                searchPlaceholder="Buscar por descripción..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurrentes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gastos Recurrentes</CardTitle>
                <CardDescription>Gastos fijos y periódicos</CardDescription>
              </div>
              <AddExpenseDialog isRecurring={true} />
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={recurringColumns} 
                data={recurringExpenses} 
                isLoading={isLoading}
                searchColumn="description"
                searchPlaceholder="Buscar por descripción..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="causados">
          <AccruedExpenses />
        </TabsContent>
      </Tabs>

      {/* Edit expense dialogs */}
      {selectedVariableExpense && (
        <EditExpenseDialog 
          isRecurring={false} 
          expense={selectedVariableExpense} 
          open={isEditVariableOpen}
          onOpenChange={setIsEditVariableOpen}
        />
      )}
      
      {selectedRecurringExpense && (
        <EditExpenseDialog 
          isRecurring={true} 
          expense={selectedRecurringExpense} 
          open={isEditRecurringOpen}
          onOpenChange={setIsEditRecurringOpen}
        />
      )}
    </div>
  );
};

export default ExpensesPage;
