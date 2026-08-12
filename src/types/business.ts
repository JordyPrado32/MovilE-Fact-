export type Cliente = {
  codcliente: number;
  apellidos?: string | null;
  nombres?: string | null;
  nombrecomercial?: string | null;
  nombrerazonsocial?: string | null;
  numeroidentificacion?: string | null;
  direccion?: string | null;
  telefonoconvencional?: string | null;
  celular?: string | null;
  correo?: string | null;
  diasCredito?: number | null;
  correosAdicionales?: string[];
  observaciones?: string | null;
  oblgconta?: string | null;
  tipoCliente?: number | null;
  estado?: boolean | null;
  pais?: number | null;
  provincia?: number | null;
  ciudad?: number | null;
  tipoidentificacion?: number | null;
  esProveedor?: boolean;
  cuentaContableProveedor?: string | null;
  creditoTributarioProveedor?: string | null;
  codigoProveedor?: string | null;
  esSujetoRetencionProveedor?: boolean;
};

export type ClienteUpsert = Omit<Cliente, 'codcliente'>;

export type ClienteTipoLookup = {
  tclCodigo: number;
  descripcion: string;
};

export type PaisLookup = {
  idPais: number;
  descripcion: string;
};

export type IdentificacionLookup = {
  ideSec: number;
  ideCodigo: string;
  ideDescripcion: string;
};

export type ProvinciaLookup = {
  idProvincia: number;
  descripcion: string;
};

export type CiudadLookup = {
  idCiudad: number;
  descripcion: string;
};

export type ClienteLookups = {
  tipos: ClienteTipoLookup[];
  paises: PaisLookup[];
  identificaciones: IdentificacionLookup[];
};

export type ProductoTipo = 'PRODUCTO' | 'SERVICIO';

export type Producto = {
  codproducto: number;
  tipo: ProductoTipo;
  nombre: string;
  codigo?: string | null;
  precioBase: number;
  precios?: number[];
  iva?: boolean | null;
  tarifa?: number | null;
  tarifaDescripcion?: string | null;
  categoria?: number | null;
  categoriaDescripcion?: string | null;
  subcategoria?: number | null;
  subcategoriaDescripcion?: string | null;
  estado?: boolean | null;
};

export type ProductoUpsert = Omit<Producto, 'codproducto' | 'tarifaDescripcion' | 'categoriaDescripcion' | 'subcategoriaDescripcion'>;

export type TarifaLookup = {
  idTarifa: number;
  descripcion: string;
};

export type CategoriaLookup = {
  idCategoria: number;
  descripcion: string;
};

export type SubcategoriaLookup = {
  idSubcategoria: number;
  idCategoria?: number | null;
  descripcion: string;
};

export type ProductoLookups = {
  tarifas: TarifaLookup[];
  categorias: CategoriaLookup[];
  subcategorias: SubcategoriaLookup[];
};

export type CategoriaCatalogo = {
  idCategoria: number;
  descripcion: string;
  estado?: boolean | null;
};

export type SubcategoriaCatalogo = {
  idSubcategoria: number;
  idCategoria: number | null;
  categoriaDescripcion?: string | null;
  descripcion: string;
  estado?: boolean | null;
};

export type CategoriaUpsert = {
  descripcion: string;
  estado: boolean;
};

export type SubcategoriaUpsert = {
  descripcion: string;
  idCategoria: number | null;
  estado: boolean;
};

export type Emisor = {
  codigo: number;
  razonSocial?: string | null;
  ruc?: string | null;
  nomComercial?: string | null;
  dirEstablecimiento?: string | null;
  email?: string | null;
  llevaContabilidad?: string | null;
  logoImagen?: string | null;
  direccionMatriz?: string | null;
  claveInterna?: string | null;
  retenciones?: string | null;
  pathCertificado?: string | null;
  claveCertificado?: string | null;
  tieneClaveCertificadoConfigurada?: boolean;
  eliminarClaveCertificado?: boolean;
  telefono?: string | null;
  estado?: boolean | null;
  idUsuario?: number | null;
  codEstablecimiento?: string | null;
  codPuntoEmision?: string | null;
};

export type EmisorUpsert = Omit<Emisor, 'tieneClaveCertificadoConfigurada'>;

export type FirmaEstado = {
  esValida: boolean;
  estadoVigencia?: string | null;
  mensaje?: string | null;
  nombreTitular?: string | null;
  identificacion?: string | null;
  fechaExpiracion?: string | null;
  diasRestantes?: number | null;
};

export type PerfilUsuario = {
  idUsuario: number;
  nombres?: string | null;
  apellidos?: string | null;
  nombreEmpresa?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  identificacion?: string | null;
  tipoCliente?: number | null;
  idTipoIdentificacion?: number | null;
  direccionEmpresa?: string | null;
  celular?: string | null;
};

export type PerfilUpsert = PerfilUsuario & {
  nuevaPassword?: string | null;
  confirmarPassword?: string | null;
};

export type PerfilLookup = {
  perfil: PerfilUsuario;
  tiposCliente: ClienteTipoLookup[];
  tiposIdentificacion: {
    idTipoIdentificacion: number;
    nombreTipo: string;
    descripcion?: string | null;
  }[];
};

export type PuntoEmision = {
  sec: number;
  numCaja?: number | null;
  idUsuario?: number | null;
  idEmpresa?: number | null;
  idSucursal?: number | null;
  serieFactura?: string | null;
  serieGuia?: string | null;
  serieNotasCred?: string | null;
  estado?: boolean | null;
  esPrincipal?: boolean;
  establecimiento?: string | null;
  puntoEmision?: string | null;
};

export type PuntosEmisionData = {
  emisor?: {
    codigo: number;
    razonSocial?: string | null;
    ruc?: string | null;
    nomComercial?: string | null;
    codEstablecimiento?: string | null;
    dirEstablecimiento?: string | null;
    direccionMatriz?: string | null;
    idEmpresa?: number | null;
    idSucursal?: number | null;
  } | null;
  cajas: PuntoEmision[];
};
