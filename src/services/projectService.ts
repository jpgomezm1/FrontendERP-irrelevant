import { supabase } from '@/integrations/supabase/client';
import { Project, Document } from '@/types/clients';
import { Database } from '@/integrations/supabase/types';

type DbProject = Database['public']['Tables']['projects']['Row'];

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

  return (data || []).map(project => ({
    ...project,
    clientId: project.clientid,
    startDate: new Date(project.startdate),
    endDate: project.enddate ? new Date(project.enddate) : undefined,
    clientName: project.clients?.name || "Cliente Desconocido",
    documents: []
  }));
}

export async function getProjectById(id: number): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      documents(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    clientId: data.clientid,
    startDate: new Date(data.startdate),
    endDate: data.enddate ? new Date(data.enddate) : undefined,
    documents: (data.documents || []).map((doc: any) => ({
      ...doc,
      uploadDate: new Date(doc.uploaddate)
    })),
  };
}

export async function getProjectsByClientId(clientId: number): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('clientid', clientId);

  if (error) {
    console.error('Error fetching projects by client ID:', error);
    throw error;
  }

  return (data || []).map(project => ({
    ...project,
    clientId: project.clientid,
    startDate: new Date(project.startdate),
    endDate: project.enddate ? new Date(project.enddate) : undefined,
  }));
}

export async function addProject(project: Omit<Project, 'id' | 'documents'>): Promise<Project> {
  const payload = {
    clientid: project.clientId,
    name: project.name,
    description: project.description,
    startdate: project.startDate.toISOString().split('T')[0],
    enddate: project.endDate ? project.endDate.toISOString().split('T')[0] : null,
    status: project.status,
    notes: project.notes
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
    clientId: data.clientid,
    startDate: new Date(data.startdate),
    endDate: data.enddate ? new Date(data.enddate) : undefined,
    documents: [],
  };
}

export async function updateProject(id: number, updatedData: Partial<Project>): Promise<void> {
  const payload: Partial<DbProject> = {
    clientid: updatedData.clientId,
    name: updatedData.name,
    description: updatedData.description,
    status: updatedData.status,
    notes: updatedData.notes
  };
  
  if (updatedData.startDate) {
    payload.startdate = updatedData.startDate.toISOString().split('T')[0];
  }
  
  if (updatedData.endDate) {
    payload.enddate = updatedData.endDate.toISOString().split('T')[0];
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

export async function addProjectDocument(
  projectId: number, 
  document: Omit<Document, 'id'>
): Promise<Document> {
  const documentToInsert = {
    name: document.name,
    type: document.type,
    url: document.url,
    uploaddate: document.uploadDate.toISOString().split('T')[0],
    projectid: projectId
  };

  const { data, error } = await supabase
    .from('documents')
    .insert([documentToInsert])
    .select()
    .single();

  if (error) {
    console.error('Error adding project document:', error);
    throw error;
  }

  return {
    ...data,
    uploadDate: new Date(data.uploaddate),
    projectId: data.projectid
  };
}

export async function removeProjectDocument(documentId: number): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) {
    console.error('Error removing project document:', error);
    throw error;
  }
}
