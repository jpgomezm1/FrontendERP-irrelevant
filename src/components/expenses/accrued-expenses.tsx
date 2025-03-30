
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Check, Calendar, Download } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Currency, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

interface AccruedExpense {
  id: number;
  description: string;
  dueDate: Date;
  amount: number;
  currency: Currency;
  status: 'Pagado' | 'Pendiente' | 'Vencido';
  category: string;
  receipt?: string;
  paymentDate?: Date;
  notes?: string;
  sourceId: number; // ID of the recurring expense that generated this
}

const mockAccruedExpenses: AccruedExpense[] = [
  {
    id: 1,
    description: "Nómina - Junio 2023",
    dueDate: new Date("2023-06-15"),
    amount: 7500000,
    currency: "COP",
    status: "Pagado",
    category: "Personal",
    receipt: "nomina-jun-2023.pdf",
    paymentDate: new Date("2023-06-15"),
    sourceId: 1
  },
  {
    id: 2,
    description: "Arriendo Oficina - Junio 2023",
    dueDate: new Date("2023-06-05"),
    amount: 3200000,
    currency: "COP",
    status: "Pagado",
    category: "Arriendo",
    receipt: "arriendo-jun-2023.pdf",
    paymentDate: new Date("2023-06-05"),
    sourceId: 2
  },
  {
    id: 3,
    description: "Servicios Cloud - Junio 2023",
    dueDate: new Date("2023-06-10"),
    amount: 950000,
    currency: "COP",
    status: "Pagado",
    category: "Tecnología",
    receipt: "cloud-jun-2023.pdf",
    paymentDate: new Date("2023-06-10"),
    sourceId: 3
  },
  {
    id: 4,
    description: "Nómina - Julio 2023",
    dueDate: new Date("2023-07-15"),
    amount: 7500000,
    currency: "COP",
    status: "Pendiente",
    category: "Personal",
    sourceId: 1
  },
  {
    id: 5,
    description: "Arriendo Oficina - Julio 2023",
    dueDate: new Date("2023-07-05"),
    amount: 3200000,
    currency: "COP",
    status: "Pendiente",
    category: "Arriendo",
    sourceId: 2
  },
  {
    id: 6,
    description: "Servicios Cloud - Julio 2023",
    dueDate: new Date("2023-07-10"),
    amount: 950000,
    currency: "COP",
    status: "Pendiente",
    category: "Tecnología",
    sourceId: 3
  },
  {
    id: 7,
    description: "Licencia Software Anual",
    dueDate: new Date("2023-05-20"),
    amount: 2400,
    currency: "USD",
    status: "Pagado",
    category: "Tecnología",
    receipt: "licencia-anual.pdf",
    paymentDate: new Date("2023-05-19"),
    sourceId: 4
  },
  {
    id: 8,
    description: "Servicio Consultoría",
    dueDate: new Date("2023-06-25"),
    amount: 1200,
    currency: "USD",
    status: "Vencido",
    category: "Servicios Profesionales",
    sourceId: 5
  }
];

