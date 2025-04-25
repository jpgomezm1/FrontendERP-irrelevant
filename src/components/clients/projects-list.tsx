
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useProjectsData } from "@/hooks/use-projects-data";
import { Badge } from "@/components/ui/badge";

interface ProjectsListProps {
  onProjectSelect: (projectId: number) => void;
  clientId?: number; // Opcional, para filtrar proyectos por cliente
}

export function ProjectsList({ onProjectSelect, clientId }: ProjectsListProps) {
  const { projects } = useProjectsData();
  
  // Filtrar proyectos si se proporciona un clientId
  const filteredProjects = clientId 
    ? projects.filter(p => p.clientId === clientId)
    : projects;
  
  const projectColumns = [
    {
      accessorKey: "clientName",
      header: "Cliente",
    },
    {
      accessorKey: "name",
      header: "Nombre del Proyecto",
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => {
        const description = row.original.description;
        return description.length > 40 
          ? `${description.substring(0, 40)}...` 
          : description;
      }
    },
    {
      accessorKey: "startDate",
      header: "Fecha Inicio",
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge 
            variant={
              status === "Activo" ? "success" : 
              status === "Pausado" ? "warning" : 
              status === "Finalizado" ? "default" :
              "destructive"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "fee",
      header: "Valor",
      cell: ({ row }) => {
        const plan = row.original.paymentPlan;
        
        if (plan.type === "Fee único") {
          return formatCurrency(
            plan.implementationFee?.total || 0,
            plan.implementationFee?.currency || "COP"
          );
        }
        
        if (plan.recurringFee) {
          return `${formatCurrency(
            plan.recurringFee.amount,
            plan.recurringFee.currency
          )} / ${plan.recurringFee.frequency}`;
        }
        
        return "-";
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onProjectSelect(row.original.id)}
        >
          Ver Detalles
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proyectos</CardTitle>
        <CardDescription>
          {clientId 
            ? "Proyectos del cliente seleccionado" 
            : "Lista de todos los proyectos"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredProjects.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No hay proyectos registrados</p>
          </div>
        ) : (
          <DataTable
            columns={projectColumns}
            data={filteredProjects}
            searchColumn="name"
            searchPlaceholder="Buscar proyecto..."
          />
        )}
      </CardContent>
    </Card>
  );
}
