
import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useProjectsData } from "@/hooks/use-projects-data";
import { Project } from "@/types/clients";

interface ProjectsListProps {
  clientId?: number;
  onProjectSelect: (projectId: number) => void;
}

export function ProjectsList({ clientId, onProjectSelect }: ProjectsListProps) {
  const { projects, isLoading, error, getProjectsByClientIdQuery } = useProjectsData();
  
  // If clientId is provided, fetch projects for specific client
  const { data: clientProjects = [], isLoading: isLoadingClientProjects } = 
    clientId ? getProjectsByClientIdQuery(clientId) : { data: projects, isLoading: isLoading };
  
  const displayedProjects = clientId ? clientProjects : projects;
  const isLoadingData = clientId ? isLoadingClientProjects : isLoading;

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !displayedProjects) {
    return <div>Error al cargar los proyectos</div>;
  }

  if (displayedProjects.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">No hay proyectos registrados</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayedProjects.map((project) => (
        <Card 
          key={project.id}
          className="cursor-pointer hover:border-primary transition-all"
          onClick={() => onProjectSelect(project.id)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium truncate mr-2">{project.name}</h3>
              <Badge 
                variant={
                  project.status === "Activo" ? "success" : 
                  project.status === "Pausado" ? "warning" : 
                  project.status === "Finalizado" ? "default" :
                  "destructive"
                }
                className="whitespace-nowrap ml-auto"
              >
                {project.status}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground mb-3">
              {project.clientName || "Cliente Desconocido"}
            </div>
            
            <div className="text-sm line-clamp-2 mb-3">
              {project.description}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-muted-foreground">Inicio</div>
                <div>{formatDate(project.startDate)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Valor Total</div>
                <div className="font-semibold">
                  {project.totalValue > 0 
                    ? formatCurrency(project.totalValue, "COP") 
                    : "-"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
