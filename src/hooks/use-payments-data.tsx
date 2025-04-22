
import { useState, useEffect } from 'react';
import { Payment } from '@/types/clients';
import { useProjectsData } from './use-projects-data';

export function usePaymentsData() {
  const { projects } = useProjectsData();
  
  // Extraer todos los pagos de todos los proyectos
  const allPayments = projects.flatMap(project => 
    project.payments.map(payment => ({
      ...payment,
      projectName: project.name,
      clientName: project.clientName,
    }))
  );
  
  const getPaymentsByProjectId = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];
    
    return project.payments.map(payment => ({
      ...payment,
      projectName: project.name,
      clientName: project.clientName,
    }));
  };
  
  const getPaymentsByClientId = (clientId: number) => {
    return allPayments.filter(payment => payment.clientId === clientId);
  };
  
  const getOverduePayments = () => {
    const today = new Date();
    return allPayments.filter(
      payment => payment.status === "Pendiente" && payment.date < today
    );
  };
  
  const getUpcomingPayments = (days: number = 30) => {
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() + days);
    
    return allPayments.filter(
      payment => 
        payment.status === "Pendiente" && 
        payment.date >= today && 
        payment.date <= limit
    );
  };
  
  const addPayment = (payment: Omit<Payment, "id">) => {
    // Esta implementación es simplificada ya que los pagos están anidados en los proyectos
    // En una implementación real, esto requeriría una actualización del estado de proyectos
    return payment;
  };
  
  const updatePaymentStatus = (paymentId: number, status: Payment["status"], paidDate?: Date) => {
    // Esta implementación es simplificada ya que los pagos están anidados en los proyectos
    // En una implementación real, esto requeriría una actualización del estado de proyectos
    return true;
  };
  
  return {
    payments: allPayments,
    getPaymentsByProjectId,
    getPaymentsByClientId,
    getOverduePayments,
    getUpcomingPayments,
    addPayment,
    updatePaymentStatus,
  };
}
