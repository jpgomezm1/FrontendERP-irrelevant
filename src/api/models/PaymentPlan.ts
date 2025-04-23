/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PaymentPlan = {
    /**
     * Plan type
     */
    type: PaymentPlan.type;
    /**
     * Implementation fee total
     */
    implementation_fee_total?: number;
    /**
     * Implementation fee currency
     */
    implementation_fee_currency?: PaymentPlan.implementation_fee_currency;
    /**
     * Implementation fee installments
     */
    implementation_fee_installments?: number;
    /**
     * Recurring fee amount
     */
    recurring_fee_amount?: number;
    /**
     * Recurring fee currency
     */
    recurring_fee_currency?: PaymentPlan.recurring_fee_currency;
    /**
     * Recurring fee frequency
     */
    recurring_fee_frequency?: PaymentPlan.recurring_fee_frequency;
    /**
     * Recurring fee day of charge
     */
    recurring_fee_day_of_charge?: number;
    /**
     * Recurring fee grace periods
     */
    recurring_fee_grace_periods?: number;
    /**
     * Recurring fee discount periods
     */
    recurring_fee_discount_periods?: number;
    /**
     * Recurring fee discount percentage
     */
    recurring_fee_discount_percentage?: number;
};
export namespace PaymentPlan {
    /**
     * Plan type
     */
    export enum type {
        FEE_NICO = 'Fee único',
        FEE_POR_CUOTAS = 'Fee por cuotas',
        SUSCRIPCI_N_PERI_DICA = 'Suscripción periódica',
        MIXTO = 'Mixto',
    }
    /**
     * Implementation fee currency
     */
    export enum implementation_fee_currency {
        COP = 'COP',
        USD = 'USD',
    }
    /**
     * Recurring fee currency
     */
    export enum recurring_fee_currency {
        COP = 'COP',
        USD = 'USD',
    }
    /**
     * Recurring fee frequency
     */
    export enum recurring_fee_frequency {
        SEMANAL = 'Semanal',
        QUINCENAL = 'Quincenal',
        MENSUAL = 'Mensual',
        BIMENSUAL = 'Bimensual',
        TRIMESTRAL = 'Trimestral',
        SEMESTRAL = 'Semestral',
        ANUAL = 'Anual',
    }
}

