
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { usePaymentsData } from "@/hooks/use-payments-data";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, XCircle } from "lucide-react";

interface ProjectPaymentsProps {
  projectId: number;
}

export function ProjectPayments({ projectId }: ProjectPaymentsProps) {
  const { getPaymentsByProjectId } = usePaymentsData();
  const payments = getPaymentsByProjectId(projectId);
  
  const paymentColumns = [
    {
      accessorKey: "date",
      header: "Fecha Programada",
      cell: ({ row }) => formatDate(row.original.date),
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
      cell: ({ row }) => row.original.paidDate ? formatDate(row.original.paidDate) : "-",
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
        const { status, invoiceUrl } = row.original;
        
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
        
        if (status === "Pendiente") {
          return (
            <Button variant="ghost" size="sm">
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
      {payments.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No hay pagos registrados para este proyecto</p>
        </div>
      ) : (
        <DataTable
          columns={paymentColumns}
          data={payments}
        />
      )}
    </div>
  );
}