export const AccruedExpenses = () => {
  const [data, setData] = useState<AccruedExpense[]>(mockAccruedExpenses);
  const [selectedExpense, setSelectedExpense] = useState<AccruedExpense | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | "all">("all");
  
  // Calculate category totals for each currency
  const categoryTotals = data.reduce((acc, expense) => {
    if (selectedCurrency !== "all" && expense.currency !== selectedCurrency) {
      return acc;
    }
    
    const key = `${expense.category}_${expense.currency}`;
    if (!acc[key]) {
      acc[key] = {
        category: expense.category,
        currency: expense.currency,
        amount: 0,
      };
    }
    acc[key].amount += expense.amount;
    return acc;
  }, {} as Record<string, { category: string; currency: Currency; amount: number }>);

  // Filter functions based on selected period
  const filterByPeriod = (expense: AccruedExpense) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    switch (selectedPeriod) {
      case "month":
        return expense.dueDate >= startOfMonth;
      case "quarter":
        return expense.dueDate >= startOfQuarter;
      case "year":
        return expense.dueDate >= startOfYear;
      default:
        return true;
    }
  };
  
  // Filter by currency
  const filterByCurrency = (expense: AccruedExpense) => {
    return selectedCurrency === "all" || expense.currency === selectedCurrency;
  };
  
  // Combined filters
  const filteredData = data.filter(expense => 
    filterByPeriod(expense) && filterByCurrency(expense)
  );

  // Mark an expense as paid
  const markAsPaid = (expenseId: number) => {
    setData(prevData => 
      prevData.map(expense => 
        expense.id === expenseId 
          ? {
              ...expense,
              status: 'Pagado',
              paymentDate: new Date()
            }
          : expense
      )
    );
  };

  // Handle file upload
  const handleFileUpload = (file: File | null) => {
    if (file && selectedExpense) {
      setData(prevData => 
        prevData.map(expense => 
          expense.id === selectedExpense.id 
            ? {
                ...expense,
                receipt: file.name,
                status: 'Pagado',
                paymentDate: new Date()
              }
            : expense
        )
      );
      setUploadModalOpen(false);
      setSelectedExpense(null);
    }
  };

  const columns = [
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "dueDate",
      header: "Fecha Vencimiento",
      cell: ({ row }: { row: any }) => formatDate(row.original.dueDate),
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }: { row: any }) => formatCurrency(row.original.amount, row.original.currency),
    },
    {
      accessorKey: "currency",
      header: "Moneda",
    },
    {
      accessorKey: "category",
      header: "Categoría",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }: { row: any }) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(row.original.status)}`}
        >
          {row.original.status}
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
          <Button 
            variant="outline" 
            size="sm"
            disabled={row.original.status === "Pagado"}
            onClick={() => {
              setSelectedExpense(row.original);
              setUploadModalOpen(true);
            }}
          >
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
          {row.original.status !== "Pagado" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsPaid(row.original.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Marcar Pagado
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Gastos Causados</CardTitle>
          <CardDescription>
            Gastos generados automáticamente a partir de sus gastos recurrentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label htmlFor="period-filter" className="text-sm font-medium block mb-2">
                Periodo
              </label>
              <Select
                value={selectedPeriod}
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mes Actual</SelectItem>
                  <SelectItem value="quarter">Trimestre Actual</SelectItem>
                  <SelectItem value="year">Año Actual</SelectItem>
                  <SelectItem value="all">Todo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="currency-filter" className="text-sm font-medium block mb-2">
                Moneda
              </label>
              <Select
                value={selectedCurrency}
                onValueChange={(value: string) => setSelectedCurrency(value as Currency | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="COP">COP</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="ml-auto">
              <label className="text-sm font-medium block mb-2">&nbsp;</label>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Exportar Excel
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.values(categoryTotals).map((total, index) => (
              <div 
                key={index}
                className="bg-muted p-4 rounded-lg"
              >
                <div className="font-medium text-sm text-muted-foreground mb-1">
                  {total.category}
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(total.amount, total.currency)}
                </div>
              </div>
            ))}
          </div>
          
          <DataTable
            columns={columns}
            data={filteredData}
            searchColumn="description"
            searchPlaceholder="Buscar gastos causados..."
          />
        </CardContent>
      </Card>
      
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cargar Comprobante de Pago</DialogTitle>
          </DialogHeader>
          
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Descripción:</div>
                  <div>{selectedExpense.description}</div>
                </div>
                <div>
                  <div className="font-medium">Valor:</div>
                  <div>{formatCurrency(selectedExpense.amount, selectedExpense.currency)}</div>
                </div>
                <div>
                  <div className="font-medium">Fecha de vencimiento:</div>
                  <div>{formatDate(selectedExpense.dueDate)}</div>
                </div>
                <div>
                  <div className="font-medium">Categoría:</div>
                  <div>{selectedExpense.category}</div>
                </div>
              </div>
              
              <FileUpload
                onFileSelect={handleFileUpload}
                acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                maxFileSizeMB={5}
                buttonText="Seleccionar Comprobante"
              />
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccruedExpenses;
