
import { formatCurrency, formatDate } from "@/lib/utils";
import { CashFlowItem } from "@/services/financeService";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp } from "lucide-react";

export const cashFlowColumns = [
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <div className="flex items-center">
        <span
          className={`flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.type === "Ingreso"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.type === "Ingreso" ? (
            <ArrowDown className="h-3 w-3 mr-1" />
          ) : (
            <ArrowUp className="h-3 w-3 mr-1" />
          )}
          {row.original.type}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Categoría",
  },
  {
    accessorKey: "paymentMethod",
    header: "Método de Pago",
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => (
      <span
        className={
          row.original.type === "Ingreso" ? "text-green-600" : "text-red-600"
        }
      >
        {row.original.type === "Ingreso" ? "+" : "-"}
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Saldo",
    cell: ({ row }) => formatCurrency(row.original.balance),
  },
];
