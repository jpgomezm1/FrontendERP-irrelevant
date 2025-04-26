
import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency, calculateAccountStatus, AccountStatus } from "@/lib/utils";
import { useProjectsData } from "@/hooks/use-projects-data";
import { usePaymentsData } from "@/hooks/use-payments-data";
import { Project } from "@/types/clients";
import { Check, AlertTriangle, AlertOctagon } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface ProjectsListProps {
  clientId?: number;
  onProjectSelect: (projectId: number) => void;
}

export function ProjectsList({ clientId, onProjectSelect }: ProjectsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { projects, isLoading, error, getProjectsByClientIdQuery } = useProjectsData();
  const { getPaymentsByProjectIdQuery } = usePaymentsData();
  
  // If clientId is provided, fetch projects for specific client
  const { data: clientProjects = [], isLoading: isLoadingClientProjects } = 
    clientId ? getProjectsByClientIdQuery(clientId) : { data: projects, isLoading: isLoading };
  
  const displayedProjects = clientId ? clientProjects : projects;
  const isLoadingData = clientId ? isLoadingClientProjects : isLoading;

  // Get payments for each project and calculate account status
  const projectsWithStatus = useMemo(() => {
    return displayedProjects.map(project => {
      const { data: payments = [] } = getPaymentsByProjectIdQuery(project.id);
      const status = calculateAccountStatus(payments);
      return { ...project, accountStatus: status };
    });
  }, [displayedProjects, getPaymentsByProjectIdQuery]);

  // Filter projects based on account status
  const filteredProjects = useMemo(() => {
    if (statusFilter === "all") return projectsWithStatus;
    return projectsWithStatus.filter(project => project.accountStatus === statusFilter);
  }, [projectsWithStatus, statusFilter]);

  const getStatusIcon = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.UpToDate:
        return <Check className="h-4 w-4" />;
      case AccountStatus.SlightlyOverdue:
        return <AlertTriangle className="h-4 w-4" />;
      case AccountStatus.SeriouslyOverdue:
        return <AlertOctagon className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    const variant = status === AccountStatus.UpToDate ? "success" :
                   status === AccountStatus.SlightlyOverdue ? "warning" : "destructive";
    return (
      <Badge variant={variant} className="flex gap-1 items-center">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

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
    <div className="space-y-4">
      <div className="w-[200px]">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value={AccountStatus.UpToDate}>Al día</SelectItem>
            <SelectItem value={AccountStatus.SlightlyOverdue}>Levemente vencido</SelectItem>
            <SelectItem value={AccountStatus.SeriouslyOverdue}>Seriamente vencido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
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

              <div className="mt-3 pt-3 border-t">
                <div className="text-muted-foreground text-sm mb-1">Estado de Cuenta</div>
                {getStatusBadge(project.accountStatus)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
