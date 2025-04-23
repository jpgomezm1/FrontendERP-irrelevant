/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DocumentsService {
    /**
     * Upload a new document
     * @param entityType Entity type (client or project)
     * @param entityId Entity ID
     * @param name Document name
     * @param type Document type
     * @param file Document file
     * @returns any Document uploaded successfully
     * @throws ApiError
     */
    public static postDocumentList(
        entityType: string,
        entityId: number,
        name: string,
        type: string,
        file: Blob,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/documents',
            query: {
                'entity_type': entityType,
                'entity_id': entityId,
                'name': name,
                'type': type,
            },
            formData: {
                'file': file,
            },
            errors: {
                400: `Invalid input`,
            },
        });
    }
    /**
     * Get all documents with optional filtering and pagination
     * @param entityType Filter by entity type
     * @param entityId Filter by entity ID
     * @param type Filter by document type
     * @param page Page number
     * @param perPage Items per page
     * @returns any Success
     * @throws ApiError
     */
    public static getDocumentList(
        entityType?: string,
        entityId?: number,
        type?: string,
        page?: number,
        perPage?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/documents',
            query: {
                'entity_type': entityType,
                'entity_id': entityId,
                'type': type,
                'page': page,
                'per_page': perPage,
            },
        });
    }
    /**
     * Delete a document
     * @param id
     * @returns any Document deleted successfully
     * @throws ApiError
     */
    public static deleteDocumentDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/documents/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Error deleting document`,
                404: `Document not found`,
            },
        });
    }
    /**
     * Get a document by ID
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getDocumentDetail(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/documents/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Document not found`,
            },
        });
    }
    /**
     * Download a document
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getDocumentDownload(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/documents/{id}/download',
            path: {
                'id': id,
            },
            errors: {
                400: `Error downloading document`,
                404: `Document not found`,
            },
        });
    }
}
