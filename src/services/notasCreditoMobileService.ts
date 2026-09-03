import { ApiError, apiRequest } from './apiClient';
import { Cliente } from '../types/business';
import { FacturaListItem, FacturaPreparacion, FacturaProducto, getFacturas } from './facturasMobileService';

type ApiRow = Record<string, unknown>;

export type NotaCreditoListItem = {
  codNotaCredito: number;
  numeroNota?: string | null;
  facturaModificada?: string | null;
  fechaSustento?: string | null;
  cliente?: string | null;
  identificacionCliente?: string | null;
  estadoSri?: string | null;
  autorizado?: boolean | null;
  total?: number | null;
};

export type NotaCreditoLineaInput = {
  producto: FacturaProducto;
  cantidad: number;
  precio: number;
  descuento: number;
  tarifa: number;
};

export type NotaCreditoGuardarInput = {
  idUsuario: number;
  cliente: Cliente;
  facturaModificada?: FacturaListItem | null;
  serie?: string | null;
  codemisor?: number | null;
  motivo?: string | null;
  observacion?: string | null;
  correos?: string[];
  detalles: NotaCreditoLineaInput[];
};

export function getNotaCreditoPreparacion(userId: number) {
  return requestWithFallback<FacturaPreparacion>([
    `/api/notas-credito/preparacion?idUsuario=${userId}`,
    `/api/nota-credito/preparacion?idUsuario=${userId}`,
    `/api/facturas/preparacion?idUsuario=${userId}`,
  ]);
}

export async function getNotasCredito(userId: number, top = 0) {
  const response = await requestWithFallback<ApiRow[] | Record<string, unknown>>([
    `/api/notas-credito?idUsuario=${userId}&top=${top}`,
    `/api/nota-credito?idUsuario=${userId}&top=${top}`,
    `/api/notascredito?idUsuario=${userId}&top=${top}`,
  ]);

  return normalizeRows(response).map(toNotaCreditoListItem);
}

