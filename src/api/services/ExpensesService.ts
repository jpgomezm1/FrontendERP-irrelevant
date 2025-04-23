/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccruedExpense } from '../models/AccruedExpense';
import type { Expense } from '../models/Expense';
import type { RecurringExpense } from '../models/RecurringExpense';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExpensesService {
    /**
     * Create a new expense
     * @param description Expense description
     * @param date Expense date (YYYY-MM-DD)
     * @param amount Expense amount
     * @param currency Currency (COP or USD)
     * @param category Expense category
     * @param paymentMethod Payment method
     * @param notes Additional notes
     * @param receipt Receipt file
     * @returns any Expense created successfully
     * @throws ApiError
     */
    public static postExpenseList(
        description: string,
        date: string,
        amount: number,
        currency: string,
        category: string,
        paymentMethod: string,
        notes?: string,
        receipt?: Blob,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/expenses',
            query: {
                'description': description,
                'date': date,
                'amount': amount,
                'currency': currency,
                'category': category,
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
     * Get all expenses with optional filtering and pagination
     * @param category Filter by category
     * @param dateFrom Filter by date from (YYYY-MM-DD)
     * @param dateTo Filter by date to (YYYY-MM-DD)
     * @param currency Currency for conversion
     * @param sort Sort field
     * @param page Page number
     * @param perPage Items per page
     * @returns any Success
     * @throws ApiError
     */
    public static getExpenseList(
        category?: string,
        dateFrom?: string,
        dateTo?: string,
        currency?: string,
        sort?: string,
        page?: number,
        perPage?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/expenses',
            query: {
                'category': category,
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
     * Create a new accrued expense
     * @param payload
     * @returns any Accrued expense created successfully
     * @throws ApiError
     */
    public static postAccruedExpenseList(
        payload: AccruedExpense,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/expenses/accrued',
            body: payload,
            errors: {
                400: `Validation error`,
            },
        });
    }
    /**
     * Get all accrued expenses with optional filtering and pagination
     * @param status Filter by status
     * @param category Filter by category
     * @param dateFrom Filter by due date from (YYYY-MM-DD)
     * @param dateTo Filter by due date to (YYYY-MM-DD)
     * @param isRecurring Filter by recurring flag
     * @param page Page number
     * @param perPage Items per page
     * @returns any Success
     * @throws ApiError
     */
    public static getAccruedExpenseList(
        status?: string,
        category?: string,
        dateFrom?: string,
        dateTo?: string,
        isRecurring?: boolean,
        page?: number,
        perPage?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/expenses/accrued',
            query: {
                'status': status,
                'category': category,
                'date_from': dateFrom,
                'date_to': dateTo,
                'is_recurring': isRecurring,
                'page': page,
                'per_page': perPage,
            },
        });
    }
    /**
     * Get overdue accrued expenses
     * @param currency Currency for conversion
     * @returns any Success
     * @throws ApiError
     */
    public static getOverdueAccruedExpenses(
        currency?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/expenses/accrued/overdue',
            query: {
                'currency': currency,
            },
        });
    }
    /**
     * Get upcoming accrued expenses within specified days
     * @param days Number of days to look ahead
     * @param currency Currency for conversion
     * @returns any Success
     * @throws ApiError
     */
    public static getUpcomingAccruedExpenses(
        days: number = 30,
        currency?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/expenses/accrued/upcoming',
            query: {
                'days': days,
                'currency': currency,
            },
        });
    }
    /**
     * Update an accrued expense
     * @param id
     * @param payload
     * @returns any Accrued expense updated successfully
     * @throws ApiError
     */
    public static putAccruedExpenseDetail(
        id: number,
        payload: AccruedExpense,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/expenses/accrued/{id}',
            path: {
                'id': id,
            },
            body: payload,
            errors: {
                400: `Validation error`,
                404: `Accrued expense not found`,
            },
        });
    }
    /**
     * Delete an accrued expense
     * @param id
     * @returns any Accrued expense deleted successfully
     * @throws ApiError
     */
    public static deleteAccruedExpenseDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/expenses/accrued/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Accrued expense not found`,
            },
        });
    }
    /**
     * Get an accrued expense by ID
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getAccruedExpenseDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/expenses/accrued/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Accrued expense not found`,
            },
        });
    }
    /**
     * Get all expense categories with their totals
     * @returns any Success
     * @throws ApiError
     */
    public static getExpenseCategories(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/expenses/categories',
        });
    }
    /**
     * Create a new recurring expense
     * @param payload
     * @returns any Recurring expense created successfully
     * @throws ApiError
     */
    public static postRecurringExpenseList(
        payload: RecurringExpense,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/expenses/recurring',
            body: payload,
            errors: {
                400: `Validation error`,
            },
        });
    }
    /**
     * Get all recurring expenses with optional filtering and pagination
     * @param status Filter by status
     * @param category Filter by category
     * @param frequency Filter by frequency
     * @param page Page number
     * @param perPage Items per page
     * @returns any Success
     * @throws ApiError
     */
    public static getRecurringExpenseList(
        status?: string,
        category?: string,
        frequency?: string,
        page?: number,
        perPage?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/expenses/recurring',
            query: {
                'status': status,
                'category': category,
                'frequency': frequency,
                'page': page,
                'per_page': perPage,
            },
        });
    }
    /**
     * Update a recurring expense
     * @param id
     * @param payload
     * @returns any Recurring expense updated successfully
     * @throws ApiError
     */
    public static putRecurringExpenseDetail(
        id: number,
        payload: RecurringExpense,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/expenses/recurring/{id}',
            path: {
                'id': id,
            },
            body: payload,
            errors: {
                400: `Validation error`,
                404: `Recurring expense not found`,
            },
        });
    }
    /**
     * Delete a recurring expense
     * @param id
     * @returns any Recurring expense deleted successfully
     * @throws ApiError
     */
    public static deleteRecurringExpenseDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/expenses/recurring/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Recurring expense not found`,
                409: `Cannot delete recurring expense with associated accrued expenses`,
            },
        });
    }
    /**
     * Get a recurring expense by ID
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getRecurringExpenseDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/expenses/recurring/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Recurring expense not found`,
            },
        });
    }
    /**
     * Generate accrued expenses for a recurring expense
     * @param id
     * @param months Number of months to generate
     * @returns any Accrued expenses generated successfully
     * @throws ApiError
     */
    public static postGenerateAccruedExpenses(
        id: number,
        months: number = 3,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/expenses/recurring/{id}/generate',
            path: {
                'id': id,
            },
            query: {
                'months': months,
            },
            errors: {
                400: `Error generating accrued expenses`,
                404: `Recurring expense not found`,
            },
        });
    }
    /**
     * Update an expense
     * @param id
     * @param payload
     * @returns any Expense updated successfully
     * @throws ApiError
     */
    public static putExpenseDetail(
        id: number,
        payload: Expense,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/expenses/{id}',
            path: {
                'id': id,
            },
            body: payload,
            errors: {
                400: `Validation error`,
                404: `Expense not found`,
            },
        });
    }
    /**
     * Delete an expense
     * @param id
     * @returns any Expense deleted successfully
     * @throws ApiError
     */
    public static deleteExpenseDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/expenses/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Error deleting expense`,
                404: `Expense not found`,
            },
        });
    }
    /**
     * Get an expense by ID
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getExpenseDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/expenses/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Expense not found`,
            },
        });
    }
}
