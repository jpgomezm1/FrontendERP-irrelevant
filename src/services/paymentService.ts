import { supabase } from '@/integrations/supabase/client';
import { Payment, PaymentStatus } from '@/types/clients';
import { Database } from '@/integrations/supabase/types';

type DbPayment = Database['public']['Tables']['payments']['Row'];

// Función auxiliar para crear fechas preservando el día correcto
function createDateWithCorrectDay(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Crear fecha con el offset de la zona horaria para preservar el día
  // Usamos hora 12:00:00 para evitar problemas con zonas horarias
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

// Función para formatear fechas antes de enviarlas a la base de datos
function formatDateForDB(date: Date | undefined): string | null {
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

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
    date: createDateWithCorrectDay(payment.date),
    paidDate: payment.paiddate ? createDateWithCorrectDay(payment.paiddate) : undefined,
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
    date: createDateWithCorrectDay(payment.date),
    paidDate: payment.paiddate ? createDateWithCorrectDay(payment.paiddate) : undefined,
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
    date: createDateWithCorrectDay(payment.date),
    paidDate: payment.paiddate ? createDateWithCorrectDay(payment.paiddate) : undefined,
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
    date: formatDateForDB(payment.date),
    paiddate: formatDateForDB(payment.paidDate),
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
    date: createDateWithCorrectDay(data.date),
    paidDate: data.paiddate ? createDateWithCorrectDay(data.paiddate) : undefined,
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
  try {
    console.log('Updating payment status:', { paymentId, status, paidDate, documentUrl });
    
    // Start by getting the payment details to create the income record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        projects (name, clients (name))
      `)
      .eq('id', paymentId)
      .single();
    
    if (paymentError) {
      console.error('Error fetching payment details:', paymentError);
      throw paymentError;
    }

    // Only proceed with income creation if status is changing to "Pagado"
    if (status === 'Pagado') {
      console.log('Creating income record for payment:', payment);

      // Determine the income type based on payment type
      const incomeType = payment.type === 'Implementación' 
        ? 'Ingreso Implementación'
        : 'Ingreso Recurrente';
      
      // Create income record with the required paymentmethod field
      const { error: incomeError } = await supabase
        .from('incomes')
        .insert({
          description: `Payment for Project ${payment.projects?.name} - ${payment.type === 'Implementación' ? 
            `Implementation Fee${payment.installmentnumber ? ` (Installment ${payment.installmentnumber})` : ''}` : 
            'Recurring Fee'}`,
          date: formatDateForDB(paidDate || new Date()),
          amount: payment.amount,
          type: incomeType,
          client: payment.projects?.clients?.name,
          currency: payment.currency,
          paymentmethod: 'Transferencia', // Default payment method
          receipt: documentUrl,
          notes: `Automatic income record created from project payment #${payment.id}`
        });
      
      if (incomeError) {
        console.error('Error creating income record:', incomeError);
        throw incomeError;
      }
    }
    
    // Update payment status
    const updateData: any = { 
      status,
      paiddate: formatDateForDB(paidDate)
    };
    
    if (documentUrl) {
      updateData.document_url = documentUrl;
    }
    
    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      throw updateError;
    }

    return true;
  } catch (error: any) {
    console.error('Error in updatePaymentStatus:', error);
    throw error;
  }
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
    
    // Corregido - Usar createDateWithCorrectDay para la fecha inicial
    const startDate = createDateWithCorrectDay(projectData.startdate);
    const paymentsToCreate = [];
    
    // Generate implementation fee installments if applicable
    if (implementationParams && ['Fee único', 'Fee por cuotas', 'Mixto'].includes(planType)) {
      const { total, currency, installments } = implementationParams;
      const installmentAmount = total / installments;
      
      let installmentDate = new Date(startDate);
      installmentDate.setHours(12, 0, 0, 0); // Mediodía para evitar problemas de timezone
      
      for (let i = 1; i <= installments; i++) {
        paymentsToCreate.push({
          projectid: projectId,
          clientid: clientId,
          amount: installmentAmount,
          currency: currency,
          date: formatDateForDB(installmentDate),
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
      recurringDate.setHours(12, 0, 0, 0); // Mediodía para evitar problemas de timezone
      
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
          date: formatDateForDB(recurringDate),
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