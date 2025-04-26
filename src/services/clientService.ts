import { supabase } from '@/integrations/supabase/client';
import { Client, Document, ClientStatus, DocumentType } from '@/types/clients';
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

  console.log('Raw clients data:', data); // Debug log

  // Robust mapping with error handling
  return (data || []).map(client => {
    try {
      return {
        id: client.id,
        name: client.name || 'Sin Nombre',
        contactName: client.contactname || undefined,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || undefined,
        taxId: client.taxid || undefined,
        startDate: client.startdate ? new Date(client.startdate) : new Date(),
        status: (client.status || 'Activo') as ClientStatus,
        notes: client.notes || undefined,
        documents: [],
      };
    } catch (mapError) {
      console.error('Error mapping client:', mapError, client);
      return null;
    }
  }).filter(Boolean) as Client[];
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

  // Convert string dates to Date objects and map to Document type
  const documents = (data.documents || []).map((doc: DbDocument) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type as DocumentType,
    url: doc.url,
    uploadDate: new Date(doc.uploaddate)
  }));

  // Map database fields to Client type
  return {
    id: data.id,
    name: data.name,
    contactName: data.contactname || undefined,
    email: data.email,
    phone: data.phone,
    address: data.address || undefined,
    taxId: data.taxid || undefined,
    startDate: new Date(data.startdate),
    status: data.status as ClientStatus,
    notes: data.notes || undefined,
    documents
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

  // Map database response to Client type
  return {
    id: data.id,
    name: data.name,
    contactName: data.contactname || undefined,
    email: data.email,
    phone: data.phone,
    address: data.address || undefined,
    taxId: data.taxid || undefined,
    startDate: new Date(data.startdate),
    status: data.status as ClientStatus,
    notes: data.notes || undefined,
    documents: [],
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

  // Map database response to Document type
  return {
    id: data.id,
    name: data.name,
    type: data.type as DocumentType,
    url: data.url,
    uploadDate: new Date(data.uploaddate)
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
