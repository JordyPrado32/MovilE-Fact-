import { ApiError, apiRequest } from './apiClient';
import { Cliente } from '../types/business';
import { FacturaListItem, FacturaPreparacion, FacturaProducto, buscarFacturaClientes, buscarFacturaProductos, getFacturas } from './facturasMobileService';

type ApiRow = Record<string, unknown>;

export type GuiaRemisionListItem = {
  codGuia: number;
  numero?: string | null;
  fecha?: string | null;
  destinatario?: string | null;
  identificacionDestinatario?: string | null;
  transportista?: string | null;
  motivoTraslado?: string | null;
  fechaTraslado?: string | null;
  estadoSri?: string | null;
  autorizado?: boolean | null;
};

export type GuiaRemisionDetalleInput = {
  producto: FacturaProducto;
  cantidad: number;
};

export type GuiaRemisionGuardarInput = {
  idUsuario: number;
  transportista: Cliente;
  destinatario?: Cliente | null;
  factura?: FacturaListItem | null;
  serie?: string | null;
  codemisor?: number | null;
  placa?: string | null;
  contribuyenteEspecial?: string | null;
  obligadoContabilidad?: boolean;
  fechaEmision?: string | null;
  fechaInicioTraslado?: string | null;
  fechaFinTraslado?: string | null;
  detalle?: string | null;
  direccionOrigen?: string | null;
  puntoEmision?: string | null;
  detalles: GuiaRemisionDetalleInput[];
};

export function getGuiaRemisionPreparacion(userId: number) {
  return requestWithFallback<FacturaPreparacion>([
    `/api/guias-remision/preparacion?idUsuario=${userId}`,
    `/api/guia-remision/preparacion?idUsuario=${userId}`,
    `/api/facturas/preparacion?idUsuario=${userId}`,
  ]);
}

export async function getGuiasRemision(userId: number, top = 0) {
  const response = await requestWithFallback<ApiRow[] | Record<string, unknown>>([
    `/api/guias-remision?idUsuario=${userId}&top=${top}`,
    `/api/guia-remision?idUsuario=${userId}&top=${top}`,
    `/api/guiasremision?idUsuario=${userId}&top=${top}`,
  ]);
  return normalizeRows(response).map(toGuiaListItem);
}

export async function buscarGuiaClientes(userId: number, filtro: string) {
  return buscarFacturaClientes(userId, filtro);
}

export async function buscarGuiaTransportistas(userId: number, filtro: string) {
  try {
    const response = await requestWithFallback<ApiRow[] | Record<string, unknown>>([
      `/api/guias-remision/transportistas/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`,
      `/api/guia-remision/transportistas/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`,
    ]);
    return normalizeRows(response).map(toCliente);
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 0)) throw error;
    return buscarFacturaClientes(userId, filtro);
  }
}

export async function buscarGuiaFacturas(userId: number, filtro: string) {
  try {
    const response = await requestWithFallback<ApiRow[] | Record<string, unknown>>([
      `/api/guias-remision/facturas/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`,
      `/api/guia-remision/facturas/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`,
    ]);
    return normalizeFacturaRows(response);
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 0)) throw error;
    const term = filtro.trim().toLowerCase();
    return (await getFacturas(userId, 0)).filter((factura) => [factura.numeroCompleto, factura.numfactura, factura.cliente, factura.identificacionCliente].filter(Boolean).some((value) => String(value).toLowerCase().includes(term)));
  }
}

export function buscarGuiaProductos(userId: number, filtro: string) {
  return buscarFacturaProductos(userId, filtro);
}

export function guardarGuiaRemision(input: GuiaRemisionGuardarInput) {
  const guia = {
    codemisor: input.codemisor,
    coddocumento: 6,
    tipodocumento: 6,
    serie: input.serie?.replace(/-/g, '') || null,
    codfactura: input.factura?.codfactura || null,
    numeroFactura: input.factura?.numeroCompleto ?? input.factura?.numfactura ?? null,
    placa: input.placa || null,
    contribuyenteEspecial: input.contribuyenteEspecial || null,
    obligadoContabilidad: input.obligadoContabilidad ?? false,
    fechaEmision: input.fechaEmision || new Date().toISOString(),
    fechaInicioTraslado: input.fechaInicioTraslado || null,
    fechaFinTraslado: input.fechaFinTraslado || null,
    detalle: input.detalle || null,
    direccionOrigen: input.direccionOrigen || null,
    puntoEmision: input.puntoEmision || null,
    estado: true,
    autorizado: false,
  };

  const detalles = input.detalles.map((item) => ({
    codproducto: item.producto.codproducto,
    codprincipal: item.producto.codprincipal,
    codauxiliar: item.producto.codauxiliar,
    descripcion: item.producto.descripcion,
    cantidad: item.cantidad,
  }));

  return apiRequest<{ mensaje: string; codGuia?: number; numeroComprobante?: string | null }>(
    '/api/guias-remision/guardar-completa',
    {
      method: 'POST',
      body: JSON.stringify({
        idUsuario: input.idUsuario,
        guia,
        transportista: input.transportista,
        destinatario: input.destinatario,
        factura: input.factura,
        detalles,
      }),
    },
  );
}

export function getGuiaRemisionPdf(userId: number, codGuia: number) {
  return apiRequest<{ url: string }>(`/api/guias-remision/${codGuia}/pdf?idUsuario=${userId}`);
}

