
import { supabase } from '@/integrations/supabase/client';
import { Project, Document, ProjectStatus, DocumentType } from '@/types/clients';
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
    id: project.id,
    clientId: project.clientid,
    name: project.name,
    description: project.description,
    startDate: new Date(project.startdate),
    endDate: project.enddate ? new Date(project.enddate) : undefined,
    status: project.status as ProjectStatus,
    notes: project.notes || undefined,
    clientName: project.clients?.name || "Cliente Desconocido",
    documents: [],
    payments: [],
    paymentPlan: {
      id: 0, // Default placeholder
      projectId: project.id,
      type: "Fee único" // Default placeholder
    }
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

  const documents = (data.documents || []).map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type as DocumentType,
    url: doc.url,
    uploadDate: new Date(doc.uploaddate)
  }));

  return {
    id: data.id,
    clientId: data.clientid,
    name: data.name,
    description: data.description,
    startDate: new Date(data.startdate),
    endDate: data.enddate ? new Date(data.enddate) : undefined,
    status: data.status as ProjectStatus,
    notes: data.notes || undefined,
    documents,
    payments: [],
    paymentPlan: {
      id: 0, // Default placeholder
      projectId: data.id,
      type: "Fee único" // Default placeholder
    }
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
    id: project.id,
    clientId: project.clientid,
    name: project.name,
    description: project.description,
    startDate: new Date(project.startdate),
    endDate: project.enddate ? new Date(project.enddate) : undefined,
    status: project.status as ProjectStatus,
    notes: project.notes || undefined,
    documents: [],
    payments: [],
    paymentPlan: {
      id: 0, // Default placeholder
      projectId: project.id,
      type: "Fee único" // Default placeholder
    }
  }));
}

export async function addProject(project: Omit<Project, 'id' | 'documents' | 'payments' | 'paymentPlan'>): Promise<Project> {
  try {
    // Ensure numeric values are properly parsed
    const payload = {
      clientid: project.clientId,
      name: project.name,
      description: project.description,
      startdate: project.startDate.toISOString().split('T')[0],
      enddate: project.endDate ? project.endDate.toISOString().split('T')[0] : null,
      status: project.status,
      notes: project.notes
    };
    
    console.log("Sending project data to Supabase:", payload);
    
    const { data, error } = await supabase
      .from('projects')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error adding project:', error);
      throw new Error(`Error al agregar proyecto: ${error.message}`);
    }

    if (!data) {
      throw new Error('No se recibieron datos del servidor al crear el proyecto');
    }

    return {
      id: data.id,
      clientId: data.clientid,
      name: data.name,
      description: data.description,
      startDate: new Date(data.startdate),
      endDate: data.enddate ? new Date(data.enddate) : undefined,
      status: data.status as ProjectStatus,
      notes: data.notes || undefined,
      documents: [],
      payments: [],
      paymentPlan: {
        id: 0, // Default placeholder
        projectId: data.id,
        type: "Fee único" // Default placeholder
      }
    };
  } catch (error: any) {
    console.error('Error in addProject:', error);
    throw new Error(error.message || 'Error al guardar el proyecto');
  }
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

export async function deleteProject(id: number): Promise<void> {
  const { error: docsError } = await supabase
    .from('documents')
    .delete()
    .eq('projectid', id);
  
  if (docsError) {
    console.error('Error deleting project documents:', docsError);
    throw docsError;
  }
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
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
    id: data.id,
    name: data.name,
    type: data.type as DocumentType,
    url: data.url,
    uploadDate: new Date(data.uploaddate)
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
