/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Income } from '../models/Income';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IncomesService {
    /**
     * Create a new income
     * @param description Income description
     * @param date Income date (YYYY-MM-DD)
     * @param amount Income amount
     * @param currency Currency (COP or USD)
     * @param type Income type
     * @param paymentMethod Payment method
     * @param client Client name
     * @param notes Additional notes
     * @param receipt Receipt file
     * @returns any Income created successfully
     * @throws ApiError
     */
    public static postIncomeList(
        description: string,
        date: string,
        amount: number,
        currency: string,
        type: string,
        paymentMethod: string,
        client?: string,
        notes?: string,
        receipt?: Blob,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/incomes',
            query: {
                'description': description,
                'date': date,
                'amount': amount,
                'currency': currency,
                'type': type,
                'client': client,
                'payment_method': paymentMethod,
                'notes': notes,
            },
            formData: {
                'receipt': receipt,
            },
            errors: {
                400: `Validation error`,
            },
        });
    }
    /**
     * Get all incomes with optional filtering and pagination
     * @param type Filter by income type
     * @param dateFrom Filter by date from (YYYY-MM-DD)
     * @param dateTo Filter by date to (YYYY-MM-DD)
     * @param currency Currency for conversion
     * @param sort Sort field
     * @param page Page number
     * @param perPage Items per page
     * @returns any Success
     * @throws ApiError
     */
    public static getIncomeList(
        type?: string,
        dateFrom?: string,
        dateTo?: string,
        currency?: string,
        sort?: string,
        page?: number,
        perPage?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/incomes',
            query: {
                'type': type,
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
     * Get income analysis data
     * @param period Analysis period (month, quarter, year)
     * @param currency Currency for conversion
     * @returns any Success
     * @throws ApiError
     */
    public static getIncomeAnalysis(
        period: string = 'month',
        currency?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/incomes/analysis',
            query: {
                'period': period,
                'currency': currency,
            },
        });
    }
    /**
     * Update an income
     * @param id
     * @param payload
     * @returns any Income updated successfully
     * @throws ApiError
     */
    public static putIncomeDetail(
        id: number,
        payload: Income,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/incomes/{id}',
            path: {
                'id': id,
            },
            body: payload,
            errors: {
                400: `Validation error`,
                404: `Income not found`,
            },
        });
    }
    /**
     * Delete an income
     * @param id
     * @returns any Income deleted successfully
     * @throws ApiError
     */
    public static deleteIncomeDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/incomes/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Error deleting income`,
                404: `Income not found`,
            },
        });
    }
    /**
     * Get an income by ID
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getIncomeDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/incomes/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Income not found`,
            },
        });
    }
}
