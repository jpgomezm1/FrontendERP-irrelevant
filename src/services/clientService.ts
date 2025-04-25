
import { supabase } from '@/integrations/supabase/client';
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
  // Ensure we send a string date to the database
  const clientToInsert = {
    ...client,
    startDate: client.startDate instanceof Date ? 
      client.startDate.toISOString().split('T')[0] : 
      new Date(client.startDate).toISOString().split('T')[0]
  };

  const { data, error } = await supabase
    .from('clients')
    .insert([clientToInsert])
    .select()
    .single();

  if (error) {
    console.error('Error adding client:', error);
    throw error;
  }

  // Return with proper Date object
  return {
    ...data,
    startDate: new Date(data.startDate),
    documents: [],
  };
}

export async function updateClient(id: number, updatedData: Partial<Client>): Promise<void> {
  // Create a new object to avoid modifying the original
  const payload: any = { ...updatedData };
  
  // Convert Date objects to string format for the database
  if (payload.startDate) {
    if (payload.startDate instanceof Date) {
      payload.startDate = payload.startDate.toISOString().split('T')[0];
    } else if (typeof payload.startDate === 'string') {
      // If it's already a string, make sure it's in the right format
      const date = new Date(payload.startDate);
      payload.startDate = date.toISOString().split('T')[0];
    }
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
  // Create the document object with properly formatted date
  const documentToInsert = {
    ...document,
    clientId,
    uploadDate: document.uploadDate instanceof Date ? 
      document.uploadDate.toISOString().split('T')[0] : 
      (document.uploadDate ? 
        new Date(document.uploadDate).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0])
  };

  const { data, error } = await supabase
    .from('documents')
    .insert([documentToInsert])
    .select()
    .single();

  if (error) {
    console.error('Error adding document:', error);
    throw error;
  }

  // Return with proper Date object
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
