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
import { FileText, Download, PieChart } from "lucide-react";
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
        let badgeClass = "";
        
        if (status === "Pagado") {
          badgeClass = "bg-green-900/30 text-green-300 border-green-800/30";
        } else if (status === "Pendiente") {
          badgeClass = "bg-amber-900/30 text-amber-300 border-amber-800/30";
        } else {
          badgeClass = "bg-red-900/30 text-red-300 border-red-800/30";
        }
        
        return (
          <Badge 
            variant={
              status === "Pagado" ? "success" : 
              status === "Pendiente" ? "warning" : 
              "destructive"
            }
            className={badgeClass}
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
            <Button variant="ghost" size="sm" asChild className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20">
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
    <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-white">{title}</CardTitle>
            <CardDescription className="text-slate-300">{description}</CardDescription>
          </div>
          <Button variant="outline" className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]">
            <Download className="h-4 w-4 mr-2 text-purple-400" />
            Exportar Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingPayments ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
          </div>
        ) : (
          <Tabs defaultValue="pagos" className="space-y-4 text-white">
            <TabsList className="bg-[#0f0b2a] border border-purple-800/30">
              <TabsTrigger value="pagos" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white">Pagos</TabsTrigger>
              <TabsTrigger value="resumen" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white">Resumen</TabsTrigger>
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
                  <SelectTrigger className="w-[180px] bg-[#0f0b2a] border-purple-800/30 text-white">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
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
                <Card className="bg-[#0f0b2a]/80 border-purple-800/30 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white">Total Facturado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(totalGeneral, "COP")}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Periodo: {dateRange?.from && formatDate(dateRange.from)} - {dateRange?.to && formatDate(dateRange.to)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#0f0b2a]/80 border-purple-800/30 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-400">Pagado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(totalPaid, "COP")}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {totalGeneral > 0 ? ((totalPaid / totalGeneral) * 100).toFixed(1) : "0"}% del total
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#0f0b2a]/80 border-purple-800/30 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-400">Pendiente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-400">
                      {formatCurrency(totalPending, "COP")}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {totalGeneral > 0 ? ((totalPending / totalGeneral) * 100).toFixed(1) : "0"}% del total
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#0f0b2a]/80 border-purple-800/30 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-red-400">Vencido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-400">
                      {formatCurrency(totalOverdue, "COP")}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {totalGeneral > 0 ? ((totalOverdue / totalGeneral) * 100).toFixed(1) : "0"}% del total
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-[#0f0b2a]/80 border-purple-800/30 text-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4 text-white flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-purple-400" />
                    Distribución de Pagos
                  </h3>
                  <div className="flex items-center">
                    <div className="w-full bg-[#1a1542] rounded-full h-4">
                      {totalGeneral > 0 && (
                        <>
                          <div className="h-4 rounded-l-full bg-green-500" style={{ 
                            width: `${(totalPaid / totalGeneral) * 100}%` 
                          }}></div>
                          {totalPending > 0 && (
                            <div className="h-4 bg-amber-500" style={{ 
                              width: `${(totalPending / totalGeneral) * 100}%`,
                              marginLeft: `${(totalPaid / totalGeneral) * 100}%`
                            }}></div>
                          )}
                          {totalOverdue > 0 && (
                            <div className="h-4 rounded-r-full bg-red-500" style={{ 
                              width: `${(totalOverdue / totalGeneral) * 100}%`,
                              marginLeft: `${((totalPaid + totalPending) / totalGeneral) * 100}%`
                            }}></div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                      <span className="text-green-300">Pagado: {totalGeneral > 0 ? ((totalPaid / totalGeneral) * 100).toFixed(1) : "0"}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-amber-500 rounded mr-1"></div>
                      <span className="text-amber-300">Pendiente: {totalGeneral > 0 ? ((totalPending / totalGeneral) * 100).toFixed(1) : "0"}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                      <span className="text-red-300">Vencido: {totalGeneral > 0 ? ((totalOverdue / totalGeneral) * 100).toFixed(1) : "0"}%</span>
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