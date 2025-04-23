import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
/* 🔗 NUEVO: hook conectado al backend */
import { usePaymentsAPI } from "@/hooks/use-payments-api";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, XCircle } from "lucide-react";

interface ProjectPaymentsProps {
  projectId: number;
}

export function ProjectPayments({ projectId }: ProjectPaymentsProps) {
  /* ───────── Datos desde la API ───────── */
  const {
    data: payments = [],
    isLoading,
  } = usePaymentsAPI(projectId);

  /* ───────── Columnas de la tabla ───────── */
  const paymentColumns = [
    {
      accessorKey: "date",
      header: "Fecha Programada",
      cell: ({ row }: { row: any }) => formatDate(row.original.date),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }: { row: any }) => {
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
      cell: ({ row }: { row: any }) =>
        formatCurrency(row.original.amount, row.original.currency),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }: { row: any }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === "Pagado"
                ? "success"
                : status === "Pendiente"
                ? "warning"
                : "destructive"
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
      cell: ({ row }: { row: any }) =>
        row.original.paidDate ? formatDate(row.original.paidDate) : "-",
    },
    {
      accessorKey: "invoiceNumber",
      header: "Factura",
      cell: ({ row }: { row: any }) => row.original.invoiceNumber || "-",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: { row: any }) => {
        const { status, invoiceUrl } = row.original;

        if (status === "Pagado" && invoiceUrl) {
          return (
            <Button variant="ghost" size="sm" asChild>
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="mr-1 h-4 w-4" />
                Ver Factura
              </a>
            </Button>
          );
        }

        if (status === "Pendiente") {
          return (
            <Button variant="ghost" size="sm">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Marcar como Pagado
            </Button>
          );
        }

        return null;
      },
    },
  ];

  /* ───────── Render ───────── */
  return (
    <div>
      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Cargando pagos…
        </p>
      ) : payments.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">
            No hay pagos registrados para este proyecto
          </p>
        </div>
      ) : (
        <DataTable columns={paymentColumns} data={payments} />
      )}
    </div>
  );
}
