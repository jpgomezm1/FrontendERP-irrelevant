
import { useState, useEffect } from 'react';
import { Project, Document } from '@/types/clients';
import { getProjects, getProjectById, getProjectsByClientId, addProject, updateProject, addProjectDocument, removeProjectDocument, deleteProject } from '@/services/projectService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useProjectsData() {
  const queryClient = useQueryClient();
  
  // Fetch all projects
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });
  
  // Use effect to handle errors
  useEffect(() => {
    if (error) {
      console.error('Error fetching projects:', error);
      toast.error('No se pudieron cargar los proyectos', {
        description: 'Verifique su conexión o intente nuevamente'
      });
    }
  }, [error]);
  
  // Get a project by ID
  const getProjectByIdQuery = (id: number | undefined) => {
    return useQuery({
      queryKey: ['project', id],
      queryFn: () => id ? getProjectById(id) : Promise.resolve(null),
      enabled: !!id, // Only run the query if id is provided
    });
  };
  
  // Get projects by client ID
  const getProjectsByClientIdQuery = (clientId: number | undefined) => {
    return useQuery({
      queryKey: ['projects', clientId],
      queryFn: () => clientId ? getProjectsByClientId(clientId) : Promise.resolve([]),
      enabled: !!clientId, // Only run the query if clientId is provided
    });
  };
  
  // Add a new project
  const addProjectMutation = useMutation({
    mutationFn: addProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto agregado exitosamente');
    },
    onError: (error) => {
      console.error('Error adding project:', error);
      toast.error('Error al agregar proyecto');
    },
  });
  
  // Update an existing project
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) => 
      updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      toast.success('Proyecto actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error('Error al actualizar proyecto');
    },
  });
  
  // Delete project
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error('Error al eliminar proyecto');
    },
  });
  
  // Add a document to a project
  const addDocumentMutation = useMutation({
    mutationFn: ({ projectId, document }: { 
      projectId: number; 
      document: Omit<Document, "id">; 
    }) => addProjectDocument(projectId, document),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      toast.success('Documento agregado exitosamente');
    },
    onError: (error) => {
      console.error('Error adding document:', error);
      toast.error('Error al agregar documento');
    },
  });
  
  // Remove a document from a project
  const removeDocumentMutation = useMutation({
    mutationFn: ({ documentId }: { documentId: number }) => 
      removeProjectDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Documento eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error removing document:', error);
      toast.error('Error al eliminar documento');
    },
  });

  return {
    projects,
    isLoading,
    error,
    getProjectByIdQuery,
    getProjectsByClientIdQuery,
    addProject: (project: Omit<Project, "id" | "documents" | "payments" | "paymentPlan">) => 
      addProjectMutation.mutateAsync(project),
    updateProject: (id: number, data: Partial<Project>) => 
      updateProjectMutation.mutate({ id, data }),
    deleteProject: (id: number) => deleteProjectMutation.mutateAsync(id),
    addDocument: (projectId: number, document: Omit<Document, "id">) => 
      addDocumentMutation.mutate({ projectId, document }),
    removeDocument: (projectId: number, documentId: number) => 
      removeDocumentMutation.mutate({ documentId }),
  };
}
