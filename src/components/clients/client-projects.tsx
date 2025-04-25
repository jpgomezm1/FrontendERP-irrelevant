
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProjectsData } from "@/hooks/use-projects-data";
import { useClientsData } from "@/hooks/use-clients-data";
import { ProjectsList } from "./projects-list";
import { AddProjectDialog } from "./add-project-dialog";

interface ClientProjectsProps {
  clientId: number;
}

export function ClientProjects({ clientId }: ClientProjectsProps) {
  const { getClientByIdQuery } = useClientsData();
  const { data: client } = getClientByIdQuery(clientId);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Proyectos del Cliente</CardTitle>
          <CardDescription>
            Proyectos asociados a {client?.name || "este cliente"}
          </CardDescription>
        </div>
        <AddProjectDialog 
          open={projectDialogOpen}
          onOpenChange={setProjectDialogOpen}
          defaultClientId={clientId}
        >
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </AddProjectDialog>
      </CardHeader>
      <CardContent>
        <ProjectsList 
          clientId={clientId}
          onProjectSelect={() => {}} // Aquí podrías manejar la navegación a detalles del proyecto
        />
      </CardContent>
    </Card>
  );
}
