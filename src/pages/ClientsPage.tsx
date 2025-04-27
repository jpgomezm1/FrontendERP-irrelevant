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
import { Plus, Users, Briefcase, ChartBar, CheckCircle2 } from "lucide-react";

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
      icon: <CheckCircle2 className="h-4 w-4 text-green-400" />
    });
    setClientDialogOpen(false);
  };

  const handleProjectAdded = () => {
    toast({
      title: "Proyecto registrado",
      description: "El proyecto ha sido registrado correctamente",
      icon: <CheckCircle2 className="h-4 w-4 text-green-400" />
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
    <div className="space-y-6 bg-[#0d0a25]/60 min-h-screen p-6">
      <PageHeader
        title="Clientes y Proyectos"
        description="Gestiona tus clientes, proyectos y seguimiento financiero"
        icon={<Users className="h-6 w-6 text-purple-400" />}
        className="text-white"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList className="bg-[#1e1756]/20 border border-purple-800/20">
            <TabsTrigger 
              value="clientes" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-200 flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger 
              value="proyectos"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-200 flex items-center gap-2"
            >
              <Briefcase className="h-4 w-4" />
              Proyectos
            </TabsTrigger>
            <TabsTrigger 
              value="financiero"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-200 flex items-center gap-2"
            >
              <ChartBar className="h-4 w-4" />
              Financiero
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 w-full md:w-auto">
            <AddClientDialog 
              open={clientDialogOpen} 
              onOpenChange={setClientDialogOpen} 
              onClientAdded={handleClientAdded}
            >
              <Button className="bg-purple-600 hover:bg-purple-700 text-white flex-1 md:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </AddClientDialog>

            <AddProjectDialog 
              open={projectDialogOpen} 
              onOpenChange={setProjectDialogOpen} 
              onProjectAdded={handleProjectAdded}
            >
              <Button className="bg-purple-600 hover:bg-purple-700 text-white flex-1 md:flex-none">
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