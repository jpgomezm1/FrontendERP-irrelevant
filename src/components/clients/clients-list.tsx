
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
import { formatDate } from "@/lib/utils";
import { useClientsData } from "@/hooks/use-clients-data";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface ClientsListProps {
  onClientSelect: (clientId: number) => void;
}

export function ClientsList({ onClientSelect }: ClientsListProps) {
  const { clients, isLoading, error } = useClientsData();
  const { toast } = useToast();
  
  // Show error toast if there's an error fetching clients
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error al cargar clientes",
        description: "No se pudieron cargar los clientes. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
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
      cell: ({ row }) => formatDate(new Date(row.original.startDate)),
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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DataTable
            columns={clientColumns}
            data={clients}
            searchColumn="name"
            searchPlaceholder="Buscar cliente..."
          />
        )}
      </CardContent>
    </Card>
  );
}
