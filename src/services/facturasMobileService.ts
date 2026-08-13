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
  caja?: { serieFactura?: string | null; numCaja?: number | null; sec?: number | null; codemisor?: number | null } | null;
  series?: { serieRaw?: string | null; serieVisual?: string | null; codemisor?: number | null }[];
  formasPago?: { id?: number; codigo?: string | null; descripcion?: string | null; descripcionSri?: string | null }[];
};

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

export function getFacturas(userId: number, top = 0) {
  return apiRequest<FacturaListItem[]>(`/api/facturas?idUsuario=${userId}&top=${top}`);
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
