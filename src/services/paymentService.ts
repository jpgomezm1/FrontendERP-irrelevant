import { supabase } from '@/integrations/supabase/client';
import { Payment } from '@/types/clients';
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
    ...payment,
    date: new Date(payment.date),
    paidDate: payment.paiddate ? new Date(payment.paiddate) : undefined,
    projectName: payment.projects?.name || "Proyecto Desconocido",
    clientName: payment.clients?.name || "Cliente Desconocido",
    projectId: payment.projectid,
    clientId: payment.clientid
  }));
}

export async function getPaymentsByProjectId(projectId: number): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      projects (name, clientId),
      clients (name)
    `)
    .eq('projectId', projectId);

  if (error) {
    console.error('Error fetching payments by project ID:', error);
    throw error;
  }

  return data.map(payment => ({
    ...payment,
    projectName: payment.projects?.name || "Proyecto Desconocido",
    clientName: payment.clients?.name || "Cliente Desconocido"
  })) || [];
}

export async function getPaymentsByClientId(clientId: number): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      projects (name)
    `)
    .eq('clientId', clientId);

  if (error) {
    console.error('Error fetching payments by client ID:', error);
    throw error;
  }

  return data.map(payment => ({
    ...payment,
    projectName: payment.projects?.name || "Proyecto Desconocido"
  })) || [];
}

export async function addPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
  const payload = {
    ...payment,
    date: payment.date?.toISOString().split('T')[0],
    paidDate: payment.paidDate?.toISOString().split('T')[0] || null,
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

  return data;
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
      paidDate: paidDate?.toISOString().split('T')[0] || null
    })
    .eq('id', paymentId);

  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }

  return true;
}
