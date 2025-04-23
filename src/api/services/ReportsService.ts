/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportsService {
    /**
     * Generate cash flow report
     * @param period Period for analysis (month, quarter, year)
     * @param currency Currency for calculations (COP, USD)
     * @param months Number of months to include
     * @returns any Success
     * @throws ApiError
     */
    public static getCashFlowReport(
        period: string = 'month',
        currency: string = 'COP',
        months: number = 12,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/cash-flow',
            query: {
                'period': period,
                'currency': currency,
                'months': months,
            },
        });
    }
    /**
     * Generate client analytics report
     * @param clientId Filter by client ID
     * @param currency Currency for calculations (COP, USD)
     * @param year Filter by year
     * @returns any Success
     * @throws ApiError
     */
    public static getClientAnalyticsReport(
        clientId?: number,
        currency: string = 'COP',
        year?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/client-analytics',
            query: {
                'client_id': clientId,
                'currency': currency,
                'year': year,
            },
        });
    }
    /**
     * Generate dashboard summary data
     * @param currency
     * @returns any Success
     * @throws ApiError
     */
    public static getDashboardReport(
        currency: string = 'COP',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/dashboard',
            query: {
                'currency': currency,
            },
        });
    }
    /**
     * Generate financial projection report
     * @param months Number of months to project
     * @param currency Currency for calculations (COP, USD)
     * @returns any Success
     * @throws ApiError
     */
    public static getFinancialProjectionReport(
        months: number = 12,
        currency: string = 'COP',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/financial-projection',
            query: {
                'months': months,
                'currency': currency,
            },
        });
    }
    /**
     * Generate profitability report
     * @param period Period for analysis (month, quarter, year)
     * @param currency Currency for calculations (COP, USD)
     * @param year Filter by year
     * @returns any Success
     * @throws ApiError
     */
    public static getProfitabilityReport(
        period: string = 'month',
        currency: string = 'COP',
        year?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/profitability',
            query: {
                'period': period,
                'currency': currency,
                'year': year,
            },
        });
    }
}
