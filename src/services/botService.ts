import { BOT_CHAT_PATH, BOT_HISTORY_FILE_PREFIX, BOT_SESSION_ID, BOT_SESSION_STORAGE_PREFIX } from '../config/bot';
import { apiRequest } from './apiClient';
import type { BotFeedbackState, BotMessage, BotProgressStep } from '../types/bot';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';

export type BotChatResponse = {
  requestId?: string;
  sessionId?: string;
  estadoVersion?: number;
  respuesta?: string;
  response?: string;
  mensaje?: string;
  message?: string;
  estado?: string;
  facturaDraft?: BotFacturaDraft;
  requiereConfirmacion?: boolean;
  emitida?: boolean;
  accionDetectada?: string | null;
  rutaSugerida?: string | null;
  seleccionPendienteTipo?: string | null;
  seleccionPendienteMensaje?: string | null;
  opcionesSeleccion?: BotSelectionOption[];
  data?: { respuesta?: string; response?: string; mensaje?: string; message?: string };
  progreso?: BotProgressStep[];
  datosFaltantes?: string[];
  operacionPendiente?: { tipo?: string; resumen?: string; expiraEn?: string | null } | null;
};

export type BotFacturaDraft = {
  cliente?: { id?: number; nombre?: string; identificacion?: string | null } | null;
  items?: Array<{
    id?: string;
    descripcion?: string;
    cantidad?: number;
    precioUnitario?: number;
    tarifaPorcentaje?: number;
    impuesto?: number;
    total?: number;
  }>;
  subtotal?: number;
  impuesto?: number;
  total?: number;
  formaPago?: string | null;
};

export type BotSelectionOption = {
  indice: number;
  tipo: string;
  etiqueta: string;
  descripcion?: string | null;
  cliente?: { id?: number; nombre?: string; identificacion?: string | null } | null;
  producto?: { id?: number; nombre?: string; precioUnitario?: number; tarifaPorcentaje?: number; codigoPrincipal?: string | null } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeClient(value: unknown) {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;
  return {
    id: asNumber(value.id),
    nombre: asString(value.nombre),
    identificacion: value.identificacion === null ? null : asString(value.identificacion),
  };
}

function normalizeInvoiceDraft(value: unknown): BotFacturaDraft | undefined {
  if (!isRecord(value)) return undefined;
  const items = Array.isArray(value.items)
    ? value.items.filter(isRecord).map((item) => ({
      id: asString(item.id),
      descripcion: asString(item.descripcion),
      cantidad: asNumber(item.cantidad),
      precioUnitario: asNumber(item.precioUnitario),
      tarifaPorcentaje: asNumber(item.tarifaPorcentaje),
      impuesto: asNumber(item.impuesto),
      total: asNumber(item.total),
    }))
    : undefined;

  return {
    cliente: normalizeClient(value.cliente),
    items,
    subtotal: asNumber(value.subtotal),
    impuesto: asNumber(value.impuesto),
    total: asNumber(value.total),
    formaPago: value.formaPago === null ? null : asString(value.formaPago),
  };
}

function normalizeSelectionOptions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || asNumber(item.indice) === undefined || !asString(item.tipo) || !asString(item.etiqueta)) return [];
    return [{
      indice: asNumber(item.indice) as number,
      tipo: asString(item.tipo) as string,
      etiqueta: asString(item.etiqueta) as string,
      descripcion: item.descripcion === null ? null : asString(item.descripcion),
      cliente: normalizeClient(item.cliente),
      producto: isRecord(item.producto)
        ? {
          id: asNumber(item.producto.id),
          nombre: asString(item.producto.nombre),
          precioUnitario: asNumber(item.producto.precioUnitario),
          tarifaPorcentaje: asNumber(item.producto.tarifaPorcentaje),
          codigoPrincipal: item.producto.codigoPrincipal === null ? null : asString(item.producto.codigoPrincipal),
        }
        : item.producto === null ? null : undefined,
    }];
  });
}

