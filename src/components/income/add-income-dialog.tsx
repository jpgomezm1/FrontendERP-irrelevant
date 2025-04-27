import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
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
import { CalendarIcon, CreditCard, Tag, BarChart, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { CurrencyInput } from "@/components/ui/currency-input";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addIncome } from "@/services/financeService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const incomeFormSchema = z.object({
  type: z.string({
    required_error: "Seleccione un tipo de ingreso",
  }),
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  currency: z.enum(["COP", "USD"] as const, {
    required_error: "Seleccione una moneda",
  }),
  client: z.string().optional(),
  paymentMethod: z.string({
    required_error: "Seleccione un método de pago",
  }),
  receipt: z.any().optional(),
  notes: z.string().optional(),
});

export function AddIncomeDialog({ open, onOpenChange, trigger }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof incomeFormSchema>>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      type: "",
      description: "",
      date: new Date(),
      amount: 0,
      currency: "COP",
      client: "",
      paymentMethod: "",
      notes: "",
    },
  });
  
  const addIncomeMutation = useMutation({
    mutationFn: addIncome,
    onSuccess: () => {
      toast({
        title: "Ingreso registrado",
        description: "El ingreso ha sido registrado correctamente",
        icon: <CheckCircle2 className="h-4 w-4 text-green-400" />
      });
      // Invalidate the incomes query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error al registrar ingreso:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al registrar el ingreso",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-400" />
      });
    }
  });

  const onSubmit = (data: z.infer<typeof incomeFormSchema>) => {
    console.log("Enviando datos de ingreso:", data);
    
    addIncomeMutation.mutate({
      description: data.description,
      date: data.date,
      amount: data.amount,
      type: data.type,
      client: data.client || undefined,
      paymentMethod: data.paymentMethod,
      receipt: data.receipt || undefined,
      notes: data.notes || undefined,
      currency: data.currency
    });
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1e1756] border-purple-800/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-purple-400" />
            Registrar Nuevo Ingreso
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Completa el formulario para registrar un nuevo ingreso
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-required text-white">Tipo de Ingreso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                          <Tag className="h-4 w-4 mr-2 text-purple-400" />
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                        {incomeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-required text-white">Descripción</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Descripción del ingreso" 
                        {...field} 
                        className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400"
                      />
                    </FormControl>
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
                    <FormLabel className="form-required text-white">Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-[#0f0b2a] border-purple-800/30 text-white",
                              !field.value && "text-slate-400"
                            )}
                          >
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
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto bg-[#1e1756]")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2">
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
                          showCurrencySelector={false}
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
                            <SelectValue placeholder="Moneda" />
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
            </div>

            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                        <SelectValue placeholder="Seleccionar cliente (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                      {clients.map((client) => (
                        <SelectItem key={client} value={client}>
                          {client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-slate-400">Opcional para ingresos por clientes</FormDescription>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-required text-white">Método de Pago</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                        <CreditCard className="h-4 w-4 mr-2 text-purple-400" />
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="receipt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Comprobante</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-purple-800/30 rounded-md p-6 flex flex-col items-center justify-center text-center bg-[#0f0b2a]/50">
                      <FileText className="h-10 w-10 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-300">
                        Arrastra y suelta un archivo o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Formatos aceptados: PDF, JPG, PNG. Máx 5MB
                      </p>
                      <FileUpload
                        onFileSelect={(file) => field.onChange(file)}
                        acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                        maxFileSizeMB={5}
                        className="mt-4 bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-slate-400">
                    Formatos aceptados: PDF, JPG, PNG. Máx 5MB
                  </FormDescription>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales (opcional)"
                      {...field}
                      className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 min-h-[100px]"
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
                className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={addIncomeMutation.isPending}
              >
                {addIncomeMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}