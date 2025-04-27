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
  
  const currentDate = new Date();
  
  const currentPayments = allPayments.filter(payment => 
    new Date(payment.date) <= currentDate
  );
  
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
        <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-800/30">
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
        <div className="font-medium text-white">
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
            className={
              status === "Pagado" ? "bg-green-900/30 text-green-300 border-green-800/30" :
              status === "Vencido" ? "bg-red-900/30 text-red-300 border-red-800/30" :
              "bg-purple-900/30 text-purple-300 border-purple-800/30"
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
              <CheckCircle2 className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-xs text-green-300">Pagado</span>
              {payment.documentUrl && (
                <Button 
                  variant="link" 
                  size="sm"
                  className="h-auto p-0 ml-2 text-purple-400 hover:text-purple-300"
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
            className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
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
      <Tabs defaultValue="current" className="text-white">
        <TabsList className="bg-[#0f0b2a] border border-purple-800/30">
          <TabsTrigger value="current" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white">Pagos Actuales</TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white">Pagos Futuros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <Card className="bg-[#1e1756] border-purple-800/30 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-white">Pagos Pendientes / Vencidos</CardTitle>
              <CardDescription className="text-slate-300">
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
                  <h3 className="mt-2 text-lg font-medium text-white">Sin pagos pendientes</h3>
                  <p className="text-sm text-slate-300">
                    No hay pagos pendientes o vencidos para este proyecto.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <Card className="bg-[#1e1756] border-purple-800/30 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-white">Pagos Programados</CardTitle>
              <CardDescription className="text-slate-300">
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
                  <Calendar className="mx-auto h-12 w-12 text-purple-500/50" />
                  <h3 className="mt-2 text-lg font-medium text-white">Sin pagos futuros</h3>
                  <p className="text-sm text-slate-300">
                    No hay pagos programados para este proyecto.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={markAsPaidDialogOpen} onOpenChange={setMarkAsPaidDialogOpen}>
        <DialogContent className="bg-[#1e1756] border-purple-800/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-purple-400" />
              Marcar pago como completado
            </DialogTitle>
            <DialogDescription className="text-slate-300">
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
                    <FormLabel className="text-white">Comprobante de pago (opcional)</FormLabel>
                    <FormControl>
                      <FileUpload
                        onFileSelect={(file) => {
                          if (file) {
                            field.onChange(URL.createObjectURL(file));
                          }
                        }}
                        value={field.value}
                        onChange={field.onChange}
                        bucket="payment-documents"
                        accept="application/pdf,image/png,image/jpeg"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setMarkAsPaidDialogOpen(false)}
                  className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Confirmar Pago
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}