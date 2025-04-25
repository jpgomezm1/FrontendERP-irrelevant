
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { FileText, Download, Check, Calendar, CreditCard } from "lucide-react";
import { format, isBefore, isAfter, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency, convertCurrency, Currency, formatDate, getStatusBadge } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/ui/stats-card";

// Types for our accrued expenses
interface AccruedExpense {
  id: number;
  description: string;
  dueDate: Date;
  amount: number;
  currency: Currency;
  category: string;
  paymentMethod: string;
  status: 'pagado' | 'pendiente' | 'vencido';
  receipt?: string;
  isRecurring: boolean;
  recurringId?: number;
  notes?: string;
}

// Mock accrued expenses data
const accruedExpensesData: AccruedExpense[] = [
  {
    id: 1,
    description: "Arriendo Oficina",
    dueDate: new Date(2023, 8, 5), // September 5, 2023
    amount: 3200000,
    currency: "COP",
    category: "Arriendo",
    paymentMethod: "Transferencia",
    status: "pagado",
    receipt: "recibo-arriendo-sept.pdf",
    isRecurring: true,
    recurringId: 2
  },
  {
    id: 2,
    description: "Arriendo Oficina",
    dueDate: new Date(2023, 9, 5), // October 5, 2023
    amount: 3200000,
    currency: "COP",
    category: "Arriendo",
    paymentMethod: "Transferencia",
    status: "pagado",
    receipt: "recibo-arriendo-oct.pdf",
    isRecurring: true,
    recurringId: 2
  },
  {
    id: 3,
    description: "Arriendo Oficina",
    dueDate: new Date(2023, 10, 5), // November 5, 2023
    amount: 3200000,
    currency: "COP",
    category: "Arriendo",
    paymentMethod: "Transferencia",
    status: "pendiente",
    isRecurring: true,
    recurringId: 2
  },
  {
    id: 4,
    description: "Servicios Cloud",
    dueDate: new Date(2023, 10, 10), // November 10, 2023
    amount: 950000,
    currency: "COP",
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    status: "pendiente",
    isRecurring: true,
    recurringId: 3
  },
  {
    id: 5,
    description: "Suscripción Herramientas de Diseño",
    dueDate: new Date(2023, 10, 15), // November 15, 2023
    amount: 50,
    currency: "USD",
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    status: "pendiente",
    isRecurring: true,
    recurringId: 5
  },
  {
    id: 6,
    description: "Licencia Software Anual",
    dueDate: new Date(2023, 5, 20), // June 20, 2023
    amount: 1200,
    currency: "USD",
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    status: "pagado",
    receipt: "licencia-adobe.pdf",
    isRecurring: false
  },
  {
    id: 7,
    description: "Servicio AWS",
    dueDate: new Date(2023, 5, 25), // June 25, 2023
    amount: 350,
    currency: "USD",
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    status: "pagado",
    receipt: "aws-junio.pdf",
    isRecurring: false
  },
  {
    id: 8,
    description: "Nómina",
    dueDate: new Date(2023, 10, 15), // November 15, 2023
    amount: 7500000,
    currency: "COP",
    category: "Personal",
    paymentMethod: "Transferencia",
    status: "pendiente",
    isRecurring: true,
    recurringId: 1
  },
  {
    id: 9,
    description: "Servicios Contables",
    dueDate: new Date(2023, 10, 20), // November 20, 2023
    amount: 1800000,
    currency: "COP",
    category: "Servicios Profesionales",
    paymentMethod: "Transferencia",
    status: "vencido",
    isRecurring: true,
    recurringId: 4
  }
];

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
  const filteredExpenses = accruedExpensesData.filter(expense => {
    const inDateRange = dateRange?.from && dateRange?.to 
      ? !isBefore(expense.dueDate, dateRange.from) && !isAfter(expense.dueDate, dateRange.to)
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

  // Columns for data table
  const columns = [
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "dueDate",
      header: "Fecha de Vencimiento",
      cell: ({ row }: { row: any }) => formatDate(row.original.dueDate),
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
          
          <DataTable 
            columns={columns} 
            data={filteredExpenses}
            searchColumn="description"
            searchPlaceholder="Buscar gastos causados..."
          />
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

// Helper components that will be used in the AccruedExpenses component
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
