import { ApiError, apiRequest } from './apiClient';
import { Cliente } from '../types/business';
import { FacturaPreparacion, FacturaProducto, buscarFacturaClientes, buscarFacturaProductos } from './facturasMobileService';

type ApiRow = Record<string, unknown>;

export type LiquidacionCompraListItem = {
  codLiquidacion: number;
  numero?: string | null;
  fecha?: string | null;
  proveedor?: string | null;
  identificacionProveedor?: string | null;
  estadoSri?: string | null;
  autorizado?: boolean | null;
  retencionDisponible?: boolean | null;
  base?: number | null;
  iva?: number | null;
  total?: number | null;
};

export type LiquidacionCompraLineaInput = {
  producto: FacturaProducto;
  cantidad: number;
  precio: number;
  descuento: number;
  tarifa: number;
};

export type LiquidacionCompraGuardarInput = {
  idUsuario: number;
  proveedor: Cliente;
  serie?: string | null;
  numero?: string | null;
  codemisor?: number | null;
  formaPago?: string | null;
  diasCredito?: number | null;
  correos?: string[];
  detalles: LiquidacionCompraLineaInput[];
};

export function getLiquidacionCompraPreparacion(userId: number) {
  return requestWithFallback<Record<string, unknown>>([
    `/api/liquidaciones-compra/preparacion?idUsuario=${userId}`,
    `/api/liquidacion-compra/preparacion?idUsuario=${userId}`,
    `/api/compras/liquidaciones/preparacion?idUsuario=${userId}`,
    `/api/facturas/preparacion?idUsuario=${userId}`,
  ]).then(normalizeLiquidacionPreparacion);
}

export async function getLiquidacionesCompra(userId: number, top = 0) {
  const response = await requestWithFallback<ApiRow[] | Record<string, unknown>>([
    `/api/liquidaciones-compra?idUsuario=${userId}&top=${top}`,
    `/api/liquidacion-compra?idUsuario=${userId}&top=${top}`,
    `/api/compras/liquidaciones?idUsuario=${userId}&top=${top}`,
  ]);
  return normalizeRows(response).map(toLiquidacionListItem);
}

export async function buscarLiquidacionProveedores(userId: number, filtro: string) {
  try {
    const response = await requestWithFallback<ApiRow[] | Record<string, unknown>>([
      `/api/liquidaciones-compra/proveedores/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`,
      `/api/liquidacion-compra/proveedores/buscar?idUsuario=${userId}&filtro=${encodeURIComponent(filtro)}`,
    ]);
    return normalizeRows(response).map(toProveedor);
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 0)) throw error;
    return buscarFacturaClientes(userId, filtro);
  }
}

export function buscarLiquidacionProductos(userId: number, filtro: string) {
  return buscarFacturaProductos(userId, filtro);
}

export async function guardarLiquidacionCompra(input: LiquidacionCompraGuardarInput) {
  const subtotal0 = input.detalles.reduce((sum, item) => sum + (item.tarifa <= 0 ? Math.max(item.cantidad * item.precio - item.descuento, 0) : 0), 0);
  const subtotal15 = input.detalles.reduce((sum, item) => sum + (item.tarifa > 0 ? Math.max(item.cantidad * item.precio - item.descuento, 0) : 0), 0);
  const subtotal = subtotal0 + subtotal15;
  const iva = input.detalles.reduce((sum, item) => {
    const base = Math.max(item.cantidad * item.precio - item.descuento, 0);
    return sum + base * (item.tarifa / 100);
  }, 0);

  const liquidacion = {
    usuario: input.idUsuario,
    codemisor: input.codemisor,
    coddocumento: 3,
    tipodocumento: 3,
    serie: input.serie?.replace(/-/g, '') || null,
    tipopago: input.formaPago || null,
    diasCredito: input.diasCredito ?? 0,
    estado: true,
    autorizado: false,
    fechaemision: new Date().toISOString(),
    subtotal,
    descuentos: input.detalles.reduce((sum, item) => sum + item.descuento, 0),
    iva,
    valortotal: subtotal + iva,
    codProveedor: input.proveedor.codcliente || null,
    tipoIdentificacionProveedor: input.proveedor.tipoidentificacion || '05',
    identificacionProveedor: input.proveedor.numeroidentificacion || '',
    razonSocialProveedor: input.proveedor.nombrerazonsocial || [input.proveedor.nombres, input.proveedor.apellidos].filter(Boolean).join(' '),
    direccionProveedor: input.proveedor.direccion || '',
    emailProveedor: input.proveedor.correo || '',
  };

  const detalles = input.detalles.map((item) => {
    const base = Math.max(item.cantidad * item.precio - item.descuento, 0);
    const valorIva = base * (item.tarifa / 100);
    return {
      codproducto: item.producto.codproducto,
      codprincipal: item.producto.codprincipal,
      codauxiliar: item.producto.codauxiliar,
      cantproducto: item.cantidad,
      descripproducto: item.producto.descripcion,
      precioproducto: item.precio,
      descuento: item.descuento,
      valortproducto: base,
      valoriva: valorIva,
      valortotal: base + valorIva,
      tarifa: item.tarifa,
      costo: item.producto.costo ?? 0,
    };
  });

  return apiRequest<{ mensaje: string; codLiquidacion?: number; numeroComprobante?: string | null }>(
    '/api/liquidaciones-compra/guardar-completa',
    {
      method: 'POST',
      body: JSON.stringify({
        Usuario: input.idUsuario,
        CodEmisor: input.codemisor,
        Estab: estab,
        PtoEmi: ptoEmi,
        Secuencial: input.numero || '',
        FechaEmision: new Date().toISOString(),
        TipoIdentificacionProveedor: input.proveedor.tipoidentificacion || '04',
        IdentificacionProveedor: input.proveedor.numeroidentificacion || '',
        RazonSocialProveedor: input.proveedor.nombrerazonsocial || input.proveedor.nombrecomercial || '',
        DireccionProveedor: input.proveedor.direccion || '',
        TelefonoFijoProveedor: input.proveedor.telefonoconvencional || '',
        TelefonoProveedor: input.proveedor.celular || '',
        EmailProveedor: input.proveedor.correo || '',
        CorreosAdicionalesProveedor: input.correos?.filter(Boolean) ?? [],
        CorreosAdicionalesProveedorGuardar: [],
        CodProveedor: input.proveedor.codcliente || null,
        FormaPago: input.formaPago || '01',
        Plazo: input.diasCredito ?? 0,
        UnidadTiempo: 'dias',
        Moneda: 'DOLAR',
        Subtotal0: subtotal0,
        Subtotal15: subtotal15,
        TotalSinImpuestos: subtotal,
        TotalDescuento: input.detalles.reduce((sum, item) => sum + item.descuento, 0),
        Iva15: iva,
        IvaTotal: iva,
        ImporteTotal: subtotal + iva,
        Detalles: detalles,
      }),
    },
  );

  const codLiquidacion = response.codFactura ?? response.CodFactura;
  return { mensaje: response.mensaje ?? 'Liquidacion guardada correctamente.', codLiquidacion, numeroComprobante: null };
}

