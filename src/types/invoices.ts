import type { FacturaProducto } from '../services/facturasMobileService';

export type NuevaFacturaLinea = {
  producto: FacturaProducto;
  cantidad: string;
  precio: string;
  descuento: string;
  tarifa: string;
};

export type NuevaFacturaFormState = {
  clienteBusqueda: string;
  productoBusqueda: string;
  serie: string;
  numeroFactura: string;
  formaPago: string;
  tipoIdentificacion: string;
  tipoCliente: string;
  obligadoContabilidad: string;
  direccion: string;
  telefono: string;
  correoPrincipal: string;
  referencia: string;
  correoAdicional: string;
  detalleLinea: string;
};
