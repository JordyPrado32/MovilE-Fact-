import { BOT_CHAT_PATH, BOT_SESSION_ID, BOT_SESSION_STORAGE_PREFIX } from '../config/bot';
import { apiRequest } from './apiClient';
import type { BotProgressStep } from '../types/bot';
import * as SecureStore from 'expo-secure-store';

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

let activeBotSession: { userId: number; sessionId: string } | null = null;

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
  const response = await apiRequest<BotChatResponse | string>(BOT_CHAT_PATH, {
    method: 'POST',
    timeoutMs: 60000,
    body: JSON.stringify({
      requestId: input.requestId,
      sessionId,
      mensaje: input.message.trim(),
      modo: input.modo ?? 'texto',
    }),
  });

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
