
import { supabase } from '@/integrations/supabase/client';
import { Payment, PaymentStatus } from '@/types/clients';
import { Database } from '@/integrations/supabase/types';

type DbPayment = Database['public']['Tables']['payments']['Row'];

export async function getAllPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      projects (name),
      clients (name)
    `);

  if (error) {
    console.error('Error fetching all payments:', error);
    throw error;
  }

  return (data || []).map(payment => ({
    id: payment.id,
    projectId: payment.projectid,
    clientId: payment.clientid,
    amount: payment.amount,
    currency: payment.currency as Payment['currency'],
    date: new Date(payment.date),
    paidDate: payment.paiddate ? new Date(payment.paiddate) : undefined,
    status: payment.status as PaymentStatus,
    invoiceNumber: payment.invoicenumber || undefined,
    invoiceUrl: payment.invoiceurl || undefined,
    documentUrl: payment.document_url || undefined,
    type: payment.type as Payment['type'],
    installmentNumber: payment.installmentnumber || undefined,
    notes: payment.notes || undefined,
    projectName: payment.projects?.name || "Proyecto Desconocido",
    clientName: payment.clients?.name || "Cliente Desconocido"
  }));
}

export async function getPaymentsByProjectId(projectId: number): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      projects (name),
      clients (name)
    `)
    .eq('projectid', projectId)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching payments by project ID:', error);
    throw error;
  }

  return (data || []).map(payment => ({
    id: payment.id,
    projectId: payment.projectid,
    clientId: payment.clientid,
    amount: payment.amount,
    currency: payment.currency as Payment['currency'],
    date: new Date(payment.date),
    paidDate: payment.paiddate ? new Date(payment.paiddate) : undefined,
    status: payment.status as PaymentStatus,
    invoiceNumber: payment.invoicenumber || undefined,
    invoiceUrl: payment.invoiceurl || undefined,
    documentUrl: payment.document_url || undefined,
    type: payment.type as Payment['type'],
    installmentNumber: payment.installmentnumber || undefined,
    notes: payment.notes || undefined,
    projectName: payment.projects?.name || "Proyecto Desconocido",
    clientName: payment.clients?.name || "Cliente Desconocido"
  }));
}

