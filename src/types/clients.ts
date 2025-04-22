
import { Currency } from "@/lib/utils";

// Tipo de documento
export type DocumentType = 
  | "RUT"
  | "Cámara de Comercio"
  | "NDA"
  | "Contrato"
  | "Factura"
  | "Otro";

// Status del cliente
export type ClientStatus = "Activo" | "Pausado" | "Terminado";

// Status del proyecto
export type ProjectStatus = "Activo" | "Pausado" | "Finalizado" | "Cancelado";

// Status de pago
export type PaymentStatus = "Pagado" | "Pendiente" | "Vencido";

// Frecuencia de pago
export type PaymentFrequency = 
  | "Única"
  | "Semanal"
  | "Quincenal"
  | "Mensual"
  | "Bimensual"
  | "Trimestral"
  | "Semestral"
  | "Anual"
  | "Personalizada";

// Tipo de plan
export type PlanType = 
  | "Fee único"
  | "Fee por cuotas"
  | "Suscripción periódica"
  | "Mixto";

// Método de pago
export type PaymentMethod = 
  | "Efectivo"
  | "Transferencia"
  | "Tarjeta de Crédito"
  | "Tarjeta de Débito"
  | "PayPal"
  | "Nequi"
  | "Daviplata"
  | "Otro";

// Interface para documentos
export interface Document {
  id: number;
  name: string;
  type: DocumentType;
  url: string;
  uploadDate: Date;
}

// Interface para cliente
export interface Client {
  id: number;
  name: string;
  contactName?: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
  startDate: Date;
  status: ClientStatus;
  notes?: string;
  documents: Document[];
}

// Interface para plan de pago
export interface PaymentPlan {
  id: number;
  projectId: number;
  type: PlanType;
  implementationFee?: {
    total: number;
    currency: Currency;
    installments: number; // Número de cuotas (1 = pago único)
  };
  recurringFee?: {
    amount: number;
    currency: Currency;
    frequency: PaymentFrequency;
    dayOfCharge: number; // Día del mes para cargo (1-31)
    gracePeriods?: number; // Periodos gratuitos
    discountPeriods?: number; // Periodos con descuento
    discountPercentage?: number; // Porcentaje de descuento
  };
}

// Interface para cuota o pago
export interface Payment {
  id: number;
  projectId: number;
  clientId: number;
  amount: number;
  currency: Currency;
  date: Date; // Fecha programada
  paidDate?: Date; // Fecha real de pago
  status: PaymentStatus;
  invoiceNumber?: string;
  invoiceUrl?: string;
  type: "Implementación" | "Recurrente";
  installmentNumber?: number; // Número de cuota
  notes?: string;
}

// Interface para proyecto
export interface Project {
  id: number;
  clientId: number;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
  paymentPlan: PaymentPlan;
  payments: Payment[];
  documents: Document[];
  notes?: string;
}
