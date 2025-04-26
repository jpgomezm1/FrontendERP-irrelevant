
export const EXPENSE_CATEGORIES = [
  "Arriendo",
  "Marketing",
  "Nómina",
  "Servicios",
  "Software",
  "Comisiones Ventas",
  "Transporte",
  "Viáticos",
  "Herramientas Tech",
  "Administrativo",
  "Otros"
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const PAYMENT_METHODS = [
  "Efectivo", 
  "Tarjeta de Crédito", 
  "Tarjeta de Débito", 
  "Transferencia", 
  "PayPal", 
  "Nequi", 
  "Daviplata"
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];

export const EXPENSE_FREQUENCIES = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "bimonthly", label: "Bimensual" },
  { value: "quarterly", label: "Trimestral" },
  { value: "semiannual", label: "Semestral" },
  { value: "annual", label: "Anual" }
];

export type ExpenseFrequency = typeof EXPENSE_FREQUENCIES[number];
