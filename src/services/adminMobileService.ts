import { apiRequest } from './apiClient';

export type AdminMobileItem = {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  meta?: string | null;
  status?: string | null;
  detail?: string | null;
};

export type AdminMobileResponse = {
  items: AdminMobileItem[];
};

type ApiRow = Record<string, unknown>;

const endpoints: Record<string, (tab: string) => string> = {
  'cajas-secuencias': () => '/api/cajas-secuencias',
  'roles-permisos': () => '/api/roles-permisos/roles',
  impuestos: (tab) => (tab === 'Porcentajes IVA' ? '/api/impuestos/iva' : '/api/impuestos/codigos'),
  usuarios: () => '/api/usuarios-admin',
  identificaciones: () => '/api/identificaciones',
  'formas-pago': (tab) => (tab === 'Tipos de Documento' ? '/api/formas-pago/tipos-documento' : '/api/formas-pago'),
  'logs-inicio': () => '/api/logs-inicio',
  retenciones: (tab) => (tab === 'ISD' ? '/api/retenciones-catalogo/isd' : tab === 'Renta' ? '/api/retenciones-catalogo/renta' : '/api/retenciones-catalogo/iva'),
  'sql-auditoria': () => '/api/sql-auditoria',
};

export async function getAdminMobileModule(module: string, search = '', tab = '') {
  const endpoint = endpoints[module]?.(tab);
  if (!endpoint) return { items: [] };

  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  const query = params.toString();
  const response = await apiRequest<ApiRow[] | Record<string, unknown>>(`${endpoint}${query ? `?${query}` : ''}`);
  const data = normalizeRows(response);

  return { items: data.map((row) => toAdminItem(module, tab, row)) };
}

function normalizeRows(response: ApiRow[] | Record<string, unknown>) {
  if (Array.isArray(response)) return response;

  const values = [
    response.items,
    response.data,
    response.registros,
    response.result,
    response.results,
  ];

  for (const value of values) {
    if (Array.isArray(value)) return value as ApiRow[];
  }

  return [];
}

function toAdminItem(module: string, tab: string, row: ApiRow): AdminMobileItem {
  if (module === 'cajas-secuencias') {
    return {
      id: getRowId(row),
      title: `Caja ${text(row.numCaja) || '-'}`,
      subtitle: text(row.idUsuario) ? `Usuario ${text(row.idUsuario)}` : 'Sin usuario',
      meta: text(row.serieFactura),
      detail: text(row.ultimoSecuencialFactura) ? `FAC ${text(row.ultimoSecuencialFactura)}` : '',
    };
  }

  if (module === 'roles-permisos') {
    return { id: getRowId(row), title: text(row.nombre), subtitle: text(row.descripcion), meta: 'Rol' };
  }

  if (module === 'impuestos') {
    return {
      id: getRowId(row),
      title: text(row.descripcion),
      subtitle: tab === 'Porcentajes IVA' ? `Valor ${text(row.valor)}` : `Codigo ${text(row.codigo)}`,
      meta: tab === 'Porcentajes IVA' ? text(row.valor) : text(row.codigo),
      detail: tab === 'Porcentajes IVA' ? `Calculo ${text(row.valorCalculo)}` : '',
    };
  }

  if (module === 'usuarios') {
    return {
      id: getRowId(row),
      title: `${text(row.nombres)} ${text(row.apellidos)}`.trim(),
      subtitle: text(row.email),
      meta: text(row.rol) || (text(row.idTipoUsuario) ? `Rol ${text(row.idTipoUsuario)}` : ''),
      status: row.cuentaBloqueada === true ? 'Bloqueada' : '',
    };
  }

  if (module === 'identificaciones') {
    return { id: getRowId(row), title: text(row.descripcion), subtitle: `Codigo ${text(row.codigo)}`, meta: text(row.codigo) };
  }

  if (module === 'formas-pago') {
    return {
      id: getRowId(row),
      title: text(row.descripcion),
      subtitle: text(row.descripcionSri) || `Codigo ${text(row.codigo)}`,
      meta: text(row.codigo),
      detail: [row.tipoVenta === true ? 'Venta' : '', row.tipoCompra === true ? 'Compra' : ''].filter(Boolean).join(' '),
    };
  }

  if (module === 'logs-inicio') {
    return {
      id: getRowId(row),
      title: text(row.usuario),
      subtitle: text(row.correo),
      meta: formatDate(row.fechaAcceso),
      status: row.exitoso === true ? 'Exitoso' : 'Fallido',
      detail: text(row.direccionIp) || text(row.detalleError),
    };
  }

  if (module === 'retenciones') {
    return {
      id: getRowId(row),
      title: text(row.descripcion),
      subtitle: tab || 'IVA',
      meta: text(row.valor),
      detail: text(row.informacionExtra),
    };
  }

  return {
    id: getRowId(row),
    title: text(row.usuario),
    subtitle: text(row.accion),
    meta: formatDate(row.fecha),
    status: text(row.accion),
    detail: text(row.detalles),
  };
}

function getRowId(row: ApiRow) {
  return text(row.id) ||
    text(row.codigo) ||
    text(row.sec) ||
    text(row.Sec) ||
    text(row.idLog) ||
    text(row.idUsuario) ||
    text(row.Id);
}

function text(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function formatDate(value: unknown) {
  const source = text(value);
  if (!source) return '';
  const date = new Date(source);
  if (Number.isNaN(date.getTime())) return source;
  return date.toLocaleString();
}
