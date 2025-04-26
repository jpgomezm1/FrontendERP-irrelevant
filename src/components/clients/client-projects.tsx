
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
  ArrowRight
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
  
  // Define table columns for projects
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Inicio",
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.original.status === "Activo" ? "success" : 
            row.original.status === "Pausado" ? "warning" : 
            row.original.status === "Finalizado" ? "default" : "destructive"
          }
          className="text-xs"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "totalValue",
      header: "Valor",
      cell: ({ row }) => (
        <div className="text-right font-medium">
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
          {(!row.original.paymentPlan?.implementationFee && !row.original.paymentPlan?.recurringFee) && "-"}
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
            className="h-8"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Ver Detalles
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Proyectos del Cliente</CardTitle>
          <CardDescription>
            Proyectos asociados a {client?.name || "este cliente"}
          </CardDescription>
        </div>
        <AddProjectDialog 
          open={projectDialogOpen}
          onOpenChange={setProjectDialogOpen}
          defaultClientId={clientId}
        >
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </AddProjectDialog>
      </CardHeader>
      <CardContent>
        {projects.length === 0 && !isLoadingProjects ? (
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Sin proyectos</h3>
              <p className="text-sm text-muted-foreground">
                Este cliente aún no tiene proyectos asociados.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setProjectDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear primer proyecto
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
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>Total de proyectos: <span className="font-medium">{projects.length}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
