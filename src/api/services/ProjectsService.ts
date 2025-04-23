/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Project } from '../models/Project';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProjectsService {
    /**
     * Create a new project with payment plan
     * @param payload
     * @returns any Project created successfully
     * @throws ApiError
     */
    public static postProjectList(
        payload: Project,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/projects',
            body: payload,
            errors: {
                400: `Validation error`,
                404: `Client not found`,
            },
        });
    }
    /**
     * Get all projects with optional filtering and pagination
     * @param clientId Filter by client ID
     * @param status Filter by status
     * @param sort Sort field
     * @param page Page number
     * @param perPage Items per page
     * @returns any Success
     * @throws ApiError
     */
    public static getProjectList(
        clientId?: number,
        status?: string,
        sort?: string,
        page?: number,
        perPage?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/projects',
            query: {
                'client_id': clientId,
                'status': status,
                'sort': sort,
                'page': page,
                'per_page': perPage,
            },
        });
    }
    /**
     * Update a project
     * @param id
     * @param payload
     * @returns any Project updated successfully
     * @throws ApiError
     */
    public static putProjectDetail(
        id: number,
        payload: Project,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/projects/{id}',
            path: {
                'id': id,
            },
            body: payload,
            errors: {
                400: `Validation error`,
                404: `Project not found`,
            },
        });
    }
    /**
     * Get a project by ID
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getProjectDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/projects/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Project not found`,
            },
        });
    }
    /**
     * Upload a document for a project
     * @param id
     * @param name Document name
     * @param type Document type
     * @param file Document file
     * @returns any Document uploaded successfully
     * @throws ApiError
     */
    public static postProjectDocuments(
        id: number,
        name: string,
        type: string,
        file: Blob,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/projects/{id}/documents',
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
                404: `Project not found`,
            },
        });
    }
    /**
     * Get all documents for a project
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getProjectDocuments(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/projects/{id}/documents',
            path: {
                'id': id,
            },
            errors: {
                404: `Project not found`,
            },
        });
    }
}
