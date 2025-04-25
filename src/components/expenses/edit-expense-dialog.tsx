
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/currency-input";
import { updateVariableExpense, updateRecurringExpense, VariableExpense, RecurringExpense } from "@/services/expenseService";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

const expenseSchema = z.object({
  id: z.number(),
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
  endDate: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
  isAutoDebit: z.boolean().default(false)
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface EditExpenseDialogProps {
  isRecurring: boolean;
  expense: VariableExpense | RecurringExpense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditExpenseDialog({ 
  isRecurring, 
  expense, 
  open, 
  onOpenChange 
}: EditExpenseDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mapExpenseToFormValues = (): ExpenseFormValues => {
    if (isRecurring) {
      const recurringExpense = expense as RecurringExpense;
      return {
        id: recurringExpense.id,
        description: recurringExpense.description,
        amount: recurringExpense.amount,
        date: recurringExpense.startDate,
        category: recurringExpense.category,
        paymentMethod: recurringExpense.paymentMethod,
        notes: recurringExpense.notes || "",
        receipt: recurringExpense.receipt || "",
        currency: recurringExpense.currency,
        isRecurring: true,
        frequency: recurringExpense.frequency,
        endDate: recurringExpense.endDate || null,
        isActive: recurringExpense.isActive,
        isAutoDebit: recurringExpense.isAutoDebit
      };
    } else {
      const variableExpense = expense as VariableExpense;
      return {
        id: variableExpense.id,
        description: variableExpense.description,
        amount: variableExpense.amount,
        date: variableExpense.date,
        category: variableExpense.category,
        paymentMethod: variableExpense.paymentMethod,
        notes: variableExpense.notes || "",
        receipt: variableExpense.receipt || "",
        currency: variableExpense.currency,
        isRecurring: false
      };
    }
  };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: mapExpenseToFormValues()
  });

  // Update the form values when the expense changes
  useEffect(() => {
    form.reset(mapExpenseToFormValues());
  }, [expense]);

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      if (isRecurring) {
        await updateRecurringExpense({
          id: data.id,
          description: data.description,
          startDate: data.date,
          endDate: data.endDate || undefined,
          amount: data.amount,
          category: data.category,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          receipt: data.receipt,
          currency: data.currency,
          frequency: data.frequency || "monthly",
          isActive: data.isActive,
          isAutoDebit: data.isAutoDebit
        });
      } else {
        await updateVariableExpense({
          id: data.id,
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
        title: "Gasto actualizado",
        description: `El gasto ha sido actualizado exitosamente`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['caused-expenses'] });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating expense:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el gasto. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const categories = [
    "Arriendo", 
    "Alimentación", 
    "Entretenimiento", 
    "Marketing", 
    "Nómina", 
    "Servicios", 
    "Software", 
    "Tecnología", 
    "Transporte", 
    "Otros"
  ];

  const paymentMethods = [
    "Efectivo", 
    "Tarjeta de Crédito", 
    "Tarjeta de Débito", 
    "Transferencia", 
    "PayPal", 
    "Nequi", 
    "Daviplata"
  ];

  const frequencies = [
    { value: "weekly", label: "Semanal" },
    { value: "biweekly", label: "Quincenal" },
    { value: "monthly", label: "Mensual" },
    { value: "bimonthly", label: "Bimensual" },
    { value: "quarterly", label: "Trimestral" },
    { value: "semiannual", label: "Semestral" },
    { value: "annual", label: "Anual" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar {isRecurring ? "Gasto Recurrente" : "Gasto"}</DialogTitle>
          <DialogDescription>
            Modifique los detalles del {isRecurring ? "gasto recurrente" : "gasto"} a continuación.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripción del gasto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        currency={form.watch("currency")}
                        onValueChange={(value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{isRecurring ? "Fecha de inicio" : "Fecha"}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value)
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
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
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
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
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
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre el gasto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                      <FormLabel>Frecuencia</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar frecuencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {frequencies.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Finalización (Opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Sin fecha de finalización</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={(date) => {
                              field.onChange(date);
                            }}
                            disabled={(date) => date <= form.getValues("date")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Opcional: define cuándo terminará este gasto recurrente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Estado Activo</FormLabel>
                        <FormDescription>
                          Desactive para detener la generación de nuevas causaciones
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

                <FormField
                  control={form.control}
                  name="isAutoDebit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Débito Automático</FormLabel>
                        <FormDescription>
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
