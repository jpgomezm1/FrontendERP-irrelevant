/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GeneratePayments } from '../models/GeneratePayments';
import type { Payment } from '../models/Payment';
import type { PaymentStatusUpdate } from '../models/PaymentStatusUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentsService {
    /**
     * Create a new payment
     * @param payload
     * @returns any Payment created successfully
     * @throws ApiError
     */
    public static postPaymentList(
        payload: Payment,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payments',
            body: payload,
            errors: {
                400: `Validation error`,
                404: `Project or client not found`,
            },
        });
    }
    /**
     * Get all payments with optional filtering and pagination
     * @param projectId Filter by project ID
     * @param clientId Filter by client ID
     * @param status Filter by status
     * @param dateFrom Filter by date from (YYYY-MM-DD)
     * @param dateTo Filter by date to (YYYY-MM-DD)
     * @param currency Currency for conversion
     * @param sort Sort field
     * @param page Page number
     * @param perPage Items per page
     * @returns any Success
     * @throws ApiError
     */
    public static getPaymentList(
        projectId?: number,
        clientId?: number,
        status?: string,
        dateFrom?: string,
        dateTo?: string,
        currency?: string,
        sort: string = 'date',
        page?: number,
        perPage?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/payments',
            query: {
                'project_id': projectId,
                'client_id': clientId,
                'status': status,
                'date_from': dateFrom,
                'date_to': dateTo,
                'currency': currency,
                'sort': sort,
                'page': page,
                'per_page': perPage,
            },
        });
    }
    /**
     * Generate payments for a project based on its payment plan
     * @param payload
     * @returns any Payments generated successfully
     * @throws ApiError
     */
    public static postGeneratePayments(
        payload: GeneratePayments,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payments/generate',
            body: payload,
            errors: {
                400: `Invalid input`,
                404: `Project not found`,
            },
        });
    }
    /**
     * Get overdue payments
     * @param currency Currency for conversion
     * @returns any Success
     * @throws ApiError
     */
    public static getOverduePayments(
        currency?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/payments/overdue',
            query: {
                'currency': currency,
            },
        });
    }
    /**
     * Get upcoming payments within specified days
     * @param days Number of days to look ahead
     * @param currency Currency for conversion
     * @returns any Success
     * @throws ApiError
     */
    public static getUpcomingPayments(
        days: number = 30,
        currency?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/payments/upcoming',
            query: {
                'days': days,
                'currency': currency,
            },
        });
    }
    /**
     * Update a payment
     * @param id
     * @param payload
     * @returns any Payment updated successfully
     * @throws ApiError
     */
    public static putPaymentDetail(
        id: number,
        payload: Payment,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/payments/{id}',
            path: {
                'id': id,
            },
            body: payload,
            errors: {
                400: `Validation error`,
                404: `Payment not found`,
            },
        });
    }
    /**
     * Get a payment by ID
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getPaymentDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/payments/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Payment not found`,
            },
        });
    }
    /**
     * Update payment status
     * @param id
     * @param payload
     * @returns any Payment status updated successfully
     * @throws ApiError
     */
    public static patchPaymentStatusUpdate(
        id: number,
        payload: PaymentStatusUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/payments/{id}/status',
            path: {
                'id': id,
            },
            body: payload,
            errors: {
                400: `Validation error`,
                404: `Payment not found`,
            },
        });
    }
}
