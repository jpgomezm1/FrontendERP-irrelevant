import React, { useState, useEffect } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Calendar, CreditCard, TrendingDown, RefreshCw, ArrowDownUp, Filter, Tag, Clock } from "lucide-react";

const ExpensesPage = () => {
  const [timeFrame, setTimeFrame] = useState<"month" | "quarter" | "year">("month");
  const [viewCurrency, setViewCurrency] = useState<Currency>("COP");
  const { variableExpenses, recurringExpenses, expenseSummary, isLoading } = useExpensesData(timeFrame, viewCurrency);
  const [selectedVariableExpense, setSelectedVariableExpense] = useState<VariableExpense | null>(null);
  const [selectedRecurringExpense, setSelectedRecurringExpense] = useState<RecurringExpense | null>(null);
  const [isEditVariableOpen, setIsEditVariableOpen] = useState(false);
  const [isEditRecurringOpen, setIsEditRecurringOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    syncRecurringExpenses();
    
    const intervalId = setInterval(syncRecurringExpenses, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const syncRecurringExpenses = async () => {
    try {
      setSyncLoading(true);
      const { data, error } = await supabase.functions.invoke("recurring-expenses");
      
      if (error) {
        console.error("Error syncing recurring expenses:", error);
        toast({
          title: "Error de sincronización",
          description: "No se pudieron sincronizar los gastos recurrentes",
          variant: "destructive"
        });
      } else {
        if (data.details && data.details.length > 0) {
          queryClient.invalidateQueries({ queryKey: ['caused-expenses'] });
          toast({
            title: "Gastos actualizados",
            description: `Se han creado ${data.details.length} nuevos gastos causados.`
          });
        } else {
          toast({
            title: "Sincronización completada",
            description: "No hay nuevos gastos recurrentes para sincronizar."
          });
        }
      }
    } catch (error) {
      console.error("Error calling recurring-expenses function:", error);
      toast({
        title: "Error",
        description: "Se produjo un error al sincronizar los gastos recurrentes.",
        variant: "destructive"
      });
    } finally {
      setSyncLoading(false);
    }
  };

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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-purple-500" />
          <span>{row.getValue("category")}</span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="font-medium">{formatAmountInViewCurrency(row.getValue("amount"), row.original.currency)}</span>
          <span className="ml-1 text-xs text-muted-foreground">
            ({row.original.currency})
          </span>
        </div>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de pago",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <span>{row.getValue("paymentMethod")}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm"
          className="bg-[#1e1756]/10 border-purple-800/20 hover:bg-[#1e1756]/30 hover:border-purple-800/40"
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>{new Date(row.getValue("startDate")).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-purple-500" />
          <span>{row.getValue("category")}</span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Monto Mensual",
      cell: ({ row }) => {
        const expense = row.original;
        if (viewCurrency === expense.currency) {
          return (
            <div className="flex items-center">
              <span className="font-medium">{formatCurrency(expense.amount, expense.currency)}</span>
              <span className="ml-1 text-xs text-muted-foreground">
                ({expense.currency})
              </span>
            </div>
          );
        }
        
        const convertedAmount = convertCurrency(
          expense.amount, 
          expense.currency, 
          viewCurrency
        );
        
        return (
          <div className="flex items-center">
            <span className="font-medium">{formatCurrency(convertedAmount, viewCurrency)}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({expense.currency})
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1e1756] border-purple-800/30">
                  <p>Original: {formatCurrency(expense.amount, expense.currency)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      }
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
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>{labels[freq as keyof typeof labels] || freq}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de pago",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <span>{row.getValue("paymentMethod")}</span>
        </div>
      ),
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
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.isAutoDebit ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
          {row.original.isAutoDebit ? "Sí" : "No"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#1e1756]/10 border-purple-800/20 hover:bg-[#1e1756]/30 hover:border-purple-800/40"
          onClick={() => handleEditRecurringExpense(row.original)}
        >
          Editar
        </Button>
      ),
    }
  ];

  return (
    <div className="bg-[#0d0a25]/60 min-h-screen p-6">
      <PageHeader
        title="Gastos"
        description="Gestión y análisis de gastos"
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <Select
            value={timeFrame}
            onValueChange={(value) => setTimeFrame(value as "month" | "quarter" | "year")}
          >
            <SelectTrigger className="w-[180px] bg-[#1e1756]/20 border-purple-800/20 text-white">
              <Calendar className="mr-2 h-4 w-4 text-purple-400" />
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={viewCurrency}
            onValueChange={(value) => setViewCurrency(value as Currency)}
          >
            <SelectTrigger className="w-[180px] bg-[#1e1756]/20 border-purple-800/20 text-white">
              <ArrowDownUp className="mr-2 h-4 w-4 text-purple-400" />
              <SelectValue placeholder="Ver en moneda" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
              <SelectItem value="COP">Ver en COP</SelectItem>
              <SelectItem value="USD">Ver en USD</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline"
            onClick={syncRecurringExpenses}
            size="sm"
            disabled={syncLoading}
            className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40 hover:border-purple-800/40"
          >
            <RefreshCw className={`mr-2 h-4 w-4 text-purple-400 ${syncLoading ? 'animate-spin' : ''}`} />
            {syncLoading ? 'Sincronizando...' : 'Sincronizar Recurrentes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList className="bg-[#1e1756]/20 border border-purple-800/20">
          <TabsTrigger 
            value="resumen" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Resumen
          </TabsTrigger>
          <TabsTrigger 
            value="variables" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Gastos Variables
          </TabsTrigger>
          <TabsTrigger 
            value="recurrentes" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Gastos Recurrentes
          </TabsTrigger>
          <TabsTrigger 
            value="causados" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Gastos Causados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          {expenseSummary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-[#1e1756]/20 border-purple-800/20 text-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <TrendingDown className="mr-2 h-5 w-5 text-purple-400" />
                    Total de Gastos
                  </CardTitle>
                  <CardDescription className="text-slate-300">Período actual</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{formatCurrency(expenseSummary.total_expenses, viewCurrency)}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1e1756]/20 border-purple-800/20 text-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Clock className="mr-2 h-5 w-5 text-purple-400" />
                    Gastos Recurrentes
                  </CardTitle>
                  <CardDescription className="text-slate-300">Del total de gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{formatCurrency(expenseSummary.recurring_expenses, viewCurrency)}</p>
                  <p className="text-sm text-slate-300">
                    {expenseSummary.total_expenses > 0 
                      ? ((expenseSummary.recurring_expenses / expenseSummary.total_expenses) * 100).toFixed(1) 
                      : "0"}% del total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1e1756]/20 border-purple-800/20 text-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Filter className="mr-2 h-5 w-5 text-purple-400" />
                    Gastos Variables
                  </CardTitle>
                  <CardDescription className="text-slate-300">Del total de gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{formatCurrency(expenseSummary.variable_expenses, viewCurrency)}</p>
                  <p className="text-sm text-slate-300">
                    {expenseSummary.total_expenses > 0 
                      ? ((expenseSummary.variable_expenses / expenseSummary.total_expenses) * 100).toFixed(1) 
                      : "0"}% del total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1e1756]/20 border-purple-800/20 text-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Tag className="mr-2 h-5 w-5 text-purple-400" />
                    Categoría Principal
                  </CardTitle>
                  <CardDescription className="text-slate-300">Mayor gasto</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{expenseSummary.top_category || "N/A"}</p>
                  <p className="text-sm text-slate-300">
                    {formatCurrency(expenseSummary.top_category_amount, viewCurrency)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1e1756]/20 border-purple-800/20 text-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <CreditCard className="mr-2 h-5 w-5 text-purple-400" />
                    Promedio Mensual
                  </CardTitle>
                  <CardDescription className="text-slate-300">Período actual</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{formatCurrency(expenseSummary.avg_monthly_expense, viewCurrency)}</p>
                  <p className="text-sm text-slate-300">
                    Tendencia: {expenseSummary.expense_trend > 0 ? "+" : ""}{expenseSummary.expense_trend.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="variables">
          <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between bg-[#1e1756]/30 border-b border-purple-800/20">
              <div>
                <CardTitle className="text-white">Gastos Variables</CardTitle>
                <CardDescription className="text-slate-300">Listado de gastos no recurrentes</CardDescription>
              </div>
              <AddExpenseDialog isRecurring={false} />
            </CardHeader>
            <CardContent className="pt-6">
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
          <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between bg-[#1e1756]/30 border-b border-purple-800/20">
              <div>
                <CardTitle className="text-white">Gastos Recurrentes</CardTitle>
                <CardDescription className="text-slate-300">Gastos fijos y periódicos</CardDescription>
              </div>
              <AddExpenseDialog isRecurring={true} />
            </CardHeader>
            <CardContent className="pt-6">
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