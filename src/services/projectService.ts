import { supabase } from '@/integrations/supabase/client';
import { Project, Document, ProjectStatus, DocumentType, PaymentPlan } from '@/types/clients';
import { Database } from '@/integrations/supabase/types';

type DbProject = Database['public']['Tables']['projects']['Row'];

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (name),
      payment_plans (*)
    `);

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  return (data || []).map(project => {
    // Calculate project value based on payment plan
    let projectValue = 0;
    const paymentPlan = project.payment_plans?.[0];
    
    if (paymentPlan) {
      // Add implementation fee to project value if exists
      if (paymentPlan.implementation_fee_total) {
        projectValue += Number(paymentPlan.implementation_fee_total);
      }
      
      // Add 12 months of recurring fee if exists
      if (paymentPlan.recurring_fee_amount) {
        projectValue += Number(paymentPlan.recurring_fee_amount) * 12;
      }
    }

    return {
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
      totalValue: projectValue,
      paymentPlan: processPaymentPlan(project.payment_plans?.[0])
    };
  });
}

export async function getProjectById(id: number): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (name),
      documents(*),
      payment_plans(*)
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

  // Calculate project value based on payment plan
  let projectValue = 0;
  const paymentPlan = data.payment_plans?.[0];
  
  if (paymentPlan) {
    // Add implementation fee to project value if exists
    if (paymentPlan.implementation_fee_total) {
      projectValue += Number(paymentPlan.implementation_fee_total);
    }
    
    // Add 12 months of recurring fee if exists
    if (paymentPlan.recurring_fee_amount) {
      projectValue += Number(paymentPlan.recurring_fee_amount) * 12;
    }
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
    clientName: data.clients?.name || "Cliente Desconocido",
    documents,
    payments: [],
    totalValue: projectValue,
    paymentPlan: processPaymentPlan(data.payment_plans?.[0])
  };
}

export async function getProjectsByClientId(clientId: number): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      payment_plans(*)
    `)
    .eq('clientid', clientId);

  if (error) {
    console.error('Error fetching projects by client ID:', error);
    throw error;
  }

  return (data || []).map(project => {
    // Calculate project value based on payment plan
    let projectValue = 0;
    const paymentPlan = project.payment_plans?.[0];
    
    if (paymentPlan) {
      // Add implementation fee to project value if exists
      if (paymentPlan.implementation_fee_total) {
        projectValue += Number(paymentPlan.implementation_fee_total);
      }
      
      // Add 12 months of recurring fee if exists
      if (paymentPlan.recurring_fee_amount) {
        projectValue += Number(paymentPlan.recurring_fee_amount) * 12;
      }
    }

    return {
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
      totalValue: projectValue,
      paymentPlan: processPaymentPlan(project.payment_plans?.[0])
    };
  });
}

function processPaymentPlan(dbPaymentPlan: any): PaymentPlan {
  if (!dbPaymentPlan) {
    return {
      id: 0,
      projectId: 0,
      type: "Fee único"
    };
  }
  
  const paymentPlan: PaymentPlan = {
    id: dbPaymentPlan.id,
    projectId: dbPaymentPlan.project_id,
    type: dbPaymentPlan.type,
  };

  // Add implementation fee if exists
  if (dbPaymentPlan.implementation_fee_total) {
    paymentPlan.implementationFee = {
      total: Number(dbPaymentPlan.implementation_fee_total),
      currency: dbPaymentPlan.implementation_fee_currency,
      installments: dbPaymentPlan.implementation_fee_installments
    };
  }

  // Add recurring fee if exists
  if (dbPaymentPlan.recurring_fee_amount) {
    paymentPlan.recurringFee = {
      amount: Number(dbPaymentPlan.recurring_fee_amount),
      currency: dbPaymentPlan.recurring_fee_currency,
      frequency: dbPaymentPlan.recurring_fee_frequency,
      dayOfCharge: dbPaymentPlan.recurring_fee_day_of_charge,
    };

    // Add optional fields if they exist
    if (dbPaymentPlan.recurring_fee_grace_periods) {
      paymentPlan.recurringFee.gracePeriods = dbPaymentPlan.recurring_fee_grace_periods;
    }

    if (dbPaymentPlan.recurring_fee_discount_periods) {
      paymentPlan.recurringFee.discountPeriods = dbPaymentPlan.recurring_fee_discount_periods;
      paymentPlan.recurringFee.discountPercentage = dbPaymentPlan.recurring_fee_discount_percentage;
    }
  }

  return paymentPlan;
}

