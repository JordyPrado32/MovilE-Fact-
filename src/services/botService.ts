import { BOT_CHAT_PATH, BOT_SESSION_ID } from '../config/bot';
import { apiRequest } from './apiClient';

export type BotChatResponse = {
  respuesta?: string;
  response?: string;
  mensaje?: string;
  message?: string;
  data?: { respuesta?: string; response?: string; mensaje?: string; message?: string };
};

export async function sendBotMessage(input: { message: string; sessionId?: string }) {
  const response = await apiRequest<BotChatResponse | string>(BOT_CHAT_PATH, {
    method: 'POST',
    body: JSON.stringify({
      sessionId: input.sessionId ?? BOT_SESSION_ID,
      mensaje: input.message.trim(),
      modo: 'texto',
    }),
  });

  const answer = typeof response === 'string' ? response : response.respuesta ?? response.response ?? response.mensaje ?? response.message
    ?? response.data?.respuesta ?? response.data?.response ?? response.data?.mensaje ?? response.data?.message;
  if (!answer?.trim()) throw new Error('El bot no devolvio una respuesta valida.');
  return answer.trim();
}
