/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Income = {
    /**
     * Income description
     */
    description: string;
    /**
     * Income date
     */
    date: string;
    /**
     * Income amount
     */
    amount: number;
    /**
     * Currency
     */
    currency: Income.currency;
    /**
     * Income type
     */
    type: string;
    /**
     * Client name
     */
    client?: string;
    /**
     * Payment method
     */
    payment_method: string;
    /**
     * Additional notes
     */
    notes?: string;
};
export namespace Income {
    /**
     * Currency
     */
    export enum currency {
        COP = 'COP',
        USD = 'USD',
    }
}

