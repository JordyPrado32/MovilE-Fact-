import { ApiError, apiRequest } from './apiClient';
import { RETENCIONES_GENERADAS_PATH } from '../config/api';

type ApiRow = Record<string, unknown>;

const RETENCION_BASE_KEYS = [
  'base',
  'Base',
  'baseImponible',
  'BaseImponible',
  'baseimp',
  'BaseImp',
  'baseRetencion',
  'BaseRetencion',
  'baseImponibleRetencion',
  'BaseImponibleRetencion',
  'subtotal',
  'Subtotal',
  'subtotalBase',
  'SubtotalBase',
  'subtotalSinImpuestos',
  'SubtotalSinImpuestos',
  'totalSinImpuestos',
  'TotalSinImpuestos',
  'baseGravada',
  'BaseGravada',
  'valorBase',
  'ValorBase',
  'importeBase',
  'ImporteBase',
];

const RETENIDO_KEYS = [
  'retenido',
  'Retenido',
  'valorRetenido',
  'ValorRetenido',
  'valorretenido',
  'Valorretenido',
  'totalRetenido',
  'TotalRetenido',
  'valorRetencion',
  'ValorRetencion',
  'valorretencion',
  'Valorretencion',
  'totalRetencion',
  'TotalRetencion',
  'montoRetenido',
  'MontoRetenido',
  'importeRetenido',
  'ImporteRetenido',
  'importeRetencion',
  'ImporteRetencion',
  'valorRet',
  'ValorRet',
  'valRetenido',
  'ValRetenido',
  'valret',
  'Valret',
  'valRetencion',
  'ValRetencion',
  'impuestoRetenido',
  'ImpuestoRetenido',
  'valorReteRenta',
  'ValorReteRenta',
  'valorRetIva',
  'ValorRetIva',
  'valor',
  'Valor',
  'importe',
  'Importe',
];

const RETENCION_DETAIL_KEYS = [
  'detalles',
  'Detalles',
  'detalle',
  'Detalle',
  'impuestos',
  'Impuestos',
  'retenciones',
  'Retenciones',
  'detalleRetencion',
  'DetalleRetencion',
  'detallesRetencion',
  'DetallesRetencion',
  'items',
  'Items',
  'conceptos',
  'Conceptos',
];

export type RetencionListItem = {
  codRetencion: number;
  numero?: string | null;
  fecha?: string | null;
  documentoSustento?: string | null;
  proveedor?: string | null;
  identificacionProveedor?: string | null;
  estadoSri?: string | null;
  autorizado?: boolean | null;
  base?: number | null;
  retenido?: number | null;
};

export async function getRetenciones(userId: number, top = 0) {
  const response = await requestWithFallback<ApiRow[] | Record<string, unknown>>([
    withQuery(RETENCIONES_GENERADAS_PATH, { idUsuario: userId, top }),
    withQuery('/api/reportes/documentos/emitidos', { idUsuario: userId, top, tipo: 'retencion' }),
    withQuery('/api/reportes/documentos', { idUsuario: userId, top, tipo: 'retencion' }),
    withQuery('/api/reportes/documentos/recibidos', { idUsuario: userId, top, tipo: 'retencion' }),
  ]);
  const rows = normalizeRows(response);
  const retenciones = rows.filter(isRetencionRow);
  return (retenciones.length ? retenciones : rows).map(toRetencionListItem);
}

export function getRetencionPdf(userId: number, codRetencion: number) {
  return apiRequest<{ url: string }>(`/api/retenciones/${codRetencion}/pdf?idUsuario=${userId}`);
}

export function getRetencionXml(userId: number, codRetencion: number) {
  return apiRequest<{ url: string }>(`/api/retenciones/${codRetencion}/xml?idUsuario=${userId}`);
}

export function enviarRetencionCorreo(userId: number, codRetencion: number) {
  return apiRequest<void>(`/api/retenciones/${codRetencion}/enviar-correo`, {
    method: 'POST',
    body: JSON.stringify({ idUsuario: userId, forzarReenvio: true, correosCopia: [] }),
  });
}

function normalizeRows(response: ApiRow[] | Record<string, unknown>): ApiRow[] {
  if (Array.isArray(response)) return response;
  const values = [response.items, response.Items, response.data, response.Data, response.retenciones, response.Retenciones, response.registros, response.Registros, response.result, response.Result, response.results, response.Results];
  for (const value of values) {
    if (Array.isArray(value)) return value as ApiRow[];
    if (isRecord(value)) {
      const nestedRows = normalizeRows(value);
      if (nestedRows.length) return nestedRows;
    }
  }
  const firstArray = Object.values(response).find(Array.isArray);
  if (Array.isArray(firstArray)) return firstArray as ApiRow[];
  return Object.keys(response).length ? [response] : [];
}

async function requestWithFallback<T>(paths: string[]) {
  let lastError: unknown;
  for (const path of paths) {
    try {
      return await apiRequest<T>(path);
    } catch (error) {
      lastError = error;
      if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 0)) throw error;
    }
  }
  throw lastError;
}