export async function getPaymentsByClientId(clientId: number): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      projects (name)
    `)
    .eq('clientid', clientId)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching payments by client ID:', error);
    throw error;
  }

  return (data || []).map(payment => ({
    id: payment.id,
    projectId: payment.projectid,
    clientId: payment.clientid,
    amount: payment.amount,
    currency: payment.currency as Payment['currency'],
    date: new Date(payment.date),
    paidDate: payment.paiddate ? new Date(payment.paiddate) : undefined,
    status: payment.status as PaymentStatus,
    invoiceNumber: payment.invoicenumber || undefined,
    invoiceUrl: payment.invoiceurl || undefined,
    documentUrl: payment.document_url || undefined,
    type: payment.type as Payment['type'],
    installmentNumber: payment.installmentnumber || undefined,
    notes: payment.notes || undefined,
    projectName: payment.projects?.name || "Proyecto Desconocido"
  }));
}

export async function addPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
  const payload = {
    projectid: payment.projectId,
    clientid: payment.clientId,
    amount: payment.amount,
    currency: payment.currency,
    date: payment.date?.toISOString().split('T')[0],
    paiddate: payment.paidDate?.toISOString().split('T')[0] || null,
    status: payment.status,
    invoicenumber: payment.invoiceNumber || null,
    invoiceurl: payment.invoiceUrl || null,
    document_url: payment.documentUrl || null,
    type: payment.type,
    installmentnumber: payment.installmentNumber || null,
    notes: payment.notes || null,
  };
  
  const { data, error } = await supabase
    .from('payments')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error adding payment:', error);
    throw error;
  }

  return {
    id: data.id,
    projectId: data.projectid,
    clientId: data.clientid,
    amount: data.amount,
    currency: data.currency as Payment['currency'],
    date: new Date(data.date),
    paidDate: data.paiddate ? new Date(data.paiddate) : undefined,
    status: data.status as PaymentStatus,
    invoiceNumber: data.invoicenumber || undefined,
    invoiceUrl: data.invoiceurl || undefined,
    documentUrl: data.document_url || undefined,
    type: data.type as Payment['type'],
    installmentNumber: data.installmentnumber || undefined,
    notes: data.notes || undefined
  };
}

export async function updatePaymentStatus(
  paymentId: number, 
  status: Payment["status"], 
  paidDate?: Date,
  documentUrl?: string
): Promise<boolean> {
  const updateData: any = { 
    status,
    paiddate: paidDate?.toISOString().split('T')[0] || null
  };
  
  if (documentUrl) {
    updateData.document_url = documentUrl;
  }
  
  const { error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', paymentId);

  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }

  return true;
}

// Helper function to generate payment installments for a project
export async function generatePaymentInstallments(
  projectId: number, 
  clientId: number,
  planType: string,
  implementationParams?: {
    total: number;
    currency: string;
    installments: number;
  },
  recurringParams?: {
    amount: number;
    currency: string;
    frequency: string;
    dayOfCharge: number;
    gracePeriods?: number;
    discountPeriods?: number;
    discountPercentage?: number;
  }
): Promise<boolean> {
  try {
    console.log("Generating payment installments manually for project:", projectId);
    
    // Get the project start date
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('startdate')
      .eq('id', projectId)
      .single();
    
    if (projectError || !projectData) {
      console.error('Error fetching project start date:', projectError);
      throw new Error('No se pudo obtener la fecha de inicio del proyecto');
    }
    
    const startDate = new Date(projectData.startdate);
    const paymentsToCreate = [];
    
    // Generate implementation fee installments if applicable
    if (implementationParams && ['Fee único', 'Fee por cuotas', 'Mixto'].includes(planType)) {
      const { total, currency, installments } = implementationParams;
      const installmentAmount = total / installments;
      
      let installmentDate = new Date(startDate);
      
      for (let i = 1; i <= installments; i++) {
        paymentsToCreate.push({
          projectid: projectId,
          clientid: clientId,
          amount: installmentAmount,
          currency: currency,
          date: new Date(installmentDate).toISOString().split('T')[0],
          status: 'Pendiente',
          type: 'Implementación',
          installmentnumber: i
        });
        
        // Calculate next installment date based on number of installments
        if (installments <= 3) {
          installmentDate.setMonth(installmentDate.getMonth() + 1); // Monthly
        } else if (installments <= 6) {
          installmentDate.setDate(installmentDate.getDate() + 14); // Biweekly
        } else {
          installmentDate.setDate(installmentDate.getDate() + 7); // Weekly
        }
      }
    }
    
    // Generate recurring fee installments if applicable
    if (recurringParams && ['Suscripción periódica', 'Mixto'].includes(planType)) {
      const { 
        amount, 
        currency, 
        frequency, 
        dayOfCharge,
        gracePeriods = 0,
        discountPeriods = 0,
        discountPercentage = 0
      } = recurringParams;
      
      let recurringDate = new Date(startDate);
      
      // Apply grace period
      if (gracePeriods > 0) {
        switch (frequency) {
          case 'Semanal':
            recurringDate.setDate(recurringDate.getDate() + (7 * gracePeriods));
            break;
          case 'Quincenal':
            recurringDate.setDate(recurringDate.getDate() + (14 * gracePeriods));
            break;
          case 'Mensual':
            recurringDate.setMonth(recurringDate.getMonth() + gracePeriods);
            break;
          case 'Bimensual':
            recurringDate.setMonth(recurringDate.getMonth() + (2 * gracePeriods));
            break;
          case 'Trimestral':
            recurringDate.setMonth(recurringDate.getMonth() + (3 * gracePeriods));
            break;
          case 'Semestral':
            recurringDate.setMonth(recurringDate.getMonth() + (6 * gracePeriods));
            break;
          case 'Anual':
            recurringDate.setFullYear(recurringDate.getFullYear() + gracePeriods);
            break;
          default:
            recurringDate.setMonth(recurringDate.getMonth() + gracePeriods);
        }
      }
      
      // Generate 12 recurring payments (1 year)
      for (let i = 1; i <= 12; i++) {
        // Apply discount if applicable
        let paymentAmount = amount;
        let notes = null;
        
        if (discountPeriods > 0 && i <= discountPeriods && discountPercentage > 0) {
          const discountAmount = amount * (discountPercentage / 100);
          paymentAmount = amount - discountAmount;
          notes = `Descuento aplicado: ${discountPercentage}%`;
        }
        
        paymentsToCreate.push({
          projectid: projectId,
          clientid: clientId,
          amount: paymentAmount,
          currency: currency,
          date: new Date(recurringDate).toISOString().split('T')[0],
          status: 'Pendiente',
          type: 'Recurrente',
          installmentnumber: i,
          notes: notes
        });
        
        // Calculate next payment date based on frequency
        switch (frequency) {
          case 'Semanal':
            recurringDate.setDate(recurringDate.getDate() + 7);
            break;
          case 'Quincenal':
            recurringDate.setDate(recurringDate.getDate() + 14);
            break;
          case 'Mensual':
            recurringDate.setMonth(recurringDate.getMonth() + 1);
            break;
          case 'Bimensual':
            recurringDate.setMonth(recurringDate.getMonth() + 2);
            break;
          case 'Trimestral':
            recurringDate.setMonth(recurringDate.getMonth() + 3);
            break;
          case 'Semestral':
            recurringDate.setMonth(recurringDate.getMonth() + 6);
            break;
          case 'Anual':
            recurringDate.setFullYear(recurringDate.getFullYear() + 1);
            break;
          default:
            recurringDate.setMonth(recurringDate.getMonth() + 1);
        }
      }
    }
    
    // Insert all payments
    if (paymentsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('payments')
        .insert(paymentsToCreate);
      
      if (insertError) {
        console.error('Error creating payment installments:', insertError);
        throw new Error('Error al crear los pagos programados');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in generatePaymentInstallments:', error);
    throw error;
  }
}
