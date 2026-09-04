import { ApiError, apiRequest } from './apiClient';
import { Cliente } from '../types/business';
import { FacturaListItem, FacturaPreparacion, getFacturas } from './facturasMobileService';

type ApiRow = Record<string, unknown>;

export type NotaDebitoListItem = {
  codNotaDebito: number;
  numeroNota?: string | null;
  facturaModificada?: string | null;
  fechaSustento?: string | null;
  cliente?: string | null;
  identificacionCliente?: string | null;
  estadoSri?: string | null;
  autorizado?: boolean | null;
  total?: number | null;
};

export type NotaDebitoLineaInput = {
  descripcion: string;
  precio: number;
  tarifa: number;
  impuestoIce?: string | null;
  valorIce: number;
};

export type NotaDebitoDetalleFactura = {
  descripcion: string;
  precio: number;
  tarifa: number;
  valorIce: number;
};

export type NotaDebitoGuardarInput = {
  idUsuario: number;
  cliente: Cliente;
  facturaModificada?: FacturaListItem | null;
  serie?: string | null;
  codemisor?: number | null;
  correos?: string[];
  detalles: NotaDebitoLineaInput[];
};

export function getNotaDebitoPreparacion(userId: number) {
  return requestWithFallback<FacturaPreparacion>([
    `/api/notas-debito/preparacion?idUsuario=${userId}`,
    `/api/nota-debito/preparacion?idUsuario=${userId}`,
    `/api/facturas/preparacion?idUsuario=${userId}`,
  ]);
}

export async function getNotasDebito(userId: number, top = 0) {
  const response = await requestWithFallback<ApiRow[] | Record<string, unknown>>([
    `/api/notas-debito?idUsuario=${userId}&top=${top}`,
    `/api/nota-debito?idUsuario=${userId}&top=${top}`,
    `/api/notasdebito?idUsuario=${userId}&top=${top}`,
  ]);

  return normalizeRows(response).map(toNotaDebitoListItem);
}

export async function buscarNotaDebitoFacturas(userId: number, filtro: string) {
  try {
    const response = await requestWithFallback<ApiRow[] | Record<string, unknown>>([
      `/api/notas-debito/buscar-facturas?idUsuario=${userId}&texto=${encodeURIComponent(filtro)}`,
      `/api/notas-debito/facturas/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`,
      `/api/nota-debito/facturas/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`,
    ]);

    return normalizeFacturaRows(response);
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 0)) throw error;
    const facturas = await getFacturas(userId, 0);
    const term = filtro.trim().toLowerCase();
    return facturas.filter((factura) => [
      factura.numeroCompleto,
      factura.numfactura,
      factura.cliente,
      factura.identificacionCliente,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term)));
  }
}

export async function getNotaDebitoDetallesFactura(userId: number, codfactura: number): Promise<NotaDebitoDetalleFactura[]> {
  const response = await apiRequest<ApiRow[] | Record<string, unknown>>(`/api/notas-debito/facturas/${codfactura}/detalles?idUsuario=${userId}`);
  return normalizeRows(response).map((row) => ({
    descripcion: text(pickValue(row, ['descripcion', 'Descripcion', 'detalle', 'Detalle'])) || 'Detalle nota de debito',
    precio: numberValue(pickValue(row, ['preciounitario', 'Preciounitario', 'precioUnitario', 'PrecioUnitario', 'subtotal', 'Subtotal', 'precio', 'Precio'])) ?? 0,
    tarifa: numberValue(pickValue(row, ['iva', 'Iva', 'tarifaIva', 'TarifaIva', 'tarifa', 'Tarifa'])) ?? 0,
    valorIce: numberValue(pickValue(row, ['valorIce', 'ValorIce'])) ?? 0,
  })).filter((item) => item.precio > 0);
}

