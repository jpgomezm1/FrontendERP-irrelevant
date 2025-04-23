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
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

/* 🔗 NUEVO: hook conectado al backend */
import { useProjectsAPI } from "@/hooks/use-projects-api";

interface ProjectsListProps {
  onProjectSelect: (projectId: number) => void;
  clientId?: number; // opcional: filtrar por cliente
}

export function ProjectsList({ onProjectSelect, clientId }: ProjectsListProps) {
  /* ───────── Datos desde la API ───────── */
  const {
    data: projects = [],
    isLoading,
  } = useProjectsAPI();

  /* ───────── Filtro por cliente ───────── */
  const filteredProjects = clientId
    ? projects.filter((p: any) => p.clientId === clientId)
    : projects;

  /* ───────── Definición de columnas ───────── */
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
      cell: ({ row }: { row: any }) => {
        const description = row.original.description || "";
        return description.length > 40
          ? `${description.substring(0, 40)}…`
          : description;
      },
    },
    {
      accessorKey: "startDate",
      header: "Fecha Inicio",
      cell: ({ row }: { row: any }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }: { row: any }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === "Activo"
                ? "success"
                : status === "Pausado"
                ? "warning"
                : status === "Finalizado"
                ? "default"
                : "destructive"
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
      cell: ({ row }: { row: any }) => {
        const plan = row.original.paymentPlan || {};

        if (plan.type === "Fee único") {
          return formatCurrency(
            plan.implementationFee?.total || 0,
            plan.implementationFee?.currency || "COP",
          );
        }

        if (plan.recurringFee) {
          return `${formatCurrency(
            plan.recurringFee.amount,
            plan.recurringFee.currency,
          )} / ${plan.recurringFee.frequency}`;
        }

        return "-";
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }: { row: any }) => (
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

  /* ───────── Render ───────── */
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
        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Cargando proyectos…
          </p>
        ) : filteredProjects.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">
              No hay proyectos registrados
            </p>
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
