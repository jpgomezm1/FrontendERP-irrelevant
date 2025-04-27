import React from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, DollarSign, Calendar, Tag, FileText, CreditCard, ArrowDownUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Currency } from "@/lib/utils";
import { PaymentStatus } from "@/types/clients";
import { usePaymentsData } from "@/hooks/use-payments-data";

const paymentFormSchema = z.object({
  amount: z.number().min(1, { message: "El monto debe ser mayor a 0" }),
  currency: z.enum(["COP", "USD"]),
  date: z.date(),
  status: z.enum(["Pagado", "Pendiente"]),
  paidDate: z.date().optional().nullable(),
  type: z.enum(["Implementación", "Recurrente"]),
  installmentNumber: z.number().optional().nullable(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface AddPaymentDialogProps {
  children: React.ReactNode;
  projectId: number;
  clientId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentAdded?: () => void;
}

export function AddPaymentDialog({
  children,
  projectId,
  clientId,
  open,
  onOpenChange,
  onPaymentAdded,
}: AddPaymentDialogProps) {
  const { toast } = useToast();
  const { addPayment } = usePaymentsData();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      currency: "COP",
      date: new Date(),
      status: "Pendiente",
      paidDate: null,
      type: "Implementación",
      installmentNumber: null,
      invoiceNumber: "",
      notes: "",
    },
  });

  // Observar el estado de pago para mostrar/ocultar campos
  const watchStatus = form.watch("status");
  const watchType = form.watch("type");
  
  async function onSubmit(data: PaymentFormValues) {
    try {
      setIsSubmitting(true);
      console.log("Registrando pago:", data);
      
      const paymentData = {
        projectId,
        clientId,
        amount: data.amount,
        currency: data.currency,
        date: data.date,
        paidDate: data.status === "Pagado" ? data.paidDate || new Date() : undefined,
        status: data.status,
        type: data.type,
        installmentNumber: data.type === "Implementación" ? data.installmentNumber : undefined,
        invoiceNumber: data.status === "Pagado" ? data.invoiceNumber : undefined,
        notes: data.notes || undefined
      };
      
      await addPayment(paymentData);
      
      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado exitosamente",
        icon: <CheckCircle2 className="h-4 w-4 text-green-400" />
      });
      
      if (onPaymentAdded) {
        onPaymentAdded();
      }
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error al registrar el pago:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el pago",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-400" />
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1e1756] border-purple-800/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
            Registrar Pago
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Añade un nuevo pago al proyecto
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-required text-white">Monto</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        onValueChange={field.onChange}
                        value={field.value}
                        currency={form.watch("currency")}
                        className="bg-[#0f0b2a] border-purple-800/30 text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-required text-white">Moneda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                          <ArrowDownUp className="h-4 w-4 mr-2 text-purple-400" />
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="form-required text-white">Fecha Programada</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-[#0f0b2a] border-purple-800/30 text-white",
                              !field.value && "text-slate-400"
                            )}
                          >
                            <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
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
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-required text-white">Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                          {field.value === "Pagado" ? (
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                          ) : (
                            <Clock className="h-4 w-4 mr-2 text-yellow-400" />
                          )}
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                        <SelectItem value="Pendiente">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-yellow-400" />
                            Pendiente
                          </div>
                        </SelectItem>
                        <SelectItem value="Pagado">
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                            Pagado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            </div>
            
            {watchStatus === "Pagado" && (
              <FormField
                control={form.control}
                name="paidDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="form-required text-white">Fecha de Pago</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-[#0f0b2a] border-purple-800/30 text-white",
                              !field.value && "text-slate-400"
                            )}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha de pago</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 text-purple-400" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#1e1756] border-purple-800/30" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value || undefined}
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
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-required text-white">Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                          <Tag className="h-4 w-4 mr-2 text-purple-400" />
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                        <SelectItem value="Implementación">Implementación</SelectItem>
                        <SelectItem value="Recurrente">Recurrente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              
              {watchType === "Implementación" && (
                <FormField
                  control={form.control}
                  name="installmentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Número de Cuota</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Tag className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                          <Input 
                            type="number" 
                            min="1" 
                            {...field} 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            className="pl-10 bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            {watchStatus === "Pagado" && (
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Número de Factura</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                        <Input 
                          placeholder="Ej. FV-2023-001" 
                          {...field}
                          className="pl-10 bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre el pago"
                      className="resize-none bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Guardar
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}