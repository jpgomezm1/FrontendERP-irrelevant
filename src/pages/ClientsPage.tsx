
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClientsList } from "@/components/clients/clients-list";
import { ProjectsList } from "@/components/clients/projects-list";
import { ClientDetails } from "@/components/clients/client-details";
import { ProjectDetails } from "@/components/clients/project-details";
import { FinancialOverview } from "@/components/clients/financial-overview";
import { AddClientDialog } from "@/components/clients/add-client-dialog";
import { AddProjectDialog } from "@/components/clients/add-project-dialog";
import { Plus } from "lucide-react";

const ClientsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("clientes");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [viewFinancials, setViewFinancials] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  const handleClientAdded = () => {
    toast({
      title: "Cliente registrado",
      description: "El cliente ha sido registrado correctamente",
    });
    setClientDialogOpen(false);
  };

  const handleProjectAdded = () => {
    toast({
      title: "Proyecto registrado",
      description: "El proyecto ha sido registrado correctamente",
    });
    setProjectDialogOpen(false);
  };

  const handleClientSelect = (clientId: number) => {
    setSelectedClientId(clientId);
    setSelectedProjectId(null);
    setViewFinancials(false);
  };

  const handleProjectSelect = (projectId: number) => {
    setSelectedProjectId(projectId);
    setViewFinancials(false);
    setActiveTab("proyectos");
  };

  const handleBackToList = () => {
    setSelectedClientId(null);
    setSelectedProjectId(null);
    setViewFinancials(false);
  };

  const handleViewFinancials = () => {
    setViewFinancials(true);
    setActiveTab("financiero");
  };

  return (
    <div>
      <PageHeader
        title="Clientes y Proyectos"
        description="Gestiona tus clientes, proyectos y seguimiento financiero"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
            <TabsTrigger value="financiero">Financiero</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <AddClientDialog 
              open={clientDialogOpen} 
              onOpenChange={setClientDialogOpen} 
              onClientAdded={handleClientAdded}
            >
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </AddClientDialog>

            <AddProjectDialog 
              open={projectDialogOpen} 
              onOpenChange={setProjectDialogOpen} 
              onProjectAdded={handleProjectAdded}
            >
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </AddProjectDialog>
          </div>
        </div>
        
        {/* Contenido de la tab de clientes */}
        <TabsContent value="clientes">
          {selectedClientId ? (
            <ClientDetails 
              clientId={selectedClientId} 
              onBack={handleBackToList}
              onViewFinancials={handleViewFinancials}
              onProjectSelect={handleProjectSelect}
            />
          ) : (
            <ClientsList onClientSelect={handleClientSelect} />
          )}
        </TabsContent>
        
        {/* Contenido de la tab de proyectos */}
        <TabsContent value="proyectos">
          {selectedProjectId ? (
            <ProjectDetails 
              projectId={selectedProjectId} 
              onBack={handleBackToList}
              onViewFinancials={handleViewFinancials}
              onClientSelect={handleClientSelect}
            />
          ) : (
            <ProjectsList onProjectSelect={handleProjectSelect} />
          )}
        </TabsContent>

        {/* Contenido de la tab financiera */}
        <TabsContent value="financiero">
          <FinancialOverview 
            clientId={selectedClientId} 
            projectId={selectedProjectId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientsPage;
