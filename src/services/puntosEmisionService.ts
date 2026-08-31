import { apiRequest } from './apiClient';
import { PuntosEmisionData } from '../types/business';

export type PuntoDocumentoKey = 'factura' | 'nota-credito' | 'nota-debito' | 'liquidacion-compra' | 'guia-remision' | 'retencion';

export async function getPuntosEmision(userId: number) {
  return apiRequest<PuntosEmisionData>(`/api/cajas?idUsuario=${userId}`);
}

export function getPuntoEmisionSiguienteSecuencial(userId: number, documento: PuntoDocumentoKey, serie: string, codemisor?: number | null) {
  const params = new URLSearchParams({
    idUsuario: String(userId),
    documento,
    serie,
  });
  if (codemisor) params.set('codEmisor', String(codemisor));

  return apiRequest<{
    documento: string;
    serie: string;
    inicializada: boolean;
    secuenciaAnterior?: string | null;
    proximo?: string | null;
  }>(`/api/cajas/siguiente-secuencial?${params.toString()}`);
}

export function savePuntoEmisionSecuenciaInicial(input: {
  userId: number;
  documento: PuntoDocumentoKey;
  serie: string;
  codemisor?: number | null;
  habiaGenerado: boolean;
  secuenciaAnterior?: string | null;
}) {
  return apiRequest<{
    documento: string;
    serie: string;
    inicializada: boolean;
    secuenciaAnterior?: string | null;
    proximo?: string | null;
  }>(`/api/cajas/secuencia-inicial?idUsuario=${input.userId}`, {
    method: 'POST',
    body: JSON.stringify({
      documento: input.documento,
      serie: input.serie,
      codEmisor: input.codemisor,
      habiaGenerado: input.habiaGenerado,
      secuenciaAnterior: input.secuenciaAnterior,
    }),
  });
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
