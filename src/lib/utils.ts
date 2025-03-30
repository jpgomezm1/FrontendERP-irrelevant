
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Currency = "COP" | "USD";

export interface CurrencyConfig {
  symbol: string;
  code: Currency;
  locale: string;
  decimalPlaces: number;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  COP: {
    symbol: "$",
    code: "COP",
    locale: "es-CO",
    decimalPlaces: 0,
  },
  USD: {
    symbol: "US$",
    code: "USD",
    locale: "en-US",
    decimalPlaces: 2,
  }
};

// Conversion rates (placeholder - in real app would come from API)
export const CONVERSION_RATES = {
  USD_TO_COP: 4000, // 1 USD = 4000 COP
  COP_TO_USD: 1 / 4000, // 1 COP = 0.00025 USD
};

export function formatCurrency(value: number, currency: Currency = "COP"): string {
  const config = CURRENCIES[currency];
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  }).format(value);
}

export function convertCurrency(value: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return value;
  
  if (fromCurrency === "USD" && toCurrency === "COP") {
    return value * CONVERSION_RATES.USD_TO_COP;
  } else {
    return value * CONVERSION_RATES.COP_TO_USD;
  }
}

export function getCurrencySymbol(currency: Currency = "COP"): string {
  return CURRENCIES[currency].symbol;
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
  return date < new Date();
}

export function calculateNextPaymentDate(startDate: Date, frequency: string): Date {
  const today = new Date();
  let nextDate = new Date(startDate);

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
  const dates: Date[] = [new Date(startDate)];
  let currentDate = new Date(startDate);
  
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
