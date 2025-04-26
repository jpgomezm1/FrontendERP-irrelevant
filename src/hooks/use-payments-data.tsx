
import { Payment, PaymentStatus } from '@/types/clients';
import { getAllPayments, getPaymentsByClientId, getPaymentsByProjectId, addPayment, updatePaymentStatus, generatePaymentInstallments } from '@/services/paymentService';
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
      enabled: !!clientId
    });
  };
  
  // Get payments by project ID
  const getPaymentsByProjectIdQuery = (projectId: number) => {
    return useQuery({
      queryKey: ['payments', 'project', projectId],
      queryFn: () => getPaymentsByProjectId(projectId),
      enabled: !!projectId
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
    mutationFn: ({ paymentId, status, paidDate, documentUrl }: { 
      paymentId: number; 
      status: PaymentStatus;
      paidDate?: Date;
      documentUrl?: string;
    }) => updatePaymentStatus(paymentId, status, paidDate, documentUrl),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['project-payments'] });
      queryClient.invalidateQueries({ queryKey: ['income-list'] }); // Add this line
      queryClient.invalidateQueries({ queryKey: ['income-analytics'] }); // Add this line
      toast.success('Estado de pago actualizado');
    },
    onError: (error) => {
      console.error('Error updating payment status:', error);
      toast.error('Error al actualizar el estado del pago');
    },
  });
  
  // Generate payment installments
  const generateInstallmentsMutation = useMutation({
    mutationFn: ({ 
      projectId,
      clientId,
      planType,
      implementationParams,
      recurringParams
    }: { 
      projectId: number;
      clientId: number;
      planType: string;
      implementationParams?: {
        total: number;
        currency: string;
        installments: number;
      };
      recurringParams?: {
        amount: number;
        currency: string;
        frequency: string;
        dayOfCharge: number;
        gracePeriods?: number;
        discountPeriods?: number;
        discountPercentage?: number;
      };
    }) => generatePaymentInstallments(
      projectId, 
      clientId, 
      planType,
      implementationParams,
      recurringParams
    ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-payments'] });
      toast.success('Cuotas generadas exitosamente');
    },
    onError: (error) => {
      console.error('Error generating installments:', error);
      toast.error('Error al generar las cuotas de pago');
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
    updatePaymentStatus: (paymentId: number, status: PaymentStatus, paidDate?: Date, documentUrl?: string) => 
      updatePaymentStatusMutation.mutateAsync({ paymentId, status, paidDate, documentUrl }),
    generateInstallments: (
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
    ) => generateInstallmentsMutation.mutateAsync({
      projectId,
      clientId,
      planType,
      implementationParams,
      recurringParams
    }),
  };
}
