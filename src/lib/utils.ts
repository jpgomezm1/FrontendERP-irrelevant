
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

export function formatCurrency(value: number, currency: Currency = "COP"): string {
  const config = CURRENCIES[currency];
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  }).format(value);
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

export function isPastDue(date: Date): boolean {
  return date < new Date();
}
