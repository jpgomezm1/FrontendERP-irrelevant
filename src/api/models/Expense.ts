/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Expense = {
    /**
     * Expense description
     */
    description: string;
    /**
     * Expense date
     */
    date: string;
    /**
     * Expense amount
     */
    amount: number;
    /**
     * Currency
     */
    currency: Expense.currency;
    /**
     * Expense category
     */
    category: string;
    /**
     * Payment method
     */
    payment_method: string;
    /**
     * Additional notes
     */
    notes?: string;
};
export namespace Expense {
    /**
     * Currency
     */
    export enum currency {
        COP = 'COP',
        USD = 'USD',
    }
}

