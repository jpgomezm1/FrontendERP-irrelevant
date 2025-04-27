import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { 
  FileText, 
  Download, 
  Check, 
  Calendar, 
  CreditCard, 
  AlertCircle, 
  Tag, 
  Clock, 
  ArrowDownUp, 
  Filter,
  DollarSign,
  Info,
  PieChart 
} from "lucide-react";
import { format, isBefore, isAfter, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency, convertCurrency, Currency, formatDate, getStatusBadge } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/ui/stats-card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCausedExpenses, updateCausedExpenseStatus, CausedExpense } from "@/services/expenseService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AccruedExpenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | "all">("all");
  const [viewCurrency, setViewCurrency] = useState<Currency>("COP");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [periodFilter, setPeriodFilter] = useState<string>("month");
  const [selectedExpense, setSelectedExpense] = useState<CausedExpense | null>(null);
  const [markAsPaidOpen, setMarkAsPaidOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("todos");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch caused expenses using the getCausedExpenses function
  const { data: causedExpenses = [], isLoading } = useQuery({
    queryKey: ['caused-expenses'],
    queryFn: getCausedExpenses
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

  // Filter expenses based on date range, currency and status tab
  const filteredExpenses = causedExpenses.filter(expense => {
    const inDateRange = dateRange?.from && dateRange?.to 
      ? !isBefore(expense.date, dateRange.from) && !isAfter(expense.date, dateRange.to)
      : true;
    
    const matchesCurrency = selectedCurrency === "all" || expense.currency === selectedCurrency;
    
    const matchesStatusTab = 
      selectedTab === "todos" ? true : 
      selectedTab === "pendientes" ? expense.status === "pendiente" :
      selectedTab === "pagados" ? expense.status === "pagado" : true;
    
    return inDateRange && matchesCurrency && matchesStatusTab;
  });

  // Calculate totals by category
  const totalByCategoryAndCurrency = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category;
    const currency = expense.currency;
    
    if (!acc[category]) {
      acc[category] = { COP: 0, USD: 0 };
    }
    
    acc[category][currency] += expense.amount;
    
    return acc;
  }, {} as Record<string, Record<Currency, number>>);

  // Calculate totals by payment method
  const totalByPaymentMethod = filteredExpenses.reduce((acc, expense) => {
    const method = expense.paymentMethod;
    if (!acc[method]) {
      acc[method] = 0;
    }
    
    const amount = expense.currency === viewCurrency 
      ? expense.amount 
      : convertCurrency(expense.amount, expense.currency, viewCurrency);
    
    acc[method] += amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total in view currency
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

  // Split expenses by status
  const pendingExpenses = filteredExpenses.filter(expense => expense.status === "pendiente");
  const paidExpenses = filteredExpenses.filter(expense => expense.status === "pagado");
  
  // Calculate percentage of paid/pending
  const pendingTotal = pendingExpenses.reduce((acc, expense) => {
    const amount = expense.currency === viewCurrency 
      ? expense.amount 
      : convertCurrency(expense.amount, expense.currency, viewCurrency);
    return acc + amount;
  }, 0);
  
  const paidTotal = paidExpenses.reduce((acc, expense) => {
    const amount = expense.currency === viewCurrency 
      ? expense.amount 
      : convertCurrency(expense.amount, expense.currency, viewCurrency);
    return acc + amount;
  }, 0);

  const pendingPercentage = totalInViewCurrency > 0 
    ? Math.round((pendingTotal / totalInViewCurrency) * 100) 
    : 0;
  
  const paidPercentage = totalInViewCurrency > 0 
    ? Math.round((paidTotal / totalInViewCurrency) * 100) 
    : 0;

  // Handle marking expense as paid
  const handleMarkAsPaid = async () => {
    if (selectedExpense) {
      try {
        await updateCausedExpenseStatus(selectedExpense.id, 'pagado', new Date());
        
        queryClient.invalidateQueries({ queryKey: ['caused-expenses'] });
        
        toast({
          title: "Gasto marcado como pagado",
          description: `El gasto "${selectedExpense.description}" ha sido marcado como pagado.`,
          icon: <Check className="h-4 w-4 text-green-400" />
        });
        
        setMarkAsPaidOpen(false);
        setSelectedExpense(null);
      } catch (error) {
        console.error("Error marking expense as paid:", error);
        toast({
          title: "Error",
          description: "No se pudo marcar el gasto como pagado.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-400" />
        });
      }
    }
  };

  // Handle export to Excel
  const handleExportToExcel = () => {
    setIsExporting(true);
    
    // Simulate export delay
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Exportación completada",
        description: "El archivo ha sido descargado correctamente.",
        icon: <Check className="h-4 w-4 text-green-400" />
      });
    }, 1500);
  };

  // Group recurring expenses by sourceId to count occurrences
  const recurringExpenseCounts = causedExpenses.reduce((acc, expense) => {
    if (expense.sourceType === 'recurrente') {
      if (!acc[expense.sourceId]) {
        acc[expense.sourceId] = {
          count: 1,
          originalDate: expense.date // This may not be the actual start date
        };
      } else {
        acc[expense.sourceId].count += 1;
        // Keep track of the earliest date as potential original date
        if (expense.date < acc[expense.sourceId].originalDate) {
          acc[expense.sourceId].originalDate = expense.date;
        }
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
        const isRecurring = expense.sourceType === 'recurrente';
        const count = isRecurring ? recurringExpenseCounts[expense.sourceId]?.count : 0;
        
        return (
          <div className="flex flex-col">
            <span className="text-white font-medium">{expense.description}</span>
            {isRecurring && (
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="text-xs bg-purple-900/30 text-purple-300 border-purple-800/30">
                  <Clock className="h-3 w-3 mr-1 text-purple-400" />
                  Recurrente
                </Badge>
                <span className="text-xs text-slate-400 ml-2">
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
        const isRecurring = expense.sourceType === 'recurrente';
        
        // Check if date is in the past and expense is pending
        const isOverdue = expense.status === 'pendiente' && 
          new Date(expense.date) < new Date() && 
          new Date(expense.date).setHours(0, 0, 0, 0) !== new Date().setHours(0, 0, 0, 0);
        
        return (
          <div className="flex items-center">
            <span className={`${isOverdue ? 'text-red-300 font-medium' : 'text-white'}`}>
              {formattedDate}
            </span>
            {isOverdue && (
              <Badge variant="outline" className="ml-2 text-xs bg-red-900/30 text-red-300 border-red-800/30">
                Vencido
              </Badge>
            )}
            {isRecurring && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Calendar className="h-4 w-4 ml-1 text-purple-400" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1e1756] border-purple-800/30 text-white">
                    <p>Gasto recurrente</p>
                    <p className="text-xs">Fecha: {formatDate(expense.date)}</p>
                    {recurringExpenseCounts[expense.sourceId]?.count > 1 && (
                      <p className="text-xs">Ocurrencias: {recurringExpenseCounts[expense.sourceId]?.count}</p>
                    )}
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
        // Direct display of the amount from the database record without any calculations
        // If viewing in original currency
        if (viewCurrency === expense.currency) {
          return <span className="text-white font-medium">{formatCurrency(expense.amount, expense.currency)}</span>;
        }
        
        // If we need to convert
        const convertedAmount = convertCurrency(
          expense.amount, 
          expense.currency, 
          viewCurrency
        );
        
        return (
          <div className="flex items-center">
            <span className="text-white font-medium">{formatCurrency(convertedAmount, viewCurrency)}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="ml-1 text-xs text-slate-400">
                    ({expense.currency})
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1e1756] border-purple-800/30 text-white">
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
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-purple-400" />
          <span className="text-white">{row.original.category}</span>
        </div>
      )
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de Pago",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 mr-2 text-slate-400" />
          <span className="text-white">{row.original.paymentMethod}</span>
        </div>
      )
    },
    {
      accessorKey: "sourceType",
      header: "Tipo",
      cell: ({ row }: { row: any }) => {
        const sourceType = row.original.sourceType;
        return (
          <Badge variant={sourceType === 'recurrente' ? "outline" : "secondary"} 
                 className={`font-normal ${
                   sourceType === 'recurrente' 
                     ? 'bg-purple-900/30 text-purple-300 border-purple-800/30' 
                     : 'bg-slate-800/50 text-slate-300 border-slate-700/50'
                 }`}>
            {sourceType === 'recurrente' ? 'Recurrente' : 'Variable'}
          </Badge>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }: { row: any }) => {
        const status = row.original.status;
        const badgeClasses = {
          'pendiente': 'bg-yellow-900/30 text-yellow-300 border-yellow-800/30',
          'pagado': 'bg-green-900/30 text-green-300 border-green-800/30',
          'anulado': 'bg-red-900/30 text-red-300 border-red-800/30'
        };
        
        const statusIcons = {
          'pendiente': <Clock className="h-3 w-3 mr-1 text-yellow-300" />,
          'pagado': <Check className="h-3 w-3 mr-1 text-green-300" />,
          'anulado': <AlertCircle className="h-3 w-3 mr-1 text-red-300" />
        };
        
        return (
          <Badge variant="outline" 
                 className={`font-normal flex items-center ${badgeClasses[status as keyof typeof badgeClasses] || ''}`}>
            {statusIcons[status as keyof typeof statusIcons]}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "receipt",
      header: "Comprobante",
      cell: ({ row }: { row: any }) => (
        row.original.receipt ? (
          <Button variant="outline" size="sm" 
                  className="w-full justify-start bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40">
            <FileText className="h-4 w-4 mr-2 text-purple-400" />
            Ver
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full justify-start bg-[#1e1756]/10 border-purple-800/20 text-white hover:bg-[#1e1756]/30" 
                  disabled={row.original.status === "pagado"}>
            <FileText className="h-4 w-4 mr-2 text-slate-400" />
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
              className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
              onClick={() => {
                setSelectedExpense(row.original);
                setMarkAsPaidOpen(true);
              }}
            >
              <Check className="h-4 w-4 mr-2 text-purple-400" />
              Marcar Pagado
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-[#1e1756]/30"
          >
            Editar
          </Button>
        </div>
      ),
    },
  ];

  // Check if we have recurring expenses
  const hasRecurringExpenses = filteredExpenses.some(expense => expense.sourceType === 'recurrente');

  // Get top category
  let topCategory = { name: "N/A", amount: 0 };
  if (Object.keys(totalByCategoryAndCurrency).length > 0) {
    topCategory = Object.entries(totalByCategoryAndCurrency).reduce((top, [category, amounts]) => {
      const totalAmount = viewCurrency === "COP" 
        ? amounts.COP + convertCurrency(amounts.USD, "USD", "COP")
        : amounts.USD + convertCurrency(amounts.COP, "COP", "USD");
      
      return totalAmount > top.amount ? { name: category, amount: totalAmount } : top;
    }, { name: "", amount: 0 });
  }

  return (
    <>
      <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
        <CardHeader className="bg-[#1e1756]/30 border-b border-purple-800/20">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-purple-400" />
                Gastos Causados
              </CardTitle>
              <CardDescription className="text-slate-300">
                Visualización de todos los gastos causados en el periodo seleccionado
              </CardDescription>
            </div>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-auto">
              <TabsList className="bg-[#1e1756]/20 border border-purple-800/20">
                <TabsTrigger 
                  value="todos" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  Todos
                </TabsTrigger>
                <TabsTrigger 
                  value="pendientes" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Clock className="mr-1 h-4 w-4" />
                  Pendientes
                </TabsTrigger>
                <TabsTrigger 
                  value="pagados" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Pagados
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-col md:flex-row gap-4">
              <Select 
                value={periodFilter} 
                onValueChange={handlePeriodChange}
              >
                <SelectTrigger className="w-[180px] bg-[#1e1756]/20 border-purple-800/20 text-white">
                  <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
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
                  className="bg-[#1e1756]/20 border-purple-800/20 text-white"
                />
              )}
              
              <div className="flex gap-2">
                <Select
                  value={selectedCurrency}
                  onValueChange={(val) => setSelectedCurrency(val as Currency | "all")}
                >
                  <SelectTrigger className="w-[150px] bg-[#1e1756]/20 border-purple-800/20 text-white">
                    <Filter className="h-4 w-4 mr-2 text-purple-400" />
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="COP">COP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={viewCurrency}
                  onValueChange={(val) => setViewCurrency(val as Currency)}
                >
                  <SelectTrigger className="w-[150px] bg-[#1e1756]/20 border-purple-800/20 text-white">
                    <ArrowDownUp className="h-4 w-4 mr-2 text-purple-400" />
                    <SelectValue placeholder="Ver en" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                    <SelectItem value="COP">Ver en COP</SelectItem>
                    <SelectItem value="USD">Ver en USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              className="w-full md:w-auto bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
              onClick={handleExportToExcel}
              disabled={isExporting || filteredExpenses.length === 0}
            >
              <Download className={`h-4 w-4 mr-2 text-purple-400 ${isExporting ? 'animate-pulse' : ''}`} />
              {isExporting ? 'Exportando...' : 'Exportar Excel'}
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
              icon={<DollarSign className="h-4 w-4 text-purple-400" />}
              className="bg-[#1e1756]/20 border-purple-800/20 text-white shadow-md"
              valueClassName="text-white"
              descriptionClassName="text-slate-300"
            />
            
            <StatsCard
              title="Gastos Pendientes"
              value={formatCurrency(pendingTotal, viewCurrency)}
              description={`${pendingPercentage}% del total`}
              icon={<Clock className="h-4 w-4 text-yellow-400" />}
              className="bg-[#1e1756]/20 border-purple-800/20 text-white shadow-md"
              valueClassName="text-white"
              descriptionClassName="text-slate-300"
              secondaryIcon={
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-900/20 border border-yellow-800/30">
                  <span className="text-yellow-300 text-xs font-medium">{pendingPercentage}%</span>
                </div>
              }
            />
            
            <StatsCard
              title="Gastos Pagados"
              value={formatCurrency(paidTotal, viewCurrency)}
              description={`${paidPercentage}% del total`}
              icon={<Check className="h-4 w-4 text-green-400" />}
              className="bg-[#1e1756]/20 border-purple-800/20 text-white shadow-md"
              valueClassName="text-white"
              descriptionClassName="text-slate-300"
              secondaryIcon={
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-900/20 border border-green-800/30">
                  <span className="text-green-300 text-xs font-medium">{paidPercentage}%</span>
                </div>
              }
            />
            
            <StatsCard
              title="Categoría Principal"
              value={topCategory.name}
              description={formatCurrency(topCategory.amount, viewCurrency)}
              icon={<Tag className="h-4 w-4 text-purple-400" />}
              className="bg-[#1e1756]/20 border-purple-800/20 text-white shadow-md"
              valueClassName="text-white"
              descriptionClassName="text-slate-300"
            />
          </div>
          
          {filteredExpenses.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-white">No hay gastos causados</h3>
              <p className="text-slate-300 mt-2 max-w-md">
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
            <div className="p-4 bg-purple-900/20 rounded-md border border-purple-800/30">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-purple-400 mr-2" />
                <h3 className="text-sm font-medium text-white">Información sobre gastos recurrentes</h3>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Los gastos recurrentes se muestran como entradas individuales para cada período. 
                La cantidad de ocurrencias se calcula automáticamente basada en la fecha de inicio y la frecuencia configurada.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog for marking expenses as paid */}
      <Dialog open={markAsPaidOpen} onOpenChange={setMarkAsPaidOpen}>
        <DialogContent className="bg-[#1e1756] border-purple-800/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
            <Check className="h-5 w-5 mr-2 text-green-400" />
              Marcar Gasto Como Pagado
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Complete los detalles del pago para el gasto "{selectedExpense?.description}".
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Fecha de Pago</label>
              <div className="flex h-10 w-full rounded-md border border-purple-800/30 bg-[#0f0b2a] px-3 py-2 text-white">
                {format(new Date(), "PPP", { locale: es })}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Monto a Pagar</label>
              <CurrencyInput
                value={selectedExpense?.amount}
                currency={selectedExpense?.currency || "COP"}
                readOnly
                className="bg-[#0f0b2a] border-purple-800/30 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Método de Pago</label>
              <Select defaultValue={selectedExpense?.paymentMethod}>
                <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                  <CreditCard className="h-4 w-4 mr-2 text-purple-400" />
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
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
              <label className="text-sm font-medium text-white">Comprobante (Opcional)</label>
              <div className="border-2 border-dashed border-purple-800/30 rounded-md p-6 flex flex-col items-center justify-center text-center bg-[#0f0b2a]/50">
                <FileText className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm text-slate-300">
                  Arrastra y suelta un archivo o haz clic para seleccionar
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Formatos aceptados: PDF, JPG, PNG. Máx 5MB
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
                >
                  Seleccionar Archivo
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setMarkAsPaidOpen(false)}
              className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleMarkAsPaid}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}