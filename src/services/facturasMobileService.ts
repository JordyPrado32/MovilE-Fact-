import { apiRequest } from './apiClient';
import { Cliente } from '../types/business';

export type FacturaListItem = {
  codfactura: number;
  numfactura?: string | null;
  numeroCompleto?: string | null;
  serie?: string | null;
  fechaEmision?: string | null;
  estadoSri?: string | null;
  autorizado?: boolean | null;
  numeroAutorizacion?: string | null;
  mensajeSri?: string | null;
  total?: number | null;
  totalAbonado?: number | null;
  saldoPendiente?: number | null;
  tipopago?: string | null;
  estadoPago?: string | null;
  cliente?: string | null;
  identificacionCliente?: string | null;
  estado?: boolean | null;
};

export type FacturaProducto = {
  codproducto: number;
  codprincipal?: string | null;
  codauxiliar?: string | null;
  descripcion?: string | null;
  precioUnitario?: number;
  costo?: number;
  tarifaIva?: number;
};

export type FacturaPreparacion = {
  emisores?: { codemisor?: number; codigo?: number; ruc?: string | null; razonsocial?: string | null; razonSocial?: string | null }[];
  porcentajesIva?: { codigo?: string | number | null; descripcion?: string | null; valor?: number | null; valorCalculo?: number | null }[];
  tiposCliente?: unknown[];
  paises?: unknown[];
  caja?: {
    serieFactura?: string | null;
    serieGuia?: string | null;
    serieNotasCred?: string | null;
    serieNotasDeb?: string | null;
    serieLiquidacion?: string | null;
    serieLiquidacionCompra?: string | null;
    numCaja?: number | null;
    sec?: number | null;
    secuencial?: number | null;
    siguiente?: string | number | null;
    proximo?: string | number | null;
    numeroSecuencia?: string | number | null;
    codemisor?: number | null;
  } | null;
  series?: {
    serieRaw?: string | null;
    serieVisual?: string | null;
    codemisor?: number | null;
    numCaja?: number | null;
    sec?: number | null;
    secuencial?: number | null;
    siguiente?: string | number | null;
    proximo?: string | number | null;
    numeroSecuencia?: string | number | null;
  }[];
  formasPago?: { id?: number; codigo?: string | null; descripcion?: string | null; descripcionSri?: string | null }[];
};

type ApiRow = Record<string, unknown>;

export type FacturaLineaInput = {
  producto: FacturaProducto;
  cantidad: number;
  precio: number;
  descuento: number;
  tarifa: number;
};

export type FacturaGuardarInput = {
  idUsuario: number;
  cliente: Cliente;
  serie?: string | null;
  codemisor?: number | null;
  formaPago?: string | null;
  referencia?: string | null;
  correos?: string[];
  detalles: FacturaLineaInput[];
};

export function getFacturaPreparacion(userId: number) {
  return apiRequest<FacturaPreparacion>(`/api/facturas/preparacion?idUsuario=${userId}`);
}

export async function getFacturas(userId: number, top = 0) {
  const response = await apiRequest<ApiRow[] | Record<string, unknown>>(`/api/facturas?idUsuario=${userId}&top=${top}`);
  return normalizeFacturaRows(response).map(toFacturaListItem);
}

export function buscarFacturaClientes(userId: number, filtro: string) {
  return apiRequest<Cliente[]>(`/api/facturas/clientes/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`);
}

export function buscarFacturaProductos(userId: number, filtro: string) {
  return apiRequest<FacturaProducto[]>(`/api/facturas/productos/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`);
}

export function getSiguienteFactura(userId: number, codemisor?: number | null, serie?: string | null) {
  const params = new URLSearchParams({ idUsuario: String(userId) });
  if (codemisor) params.set('codEmisor', String(codemisor));
  if (serie) params.set('serie', serie);
  return apiRequest<{ proximo: string }>(`/api/facturas/siguiente-secuencial?${params.toString()}`);
}

