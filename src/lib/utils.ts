import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Payment } from "@/types/clients";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Currency = "COP" | "USD";

export const CURRENCIES: Record<
  Currency,
  { symbol: string; locale: string; decimalPlaces: number }
> = {
  COP: { symbol: "$", locale: "es-CO", decimalPlaces: 0 },
  USD: { symbol: "$", locale: "en-US", decimalPlaces: 2 },
};

export function formatCurrency(amount: number, currency: Currency = "COP"): string {
  return new Intl.NumberFormat(CURRENCIES[currency].locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: CURRENCIES[currency].decimalPlaces,
    maximumFractionDigits: CURRENCIES[currency].decimalPlaces,
  }).format(amount);
}

export function convertCurrency(
  amount: number, 
  fromCurrency: Currency, 
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === "USD" && toCurrency === "COP") {
    return amount * 4000;
  } else if (fromCurrency === "COP" && toCurrency === "USD") {
    return amount / 4000;
  }
  
  return amount;
}

export function getCurrencySymbol(currency: Currency = "COP"): string {
  return CURRENCIES[currency].symbol;
}

/**
 * Crea una fecha con el día correcto, evitando problemas de zona horaria
 * @param dateStr Cadena de fecha en formato 'YYYY-MM-DD'
 * @returns Una fecha con el día correcto
 */
export function createCorrectDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) {
    // Si ya es una fecha, creamos una nueva con hora al mediodía para evitar problemas de timezone
    return new Date(
      dateStr.getFullYear(),
      dateStr.getMonth(),
      dateStr.getDate(),
      12, 0, 0
    );
  }
  
  // Si es string, dividimos y creamos la fecha manualmente
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }
  
  // Si el formato no es el esperado, intentamos parsear normalmente pero con hora al mediodía
  const date = new Date(dateStr);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12, 0, 0
  );
}

/**
 * Convierte una fecha a formato string 'YYYY-MM-DD' manteniendo el día correcto
 * @param date Fecha a formatear
 * @returns String en formato 'YYYY-MM-DD'
 */
export function formatDateToString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getRandomColor(index: number): string {
  const colors = [
    'rgba(54, 162, 235, 0.5)',
    'rgba(255, 99, 132, 0.5)',
    'rgba(75, 192, 192, 0.5)',
    'rgba(255, 206, 86, 0.5)',
    'rgba(153, 102, 255, 0.5)',
    'rgba(255, 159, 64, 0.5)',
    'rgba(199, 199, 199, 0.5)',
    'rgba(83, 102, 255, 0.5)',
    'rgba(78, 124, 255, 0.5)',
    'rgba(119, 93, 208, 0.5)',
  ];
  
  return colors[index % colors.length];
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pagado':
      return 'bg-green-100 text-green-800';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'vencido':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusBadge(status: string): string {
  switch (status.toLowerCase()) {
    case 'pagado':
      return 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800';
    case 'pendiente':
      return 'inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800';
    case 'vencido':
      return 'inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800';
    case 'activo':
      return 'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800';
    case 'pausado':
      return 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800';
    default:
      return 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800';
  }
}

export function isPastDue(date: Date): boolean {
  // Crear una fecha de hoy con tiempo en 00:00:00 para comparación justa
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Crear una copia de la fecha de vencimiento con tiempo en 00:00:00
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate < today;
}

export function calculateNextPaymentDate(startDate: Date, frequency: string): Date {
  // Usar el mediodía para evitar problemas de zona horaria
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  
  // Crear una copia de la fecha de inicio con hora al mediodía
  let nextDate = new Date(startDate);
  nextDate.setHours(12, 0, 0, 0);

  while (nextDate <= today) {
    switch (frequency.toLowerCase()) {
      case 'semanal':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'quincenal':
        nextDate.setDate(nextDate.getDate() + 15);
        break;
      case 'mensual':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'bimestral':
        nextDate.setMonth(nextDate.getMonth() + 2);
        break;
      case 'trimestral':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'semestral':
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case 'anual':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
  }
  
  return nextDate;
}

export function generatePaymentDates(startDate: Date, frequency: string, count: number = 12): Date[] {
  // Crear una copia de la fecha de inicio con hora al mediodía
  const fixedStartDate = new Date(startDate);
  fixedStartDate.setHours(12, 0, 0, 0);
  
  const dates: Date[] = [new Date(fixedStartDate)];
  let currentDate = new Date(fixedStartDate);
  
  for (let i = 1; i < count; i++) {
    switch (frequency.toLowerCase()) {
      case 'semanal':
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'quincenal':
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 15);
        break;
      case 'mensual':
        currentDate = new Date(currentDate);
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'bimestral':
        currentDate = new Date(currentDate);
        currentDate.setMonth(currentDate.getMonth() + 2);
        break;
      case 'trimestral':
        currentDate = new Date(currentDate);
        currentDate.setMonth(currentDate.getMonth() + 3);
        break;
      case 'semestral':
        currentDate = new Date(currentDate);
        currentDate.setMonth(currentDate.getMonth() + 6);
        break;
      case 'anual':
        currentDate = new Date(currentDate);
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      default:
        currentDate = new Date(currentDate);
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    dates.push(new Date(currentDate));
  }
  
  return dates;
}

export enum AccountStatus {
  UpToDate = "Up to date",
  SlightlyOverdue = "Slightly overdue",
  SeriouslyOverdue = "Seriously overdue"
}

export function calculateAccountStatus(payments: Payment[]): AccountStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let maxOverdueDays = 0;

  // Only consider unpaid payments
  const unpaidPayments = payments.filter(payment => payment.status === "Pendiente" || payment.status === "Vencido");
  
  for (const payment of unpaidPayments) {
    const dueDate = new Date(payment.date);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today) { // Payment is overdue
      const overdueDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      maxOverdueDays = Math.max(maxOverdueDays, overdueDays);
    }
  }

  if (maxOverdueDays === 0) {
    return AccountStatus.UpToDate;
  }
  if (maxOverdueDays < 15) {
    return AccountStatus.SlightlyOverdue;
  }
  return AccountStatus.SeriouslyOverdue;
}