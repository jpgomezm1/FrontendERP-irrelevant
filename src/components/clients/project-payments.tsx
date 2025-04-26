
import React, { useState } from "react";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { CalendarIcon, Calendar, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { usePaymentsData } from "@/hooks/use-payments-data";
import { Payment, PaymentStatus } from "@/types/clients";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { FileUpload } from "../ui/file-upload";
import { toast } from "sonner";

interface ProjectPaymentsProps {
  projectId: number;
}

export function ProjectPayments({ projectId }: ProjectPaymentsProps) {
  const { getPaymentsByProjectIdQuery, updatePaymentStatus } = usePaymentsData();
  const { data: allPayments = [], isLoading } = getPaymentsByProjectIdQuery(projectId);
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      documentUrl: "",
    }
  });
  
  // Filter payments based on due date
  const currentDate = new Date();
  
  // Current payments: due today or in the past
  const currentPayments = allPayments.filter(payment => 
    new Date(payment.date) <= currentDate
  );
  
  // Future payments: due in the future
  const futurePayments = allPayments.filter(payment => 
    new Date(payment.date) > currentDate
  );
  
  const handleMarkAsPaid = async (payment: Payment) => {
    setSelectedPayment(payment);
    setMarkAsPaidDialogOpen(true);
  };
  
  const onSubmitPaidForm = async (formData: { documentUrl: string }) => {
    if (!selectedPayment) return;
    
    try {
      await updatePaymentStatus(
        selectedPayment.id,
        "Pagado",
        new Date(),
        formData.documentUrl
      );
      
      setMarkAsPaidDialogOpen(false);
      form.reset();
      setSelectedPayment(null);
      toast.success("Pago marcado como completado");
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      toast.error("Error al procesar el pago");
    }
  };
  
  // Define columns for the payments tables
  const paymentColumns: ColumnDef<Payment>[] = [
    {
      accessorKey: "installmentNumber",
      header: "#",
      cell: ({ row }) => row.original.installmentNumber || "-",
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Fecha Vencimiento",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.original.amount, row.original.currency)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status as PaymentStatus;
        return (
          <Badge
            variant={
              status === "Pagado" ? "success" :
              status === "Vencido" ? "destructive" : "outline"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "paidDate",
      header: "Fecha Pago",
      cell: ({ row }) => row.original.paidDate ? formatDate(row.original.paidDate) : "-",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const payment = row.original;
        const isPaid = payment.status === "Pagado";
        
        if (isPaid) {
          return (
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-xs">Pagado</span>
              {payment.documentUrl && (
                <Button 
                  variant="link" 
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() => window.open(payment.documentUrl, '_blank')}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  <span className="text-xs">Ver comprobante</span>
                </Button>
              )}
            </div>
          );
        }
        
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAsPaid(payment)}
          >
            Marcar como pagado
          </Button>
        );
      },
    },
  ];
  
  return (
    <>
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Pagos Actuales</TabsTrigger>
          <TabsTrigger value="upcoming">Pagos Futuros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pagos Pendientes / Vencidos</CardTitle>
              <CardDescription>
                Pagos actuales que deben ser cobrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={paymentColumns}
                data={currentPayments}
                isLoading={isLoading}
              />
              
              {currentPayments.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500/50" />
                  <h3 className="mt-2 text-lg font-medium">Sin pagos pendientes</h3>
                  <p className="text-sm text-muted-foreground">
                    No hay pagos pendientes o vencidos para este proyecto.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pagos Programados</CardTitle>
              <CardDescription>
                Pagos futuros planificados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={paymentColumns.filter(col => col.id !== "actions")}
                data={futurePayments}
                isLoading={isLoading}
              />
              
              {futurePayments.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-lg font-medium">Sin pagos futuros</h3>
                  <p className="text-sm text-muted-foreground">
                    No hay pagos programados para este proyecto.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog for marking a payment as paid */}
      <Dialog open={markAsPaidDialogOpen} onOpenChange={setMarkAsPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar pago como completado</DialogTitle>
            <DialogDescription>
              Registrar el pago por {selectedPayment ? formatCurrency(selectedPayment.amount, selectedPayment.currency) : ''} 
              correspondiente a {selectedPayment?.type}.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitPaidForm)} className="space-y-4">
              <FormField
                control={form.control}
                name="documentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comprobante de pago (opcional)</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        bucket="payment_documents"
                        accept="application/pdf,image/png,image/jpeg"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setMarkAsPaidDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Confirmar Pago</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
