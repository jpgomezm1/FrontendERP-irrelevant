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
import { Download, FileText, RefreshCcw, ArrowDownUp, DollarSign, Tag, Calendar, CreditCard, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, convertCurrency, Currency } from "@/lib/utils";
import { useIncomeList } from "@/hooks/use-income-list";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export function IncomeList() {
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("COP");
  const { data: incomes = [], isLoading, isError, refreshIncomes } = useIncomeList();
  const [isExporting, setIsExporting] = useState(false);

  const handleRefresh = () => {
    refreshIncomes();
    toast.info("Actualizando lista de ingresos...", {
      icon: <RefreshCcw className="h-4 w-4 text-blue-400" />
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    // Simular exportación
    setTimeout(() => {
      setIsExporting(false);
      toast.success("Datos exportados correctamente", {
        icon: <Download className="h-4 w-4 text-green-400" />
      });
    }, 1500);
  };

  // Define tipos de ingreso con sus colores
  const incomeTypeColors = {
    "Cliente": "bg-purple-900/30 text-purple-300 border-purple-800/30",
    "Aporte de socio": "bg-blue-900/30 text-blue-300 border-blue-800/30",
    "Extraordinario": "bg-green-900/30 text-green-300 border-green-800/30",
    "Devolución Impuestos": "bg-amber-900/30 text-amber-300 border-amber-800/30",
    "Otros": "bg-slate-800/50 text-slate-300 border-slate-700/50"
  };

  const incomeColumns = [
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => <span className="text-white">{row.original.description}</span>
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
            <span className="text-white">{new Intl.DateTimeFormat('es-CO').format(date)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => {
        const originalAmount = row.original.amount;
        const originalCurrency = row.original.currency;
        const amount = displayCurrency === originalCurrency 
          ? originalAmount 
          : convertCurrency(originalAmount, originalCurrency, displayCurrency);

        return (
          <div className="flex items-center">
            <span className="text-green-400 font-medium mr-1">
              {formatCurrency(amount, displayCurrency)}
            </span>
            {displayCurrency !== originalCurrency && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-xs text-slate-400">
                      ({originalCurrency})
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1e1756] border-purple-800/30 text-white">
                    <p>Original: {formatCurrency(originalAmount, originalCurrency)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.original.type;
        const colorClass = incomeTypeColors[type as keyof typeof incomeTypeColors] || incomeTypeColors["Otros"];
        
        return (
          <div className="flex items-center">
            <Badge 
              variant="outline" 
              className={`font-normal ${colorClass}`}
            >
              <Tag className="h-3 w-3 mr-1" />
              {type}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "client",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-slate-400" />
          <span className={`${!row.original.client ? "text-slate-500" : "text-white"}`}>
            {row.original.client || "-"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de Pago",
      cell: ({ row }) => (
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 mr-2 text-slate-400" />
          <span className="text-white">{row.original.paymentMethod}</span>
        </div>
      ),
    },
    {
      accessorKey: "receipt",
      header: "Comprobante",
      cell: ({ row }) => (
        row.original.receipt ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40" 
            asChild
          >
            <a href={row.original.receipt} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4 mr-2 text-purple-400" />
              Ver
            </a>
          </Button>
        ) : (
          <span className="text-slate-500">-</span>
        )
      ),
    },
  ];

  return (
    <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-[#1e1756]/30 border-b border-purple-800/20">
        <div>
          <CardTitle className="text-white flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
            Ingresos Registrados
          </CardTitle>
          <CardDescription className="text-slate-300">
            Control y seguimiento de todos los ingresos
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
          >
            <RefreshCcw className="h-4 w-4 mr-2 text-purple-400" />
            Actualizar
          </Button>
          <Select value={displayCurrency} onValueChange={(value: Currency) => setDisplayCurrency(value)}>
            <SelectTrigger className="w-[180px] bg-[#1e1756]/20 border-purple-800/20 text-white">
              <ArrowDownUp className="h-4 w-4 mr-2 text-purple-400" />
              <SelectValue placeholder="Moneda de visualización" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
              <SelectItem value="COP">Pesos Colombianos (COP)</SelectItem>
              <SelectItem value="USD">Dólares (USD)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-red-300 mb-2">Error al cargar los ingresos</p>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
            >
              <RefreshCcw className="h-4 w-4 mr-2 text-purple-400" />
              Reintentar
            </Button>
          </div>
        ) : (
          <DataTable
            columns={incomeColumns}
            data={incomes}
            searchColumn="description"
            searchPlaceholder="Buscar ingresos..."
          />
        )}
      </CardContent>
      <CardFooter className="border-t border-purple-800/20 bg-[#1e1756]/10 py-4">
        <Button 
          variant="outline"
          className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
          onClick={handleExport}
          disabled={isExporting || incomes.length === 0}
        >
          <Download className={`h-4 w-4 mr-2 text-purple-400 ${isExporting ? 'animate-pulse' : ''}`} />
          {isExporting ? 'Exportando...' : 'Exportar Excel'}
        </Button>
      </CardFooter>
    </Card>
  );
}