/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AccruedExpense = {
    /**
     * Expense description
     */
    description: string;
    /**
     * Due date
     */
    due_date: string;
    /**
     * Expense amount
     */
    amount: number;
    /**
     * Currency
     */
    currency: AccruedExpense.currency;
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
    status?: AccruedExpense.status;
    /**
     * Is from recurring expense
     */
    is_recurring?: boolean;
    /**
     * Recurring expense ID
     */
    recurring_id?: number;
    /**
     * Additional notes
     */
    notes?: string;
};
export namespace AccruedExpense {
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
        PAGADO = 'pagado',
        PENDIENTE = 'pendiente',
        VENCIDO = 'vencido',
    }
}

