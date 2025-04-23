/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Client } from '../models/Client';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClientsService {
    /**
     * Create a new client
     * @param payload
     * @returns any Client created successfully
     * @throws ApiError
     */
    public static postClientList(
        payload: Client,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/clients',
            body: payload,
            errors: {
                400: `Validation error`,
            },
        });
    }
    /**
     * Get all clients with optional filtering and pagination
     * @param status Filter by status
     * @param sort Sort field
     * @param page Page number
     * @param perPage Items per page
     * @returns any Success
     * @throws ApiError
     */
    public static getClientList(
        status?: string,
        sort?: string,
        page?: number,
        perPage?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/clients',
            query: {
                'status': status,
                'sort': sort,
                'page': page,
                'per_page': perPage,
            },
        });
    }
    /**
     * Update a client
     * @param id
     * @param payload
     * @returns any Client updated successfully
     * @throws ApiError
     */
    public static putClientDetail(
        id: number,
        payload: Client,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/clients/{id}',
            path: {
                'id': id,
            },
            body: payload,
            errors: {
                400: `Validation error`,
                404: `Client not found`,
            },
        });
    }
    /**
     * Delete a client
     * @param id
     * @returns any Client deleted successfully
     * @throws ApiError
     */
    public static deleteClientDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/clients/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Client not found`,
                409: `Client has projects and cannot be deleted`,
            },
        });
    }
    /**
     * Get a client by ID
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getClientDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/clients/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Client not found`,
            },
        });
    }
    /**
     * Upload a document for a client
     * @param id
     * @param name Document name
     * @param type Document type
     * @param file Document file
     * @returns any Document uploaded successfully
     * @throws ApiError
     */
    public static postClientDocuments(
        id: number,
        name: string,
        type: string,
        file: Blob,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/clients/{id}/documents',
            path: {
                'id': id,
            },
            query: {
                'name': name,
                'type': type,
            },
            formData: {
                'file': file,
            },
            errors: {
                400: `Invalid input`,
                404: `Client not found`,
            },
        });
    }
    /**
     * Get all documents for a client
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getClientDocuments(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/clients/{id}/documents',
            path: {
                'id': id,
            },
            errors: {
                404: `Client not found`,
            },
        });
    }
}
