import { apiRequest } from './apiClient';
import { PuntoEmision, PuntosEmisionData } from '../types/business';

type ApiRow = Record<string, unknown>;

export async function getPuntosEmision(userId: number) {
  const data = await apiRequest<PuntosEmisionData>(`/api/cajas?idUsuario=${userId}`);

  try {
    const secuencias = await apiRequest<ApiRow[] | ApiRow>(`/api/cajas-secuencias?idUsuario=${userId}`);
    return mergeSecuencias(data, normalizeRows(secuencias));
  } catch {
    return data;
  }
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

function mergeSecuencias(data: PuntosEmisionData, secuencias: ApiRow[]): PuntosEmisionData {
  if (!secuencias.length || !data.cajas?.length) return data;

  return {
    ...data,
    cajas: data.cajas.map((caja) => {
      const row = secuencias.find((item) => sameCaja(caja, item));
      if (!row) return caja;

      return {
        ...caja,
        codemisor: caja.codemisor ?? numberOrNull(pickValue(row, ['codemisor', 'codEmisor', 'codigoEmisor'])),
        serieFactura: caja.serieFactura ?? text(pickValue(row, ['serieFactura', 'SerieFactura', 'serie', 'Serie'])),
        serieNotasCred: caja.serieNotasCred ?? text(pickValue(row, ['serieNotasCred', 'serieNotaCredito', 'serieCredito'])),
        serieNotasDeb: caja.serieNotasDeb ?? text(pickValue(row, ['serieNotasDeb', 'serieNotaDebito', 'serieDebito'])),
        serieGuia: caja.serieGuia ?? text(pickValue(row, ['serieGuia', 'serieGuiaRemision'])),
        serieRetencion: caja.serieRetencion ?? text(pickValue(row, ['serieRetencion'])),
        serieLiquidacion: caja.serieLiquidacion ?? text(pickValue(row, ['serieLiquidacion', 'serieLiquidacionCompra'])),
        secFactura: caja.secFactura ?? scalarOrNull(pickValue(row, ['ultimoSecuencialFactura', 'secFactura', 'secuencialFactura', 'siguienteFactura', 'proximoFactura'])),
        secNotaCredito: caja.secNotaCredito ?? scalarOrNull(pickValue(row, ['ultimoSecuencialNotaCredito', 'secNotaCredito', 'secuencialNotaCredito', 'siguienteNotaCredito', 'proximoNotaCredito'])),
        secNotaDebito: caja.secNotaDebito ?? scalarOrNull(pickValue(row, ['ultimoSecuencialNotaDebito', 'secNotaDebito', 'secuencialNotaDebito', 'siguienteNotaDebito', 'proximoNotaDebito'])),
        secGuia: caja.secGuia ?? scalarOrNull(pickValue(row, ['ultimoSecuencialGuia', 'ultimoSecuencialGuiaRemision', 'secGuia', 'secuencialGuia', 'siguienteGuia', 'proximoGuia'])),
        secRetencion: caja.secRetencion ?? scalarOrNull(pickValue(row, ['ultimoSecuencialRetencion', 'secRetencion', 'secuencialRetencion', 'siguienteRetencion', 'proximoRetencion'])),
        secLiquidacion: caja.secLiquidacion ?? scalarOrNull(pickValue(row, ['ultimoSecuencialLiquidacion', 'ultimoSecuencialLiquidacionCompra', 'secLiquidacion', 'secuencialLiquidacion', 'siguienteLiquidacion', 'proximoLiquidacion'])),
      };
    }),
  };
}

function sameCaja(caja: PuntoEmision, row: ApiRow) {
  const cajaSerie = normalizeSerie(caja.serieFactura || (caja.establecimiento && caja.puntoEmision ? `${caja.establecimiento}${caja.puntoEmision}` : ''));
  const rowSerie = normalizeSerie(pickValue(row, ['serieFactura', 'SerieFactura', 'serie', 'Serie']));
  if (cajaSerie && rowSerie && cajaSerie === rowSerie) return true;

  const cajaEstablecimiento = normalizeSeriePart(caja.establecimiento);
  const rowEstablecimiento = normalizeSeriePart(pickValue(row, ['establecimiento', 'Establecimiento', 'codEstablecimiento', 'CodEstablecimiento', 'codigoEstablecimiento', 'CodigoEstablecimiento']));
  const cajaPunto = normalizeSeriePart(caja.puntoEmision);
  const rowPunto = normalizeSeriePart(pickValue(row, ['puntoEmision', 'PuntoEmision', 'punto', 'Punto', 'ptoEmision', 'PtoEmision']));
  if (cajaEstablecimiento && rowEstablecimiento && cajaPunto && rowPunto) {
    return cajaEstablecimiento === rowEstablecimiento && cajaPunto === rowPunto;
  }

  const cajaNum = text(caja.numCaja);
  const rowNum = text(pickValue(row, ['numCaja', 'NumCaja', 'caja', 'Caja']));
  if (cajaNum && rowNum && cajaNum === rowNum) return true;

  return false;
}

function normalizeRows(response: ApiRow[] | ApiRow): ApiRow[] {
  if (Array.isArray(response)) return response;
  const candidates = [response.items, response.Items, response.data, response.Data, response.registros, response.Registros, response.result, response.Result, response.results, response.Results];
  for (const value of candidates) {
    if (Array.isArray(value)) return value as ApiRow[];
    if (isRecord(value)) {
      const nested = normalizeRows(value);
      if (nested.length) return nested;
    }
  }
  const firstArray = Object.values(response).find(Array.isArray);
  if (Array.isArray(firstArray)) return firstArray as ApiRow[];
  return Object.keys(response).length ? [response] : [];
}

function pickValue(row: ApiRow, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== null && row[key] !== undefined) return row[key];
  }

  const normalizedKeys = keys.map(normalizeKey);
  return Object.entries(row).find(([key, value]) => value !== null && value !== undefined && normalizedKeys.includes(normalizeKey(key)))?.[1];
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeSerie(value: unknown) {
  return text(value).replace(/\D/g, '').slice(0, 6);
}

function normalizeSeriePart(value: unknown) {
  const digits = text(value).replace(/\D/g, '');
  return digits ? digits.padStart(3, '0').slice(-3) : '';
}

function isRecord(value: unknown): value is ApiRow {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function numberOrNull(value: unknown) {
  const numeric = Number(text(value).replace(',', '.'));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function scalarOrNull(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') return value.trim() || null;
  return null;
}
