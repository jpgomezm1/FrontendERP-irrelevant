/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Login } from '../models/Login';
import type { Register } from '../models/Register';
import type { Token } from '../models/Token';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * User login endpoint
     * @param payload
     * @returns Token Login successful
     * @throws ApiError
     */
    public static postLogin(
        payload: Login,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: payload,
            errors: {
                401: `Invalid credentials`,
            },
        });
    }
    /**
     * Logout endpoint - blacklist current token
     * @returns any Logout successful
     * @throws ApiError
     */
    public static postLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
        });
    }
    /**
     * Refresh access token
     * @returns any Token refreshed successfully
     * @throws ApiError
     */
    public static postTokenRefresh(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/refresh',
            errors: {
                401: `Invalid token`,
            },
        });
    }
    /**
     * Register a new user (admin access may be restricted in production)
     * @param payload
     * @returns any User registered successfully
     * @throws ApiError
     */
    public static postRegister(
        payload: Register,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: payload,
            errors: {
                400: `Validation error`,
            },
        });
    }
}
