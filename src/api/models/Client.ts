/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Client = {
    /**
     * Client name
     */
    name: string;
    /**
     * Contact person name
     */
    contact_name?: string;
    /**
     * Client email
     */
    email?: string;
    /**
     * Client phone number
     */
    phone?: string;
    /**
     * Client address
     */
    address?: string;
    /**
     * Tax ID (NIT)
     */
    tax_id?: string;
    /**
     * Client start date
     */
    start_date: string;
    /**
     * Client status
     */
    status: Client.status;
    /**
     * Additional notes
     */
    notes?: string;
};
export namespace Client {
    /**
     * Client status
     */
    export enum status {
        ACTIVO = 'Activo',
        PAUSADO = 'Pausado',
        TERMINADO = 'Terminado',
    }
}

