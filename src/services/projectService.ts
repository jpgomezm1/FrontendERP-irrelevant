
import { supabase } from '@/lib/supabase';
import { Project, Document } from '@/types/clients';

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (name)
    `);

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  // Transform data to match our client structure and convert dates
  return (data || []).map(project => ({
    ...project,
    startDate: new Date(project.startDate),
    endDate: project.endDate ? new Date(project.endDate) : undefined,
    clientName: project.clients?.name || "Cliente Desconocido",
    documents: project.documents || [],
    payments: project.payments || []
  }));
}

export async function getProjectById(id: number): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (name),
      documents (*),
      payments (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    throw error;
  }

  // Transform data to match our expected structure
  if (data) {
    return {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      clientName: data.clients?.name || "Cliente Desconocido",
      documents: (data.documents || []).map((doc: any) => ({
        ...doc,
        uploadDate: new Date(doc.uploadDate)
      })),
      payments: (data.payments || []).map((payment: any) => ({
        ...payment,
        date: new Date(payment.date),
        paidDate: payment.paidDate ? new Date(payment.paidDate) : undefined
      }))
    };
  }

  return null;
}

export async function getProjectsByClientId(clientId: number): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (name)
    `)
    .eq('clientId', clientId);

  if (error) {
    console.error('Error fetching projects by client ID:', error);
    throw error;
  }

  // Transform data to match our expected structure
  return (data || []).map(project => ({
    ...project,
    startDate: new Date(project.startDate),
    endDate: project.endDate ? new Date(project.endDate) : undefined,
    clientName: project.clients?.name || "Cliente Desconocido",
    documents: project.documents || [],
    payments: project.payments || []
  }));
}

export async function addProject(project: Omit<Project, 'id' | 'documents' | 'payments'>): Promise<Project> {
  // Handle date conversion for DB
  const payload = {
    ...project,
    startDate: project.startDate?.toISOString().split('T')[0],
    endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : null,
  };
  
  const { data, error } = await supabase
    .from('projects')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error adding project:', error);
    throw error;
  }

  return {
    ...data,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    documents: [],
    payments: [],
    clientName: "", // Will be populated when fetched
  };
}

export async function updateProject(id: number, updatedData: Partial<Project>): Promise<void> {
  // Handle date conversion for DB
  const payload = { ...updatedData };
  if (payload.startDate && payload.startDate instanceof Date) {
    payload.startDate = payload.startDate.toISOString().split('T')[0];
  }
  if (payload.endDate && payload.endDate instanceof Date) {
    payload.endDate = payload.endDate.toISOString().split('T')[0];
  }
  
  const { error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function addProjectDocument(projectId: number, document: Omit<Document, 'id'>): Promise<Document> {
  const { data, error } = await supabase
    .from('project_documents')
    .insert([
      { 
        ...document,
        projectId,
        uploadDate: document.uploadDate?.toISOString().split('T')[0] 
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding project document:', error);
    throw error;
  }

  return {
    ...data,
    uploadDate: new Date(data.uploadDate)
  };
}

export async function removeProjectDocument(documentId: number): Promise<void> {
  const { error } = await supabase
    .from('project_documents')
    .delete()
    .eq('id', documentId);

  if (error) {
    console.error('Error removing project document:', error);
    throw error;
  }
}
