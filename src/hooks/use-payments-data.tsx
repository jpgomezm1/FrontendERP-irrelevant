
import { useState, useEffect } from 'react';
import { Payment } from '@/types/clients';
import { getAllPayments, getPaymentsByProjectId, getPaymentsByClientId, addPayment, updatePaymentStatus } from '@/services/paymentService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function usePaymentsData() {
  const queryClient = useQueryClient();
  
  // Fetch all payments
  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: getAllPayments,
  });
  
  // Get payments by project ID
  const fetchPaymentsByProjectId = async (projectId: number) => {
    return await getPaymentsByProjectId(projectId);
  };
  
  // Get payments by client ID
  const fetchPaymentsByClientId = async (clientId: number) => {
    return await getPaymentsByClientId(clientId);
  };
  
  // Add a new payment
  const addPaymentMutation = useMutation({
    mutationFn: addPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pago agregado exitosamente');
    },
    onError: (error) => {
      console.error('Error adding payment:', error);
      toast.error('Error al agregar pago');
    },
  });
  
  // Update payment status
  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ paymentId, status, paidDate }: { 
      paymentId: number; 
      status: Payment["status"]; 
      paidDate?: Date 
    }) => updatePaymentStatus(paymentId, status, paidDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Estado de pago actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating payment status:', error);
      toast.error('Error al actualizar estado de pago');
    },
  });
  
  const getOverduePayments = () => {
    const today = new Date();
    return payments.filter(
      payment => payment.status === "Pendiente" && new Date(payment.date) < today
    );
  };
  
  const getUpcomingPayments = (days: number = 30) => {
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() + days);
    
    return payments.filter(
      payment => 
        payment.status === "Pendiente" && 
        new Date(payment.date) >= today && 
        new Date(payment.date) <= limit
    );
  };
  
  return {
    payments,
    isLoading,
    error,
    getPaymentsByProjectId: fetchPaymentsByProjectId,
    getPaymentsByClientId: fetchPaymentsByClientId,
    getOverduePayments,
    getUpcomingPayments,
    addPayment: (payment: Omit<Payment, "id">) => 
      addPaymentMutation.mutate(payment),
    updatePaymentStatus: (paymentId: number, status: Payment["status"], paidDate?: Date) => 
      updatePaymentStatusMutation.mutate({ paymentId, status, paidDate }),
  };
}
