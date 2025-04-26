
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
  Trash2 
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useClientsData } from "@/hooks/use-clients-data";
import { DocumentsList } from "./documents-list";
import { ClientProjects } from "./client-projects";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddDocumentDialog } from "./add-document-dialog";
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
  const { data: client, isLoading, error } = getClientByIdQuery(clientId);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !client) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Error al cargar los datos del cliente</p>
          <Button onClick={onBack} className="mt-4">Volver</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>
        <div className="flex gap-2">
          <EditClientDialog
            client={client}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          >
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar Cliente
            </Button>
          </EditClientDialog>
          <Button variant="default" onClick={onViewFinancials}>
            <CreditCard className="mr-2 h-4 w-4" />
            Ver Finanzas
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{client.name}</CardTitle>
              <CardDescription>
                Cliente desde {formatDate(client.startDate)}
              </CardDescription>
            </div>
            <Badge 
              variant={
                client.status === "Activo" ? "success" : 
                client.status === "Pausado" ? "warning" : "secondary"
              }
              className="text-sm"
            >
              {client.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Información de Contacto</h3>
              <div className="space-y-2 text-sm">
                {client.contactName && (
                  <p><span className="font-medium">Contacto:</span> {client.contactName}</p>
                )}
                <p><span className="font-medium">Email:</span> {client.email}</p>
                <p><span className="font-medium">Teléfono:</span> {client.phone}</p>
                {client.address && (
                  <p><span className="font-medium">Dirección:</span> {client.address}</p>
                )}
                {client.taxId && (
                  <p><span className="font-medium">NIT/ID Tributario:</span> {client.taxId}</p>
                )}
              </div>
            </div>
            
            {client.notes && (
              <div>
                <h3 className="font-medium mb-2">Notas</h3>
                <p className="text-sm">{client.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          <ClientProjects 
            clientId={client.id} 
            onProjectSelect={onProjectSelect}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Documentos</CardTitle>
                <CardDescription>
                  Documentos administrativos del cliente
                </CardDescription>
              </div>
              <AddDocumentDialog 
                clientId={client.id}
                open={documentDialogOpen}
                onOpenChange={setDocumentDialogOpen}
              >
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Documento
                </Button>
              </AddDocumentDialog>
            </CardHeader>
            <CardContent>
              <DocumentsList 
                documents={client.documents || []} 
                entityType="client"
                entityId={client.id}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