export function guardarFactura(input: FacturaGuardarInput) {
  const totalBase = input.detalles.reduce((sum, item) => sum + Math.max(item.cantidad * item.precio - item.descuento, 0), 0);
  const totalIva = input.detalles.reduce((sum, item) => {
    const base = Math.max(item.cantidad * item.precio - item.descuento, 0);
    return sum + base * (item.tarifa / 100);
  }, 0);

  const factura = {
    codemisor: input.codemisor,
    coddocumento: 1,
    tipodocumento: 1,
    serie: input.serie?.replace(/-/g, '') || null,
    tipopago: input.formaPago || null,
    ambiente: 2,
    estado: true,
    autorizado: false,
    fechaentrega: new Date().toISOString(),
    notas: input.referencia || null,
    subtotal12: totalBase,
    subtotal: totalBase,
    descuentos: input.detalles.reduce((sum, item) => sum + item.descuento, 0),
    iva: totalIva,
    valortotal: totalBase + totalIva,
  };

  const detalles = input.detalles.map((item) => {
    const base = Math.max(item.cantidad * item.precio - item.descuento, 0);
    const iva = base * (item.tarifa / 100);
    return {
      codproducto: item.producto.codproducto,
      codprincipal: item.producto.codprincipal,
      codauxiliar: item.producto.codauxiliar,
      cantproducto: item.cantidad,
      descripproducto: item.producto.descripcion,
      precioproducto: item.precio,
      descuento: item.descuento,
      valortproducto: base,
      valoriva: iva,
      valortotal: base + iva,
      tarifa: item.tarifa,
      costo: item.producto.costo ?? 0,
    };
  });

  return apiRequest<{ mensaje: string; codfactura: number; numeroComprobante?: string | null }>(
    '/api/facturas/guardar-completa',
    {
      method: 'POST',
      body: JSON.stringify({
        idUsuario: input.idUsuario,
        factura,
        cliente: input.cliente,
        detalles,
        correosFactura: input.correos?.filter(Boolean).map((correo) => ({ correo, guardarEnCliente: false })) ?? [],
      }),
    },
  );
}

export function getFacturaPdf(userId: number, codfactura: number) {
  return apiRequest<{ url: string }>(`/api/facturas/${codfactura}/pdf?idUsuario=${userId}`);
}

export function getFacturaXml(userId: number, codfactura: number) {
  return apiRequest<{ url: string }>(`/api/facturas/${codfactura}/xml?idUsuario=${userId}`);
}

export function enviarFacturaCorreo(userId: number, codfactura: number) {
  return apiRequest<void>(`/api/facturas/${codfactura}/enviar-correo`, {
    method: 'POST',
    body: JSON.stringify({ idUsuario: userId, forzarReenvio: true, correosCopia: [] }),
  });
}

export function anularFactura(userId: number, codfactura: number) {
  return apiRequest<void>(`/api/facturas/${codfactura}?idUsuario=${userId}`, { method: 'DELETE' });
}

function normalizeFacturaRows(response: ApiRow[] | Record<string, unknown>): ApiRow[] {
  if (Array.isArray(response)) return response;

  const values = [
    response.items,
    response.Items,
    response.data,
    response.Data,
    response.facturas,
    response.Facturas,
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
      const nestedRows = normalizeFacturaRows(value);
      if (nestedRows.length) return nestedRows;
    }
  }

  const firstArray = Object.values(response).find(Array.isArray);
  if (Array.isArray(firstArray)) return firstArray as ApiRow[];

  return Object.keys(response).length ? [response] : [];
}

