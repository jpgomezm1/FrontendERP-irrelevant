/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PaymentStatusUpdate = {
    /**
     * New payment status
     */
    status: PaymentStatusUpdate.status;
    /**
     * Actual payment date
     */
    paid_date: string;
    /**
     * Invoice number
     */
    invoice_number?: string;
};
export namespace PaymentStatusUpdate {
    /**
     * New payment status
     */
    export enum status {
        PAGADO = 'Pagado',
        PENDIENTE = 'Pendiente',
        VENCIDO = 'Vencido',
    }
}

