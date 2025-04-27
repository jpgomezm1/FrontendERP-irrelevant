import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  FileText, 
  Plus, 
  CreditCard, 
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building,
  Info,
  Clock,
  User
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useClientsData } from "@/hooks/use-clients-data";
import { DocumentsList } from "@/components/documents/documents-list";
import { ClientProjects } from "./client-projects";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DocumentUploadDialog } from "@/components/documents/document-upload-dialog";
import { EditClientDialog } from "./edit-client-dialog";

interface ClientDetailsProps {
  clientId: number;
  onBack: () => void;
  onViewFinancials: () => void;
  onProjectSelect: (projectId: number) => void;
}

export function ClientDetails({ 
  clientId, 
  onBack,
  onViewFinancials,
  onProjectSelect 
}: ClientDetailsProps) {
  const { getClientByIdQuery } = useClientsData();
  const { data: client, isLoading, error, refetch } = getClientByIdQuery(clientId);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDocumentAdded = async () => {
    console.log("Document added, refreshing client data");
    await refetch();
  };

  // Status badge styles
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

  if (isLoading) {
    return (
      <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
        <CardContent className="pt-6 flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !client) {
    return (
      <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
        <CardContent className="pt-6 p-10 text-center">
          <p className="text-red-300 mb-4">Error al cargar los datos del cliente</p>
          <Button 
            onClick={onBack} 
            className="mt-4 bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-white hover:bg-[#1e1756]/40"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>
        <div className="flex gap-2">
          <EditClientDialog
            client={client}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          >
            <Button 
              variant="outline"
              className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
            >
              <Edit className="mr-2 h-4 w-4 text-purple-400" />
              Editar Cliente
            </Button>
          </EditClientDialog>
          <Button 
            variant="default"
            onClick={onViewFinancials}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Ver Finanzas
          </Button>
        </div>
      </div>

      <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md overflow-hidden">
        <CardHeader className="bg-[#1e1756]/30 border-b border-purple-800/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-white flex items-center">
                <User className="h-6 w-6 mr-2 text-purple-400" />
                {client.name}
              </CardTitle>
              <CardDescription className="text-slate-300 flex items-center mt-1">
                <Clock className="h-4 w-4 mr-2 text-purple-400" />
                Cliente desde {formatDate(client.startDate)}
              </CardDescription>
            </div>
            <Badge 
              variant="outline"
              className={`text-sm font-medium ${getStatusBadgeClass(client.status)}`}
            >
              {client.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1e1756]/20 p-4 rounded-lg border border-purple-800/20">
              <h3 className="font-medium mb-3 text-white flex items-center">
                <Mail className="h-5 w-5 mr-2 text-purple-400" />
                Información de Contacto
              </h3>
              <div className="space-y-3 text-sm">
                {client.contactName && (
                  <div className="flex items-start">
                    <User className="h-4 w-4 mr-2 text-slate-400 mt-0.5" />
                    <div>
                      <span className="font-medium text-white">Contacto:</span>
                      <div className="text-slate-300">{client.contactName}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <Mail className="h-4 w-4 mr-2 text-slate-400 mt-0.5" />
                  <div>
                    <span className="font-medium text-white">Email:</span>
                    <div className="text-slate-300">{client.email}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-4 w-4 mr-2 text-slate-400 mt-0.5" />
                  <div>
                    <span className="font-medium text-white">Teléfono:</span>
                    <div className="text-slate-300">{client.phone}</div>
                  </div>
                </div>
                {client.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400 mt-0.5" />
                    <div>
                      <span className="font-medium text-white">Dirección:</span>
                      <div className="text-slate-300">{client.address}</div>
                    </div>
                  </div>
                )}
                {client.taxId && (
                  <div className="flex items-start">
                    <Building className="h-4 w-4 mr-2 text-slate-400 mt-0.5" />
                    <div>
                      <span className="font-medium text-white">NIT/ID Tributario:</span>
                      <div className="text-slate-300">{client.taxId}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {client.notes && (
              <div className="bg-[#1e1756]/20 p-4 rounded-lg border border-purple-800/20">
                <h3 className="font-medium mb-3 text-white flex items-center">
                  <Info className="h-5 w-5 mr-2 text-purple-400" />
                  Notas
                </h3>
                <p className="text-sm text-slate-300">{client.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects">
        <TabsList className="bg-[#1e1756]/20 border border-purple-800/20">
          <TabsTrigger 
            value="projects" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-200"
          >
            Proyectos
          </TabsTrigger>
          <TabsTrigger 
            value="documents"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-200"
          >
            Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          <ClientProjects 
            clientId={client.id} 
            onProjectSelect={onProjectSelect}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card className="bg-[#1e1756]/10 border-purple-800/20 text-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-[#1e1756]/30 border-b border-purple-800/20">
              <div>
                <CardTitle className="text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-400" />
                  Documentos
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Documentos administrativos del cliente
                </CardDescription>
              </div>
              <DocumentUploadDialog
                entityType="client"
                entityId={client.id}
                open={documentDialogOpen}
                onOpenChange={setDocumentDialogOpen}
                onSuccess={handleDocumentAdded}
              >
                <Button 
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Documento
                </Button>
              </DocumentUploadDialog>
            </CardHeader>
            <CardContent className="pt-6">
              <DocumentsList 
                documents={client.documents || []} 
                entityType="client"
                entityId={client.id}
                onDeleted={handleDocumentAdded}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}