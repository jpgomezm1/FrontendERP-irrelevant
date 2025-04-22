
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { incomesData } from "./income-data";

export function IncomeList() {
  const incomeColumns = [
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => (
        <span className="text-green-600 font-medium">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <div className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {row.original.type}
        </div>
      ),
    },
    {
      accessorKey: "client",
      header: "Cliente",
      cell: ({ row }) => (
        <span className={row.original.client === "-" ? "text-gray-400" : ""}>
          {row.original.client}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de Pago",
    },
    {
      accessorKey: "receipt",
      header: "Comprobante",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <FileText className="h-4 w-4 mr-2" />
          Ver
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos Registrados</CardTitle>
        <CardDescription>
          Control y seguimiento de todos los ingresos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={incomeColumns}
          data={incomesData}
          searchColumn="description"
          searchPlaceholder="Buscar ingresos..."
        />
      </CardContent>
      <CardFooter>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </CardFooter>
    </Card>
  );
}
