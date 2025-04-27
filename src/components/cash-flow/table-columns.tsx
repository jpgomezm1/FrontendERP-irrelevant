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
    cell: ({ row }) => (
      <span className="text-white">{row.original.description}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <div className="flex items-center">
        <Badge 
          className={`flex items-center gap-1 ${
            row.original.type === "Ingreso"
              ? "bg-green-900/30 text-green-300 border-green-800/30"
              : "bg-red-900/30 text-red-300 border-red-800/30"
          }`}
        >
          {row.original.type === "Ingreso" ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUp className="h-3 w-3" />
          )}
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ row }) => (
      <span className="text-purple-300">{row.original.category}</span>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Método de Pago",
    cell: ({ row }) => (
      <span className="text-slate-300">{row.original.paymentMethod}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      // Always display in COP, note if it was converted from USD
      const wasConverted = row.original.originalCurrency === 'USD';
      
      return (
        <div>
          <span
            className={
              row.original.type === "Ingreso" ? "text-green-400" : "text-red-400"
            }
          >
            {row.original.type === "Ingreso" ? "+" : "-"}
            {formatCurrency(row.original.amount, "COP")}
          </span>
          {wasConverted && row.original.originalAmount && (
            <div className="text-xs text-slate-400 mt-1">
              (Convertido de {formatCurrency(row.original.originalAmount, "USD")})
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "source",
    header: "Fuente",
    cell: ({ row }) => (
      <span className="text-sm text-slate-400">{row.original.source || "N/A"}</span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Saldo",
    cell: ({ row }) => (
      <span className="text-purple-200 font-medium">
        {formatCurrency(row.original.balance || 0, "COP")}
      </span>
    ),
  },
];