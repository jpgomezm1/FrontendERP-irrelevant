
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
import { CalendarIcon, Plus, FileText, Pencil, CheckCircle2, XCircle } from "lucide-react";
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
import { FileUpload } from "@/components/ui/file-upload";

// Datos simulados para clientes
const clientsData = [
  {
    id: 1,
    name: "Empresa A",
    contact: "contacto@empresaa.com",
    phone: "301 234 5678",
    planType: "One Shoot + Fee mensual",
    oneShootValue: 8000000,
    oneShootDate: new Date("2023-04-15"),
    feeValue: 2500000,
    feeFrequency: "Mensual",
    startDate: new Date("2023-04-15"),
    paymentMethod: "Transferencia",
    notes: "Cliente prioritario",
    status: "Activo",
  },
  {
    id: 2,
    name: "Empresa B",
    contact: "contacto@empresab.com",
    phone: "302 345 6789",
    planType: "Solo Fee mensual",
    oneShootValue: 0,
    oneShootDate: null,
    feeValue: 3800000,
    feeFrequency: "Mensual",
    startDate: new Date("2023-02-10"),
    paymentMethod: "Transferencia",
    notes: "",
    status: "Activo",
  },
  {
    id: 3,
    name: "Empresa C",
    contact: "contacto@empresac.com",
    phone: "303 456 7890",
    planType: "One Shoot + Fee mensual",
    oneShootValue: 5500000,
    oneShootDate: new Date("2023-05-20"),
    feeValue: 1200000,
    feeFrequency: "Mensual",
    startDate: new Date("2023-05-20"),
    paymentMethod: "Transferencia",
    notes: "Proyecto limitado a 6 meses",
    status: "Activo",
  },
  {
    id: 4,
    name: "Empresa D",
    contact: "contacto@empresad.com",
    phone: "304 567 8901",
    planType: "Solo Fee mensual",
    oneShootValue: 0,
    oneShootDate: null,
    feeValue: 950000,
    feeFrequency: "Mensual",
    startDate: new Date("2023-03-05"),
    paymentMethod: "Tarjeta de Crédito",
    notes: "",
    status: "Pausado",
  },
];

// Datos simulados para proyectos
const projectsData = [
  {
    id: 1,
    clientId: 1,
    clientName: "Empresa A",
    name: "Dashboard Analítica",
    description: "Sistema de visualización de datos empresariales",
    status: "Activo",
    startDate: new Date("2023-04-15"),
    deliverables: [
      { id: 1, name: "Wireframes", completed: true, date: new Date("2023-04-30") },
      { id: 2, name: "Desarrollo Frontend", completed: true, date: new Date("2023-05-30") },
      { id: 3, name: "Integración API", completed: false, date: new Date("2023-07-15") },
    ],
  },
  {
    id: 2,
    clientId: 1,
    clientName: "Empresa A",
    name: "Rediseño Página Web",
    description: "Actualización de sitio web corporativo",
    status: "Activo",
    startDate: new Date("2023-06-01"),
    deliverables: [
      { id: 1, name: "Análisis", completed: true, date: new Date("2023-06-15") },
      { id: 2, name: "Diseño UI", completed: false, date: new Date("2023-07-20") },
      { id: 3, name: "Implementación", completed: false, date: new Date("2023-08-20") },
    ],
  },
  {
    id: 3,
    clientId: 2,
    clientName: "Empresa B",
    name: "App Móvil",
    description: "Aplicación móvil para gestión de clientes",
    status: "Activo",
    startDate: new Date("2023-03-10"),
    deliverables: [
      { id: 1, name: "UX Research", completed: true, date: new Date("2023-03-25") },
      { id: 2, name: "Prototipo", completed: true, date: new Date("2023-04-20") },
      { id: 3, name: "Desarrollo iOS", completed: true, date: new Date("2023-05-30") },
      { id: 4, name: "Desarrollo Android", completed: false, date: new Date("2023-07-10") },
    ],
  },
  {
    id: 4,
    clientId: 3,
    clientName: "Empresa C",
    name: "Sistema de Inventario",
    description: "Aplicación para control de inventario y logística",
    status: "Activo",
    startDate: new Date("2023-05-20"),
    deliverables: [
      { id: 1, name: "Análisis de Requerimientos", completed: true, date: new Date("2023-06-05") },
      { id: 2, name: "Desarrollo Backend", completed: false, date: new Date("2023-07-30") },
      { id: 3, name: "Desarrollo Frontend", completed: false, date: new Date("2023-08-30") },
    ],
  },
  {
    id: 5,
    clientId: 4,
    clientName: "Empresa D",
    name: "Mantenimiento Web",
    description: "Servicio mensual de mantenimiento de sitio web",
    status: "Pausado",
    startDate: new Date("2023-03-05"),
    deliverables: [],
  },
];

