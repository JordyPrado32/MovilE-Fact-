import { API_BASE_URL } from '../config/api';

type RequestOptions = RequestInit & {
  token?: string;
  timeoutMs?: number;
};

const REQUEST_TIMEOUT_MS = 20000;
const DEFAULT_ERROR_MESSAGE = 'No se pudo completar la solicitud. Intenta nuevamente.';

let sessionToken: string | null = null;

export function setSessionToken(token?: string | null) {
  sessionToken = token?.trim() || null;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, timeoutMs, headers, ...requestOptions } = options;
  const authToken = token ?? sessionToken;
  const isFormData = typeof FormData !== 'undefined' && requestOptions.body instanceof FormData;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs ?? REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...requestOptions,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(0, 'La conexion con el servidor tardo demasiado.');
    }

    throw new ApiError(0, 'No se pudo conectar con el servidor.');
  } finally {
    clearTimeout(timeout);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  const body = contentType.includes('application/json') && text ? safeParseJson(text) : text;

  if (!response.ok) {
    const message = getErrorMessage(response.status, body, path);

    throw new ApiError(response.status, message);
  }

  return body as T;
}

function safeParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(status: number, body: unknown, path: string) {
  if (status === 404) {
    return `HTTP 404: Ruta no encontrada en el backend (${path}). Revisa que el controlador exista o configura la ruta real en .env.`;
  }

  if (typeof body === 'string') {
    const message = body.trim();

    if (!message) {
      return `HTTP ${status}: ${DEFAULT_ERROR_MESSAGE}`;
    }

    if (looksLikeHtml(message)) {
      return status >= 500
        ? 'El servidor devolvio un error interno. Intenta nuevamente o revisa el backend.'
        : `HTTP ${status}: ${DEFAULT_ERROR_MESSAGE}`;
    }

    return message;
  }

  if (body && typeof body === 'object') {
    const errorBody = body as { message?: string; title?: string; detail?: string };
    return errorBody.message ?? errorBody.title ?? errorBody.detail ?? `HTTP ${status}: ${DEFAULT_ERROR_MESSAGE}`;
  }

  return `HTTP ${status}: ${DEFAULT_ERROR_MESSAGE}`;
}

function looksLikeHtml(value: string) {
  return /^\s*<!doctype html/i.test(value) || /^\s*<html[\s>]/i.test(value);
}
