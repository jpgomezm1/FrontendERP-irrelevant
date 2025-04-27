import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, FolderPlus, DollarSign, Clock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useClientsData } from "@/hooks/use-clients-data";
import { useProjectsData } from "@/hooks/use-projects-data";
import { ProjectStatus, PlanType, PaymentFrequency, Currency } from "@/types/clients";

// Schema for the form
const projectSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  description: z.string().min(1, { message: "La descripción es obligatoria" }),
  status: z.enum(["Activo", "Pausado", "Finalizado", "Cancelado"]),
  startDate: z.date({ required_error: "La fecha de inicio es obligatoria" }),
  endDate: z.date().optional(),
  clientId: z.number({ required_error: "El cliente es obligatorio" }),
  notes: z.string().optional(),
  
  // Payment plan fields
  planType: z.enum(["Fee único", "Fee por cuotas", "Suscripción periódica", "Mixto"]),
  
  // Implementation fee fields
  implementationFeeTotal: z.number().optional(),
  implementationFeeCurrency: z.enum(["COP", "USD"]).optional(),
  implementationFeeInstallments: z.number().min(1).optional(),
  
  // Recurring fee fields
  recurringFeeAmount: z.number().optional(),
  recurringFeeCurrency: z.enum(["COP", "USD"]).optional(),
  recurringFeeFrequency: z.enum(["Semanal", "Quincenal", "Mensual", "Bimensual", "Trimestral", "Semestral", "Anual"]).optional(),
  recurringFeeDayOfCharge: z.number().min(1).max(31).optional(),
  recurringFeeGracePeriods: z.number().min(0).optional(),
  recurringFeeDiscountPeriods: z.number().min(0).optional(),
  recurringFeeDiscountPercentage: z.number().min(0).max(100).optional(),
})
.refine(data => {
  // When plan type is Fee único or Fee por cuotas, implementationFee fields are required
  if (["Fee único", "Fee por cuotas"].includes(data.planType)) {
    return data.implementationFeeTotal && data.implementationFeeCurrency && data.implementationFeeInstallments;
  }
  return true;
}, {
  message: "Los campos de Fee de Implementación son obligatorios para este tipo de plan",
  path: ["implementationFeeTotal"]
})
.refine(data => {
  // When plan type is Suscripción periódica, recurringFee fields are required
  if (data.planType === "Suscripción periódica") {
    return data.recurringFeeAmount && data.recurringFeeCurrency && data.recurringFeeFrequency && data.recurringFeeDayOfCharge;
  }
  return true;
}, {
  message: "Los campos de Fee Recurrente son obligatorios para este tipo de plan",
  path: ["recurringFeeAmount"]
})
.refine(data => {
  // When plan type is Mixto, both implementation and recurring fee fields are required
  if (data.planType === "Mixto") {
    const hasImplementationFee = data.implementationFeeTotal && data.implementationFeeCurrency && data.implementationFeeInstallments;
    const hasRecurringFee = data.recurringFeeAmount && data.recurringFeeCurrency && data.recurringFeeFrequency && data.recurringFeeDayOfCharge;
    return hasImplementationFee && hasRecurringFee;
  }
  return true;
}, {
  message: "Se requieren los campos de Fee de Implementación y Recurrente para el tipo de plan Mixto",
  path: ["implementationFeeTotal"]
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface AddProjectDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectAdded?: () => void;
  defaultClientId?: number;
}

export function AddProjectDialog({ 
  children, 
  open, 
  onOpenChange, 
  onProjectAdded,
  defaultClientId 
}: AddProjectDialogProps) {
  const { clients } = useClientsData();
  const { addProject } = useProjectsData();
  const [isImplementationFeeVisible, setImplementationFeeVisible] = useState(true);
  const [isRecurringFeeVisible, setRecurringFeeVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Activo" as ProjectStatus,
      startDate: new Date(),
      clientId: defaultClientId || 0,
      planType: "Fee único" as PlanType,
      implementationFeeInstallments: 1,
      recurringFeeGracePeriods: 0,
      recurringFeeDiscountPeriods: 0,
      recurringFeeDiscountPercentage: 0,
    },
  });
  
  // Update clientId when defaultClientId changes
  useEffect(() => {
    if (defaultClientId) {
      form.setValue('clientId', defaultClientId);
    }
  }, [defaultClientId, form]);
  
  // When plan type changes, update visibility of sections
  const watchPlanType = form.watch("planType");
  useEffect(() => {
    switch (watchPlanType) {
      case "Fee único":
      case "Fee por cuotas":
        setImplementationFeeVisible(true);
        setRecurringFeeVisible(false);
        break;
      case "Suscripción periódica":
        setImplementationFeeVisible(false);
        setRecurringFeeVisible(true);
        break;
      case "Mixto":
        setImplementationFeeVisible(true);
        setRecurringFeeVisible(true);
        break;
    }
  }, [watchPlanType]);
  
  async function onSubmit(data: ProjectFormValues) {
    setSubmitting(true);
    try {
      const projectData = {
        name: data.name,
        description: data.description,
        status: data.status as ProjectStatus,
        startDate: data.startDate,
        endDate: data.endDate,
        clientId: data.clientId,
        notes: data.notes,
      };
      
      // Prepare payment plan data
      const paymentPlanData: any = {
        planType: data.planType
      };
      
      // Add implementation fee data if applicable
      if (isImplementationFeeVisible) {
        paymentPlanData.implementationFeeTotal = data.implementationFeeTotal;
        paymentPlanData.implementationFeeCurrency = data.implementationFeeCurrency;
        paymentPlanData.implementationFeeInstallments = data.implementationFeeInstallments;
      }
      
      // Add recurring fee data if applicable
      if (isRecurringFeeVisible) {
        paymentPlanData.recurringFeeAmount = data.recurringFeeAmount;
        paymentPlanData.recurringFeeCurrency = data.recurringFeeCurrency;
        paymentPlanData.recurringFeeFrequency = data.recurringFeeFrequency;
        paymentPlanData.recurringFeeDayOfCharge = data.recurringFeeDayOfCharge;
        paymentPlanData.recurringFeeGracePeriods = data.recurringFeeGracePeriods;
        paymentPlanData.recurringFeeDiscountPeriods = data.recurringFeeDiscountPeriods;
        paymentPlanData.recurringFeeDiscountPercentage = data.recurringFeeDiscountPercentage;
      }
      
      await addProject(projectData, paymentPlanData);
      onOpenChange(false);
      form.reset();
      if (onProjectAdded) onProjectAdded();
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setSubmitting(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div onClick={() => onOpenChange(true)}>{children}</div>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1e1756] border-purple-800/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-purple-400" />
            Registrar Nuevo Proyecto
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Completa los detalles para crear un nuevo proyecto.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nombre del Proyecto</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nombre del proyecto" 
                          {...field} 
                          className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Pausado">Pausado</SelectItem>
                          <SelectItem value="Finalizado">Finalizado</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalles del proyecto" 
                        {...field} 
                        className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500 min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Cliente</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                            <SelectValue placeholder="Seleccionar cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-white">Fecha de Inicio</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal bg-[#0f0b2a] border-purple-800/30 text-white",
                                !field.value && "text-slate-400"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PP")
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 text-purple-400" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1e1756] border-purple-800/30" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="bg-[#1e1756]"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-white">Fecha de Finalización (Opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal bg-[#0f0b2a] border-purple-800/30 text-white",
                              !field.value && "text-slate-400"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP")
                            ) : (
                              <span>Sin fecha establecida</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 text-purple-400" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1e1756] border-purple-800/30" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="bg-[#1e1756]"
                          />
                        </PopoverContent>
                    </Popover>
                    <FormDescription className="text-slate-400">
                      Dejar en blanco si la duración es indefinida
                    </FormDescription>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Notas (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notas adicionales sobre el proyecto" 
                        {...field} 
                        className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Payment Plan Configuration */}
            <div className="bg-[#0f0b2a]/50 p-4 rounded-lg border border-purple-800/30">
              <h3 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-400" />
                Plan de Pagos
              </h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="planType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tipo de Plan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                            <SelectValue placeholder="Seleccionar tipo de plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                          <SelectItem value="Fee único">Fee único (un solo pago)</SelectItem>
                          <SelectItem value="Fee por cuotas">Fee por cuotas</SelectItem>
                          <SelectItem value="Suscripción periódica">Suscripción periódica</SelectItem>
                          <SelectItem value="Mixto">Mixto (Implementación + Recurrente)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-slate-400">
                        Determina cómo se estructurarán los pagos del proyecto
                      </FormDescription>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
                
                {/* Implementation Fee Section */}
                {isImplementationFeeVisible && (
                  <div className="border-l-4 border-purple-600 pl-4 pt-2 pb-3 space-y-4 bg-purple-900/10 rounded-r-lg">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-purple-400" />
                      Fee de Implementación
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="implementationFeeTotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Monto Total</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                {...field} 
                                value={field.value || ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="implementationFeeCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Moneda</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                                  <SelectValue placeholder="Seleccionar moneda" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                                <SelectItem value="COP">COP</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="implementationFeeInstallments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Número de Cuotas</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1" 
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                            />
                          </FormControl>
                          <FormDescription className="text-slate-400">
                            1 para pago único, 2 o más para pago en cuotas
                          </FormDescription>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {/* Recurring Fee Section */}
                {isRecurringFeeVisible && (
                  <div className="border-l-4 border-indigo-600 pl-4 pt-2 pb-3 space-y-4 bg-indigo-900/10 rounded-r-lg">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      Fee Recurrente
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recurringFeeAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Monto</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                {...field} 
                                value={field.value || ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recurringFeeCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Moneda</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                                  <SelectValue placeholder="Seleccionar moneda" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                                <SelectItem value="COP">COP</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recurringFeeFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Frecuencia</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                                  <SelectValue placeholder="Seleccionar frecuencia" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                                <SelectItem value="Semanal">Semanal</SelectItem>
                                <SelectItem value="Quincenal">Quincenal</SelectItem>
                                <SelectItem value="Mensual">Mensual</SelectItem>
                                <SelectItem value="Bimensual">Bimensual</SelectItem>
                                <SelectItem value="Trimestral">Trimestral</SelectItem>
                                <SelectItem value="Semestral">Semestral</SelectItem>
                                <SelectItem value="Anual">Anual</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recurringFeeDayOfCharge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Día de Cobro</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1" 
                                min="1"
                                max="31"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                              />
                            </FormControl>
                            <FormDescription className="text-slate-400">
                              Día del mes (1-31)
                            </FormDescription>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="recurringFeeGracePeriods"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Periodos de Gracia</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                              />
                            </FormControl>
                            <FormDescription className="text-slate-400">
                              Periodos sin cobro
                            </FormDescription>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recurringFeeDiscountPeriods"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Periodos con Descuento</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recurringFeeDiscountPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">% de Descuento</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                min="0"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submitting ? "Guardando..." : "Guardar Proyecto"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}