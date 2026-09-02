import { API_BASE_URL } from '../config/api';

type RequestOptions = RequestInit & {
  token?: string;
  timeoutMs?: number;
  suppressErrorLog?: boolean;
};

const REQUEST_TIMEOUT_MS = 20000;
const DEFAULT_ERROR_MESSAGE = 'No se pudo completar la solicitud. Intenta nuevamente.';

let sessionToken: string | null = null;
let authSessionCookie: string | null = null;

export function setSessionToken(token?: string | null) {
  sessionToken = token?.trim() || null;
  if (!sessionToken) authSessionCookie = null;
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
  const { token, timeoutMs, suppressErrorLog, headers, ...requestOptions } = options;
  const authToken = token ?? sessionToken;
  const isFormData = typeof FormData !== 'undefined' && requestOptions.body instanceof FormData;
  const controller = new AbortController();
  const requestTimeoutMs = timeoutMs ?? REQUEST_TIMEOUT_MS;
  const startedAt = Date.now();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

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
        ...(authSessionCookie ? { Cookie: authSessionCookie } : {}),
        ...headers,
      },
    });
  } catch (error) {
    if (!suppressErrorLog) logApiNetworkError(path, requestOptions.method, Date.now() - startedAt, requestTimeoutMs, error);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(0, 'La conexion con el servidor tardo demasiado.');
    }

    throw new ApiError(0, 'No se pudo conectar con el servidor.');
  } finally {
    clearTimeout(timeout);
  }

  const setCookie = response.headers.get('set-cookie');
  const authCookie = setCookie?.match(/(?:^|,\s*)(Auth_Session=[^;,]+)/i)?.[1];
  if (authCookie) authSessionCookie = authCookie;

  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  const body = contentType.includes('application/json') && text ? safeParseJson(text) : text;

  if (!response.ok) {
    const message = getErrorMessage(response.status, body, path);
    if (!suppressErrorLog) {
      logApiError(path, response.status, body, {
        contentType,
        elapsedMs: Date.now() - startedAt,
        method: requestOptions.method,
        timeoutMs: requestTimeoutMs,
      });
    }

    throw new ApiError(response.status, message);
  }

  return body as T;
}

export async function apiRequestBinary(path: string, options: RequestOptions = {}) {
  const { token, timeoutMs, suppressErrorLog, headers, ...requestOptions } = options;
  const authToken = token ?? sessionToken;
  const controller = new AbortController();
  const requestTimeoutMs = timeoutMs ?? REQUEST_TIMEOUT_MS;
  const startedAt = Date.now();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...requestOptions,
      signal: controller.signal,
      headers: {
        Accept: 'application/pdf, application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(authSessionCookie ? { Cookie: authSessionCookie } : {}),
        ...headers,
      },
    });
  } catch (error) {
    if (!suppressErrorLog) logApiNetworkError(path, requestOptions.method, Date.now() - startedAt, requestTimeoutMs, error);

    if (error instanceof Error && error.name === 'AbortError') throw new ApiError(0, 'La conexion con el servidor tardo demasiado.');
    throw new ApiError(0, 'No se pudo conectar con el servidor.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text();
    if (!suppressErrorLog) {
      logApiError(path, response.status, text, {
        contentType: response.headers.get('content-type') ?? '',
        elapsedMs: Date.now() - startedAt,
        method: requestOptions.method,
        timeoutMs: requestTimeoutMs,
      });
    }
    throw new ApiError(response.status, text || `HTTP ${response.status}: ${DEFAULT_ERROR_MESSAGE}`);
  }

  return { bytes: await response.arrayBuffer(), contentType: response.headers.get('content-type') ?? 'application/pdf' };
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

function logApiError(
  path: string,
  status: number,
  body: unknown,
  context: { contentType?: string; elapsedMs?: number; method?: string; timeoutMs?: number } = {},
) {
  const bodyText = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
  const preview = bodyText.length > 4000 ? `${bodyText.slice(0, 4000)}... [truncado]` : bodyText;
  console.error('[API ERROR]', {
    baseUrl: API_BASE_URL,
    path,
    method: context.method ?? 'GET',
    status,
    elapsedMs: context.elapsedMs,
    timeoutMs: context.timeoutMs,
    contentType: context.contentType,
    localDebug: getLocalApiErrorDebug(bodyText),
    body: preview,
  });

  logLocalApiErrorDetails(path, status, bodyText, context);
}

function getLocalApiErrorDebug(bodyText: string) {
  if (!looksLikeHtml(bodyText)) return undefined;

  return {
    requestId: extractHtmlText(bodyText, /<strong>\s*Request ID:\s*<\/strong>\s*<code>(.*?)<\/code>/is),
    title: extractHtmlText(bodyText, /<title>(.*?)<\/title>/is),
    heading: extractHtmlText(bodyText, /<h1[^>]*>(.*?)<\/h1>/is),
    message: extractHtmlText(bodyText, /<h2[^>]*>(.*?)<\/h2>/is),
  };
}

function logLocalApiErrorDetails(
  path: string,
  status: number,
  bodyText: string,
  context: { contentType?: string; elapsedMs?: number; method?: string; timeoutMs?: number } = {},
) {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;

  const debug = getLocalApiErrorDebug(bodyText);
  if (!debug) return;

  console.error('[API LOCAL DEBUG]', {
    url: `${API_BASE_URL}${path}`,
    method: context.method ?? 'GET',
    status,
    elapsedMs: context.elapsedMs,
    timeoutMs: context.timeoutMs,
    contentType: context.contentType,
    requestId: debug.requestId,
    title: debug.title,
    message: debug.message,
    hint: 'Busca este requestId en los logs del backend ASP.NET para ver la excepcion exacta.',
  });
}

function extractHtmlText(html: string, pattern: RegExp) {
  const value = html.match(pattern)?.[1];
  if (!value) return undefined;

  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function logApiNetworkError(path: string, method: string | undefined, elapsedMs: number, timeoutMs: number, error: unknown) {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;

  console.error('[API NETWORK ERROR]', {
    url: `${API_BASE_URL}${path}`,
    method: method ?? 'GET',
    elapsedMs,
    timeoutMs,
    error: error instanceof Error ? error.message : String(error),
  });
}
