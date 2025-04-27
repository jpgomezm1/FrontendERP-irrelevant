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
  onClientSelect?: (clientId: number) => void;
}

export function ProjectDetails({ 
  projectId, 
  onBack,
  onViewFinancials,
  onClientSelect
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
          <h3 className="font-medium mb-2 text-white">Tipo de Plan</h3>
          <Badge variant="outline" className="text-sm bg-purple-900/30 text-purple-300 border-purple-800/30">
            {plan.type}
          </Badge>
        </div>
        
        {plan.implementationFee && (
          <div>
            <h3 className="font-medium mb-2 text-white">Fee de Implementación</h3>
            <div className="bg-[#0f0b2a]/50 p-4 rounded-lg space-y-2 border border-purple-800/30">
              <p className="text-sm text-slate-300">
                <span className="font-medium text-white">Valor Total:</span> {" "}
                {formatCurrency(plan.implementationFee.total, plan.implementationFee.currency)}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-medium text-white">Forma de Pago:</span> {" "}
                {plan.implementationFee.installments === 1
                  ? "Pago único"
                  : `${plan.implementationFee.installments} cuotas`}
              </p>
            </div>
          </div>
        )}
        
        {plan.recurringFee && (
          <div>
            <h3 className="font-medium mb-2 text-white">Fee Recurrente</h3>
            <div className="bg-[#0f0b2a]/50 p-4 rounded-lg space-y-2 border border-purple-800/30">
              <p className="text-sm text-slate-300">
                <span className="font-medium text-white">Valor:</span> {" "}
                {formatCurrency(plan.recurringFee.amount, plan.recurringFee.currency)}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-medium text-white">Frecuencia:</span> {" "}
                {plan.recurringFee.frequency}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-medium text-white">Día de Cobro:</span> {" "}
                {plan.recurringFee.dayOfCharge}
              </p>
              
              {plan.recurringFee.gracePeriods && plan.recurringFee.gracePeriods > 0 && (
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-white">Periodo de Gracia:</span> {" "}
                  {plan.recurringFee.gracePeriods} {plan.recurringFee.gracePeriods === 1 ? "periodo" : "periodos"}
                </p>
              )}
              
              {plan.recurringFee.discountPeriods && plan.recurringFee.discountPeriods > 0 && (
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-white">Descuento:</span> {" "}
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
      <Card className="bg-[#1e1756] border-purple-800/30 text-white">
        <CardContent className="pt-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
        </CardContent>
      </Card>
    );
  }

  if (hasError || !project || !client) {
    return (
      <Card className="bg-[#1e1756] border-purple-800/30 text-white">
        <CardContent className="pt-6">
          <p>Error al cargar los datos del proyecto</p>
          <Button onClick={onBack} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">Volver</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-purple-900/30">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>
        <div className="flex gap-2">
          <EditProjectDialog
            project={project}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          >
            <Button variant="outline" className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]">
              <Edit className="mr-2 h-4 w-4" />
              Editar Proyecto
            </Button>
          </EditProjectDialog>
          <Button variant="default" onClick={onViewFinancials} className="bg-purple-600 hover:bg-purple-700 text-white">
            <CreditCard className="mr-2 h-4 w-4" />
            Ver Finanzas
          </Button>
          <Button 
            variant="outline" 
            className="border-red-800/50 text-red-400 hover:bg-red-900/10"
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

      <Card className="bg-[#1e1756] border-purple-800/30 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-300 mb-1">
                {onClientSelect ? (
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-purple-300 hover:text-purple-100"
                    onClick={() => onClientSelect(client.id)}
                  >
                    Cliente: {client.name}
                  </Button>
                ) : (
                  <>Cliente: {client.name}</>
                )}
              </div>
              <CardTitle className="text-2xl text-white">{project.name}</CardTitle>
              <CardDescription className="text-slate-300">
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
              <h3 className="font-medium mb-2 text-white">Descripción</h3>
              <p className="text-sm text-slate-300">{project.description}</p>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2 text-white">Fechas</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><span className="font-medium text-white">Inicio:</span> {formatDate(project.startDate)}</p>
                  {project.endDate && (
                    <p><span className="font-medium text-white">Fin:</span> {formatDate(project.endDate)}</p>
                  )}
                </div>
              </div>
              
              {project.notes && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2 text-white">Notas</h3>
                  <p className="text-sm text-slate-300">{project.notes}</p>
                </div>
              )}
            </div>
            
            <div>
              {renderPaymentPlan()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payments" className="text-white">
        <TabsList className="bg-[#0f0b2a] border border-purple-800/30">
          <TabsTrigger value="payments" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white">Pagos</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-purple-800/50 data-[state=active]:text-white">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card className="bg-[#1e1756] border-purple-800/30 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-white">Pagos</CardTitle>
                <CardDescription className="text-slate-300">
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
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Pago
                  </Button>
                </AddPaymentDialog>
              </div>
            </CardHeader>
            <CardContent>
              <ProjectPayments projectId={project.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card className="bg-[#1e1756] border-purple-800/30 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-white">Documentos</CardTitle>
                <CardDescription className="text-slate-300">
                  Documentos del proyecto
                </CardDescription>
              </div>
              <AddDocumentDialog 
                projectId={project.id}
                open={documentDialogOpen}
                onOpenChange={setDocumentDialogOpen}
              >
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
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