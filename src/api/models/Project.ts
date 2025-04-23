/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentPlan } from './PaymentPlan';
export type Project = {
    /**
     * Client ID
     */
    client_id: number;
    /**
     * Project name
     */
    name: string;
    /**
     * Project description
     */
    description: string;
    /**
     * Project start date
     */
    start_date: string;
    /**
     * Project end date
     */
    end_date?: string;
    /**
     * Project status
     */
    status?: Project.status;
    /**
     * Additional notes
     */
    notes?: string;
    /**
     * Payment plan
     */
    payment_plan?: PaymentPlan;
};
export namespace Project {
    /**
     * Project status
     */
    export enum status {
        ACTIVO = 'Activo',
        PAUSADO = 'Pausado',
        FINALIZADO = 'Finalizado',
        CANCELADO = 'Cancelado',
    }
}

