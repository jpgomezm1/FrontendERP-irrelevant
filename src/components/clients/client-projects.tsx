import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  ExternalLink, 
  Calendar,
  Activity,
  ArrowRight,
  Briefcase,
  Clock,
  AlertCircle,
  Tag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProjectsData } from "@/hooks/use-projects-data";
import { useClientsData } from "@/hooks/use-clients-data";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Project } from "@/types/clients";
import { AddProjectDialog } from "./add-project-dialog";

interface ClientProjectsProps {
  clientId: number;
  onProjectSelect: (projectId: number) => void;
}

export function ClientProjects({ clientId, onProjectSelect }: ClientProjectsProps) {
  const { getClientByIdQuery } = useClientsData();
  const { data: client } = getClientByIdQuery(clientId);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  const { getProjectsByClientIdQuery } = useProjectsData();
  const { 
    data: projects = [], 
    isLoading: isLoadingProjects, 
    error: projectsError
  } = getProjectsByClientIdQuery(clientId);
  
  // Status badge styles
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-900/30 text-green-300 border-green-800/30";
      case "Pausado":
        return "bg-yellow-900/30 text-yellow-300 border-yellow-800/30";
      case "Finalizado":
        return "bg-blue-900/30 text-blue-300 border-blue-800/30";
      case "Cancelado":
        return "bg-red-900/30 text-red-300 border-red-800/30";
      default:
        return "bg-slate-800/50 text-slate-300 border-slate-700/50";
    }
  };
  
  // Define table columns for projects
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium text-white flex items-center">
          <Briefcase className="h-4 w-4 mr-2 text-purple-400" />
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Inicio",
      cell: ({ row }) => (
        <div className="flex items-center text-white">
          <Calendar className="h-4 w-4 mr-2 text-slate-400" />
          {formatDate(row.original.startDate)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge 
          variant="outline"
          className={`text-xs font-medium ${getStatusBadgeClass(row.original.status)}`}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "totalValue",
      header: "Valor",
      cell: ({ row }) => (
        <div className="text-right font-medium text-green-400">
          {row.original.paymentPlan?.implementationFee && 
            formatCurrency(
              row.original.paymentPlan.implementationFee.total,
              row.original.paymentPlan.implementationFee.currency
            )
          }
          {(!row.original.paymentPlan?.implementationFee && row.original.paymentPlan?.recurringFee) && 
            formatCurrency(
              row.original.paymentPlan.recurringFee.amount * 12,
              row.original.paymentPlan.recurringFee.currency
            )
          }
          {(!row.original.paymentPlan?.implementationFee && !row.original.paymentPlan?.recurringFee) && 
            <span className="text-slate-400">-</span>
          }
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onProjectSelect(row.original.id)}
            className="h-8 bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
          >
            <ExternalLink className="h-4 w-4 mr-1 text-purple-400" />
            Ver Detalles
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-3 bg-[#1e1756]/30 border-b border-purple-800/20">
        <div>
          <CardTitle className="text-white flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-purple-400" />
            Proyectos del Cliente
          </CardTitle>
          <CardDescription className="text-slate-300">
            Proyectos asociados a {client?.name || "este cliente"}
          </CardDescription>
        </div>
        <AddProjectDialog 
          open={projectDialogOpen}
          onOpenChange={setProjectDialogOpen}
          defaultClientId={clientId}
        >
          <Button 
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </AddProjectDialog>
      </CardHeader>
      <CardContent className="pt-6">
        {projects.length === 0 && !isLoadingProjects ? (
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <Calendar className="h-16 w-16 text-purple-400/30" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Sin proyectos</h3>
              <p className="text-sm text-slate-400">
                Este cliente aún no tiene proyectos asociados.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setProjectDialogOpen(true)}
              className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40 mt-2"
            >
              <Plus className="mr-2 h-4 w-4 text-purple-400" />
              Crear primer proyecto
            </Button>
          </div>
        ) : isLoadingProjects ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : projectsError ? (
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="h-16 w-16 text-red-400/50 mx-auto" />
            <p className="text-red-300">Error al cargar los proyectos</p>
            <Button 
              variant="outline"
              className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40 mt-2"
              onClick={() => getProjectsByClientIdQuery(clientId).refetch()}
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <DataTable 
              columns={columns}
              data={projects}
              searchColumn="name"
              searchPlaceholder="Buscar por nombre..."
              isLoading={isLoadingProjects}
            />
            {(projects?.length > 0) && (
              <div className="mt-4 pt-4 border-t border-purple-800/20">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-400" />
                      <span>Total de proyectos: <span className="font-medium text-white">{projects.length}</span></span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setProjectDialogOpen(true)}
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar proyecto
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}