export function getGuiaRemisionXml(userId: number, codGuia: number) {
  return apiRequest<{ url: string }>(`/api/guias-remision/${codGuia}/xml?idUsuario=${userId}`);
}

export function enviarGuiaRemisionCorreo(userId: number, codGuia: number) {
  return apiRequest<void>(`/api/guias-remision/${codGuia}/enviar-correo`, {
    method: 'POST',
    body: JSON.stringify({ idUsuario: userId, forzarReenvio: true, correosCopia: [] }),
  });
}

async function requestWithFallback<T>(paths: string[]) {
  let lastError: unknown;
  for (const path of paths) {
    try {
      return await apiRequest<T>(path, { suppressErrorLog: true });
    } catch (error) {
      lastError = error;
      if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 0)) throw error;
    }
  }
  throw lastError;
}

function normalizeRows(response: ApiRow[] | Record<string, unknown>): ApiRow[] {
  if (Array.isArray(response)) return response;
  const values = [response.items, response.Items, response.data, response.Data, response.guias, response.Guias, response.registros, response.Registros, response.result, response.Result, response.results, response.Results];
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

function normalizeFacturaRows(response: ApiRow[] | Record<string, unknown>): FacturaListItem[] {
  return normalizeRows(response).map((row) => ({
    codfactura: numberValue(pickValue(row, ['codfactura', 'CodFactura', 'codFactura', 'idFactura', 'IdFactura', 'id', 'Id'])) ?? 0,
    numfactura: text(pickValue(row, ['numfactura', 'NumFactura', 'numeroFactura', 'NumeroFactura', 'numero', 'Numero'])) || null,
    numeroCompleto: text(pickValue(row, ['numeroCompleto', 'NumeroCompleto', 'numeroDocumento', 'NumeroDocumento', 'documento', 'Documento'])) || null,
    cliente: text(pickValue(row, ['cliente', 'Cliente', 'nombreCliente', 'NombreCliente', 'razonSocial', 'RazonSocial'])) || null,
    identificacionCliente: text(pickValue(row, ['identificacionCliente', 'IdentificacionCliente', 'numeroIdentificacion', 'NumeroIdentificacion', 'ruc', 'Ruc'])) || null,
  }));
}

function toCliente(row: ApiRow): Cliente {
  return {
    codcliente: numberValue(pickValue(row, ['codcliente', 'CodCliente', 'id', 'Id'])) ?? 0,
    nombrerazonsocial: text(pickValue(row, ['nombrerazonsocial', 'NombreRazonSocial', 'razonSocial', 'RazonSocial', 'nombre', 'Nombre'])) || null,
    numeroidentificacion: text(pickValue(row, ['numeroidentificacion', 'NumeroIdentificacion', 'identificacion', 'Identificacion', 'ruc', 'Ruc'])) || null,
    direccion: text(pickValue(row, ['direccion', 'Direccion'])) || null,
    celular: text(pickValue(row, ['celular', 'Celular', 'telefono', 'Telefono'])) || null,
    correo: text(pickValue(row, ['correo', 'Correo', 'email', 'Email'])) || null,
  };
}

function toGuiaListItem(row: ApiRow): GuiaRemisionListItem {
  const serie = text(pickValue(row, ['serie', 'Serie']));
  const numero = text(pickValue(row, ['numero', 'Numero', 'numGuia', 'NumGuia', 'secuencial', 'Secuencial']));
  const numeroCompleto = text(pickValue(row, ['numeroCompleto', 'NumeroCompleto', 'numeroDocumento', 'NumeroDocumento', 'documento', 'Documento']));
  return {
    codGuia: numberValue(pickValue(row, ['codGuia', 'CodGuia', 'codguia', 'idGuia', 'IdGuia', 'id', 'Id'])) ?? 0,
    numero: numeroCompleto || [serie, numero].filter(Boolean).join('-') || numero || null,
    fecha: text(pickValue(row, ['fecha', 'Fecha', 'fechaEmision', 'FechaEmision', 'fechaemision', 'Fechaemision', 'fechaDocumento', 'FechaDocumento', 'fechaGuia', 'FechaGuia', 'fechaCreacion', 'FechaCreacion', 'fechaAutorizacion', 'FechaAutorizacion'])) || null,
    destinatario: text(pickValue(row, ['destinatario', 'Destinatario', 'cliente', 'Cliente', 'razonSocial', 'RazonSocial'])) || null,
    identificacionDestinatario: text(pickValue(row, ['identificacionDestinatario', 'IdentificacionDestinatario', 'numeroIdentificacion', 'NumeroIdentificacion', 'ruc', 'Ruc'])) || null,
    transportista: text(pickValue(row, ['transportista', 'Transportista', 'nombreTransportista', 'NombreTransportista'])) || null,
    motivoTraslado: text(pickValue(row, ['motivoTraslado', 'MotivoTraslado', 'motivo', 'Motivo'])) || null,
    fechaTraslado: text(pickValue(row, ['fechaTraslado', 'FechaTraslado', 'fechaInicioTraslado', 'FechaInicioTraslado', 'fechaInicioTransporte', 'FechaInicioTransporte', 'fechaIniTraslado', 'FechaIniTraslado', 'fechaSalida', 'FechaSalida'])) || null,
    estadoSri: text(pickValue(row, ['estadoSri', 'EstadoSri', 'estadoSRI', 'EstadoSRI', 'estado', 'Estado'])) || null,
    autorizado: booleanValue(pickValue(row, ['autorizado', 'Autorizado'])),
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
