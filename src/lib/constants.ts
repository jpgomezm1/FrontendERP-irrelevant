
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
