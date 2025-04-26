
import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { usePaymentsData } from "@/hooks/use-payments-data";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPaymentsByProjectId } from "@/services/paymentService";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ProjectPaymentsProps {
  projectId: number;
}

export function ProjectPayments({ projectId }: ProjectPaymentsProps) {
  const { toast } = useToast();
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['project-payments', projectId],
    queryFn: () => getPaymentsByProjectId(projectId),
  });
  
  const { updatePaymentStatus } = usePaymentsData();
  
  const handleOpenMarkAsPaidDialog = (paymentId: number) => {
    setSelectedPaymentId(paymentId);
    setMarkAsPaidDialogOpen(true);
  };
  
  const handleMarkAsPaid = async () => {
    if (!selectedPaymentId) return;
    
    try {
      setIsUpdating(true);
      await updatePaymentStatus(selectedPaymentId, "Pagado", selectedDate || new Date());
      toast({
        title: "Pago actualizado",
        description: "El pago ha sido marcado como pagado correctamente"
      });
      setMarkAsPaidDialogOpen(false);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pago",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const paymentColumns = [
    {
      accessorKey: "date",
      header: "Fecha Programada",
      cell: ({ row }) => formatDate(new Date(row.original.date)),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.original.type;
        if (type === "Implementación") {
          const installment = row.original.installmentNumber;
          return `${type} (Cuota ${installment})`;
        }
        return type;
      },
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge 
            variant={
              status === "Pagado" ? "success" : 
              status === "Pendiente" ? "warning" : 
              "destructive"
            }
            className="flex items-center gap-1"
          >
            {status === "Pagado" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : status === "Vencido" ? (
              <XCircle className="h-3 w-3" />
            ) : null}
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "paidDate",
      header: "Fecha de Pago",
      cell: ({ row }) => row.original.paidDate ? formatDate(new Date(row.original.paidDate)) : "-",
    },
    {
      accessorKey: "invoiceNumber",
      header: "Factura",
      cell: ({ row }) => row.original.invoiceNumber || "-",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const { status, invoiceUrl, id } = row.original;
        
        if (status === "Pagado" && invoiceUrl) {
          return (
            <Button variant="ghost" size="sm" asChild>
              <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-1" />
                Ver Factura
              </a>
            </Button>
          );
        }
        
        if (status === "Pendiente" || status === "Vencido") {
          return (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleOpenMarkAsPaidDialog(id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Marcar como Pagado
            </Button>
          );
        }
        
        return null;
      },
    },
  ];

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No hay pagos registrados para este proyecto</p>
        </div>
      ) : (
        <DataTable
          columns={paymentColumns}
          data={payments}
        />
      )}
      
      {/* Dialog for marking payment as paid */}
      <Dialog open={markAsPaidDialogOpen} onOpenChange={setMarkAsPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar pago como pagado</DialogTitle>
            <DialogDescription>
              Seleccione la fecha en que se realizó el pago.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex flex-col space-y-2">
              <label className="font-medium text-sm">Fecha de pago</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", {
                        locale: es,
                      })
                    ) : (
                      <span>Seleccione una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUpdating}>
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              disabled={!selectedDate || isUpdating}
              onClick={handleMarkAsPaid}
            >
              {isUpdating ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
