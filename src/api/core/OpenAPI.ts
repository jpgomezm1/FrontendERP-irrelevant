/* generated using openapi-typescript-codegen -- edited to set BASE dynamically */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiRequestOptions } from './ApiRequestOptions';

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;

export type OpenAPIConfig = {
  BASE: string;
  VERSION: string;
  WITH_CREDENTIALS: boolean;
  CREDENTIALS: 'include' | 'omit' | 'same-origin';
  TOKEN?: string | Resolver<string> | undefined;
  USERNAME?: string | Resolver<string> | undefined;
  PASSWORD?: string | Resolver<string> | undefined;
  HEADERS?: Headers | Resolver<Headers> | undefined;
  ENCODE_PATH?: ((path: string) => string) | undefined;
};

/**
 * Se establece la URL base leyendo la variable de entorno `VITE_API_URL`.
 * Si no existe (p. ej. tests o entornos no Vite) se hace fallback a la API local.
 */
export const OpenAPI: OpenAPIConfig = {
  BASE:
    (import.meta as any).env?.VITE_API_URL ??
    (typeof process !== 'undefined' ? process.env.VITE_API_URL : undefined) ??
    'http://localhost:5001/api',
  VERSION: '1.0',
  WITH_CREDENTIALS: false,
  CREDENTIALS: 'include',
  TOKEN: undefined,
  USERNAME: undefined,
  PASSWORD: undefined,
  HEADERS: undefined,
  ENCODE_PATH: undefined,
};