function normalizeProgress(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || !asString(item.id) || !asString(item.label)) return [];
    const status: BotProgressStep['status'] = item.status === 'pending' || item.status === 'completed' || item.status === 'warning' ? item.status : undefined;
    return [{ id: asString(item.id) as string, label: asString(item.label) as string, detail: asString(item.detail), status }];
  });
}

function normalizePendingOperation(value: unknown) {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;
  return { tipo: asString(value.tipo), resumen: asString(value.resumen), expiraEn: value.expiraEn === null ? null : asString(value.expiraEn) };
}

function normalizeBotResponse(value: unknown): BotChatResponse | string | null {
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return null;
  const data = isRecord(value.data)
    ? { respuesta: asString(value.data.respuesta), response: asString(value.data.response), mensaje: asString(value.data.mensaje), message: asString(value.data.message) }
    : undefined;
  return {
    requestId: asString(value.requestId),
    sessionId: asString(value.sessionId),
    estadoVersion: asNumber(value.estadoVersion),
    respuesta: asString(value.respuesta),
    response: asString(value.response),
    mensaje: asString(value.mensaje),
    message: asString(value.message),
    estado: asString(value.estado),
    facturaDraft: normalizeInvoiceDraft(value.facturaDraft),
    requiereConfirmacion: typeof value.requiereConfirmacion === 'boolean' ? value.requiereConfirmacion : undefined,
    emitida: typeof value.emitida === 'boolean' ? value.emitida : undefined,
    accionDetectada: value.accionDetectada === null ? null : asString(value.accionDetectada),
    rutaSugerida: value.rutaSugerida === null ? null : asString(value.rutaSugerida),
    seleccionPendienteTipo: value.seleccionPendienteTipo === null ? null : asString(value.seleccionPendienteTipo),
    seleccionPendienteMensaje: value.seleccionPendienteMensaje === null ? null : asString(value.seleccionPendienteMensaje),
    opcionesSeleccion: normalizeSelectionOptions(value.opcionesSeleccion),
    data,
    progreso: normalizeProgress(value.progreso),
    datosFaltantes: Array.isArray(value.datosFaltantes) ? value.datosFaltantes.filter((item): item is string => typeof item === 'string') : [],
    operacionPendiente: normalizePendingOperation(value.operacionPendiente),
  };
}

let activeBotSession: { userId: number; sessionId: string } | null = null;
let botHistoryWrite = Promise.resolve();
const BOT_HISTORY_TTL_MS = 24 * 60 * 60 * 1000;
const BOT_HISTORY_KEY_PREFIX = 'efact.bot.history.key.';

function historyFileUri(userId: number) {
  return userId > 0 && FileSystem.documentDirectory ? `${FileSystem.documentDirectory}${BOT_HISTORY_FILE_PREFIX}${userId}.json` : null;
}

function historyKey(userId: number) {
  return `${BOT_HISTORY_KEY_PREFIX}${userId}`;
}

function toBase64(bytes: Uint8Array) {
  if (typeof globalThis.btoa !== 'function') return null;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary);
}

function fromBase64(value: string) {
  if (typeof globalThis.atob !== 'function') return null;
  const binary = globalThis.atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function getHistoryKey(userId: number, create: boolean) {
  if (userId <= 0 || !(await SecureStore.isAvailableAsync())) return null;
  try {
    const stored = await SecureStore.getItemAsync(historyKey(userId));
    if (stored) return stored;
    if (!create || !globalThis.crypto?.getRandomValues) return null;
    const bytes = new Uint8Array(32);
    globalThis.crypto.getRandomValues(bytes);
    const generated = toBase64(bytes);
    if (!generated) return null;
    await SecureStore.setItemAsync(historyKey(userId), generated);
    return generated;
  } catch {
    return null;
  }
}

async function encryptHistory(userId: number, value: string) {
  const cryptoApi = globalThis.crypto;
  const keyValue = await getHistoryKey(userId, true);
  if (!cryptoApi?.subtle || !cryptoApi.getRandomValues || !keyValue) return null;
  const rawKey = fromBase64(keyValue);
  if (!rawKey) return null;

  const key = await cryptoApi.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = new Uint8Array(12);
  cryptoApi.getRandomValues(iv);
  const encrypted = await cryptoApi.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(value),
  );
  const encodedIv = toBase64(iv);
  const encodedData = toBase64(new Uint8Array(encrypted));
  return encodedIv && encodedData ? `v1.${encodedIv}.${encodedData}` : null;
}

