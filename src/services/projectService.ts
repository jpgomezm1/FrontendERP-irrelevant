
import { supabase } from '@/integrations/supabase/client';
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

  // Transform data to include client names
  return (data || []).map(project => ({
    ...project,
    clientName: project.clients?.name || "Cliente Desconocido",
    startDate: new Date(project.startDate),
    endDate: project.endDate ? new Date(project.endDate) : undefined,
    documents: project.documents || [],
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

  // Transform and convert dates
  return {
    ...data,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    documents: (data.documents || []).map((doc: any) => ({
      ...doc,
      uploadDate: new Date(doc.uploadDate)
    })),
  };
}

export async function getProjectsByClientId(clientId: number): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('clientId', clientId);

  if (error) {
    console.error('Error fetching projects by client ID:', error);
    throw error;
  }

  return (data || []).map(project => ({
    ...project,
    startDate: new Date(project.startDate),
    endDate: project.endDate ? new Date(project.endDate) : undefined,
  }));
}

export async function addProject(project: Omit<Project, 'id' | 'documents'>): Promise<Project> {
  // Handle date conversion for DB - ensure we're sending strings
  const payload = {
    ...project,
    startDate: project.startDate instanceof Date ? 
      project.startDate.toISOString().split('T')[0] : 
      new Date(project.startDate).toISOString().split('T')[0],
    endDate: project.endDate ? (
      project.endDate instanceof Date ? 
        project.endDate.toISOString().split('T')[0] : 
        new Date(project.endDate).toISOString().split('T')[0]
    ) : null,
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

  // Return with proper Date objects
  return {
    ...data,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    documents: [],
  };
}

export async function updateProject(id: number, updatedData: Partial<Project>): Promise<void> {
  // Create a new object to avoid modifying the original
  const payload: any = { ...updatedData };
  
  // Properly convert dates to strings for the database
  if (payload.startDate) {
    if (payload.startDate instanceof Date) {
      payload.startDate = payload.startDate.toISOString().split('T')[0];
    } else if (typeof payload.startDate === 'string') {
      const date = new Date(payload.startDate);
      payload.startDate = date.toISOString().split('T')[0];
    }
  }
  
  if (payload.endDate) {
    if (payload.endDate instanceof Date) {
      payload.endDate = payload.endDate.toISOString().split('T')[0];
    } else if (typeof payload.endDate === 'string') {
      const date = new Date(payload.endDate);
      payload.endDate = date.toISOString().split('T')[0];
    }
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
  // Ensure proper date handling - convert to string for DB
  const documentToInsert = {
    ...document,
    projectId,
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
    console.error('Error adding project document:', error);
    throw error;
  }

  // Return with proper Date object
  return {
    ...data,
    uploadDate: new Date(data.uploadDate)
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
