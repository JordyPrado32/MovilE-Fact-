import { ApiError, apiRequest } from './apiClient';
import { DOCUMENTOS_COMPRA_PAGO_PATH } from '../config/api';

export type OperationalModule =
  | 'compras'
  | 'cuentas-cobrar'
  | 'recargas'
  | 'reportes'
  | 'centro-normativo';

export type OperationalMobileItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  status?: string | null;
  detail?: string | null;
  raw?: Record<string, unknown>;
};

export type OperationalRequestContext = {
  userId?: number;
};

export type CompraDocumentosPagoInput = {
  documentos: number;
  montoTotal: number;
  descripcion?: string;
  emailDestino?: string | null;
  esIlimitado?: boolean;
  esPermanente?: boolean;
};

export type CompraDocumentosPagoResponse = {
  paymentUrl: string;
  purchaseId: string;
  status: string;
};

export type OperationalModuleConfig = {
  eyebrow: string;
  title: string;
  description: string;
  tabs: string[];
  placeholder: string;
};

type ApiRow = Record<string, unknown>;

const moduleConfigs: Record<OperationalModule, OperationalModuleConfig> = {
  compras: {
    eyebrow: 'Compras',
    title: 'Compras',
    description: 'Consulta XML, documentos de compra y liquidaciones.',
    tabs: ['Documentos', 'Liquidaciones', 'XML'],
    placeholder: 'Buscar por proveedor, RUC, secuencial o estado',
  },
  'cuentas-cobrar': {
    eyebrow: 'Cartera',
    title: 'Cuentas por cobrar',
    description: 'Revisa abonos, saldos y estados de cuenta.',
    tabs: ['Cuentas por cobrar', 'Estado de cuenta', 'Abonos'],
    placeholder: 'Buscar por cliente, identificacion, documento o saldo',
  },
  recargas: {
    eyebrow: 'Documentos',
    title: 'Compra de documentos',
    description: 'Compra documentos, revisa paquetes e historial de recargas.',
    tabs: ['Comprar documentos', 'Historial', 'Paquetes'],
    placeholder: 'Buscar por paquete, comprobante, fecha o estado',
  },
  reportes: {
    eyebrow: 'Reportes',
    title: 'Reporte de documentos',
    description: 'Consulta documentos emitidos y reportes operativos.',
    tabs: ['Documentos', 'Emitidos', 'Recibidos'],
    placeholder: 'Buscar por cliente, numero, autorizacion o estado',
  },
  'centro-normativo': {
    eyebrow: 'Normativa',
    title: 'Centro normativo',
    description: 'Consulta la biblioteca normativa publicada en e-fact.',
    tabs: ['Normativas'],
    placeholder: 'Buscar por codigo, titulo, categoria o contenido',
  },
};

const endpoints: Record<OperationalModule, Record<string, string[]>> = {
  compras: {
    Documentos: ['/api/compras/documentos'],
    Liquidaciones: ['/api/compras/liquidaciones'],
    XML: ['/api/compras/xml'],
  },
  'cuentas-cobrar': {
    'Cuentas por cobrar': ['/api/cuentas-cobrar'],
    'Estado de cuenta': ['/api/cuentas-cobrar/estado-cuenta'],
    Abonos: ['/api/cuentas-cobrar/abonos'],
  },
  recargas: {
    'Comprar documentos': ['/api/documentos/compra'],
    Historial: ['/api/documentos/recargas'],
    Paquetes: ['/api/documentos/paquetes'],
  },
  reportes: {
    Documentos: ['/api/reportes/documentos'],
    Emitidos: ['/api/reportes/documentos/emitidos'],
    Recibidos: ['/api/reportes/documentos/recibidos'],
  },
  'centro-normativo': {
    Normativas: ['/api/centro-normativo', '/api/configuracion/centro-normativo'],
  },
};

export function getOperationalModuleConfig(module: OperationalModule) {
  return moduleConfigs[module];
}

export function getOperationalEndpoint(module: OperationalModule, tab: string) {
  return getOperationalEndpoints(module, tab)[0];
}

export async function getOperationalMobileModule(module: OperationalModule, search = '', tab = '', context: OperationalRequestContext = {}) {
  const endpoints = getOperationalEndpoints(module, tab || moduleConfigs[module].tabs[0]);
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (context.userId) params.set('idUsuario', String(context.userId));
  const query = params.toString();
  const response = await requestWithFallback<ApiRow[] | ApiRow>(endpoints, (endpoint) => `${endpoint}${query ? `?${query}` : ''}`);
  const rows = normalizeRows(response, module, tab);

  return { items: rows.map((row) => toOperationalItem(row)) };
}