async function decryptHistory(userId: number, value: string) {
  const cryptoApi = globalThis.crypto;
  const keyValue = await getHistoryKey(userId, false);
  if (!cryptoApi?.subtle || !keyValue || !value.startsWith('v1.')) return null;
  const [, encodedIv, encodedData] = value.split('.');
  const iv = encodedIv ? fromBase64(encodedIv) : null;
  const encrypted = encodedData ? fromBase64(encodedData) : null;
  const rawKey = fromBase64(keyValue);
  if (!iv || !encrypted || !rawKey) return null;

  const key = await cryptoApi.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['decrypt']);
  const decrypted = await cryptoApi.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  return new TextDecoder().decode(decrypted);
}

function sanitizeHistoryMessage(message: BotMessage): BotMessage {
  return {
    ...message,
    text: message.text
      .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, '[correo oculto]')
      .replace(/\b\d{10,13}\b/g, '[identificación oculta]'),
  };
}

function isBotMessage(value: unknown): value is BotMessage {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<BotMessage>;
  return typeof candidate.id === 'string' && (candidate.role === 'user' || candidate.role === 'assistant') && typeof candidate.text === 'string';
}

export async function loadBotHistory(userId: number) {
  const uri = historyFileUri(userId);
  if (!uri) return null;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return null;
    const decrypted = await decryptHistory(userId, await FileSystem.readAsStringAsync(uri));
    if (!decrypted) return null;
    const parsed = JSON.parse(decrypted) as { savedAt?: number; messages?: unknown; feedbackByMessage?: unknown };
    if (!parsed.savedAt || Date.now() - parsed.savedAt > BOT_HISTORY_TTL_MS) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      return null;
    }
    const messages = Array.isArray(parsed.messages) ? parsed.messages.filter(isBotMessage).slice(-100) : [];
    const feedbackByMessage: BotFeedbackState = {};
    if (parsed.feedbackByMessage && typeof parsed.feedbackByMessage === 'object') {
      for (const [id, value] of Object.entries(parsed.feedbackByMessage)) {
        if (value === 'like' || value === 'dislike') feedbackByMessage[id] = value;
      }
    }
    return { messages, feedbackByMessage };
  } catch {
    return null;
  }
}

export function saveBotHistory(userId: number, messages: BotMessage[], feedbackByMessage: BotFeedbackState) {
  const uri = historyFileUri(userId);
  if (!uri) return Promise.resolve();
  const value = JSON.stringify({
    savedAt: Date.now(),
    messages: messages.slice(-100).map(sanitizeHistoryMessage),
    feedbackByMessage,
  });
  botHistoryWrite = botHistoryWrite
    .then(async () => {
      const encrypted = await encryptHistory(userId, value);
      if (!encrypted) return;
      await FileSystem.writeAsStringAsync(uri, encrypted);
    })
    .catch(() => undefined);
  return botHistoryWrite;
}

export function clearBotHistory(userId: number) {
  const uri = historyFileUri(userId);
  botHistoryWrite = botHistoryWrite
    .then(async () => {
      if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
      if (userId > 0 && await SecureStore.isAvailableAsync()) {
        await SecureStore.deleteItemAsync(historyKey(userId));
        await SecureStore.deleteItemAsync(storageKey(userId));
      }
    })
    .catch(() => undefined);
  if (activeBotSession?.userId === userId) activeBotSession = null;
  return botHistoryWrite;
}

function buildSessionId(userId: number) {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `mobile-${userId}-${Date.now().toString(36)}-${randomPart}`;
}