// Esquemas de validación con Zod
const clientFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  contact: z.string().email("Ingrese un correo electrónico válido"),
  phone: z.string().min(6, "Ingrese un número de teléfono válido"),
  planType: z.string({
    required_error: "Seleccione un tipo de plan",
  }),
  oneShootValue: z.number().optional(),
  oneShootDate: z.date().optional().nullable(),
  feeValue: z.number().min(1, "El valor del fee debe ser mayor a 0"),
  feeFrequency: z.string({
    required_error: "Seleccione la frecuencia del fee",
  }),
  startDate: z.date({
    required_error: "La fecha de inicio es requerida",
  }),
  paymentMethod: z.string({
    required_error: "Seleccione un método de pago",
  }),
  notes: z.string().optional(),
});

const projectFormSchema = z.object({
  clientId: z.number({
    required_error: "Seleccione un cliente",
  }),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  status: z.string({
    required_error: "Seleccione un estado",
  }),
  startDate: z.date({
    required_error: "La fecha de inicio es requerida",
  }),
});

// Arrays de opciones
const planTypes = [
  "One Shoot + Fee mensual",
  "Solo Fee mensual",
];

const frequencies = [
  "Semanal",
  "Quincenal",
  "Mensual",
  "Bimensual",
  "Trimestral",
  "Semestral",
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

const projectStatuses = [
  "Activo",
  "Pausado",
  "Finalizado",
];

// Definiciones de columnas para DataTable
const clientColumns = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "contact",
    header: "Contacto",
  },
  {
    accessorKey: "planType",
    header: "Tipo de Plan",
  },
  {
    accessorKey: "feeValue",
    header: "Fee Mensual",
    cell: ({ row }) => formatCurrency(row.original.feeValue),
  },
  {
    accessorKey: "startDate",
    header: "Inicio",
    cell: ({ row }) => formatDate(row.original.startDate),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.original.status === "Activo"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "actions",
    header: "Acciones",
    cell: () => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          Ver
        </Button>
        <Button variant="ghost" size="sm">
          Editar
        </Button>
      </div>
    ),
  },
];

const projectColumns = [
  {
    accessorKey: "clientName",
    header: "Cliente",
  },
  {
    accessorKey: "name",
    header: "Proyecto",
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.original.status === "Activo"
            ? "bg-green-100 text-green-800"
            : row.original.status === "Finalizado"
            ? "bg-blue-100 text-blue-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Fecha Inicio",
    cell: ({ row }) => formatDate(row.original.startDate),
  },
  {
    accessorKey: "actions",
    header: "Acciones",
    cell: () => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          Ver
        </Button>
        <Button variant="ghost" size="sm">
          Editar
        </Button>
      </div>
    ),
  },
];

