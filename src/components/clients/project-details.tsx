
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
  Calendar,
  Trash2
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useProjectsData } from "@/hooks/use-projects-data";
import { useClientsData } from "@/hooks/use-clients-data";
import { DocumentsList } from "./documents-list";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProjectPayments } from "./project-payments";
import { AddDocumentDialog } from "./add-document-dialog";
import { EditProjectDialog } from "./edit-project-dialog";
import { AddPaymentDialog } from "./add-payment-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";

interface ProjectDetailsProps {
  projectId: number;
  onBack: () => void;
  onViewFinancials: () => void;
}

export function ProjectDetails({ 
  projectId, 
  onBack,
  onViewFinancials 
}: ProjectDetailsProps) {
  const { getProjectByIdQuery } = useProjectsData();
  const { data: project, isLoading: isLoadingProject, error: projectError } = getProjectByIdQuery(projectId);
  
  // Only fetch client if we have a valid project with clientId
  const { getClientByIdQuery } = useClientsData();
  const { data: client, isLoading: isLoadingClient, error: clientError } = getClientByIdQuery(
    project ? project.clientId : undefined
  );
  
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isLoading = isLoadingProject || isLoadingClient;
  const hasError = projectError || clientError;
  
  const renderPaymentPlan = () => {
    if (!project || !project.paymentPlan) return null;
    
    const { paymentPlan: plan } = project;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Tipo de Plan</h3>
          <Badge variant="outline" className="text-sm">{plan.type}</Badge>
        </div>
        
        {plan.implementationFee && (
          <div>
            <h3 className="font-medium mb-2">Fee de Implementación</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-medium">Valor Total:</span> {" "}
                {formatCurrency(plan.implementationFee.total, plan.implementationFee.currency)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Forma de Pago:</span> {" "}
                {plan.implementationFee.installments === 1
                  ? "Pago único"
                  : `${plan.implementationFee.installments} cuotas`}
              </p>
            </div>
          </div>
        )}
        
        {plan.recurringFee && (
          <div>
            <h3 className="font-medium mb-2">Fee Recurrente</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-medium">Valor:</span> {" "}
                {formatCurrency(plan.recurringFee.amount, plan.recurringFee.currency)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Frecuencia:</span> {" "}
                {plan.recurringFee.frequency}
              </p>
              <p className="text-sm">
                <span className="font-medium">Día de Cobro:</span> {" "}
                {plan.recurringFee.dayOfCharge}
              </p>
              
              {plan.recurringFee.gracePeriods && plan.recurringFee.gracePeriods > 0 && (
                <p className="text-sm">
                  <span className="font-medium">Periodo de Gracia:</span> {" "}
                  {plan.recurringFee.gracePeriods} {plan.recurringFee.gracePeriods === 1 ? "periodo" : "periodos"}
                </p>
              )}
              
              {plan.recurringFee.discountPeriods && plan.recurringFee.discountPeriods > 0 && (
                <p className="text-sm">
                  <span className="font-medium">Descuento:</span> {" "}
                  {plan.recurringFee.discountPercentage}% por {plan.recurringFee.discountPeriods} {plan.recurringFee.discountPeriods === 1 ? "periodo" : "periodos"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (hasError || !project || !client) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Error al cargar los datos del proyecto</p>
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
          <EditProjectDialog
            project={project}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          >
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar Proyecto
            </Button>
          </EditProjectDialog>
          <Button variant="default" onClick={onViewFinancials}>
            <CreditCard className="mr-2 h-4 w-4" />
            Ver Finanzas
          </Button>
          <Button 
            variant="outline" 
            className="border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
          <DeleteProjectDialog
            projectId={project.id}
            projectName={project.name}
            isOpen={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onDeleted={onBack}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Cliente: {client.name}
              </div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <CardDescription>
                Iniciado el {formatDate(project.startDate)}
              </CardDescription>
            </div>
            <Badge 
              variant={
                project.status === "Activo" ? "success" : 
                project.status === "Pausado" ? "warning" : 
                project.status === "Finalizado" ? "default" :
                "destructive"
              }
              className="text-sm"
            >
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Descripción</h3>
              <p className="text-sm">{project.description}</p>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Fechas</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Inicio:</span> {formatDate(project.startDate)}</p>
                  {project.endDate && (
                    <p><span className="font-medium">Fin:</span> {formatDate(project.endDate)}</p>
                  )}
                </div>
              </div>
              
              {project.notes && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Notas</h3>
                  <p className="text-sm">{project.notes}</p>
                </div>
              )}
            </div>
            
            <div>
              {renderPaymentPlan()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Pagos</CardTitle>
                <CardDescription>
                  Seguimiento de pagos del proyecto
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <AddPaymentDialog
                  projectId={project.id}
                  clientId={client.id}
                  open={paymentDialogOpen}
                  onOpenChange={setPaymentDialogOpen}
                >
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Pago
                  </Button>
                </AddPaymentDialog>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Generar Cuotas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ProjectPayments projectId={project.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Documentos</CardTitle>
                <CardDescription>
                  Documentos del proyecto
                </CardDescription>
              </div>
              <AddDocumentDialog 
                projectId={project.id}
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
                documents={project.documents || []} 
                entityType="project"
                entityId={project.id}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