export function createOperationalItem(module: OperationalModule, tab: string, payload: ApiRow, context: OperationalRequestContext = {}) {
  return requestWithFallback<void>(getOperationalEndpoints(module, tab), (endpoint) => withUserQuery(endpoint, context), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function iniciarPagoCompraDocumentos(userId: number, payload: CompraDocumentosPagoInput) {
  return apiRequest<CompraDocumentosPagoResponse>(`${DOCUMENTOS_COMPRA_PAGO_PATH}?idUsuario=${userId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    timeoutMs: 30000,
  });
}

export function updateOperationalItem(module: OperationalModule, tab: string, id: string, payload: ApiRow, context: OperationalRequestContext = {}) {
  return requestWithFallback<void>(getOperationalEndpoints(module, tab), (endpoint) => withUserQuery(`${endpoint}/${encodeURIComponent(id)}`, context), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteOperationalItem(module: OperationalModule, tab: string, id: string, context: OperationalRequestContext = {}) {
  return requestWithFallback<void>(getOperationalEndpoints(module, tab), (endpoint) => withUserQuery(`${endpoint}/${encodeURIComponent(id)}`, context), {
    method: 'DELETE',
  });
}

function withUserQuery(path: string, context: OperationalRequestContext) {
  if (!context.userId) return path;

  return `${path}${path.includes('?') ? '&' : '?'}idUsuario=${context.userId}`;
}

function getOperationalEndpoints(module: OperationalModule, tab: string) {
  return endpoints[module][tab] ?? Object.values(endpoints[module])[0];
}

async function requestWithFallback<T>(candidates: string[], buildPath: (endpoint: string) => string, options?: RequestInit): Promise<T> {
  let lastError: unknown;

  for (const endpoint of candidates) {
    try {
      return await apiRequest<T>(buildPath(endpoint), options);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) {
        throw error;
      }

      lastError = error;
    }
  }

  throw lastError;
}

function normalizeRows(response: ApiRow[] | ApiRow, module: OperationalModule, tab: string): ApiRow[] {
  if (Array.isArray(response)) return response;

  const values = [
    response.items,
    response.Items,
    response.data,
    response.Data,
    response.registros,
    response.Registros,
    response.result,
    response.Result,
    response.results,
    response.Results,
    response[module],
    response[normalizeKey(module)],
    response[normalizeKey(tab)],
  ];

  for (const value of values) {
    if (Array.isArray(value)) return value as ApiRow[];
    if (isRecord(value)) {
      const nestedRows = normalizeRows(value, module, tab);
      if (nestedRows.length) return nestedRows;
    }
  }

  const firstArray = Object.values(response).find(Array.isArray);
  if (Array.isArray(firstArray)) return firstArray as ApiRow[];

  return Object.keys(response).length ? [response] : [];
}

function toOperationalItem(row: ApiRow): OperationalMobileItem {
  const id = text(pickValue(row, ['id', 'Id', 'idCliente', 'IdCliente', 'idFactura', 'IdFactura', 'codigo', 'Codigo', 'sec', 'Sec', 'numero', 'Numero', 'numeroFactura', 'NumeroFactura', 'numeroDocumento', 'NumeroDocumento', 'documento', 'Documento', 'claveAcceso', 'ClaveAcceso']));
  const title = text(pickValue(row, ['titulo', 'Titulo', 'nombreCliente', 'NombreCliente', 'cliente', 'Cliente', 'terceroNombre', 'TerceroNombre', 'proveedor', 'Proveedor', 'razonSocial', 'RazonSocial', 'nombre', 'Nombre', 'descripcion', 'Descripcion', 'documento', 'Documento'])) || id || 'Registro';
  const subtitle = text(pickValue(row, ['codigo', 'Codigo', 'categoria', 'Categoria', 'numeroIdentificacion', 'NumeroIdentificacion', 'terceroIdentificacion', 'TerceroIdentificacion', 'numeroDocumento', 'NumeroDocumento', 'numeroFactura', 'NumeroFactura', 'secuencial', 'Secuencial', 'ruc', 'Ruc', 'identificacion', 'Identificacion', 'fecha', 'Fecha', 'fechaEmision', 'FechaEmision']));
  const meta = text(pickValue(row, ['saldoTotalCliente', 'SaldoTotalCliente', 'saldoActual', 'SaldoActual', 'saldoPendiente', 'SaldoPendiente', 'total', 'Total', 'valorFacturado', 'ValorFacturado', 'totalAbonos', 'TotalAbonos', 'saldo', 'Saldo', 'valor', 'Valor', 'monto', 'Monto', 'cantidad', 'Cantidad']));
  const status = text(pickValue(row, ['estadoNorma', 'EstadoNorma', 'estadoDocumento', 'EstadoDocumento', 'estado', 'Estado', 'status', 'Status']));
  const detail = text(pickValue(row, ['resumen', 'Resumen', 'contenido', 'Contenido', 'detalle', 'Detalle', 'observacion', 'Observacion', 'autorizacion', 'Autorizacion', 'numeroAutorizacion', 'NumeroAutorizacion', 'claveAcceso', 'ClaveAcceso']));

  return { id, title, subtitle, meta, status, detail, raw: row };
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