export function emitirLiquidacionCompra(userId: number, codFactura: number) {
  return apiRequest<{ estado?: string; mensaje?: string; autorizacion?: string }>(`/api/liquidaciones-compra/${codFactura}/emitir?idUsuario=${userId}`, { method: 'POST' });
}

export function getLiquidacionCompraPdf(userId: number, codLiquidacion: number) {
  return apiRequest<{ url: string }>(`/api/liquidaciones-compra/${codLiquidacion}/pdf?idUsuario=${userId}`);
}

export function getLiquidacionCompraXml(userId: number, codLiquidacion: number) {
  return apiRequest<{ url: string }>(`/api/liquidaciones-compra/${codLiquidacion}/xml?idUsuario=${userId}`);
}

export function enviarLiquidacionCompraCorreo(userId: number, codLiquidacion: number) {
  return apiRequest<void>(`/api/liquidaciones-compra/${codLiquidacion}/enviar-correo?idUsuario=${userId}`, { method: 'POST' });
}

export function emitirLiquidacionCompra(userId: number, codLiquidacion: number) {
  return apiRequest<void>(`/api/liquidaciones-compra/${codLiquidacion}/emitir?idUsuario=${userId}`, { method: 'POST' });
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

function normalizeLiquidacionPreparacion(response: Record<string, unknown>): FacturaPreparacion {
  const preview = isRecord(response.preview) ? response.preview : isRecord(response.Preview) ? response.Preview : null;
  if (!preview) return response as FacturaPreparacion;

  const serieVisual = text(pickValue(preview, ['SerieVisual', 'serieVisual']));
  const serieRaw = text(pickValue(preview, ['Serie', 'serie']));
  const secuencial = text(pickValue(preview, ['Secuencial', 'secuencial']));
  const codemisor = numberValue(pickValue(preview, ['CodEmisor', 'codemisor', 'codEmisor']));
  const normalized = response as FacturaPreparacion;

  return {
    ...normalized,
    caja: {
      ...(normalized.caja ?? {}),
      serieLiquidacion: serieVisual || serieRaw || normalized.caja?.serieLiquidacion,
      serieLiquidacionCompra: serieVisual || serieRaw || normalized.caja?.serieLiquidacionCompra,
      siguiente: secuencial || normalized.caja?.siguiente,
      proximo: secuencial || normalized.caja?.proximo,
      codemisor: codemisor ?? normalized.caja?.codemisor,
    },
    series: [
      {
        serieRaw: serieVisual || serieRaw,
        serieVisual: serieVisual || serieRaw,
        codemisor: codemisor ?? null,
        siguiente: secuencial || null,
        proximo: secuencial || null,
      },
      ...(normalized.series ?? []),
    ].filter((item) => Boolean(item.serieRaw || item.serieVisual)),
    formasPago: normalizeFormasPago(response.formasPago ?? response.FormasPago) ?? normalized.formasPago,
  };
}

function normalizeFormasPago(value: unknown): FacturaPreparacion['formasPago'] {
  if (!Array.isArray(value)) return undefined;
  return value.filter(isRecord).map((row) => ({
    codigo: text(pickValue(row, ['codigo', 'Codigo'])) || null,
    descripcion: text(pickValue(row, ['descripcion', 'Descripcion'])) || null,
  }));
}

function normalizeRows(response: ApiRow[] | Record<string, unknown>): ApiRow[] {
  if (Array.isArray(response)) return response;
  const values = [response.items, response.Items, response.data, response.Data, response.liquidaciones, response.Liquidaciones, response.registros, response.Registros, response.result, response.Result, response.results, response.Results];
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

function toProveedor(row: ApiRow): Cliente {
  return {
    codcliente: numberValue(pickValue(row, ['codcliente', 'CodCliente', 'codProveedor', 'CodProveedor', 'id', 'Id'])) ?? 0,
    nombrerazonsocial: text(pickValue(row, ['nombrerazonsocial', 'NombreRazonSocial', 'razonSocial', 'RazonSocial', 'proveedor', 'Proveedor', 'nombre', 'Nombre'])) || null,
    numeroidentificacion: text(pickValue(row, ['numeroidentificacion', 'NumeroIdentificacion', 'identificacion', 'Identificacion', 'ruc', 'Ruc'])) || null,
    correo: text(pickValue(row, ['correo', 'Correo', 'email', 'Email'])) || null,
    direccion: text(pickValue(row, ['direccion', 'Direccion'])) || null,
    celular: text(pickValue(row, ['celular', 'Celular', 'telefono', 'Telefono'])) || null,
    esProveedor: true,
  };
}

function toLiquidacionListItem(row: ApiRow): LiquidacionCompraListItem {
  const serie = text(pickValue(row, ['serie', 'Serie']));
  const numero = text(pickValue(row, ['numero', 'Numero', 'numLiquidacion', 'NumLiquidacion', 'secuencial', 'Secuencial']));
  const numeroCompleto = text(pickValue(row, ['numeroCompleto', 'NumeroCompleto', 'numeroDocumento', 'NumeroDocumento', 'documento', 'Documento']));
  return {
    codLiquidacion: numberValue(pickValue(row, ['codLiquidacion', 'CodLiquidacion', 'codliquidacion', 'idLiquidacion', 'IdLiquidacion', 'id', 'Id'])) ?? 0,
    numero: numeroCompleto || [serie, numero].filter(Boolean).join('-') || numero || null,
    fecha: text(pickValue(row, ['fecha', 'Fecha', 'fechaEmision', 'FechaEmision', 'fechaemision', 'Fechaemision', 'fechaDocumento', 'FechaDocumento', 'fechaSustento', 'FechaSustento', 'fechaCompra', 'FechaCompra', 'fechaCreacion', 'FechaCreacion', 'fechaAutorizacion', 'FechaAutorizacion'])) || null,
    proveedor: text(pickValue(row, ['proveedor', 'Proveedor', 'nombreProveedor', 'NombreProveedor', 'razonSocial', 'RazonSocial'])) || null,
    identificacionProveedor: text(pickValue(row, ['identificacionProveedor', 'IdentificacionProveedor', 'numeroIdentificacion', 'NumeroIdentificacion', 'ruc', 'Ruc'])) || null,
    estadoSri: text(pickValue(row, ['estadoSri', 'EstadoSri', 'estadoSRI', 'EstadoSRI', 'estado', 'Estado'])) || null,
    autorizado: booleanValue(pickValue(row, ['autorizado', 'Autorizado'])),
    retencionDisponible: booleanValue(pickValue(row, ['retencionDisponible', 'RetencionDisponible', 'tieneRetencion', 'TieneRetencion'])),
    base: numberValue(pickValue(row, ['base', 'Base', 'baseImponible', 'BaseImponible', 'subtotal', 'Subtotal', 'subtotalBase', 'SubtotalBase', 'subtotalSinImpuestos', 'SubtotalSinImpuestos', 'totalSinImpuestos', 'TotalSinImpuestos', 'baseGravada', 'BaseGravada', 'valorBase', 'ValorBase', 'importeBase', 'ImporteBase'])),
    iva: numberValue(pickValue(row, ['iva', 'Iva', 'IVA', 'valorIva', 'ValorIva', 'valorIVA', 'ValorIVA', 'totalIva', 'TotalIva', 'totalIVA', 'TotalIVA', 'importeIva', 'ImporteIva'])),
    total: numberValue(pickValue(row, ['total', 'Total', 'valortotal', 'ValorTotal', 'valorTotal', 'totalLiquidacion', 'TotalLiquidacion', 'totalComprobante', 'TotalComprobante', 'totalDocumento', 'TotalDocumento', 'montoTotal', 'MontoTotal', 'importeTotal', 'ImporteTotal', 'valorDocumento', 'ValorDocumento', 'totalGeneral', 'TotalGeneral', 'monto', 'Monto', 'importe', 'Importe', 'valor', 'Valor'])),
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
    if (['true', '1', 'si', 'sí', 's', 'autorizado', 'activo', 'disponible'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'pendiente', 'no autorizado', 'inactivo', 'no disponible'].includes(normalized)) return false;
  }
  return null;
}
