
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { formatDate, formatCurrency } from "@/lib/utils";
import { usePaymentsData } from "@/hooks/use-payments-data";
import { useClientsData } from "@/hooks/use-clients-data";
import { useProjectsData } from "@/hooks/use-projects-data";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Payment } from "@/types/clients";

interface FinancialOverviewProps {
  clientId?: number | null;
  projectId?: number | null;
}

export function FinancialOverview({ 
  clientId, 
  projectId 
}: FinancialOverviewProps) {
  const { payments = [], isLoading: isLoadingPayments } = usePaymentsData();
  const { getClientByIdQuery } = useClientsData();
  const { data: client } = clientId ? getClientByIdQuery(clientId) : { data: null };
  const { getProjectByIdQuery } = useProjectsData();
  const { data: project } = projectId ? getProjectByIdQuery(projectId) : { data: null };
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(1)), // Primero del mes actual
    to: new Date(),
  });
  
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  
  // Filtrar pagos según los parámetros
  let filteredPayments: Payment[] = [...payments];
  
  if (projectId) {
    filteredPayments = filteredPayments.filter(p => p.projectId === projectId);
  } else if (clientId) {
    filteredPayments = filteredPayments.filter(p => p.clientId === clientId);
  }
  
  // Aplicar filtro de fechas
  if (dateRange?.from) {
    filteredPayments = filteredPayments.filter(
      payment => new Date(payment.date) >= dateRange.from!
    );
  }
  
  if (dateRange?.to) {
    filteredPayments = filteredPayments.filter(
      payment => new Date(payment.date) <= dateRange.to!
    );
  }
  
  // Aplicar filtro de estado
  if (statusFilter !== "todos") {
    filteredPayments = filteredPayments.filter(
      payment => payment.status === statusFilter
    );
  }
  
  // Calcular totales
  const totalPending = filteredPayments
    .filter(p => p.status === "Pendiente")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalPaid = filteredPayments
    .filter(p => p.status === "Pagado")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalOverdue = filteredPayments
    .filter(p => p.status === "Vencido")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalGeneral = totalPending + totalPaid + totalOverdue;
  
  // Columnas para la tabla de pagos
  const paymentColumns = [
    {
      accessorKey: "date",
      header: "Fecha Programada",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "clientName",
      header: "Cliente",
      cell: ({ row }) => row.original.clientName,
    },
    {
      accessorKey: "projectName",
      header: "Proyecto",
      cell: ({ row }) => row.original.projectName,
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.original.type;
        if (type === "Implementación" && row.original.installmentNumber) {
          return `${type} (Cuota ${row.original.installmentNumber})`;
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
          >
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
                Ver
              </a>
            </Button>
          );
        }
        
        return null;
      },
    },
  ];
  
  // Título dinámico según los filtros
  let title = "Panorama Financiero";
  let description = "Visión general de todos los pagos";
  
  if (clientId && projectId) {
    if (project && client) {
      title = `Pagos: ${project.name}`;
      description = `Cliente: ${client.name}`;
    }
  } else if (clientId) {
    if (client) {
      title = `Pagos de ${client.name}`;
      description = "Todos los proyectos";
    }
  } else if (projectId) {
    if (project) {
      title = `Pagos: ${project.name}`;
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingPayments ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="pagos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pagos">Pagos</TabsTrigger>
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
              <DatePickerWithRange
                value={dateRange}
                onChange={setDateRange}
              />
              
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="Pagado">Pagados</SelectItem>
                    <SelectItem value="Pendiente">Pendientes</SelectItem>
                    <SelectItem value="Vencido">Vencidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="pagos">
              <DataTable
                columns={paymentColumns}
                data={filteredPayments}
                searchColumn="projectName"
                searchPlaceholder="Buscar por proyecto..."
              />
            </TabsContent>
            
            <TabsContent value="resumen">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Facturado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(totalGeneral, "COP")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Periodo: {dateRange?.from && formatDate(dateRange.from)} - {dateRange?.to && formatDate(dateRange.to)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-600">Pagado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalPaid, "COP")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((totalPaid / totalGeneral) * 100).toFixed(1)}% del total
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-600">Pendiente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      {formatCurrency(totalPending, "COP")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((totalPending / totalGeneral) * 100).toFixed(1)}% del total
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-red-600">Vencido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(totalOverdue, "COP")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((totalOverdue / totalGeneral) * 100).toFixed(1)}% del total
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Distribución de Pagos</h3>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="h-4 rounded-l-full bg-green-500" style={{ 
                        width: `${(totalPaid / totalGeneral) * 100}%` 
                      }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                      <span>Pagado: {((totalPaid / totalGeneral) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-amber-500 rounded mr-1"></div>
                      <span>Pendiente: {((totalPending / totalGeneral) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                      <span>Vencido: {((totalOverdue / totalGeneral) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
