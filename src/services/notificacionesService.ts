import { ApiError, apiRequest } from './apiClient';

export type NotificacionItem = {
  id: string;
  title: string;
  text: string;
  date?: string | null;
  read?: boolean;
  type?: string | null;
};

type ApiRow = Record<string, unknown>;

export async function getNotificaciones(userId: number, top = 20) {
  if (userId <= 0) return [];

  const params = new URLSearchParams({ top: String(top) });
  const endpoints = [
    `/api/notificaciones?${params.toString()}`,
    `/api/notificaciones/mobile?${params.toString()}`,
    `/api/notifications?${params.toString()}`,
    `/api/usuarios/${userId}/notificaciones?top=${top}`,
  ];

  const errors: unknown[] = [];

  for (const endpoint of endpoints) {
    try {
      const response = await apiRequest<ApiRow[] | ApiRow>(endpoint);
      return normalizeNotificationRows(response).map(toNotificationItem);
    } catch (error) {
      errors.push(error);
      if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 0)) throw error;
    }
  }

  const non404Error = errors.find((error) => !(error instanceof ApiError && error.status === 404));
  if (non404Error) throw non404Error;

  throw new ApiError(404, 'No existe una ruta de notificaciones configurada en el backend.');
}

function normalizeNotificationRows(response: ApiRow[] | ApiRow): ApiRow[] {
  if (Array.isArray(response)) return response;

  const candidates = [
    response.items,
    response.Items,
    response.data,
    response.Data,
    response.notificaciones,
    response.Notificaciones,
    response.notifications,
    response.Notifications,
    response.result,
    response.Result,
    response.results,
    response.Results,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) return value as ApiRow[];
    if (isRecord(value)) {
      const nested = normalizeNotificationRows(value);
      if (nested.length) return nested;
    }
  }

  const firstArray = Object.values(response).find(Array.isArray);
  if (Array.isArray(firstArray)) return firstArray as ApiRow[];

  return Object.keys(response).length ? [response] : [];
}

function toNotificationItem(row: ApiRow): NotificacionItem {
  const title = text(pickValue(row, ['titulo', 'Titulo', 'title', 'Title', 'asunto', 'Asunto', 'tipo', 'Tipo'])) || 'Notificacion';
  const detail = text(pickValue(row, ['mensaje', 'Mensaje', 'descripcion', 'Descripcion', 'detalle', 'Detalle', 'body', 'Body', 'texto', 'Texto']));
  const date = text(pickValue(row, ['fecha', 'Fecha', 'fechaCreacion', 'FechaCreacion', 'createdAt', 'CreatedAt'])) || null;
  const id = text(pickValue(row, ['id', 'Id', 'idNotificacion', 'IdNotificacion', 'codigo', 'Codigo'])) || `${title}-${date ?? ''}-${detail}`.slice(0, 120);

  return {
    id,
    title,
    text: detail || 'Sin detalle disponible.',
    date,
    read: booleanValue(pickValue(row, ['leido', 'Leido', 'read', 'Read', 'visto', 'Visto'])),
    type: text(pickValue(row, ['tipo', 'Tipo', 'categoria', 'Categoria', 'nivel', 'Nivel'])) || null,
  };
}

function pickValue(row: ApiRow, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== null && row[key] !== undefined) return row[key];
  }

  const normalizedKeys = keys.map(normalizeKey);
  const entry = Object.entries(row).find(([key, value]) => value !== null && value !== undefined && normalizedKeys.includes(normalizeKey(key)));

  return entry?.[1];
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isRecord(value: unknown): value is ApiRow {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function booleanValue(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return ['true', '1', 'si', 'sí', 'leido', 'leído'].includes(value.trim().toLowerCase());
  return false;
}
