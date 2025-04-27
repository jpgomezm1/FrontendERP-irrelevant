import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useProjectsData } from "@/hooks/use-projects-data";
import { Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DeleteProjectDialogProps {
  projectId: number;
  projectName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteProjectDialog({
  projectId,
  projectName,
  isOpen,
  onOpenChange,
  onDeleted,
}: DeleteProjectDialogProps) {
  const { deleteProject } = useProjectsData();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProject(projectId);
      
      toast({
        title: "Proyecto eliminado",
        description: `El proyecto "${projectName}" ha sido eliminado correctamente.`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-400" />
      });
      
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto. Intente nuevamente.",
        variant: "destructive",
        icon: <AlertTriangle className="h-4 w-4 text-red-400" />
      });
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1e1756] border-purple-800/30 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
            ¿Eliminar proyecto?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            ¿Está seguro que desea eliminar el proyecto <strong className="text-white">{projectName}</strong>? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isDeleting}
            className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Eliminando...
              </span>
            ) : (
              <span className="flex items-center">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}