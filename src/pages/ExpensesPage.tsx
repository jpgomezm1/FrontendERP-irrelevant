import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
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
import { CalendarIcon, Plus, FileText } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { DataTable } from "@/components/ui/data-table";
import { CurrencyInput } from "@/components/ui/currency-input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { format } from "date-fns";
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
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis 
} from "recharts";

const expensesData = [
  {
    id: 1,
    description: "Pago Desarrollador Frontend",
    date: new Date("2023-06-15"),
    amount: 2500000,
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
    category: "Marketing",
    paymentMethod: "Tarjeta de Crédito",
    receipt: "facebook-ads.pdf",
    notes: "",
  },
];

const recurringExpensesData = [
  {
    id: 1,
    description: "Nómina",
    frequency: "Mensual",
    startDate: new Date("2023-01-15"),
    amount: 7500000,
    category: "Personal",
    paymentMethod: "Transferencia",
    status: "Pagado",
    nextPayment: new Date("2023-07-15"),
  },
  {
    id: 2,
    description: "Arriendo Oficina",
    frequency: "Mensual",
    startDate: new Date("2023-01-05"),
    amount: 3200000,
    category: "Arriendo",
    paymentMethod: "Transferencia",
    status: "Pagado",
    nextPayment: new Date("2023-07-05"),
  },
  {
    id: 3,
    description: "Servicios Cloud",
    frequency: "Mensual",
    startDate: new Date("2023-01-10"),
    amount: 950000,
    category: "Tecnología",
    paymentMethod: "Tarjeta de Crédito",
    status: "Pendiente",
    nextPayment: new Date("2023-07-10"),
  },
  {
    id: 4,
    description: "Servicios Contables",
    frequency: "Trimestral",
    startDate: new Date("2023-01-20"),
    amount: 1800000,
    category: "Servicios Profesionales",
    paymentMethod: "Transferencia",
    status: "Pendiente",
    nextPayment: new Date("2023-07-20"),
  },
];

const expenseFormSchema = z.object({
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
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

const expenseColumns = [
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => formatCurrency(row.original.amount),
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
    cell: ({ row }) => (
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
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: "nextPayment",
    header: "Próximo Pago",
    cell: ({ row }) => formatDate(row.original.nextPayment),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.original.status === "Pagado"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
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
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={row.original.status === "Pagado"}
        >
          Marcar Pagado
        </Button>
        <Button variant="ghost" size="sm">
          Editar
        </Button>
      </div>
    ),
  },
];

const ExpensesPage = () => {
  const { toast } = useToast();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  
  const expenseForm = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      date: new Date(),
      amount: 0,
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
      category: "",
      paymentMethod: "",
      notes: "",
    },
  });

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

  return (
    <div>
      <PageHeader
        title="Gastos"
        description="Gestiona tus gastos variables y recurrentes"
      />

      <Tabs defaultValue="variables">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="variables">Gastos Variables</TabsTrigger>
            <TabsTrigger value="recurrentes">Gastos Recurrentes</TabsTrigger>
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
          </TabsList>
          
          <div>
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
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
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
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRecurringModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">Guardar</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <TabsContent value="variables">
          <Card>
            <CardHeader>
              <CardTitle>Gastos Variables</CardTitle>
              <CardDescription>
                Lista de gastos no recurrentes registrados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={expenseColumns}
                data={expensesData}
                searchColumn="description"
                searchPlaceholder="Buscar gastos..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recurrentes">
          <Card>
            <CardHeader>
              <CardTitle>Gastos Recurrentes</CardTitle>
              <CardDescription>
                Gastos periódicos programados y su estado actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={recurringExpenseColumns}
                data={recurringExpensesData}
                searchColumn="description"
                searchPlaceholder="Buscar gastos recurrentes..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resumen">
          <Card>
            <CardHeader>
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
                    value={formatCurrency(4700000)}
                    description="Junio 2023"
                  />
                  <StatsCard
                    title="Total Gastos Recurrentes"
                    value={formatCurrency(13450000)}
                    description="Junio 2023"
                  />
                  <StatsCard
                    title="Total Gastos"
                    value={formatCurrency(18150000)}
                    description="Junio 2023"
                  />
                  <StatsCard
                    title="Próximo Pago"
                    value={formatCurrency(3200000)}
                    description="Arriendo - 5 Jul 2023"
                  />
                </div>

                <div className="h-[400px]">
                  <h3 className="text-lg font-medium mb-4">Gastos por Categoría</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { category: "Personal", amount: 7500000 },
                        { category: "Arriendo", amount: 3200000 },
                        { category: "Tecnología", amount: 1800000 },
                        { category: "Freelancers", amount: 2500000 },
                        { category: "Marketing", amount: 450000 },
                        { category: "Alimentación", amount: 120000 },
                        { category: "Transporte", amount: 780000 },
                        { category: "Serv. Prof.", amount: 1800000 },
                      ]}
                      margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="category"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                      <RechartsTooltip
                        formatter={(value) => [
                          formatCurrency(Number(value)),
                          "Valor",
                        ]}
                      />
                      <Bar dataKey="amount" fill="#4b4ce6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Exportar Excel</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpensesPage;
