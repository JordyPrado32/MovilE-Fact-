import { apiRequest } from './apiClient';
import { PuntosEmisionData } from '../types/business';

export function getPuntosEmision(userId: number) {
  return apiRequest<PuntosEmisionData>(`/api/cajas?idUsuario=${userId}`);
}

export function createPuntoEmision(userId: number, puntoEmision: string, establecimiento?: string | null) {
  return apiRequest<void>(`/api/cajas?idUsuario=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ puntoEmision, establecimiento }),
  });
}

export function updatePuntoEmision(userId: number, sec: number, puntoEmision: string) {
  return apiRequest<void>(`/api/cajas/${sec}?idUsuario=${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ puntoEmision }),
  });
}

export function markPuntoPrincipal(userId: number, sec: number) {
  return apiRequest<void>(`/api/cajas/${sec}/principal?idUsuario=${userId}`, {
    method: 'PUT',
  });
}

export function deletePuntoEmision(userId: number, sec: number) {
  return apiRequest<void>(`/api/cajas/${sec}?idUsuario=${userId}`, {
    method: 'DELETE',
  });
}