function withQuery(path: string, params: Record<string, string | number>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => query.set(key, String(value)));
  return `${path}${path.includes('?') ? '&' : '?'}${query.toString()}`;
}

function isRetencionRow(row: ApiRow) {
  const codDocumento = text(pickValue(row, ['coddocumento', 'CodDocumento', 'tipoDocumento', 'TipoDocumento', 'documentType', 'DocumentType']));
  if (['7', '07'].includes(codDocumento.trim())) return true;

  const values = [
    pickValue(row, ['tipo', 'Tipo', 'tipoComprobante', 'TipoComprobante', 'documento', 'Documento', 'descripcion', 'Descripcion']),
    pickValue(row, ['numeroRetencion', 'NumeroRetencion', 'numRetencion', 'NumRetencion', 'codRetencion', 'CodRetencion']),
  ]
    .map(text)
    .join(' ')
    .toLowerCase();

  return values.includes('retencion') || values.includes('retención');
}

function toRetencionListItem(row: ApiRow): RetencionListItem {
  const serie = text(pickValue(row, ['serie', 'Serie']));
  const numero = text(pickValue(row, ['numero', 'Numero', 'numRetencion', 'NumRetencion', 'secuencial', 'Secuencial']));
  const numeroCompleto = text(pickValue(row, ['numeroCompleto', 'NumeroCompleto', 'numeroDocumento', 'NumeroDocumento', 'documento', 'Documento']));
  const base = numberValue(pickValue(row, RETENCION_BASE_KEYS)) ?? sumNestedNumbers(row, RETENCION_DETAIL_KEYS, RETENCION_BASE_KEYS);
  const retenido = numberValue(pickValue(row, RETENIDO_KEYS)) ?? sumNestedNumbers(row, RETENCION_DETAIL_KEYS, RETENIDO_KEYS);

  return {
    codRetencion: numberValue(pickValue(row, ['codRetencion', 'CodRetencion', 'codretencion', 'idRetencion', 'IdRetencion', 'id', 'Id'])) ?? 0,
    numero: numeroCompleto || [serie, numero].filter(Boolean).join('-') || numero || null,
    fecha: text(pickValue(row, ['fecha', 'Fecha', 'fechaEmision', 'FechaEmision', 'fechaemision', 'Fechaemision', 'fechaDocumento', 'FechaDocumento', 'fechaSustento', 'FechaSustento', 'fechaRetencion', 'FechaRetencion', 'fechaCreacion', 'FechaCreacion', 'fechaAutorizacion', 'FechaAutorizacion'])) || null,
    documentoSustento: text(pickValue(row, ['documentoSustento', 'DocumentoSustento', 'sustento', 'Sustento', 'numeroSustento', 'NumeroSustento', 'factura', 'Factura'])) || null,
    proveedor: text(pickValue(row, ['proveedor', 'Proveedor', 'nombreProveedor', 'NombreProveedor', 'razonSocial', 'RazonSocial'])) || null,
    identificacionProveedor: text(pickValue(row, ['identificacionProveedor', 'IdentificacionProveedor', 'numeroIdentificacion', 'NumeroIdentificacion', 'ruc', 'Ruc'])) || null,
    estadoSri: text(pickValue(row, ['estadoSri', 'EstadoSri', 'estadoSRI', 'EstadoSRI', 'estado', 'Estado'])) || null,
    autorizado: booleanValue(pickValue(row, ['autorizado', 'Autorizado'])),
    base,
    retenido,
  };
}

function pickValue(row: ApiRow, keys: string[]) {
  for (const key of keys) if (row[key] !== null && row[key] !== undefined) return row[key];
  const normalizedKeys = keys.map(normalizeKey);
  return Object.entries(row).find(([key, value]) => value !== null && value !== undefined && normalizedKeys.includes(normalizeKey(key)))?.[1];
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isRecord(value: unknown): value is ApiRow {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sumNestedNumbers(row: ApiRow, containerKeys: string[], valueKeys: string[]) {
  const containers = containerKeys
    .map((key) => pickValue(row, [key]))
    .filter((value) => value !== null && value !== undefined);

  const values = containers.flatMap(collectRecords).map((item) => numberValue(pickValue(item, valueKeys))).filter((value): value is number => value !== null);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

function collectRecords(value: unknown): ApiRow[] {
  if (Array.isArray(value)) return value.flatMap(collectRecords);
  if (!isRecord(value)) return [];

  const nested = Object.values(value).flatMap((nestedValue) => (Array.isArray(nestedValue) || isRecord(nestedValue) ? collectRecords(nestedValue) : []));
  return [value, ...nested];
}

function text(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function numberValue(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  let normalized = String(value).trim().replace(/[^\d,.-]/g, '');
  if (!normalized) return null;
  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    normalized = lastComma > lastDot ? normalized.replace(/\./g, '').replace(',', '.') : normalized.replace(/,/g, '');
  } else if (lastComma > -1) {
    normalized = normalized.replace(',', '.');
  }
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function booleanValue(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'si', 'sí', 's', 'autorizado', 'activo'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'pendiente', 'no autorizado', 'inactivo'].includes(normalized)) return false;
  }
  return null;
}
