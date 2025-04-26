
import { Payment, PaymentStatus } from '@/types/clients';
import { getAllPayments, getPaymentsByClientId, getPaymentsByProjectId, addPayment, updatePaymentStatus } from '@/services/paymentService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function usePaymentsData() {
  const queryClient = useQueryClient();
  
  // Fetch all payments
  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: getAllPayments,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'client', variables.clientId] });
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
      status: PaymentStatus;
      paidDate?: Date;
    }) => updatePaymentStatus(paymentId, status, paidDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['project-payments'] });
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
    updatePaymentStatus: (paymentId: number, status: PaymentStatus, paidDate?: Date) => 
      updatePaymentStatusMutation.mutateAsync({ paymentId, status, paidDate }),
  };
}
