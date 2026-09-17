import { apiRequest } from './apiClient';
import * as SecureStore from 'expo-secure-store';

const DISMISSED_KEY_PREFIX = 'efact_dismissed_notifications_';
const dismissedWrites = new Map<number, Promise<void>>();

export type NotificacionItem = {
  id: string;
  title: string;
  text: string;
  date?: string | null;
  read?: boolean;
  type?: string | null;
  route?: string | null;
  view?: string | null;
  module?: string | null;
};

type ApiRow = Record<string, unknown>;

export async function getNotificaciones(userId: number, top = 20) {
  if (userId <= 0) return [];

  const response = await apiRequest<ApiRow[] | ApiRow>(`/api/notificaciones?top=${Math.max(1, Math.min(50, top))}`);
  return deduplicateNotifications(
    normalizeNotificationRows(response)
      .filter((row) => belongsToUser(row, userId))
      .map(toNotificationItem),
  );
}

export async function getDismissedNotificationIds(userId: number) {
  if (userId <= 0) return new Set<string>();

  try {
    const raw = await SecureStore.getItemAsync(`${DISMISSED_KEY_PREFIX}${userId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set<string>();
  }
}

export async function rememberDismissedNotificationIds(userId: number, ids: Iterable<string>) {
  if (userId <= 0) return;

  const previousWrite = dismissedWrites.get(userId) ?? Promise.resolve();
  const write = previousWrite.catch(() => undefined).then(async () => {
    const dismissed = await getDismissedNotificationIds(userId);
    for (const id of ids) dismissed.add(String(id));
    await SecureStore.setItemAsync(`${DISMISSED_KEY_PREFIX}${userId}`, JSON.stringify(Array.from(dismissed).slice(-500)));
  });
  dismissedWrites.set(userId, write);
  try {
    await write;
  } catch {
    // La bandeja del backend sigue siendo la fuente principal si SecureStore no esta disponible.
  } finally {
    if (dismissedWrites.get(userId) === write) dismissedWrites.delete(userId);
  }
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
    route: text(pickValue(row, ['ruta', 'Ruta', 'url', 'Url', 'path', 'Path', 'link', 'Link'])) || null,
    view: text(pickValue(row, ['vista', 'Vista', 'view', 'View', 'pantalla', 'Pantalla'])) || null,
    module: text(pickValue(row, ['modulo', 'Modulo', 'module', 'Module', 'servicio', 'Servicio'])) || null,
  };
}

function belongsToUser(row: ApiRow, userId: number) {
  const owner = pickValue(row, ['idUsuario', 'IdUsuario', 'userId', 'UserId', 'usuarioId', 'UsuarioId']);
  if (owner === null || owner === undefined || owner === '') return true;
  return String(owner) === String(userId);
}

function deduplicateNotifications(items: NotificacionItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.id}|${item.title}|${item.text}|${item.date ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