function storageKey(userId: number) {
  return `${BOT_SESSION_STORAGE_PREFIX}${userId}`;
}

async function readStoredSession(userId: number) {
  if (userId <= 0 || !(await SecureStore.isAvailableAsync())) return null;
  try {
    return await SecureStore.getItemAsync(storageKey(userId));
  } catch {
    return null;
  }
}

async function saveStoredSession(userId: number, sessionId: string) {
  if (userId <= 0 || !(await SecureStore.isAvailableAsync())) return;
  try {
    await SecureStore.setItemAsync(storageKey(userId), sessionId);
  } catch {
    // La sesión sigue funcionando en memoria si el dispositivo no permite almacenamiento seguro.
  }
}

export async function getOrCreateBotSessionId(userId: number) {
  if (activeBotSession?.userId === userId) return activeBotSession.sessionId;

  const stored = await readStoredSession(userId);
  const sessionId = stored?.trim() || (BOT_SESSION_ID && userId <= 0 ? BOT_SESSION_ID : buildSessionId(userId));
  activeBotSession = { userId, sessionId };
  if (sessionId !== stored) await saveStoredSession(userId, sessionId);
  return sessionId;
}

export async function resetBotSession(userId: number) {
  const sessionId = buildSessionId(userId);
  activeBotSession = { userId, sessionId };
  await saveStoredSession(userId, sessionId);
  return sessionId;
}

export async function sendBotMessage(input: { message: string; userId?: number; sessionId?: string; contexto?: string; modo?: 'texto' | 'voz'; requestId?: string }) {
  const sessionId = input.sessionId ?? await getOrCreateBotSessionId(input.userId ?? 0);
  const response = normalizeBotResponse(await apiRequest<unknown>(BOT_CHAT_PATH, {
    method: 'POST',
    timeoutMs: 60000,
    body: JSON.stringify({
      requestId: input.requestId,
        sessionId,
        mensaje: input.message.trim(),
        modo: input.modo ?? 'texto',
        contexto: input.contexto,
      }),
  }));

  if (!response) throw new Error('El bot devolvió una respuesta inválida.');

  const answer = typeof response === 'string' ? response : response.respuesta ?? response.response ?? response.mensaje ?? response.message
    ?? response.data?.respuesta ?? response.data?.response ?? response.data?.mensaje ?? response.data?.message;
  if (!answer?.trim()) throw new Error('El bot no devolvio una respuesta valida.');
  const responseSessionId = typeof response === 'string' ? sessionId : response.sessionId ?? sessionId;
  if (input.userId && input.userId > 0) {
    activeBotSession = { userId: input.userId, sessionId: responseSessionId };
    await saveStoredSession(input.userId, responseSessionId);
  }
  return {
    requestId: typeof response === 'string' ? input.requestId : response.requestId ?? input.requestId,
    sessionId: responseSessionId,
    estadoVersion: typeof response === 'string' ? undefined : response.estadoVersion,
    answer: answer.trim(),
    progress: typeof response === 'string' ? [] : response.progreso ?? [],
    missing: typeof response === 'string' ? [] : response.datosFaltantes ?? [],
    estado: typeof response === 'string' ? undefined : response.estado,
    draft: typeof response === 'string' ? undefined : response.facturaDraft,
    requiresConfirmation: typeof response === 'string' ? false : response.requiereConfirmacion === true,
    emitted: typeof response === 'string' ? false : response.emitida === true,
    action: typeof response === 'string' ? undefined : response.accionDetectada,
    pendingSelectionType: typeof response === 'string' ? undefined : response.seleccionPendienteTipo,
    pendingSelectionMessage: typeof response === 'string' ? undefined : response.seleccionPendienteMensaje,
    selectionOptions: typeof response === 'string' ? [] : response.opcionesSeleccion ?? [],
    suggestedRoute: typeof response === 'string' ? undefined : response.rutaSugerida,
    pendingOperation: typeof response === 'string' ? null : response.operacionPendiente ?? null,
  };
}