function toFacturaListItem(row: ApiRow): FacturaListItem {
  const serie = text(pickValue(row, ['serie', 'Serie', 'serieFactura', 'SerieFactura']));
  const numero = text(pickValue(row, ['numfactura', 'NumFactura', 'numeroFactura', 'NumeroFactura', 'numero', 'Numero', 'secuencial', 'Secuencial']));
  const numeroCompleto = text(pickValue(row, ['numeroCompleto', 'NumeroCompleto', 'numeroDocumento', 'NumeroDocumento', 'documento', 'Documento', 'comprobante', 'Comprobante']));

  return {
    codfactura: numberValue(pickValue(row, ['codfactura', 'CodFactura', 'codFactura', 'idFactura', 'IdFactura', 'id', 'Id', 'codigo', 'Codigo', 'sec', 'Sec'])) ?? 0,
    numfactura: numero || null,
    numeroCompleto: numeroCompleto || [serie, numero].filter(Boolean).join('-') || null,
    serie: serie || null,
    fechaEmision: text(pickValue(row, ['fechaEmision', 'FechaEmision', 'fechaemision', 'Fechaemision', 'fecha', 'Fecha', 'fechaDocumento', 'FechaDocumento', 'fechaSustento', 'FechaSustento', 'fechaentrega', 'FechaEntrega', 'fechaCreacion', 'FechaCreacion', 'createdAt', 'CreatedAt'])) || null,
    estadoSri: text(pickValue(row, ['estadoSri', 'EstadoSri', 'estadoSRI', 'EstadoSRI', 'estadoAutorizacion', 'EstadoAutorizacion', 'estado', 'Estado'])) || null,
    autorizado: booleanValue(pickValue(row, ['autorizado', 'Autorizado', 'estaAutorizado', 'EstaAutorizado'])),
    numeroAutorizacion: text(pickValue(row, ['numeroAutorizacion', 'NumeroAutorizacion', 'autorizacion', 'Autorizacion'])) || null,
    mensajeSri: text(pickValue(row, ['mensajeSri', 'MensajeSri', 'mensajeSRI', 'MensajeSRI', 'mensaje', 'Mensaje'])) || null,
    total: numberValue(pickValue(row, ['total', 'Total', 'valortotal', 'ValorTotal', 'valorTotal', 'totalFactura', 'TotalFactura', 'totalComprobante', 'TotalComprobante', 'totalDocumento', 'TotalDocumento', 'montoTotal', 'MontoTotal', 'importeTotal', 'ImporteTotal', 'valorDocumento', 'ValorDocumento', 'totalGeneral', 'TotalGeneral', 'monto', 'Monto', 'importe', 'Importe'])),
    totalAbonado: numberValue(pickValue(row, ['totalAbonado', 'TotalAbonado', 'abonado', 'Abonado', 'valorAbonado', 'ValorAbonado', 'montoAbonado', 'MontoAbonado'])),
    saldoPendiente: numberValue(pickValue(row, ['saldoPendiente', 'SaldoPendiente', 'saldo', 'Saldo', 'valorPendiente', 'ValorPendiente', 'montoPendiente', 'MontoPendiente'])),
    tipopago: text(pickValue(row, ['tipopago', 'TipoPago', 'tipoPago', 'formaPago', 'FormaPago'])) || null,
    estadoPago: text(pickValue(row, ['estadoPago', 'EstadoPago'])) || null,
    cliente: text(pickValue(row, ['cliente', 'Cliente', 'nombreCliente', 'NombreCliente', 'razonSocial', 'RazonSocial', 'nombrerazonsocial', 'NombreRazonSocial'])) || null,
    identificacionCliente: text(pickValue(row, ['identificacionCliente', 'IdentificacionCliente', 'numeroIdentificacion', 'NumeroIdentificacion', 'ruc', 'Ruc', 'cedula', 'Cedula'])) || null,
    estado: booleanValue(pickValue(row, ['estado', 'Estado', 'activo', 'Activo'])),
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
    if (['false', '0', 'no', 'n', 'pendiente', 'inactivo', 'anulado'].includes(normalized)) return false;
  }

  return null;
}
