/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Payment = {
    /**
     * Project ID
     */
    project_id: number;
    /**
     * Client ID
     */
    client_id: number;
    /**
     * Payment amount
     */
    amount: number;
    /**
     * Currency
     */
    currency: Payment.currency;
    /**
     * Scheduled payment date
     */
    date: string;
    /**
     * Actual payment date
     */
    paid_date?: string;
    /**
     * Payment status
     */
    status?: Payment.status;
    /**
     * Invoice number
     */
    invoice_number?: string;
    /**
     * Invoice URL
     */
    invoice_url?: string;
    /**
     * Payment type
     */
    type: Payment.type;
    /**
     * Installment number for implementation payments
     */
    installment_number?: number;
    /**
     * Additional notes
     */
    notes?: string;
};
export namespace Payment {
    /**
     * Currency
     */
    export enum currency {
        COP = 'COP',
        USD = 'USD',
    }
    /**
     * Payment status
     */
    export enum status {
        PAGADO = 'Pagado',
        PENDIENTE = 'Pendiente',
        VENCIDO = 'Vencido',
    }
    /**
     * Payment type
     */
    export enum type {
        IMPLEMENTACI_N = 'Implementación',
        RECURRENTE = 'Recurrente',
    }
}

