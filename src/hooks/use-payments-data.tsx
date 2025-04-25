
import { Payment } from '@/types/clients';
import { getPayments, getPaymentsByClientId, getPaymentsByProjectId, addPayment, updatePaymentStatus } from '@/services/paymentService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function usePaymentsData() {
  const queryClient = useQueryClient();
  
  // Fetch all payments
  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  });
  
  // Get payments by client ID
  const getPaymentsByClientIdQuery = (clientId: number) => {
    return useQuery({
      queryKey: ['payments', 'client', clientId],
      queryFn: () => getPaymentsByClientId(clientId),
    });
  };
  
  // Get payments by project ID
  const getPaymentsByProjectIdQuery = (projectId: number) => {
    return useQuery({
      queryKey: ['payments', 'project', projectId],
      queryFn: () => getPaymentsByProjectId(projectId),
    });
  };
  
  // Add a new payment
  const addPaymentMutation = useMutation({
    mutationFn: addPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pago registrado exitosamente');
    },
    onError: (error) => {
      console.error('Error adding payment:', error);
      toast.error('Error al registrar el pago');
    },
  });
  
  // Update payment status
  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ paymentId, status, paidDate }: { 
      paymentId: number; 
      status: string;
      paidDate?: Date;
    }) => updatePaymentStatus(paymentId, status, paidDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Estado de pago actualizado');
    },
    onError: (error) => {
      console.error('Error updating payment status:', error);
      toast.error('Error al actualizar el estado del pago');
    },
  });
  
  return {
    payments,
    isLoading,
    error,
    getPaymentsByClientIdQuery,
    getPaymentsByProjectIdQuery,
    addPayment: (payment: Omit<Payment, "id">) => 
      addPaymentMutation.mutate(payment),
    updatePaymentStatus: (paymentId: number, status: string, paidDate?: Date) => 
      updatePaymentStatusMutation.mutate({ paymentId, status, paidDate }),
  };
}
