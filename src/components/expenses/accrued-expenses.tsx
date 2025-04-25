
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { FileText, Download, Check, Calendar, CreditCard, AlertCircle } from "lucide-react";
import { format, isBefore, isAfter, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency, convertCurrency, Currency, formatDate, getStatusBadge } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/ui/stats-card";
import { useQuery } from "@tanstack/react-query";
import { Expense, getAccruedExpenses } from "@/services/financeService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Define the AccruedExpense interface that extends the Expense interface
interface AccruedExpense extends Expense {
  status: 'pagado' | 'pendiente' | 'vencido';
}

export function AccruedExpenses() {
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | "all">("all");
  const [viewCurrency, setViewCurrency] = useState<Currency>("COP");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [periodFilter, setPeriodFilter] = useState<string>("month");
  const [selectedExpense, setSelectedExpense] = useState<AccruedExpense | null>(null);
  const [markAsPaidOpen, setMarkAsPaidOpen] = useState(false);

  // Fetch accrued expenses using the getAccruedExpenses function
  const { data: fetchedExpenses = [], isLoading } = useQuery({
    queryKey: ['accrued-expenses'],
    queryFn: getAccruedExpenses
  });

  // Process fetched expenses to add status
  const accruedExpenses: AccruedExpense[] = fetchedExpenses.map(expense => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Determine status based on date
    let status: 'pagado' | 'pendiente' | 'vencido';
    if (expense.date < today) {
      status = 'vencido'; // Past expenses are considered overdue
    } else {
      status = 'pendiente';
    }
    
    return {
      ...expense,
      status
    };
  });

  // Set date range based on period selection
  const handlePeriodChange = (period: string) => {
    const today = new Date();
    let start: Date;
    let end: Date;

    setPeriodFilter(period);

    switch (period) {
      case "month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "quarter":
        start = startOfMonth(subMonths(today, 2));
        end = endOfMonth(today);
        break;
      case "year":
        start = startOfMonth(subMonths(today, 11));
        end = endOfMonth(today);
        break;
      default:
        return; // For custom, keep current range
    }

    setDateRange({ from: start, to: end });
  };

  // Filter expenses based on date range and currency
  const filteredExpenses = accruedExpenses.filter(expense => {
    const inDateRange = dateRange?.from && dateRange?.to 
      ? !isBefore(expense.date, dateRange.from) && !isAfter(expense.date, dateRange.to)
      : true;
    
    const matchesCurrency = selectedCurrency === "all" || expense.currency === selectedCurrency;
    
    return inDateRange && matchesCurrency;
  });

  // Calculate totals
  const totalByCategoryAndCurrency = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category;
    const currency = expense.currency;
    
    if (!acc[category]) {
      acc[category] = { COP: 0, USD: 0 };
    }
    
    acc[category][currency] += expense.amount;
    
    return acc;
  }, {} as Record<string, Record<Currency, number>>);

  const totalInViewCurrency = Object.entries(totalByCategoryAndCurrency).reduce(
    (acc, [_, amounts]) => {
      let totalInView = 0;
      
      // Convert and sum both currencies to view currency
      if (viewCurrency === "COP") {
        totalInView += amounts.COP + convertCurrency(amounts.USD, "USD", "COP");
      } else {
        totalInView += amounts.USD + convertCurrency(amounts.COP, "COP", "USD");
      }
      
      return acc + totalInView;
    }, 
    0
  );

  // Handle marking expense as paid
  const handleMarkAsPaid = () => {
    if (selectedExpense) {
      toast({
        title: "Gasto marcado como pagado",
        description: `El gasto "${selectedExpense.description}" ha sido marcado como pagado.`
      });
      setMarkAsPaidOpen(false);
      setSelectedExpense(null);
    }
  };

  // Count recurring expense occurrences
  const recurringExpenseCounts = fetchedExpenses.reduce((acc, expense) => {
    if (expense.isRecurring) {
      if (!acc[expense.id]) {
        acc[expense.id] = {
          count: 1,
          originalDate: expense.date
        };
      } else {
        acc[expense.id].count += 1;
      }
    }
    return acc;
  }, {} as Record<number, { count: number, originalDate: Date }>);

  // Columns for data table
  const columns = [
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }: { row: any }) => {
        const expense = row.original;
        const isRecurring = expense.isRecurring;
        const count = isRecurring ? recurringExpenseCounts[expense.id]?.count : 0;
        
        return (
          <div className="flex flex-col">
            <span>{expense.description}</span>
            {isRecurring && (
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Recurrente
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">
                  {count > 1 ? `${count} ocurrencias` : ''}
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "date",
      header: "Fecha de Vencimiento",
      cell: ({ row }: { row: any }) => {
        const expense = row.original;
        const formattedDate = formatDate(expense.date);
        const isRecurring = expense.isRecurring;
        
        return (
          <div className="flex items-center">
            {formattedDate}
            {isRecurring && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Calendar className="h-4 w-4 ml-1 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gasto recurrente</p>
                    <p className="text-xs">Inicio: {formatDate(recurringExpenseCounts[expense.id]?.originalDate || expense.date)}</p>
                    <p className="text-xs">Frecuencia: {expense.frequency}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }: { row: any }) => {
        const expense = row.original;
        
        // If viewing in original currency
        if (viewCurrency === expense.currency) {
          return formatCurrency(expense.amount, expense.currency);
        }
        
        // If we need to convert
        const convertedAmount = convertCurrency(
          expense.amount, 
          expense.currency, 
          viewCurrency
        );
        
        return (
          <div className="flex items-center">
            <span>{formatCurrency(convertedAmount, viewCurrency)}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({expense.currency})
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Original: {formatCurrency(expense.amount, expense.currency)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      }
    },
    {
      accessorKey: "category",
      header: "Categoría",
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de Pago",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
          {row.original.paymentMethod}
        </div>
      )
    },
    {
      accessorKey: "frequency",
      header: "Frecuencia",
      cell: ({ row }: { row: any }) => row.original.frequency || "Único",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }: { row: any }) => (
        <span className={getStatusBadge(row.original.status)}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </span>
      ),
    },
    {
      accessorKey: "receipt",
      header: "Comprobante",
      cell: ({ row }: { row: any }) => (
        row.original.receipt ? (
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Ver
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="w-full justify-start" disabled={row.original.status === "pagado"}>
            <FileText className="h-4 w-4 mr-2" />
            Subir
          </Button>
        )
      ),
    },
    {
      accessorKey: "actions",
      header: "Acciones",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          {row.original.status !== "pagado" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedExpense(row.original);
                setMarkAsPaidOpen(true);
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar Pagado
            </Button>
          )}
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </div>
      ),
    },
  ];

  // Check if we have recurring expenses
  const hasRecurringExpenses = filteredExpenses.some(expense => expense.isRecurring);

  return (
    <>
      <Card>
        <CardHeader className="bg-muted/20">
          <CardTitle>Gastos Causados</CardTitle>
          <CardDescription>
            Visualización de todos los gastos causados en el periodo seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select 
                value={periodFilter} 
                onValueChange={handlePeriodChange}
              >
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                  <SelectItem value="year">Este Año</SelectItem>
                  <SelectItem value="custom">Periodo Personalizado</SelectItem>
                </SelectContent>
              </Select>
              
              {periodFilter === "custom" && (
                <DatePickerWithRange
                  value={dateRange}
                  onChange={setDateRange}
                />
              )}
              
              <div className="flex gap-2">
                <Select
                  value={selectedCurrency}
                  onValueChange={(val) => setSelectedCurrency(val as Currency | "all")}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="COP">COP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={viewCurrency}
                  onValueChange={(val) => setViewCurrency(val as Currency)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Ver en" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COP">Ver en COP</SelectItem>
                    <SelectItem value="USD">Ver en USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button className="w-full md:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Gastos Causados"
              value={formatCurrency(totalInViewCurrency, viewCurrency)}
              description={dateRange?.from && dateRange?.to 
                ? `${format(dateRange.from, "dd/MM/yyyy", { locale: es })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: es })}`
                : "Periodo actual"
              }
              icon={<CreditCard className="h-4 w-4" />}
            />
            
            {Object.entries(totalByCategoryAndCurrency).map(([category, currencies], index) => {
              const totalInCategory = viewCurrency === "COP" 
                ? currencies.COP + convertCurrency(currencies.USD, "USD", "COP")
                : currencies.USD + convertCurrency(currencies.COP, "COP", "USD");
              
              if (index < 3) { // Only show top 3 categories
                return (
                  <StatsCard
                    key={category}
                    title={`Total ${category}`}
                    value={formatCurrency(totalInCategory, viewCurrency)}
                    description="Incluye gastos recurrentes y variables"
                  />
                );
              }
              return null;
            })}
          </div>
          
          {accruedExpenses.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No hay gastos causados</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                No se encontraron gastos causados en el período seleccionado. Intente cambiar los filtros o agregar nuevos gastos.
              </p>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredExpenses}
              searchColumn="description"
              searchPlaceholder="Buscar gastos causados..."
              isLoading={isLoading}
            />
          )}
          
          {hasRecurringExpenses && (
            <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-700 mr-2" />
                <h3 className="text-sm font-medium text-blue-800">Información sobre gastos recurrentes</h3>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Los gastos recurrentes se muestran como entradas individuales para cada período. 
                Un gasto con frecuencia mensual registrado desde enero aparecerá como una entrada por cada mes hasta la fecha actual.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog for marking expenses as paid */}
      <Dialog open={markAsPaidOpen} onOpenChange={setMarkAsPaidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar Gasto Como Pagado</DialogTitle>
            <DialogDescription>
              Complete los detalles del pago para el gasto "{selectedExpense?.description}".
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de Pago</label>
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                {format(new Date(), "PPP", { locale: es })}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Monto a Pagar</label>
              <CurrencyInput
                value={selectedExpense?.amount}
                currency={selectedExpense?.currency || "COP"}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Método de Pago</label>
              <Select defaultValue={selectedExpense?.paymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Nequi">Nequi</SelectItem>
                  <SelectItem value="Daviplata">Daviplata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Comprobante (Opcional)</label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arrastra y suelta un archivo o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceptados: PDF, JPG, PNG. Máx 5MB
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Seleccionar Archivo
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkAsPaidOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMarkAsPaid}>
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