export async function guardarNotaDebito(input: NotaDebitoGuardarInput) {
  const subtotal = input.detalles.reduce((sum, item) => sum + item.precio, 0);
  const ice = input.detalles.reduce((sum, item) => sum + item.valorIce, 0);
  const iva = input.detalles.reduce((sum, item) => sum + (item.precio + item.valorIce) * (item.tarifa / 100), 0);

  const notaDebito = {
    CodEmisor: input.codemisor,
    CodClientes: input.cliente.codcliente || null,
    CodDocumento: '05',
    IdDocModificado: input.facturaModificada?.codfactura || null,
    NumDocModificado: input.facturaModificada?.numeroCompleto ?? input.facturaModificada?.numfactura ?? null,
    CodDocModificado: '01',
    FechaEmiDocModificado: input.facturaModificada?.fechaEmision || null,
    Serie: input.serie?.replace(/-/g, '') || null,
    Estado: '1',
    Autorizado: 'N',
    Subtotal: subtotal,
    Iva: iva,
    ValorTotal: subtotal + ice + iva,
  };

  const detalles = input.detalles.map((item) => ({
    Codproducto: 0,
    Cantidad: 1,
    Descripcion: item.descripcion,
    Detalle: item.descripcion,
    Preciounitario: item.precio,
    Descuento: 0,
    Subtotal: item.precio,
    Iva: item.tarifa,
    ValorIce: item.valorIce,
    Total: item.precio + item.valorIce + (item.precio + item.valorIce) * (item.tarifa / 100),
  }));

  const response = await apiRequest<{ sec?: number; Sec?: number; mensaje?: string; numeroComprobante?: string | null }>(
    '/api/notas-debito',
    {
      method: 'POST',
      body: JSON.stringify({
        IdUsuario: input.idUsuario,
        NotaDebito: notaDebito,
        Detalles: detalles,
        Correos: input.correos?.filter(Boolean).map((correo) => ({ correo, guardarEnCliente: false })) ?? [],
      }),
    },
  );

  const sec = response.sec ?? response.Sec;
  return { mensaje: response.mensaje ?? 'Nota de debito guardada correctamente.', codNotaDebito: sec, numeroComprobante: response.numeroComprobante ?? null };
}

export function emitirNotaDebito(userId: number, sec: number) {
  return apiRequest<{ estado?: string; mensaje?: string; autorizacion?: string }>(`/api/notas-debito/${sec}/emitir?idUsuario=${userId}`, { method: 'POST' });
}

export function getNotaDebitoPdf(userId: number, codNotaDebito: number) {
  return apiRequest<{ url: string }>(`/api/notas-debito/${codNotaDebito}/pdf?idUsuario=${userId}`);
}

export function getNotaDebitoXml(userId: number, codNotaDebito: number) {
  return apiRequest<{ url: string }>(`/api/notas-debito/${codNotaDebito}/xml?idUsuario=${userId}`);
}

export function enviarNotaDebitoCorreo(userId: number, codNotaDebito: number) {
  return apiRequest<void>(`/api/notas-debito/${codNotaDebito}/enviar-correo`, {
    method: 'POST',
    body: JSON.stringify({ IdUsuario: userId, ForzarReenvio: true, CorreosExtra: [] }),
  });
}

export function emitirNotaDebito(userId: number, codNotaDebito: number) {
  return apiRequest<void>(`/api/notas-debito/${codNotaDebito}/emitir?idUsuario=${userId}`, { method: 'POST' });
}

