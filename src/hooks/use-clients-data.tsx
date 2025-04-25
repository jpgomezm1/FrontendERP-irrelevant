
import { useState, useEffect } from 'react';
import { Client } from '@/types/clients';
import { getClients, getClientById, addClient, updateClient, addDocument, removeDocument } from '@/services/clientService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useClientsData() {
  const queryClient = useQueryClient();
  
  // Fetch all clients
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  
  // Get a single client by ID
  const fetchClientById = async (id: number) => {
    return await getClientById(id);
  };
  
  // Add a new client
  const addClientMutation = useMutation({
    mutationFn: addClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente agregado exitosamente');
    },
    onError: (error) => {
      console.error('Error adding client:', error);
      toast.error('Error al agregar cliente');
    },
  });
  
  // Update an existing client
  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Client> }) => 
      updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      toast.success('Cliente actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating client:', error);
      toast.error('Error al actualizar cliente');
    },
  });
  
  // Add a document to a client
  const addDocumentMutation = useMutation({
    mutationFn: ({ clientId, document }: { 
      clientId: number; 
      document: Omit<Client["documents"][0], "id">; 
    }) => addDocument(clientId, document),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      toast.success('Documento agregado exitosamente');
    },
    onError: (error) => {
      console.error('Error adding document:', error);
      toast.error('Error al agregar documento');
    },
  });
  
  // Remove a document from a client
  const removeDocumentMutation = useMutation({
    mutationFn: ({ clientId, documentId }: { clientId: number; documentId: number }) => 
      removeDocument(documentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      toast.success('Documento eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error removing document:', error);
      toast.error('Error al eliminar documento');
    },
  });
  
  return {
    clients,
    isLoading,
    error,
    getClientById: fetchClientById,
    addClient: (client: Omit<Client, "id" | "documents">) => addClientMutation.mutate(client),
    updateClient: (id: number, data: Partial<Client>) => updateClientMutation.mutate({ id, data }),
    addDocument: (clientId: number, document: Omit<Client["documents"][0], "id">) => 
      addDocumentMutation.mutate({ clientId, document }),
    removeDocument: (clientId: number, documentId: number) => 
      removeDocumentMutation.mutate({ clientId, documentId }),
  };
}
