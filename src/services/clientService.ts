
import { supabase } from '@/lib/supabase';
import { Client, Document } from '@/types/clients';

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*');

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }

  // Convert string dates to Date objects
  return (data || []).map(client => ({
    ...client,
    startDate: new Date(client.startDate),
    documents: client.documents || [],
  }));
}

export async function getClientById(id: number): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*, documents(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    throw error;
  }

  if (!data) return null;

  // Convert string dates to Date objects
  return {
    ...data,
    startDate: new Date(data.startDate),
    documents: (data.documents || []).map((doc: any) => ({
      ...doc,
      uploadDate: new Date(doc.uploadDate)
    })),
  };
}

export async function addClient(client: Omit<Client, 'id' | 'documents'>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert([
      { 
        ...client,
        startDate: client.startDate?.toISOString().split('T')[0]
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding client:', error);
    throw error;
  }

  return {
    ...data,
    startDate: new Date(data.startDate),
    documents: [],
  };
}

export async function updateClient(id: number, updatedData: Partial<Client>): Promise<void> {
  // Handle date conversion for DB
  const payload = { ...updatedData };
  if (payload.startDate && payload.startDate instanceof Date) {
    payload.startDate = payload.startDate.toISOString().split('T')[0];
  }
  
  const { error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }
}

export async function addDocument(clientId: number, document: Omit<Document, 'id'>): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .insert([
      { 
        ...document,
        clientId,
        uploadDate: new Date(document.uploadDate || new Date()).toISOString().split('T')[0]
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding document:', error);
    throw error;
  }

  return {
    ...data,
    uploadDate: new Date(data.uploadDate)
  };
}

export async function removeDocument(documentId: number): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) {
    console.error('Error removing document:', error);
    throw error;
  }
}