export function anularNotaDebito(userId: number, codNotaDebito: number) {
  return apiRequest<void>(`/api/notas-debito/${codNotaDebito}?idUsuario=${userId}`, { method: 'DELETE' });
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
  const values = [response.items, response.Items, response.data, response.Data, response.notasDebito, response.NotasDebito, response.notas, response.Notas, response.registros, response.Registros, response.result, response.Result, response.results, response.Results];
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
    serie: text(pickValue(row, ['serie', 'Serie'])) || null,
    fechaEmision: text(pickValue(row, ['fechaEmision', 'FechaEmision', 'fechaemision', 'Fechaemision', 'fecha', 'Fecha', 'fechaDocumento', 'FechaDocumento', 'fechaSustento', 'FechaSustento', 'fechaCreacion', 'FechaCreacion'])) || null,
    total: numberValue(pickValue(row, ['total', 'Total', 'valortotal', 'ValorTotal', 'valorTotal', 'totalFactura', 'TotalFactura', 'totalComprobante', 'TotalComprobante', 'totalDocumento', 'TotalDocumento', 'montoTotal', 'MontoTotal', 'importeTotal', 'ImporteTotal', 'valorDocumento', 'ValorDocumento', 'totalGeneral', 'TotalGeneral', 'monto', 'Monto', 'importe', 'Importe'])),
    cliente: text(pickValue(row, ['cliente', 'Cliente', 'clienteNombre', 'ClienteNombre', 'nombreCliente', 'NombreCliente', 'razonSocial', 'RazonSocial'])) || null,
    identificacionCliente: text(pickValue(row, ['identificacionCliente', 'IdentificacionCliente', 'numeroIdentificacion', 'NumeroIdentificacion', 'ruc', 'Ruc'])) || null,
  }));
}

function toNotaDebitoListItem(row: ApiRow): NotaDebitoListItem {
  const serie = text(pickValue(row, ['serie', 'Serie']));
  const numero = text(pickValue(row, ['numeroNota', 'NumeroNota', 'numNotaDebito', 'NumNotaDebito', 'numero', 'Numero', 'secuencial', 'Secuencial']));
  const numeroCompleto = text(pickValue(row, ['numeroCompleto', 'NumeroCompleto', 'numeroDocumento', 'NumeroDocumento', 'documento', 'Documento']));
  return {
    codNotaDebito: numberValue(pickValue(row, ['codNotaDebito', 'CodNotaDebito', 'codnotadebito', 'idNotaDebito', 'IdNotaDebito', 'id', 'Id'])) ?? 0,
    numeroNota: numeroCompleto || [serie, numero].filter(Boolean).join('-') || numero || null,
    facturaModificada: text(pickValue(row, ['facturaModificada', 'FacturaModificada', 'numeroFactura', 'NumeroFactura', 'factura', 'Factura'])) || null,
    fechaSustento: text(pickValue(row, ['fechaSustento', 'FechaSustento', 'fechaEmision', 'FechaEmision', 'fechaemision', 'Fechaemision', 'fechaDocumento', 'FechaDocumento', 'fechaFactura', 'FechaFactura', 'fecha', 'Fecha', 'fechaCreacion', 'FechaCreacion', 'fechaAutorizacion', 'FechaAutorizacion'])) || null,
    cliente: text(pickValue(row, ['cliente', 'Cliente', 'nombreCliente', 'NombreCliente', 'razonSocial', 'RazonSocial'])) || null,
    identificacionCliente: text(pickValue(row, ['identificacionCliente', 'IdentificacionCliente', 'numeroIdentificacion', 'NumeroIdentificacion', 'ruc', 'Ruc'])) || null,
    estadoSri: text(pickValue(row, ['estadoSri', 'EstadoSri', 'estadoSRI', 'EstadoSRI', 'estado', 'Estado'])) || null,
    autorizado: booleanValue(pickValue(row, ['autorizado', 'Autorizado', 'estaAutorizado', 'EstaAutorizado'])),
    total: numberValue(pickValue(row, ['total', 'Total', 'valortotal', 'ValorTotal', 'valorTotal', 'totalNotaDebito', 'TotalNotaDebito', 'totalComprobante', 'TotalComprobante', 'totalDocumento', 'TotalDocumento', 'montoTotal', 'MontoTotal', 'importeTotal', 'ImporteTotal', 'valorDocumento', 'ValorDocumento', 'totalGeneral', 'TotalGeneral', 'monto', 'Monto', 'importe', 'Importe', 'valor', 'Valor'])),
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
    if (['false', '0', 'no', 'n', 'pendiente', 'no autorizado', 'inactivo', 'anulado'].includes(normalized)) return false;
  }
  return null;
}
