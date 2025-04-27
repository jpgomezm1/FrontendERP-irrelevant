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
import { User, Mail, Phone, Calendar, AlertCircle, ExternalLink } from "lucide-react";

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
        icon: <AlertCircle className="h-4 w-4 text-red-400" />
      });
    }
  }, [error, toast]);
  
  // Define status badge classes
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-900/30 text-green-300 border-green-800/30";
      case "Pausado":
        return "bg-yellow-900/30 text-yellow-300 border-yellow-800/30";
      case "Terminado":
        return "bg-red-900/30 text-red-300 border-red-800/30";
      default:
        return "bg-slate-800/50 text-slate-300 border-slate-700/50";
    }
  };
  
  const clientColumns = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium text-white flex items-center">
          <User className="h-4 w-4 mr-2 text-purple-400" />
          {row.original.name}
        </div>
      )
    },
    {
      accessorKey: "email",
      header: "Correo",
      cell: ({ row }) => (
        <div className="text-white flex items-center">
          <Mail className="h-4 w-4 mr-2 text-slate-400" />
          {row.original.email}
        </div>
      )
    },
    {
      accessorKey: "phone",
      header: "Teléfono",
      cell: ({ row }) => (
        <div className="text-white flex items-center">
          <Phone className="h-4 w-4 mr-2 text-slate-400" />
          {row.original.phone}
        </div>
      )
    },
    {
      accessorKey: "startDate",
      header: "Fecha Inicio",
      cell: ({ row }) => (
        <div className="text-white flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-slate-400" />
          {formatDate(new Date(row.original.startDate))}
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge 
            variant="outline"
            className={`text-xs font-medium ${getStatusBadgeClass(status)}`}
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
          variant="outline"
          size="sm"
          onClick={() => onClientSelect(row.original.id)}
          className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
        >
          <ExternalLink className="h-4 w-4 mr-1 text-purple-400" />
          Ver Detalles
        </Button>
      ),
    },
  ];

  return (
    <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
      <CardHeader className="bg-[#1e1756]/30 border-b border-purple-800/20">
        <CardTitle className="text-white flex items-center">
          <User className="h-5 w-5 mr-2 text-purple-400" />
          Clientes
        </CardTitle>
        <CardDescription className="text-slate-300">
          Lista de todos los clientes registrados
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-purple-400/30 mx-auto mb-3" />
            <p className="text-slate-400 mb-6">No hay clientes registrados</p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Agregar Cliente
            </Button>
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