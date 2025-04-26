
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { cn } from "@/lib/utils";
import { Currency } from "@/lib/utils";
import { ProjectStatus, PaymentFrequency, PlanType } from "@/types/clients";
import { useClientsData } from "@/hooks/use-clients-data";
import { useProjectsData } from "@/hooks/use-projects-data";

const projectFormSchema = z.object({
  clientId: z.number({
    required_error: "Debes seleccionar un cliente",
  }),
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  status: z.enum(["Activo", "Pausado", "Finalizado", "Cancelado"]),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  notes: z.string().optional(),
  planType: z.enum(["Fee único", "Fee por cuotas", "Suscripción periódica", "Mixto"]),
  // Campos para Fee único o por cuotas
  implementationFeeTotal: z.number().optional(),
  implementationFeeCurrency: z.enum(["COP", "USD"]).optional(),
  implementationFeeInstallments: z.number().optional(),
  // Campos para suscripción periódica
  recurringFeeAmount: z.number().optional(),
  recurringFeeCurrency: z.enum(["COP", "USD"]).optional(),
  recurringFeeFrequency: z.enum([
    "Semanal",
    "Quincenal",
    "Mensual",
    "Bimensual",
    "Trimestral",
    "Semestral",
    "Anual",
    "Personalizada",
  ]).optional(),
  recurringFeeDayOfCharge: z.number().optional(),
  recurringFeeGracePeriods: z.number().optional(),
  recurringFeeDiscountPeriods: z.number().optional(),
  recurringFeeDiscountPercentage: z.number().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface AddProjectDialogProps {
  children: React.ReactNode;
  defaultClientId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectAdded?: () => void;
}

export function AddProjectDialog({
  children,
  defaultClientId,
  open,
  onOpenChange,
  onProjectAdded,
}: AddProjectDialogProps) {
  const { clients } = useClientsData();
  const { addProject } = useProjectsData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      clientId: defaultClientId || 0,
      name: "",
      description: "",
      status: "Activo",
      startDate: new Date(),
      endDate: null,
      planType: "Fee único",
      implementationFeeTotal: 0,
      implementationFeeCurrency: "COP",
      implementationFeeInstallments: 1,
      recurringFeeAmount: 0,
      recurringFeeCurrency: "COP",
      recurringFeeFrequency: "Mensual",
      recurringFeeDayOfCharge: 1,
      recurringFeeGracePeriods: 0,
      recurringFeeDiscountPeriods: 0,
      recurringFeeDiscountPercentage: 0,
    },
  });

  // Observar el tipo de plan para mostrar los campos correspondientes
  const watchPlanType = form.watch("planType");
  const showImplementationFee = ["Fee único", "Fee por cuotas", "Mixto"].includes(watchPlanType);
  const showRecurringFee = ["Suscripción periódica", "Mixto"].includes(watchPlanType);

  async function onSubmit(data: ProjectFormValues) {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log("Datos del proyecto a guardar:", data);
      
      // Prepare project data based on form values
      const projectToAdd = {
        clientId: data.clientId,
        name: data.name,
        description: data.description,
        status: data.status as ProjectStatus,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        notes: data.notes,
      };
      
      // Prepare payment plan data
      const paymentPlanData: any = {
        planType: data.planType
      };
      
      // Add implementation fee data if applicable
      if (showImplementationFee) {
        paymentPlanData.implementationFeeTotal = data.implementationFeeTotal;
        paymentPlanData.implementationFeeCurrency = data.implementationFeeCurrency;
        paymentPlanData.implementationFeeInstallments = data.implementationFeeInstallments;
      }
      
      // Add recurring fee data if applicable
      if (showRecurringFee) {
        paymentPlanData.recurringFeeAmount = data.recurringFeeAmount;
        paymentPlanData.recurringFeeCurrency = data.recurringFeeCurrency;
        paymentPlanData.recurringFeeFrequency = data.recurringFeeFrequency;
        paymentPlanData.recurringFeeDayOfCharge = data.recurringFeeDayOfCharge;
        paymentPlanData.recurringFeeGracePeriods = data.recurringFeeGracePeriods;
        paymentPlanData.recurringFeeDiscountPeriods = data.recurringFeeDiscountPeriods;
        paymentPlanData.recurringFeeDiscountPercentage = data.recurringFeeDiscountPercentage;
      }
      
      console.log("Proyecto procesado para guardar:", projectToAdd);
      console.log("Plan de pagos para guardar:", paymentPlanData);
      
      // Add the project to the database with payment plan
      await addProject(projectToAdd, paymentPlanData);
      
      if (onProjectAdded) {
        onProjectAdded();
      }
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Ingresa la información del proyecto y su plan de pagos
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-required">Cliente</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    defaultValue={field.value ? field.value.toString() : undefined}
                    disabled={!!defaultClientId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-required">Nombre del Proyecto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Rediseño Sitio Web" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Pausado">Pausado</SelectItem>
                        <SelectItem value="Finalizado">Finalizado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-required">Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe los detalles del proyecto"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="form-required">Fecha de Inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
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
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Finalización (opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
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
                          disabled={(date) => date < form.watch("startDate")}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Plan de Pagos */}
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-lg font-medium">Plan de Pagos</h3>
              
              <FormField
                control={form.control}
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
                        <SelectItem value="Fee único">Fee único</SelectItem>
                        <SelectItem value="Fee por cuotas">Fee por cuotas</SelectItem>
                        <SelectItem value="Suscripción periódica">Suscripción periódica</SelectItem>
                        <SelectItem value="Mixto">Mixto (implementación + recurrente)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Las cuotas de pago se generarán automáticamente según el plan seleccionado
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Fee de Implementación */}
              {showImplementationFee && (
                <div className="space-y-4 border-l-2 border-primary/20 pl-4">
                  <h4 className="font-medium">Fee de Implementación</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="implementationFeeTotal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-required">Valor Total</FormLabel>
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
                      control={form.control}
                      name="implementationFeeCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-required">Moneda</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar moneda" />
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
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="implementationFeeInstallments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-required">Número de Cuotas</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar cuotas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Pago único</SelectItem>
                            <SelectItem value="2">2 cuotas</SelectItem>
                            <SelectItem value="3">3 cuotas</SelectItem>
                            <SelectItem value="4">4 cuotas</SelectItem>
                            <SelectItem value="5">5 cuotas</SelectItem>
                            <SelectItem value="6">6 cuotas</SelectItem>
                            <SelectItem value="12">12 cuotas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Se crearán automáticamente {field.value} pagos programados
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Fee Recurrente */}
              {showRecurringFee && (
                <div className="space-y-4 border-l-2 border-primary/20 pl-4">
                  <h4 className="font-medium">Fee Recurrente</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recurringFeeAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-required">Valor</FormLabel>
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
                      control={form.control}
                      name="recurringFeeCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-required">Moneda</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar moneda" />
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
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recurringFeeFrequency"
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
                              <SelectItem value="Semanal">Semanal</SelectItem>
                              <SelectItem value="Quincenal">Quincenal</SelectItem>
                              <SelectItem value="Mensual">Mensual</SelectItem>
                              <SelectItem value="Bimensual">Bimensual</SelectItem>
                              <SelectItem value="Trimestral">Trimestral</SelectItem>
                              <SelectItem value="Semestral">Semestral</SelectItem>
                              <SelectItem value="Anual">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recurringFeeDayOfCharge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-required">Día de Cobro</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="31" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recurringFeeGracePeriods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Periodos de Gracia</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Número de periodos antes de iniciar los cobros
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recurringFeeDiscountPeriods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Periodos con Descuento</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Número de periodos con precio especial
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="recurringFeeDiscountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porcentaje de Descuento (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre el proyecto"
                      className="resize-none"
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
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
