
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
    .eq('projectid', projectId);

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
    .eq('clientid', clientId);

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
    type: data.type as Payment['type'],
    installmentNumber: data.installmentnumber || undefined,
    notes: data.notes || undefined
  };
}

export async function updatePaymentStatus(
  paymentId: number, 
  status: Payment["status"], 
  paidDate?: Date
): Promise<boolean> {
  const { error } = await supabase
    .from('payments')
    .update({ 
      status,
      paiddate: paidDate?.toISOString().split('T')[0] || null
    })
    .eq('id', paymentId);

  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }

  return true;
}
