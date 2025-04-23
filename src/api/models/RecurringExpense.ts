/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RecurringExpense = {
    /**
     * Expense description
     */
    description: string;
    /**
     * Frequency
     */
    frequency: RecurringExpense.frequency;
    /**
     * Start date
     */
    start_date: string;
    /**
     * Expense amount
     */
    amount: number;
    /**
     * Currency
     */
    currency: RecurringExpense.currency;
    /**
     * Expense category
     */
    category: string;
    /**
     * Payment method
     */
    payment_method: string;
    /**
     * Status
     */
    status?: RecurringExpense.status;
    /**
     * Additional notes
     */
    notes?: string;
};
export namespace RecurringExpense {
    /**
     * Frequency
     */
    export enum frequency {
        DIARIA = 'Diaria',
        SEMANAL = 'Semanal',
        QUINCENAL = 'Quincenal',
        MENSUAL = 'Mensual',
        BIMENSUAL = 'Bimensual',
        TRIMESTRAL = 'Trimestral',
        SEMESTRAL = 'Semestral',
        ANUAL = 'Anual',
    }
    /**
     * Currency
     */
    export enum currency {
        COP = 'COP',
        USD = 'USD',
    }
    /**
     * Status
     */
    export enum status {
        ACTIVO = 'Activo',
        PAUSADO = 'Pausado',
    }
}

