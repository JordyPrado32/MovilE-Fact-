import { apiRequest, apiRequestBinary } from './apiClient';
import { FirmaEstado } from '../types/business';

export type ERubricaDashboard = {
  solicitudes?: unknown[];
  firmas?: unknown[];
  notificaciones?: unknown[];
  entregasFirma?: unknown[];
  renovacion?: unknown;
  menus?: unknown[];
};

export type ERubricaEmisor = {
  id: number;
  codigo?: number;
  Codigo?: number;
  Id?: number;
  razonSocial?: string | null;
  RazonSocial?: string | null;
  ruc?: string | null;
  Ruc?: string | null;
  RUC?: string | null;
  nomComercial?: string | null;
  NomComercial?: string | null;
  email?: string | null;
  telefono?: string | null;
  tieneCertificado?: boolean;
  tieneClave?: boolean;
  esValida?: boolean;
  estadoVigencia?: string | null;
  fechaExpiracion?: string | null;
  diasRestantes?: number | null;
  mensaje?: string | null;
};

const ROOT = '/api/mobile/e-rubrica';

export const getERubricaDashboard = (take = 8) =>
  apiRequest<ERubricaDashboard>(`${ROOT}/dashboard?take=${Math.max(1, Math.min(50, take))}`);

export const getERubricaEmisores = async () => {
  const response = await apiRequest<ERubricaEmisor[] | { emisores?: ERubricaEmisor[] }>(`${ROOT}/emisores`);
  const items = Array.isArray(response) ? response : response.emisores ?? [];
  return items.map((item) => ({
    ...item,
    id: item.id ?? item.Id ?? item.codigo ?? item.Codigo ?? 0,
    razonSocial: item.razonSocial ?? item.RazonSocial,
    ruc: item.ruc ?? item.Ruc ?? item.RUC,
    nomComercial: item.nomComercial ?? item.NomComercial,
  }));
};

export const getERubricaFirmaEstado = (id: number) =>
  apiRequest<Record<string, unknown>>(`${ROOT}/emisores/${id}/firma/estado`, { timeoutMs: 12000 }).then((item) => ({
    tieneCertificado: Boolean(item.tieneCertificado ?? item.TieneCertificado),
    tieneClave: Boolean(item.tieneClave ?? item.TieneClave),
    esValida: Boolean(item.esValida ?? item.EsValida),
    estadoVigencia: (item.estadoVigencia ?? item.EstadoVigencia) as string | null | undefined,
    fechaExpiracion: (item.fechaExpiracion ?? item.FechaExpiracion) as string | null | undefined,
    diasRestantes: (item.diasRestantes ?? item.DiasRestantes) as number | null | undefined,
    mensaje: (item.mensaje ?? item.Mensaje) as string | null | undefined,
    nombreTitular: (item.nombreTitular ?? item.NombreTitular) as string | null | undefined,
    identificacion: (item.identificacion ?? item.Identificacion) as string | null | undefined,
    fechaEmision: (item.fechaEmision ?? item.FechaEmision) as string | null | undefined,
    numeroSerie: (item.numeroSerie ?? item.NumeroSerie) as string | null | undefined,
    huellaDigital: (item.huellaDigital ?? item.HuellaDigital) as string | null | undefined,
  }));

export const getERubricaSolicitudes = () => apiRequest<unknown[]>(`${ROOT}/solicitudes`);

export const getERubricaFirmas = () => apiRequest<unknown[]>(`${ROOT}/firmas`);

export const getERubricaRenovacion = () => apiRequest<unknown>(`${ROOT}/renovacion`);

export const getERubricaProductos = () => apiRequest<unknown[]>(`${ROOT}/catalogos/productos`);

export const getERubricaStakeholderProductos = (stakeholderUuid?: string) =>
  apiRequest<unknown[]>(`${ROOT}/catalogos/stakeholder-productos${stakeholderUuid ? `?stakeholderUuid=${encodeURIComponent(stakeholderUuid)}` : ''}`);

export const getERubricaSaldo = () => apiRequest<{ balance?: number }>(`${ROOT}/catalogos/saldo`);

export const buscarERubricaSolicitudesProveedor = (params: { q?: string; status?: string; uuid?: string } = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value?.trim()) query.set(key, value.trim()); });
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<unknown[]>(`${ROOT}/proveedor/solicitudes${suffix}`);
};

export const sincronizarERubricaPendientes = () =>
  apiRequest<unknown>(`${ROOT}/solicitudes/sincronizar-pendientes`, { method: 'POST' });

export const sincronizarERubricaSolicitud = (solId: number) =>
  apiRequest<unknown>(`${ROOT}/solicitudes/${solId}/sincronizar`, { method: 'POST' });

export const marcarEntregaERubricaVista = (observacionId: number) =>
  apiRequest<unknown>(`${ROOT}/notificaciones/entregas/${observacionId}/vista`, { method: 'POST' });

export const validarERubricaQr = (entrada: string) =>
  apiRequest<unknown>(`${ROOT}/documentos/validar-qr?entrada=${encodeURIComponent(entrada)}`);

export const firmarERubricaDocumento = (form: FormData) =>
  apiRequestBinary(`${ROOT}/documentos/firmar`, { method: 'POST', body: form });
