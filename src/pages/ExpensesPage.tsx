import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  CalendarIcon, 
  Plus, 
  FileText, 
  CreditCard, 
  DollarSign, 
  Download, 
  InfoIcon,
  Check
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { DataTable } from "@/components/ui/data-table";
import { CurrencyInput } from "@/components/ui/currency-input";
import { 
  Currency, 
  CURRENCIES, 
  convertCurrency,
  formatCurrency, 
  formatDate, 
  getRandomColor, 
  getStatusBadge,
  calculateNextPaymentDate, 
  generatePaymentDates 
} from "@/lib/utils";
import { format, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StatsCard } from "@/components/ui/stats-card";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend,
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { AccruedExpenses } from "@/components/expenses/accrued-expenses";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const expensesData = [
  {
    id: 1,
    description: "Pago Desarrollador Frontend",
    date: new Date("2023-06-15"),
    amount: 2500000,
    currency: "COP" as Currency,
    category: "Freelancers",
    paymentMethod: "Transferencia",
    receipt: "recibo-dev-123.pdf",
    notes: "Proyecto Dashboard",
  },
  {
    id: 2,
    description: "Licencias Software",
    date: new Date("2023-06-10"),
    amount: 850000,
    currency: "COP" as Currency,
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    receipt: "licencia-software.pdf",
    notes: "",
  },
  {
    id: 3,
    description: "Reunión con Cliente",
    date: new Date("2023-06-08"),
    amount: 120000,
    currency: "COP" as Currency,
    category: "Alimentación",
    paymentMethod: "Efectivo",
    receipt: "factura-restaurant.jpg",
    notes: "Almuerzo con Cliente A",
  },
  {
    id: 4,
    description: "Viaje a Medellín",
    date: new Date("2023-06-05"),
    amount: 780000,
    currency: "COP" as Currency,
    category: "Transporte",
    paymentMethod: "Tarjeta de Crédito",
    receipt: "tiquetes-medellin.pdf",
    notes: "Reunión Cliente B",
  },
  {
    id: 5,
    description: "Publicidad Facebook",
    date: new Date("2023-06-03"),
    amount: 450000,
    currency: "COP" as Currency,
    category: "Marketing",
    paymentMethod: "Tarjeta de Crédito",
    receipt: "facebook-ads.pdf",
    notes: "",
  },
  {
    id: 6,
    description: "Licencia Software Anual",
    date: new Date("2023-06-20"),
    amount: 1200,
    currency: "USD" as Currency,
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    receipt: "licencia-adobe.pdf",
    notes: "Adobe Creative Cloud",
  },
  {
    id: 7,
    description: "Servicio AWS",
    date: new Date("2023-06-25"),
    amount: 350,
    currency: "USD" as Currency,
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    receipt: "aws-junio.pdf",
    notes: "Hosting y servicios cloud",
  },
];

const recurringExpensesData = [
  {
    id: 1,
    description: "Nómina",
    frequency: "Mensual",
    startDate: new Date("2023-01-15"),
    amount: 7500000,
    currency: "COP" as Currency,
    category: "Personal",
    paymentMethod: "Transferencia",
    status: "Activo",
    nextPayment: new Date("2023-07-15"),
  },
  {
    id: 2,
    description: "Arriendo Oficina",
    frequency: "Mensual",
    startDate: new Date("2023-01-05"),
    amount: 3200000,
    currency: "COP" as Currency,
    category: "Arriendo",
    paymentMethod: "Transferencia",
    status: "Activo",
    nextPayment: new Date("2023-07-05"),
  },
  {
    id: 3,
    description: "Servicios Cloud",
    frequency: "Mensual",
    startDate: new Date("2023-01-10"),
    amount: 950000,
    currency: "COP" as Currency,
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    status: "Activo",
    nextPayment: new Date("2023-07-10"),
  },
  {
    id: 4,
    description: "Servicios Contables",
    frequency: "Trimestral",
    startDate: new Date("2023-01-20"),
    amount: 1800000,
    currency: "COP" as Currency,
    category: "Servicios Profesionales",
    paymentMethod: "Transferencia",
    status: "Activo",
    nextPayment: new Date("2023-07-20"),
  },
  {
    id: 5,
    description: "Suscripción Herramientas de Diseño",
    frequency: "Mensual",
    startDate: new Date("2023-02-15"),
    amount: 50,
    currency: "USD" as Currency,
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    status: "Activo",
    nextPayment: new Date("2023-07-15"),
  },
  {
    id: 6,
    description: "Hosting Anual",
    frequency: "Anual",
    startDate: new Date("2023-03-01"),
    amount: 300,
    currency: "USD" as Currency,
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    status: "Pausado",
    nextPayment: new Date("2024-03-01"),
  },
];