export async function addProject(project: Omit<Project, 'id' | 'documents' | 'payments' | 'paymentPlan' | 'totalValue'>, paymentPlanData?: any): Promise<Project> {
  try {
    // Begin a transaction
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([{
        clientid: project.clientId,
        name: project.name,
        description: project.description,
        startdate: project.startDate.toISOString().split('T')[0],
        enddate: project.endDate ? project.endDate.toISOString().split('T')[0] : null,
        status: project.status,
        notes: project.notes
      }])
      .select()
      .single();

    if (projectError) {
      console.error('Error adding project:', projectError);
      throw new Error(`Error al agregar proyecto: ${projectError.message}`);
    }

    if (!projectData) {
      throw new Error('No se recibieron datos del servidor al crear el proyecto');
    }

    console.log("Project created successfully:", projectData);
    
    // If payment plan data is provided, create the payment plan
    if (paymentPlanData) {
      const paymentPlanPayload = {
        project_id: projectData.id,
        type: paymentPlanData.planType,
      };
      
      // Add implementation fee fields if applicable
      if (['Fee único', 'Fee por cuotas', 'Mixto'].includes(paymentPlanData.planType)) {
        paymentPlanPayload.implementation_fee_total = paymentPlanData.implementationFeeTotal;
        paymentPlanPayload.implementation_fee_currency = paymentPlanData.implementationFeeCurrency;
        paymentPlanPayload.implementation_fee_installments = paymentPlanData.implementationFeeInstallments;
      }
      
      // Add recurring fee fields if applicable
      if (['Suscripción periódica', 'Mixto'].includes(paymentPlanData.planType)) {
        paymentPlanPayload.recurring_fee_amount = paymentPlanData.recurringFeeAmount;
        paymentPlanPayload.recurring_fee_currency = paymentPlanData.recurringFeeCurrency;
        paymentPlanPayload.recurring_fee_frequency = paymentPlanData.recurringFeeFrequency;
        paymentPlanPayload.recurring_fee_day_of_charge = paymentPlanData.recurringFeeDayOfCharge;
        paymentPlanPayload.recurring_fee_grace_periods = paymentPlanData.recurringFeeGracePeriods || 0;
        paymentPlanPayload.recurring_fee_discount_periods = paymentPlanData.recurringFeeDiscountPeriods || 0;
        paymentPlanPayload.recurring_fee_discount_percentage = paymentPlanData.recurringFeeDiscountPercentage || 0;
      }
      
      console.log("Creating payment plan:", paymentPlanPayload);
      
      const { data: paymentPlanData, error: paymentPlanError } = await supabase
        .from('payment_plans')
        .insert([paymentPlanPayload])
        .select()
        .single();
        
      if (paymentPlanError) {
        console.error('Error creating payment plan:', paymentPlanError);
        // Still continue as the project was created
      } else {
        console.log("Payment plan created successfully:", paymentPlanData);
        // The trigger will automatically generate payments
      }
    }

    // Return the created project
    return {
      id: projectData.id,
      clientId: projectData.clientid,
      name: projectData.name,
      description: projectData.description,
      startDate: new Date(projectData.startdate),
      endDate: projectData.enddate ? new Date(projectData.enddate) : undefined,
      status: projectData.status as ProjectStatus,
      notes: projectData.notes || undefined,
      documents: [],
      payments: [],
      totalValue: 0, // Will be filled later
      paymentPlan: {
        id: 0, // Will be filled later
        projectId: projectData.id,
        type: paymentPlanData?.planType || "Fee único"
      }
    };
  } catch (error: any) {
    console.error('Error in addProject:', error);
    throw new Error(error.message || 'Error al guardar el proyecto');
  }
}

export async function updateProject(id: number, updatedData: Partial<Project>): Promise<void> {
  try {
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
      throw new Error(`Error al actualizar proyecto: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error in updateProject:', error);
    throw new Error(error.message || 'Error al actualizar el proyecto');
  }
}

export async function deleteProject(id: number): Promise<void> {
  try {
    const { error: docsError } = await supabase
      .from('documents')
      .delete()
      .eq('projectid', id);
    
    if (docsError) {
      console.error('Error deleting project documents:', docsError);
      throw new Error(`Error al eliminar documentos del proyecto: ${docsError.message}`);
    }
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Error al eliminar proyecto: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error in deleteProject:', error);
    throw new Error(error.message || 'Error al eliminar el proyecto');
  }
}

export async function addProjectDocument(
  projectId: number, 
  document: Omit<Document, 'id'>
): Promise<Document> {
  try {
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
      throw new Error(`Error al agregar documento: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      type: data.type as DocumentType,
      url: data.url,
      uploadDate: new Date(data.uploaddate)
    };
  } catch (error: any) {
    console.error('Error in addProjectDocument:', error);
    throw new Error(error.message || 'Error al agregar documento');
  }
}

export async function removeProjectDocument(documentId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Error removing project document:', error);
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error in removeProjectDocument:', error);
    throw new Error(error.message || 'Error al eliminar documento');
  }
}
