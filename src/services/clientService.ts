
import { supabase } from '@/integrations/supabase/client';
import { Client, Document } from '@/types/clients';
import { Database } from '@/integrations/supabase/types';

type DbClient = Database['public']['Tables']['clients']['Row'];
type DbDocument = Database['public']['Tables']['documents']['Row'];

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
    startDate: new Date(client.startdate),
    documents: [],
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
    startDate: new Date(data.startdate),
    documents: (data.documents || []).map((doc: DbDocument) => ({
      ...doc,
      uploadDate: new Date(doc.uploaddate)
    })),
  };
}

export async function addClient(client: Omit<Client, 'id' | 'documents'>): Promise<Client> {
  const clientToInsert = {
    name: client.name,
    contactname: client.contactName,
    email: client.email,
    phone: client.phone,
    address: client.address,
    taxid: client.taxId,
    startdate: client.startDate.toISOString().split('T')[0],
    status: client.status,
    notes: client.notes
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

  return {
    ...data,
    startDate: new Date(data.startdate),
    documents: [],
    contactName: data.contactname,
    taxId: data.taxid
  };
}

export async function updateClient(id: number, updatedData: Partial<Client>): Promise<void> {
  const payload: Partial<DbClient> = {
    name: updatedData.name,
    contactname: updatedData.contactName,
    email: updatedData.email,
    phone: updatedData.phone,
    address: updatedData.address,
    taxid: updatedData.taxId,
    status: updatedData.status,
    notes: updatedData.notes
  };
  
  if (updatedData.startDate) {
    payload.startdate = updatedData.startDate.toISOString().split('T')[0];
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
  const documentToInsert = {
    name: document.name,
    type: document.type,
    url: document.url,
    uploaddate: document.uploadDate.toISOString().split('T')[0],
    clientid: clientId
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

  return {
    ...data,
    uploadDate: new Date(data.uploaddate),
    clientId: data.clientid
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