const expenseFormSchema = z.object({
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  currency: z.enum(["COP", "USD"], {
    required_error: "Seleccione una moneda",
  }),
  category: z.string({
    required_error: "Seleccione una categoría",
  }),
  paymentMethod: z.string({
    required_error: "Seleccione un método de pago",
  }),
  receipt: z.any().optional(),
  notes: z.string().optional(),
});

const recurringExpenseFormSchema = z.object({
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  frequency: z.string({
    required_error: "Seleccione una frecuencia",
  }),
  startDate: z.date({
    required_error: "La fecha de inicio es requerida",
  }),
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  currency: z.enum(["COP", "USD"], {
    required_error: "Seleccione una moneda",
  }),
  category: z.string({
    required_error: "Seleccione una categoría",
  }),
  paymentMethod: z.string({
    required_error: "Seleccione un método de pago",
  }),
  notes: z.string().optional(),
});

const expenseCategories = [
  "Transporte",
  "Alimentación",
  "Tecnología",
  "Freelancers",
  "Marketing",
  "Personal",
  "Arriendo",
  "Servicios",
  "Impuestos",
  "Servicios Profesionales",
  "Otros",
];

const paymentMethods = [
  "Efectivo",
  "Transferencia",
  "Tarjeta de Crédito",
  "Tarjeta de Débito",
  "PayPal",
  "Nequi",
  "Daviplata",
];

const frequencies = [
  "Diaria",
  "Semanal",
  "Quincenal",
  "Mensual",
  "Bimensual",
  "Trimestral",
  "Semestral",
  "Anual",
];

