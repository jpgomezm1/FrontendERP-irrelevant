import { useState } from "react";
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
import { formatCurrency, convertCurrency, Currency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* 🔗 ← NUEVO: hook que consulta la API real */
import { useIncomesAPI } from "@/hooks/use-incomes-api";

export function IncomeList() {
  /* ───────── Estado local ───────── */
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("COP");

  /* ───────── Datos desde el backend ───────── */
  const {
    data: incomes = [],      // la lista (array vacío por defecto)
    isLoading,               // true mientras llega la respuesta
  } = useIncomesAPI();

  /* ───────── Definición de columnas ───────── */
  const incomeColumns = [
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return new Intl.DateTimeFormat("es-CO").format(date);
      },
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => {
        const originalAmount = row.original.amount;
        const originalCurrency = row.original.currency;
        const amount =
          displayCurrency === originalCurrency
            ? originalAmount
            : convertCurrency(originalAmount, originalCurrency, displayCurrency);

        return (
          <div className="flex items-center space-x-2">
            <span className="text-green-600 font-medium">
              {formatCurrency(amount, displayCurrency)}
            </span>
            {displayCurrency !== originalCurrency && (
              <span className="text-xs text-gray-500">
                (Original: {formatCurrency(originalAmount, originalCurrency)})
              </span>
            )}
          </div>
        );
      },
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
      cell: () => (
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <FileText className="mr-2 h-4 w-4" />
          Ver
        </Button>
      ),
    },
  ];

  /* ───────── Render ───────── */
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Ingresos Registrados</CardTitle>
          <CardDescription>Control y seguimiento de todos los ingresos</CardDescription>
        </div>

        {/* Selector de moneda */}
        <Select
          value={displayCurrency}
          onValueChange={(value: Currency) => setDisplayCurrency(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Moneda de visualización" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COP">Pesos Colombianos (COP)</SelectItem>
            <SelectItem value="USD">Dólares (USD)</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando ingresos…</p>
        ) : (
          <DataTable
            columns={incomeColumns}
            data={incomes}
            searchColumn="description"
            searchPlaceholder="Buscar ingresos..."
          />
        )}
      </CardContent>

      <CardFooter>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </CardFooter>
    </Card>
  );
}