export async function buscarNotaCreditoFacturas(userId: number, filtro: string) {
  try {
    const response = await requestWithFallback<ApiRow[] | Record<string, unknown>>([
      `/api/notas-credito/facturas/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`,
      `/api/nota-credito/facturas/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`,
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

export function guardarNotaCredito(input: NotaCreditoGuardarInput) {
  const subtotal = input.detalles.reduce((sum, item) => sum + Math.max(item.cantidad * item.precio - item.descuento, 0), 0);
  const iva = input.detalles.reduce((sum, item) => {
    const base = Math.max(item.cantidad * item.precio - item.descuento, 0);
    return sum + base * (item.tarifa / 100);
  }, 0);

  const notaCredito = {
    codemisor: input.codemisor,
    coddocumento: 4,
    tipodocumento: 4,
    serie: input.serie?.replace(/-/g, '') || null,
    codfactura: input.facturaModificada?.codfactura || null,
    codClientes: input.cliente.codcliente || null,
    facturaModificada: input.facturaModificada?.numeroCompleto ?? input.facturaModificada?.numfactura ?? null,
    motivo: input.motivo || null,
    observacion: input.observacion || null,
    estado: true,
    autorizado: false,
    fechaemision: new Date().toISOString(),
    subtotal,
    descuentos: input.detalles.reduce((sum, item) => sum + item.descuento, 0),
    iva,
    valortotal: subtotal + iva,
  };

  const detalles = input.detalles.map((item) => {
    const base = Math.max(item.cantidad * item.precio - item.descuento, 0);
    const valorIva = base * (item.tarifa / 100);
    return {
      codproducto: item.producto.codproducto,
      codprincipal: item.producto.codprincipal,
      codauxiliar: item.producto.codauxiliar,
      descripcion: item.producto.descripcion ?? 'Producto',
      cantidad: item.cantidad,
      preciounitario: item.precio,
      descuento: item.descuento,
      subtotal: base,
      iva: item.tarifa,
      total: base + valorIva,
    };
  });

  return apiRequest<{ mensaje?: string; sec?: number; codNotaCredito?: number; numeroComprobante?: string | null }>(
    '/api/notas-credito',
    {
      method: 'POST',
      body: JSON.stringify({
        idUsuario: input.idUsuario,
        notaCredito,
        cliente: input.cliente,
        facturaModificada: input.facturaModificada,
        detalles,
        correosNotaCredito: input.correos?.filter(Boolean).map((correo) => ({ correo, guardarEnCliente: false })) ?? [],
      }),
    },
  );
}

export function emitirNotaCredito(userId: number, sec: number) {
  return apiRequest<{ estado?: string; mensaje?: string; autorizacion?: string }>(`/api/notas-credito/${sec}/emitir?idUsuario=${userId}`, { method: 'POST' });
}

export function getNotaCreditoPdf(userId: number, codNotaCredito: number) {
  return apiRequest<{ url: string }>(`/api/notas-credito/${codNotaCredito}/pdf?idUsuario=${userId}`);
}

export function getNotaCreditoXml(userId: number, codNotaCredito: number) {
  return apiRequest<{ url: string }>(`/api/notas-credito/${codNotaCredito}/xml?idUsuario=${userId}`);
}

export function enviarNotaCreditoCorreo(userId: number, codNotaCredito: number) {
  return apiRequest<void>(`/api/notas-credito/${codNotaCredito}/enviar-correo`, {
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

  const values = [
    response.items,
    response.Items,
    response.data,
    response.Data,
    response.notasCredito,
    response.NotasCredito,
    response.notas,
    response.Notas,
    response.registros,
    response.Registros,
    response.result,
    response.Result,
    response.results,
    response.Results,
  ];

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
    cliente: text(pickValue(row, ['cliente', 'Cliente', 'nombreCliente', 'NombreCliente', 'razonSocial', 'RazonSocial'])) || null,
    identificacionCliente: text(pickValue(row, ['identificacionCliente', 'IdentificacionCliente', 'numeroIdentificacion', 'NumeroIdentificacion', 'ruc', 'Ruc'])) || null,
  }));
}

function toNotaCreditoListItem(row: ApiRow): NotaCreditoListItem {
  const serie = text(pickValue(row, ['serie', 'Serie']));
  const numero = text(pickValue(row, ['numeroNota', 'NumeroNota', 'numNotaCredito', 'NumNotaCredito', 'numero', 'Numero', 'secuencial', 'Secuencial']));
  const numeroCompleto = text(pickValue(row, ['numeroCompleto', 'NumeroCompleto', 'numeroDocumento', 'NumeroDocumento', 'documento', 'Documento']));

  return {
    codNotaCredito: numberValue(pickValue(row, ['codNotaCredito', 'CodNotaCredito', 'codnotacredito', 'idNotaCredito', 'IdNotaCredito', 'id', 'Id'])) ?? 0,
    numeroNota: numeroCompleto || [serie, numero].filter(Boolean).join('-') || numero || null,
    facturaModificada: text(pickValue(row, ['facturaModificada', 'FacturaModificada', 'numeroFactura', 'NumeroFactura', 'factura', 'Factura'])) || null,
    fechaSustento: text(pickValue(row, ['fechaSustento', 'FechaSustento', 'fechaEmision', 'FechaEmision', 'fechaemision', 'Fechaemision', 'fechaDocumento', 'FechaDocumento', 'fechaFactura', 'FechaFactura', 'fecha', 'Fecha', 'fechaCreacion', 'FechaCreacion', 'fechaAutorizacion', 'FechaAutorizacion'])) || null,
    cliente: text(pickValue(row, ['cliente', 'Cliente', 'nombreCliente', 'NombreCliente', 'razonSocial', 'RazonSocial'])) || null,
    identificacionCliente: text(pickValue(row, ['identificacionCliente', 'IdentificacionCliente', 'numeroIdentificacion', 'NumeroIdentificacion', 'ruc', 'Ruc'])) || null,
    estadoSri: text(pickValue(row, ['estadoSri', 'EstadoSri', 'estadoSRI', 'EstadoSRI', 'estado', 'Estado'])) || null,
    autorizado: booleanValue(pickValue(row, ['autorizado', 'Autorizado', 'estaAutorizado', 'EstaAutorizado'])),
    total: numberValue(pickValue(row, ['total', 'Total', 'valortotal', 'ValorTotal', 'valorTotal', 'totalNotaCredito', 'TotalNotaCredito', 'totalComprobante', 'TotalComprobante', 'totalDocumento', 'TotalDocumento', 'montoTotal', 'MontoTotal', 'importeTotal', 'ImporteTotal', 'valorDocumento', 'ValorDocumento', 'totalGeneral', 'TotalGeneral', 'monto', 'Monto', 'importe', 'Importe', 'valor', 'Valor'])),
  };
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