const ExpensesPage = () => {
  const { toast } = useToast();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | "all">("all");
  const [viewCurrency, setViewCurrency] = useState<Currency>("COP");
  const [previewPayments, setPreviewPayments] = useState<any[]>([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  
  const expenseForm = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      date: new Date(),
      amount: 0,
      currency: "COP",
      category: "",
      paymentMethod: "",
      notes: "",
    },
  });

  const recurringExpenseForm = useForm<z.infer<typeof recurringExpenseFormSchema>>({
    resolver: zodResolver(recurringExpenseFormSchema),
    defaultValues: {
      description: "",
      frequency: "",
      startDate: new Date(),
      amount: 0,
      currency: "COP",
      category: "",
      paymentMethod: "",
      notes: "",
    },
  });

  const filteredExpenses = selectedCurrency === "all" 
    ? expensesData 
    : expensesData.filter(expense => expense.currency === selectedCurrency);
  
  const filteredRecurringExpenses = selectedCurrency === "all"
    ? recurringExpensesData
    : recurringExpensesData.filter(expense => expense.currency === selectedCurrency);

  const calculateTotalInViewCurrency = (expenses: any[], currencyField = "currency") => {
    return expenses.reduce((total, expense) => {
      if (expense[currencyField] === viewCurrency) {
        return total + expense.amount;
      } else {
        return total + convertCurrency(expense.amount, expense[currencyField], viewCurrency);
      }
    }, 0);
  };

  const variableTotalInViewCurrency = calculateTotalInViewCurrency(expensesData);
  const recurringTotalInViewCurrency = calculateTotalInViewCurrency(
    recurringExpensesData.filter(expense => expense.status === "Activo")
  );

  const categoryTotals = [...expensesData, ...recurringExpensesData]
    .filter(expense => {
      return 'status' in expense ? expense.status !== "Pausado" : true;
    })
    .reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) acc[category] = 0;
      
      if (expense.currency === viewCurrency) {
        acc[category] += expense.amount;
      } else {
        acc[category] += convertCurrency(expense.amount, expense.currency, viewCurrency);
      }
      
      return acc;
    }, {} as Record<string, number>);

  const totalByCurrency = {
    COP: expensesData
      .filter(expense => expense.currency === "COP")
      .reduce((sum, expense) => sum + expense.amount, 0),
    USD: expensesData
      .filter(expense => expense.currency === "USD")
      .reduce((sum, expense) => sum + expense.amount, 0),
  };

  const recurringTotalByCurrency = {
    COP: recurringExpensesData
      .filter(expense => expense.currency === "COP" && expense.status === "Activo")
      .reduce((sum, expense) => sum + expense.amount, 0),
    USD: recurringExpensesData
      .filter(expense => expense.currency === "USD" && expense.status === "Activo")
      .reduce((sum, expense) => sum + expense.amount, 0),
  };

  const prepareCategoryChartData = () => {
    const categoryData = Object.entries(
      [...expensesData, ...recurringExpensesData]
        .filter(expense => {
          return 'status' in expense ? expense.status !== "Pausado" : true;
        })
        .reduce((acc, expense) => {
          const category = expense.category;
          const currency = expense.currency;
          
          if (!acc[category]) {
            acc[category] = { COP: 0, USD: 0 };
          }
          
          acc[category][currency] += expense.amount;
          return acc;
        }, {} as Record<string, Record<Currency, number>>)
    ).map(([category, amounts]) => {
      if (viewCurrency === "COP") {
        return {
          category,
          COP: amounts.COP,
          USD_en_COP: convertCurrency(amounts.USD, "USD", "COP"),
          original_USD: amounts.USD
        };
      } 
      else {
        return {
          category,
          USD: amounts.USD,
          COP_en_USD: convertCurrency(amounts.COP, "COP", "USD"),
          original_COP: amounts.COP
        };
      }
    });
    
    return categoryData;
  };

  const categoryChartData = prepareCategoryChartData();

  const handlePreviewPayments = (formValues: any) => {
    if (formValues.startDate && formValues.frequency && formValues.amount) {
      const dates = generatePaymentDates(formValues.startDate, formValues.frequency, 12);
      
      const payments = dates.map((date, index) => ({
        id: index + 1,
        dueDate: date,
        amount: formValues.amount,
        currency: formValues.currency,
        status: isBefore(date, new Date()) ? 'vencido' : 'pendiente',
      }));
      
      setPreviewPayments(payments);
      setPreviewModalOpen(true);
    }
  };

  const onExpenseSubmit = (data: z.infer<typeof expenseFormSchema>) => {
    console.log("Nuevo gasto:", data);
    toast({
      title: "Gasto registrado",
      description: "El gasto ha sido registrado correctamente",
    });
    expenseForm.reset();
    setExpenseModalOpen(false);
  };

  const onRecurringExpenseSubmit = (data: z.infer<typeof recurringExpenseFormSchema>) => {
    console.log("Nuevo gasto recurrente:", data);
    toast({
      title: "Gasto recurrente registrado",
      description: "El gasto recurrente ha sido registrado correctamente",
    });
    recurringExpenseForm.reset();
    setRecurringModalOpen(false);
  };

  const expenseColumns = [
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }: { row: any }) => formatDate(row.original.date),
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }: { row: any }) => {
        const expense = row.original;
        
        if (viewCurrency === expense.currency) {
          return formatCurrency(expense.amount, expense.currency);
        }
        
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
      },
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
      accessorKey: "receipt",
      header: "Comprobante",
      cell: ({ row }: { row: any }) => (
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <FileText className="h-4 w-4 mr-2" />
          Ver
        </Button>
      ),
    },
    {
      accessorKey: "actions",
      header: "Acciones",
      cell: () => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive">
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const recurringExpenseColumns = [
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "frequency",
      header: "Frecuencia",
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }: { row: any }) => {
        const expense = row.original;
        
        if (viewCurrency === expense.currency) {
          return formatCurrency(expense.amount, expense.currency);
        }
        
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
      },
    },
    {
      accessorKey: "nextPayment",
      header: "Próximo Pago",
      cell: ({ row }: { row: any }) => formatDate(row.original.nextPayment),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }: { row: any }) => (
        <span className={getStatusBadge(row.original.status)}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Categoría",
    },
    {
      accessorKey: "actions",
      header: "Acciones",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
          >
            {row.original.status === "Activo" ? "Pausar" : "Activar"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              handlePreviewPayments({
                startDate: row.original.startDate,
                frequency: row.original.frequency.toLowerCase(),
                amount: row.original.amount,
                currency: row.original.currency
              });
            }}
          >
            Ver Pagos
          </Button>
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gastos"
        description="Gestiona tus gastos variables, recurrentes y causados"
      />

      <Tabs defaultValue="variables">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <TabsList className="bg-background border mb-2">
            <TabsTrigger value="variables">Gastos Variables</TabsTrigger>
            <TabsTrigger value="recurrentes">Gastos Recurrentes</TabsTrigger>
            <TabsTrigger value="causados">Gastos Causados</TabsTrigger>
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-wrap gap-2">
            <Select
              value={selectedCurrency}
              onValueChange={(val) => setSelectedCurrency(val as Currency | "all")}
            >
              <SelectTrigger className="w-[150px] bg-background">
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
              <SelectTrigger className="w-[150px] bg-background">
                <SelectValue placeholder="Ver en" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COP">Ver en COP</SelectItem>
                <SelectItem value="USD">Ver en USD</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
              <DialogTrigger asChild>
                <Button className="mr-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Gasto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
                  <DialogDescription>
                    Completa el formulario para registrar un nuevo gasto variable
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...expenseForm}>
                  <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                    <FormField
                      control={expenseForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-required">Descripción</FormLabel>
                          <FormControl>
                            <Input placeholder="Descripción del gasto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={expenseForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="form-required">Fecha</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Seleccionar fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  locale={es}
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={expenseForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-required">Moneda</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Moneda" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="COP">COP</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={expenseForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-required">Valor</FormLabel>
                              <FormControl>
                                <CurrencyInput
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  currency={expenseForm.watch("currency") as Currency}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={expenseForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Categoría</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {expenseCategories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={expenseForm.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Método de Pago</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {paymentMethods.map((method) => (
                                  <SelectItem key={method} value={method}>
                                    {method}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={expenseForm.control}
                      name="receipt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comprobante</FormLabel>
                          <FormControl>
                            <FileUpload
                              onFileSelect={(file) => field.onChange(file)}
                              acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                              maxFileSizeMB={5}
                            />
                          </FormControl>
                          <FormDescription>
                            Formatos aceptados: PDF, JPG, PNG. Máx 5MB
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={expenseForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Notas adicionales (opcional)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setExpenseModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">Guardar</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={recurringModalOpen} onOpenChange={setRecurringModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Recurrente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Registrar Gasto Recurrente</DialogTitle>
                  <DialogDescription>
                    Configura un gasto que se repetirá periódicamente
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...recurringExpenseForm}>
                  <form onSubmit={recurringExpenseForm.handleSubmit(onRecurringExpenseSubmit)} className="space-y-4">
                    <FormField
                      control={recurringExpenseForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-required">Descripción</FormLabel>
                          <FormControl>
                            <Input placeholder="Descripción del gasto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={recurringExpenseForm.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Frecuencia</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar frecuencia" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {frequencies.map((frequency) => (
                                  <SelectItem key={frequency} value={frequency}>
                                    {frequency}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={recurringExpenseForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="form-required">Fecha Primer Pago</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Seleccionar fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  locale={es}
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={recurringExpenseForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Moneda</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Moneda" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="COP">COP</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={recurringExpenseForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Valor de Cada Pago</FormLabel>
                            <FormControl>
                              <CurrencyInput
                                onValueChange={field.onChange}
                                value={field.value}
                                currency={recurringExpenseForm.watch("currency") as Currency}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={recurringExpenseForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Categoría</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {expenseCategories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={recurringExpenseForm.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Método de Pago</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {paymentMethods.map((method) => (
                                  <SelectItem key={method} value={method}>
                                    {method}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={recurringExpenseForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Notas adicionales (opcional)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter className="gap-2 flex-col sm:flex-row">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const formValues = recurringExpenseForm.getValues();
                          handlePreviewPayments(formValues);
                        }}
                        disabled={!recurringExpenseForm.watch("startDate") || !recurringExpenseForm.watch("frequency") || !recurringExpenseForm.watch("amount")}
                      >
                        Vista Previa de Pagos
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setRecurringModalOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">Guardar</Button>
                      </div>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <TabsContent value="variables">
          <Card>
            <CardHeader className="bg-muted/20">
              <CardTitle>Gastos Variables</CardTitle>
              <CardDescription>
                Lista de gastos no recurrentes registrados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <DataTable
                columns={expenseColumns}
                data={filteredExpenses}
                searchColumn="description"
                searchPlaceholder="Buscar gastos..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recurrentes">
          <Card>
            <CardHeader className="bg-muted/20">
              <CardTitle>Gastos Recurrentes</CardTitle>
              <CardDescription>
                Gastos periódicos programados y su estado actual
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <DataTable
                columns={recurringExpenseColumns}
                data={filteredRecurringExpenses}
                searchColumn="description"
                searchPlaceholder="Buscar gastos recurrentes..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="causados">
          <AccruedExpenses />
        </TabsContent>
        
        <TabsContent value="resumen">
          <Card>
            <CardHeader className="bg-muted/20">
              <CardTitle>Resumen de Gastos</CardTitle>
              <CardDescription>
                Análisis y estadísticas de gastos por categoría y periodo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="Total Gastos Variables"
                    value={formatCurrency(variableTotalInViewCurrency, viewCurrency)}
                    description="Todos los gastos únicos"
                    displayCurrency={viewCurrency}
                    originalCurrency={viewCurrency === "COP" ? "USD" : "COP"}
                    originalValue={viewCurrency === "COP" ? totalByCurrency.USD : totalByCurrency.COP}
                    showConversionInfo={false}
                  />
                  <StatsCard
                    title="Total Gastos Recurrentes"
                    value={formatCurrency(recurringTotalInViewCurrency, viewCurrency)}
                    description="Mensual (solo activos)"
                    displayCurrency={viewCurrency}
                    originalCurrency={viewCurrency === "COP" ? "USD" : "COP"}
                    originalValue={viewCurrency === "COP" ? recurringTotalByCurrency.USD : recurringTotalByCurrency.COP}
                    showConversionInfo={false}
                  />
                  <StatsCard
                    title="Total Gastos"
                    value={formatCurrency(variableTotalInViewCurrency + recurringTotalInViewCurrency, viewCurrency)}
                    description="Variables + Recurrentes"
                    displayCurrency={viewCurrency}
                  />
                  {Object.entries(categoryTotals)
                    .sort((a, b) => b[1] - a[1]) // Sort by amount in descending order
                    .slice(0, 1) // Get top category
                    .map(([category, amount]) => (
                      <StatsCard
                        key={category}
                        title={`Mayor Categoría: ${category}`}
                        value={formatCurrency(amount, viewCurrency)}
                        description="Categoría con más gastos"
                        displayCurrency={viewCurrency}
                      />
                    ))}
                </div>

                <div className="h-[400px]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Gastos por Categoría</h3>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" /> Exportar Excel
                    </Button>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryChartData}
                      margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="category"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      {viewCurrency === "COP" ? (
                        <>
                          <YAxis 
                            yAxisId="left"
                            orientation="left"
                            tickFormatter={(value) => `$${value / 1000000}M`} 
                            label={{ value: 'Millones de COP', angle: -90, position: 'insideLeft' }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            hide
                          />
                          <Legend formatter={(value) => value === "COP" ? "COP (Original)" : "USD (Convertido a COP)"} />
                          <RechartsTooltip
                            formatter={(value, name) => [
                              name === "COP" 
                                ? formatCurrency(Number(value), "COP") 
                                : `${formatCurrency(Number(value), "COP")} (Original: ${formatCurrency(categoryChartData.find(item => item.category === name)?.original_USD || 0, "USD")})`,
                              name === "COP" ? "COP (Original)" : "USD (Convertido a COP)"
                            ]}
                          />
                          <Bar 
                            dataKey="COP" 
                            name="COP" 
                            fill="#4b4ce6" 
                            radius={[4, 4, 0, 0]} 
                            yAxisId="left"
                          />
                          <Bar 
                            dataKey="USD_en_COP" 
                            name="USD" 
                            fill="#e6664b" 
                            radius={[4, 4, 0, 0]} 
                            yAxisId="left"
                          />
                        </>
                      ) : (
                        <>
                          <YAxis 
                            yAxisId="left"
                            orientation="left"
                            tickFormatter={(value) => `$${value / 1000}K`} 
                            label={{ value: 'Miles de USD', angle: -90, position: 'insideLeft' }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            hide
                          />
                          <Legend formatter={(value) => value === "USD" ? "USD (Original)" : "COP (Convertido a USD)"} />
                          <RechartsTooltip
                            formatter={(value, name) => [
                              name === "USD" 
                                ? formatCurrency(Number(value), "USD") 
                                : `${formatCurrency(Number(value), "USD")} (Original: ${formatCurrency(categoryChartData.find(item => item.category === name)?.original_COP || 0, "COP")})`,
                              name === "USD" ? "USD (Original)" : "COP (Convertido a USD)"
                            ]}
                          />
                          <Bar 
                            dataKey="USD" 
                            name="USD" 
                            fill="#e6664b" 
                            radius={[4, 4, 0, 0]} 
                            yAxisId="left"
                          />
                          <Bar 
                            dataKey="COP_en_USD" 
                            name="COP" 
                            fill="#4b4ce6" 
                            radius={[4, 4, 0, 0]} 
                            yAxisId="left"
                          />
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Próximos Pagos</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recurringExpensesData
                      .filter(expense => expense.status === "Activo")
                      .sort((a, b) => a.nextPayment.getTime() - b.nextPayment.getTime())
                      .slice(0, 3)
                      .map((expense, index) => {
                        const displayAmount = expense.currency === viewCurrency 
                          ? expense.amount 
                          : convertCurrency(expense.amount, expense.currency, viewCurrency);
                          
                        return (
                          <div key={index} className="p-4 border rounded-md space-y-2">
                            <div className="text-lg font-medium">{expense.description}</div>
                            <div className="text-sm text-muted-foreground">Vence: {formatDate(expense.nextPayment)}</div>
                            <div className="text-xl font-bold flex items-center">
                              {formatCurrency(displayAmount, viewCurrency)}
                              
                              {expense.currency !== viewCurrency && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="ml-2 cursor-help">
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Original: {formatCurrency(expense.amount, expense.currency)}</p>
                                      <p>Valor convertido usando tasa aproximada</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <CreditCard className="h-4 w-4 mr-2" />
                              {expense.paymentMethod}
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total gastos variables + recurrentes</p>
                <div className="text-xl font-bold">
                  {formatCurrency(variableTotalInViewCurrency + recurringTotalInViewCurrency, viewCurrency)}
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Exportar Excel
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vista Previa de Pagos Generados</DialogTitle>
            <DialogDescription>
              Estos son los pagos que serán generados automáticamente para este gasto recurrente
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/20">
                  <th className="p-2 text-left">Cuota</th>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-left">Valor</th>
                  <th className="p-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {previewPayments.map((payment, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{formatDate(payment.dueDate)}</td>
                    <td className="p-2">{formatCurrency(payment.amount, payment.currency)}</td>
                    <td className="p-2">
                      <span className={getStatusBadge(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;
