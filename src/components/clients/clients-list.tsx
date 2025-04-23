
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useClientsAPI } from "@/hooks/use-clients-api";
import { Badge } from "@/components/ui/badge";

interface ClientsListProps {
  onClientSelect: (clientId: number) => void;
}

export function ClientsList({ onClientSelect }: ClientsListProps) {
  const { data: clients = [], isLoading } = useClientsAPI();
  if (isLoading) return <p>Cargando…</p>;
  
  const clientColumns = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "email",
      header: "Correo",
    },
    {
      accessorKey: "phone",
      header: "Teléfono",
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
              status === "Pausado" ? "warning" : "secondary"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onClientSelect(row.original.id)}
        >
          Ver Detalles
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <CardDescription>
          Lista de todos los clientes registrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={clientColumns}
          data={clients}
          searchColumn="name"
          searchPlaceholder="Buscar cliente..."
        />
      </CardContent>
    </Card>
  );
}