const ClientsPage = () => {
  const { toast } = useToast();
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [viewProjectDetails, setViewProjectDetails] = useState<number | null>(null);
  
  // Form para clientes
  const clientForm = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      contact: "",
      phone: "",
      planType: "",
      oneShootValue: 0,
      oneShootDate: null,
      feeValue: 0,
      feeFrequency: "",
      startDate: new Date(),
      paymentMethod: "",
      notes: "",
    },
  });
  
  // Form para proyectos
  const projectForm = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      clientId: 0,
      name: "",
      description: "",
      status: "Activo",
      startDate: new Date(),
    },
  });

  // Mostrar u ocultar el campo oneShoot según el tipo de plan
  const watchPlanType = clientForm.watch("planType");
  const showOneShoot = watchPlanType === "One Shoot + Fee mensual";

  const onClientSubmit = (data: z.infer<typeof clientFormSchema>) => {
    console.log("Nuevo cliente:", data);
    toast({
      title: "Cliente registrado",
      description: "El cliente ha sido registrado correctamente",
    });
    clientForm.reset();
    setClientModalOpen(false);
  };

  const onProjectSubmit = (data: z.infer<typeof projectFormSchema>) => {
    console.log("Nuevo proyecto:", data);
    toast({
      title: "Proyecto registrado",
      description: "El proyecto ha sido registrado correctamente",
    });
    projectForm.reset();
    setProjectModalOpen(false);
  };

  // Obtener los detalles del proyecto seleccionado
  const selectedProject = projectsData.find(p => p.id === viewProjectDetails);

  return (
    <div>
      <PageHeader
        title="Clientes y Proyectos"
        description="Gestiona tus clientes y los proyectos asociados a ellos"
      />

      <Tabs defaultValue="clientes">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
          </TabsList>
          
          <div>
            {/* Modal para añadir cliente */}
            <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
              <DialogTrigger asChild>
                <Button className="mr-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                  <DialogDescription>
                    Completa el formulario para registrar un nuevo cliente
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...clientForm}>
                  <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={clientForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Nombre del Cliente</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre o empresa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={clientForm.control}
                        name="contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Correo de Contacto</FormLabel>
                            <FormControl>
                              <Input placeholder="correo@ejemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={clientForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="Número de teléfono" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={clientForm.control}
                        name="planType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Tipo de Plan</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo de plan" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {planTypes.map((type) => (
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
                    </div>

                    {showOneShoot && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={clientForm.control}
                          name="oneShootValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-required">Valor One Shoot</FormLabel>
                              <FormControl>
                                <CurrencyInput
                                  onValueChange={field.onChange}
                                  value={field.value || 0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={clientForm.control}
                          name="oneShootDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="form-required">Fecha de Pago One Shoot</FormLabel>
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
                                    selected={field.value || undefined}
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
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={clientForm.control}
                        name="feeValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Valor Fee Mensual</FormLabel>
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

                      <FormField
                        control={clientForm.control}
                        name="feeFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Frecuencia del Fee</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar frecuencia" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {frequencies.map((freq) => (
                                  <SelectItem key={freq} value={freq}>
                                    {freq}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={clientForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="form-required">Fecha de Inicio</FormLabel>
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
                        control={clientForm.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Método de Pago Preferido</FormLabel>
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
                      control={clientForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Notas adicionales del cliente"
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
                        onClick={() => setClientModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">Guardar</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Modal para añadir proyecto */}
            <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Proyecto</DialogTitle>
                  <DialogDescription>
                    Asigna un nuevo proyecto a un cliente existente
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...projectForm}>
                  <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
                    <FormField
                      control={projectForm.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-required">Cliente</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cliente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clientsData.map((client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={projectForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-required">Nombre del Proyecto</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del proyecto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={projectForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-required">Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descripción del proyecto"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={projectForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-required">Estado</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {projectStatuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={projectForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="form-required">Fecha de Inicio</FormLabel>
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

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setProjectModalOpen(false)}
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
        
        {/* Contenido de la tab de clientes */}
        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>
                Lista de clientes y sus planes de servicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={clientColumns}
                data={clientsData}
                searchColumn="name"
                searchPlaceholder="Buscar cliente..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenido de la tab de proyectos */}
        <TabsContent value="proyectos">
          {viewProjectDetails ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Detalles del Proyecto</CardTitle>
                  <CardDescription>
                    {selectedProject?.clientName} - {selectedProject?.name}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setViewProjectDetails(null)}
                >
                  Volver a la lista
                </Button>
              </CardHeader>
              <CardContent>
                {selectedProject && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-base font-medium mb-1">Cliente</h3>
                        <p>{selectedProject.clientName}</p>
                      </div>
                      <div>
                        <h3 className="text-base font-medium mb-1">Estado</h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            selectedProject.status === "Activo"
                              ? "bg-green-100 text-green-800"
                              : selectedProject.status === "Finalizado"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedProject.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-1">Descripción</h3>
                      <p>{selectedProject.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-1">Fecha de Inicio</h3>
                      <p>{formatDate(selectedProject.startDate)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-3">Entregables</h3>
                      {selectedProject.deliverables.length > 0 ? (
                        <div className="space-y-3">
                          {selectedProject.deliverables.map((deliverable) => (
                            <div
                              key={deliverable.id}
                              className="flex items-center justify-between p-3 border rounded-md"
                            >
                              <div className="flex items-center">
                                {deliverable.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-yellow-500 mr-3" />
                                )}
                                <div>
                                  <p className="font-medium">{deliverable.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(deliverable.date)}
                                  </p>
                                </div>
                              </div>
                              <div>
                                {!deliverable.completed && (
                                  <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Marcar Completado
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          No hay entregables registrados para este proyecto.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Entregable
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Proyectos</CardTitle>
                <CardDescription>
                  Lista de proyectos asociados a clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={projectColumns}
                  data={projectsData}
                  searchColumn="name"
                  searchPlaceholder="Buscar proyecto..."
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientsPage;
