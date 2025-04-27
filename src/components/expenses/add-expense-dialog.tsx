import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, AlertCircle, CheckCircle2, CreditCard, Receipt, Clock, Tag } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/currency-input";
import { addVariableExpense, addRecurringExpense } from "@/services/expenseService";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, EXPENSE_FREQUENCIES } from "@/lib/constants";

const expenseSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  category: z.string().min(1, "La categoría es requerida"),
  paymentMethod: z.string().min(1, "El método de pago es requerido"),
  notes: z.string().optional(),
  receipt: z.string().optional(),
  currency: z.enum(["COP", "USD"]),
  isRecurring: z.boolean().default(false),
  frequency: z.string().optional(),
  endDate: z.date().optional(),
  isAutoDebit: z.boolean().default(false)
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export function AddExpenseDialog({ isRecurring = false }: { isRecurring?: boolean }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const defaultValues: ExpenseFormValues = {
    description: "",
    amount: 0,
    date: new Date(),
    category: "",
    paymentMethod: "",
    notes: "",
    receipt: "",
    currency: "COP",
    isRecurring: isRecurring,
    frequency: isRecurring ? "monthly" : undefined,
    endDate: undefined,
    isAutoDebit: false
  };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues,
  });

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      setSubmitting(true);
      if (data.isRecurring) {
        await addRecurringExpense({
          description: data.description,
          startDate: data.date,
          endDate: data.endDate,
          amount: data.amount,
          category: data.category,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          receipt: data.receipt,
          currency: data.currency,
          frequency: data.frequency || "monthly",
          isAutoDebit: data.isAutoDebit
        });
      } else {
        await addVariableExpense({
          description: data.description,
          date: data.date,
          amount: data.amount,
          category: data.category,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          receipt: data.receipt,
          currency: data.currency,
        });
      }
      
      toast({
        title: "Gasto agregado",
        description: `El gasto ha sido ${data.isRecurring ? 'programado' : 'agregado'} exitosamente`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-400" />
      });
      
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['caused-expenses'] });
      
      setOpen(false);
      form.reset(defaultValues);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el gasto. Por favor intente nuevamente.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-400" />
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Agregar {isRecurring ? "Gasto Recurrente" : "Gasto"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#1e1756] border-purple-800/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {isRecurring ? <Clock className="h-5 w-5 text-purple-400" /> : <Receipt className="h-5 w-5 text-purple-400" />}
            Agregar {isRecurring ? "Gasto Recurrente" : "Gasto"}
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Complete los detalles del {isRecurring ? "gasto recurrente" : "gasto"} a continuación.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Descripción</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Descripción del gasto" 
                      {...field} 
                      className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Monto</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        currency={form.watch("currency")}
                        onValueChange={(value) => field.onChange(value)}
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
                    <FormLabel className="text-white">Moneda</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-white">{isRecurring ? "Fecha de inicio" : "Fecha"}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal bg-[#0f0b2a] border-purple-800/30 text-white",
                              !field.value && "text-slate-400"
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value)
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
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Método de Pago</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                          <CreditCard className="mr-2 h-4 w-4 text-purple-400" />
                          <SelectValue placeholder="Seleccionar método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                        {PAYMENT_METHODS.map((method) => (
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
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Categoría</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                        <Tag className="mr-2 h-4 w-4 text-purple-400" />
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre el gasto"
                      {...field}
                      className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500 min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {isRecurring && (
              <>
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Frecuencia</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                            <Clock className="mr-2 h-4 w-4 text-purple-400" />
                            <SelectValue placeholder="Seleccionar frecuencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                          {EXPENSE_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-white">Fecha de Finalización (Opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal bg-[#0f0b2a] border-purple-800/30 text-white",
                                !field.value && "text-slate-400"
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Sin fecha de finalización</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 text-purple-400" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1e1756] border-purple-800/30" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                            }}
                            disabled={(date) => date <= form.getValues("date")}
                            initialFocus
                            className="bg-[#1e1756]"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-slate-400">
                        Opcional: define cuándo terminará este gasto recurrente
                      </FormDescription>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAutoDebit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-800/30 p-4 bg-[#0f0b2a]/50">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-white">Débito Automático</FormLabel>
                        <FormDescription className="text-slate-400">
                          Marca si este gasto se debita automáticamente de tu cuenta
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}