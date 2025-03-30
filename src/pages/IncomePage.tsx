
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/ui/page-header";
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
import { CalendarIcon, Plus, FileText, Download } from "lucide-react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Datos simulados para ingresos
const incomesData = [
  {
    id: 1,
    description: "Pago Proyecto Dashboard",
    date: new Date("2023-06-18"),
    amount: 7500000,
    type: "Cliente",
    client: "Cliente A",
    paymentMethod: "Transferencia",
    receipt: "comprobante-pago-a.pdf",
    notes: "Primer entregable",
  },
  {
    id: 2,
    description: "Pago Mensual Mantenimiento",
    date: new Date("2023-06-15"),
    amount: 3800000,
    type: "Cliente",
    client: "Cliente B",
    paymentMethod: "Transferencia",
    receipt: "comprobante-pago-b.pdf",
    notes: "",
  },
  {
    id: 3,
    description: "Consultoría UX/UI",
    date: new Date("2023-06-10"),
    amount: 2500000,
    type: "Cliente",
    client: "Cliente C",
    paymentMethod: "Transferencia",
    receipt: "comprobante-pago-c.pdf",
    notes: "Proyecto eCommerce",
  },
  {
    id: 4,
    description: "Aporte Capital",
    date: new Date("2023-06-05"),
    amount: 10000000,
    type: "Aporte de socio",
    client: "-",
    paymentMethod: "Transferencia",
    receipt: "comprobante-aporte.pdf",
    notes: "Inversión expansión",
  },
  {
    id: 5,
    description: "Desarrollo Landing Page",
    date: new Date("2023-06-03"),
    amount: 1800000,
    type: "Cliente",
    client: "Cliente D",
    paymentMethod: "Tarjeta de Crédito",
    receipt: "factura-cliente-d.pdf",
    notes: "",
  },
];

// Esquema de validación para ingresos
const incomeFormSchema = z.object({
  type: z.string({
    required_error: "Seleccione un tipo de ingreso",
  }),
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  client: z.string().optional(),
  paymentMethod: z.string({
    required_error: "Seleccione un método de pago",
  }),
  receipt: z.any().optional(),
  notes: z.string().optional(),
});

// Arrays de opciones
const incomeTypes = [
  "Cliente",
  "Aporte de socio",
  "Extraordinario",
  "Devolución Impuestos",
  "Otros",
];

const clients = [
  "Cliente A",
  "Cliente B",
  "Cliente C",
  "Cliente D",
  "Cliente E",
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

// Definiciones de columnas para DataTable
const incomeColumns = [
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
    accessorKey: "type",
    header: "Tipo",
  },
  {
    accessorKey: "client",
    header: "Cliente",
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

const IncomePage = () => {
  const { toast } = useToast();
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  
  // Form para ingresos
  const incomeForm = useForm<z.infer<typeof incomeFormSchema>>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      type: "",
      description: "",
      date: new Date(),
      amount: 0,
      client: "",
      paymentMethod: "",
      notes: "",
    },
  });
  
  const onIncomeSubmit = (data: z.infer<typeof incomeFormSchema>) => {
    console.log("Nuevo ingreso:", data);
    toast({
      title: "Ingreso registrado",
      description: "El ingreso ha sido registrado correctamente",
    });
    incomeForm.reset();
    setIncomeModalOpen(false);
  };

  // Calcular el total de ingresos por mes
  const monthlyData = [
    { month: "Ene", ingresos: 18700000 },
    { month: "Feb", ingresos: 19500000 },
    { month: "Mar", ingresos: 17600000 },
    { month: "Abr", ingresos: 20800000 },
    { month: "May", ingresos: 22300000 },
    { month: "Jun", ingresos: 25600000 },
  ];

  return (
    <div>
      <PageHeader
        title="Ingresos"
        description="Gestiona y analiza tus fuentes de ingresos"
      >
        {/* Modal para añadir ingreso */}
        <Dialog open={incomeModalOpen} onOpenChange={setIncomeModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Ingreso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
              <DialogDescription>
                Completa el formulario para registrar un nuevo ingreso
              </DialogDescription>
            </DialogHeader>
            
            <Form {...incomeForm}>
              <form onSubmit={incomeForm.handleSubmit(onIncomeSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={incomeForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-required">Tipo de Ingreso</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {incomeTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={incomeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-required">Descripción</FormLabel>
                        <FormControl>
                          <Input placeholder="Descripción del ingreso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={incomeForm.control}
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
                    control={incomeForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-required">Monto</FormLabel>
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

                <FormField
                  control={incomeForm.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar cliente (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client} value={client}>
                              {client}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Opcional para ingresos por clientes</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={incomeForm.control}
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

                <FormField
                  control={incomeForm.control}
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
                  control={incomeForm.control}
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
                    onClick={() => setIncomeModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Registrados</CardTitle>
            <CardDescription>
              Lista completa de ingresos registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={incomeColumns}
              data={incomesData}
              searchColumn="description"
              searchPlaceholder="Buscar ingresos..."
            />
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="mr-2">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análisis de Ingresos</CardTitle>
            <CardDescription>
              Histórico de ingresos y distribución por tipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Total del Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(25600000)}</div>
                  <p className="text-xs text-muted-foreground">Junio 2023</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Promedio Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(20750000)}</div>
                  <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Por Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(15600000)}</div>
                  <p className="text-xs text-muted-foreground">60.9% del total</p>
                </CardContent>
              </Card>
            </div>

            <div className="h-[300px]">
              <h3 className="text-lg font-medium mb-4">Ingresos Mensuales</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Ingresos"]}
                  />
                  <Bar
                    dataKey="ingresos"
                    fill="#4b4ce6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncomePage;
