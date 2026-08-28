import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Speech from 'expo-speech';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  ActivityIndicator,
  AccessibilityInfo,
  Alert,
  Animated,
  AppState,
  Easing,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiError, setSessionToken } from './src/services/apiClient';
import { sendBotMessage } from './src/services/botService';
import { API_BASE_URL } from './src/config/api';
import { AdminMobileItem, getAdminMobileModule } from './src/services/adminMobileService';
import { changePassword, checkAuth, login, recoverPassword, register } from './src/services/authService';
import { createCategoria, createSubcategoria, deleteCategoria, deleteSubcategoria, getCategorias, getSubcategorias, updateCategoria, updateSubcategoria } from './src/services/categoriasService';
import { createCliente, deleteCliente, getCiudades, getClienteLookups, getClientes, getProvincias, updateCliente } from './src/services/clientesService';
import { createEmisor, deleteEmisor, getEmisor, getEmisores, updateEmisor, uploadFirmaArchivo } from './src/services/emisoresService';
import { anularFactura, buscarFacturaClientes, buscarFacturaProductos, enviarFacturaCorreo, FacturaListItem, FacturaPreparacion, FacturaProducto, getFacturaPdf, getFacturas, getFacturaPreparacion, getFacturaXml, guardarFactura } from './src/services/facturasMobileService';
import { buscarGuiaClientes, buscarGuiaFacturas, buscarGuiaProductos, buscarGuiaTransportistas, enviarGuiaRemisionCorreo, getGuiaRemisionPdf, getGuiaRemisionPreparacion, getGuiasRemision, getGuiaRemisionXml, guardarGuiaRemision, GuiaRemisionListItem } from './src/services/guiasRemisionMobileService';
import { getMenusByRol, hasMenusByRolEndpoint } from './src/services/menuService';
import { buscarLiquidacionProductos, buscarLiquidacionProveedores, enviarLiquidacionCompraCorreo, getLiquidacionCompraPdf, getLiquidacionCompraPreparacion, getLiquidacionesCompra, getLiquidacionCompraXml, guardarLiquidacionCompra, LiquidacionCompraListItem } from './src/services/liquidacionesCompraMobileService';
import { buscarNotaCreditoFacturas, enviarNotaCreditoCorreo, getNotaCreditoPdf, getNotaCreditoPreparacion, getNotasCredito, getNotaCreditoXml, guardarNotaCredito, NotaCreditoListItem } from './src/services/notasCreditoMobileService';
import { buscarNotaDebitoFacturas, enviarNotaDebitoCorreo, getNotaDebitoPdf, getNotaDebitoPreparacion, getNotasDebito, getNotaDebitoXml, guardarNotaDebito, NotaDebitoListItem } from './src/services/notasDebitoMobileService';
import { getNotificaciones, NotificacionItem } from './src/services/notificacionesService';
import { syncDeviceNotifications } from './src/services/deviceNotificationsService';
import { createOperationalItem, deleteOperationalItem, getOperationalMobileModule, getOperationalModuleConfig, iniciarPagoCompraDocumentos, OperationalMobileItem, OperationalModule, updateOperationalItem } from './src/services/operationalMobileService';
import { getPerfil, updatePerfil, uploadPerfilAvatar } from './src/services/perfilService';
import { createPuntoEmision, deletePuntoEmision, getPuntosEmision, markPuntoPrincipal, updatePuntoEmision } from './src/services/puntosEmisionService';
import { createProducto, deleteProducto, getProducto, getProductoLookups, getProductos, getProductoSubcategorias, updateProducto } from './src/services/productosService';
import { enviarRetencionCorreo, getRetencionPdf, getRetenciones, getRetencionXml, RetencionListItem } from './src/services/retencionesMobileService';
import { ERubricaDashboard, ERubricaEmisor, firmarERubricaDocumento, getERubricaDashboard, getERubricaEmisores, getERubricaFirmaEstado, sincronizarERubricaPendientes, validarERubricaQr } from './src/services/erubricaMobileService';
import { ChangePasswordRequest, DynamicMenu, LoginResponse, RegisterRequest, ServiceAccess, TipoDocumento } from './src/types/auth';
import { CategoriaCatalogo, CiudadLookup, Cliente, ClienteLookups, Emisor, FirmaEstado, PerfilLookup, PerfilUsuario, Producto, ProductoLookups, ProductoTipo, ProvinciaLookup, PuntoEmision, PuntosEmisionData, SubcategoriaCatalogo, SubcategoriaLookup } from './src/types/business';
import {
  sanitizeIdentificacion,
  validateChangePassword,
  validateEmail,
  validateLogin,
  validateRegisterForm,
} from './src/utils/authValidation';
import { ItemDetailModal, ResultCollection } from './src/components/data/ResultCollection';
import { ExternalLink, Field, InlineSwitch, LoginActionTiles, MessageBox, PrimaryButton, SearchField, SecondaryButton, SecurityNotice, SegmentButton, TextLink } from './src/components/ui/FormControls';

type AuthMode = 'login' | 'register' | 'forgot' | 'change';

const EFACT_THEME = {
  colors: {
    primary: '#0072BD',
    primaryLight: '#EAF5FC',
    primarySoft: '#F4FAFE',
    primaryDark: '#07305E',
    secondary: '#21BF73',
    background: '#F6F9FC',
    surface: '#FFFFFF',
    surfaceSoft: '#F1F6FA',
    textPrimary: '#173E61',
    textSecondary: '#637587',
    textMuted: '#8A98A6',
    border: '#DCE8F1',
    success: '#18A66A',
    warning: '#C47A00',
    error: '#B4232D',
    info: '#00649D',
    disabled: '#A8B4BF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    input: 12,
    button: 12,
    card: 16,
    modal: 22,
    pill: 999,
  },
  shadow: {
    color: '#335D7B',
    offset: { width: 0, height: 8 },
    opacity: 0.1,
    radius: 18,
    elevation: 3,
  },
};
const ERUBRICA_COLORS = {
  primary: '#21A366',
  dark: '#137A4A',
  light: '#EAF8F0',
  border: '#BDE8CF',
  text: '#11613C',
};

let reduceMotionEnabled = false;
const reduceMotionListeners = new Set<() => void>();

AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
  reduceMotionEnabled = enabled;
  reduceMotionListeners.forEach((listener) => listener());
});

AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
  reduceMotionEnabled = enabled;
  reduceMotionListeners.forEach((listener) => listener());
});

function useReducedMotion() {
  return useSyncExternalStore(
    (listener) => {
      reduceMotionListeners.add(listener);
      return () => reduceMotionListeners.delete(listener);
    },
    () => reduceMotionEnabled,
    () => false,
  );
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs, value]);

  return debouncedValue;
}
type WorkspaceView =
  | 'portal'
  | 'dashboard'
  | 'perfil'
  | 'emisor'
  | 'firma'
  | 'e-rubrica'
  | 'punto-emision'
  | 'admin-cajas-secuencias'
  | 'admin-roles-permisos'
  | 'admin-impuestos'
  | 'admin-usuarios'
  | 'admin-identificaciones'
  | 'admin-formas-pago'
  | 'admin-logs-inicio'
  | 'admin-retenciones'
  | 'admin-sql-auditoria'
  | 'clientes'
  | 'nuevo-cliente'
  | 'nuevo-producto'
  | 'proveedores'
  | 'productos'
  | 'categorias'
  | 'facturacion'
  | 'nueva-factura'
  | 'mis-facturas'
  | 'notas-credito'
  | 'nueva-nota-credito'
  | 'mis-notas-credito'
  | 'notas-debito'
  | 'nueva-nota-debito'
  | 'mis-notas-debito'
  | 'retenciones'
  | 'guias-remision'
  | 'nueva-guia-remision'
  | 'mis-guias-remision'
  | 'compras'
  | 'nueva-liquidacion-compra'
  | 'mis-liquidaciones-compra'
  | 'cuentas-cobrar'
  | 'estado-cuenta'
  | 'recargas'
  | 'comprar-documentos'
  | 'reportes'
  | 'reporte-documentos'
  | 'configuracion'
  | 'soporte'
  | 'bot'
  | 'tutoriales'
  | 'centro-normativo'
  | 'no-autorizado';
type ClienteFormMode = 'create' | 'edit' | null;
type ProductoFormMode = 'create' | 'edit' | null;
type CategoriaFormMode = 'create' | 'edit' | null;
type CategoriaCatalogTab = 'categorias' | 'subcategorias';
type EmisorFormMode = 'create' | 'edit' | null;
type PuntoFormMode = 'create' | 'edit' | null;
type OperationalFormMode = 'create' | 'edit' | null;
type ClienteFormState = {
  tipoCliente: number;
  tipoidentificacion: number;
  nombres: string;
  apellidos: string;
  nombrecomercial: string;
  nombrerazonsocial: string;
  numeroidentificacion: string;
  correo: string;
  correosAdicionales: string[];
  tipoContactoTelefonico: 'CELULAR' | 'CONVENCIONAL';
  telefonoconvencional: string;
  celular: string;
  direccion: string;
  oblgconta: 'SI' | 'NO';
  diasCredito: string;
  estado: boolean;
  pais: number | null;
  provincia: number | null;
  ciudad: number | null;
  observaciones: string;
  esProveedor: boolean;
  cuentaContableProveedor: string;
  creditoTributarioProveedor: string;
  codigoProveedor: string;
  esSujetoRetencionProveedor: boolean;
};
type MessageState = {
  type: 'success' | 'error' | 'info';
  text: string;
} | null;
type OperationalFormState = {
  codigo: string;
  descripcion: string;
  valor: string;
  observacion: string;
};
type NuevaFacturaLinea = {
  producto: FacturaProducto;
  cantidad: string;
  precio: string;
  descuento: string;
  tarifa: string;
};
type NuevaFacturaFormState = {
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
type NotaCreditoFormState = NuevaFacturaFormState & {
  facturaBusqueda: string;
  motivo: string;
  observacion: string;
};
type NotaDebitoLinea = {
  descripcion: string;
  precio: string;
  tarifa: string;
  impuestoIce: string;
  valorIce: string;
};
type NotaDebitoFormState = NuevaFacturaFormState & {
  facturaBusqueda: string;
};
type LiquidacionCompraFormState = NuevaFacturaFormState & {
  diasCredito: string;
};
type GuiaRemisionDetalle = {
  producto: FacturaProducto;
  cantidad: string;
};
type GuiaRemisionFormState = NuevaFacturaFormState & {
  transportistaBusqueda: string;
  clienteBusquedaGuia: string;
  facturaBusqueda: string;
  placa: string;
  contribuyenteEspecial: string;
  transportistaObligadoContabilidad: boolean;
  fechaEmision: string;
  fechaInicioTraslado: string;
  fechaFinTraslado: string;
  direccionOrigen: string;
};

type ProductoFormState = {
  tipo: ProductoTipo;
  nombre: string;
  codigo: string;
  precioBase: string;
  precios: string[];
  iva: boolean;
  tarifa: number | null;
  categoria: number | null;
  subcategoria: number | null;
  estado: boolean;
};

type CategoriaFormState = {
  descripcion: string;
  estado: boolean;
};

type SubcategoriaFormState = {
  descripcion: string;
  idCategoria: number | null;
  estado: boolean;
};

type EmisorFormState = {
  razonSocial: string;
  ruc: string;
  nomComercial: string;
  dirEstablecimiento: string;
  direccionMatriz: string;
  telefono: string;
  email: string;
  llevaContabilidad: 'SI' | 'NO';
  logoImagen: string;
  pathCertificado: string;
  firmaArchivoUri: string;
  firmaArchivoNombre: string;
  firmaArchivoMimeType: string;
  claveCertificado: string;
  eliminarClaveCertificado: boolean;
  estado: boolean;
  codEstablecimiento: string;
  codPuntoEmision: string;
  retenciones: string;
  claveInterna: string;
};

type PerfilFormState = {
  nombres: string;
  apellidos: string;
  nombreEmpresa: string;
  email: string;
  avatarUrl: string;
  avatarUploadUri: string;
  avatarUploadName: string;
  avatarUploadMimeType: string;
  identificacion: string;
  tipoCliente: number;
  idTipoIdentificacion: number | null;
  direccionEmpresa: string;
  celular: string;
  nuevaPassword: string;
  confirmarPassword: string;
  cambiarClave: boolean;
};

type PuntoFormState = {
  puntoEmision: string;
};

const NUMERICA_URL = 'https://numericasoftware.com/';
const EFACT_PUBLIC_URL = 'https://efact.numericasoftware.com';
const AVATAR_BASE_URL = 'https://efact.numericasoftware.com/images/Avatars';
const LAUNCH_DURATION_MS = 1600;
const BIOMETRIC_CREDENTIALS_KEY = 'efact.biometric.credentials';

type BiometricCredentials = { username: string; password: string };

async function readBiometricCredentials() {
  const value = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
  if (!value) return null;
  try { return JSON.parse(value) as BiometricCredentials; } catch { return null; }
}

async function getBiometricLabel() {
  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  if (!hasHardware || !isEnrolled) return null;
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (Platform.OS === 'ios' && types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
  if (Platform.OS === 'android' && types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Huella digital';
  if (Platform.OS === 'ios') return 'Face ID';
  if (Platform.OS === 'android') return 'Huella digital';
  return 'Biometría';
}
const SUPER_ADMIN_TIPO_USUARIO = 2;
const BASE_EFACT_MOBILE_MENUS: DynamicMenu[] = [
  { id: -1001, nombre: 'Inicio', ruta: '/dashboard', icono: 'ri-dashboard-line', orden: 1, estado: true },
  { id: -1002, nombre: 'Mi Perfil', ruta: '/perfil', icono: 'ri-user-settings-line', orden: 2, estado: true },
  { id: -1003, nombre: 'Emisor', ruta: '/emisor', icono: 'ri-building-line', orden: 3, estado: true },
  { id: -1004, nombre: 'Firma', ruta: '/firma', icono: 'ri-shield-check-line', orden: 4, estado: true },
  { id: -1025, nombre: 'E-Rúbrica', ruta: '/e-rubrica', icono: 'ri-draft-line', orden: 4, estado: true },
  { id: -1005, nombre: 'Pto. Emision', ruta: '/mi-caja', icono: 'ri-store-2-line', orden: 5, estado: true },
  { id: -1006, nombre: 'Clientes / Proveedores', ruta: '/clientes', icono: 'ri-group-line', orden: 6, estado: true },
  { id: -1007, nombre: 'Productos', ruta: '/productos', icono: 'ri-shopping-bag-line', orden: 7, estado: true },
  { id: -1008, nombre: 'Categorias', ruta: '/categorias', icono: 'ri-grid-line', orden: 8, estado: true },
  { id: -1009, nombre: 'Facturacion', ruta: '/facturacion', icono: 'ri-file-text-line', orden: 9, estado: true },
  { id: -1010, nombre: 'Notas de credito', ruta: '/notas-credito', icono: 'ri-refund-line', orden: 10, estado: true },
  { id: -1011, nombre: 'Notas de debito', ruta: '/notas-debito', icono: 'ri-bill-line', orden: 11, estado: true },
  { id: -1012, nombre: 'Retenciones', ruta: '/retenciones', icono: 'ri-bank-line', orden: 12, estado: true },
  { id: -1013, nombre: 'Guias de remision', ruta: '/guias-remision', icono: 'ri-truck-line', orden: 13, estado: true },
  { id: -1014, nombre: 'Cuentas por cobrar', ruta: '/cuentas-cobrar', icono: 'ri-money-dollar-circle-line', orden: 14, estado: true },
  { id: -1015, nombre: 'Estado de cuenta', ruta: '/estado-cuenta', icono: 'ri-file-chart-line', orden: 15, estado: true },
  { id: -1016, nombre: 'Comprar documentos', ruta: '/comprar-documentos', icono: 'ri-file-add-line', orden: 16, estado: true },
  { id: -1017, nombre: 'Reporte documentos', ruta: '/reporte-documentos', icono: 'ri-file-list-3-line', orden: 17, estado: true },
  { id: -1018, nombre: 'Historial de recargas', ruta: '/recargas', icono: 'ri-history-line', orden: 18, estado: true },
  { id: -1019, nombre: 'Centro normativo', ruta: '/centro-normativo', icono: 'ri-book-open-line', orden: 19, estado: true },
  { id: -1020, nombre: 'Configuracion', ruta: '/configuracion', icono: 'ri-settings-3-line', orden: 20, estado: true },
  { id: -1021, nombre: 'Soporte', ruta: '/soporte', icono: 'ri-customer-service-2-line', orden: 21, estado: true },
  { id: -1024, nombre: 'Númi Bot', ruta: '/bot', icono: 'ri-robot-line', orden: 22, estado: true },
  { id: -1022, nombre: 'Tutoriales', ruta: '/tutoriales', icono: 'ri-graduation-cap-line', orden: 22, estado: true },
  { id: -1023, nombre: 'Liquidacion de Compra', ruta: '/compras', icono: 'ri-file-add-line', orden: 23, estado: true },
];
const ADMIN_EFACT_MOBILE_MENUS: DynamicMenu[] = [
  { id: -1101, nombre: 'Cajas y secuencias', ruta: '/administracion/cajas-secuencias', icono: 'ri-stack-line', orden: 101, estado: true },
  { id: -1102, nombre: 'Roles y Permisos', ruta: '/configuracion/seguridad', icono: 'ri-user-shield-line', orden: 102, estado: true },
  { id: -1103, nombre: 'Impuestos', ruta: '/configuracion/impuestos', icono: 'ri-percent-line', orden: 103, estado: true },
  { id: -1104, nombre: 'Usuarios', ruta: '/configuracion/usuarios', icono: 'ri-user-line', orden: 104, estado: true },
  { id: -1105, nombre: 'Identificaciones', ruta: '/configuracion/identificaciones', icono: 'ri-id-card-line', orden: 105, estado: true },
  { id: -1106, nombre: 'Formas de Pago', ruta: '/configuracion/general', icono: 'ri-bank-card-line', orden: 106, estado: true },
  { id: -1107, nombre: 'Logs de Inicio', ruta: '/reportes/logs', icono: 'ri-file-list-line', orden: 107, estado: true },
  { id: -1108, nombre: 'Retenciones', ruta: '/configuracion/retenciones', icono: 'ri-bank-line', orden: 108, estado: true },
  { id: -1109, nombre: 'SQL Auditoria', ruta: '/reportes/auditoria-sql', icono: 'ri-shield-check-line', orden: 109, estado: true },
];
const SUPER_ADMIN_SERVICE_CATALOG: ServiceAccess[] = [
  { codigo: 'e-fact', nombre: 'E-FACT', ruta: '/dashboard', estado: true, habilitado: true },
  { codigo: 'e-conta', nombre: 'E-CONTAX', ruta: '/e-contax', estado: true, habilitado: true },
  { codigo: 'e-declara', nombre: 'E-DECLARA', ruta: '/e-declara', estado: true, habilitado: true },
  { codigo: 'e-rubrica', nombre: 'E-RÚBRICA', ruta: '/e-rubrica', estado: true, habilitado: true },
  { codigo: 'backoffice', nombre: 'BACKOFFICE', ruta: '/backoffice', estado: true, habilitado: true },
];
const AVATARS = [
  'Bandera-Argentina.png',
  'Bandera-Bolivia.png',
  'Bandera-Brazil.png',
  'Bandera-Chile.png',
  'Bandera-Colombia.png',
  'Bandera-Ecuador.png',
  'Bandera-Paraguay.png',
  'Bandera-Peru.png',
  'Bandera-Uruguay.png',
  'Bandera-Venezuela.png',
  'avatar-soccer-ball.png',
  'avatar1.png',
  'avatar2.png',
  'avatar3.png',
  'avatar4.png',
  'avatar5.png',
  'avatar6.png',
  'avatar7.png',
  'avatar8.png',
  'avatar9.png',
  'avatar10.png',
  'avatar11.png',
  'numi-efact.jpg',
];
const AVATAR_CATEGORIES = ['Todos', 'Países', 'Personajes', 'Especiales'] as const;
type AvatarCategory = typeof AVATAR_CATEGORIES[number];

function getAvatarCategory(avatar: string): AvatarCategory {
  if (avatar.startsWith('Bandera-')) return 'Países';
  if (avatar === 'avatar-soccer-ball.png') return 'Especiales';
  if (avatar.startsWith('avatar')) return 'Personajes';
  return 'Especiales';
}
const LOCAL_AVATAR_SOURCES: Record<string, ImageSourcePropType> = {
  'numi-efact.jpg': require('./assets/numi-efact.jpg'),
};

function avatarUrl(fileName: string) {
  return `${AVATAR_BASE_URL}/${fileName}`;
}

function avatarImageSource(fileName: string): ImageSourcePropType {
  return LOCAL_AVATAR_SOURCES[fileName] ?? { uri: avatarUrl(fileName) };
}

function resolveImageUrl(value?: string | null) {
  const source = value?.trim();
  if (!source) return avatarUrl('Avatar-Boy.jpg');
  if (/^https?:\/\//i.test(source) || source.startsWith('data:image/')) return source;
  const normalized = source.replace(/\\/g, '/').replace(/^~?\//, '');
  if (normalized.toLowerCase().startsWith('images/avatars/')) {
    return `${EFACT_PUBLIC_URL}/${normalized}`;
  }
  return `${API_BASE_URL.replace(/\/$/, '')}/${normalized.replace(/^\//, '')}`;
}

function avatarPath(fileName: string) {
  return `images/Avatars/${fileName}`;
}

function getInitials(nombres?: string | null, apellidos?: string | null, razonSocial?: string | null) {
  const first = nombres?.trim().split(/\s+/)[0]?.charAt(0) ?? razonSocial?.trim().split(/\s+/)[0]?.charAt(0) ?? '';
  const last = apellidos?.trim().split(/\s+/)[0]?.charAt(0) ?? razonSocial?.trim().split(/\s+/)[1]?.charAt(0) ?? '';
  return `${first}${last}`.toUpperCase() || '?';
}

function getInitialsColor(initials: string) {
  const colors = ['#6C63FF', '#006BB5', '#2C3E50', '#E67E22', '#27AE60', '#9B59B6', '#E74C3C', '#1ABC9C', '#34495E', '#2980B9'];
  const hash = initials.split('').reduce((total, letter) => total + letter.charCodeAt(0), 0);
  return colors[Math.abs(hash) % colors.length];
}

function initialsAvatarDataUri(nombres?: string | null, apellidos?: string | null, razonSocial?: string | null) {
  const initials = getInitials(nombres, apellidos, razonSocial);
  const bgColor = getInitialsColor(initials);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='${bgColor}'/><text x='50%' y='55%' font-family='Arial, sans-serif' font-size='40' font-weight='bold' fill='#ffffff' text-anchor='middle' dominant-baseline='middle'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function isInitialsAvatar(value?: string | null) {
  const source = value?.trim().toLowerCase() ?? '';
  return !source || source.includes('avatar_initials_') || source.startsWith('data:image/svg+xml');
}

function isPersonalPhoto(value?: string | null) {
  const source = value?.trim().toLowerCase() ?? '';
  return source.includes('images/avatars/uploads/') && !source.includes('avatar_initials_');
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const initialRegisterForm: RegisterRequest = {
  nombres: '',
  apellidos: '',
  razonSocial: '',
  email: '',
  direccion: '',
  celular: '',
  tipoDocumento: 'CEDULA',
  identificacion: '',
  password: '',
  avatarUrl: '',
  tipoCliente: 1,
};

const initialChangeForm: ChangePasswordRequest = {
  idUsuario: 0,
  claveActual: '',
  nuevaClave: '',
  confirmarClave: '',
};

const initialClienteForm: ClienteFormState = {
  tipoCliente: 0,
  tipoidentificacion: 2,
  nombres: '',
  apellidos: '',
  nombrecomercial: '',
  nombrerazonsocial: '',
  numeroidentificacion: '',
  correo: '',
  correosAdicionales: [],
  tipoContactoTelefonico: 'CELULAR',
  telefonoconvencional: '',
  celular: '',
  direccion: '',
  oblgconta: 'NO',
  diasCredito: '',
  estado: true,
  pais: 1,
  provincia: null,
  ciudad: null,
  observaciones: '',
  esProveedor: false,
  cuentaContableProveedor: '21311 - Proveedores',
  creditoTributarioProveedor: '01',
  codigoProveedor: '',
  esSujetoRetencionProveedor: false,
};

const initialProductoForm: ProductoFormState = {
  tipo: 'PRODUCTO',
  nombre: '',
  codigo: '',
  precioBase: '',
  precios: [''],
  iva: false,
  tarifa: null,
  categoria: null,
  subcategoria: null,
  estado: true,
};

const FALLBACK_TARIFAS_IVA = [
  { idTarifa: 0, descripcion: '0% (0%)' },
  { idTarifa: 13, descripcion: '13% (13%)' },
  { idTarifa: 15, descripcion: '15% (15%)' },
  { idTarifa: 5, descripcion: '5% (5%)' },
  { idTarifa: 8, descripcion: '8% (8%)' },
];

const initialCategoriaForm: CategoriaFormState = {
  descripcion: '',
  estado: true,
};

const initialSubcategoriaForm: SubcategoriaFormState = {
  descripcion: '',
  idCategoria: null,
  estado: true,
};

const initialEmisorForm: EmisorFormState = {
  razonSocial: '',
  ruc: '',
  nomComercial: '',
  dirEstablecimiento: '',
  direccionMatriz: '',
  telefono: '',
  email: '',
  llevaContabilidad: 'NO',
  logoImagen: '',
  pathCertificado: '',
  firmaArchivoUri: '',
  firmaArchivoNombre: '',
  firmaArchivoMimeType: '',
  claveCertificado: '',
  eliminarClaveCertificado: false,
  estado: true,
  codEstablecimiento: '',
  codPuntoEmision: '',
  retenciones: 'NO',
  claveInterna: '',
};
const initialOperationalForm: OperationalFormState = {
  codigo: '',
  descripcion: '',
  valor: '',
  observacion: '',
};
const initialNuevaFacturaForm: NuevaFacturaFormState = {
  clienteBusqueda: '',
  productoBusqueda: '',
  serie: '',
  numeroFactura: '',
  formaPago: '',
  tipoIdentificacion: '',
  tipoCliente: '',
  obligadoContabilidad: '',
  direccion: '',
  telefono: '',
  correoPrincipal: '',
  referencia: '',
  correoAdicional: '',
  detalleLinea: '',
};
const initialNotaCreditoForm: NotaCreditoFormState = {
  ...initialNuevaFacturaForm,
  facturaBusqueda: '',
  motivo: 'Anular operaciones',
  observacion: '',
};
const initialNotaDebitoForm: NotaDebitoFormState = {
  ...initialNuevaFacturaForm,
  facturaBusqueda: '',
};
const initialNotaDebitoLinea: NotaDebitoLinea = {
  descripcion: 'Motivo de la nota de debito',
  precio: '0',
  tarifa: '15',
  impuestoIce: '',
  valorIce: '0',
};
const initialLiquidacionCompraForm: LiquidacionCompraFormState = {
  ...initialNuevaFacturaForm,
  diasCredito: '0',
};
const todayInputValue = new Date().toISOString().slice(0, 10);
const initialGuiaRemisionForm: GuiaRemisionFormState = {
  ...initialNuevaFacturaForm,
  transportistaBusqueda: '',
  clienteBusquedaGuia: '',
  facturaBusqueda: '',
  placa: '',
  contribuyenteEspecial: '',
  transportistaObligadoContabilidad: false,
  fechaEmision: todayInputValue,
  fechaInicioTraslado: todayInputValue,
  fechaFinTraslado: todayInputValue,
  direccionOrigen: '',
};

const initialPerfilForm: PerfilFormState = {
  nombres: '',
  apellidos: '',
  nombreEmpresa: '',
  email: '',
  avatarUrl: '',
  avatarUploadUri: '',
  avatarUploadName: '',
  avatarUploadMimeType: '',
  identificacion: '',
  tipoCliente: 0,
  idTipoIdentificacion: null,
  direccionEmpresa: '',
  celular: '',
  nuevaPassword: '',
  confirmarPassword: '',
  cambiarClave: false,
};

const initialPuntoForm: PuntoFormState = {
  puntoEmision: '',
};

type MobileModule = {
  view: WorkspaceView;
  title: string;
  description: string;
  count?: number;
  enabled: boolean;
};
type DrawerMenuNode = {
  key: string;
  label: string;
  view?: WorkspaceView;
  count?: number;
  disabled?: boolean;
  children?: DrawerMenuNode[];
};

const EFACT_MODULES: Omit<MobileModule, 'count' | 'enabled'>[] = [
  { view: 'perfil', title: 'Perfil', description: 'Datos de usuario, avatar y preferencias.' },
  { view: 'emisor', title: 'Emisor', description: 'Datos fiscales del emisor.' },
  { view: 'firma', title: 'Firma / certificado', description: 'Certificado digital para emitir documentos.' },
  { view: 'e-rubrica', title: 'E-Rúbrica', description: 'Solicitudes, documentos y validación de firmas electrónicas.' },
  { view: 'punto-emision', title: 'Punto de emision / caja', description: 'Caja, establecimiento y secuenciales.' },
  { view: 'clientes', title: 'Clientes', description: 'Clientes, proveedores y contactos comerciales.' },
  { view: 'productos', title: 'Productos', description: 'Catalogo de productos y servicios.' },
  { view: 'categorias', title: 'Categorias', description: 'Categorias y subcategorias del catalogo comercial.' },
  { view: 'facturacion', title: 'Facturacion', description: 'Facturas, secuenciales, PDF, correo y autorizacion.' },
  { view: 'nueva-factura', title: 'Nueva Factura', description: 'Emision de facturas desde el movil.' },
  { view: 'mis-facturas', title: 'Mis Facturas', description: 'Consulta, PDF, XML, correo y anulacion.' },
  { view: 'nueva-nota-credito', title: 'Nueva Nota de Credito', description: 'Emision de notas de credito desde factura modificada.' },
  { view: 'mis-notas-credito', title: 'Mis Notas de Credito', description: 'Consulta, PDF, XML y correo de notas de credito.' },
  { view: 'nueva-nota-debito', title: 'Nueva Nota de Debito', description: 'Emision de notas de debito desde factura modificada.' },
  { view: 'mis-notas-debito', title: 'Mis Notas de Debito', description: 'Consulta, PDF, XML y correo de notas de debito.' },
  { view: 'retenciones', title: 'Retenciones', description: 'Configuracion, generadas, PDF y correo.' },
  { view: 'nueva-guia-remision', title: 'Nueva Guia de Remision', description: 'Emision de guias de remision desde factura o manual.' },
  { view: 'mis-guias-remision', title: 'Mis Guias de Remision', description: 'Consulta, PDF, XML y correo de guias.' },
  { view: 'nueva-liquidacion-compra', title: 'Nueva Liquidacion de Compra', description: 'Emision de liquidaciones de compra a proveedores.' },
  { view: 'mis-liquidaciones-compra', title: 'Mis Liquidaciones de Compra', description: 'Consulta, PDF, XML y correo de liquidaciones.' },
  { view: 'cuentas-cobrar', title: 'Cuentas por cobrar', description: 'Facturas pendientes y registro de abonos.' },
  { view: 'estado-cuenta', title: 'Estado de cuenta', description: 'Saldos, movimientos y resumen por cliente.' },
  { view: 'comprar-documentos', title: 'Comprar documentos', description: 'Compra paquetes y revisa el saldo disponible.' },
  { view: 'reporte-documentos', title: 'Reporte documentos', description: 'Documentos emitidos, recibidos y autorizaciones.' },
  { view: 'recargas', title: 'Historial de recargas', description: 'Recargas y paquetes de documentos.' },
  { view: 'centro-normativo', title: 'Centro normativo', description: 'Identificaciones, categorias, impuestos y normativa.' },
  { view: 'configuracion', title: 'Configuracion', description: 'Usuarios, roles, permisos, impuestos y parametros.' },
  { view: 'soporte', title: 'Soporte', description: 'Canales de ayuda para e-fact.' },
  { view: 'bot', title: 'Númi Bot', description: 'Asistente de e-fact para resolver tus dudas.' },
  { view: 'tutoriales', title: 'Tutoriales', description: 'Guias de uso disponibles para el usuario.' },
  { view: 'admin-cajas-secuencias', title: 'Cajas y secuencias', description: 'Consulta puntos de emision y ultimos secuenciales.' },
  { view: 'admin-roles-permisos', title: 'Roles y Permisos', description: 'Panel de seguridad, perfiles y permisos.' },
  { view: 'admin-impuestos', title: 'Impuestos', description: 'Codigos de impuesto y porcentajes IVA.' },
  { view: 'admin-usuarios', title: 'Usuarios', description: 'Control de usuarios, roles y seguridad operativa.' },
  { view: 'admin-identificaciones', title: 'Identificaciones', description: 'Catalogo de tipos de identificacion.' },
  { view: 'admin-formas-pago', title: 'Formas de Pago', description: 'Formas de pago y tipos de documento.' },
  { view: 'admin-logs-inicio', title: 'Logs de Inicio', description: 'Historial de accesos y eventos fallidos.' },
  { view: 'admin-retenciones', title: 'Retenciones', description: 'Catalogos fiscales de retenciones IVA, ISD y renta.' },
  { view: 'admin-sql-auditoria', title: 'SQL Auditoria', description: 'Eventos de auditoria SQL y trazabilidad.' },
];

const VIEW_ROUTE_ALIASES: Record<Exclude<WorkspaceView, 'portal' | 'dashboard' | 'no-autorizado' | 'nuevo-cliente' | 'nuevo-producto'>, string[]> = {
  perfil: ['perfil', 'profile'],
  emisor: ['emisor', 'empresa'],
  firma: ['firma', 'certificado'],
  'e-rubrica': ['e-rubrica', 'erubrica', 'e-sign', 'firma electronica', 'documentos firmados'],
  'punto-emision': ['punto-emision', 'puntos-emision', 'caja', 'secuencial'],
  'admin-cajas-secuencias': ['cajas-secuencias', 'cajas-y-secuencias', 'caja', 'secuencial'],
  'admin-roles-permisos': ['roles-permisos', 'roles-y-permisos', 'seguridad', 'permisos'],
  'admin-impuestos': ['configuracion-impuestos', 'impuestos', 'porcentajes-iva', 'codigos-impuesto'],
  'admin-usuarios': ['configuracion-usuarios', 'usuarios', 'usuario'],
  'admin-identificaciones': ['identificaciones', 'tipo-identificacion'],
  'admin-formas-pago': ['configuracion-general', 'formas-pago', 'formas-de-pago', 'tipo-documento', 'tipos-documento', 'general'],
  'admin-logs-inicio': ['reportes-logs', 'logs-inicio', 'logs-de-inicio', 'log-inicio'],
  'admin-retenciones': ['configuracion-retenciones', 'retenciones', 'retencion'],
  'admin-sql-auditoria': ['reportes-auditoria-sql', 'auditoria-sql', 'sql-auditoria', 'auditoria'],
  clientes: ['clientes', 'cliente'],
  proveedores: ['proveedores', 'proveedor'],
  productos: ['productos', 'producto', 'servicios'],
  categorias: ['categorias', 'categoria', 'subcategorias', 'subcategoria'],
  facturacion: ['facturacion', 'factura', 'facturas'],
  'nueva-factura': ['facturacion/nueva', 'nueva-factura', 'facturacion', 'factura'],
  'mis-facturas': ['facturas', 'mis-facturas', 'facturacion'],
  'notas-credito': ['nota-credito', 'notas-credito', 'credito'],
  'nueva-nota-credito': ['facturacion/nota-credito', 'nota-credito', 'nueva-nota-credito', 'credito'],
  'mis-notas-credito': ['facturacion/notas-credito-generadas', 'notas-credito-generadas', 'mis-notas-credito', 'notas-credito', 'credito'],
  'notas-debito': ['nota-debito', 'notas-debito', 'debito'],
  'nueva-nota-debito': ['facturacion/nota-debito', 'nota-debito', 'nueva-nota-debito', 'debito'],
  'mis-notas-debito': ['facturacion/notas-debito-generadas', 'notas-debito-generadas', 'mis-notas-debito', 'notas-debito', 'debito'],
  retenciones: ['retenciones', 'retencion'],
  'guias-remision': ['guia-remision', 'guias-remision', 'remision'],
  'nueva-guia-remision': ['facturacion/guia-remision', 'guia-remision', 'nueva-guia-remision', 'remision'],
  'mis-guias-remision': ['facturacion/guias-remision-generadas', 'guias-remision-generadas', 'mis-guias-remision', 'guias-remision'],
  compras: ['compras', 'compra', 'liquidacion'],
  'nueva-liquidacion-compra': ['compras/nueva-liquidacion', 'nueva-liquidacion', 'liquidacion-compra', 'liquidacion-de-compra'],
  'mis-liquidaciones-compra': ['compras/liquidaciones-generadas', 'liquidaciones-generadas', 'mis-liquidaciones', 'liquidaciones-compra'],
  'cuentas-cobrar': ['cuentas-cobrar', 'cuentas-por-cobrar', 'cobrar', 'cxc', 'abonos', 'registro-abonos'],
  'estado-cuenta': ['estado-cuenta', 'cuentas-por-cobrar/estado-cuenta', 'cuenta-cliente'],
  'comprar-documentos': ['compra-documentos', 'comprar-documentos', 'documentos-compra'],
  'reporte-documentos': ['reporte-documentos', 'reportes-documentos', 'reportes/documentos'],
  recargas: ['recargas', 'historial-recargas'],
  reportes: ['reportes', 'logs', 'auditoria'],
  configuracion: ['configuracion', 'usuarios', 'roles', 'permisos', 'impuestos'],
  soporte: ['soporte', 'ayuda'],
  bot: ['bot', 'numi', 'asistente', 'chat'],
  tutoriales: ['tutoriales', 'tutorial'],
  'centro-normativo': ['centro-normativo', 'normativo', 'identificaciones', 'categorias'],
};

const ADMIN_ROUTE_VIEW_MAP: Record<string, WorkspaceView> = {
  'administracion-cajas-secuencias': 'admin-cajas-secuencias',
  'configuracion-seguridad': 'admin-roles-permisos',
  'configuracion-impuestos': 'admin-impuestos',
  'configuracion-usuarios': 'admin-usuarios',
  'configuracion-identificaciones': 'admin-identificaciones',
  'configuracion-general': 'admin-formas-pago',
  'reportes-logs': 'admin-logs-inicio',
  'configuracion-retenciones': 'admin-retenciones',
  'reportes-auditoria-sql': 'admin-sql-auditoria',
};

function getClaimNumber(user: LoginResponse, key: 'idTipoUsuario' | 'tipoCliente' | 'idUsuario' | 'idJefe') {
  const claims = user.claims;
  const upperKey = key.charAt(0).toUpperCase() + key.slice(1);
  const value = (user[key] ?? claims?.[key] ?? claims?.[upperKey as keyof typeof claims]) as unknown;
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getClaimBoolean(user: LoginResponse, key: 'estadoAsociado') {
  const claims = user.claims;
  const value = user[key] ?? claims?.[key] ?? claims?.EstadoAsociado;
  return typeof value === 'boolean' ? value : undefined;
}

function isSuperAdmin(user: LoginResponse) {
  return getClaimNumber(user, 'idTipoUsuario') === SUPER_ADMIN_TIPO_USUARIO;
}

function flattenMenus(menus: DynamicMenu[]): DynamicMenu[] {
  return menus.flatMap((menu) => {
    const children = menu.hijos ?? menu.children ?? [];
    return [menu, ...flattenMenus(children)];
  });
}

function isMenuEnabled(menu: DynamicMenu) {
  return menu.estado !== false && menu.habilitado !== false;
}

function normalizeText(value?: string | null) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
}

function getServiceDisplayName(service: Pick<ServiceAccess, 'codigo' | 'nombre'>) {
  const rawName = service.nombre ?? service.codigo ?? 'Servicio';
  const normalized = normalizeText(`${service.codigo ?? ''} ${service.nombre ?? ''}`);
  if (normalized.includes('e-sign') || normalized.includes('e-sing') || normalized.includes('e-rubrica')) {
    return 'E-RÚBRICA';
  }

  return rawName.toLocaleUpperCase('es-EC');
}

function isERubricaService(service: Pick<ServiceAccess, 'codigo' | 'nombre' | 'ruta'>) {
  const source = normalizeText(`${service.codigo ?? ''} ${service.nombre ?? ''} ${service.ruta ?? ''}`);
  return source.includes('e-rubrica') || source.includes('erubrica') || source.includes('e-sign') || source.includes('rubrica');
}

function getPortalServiceVisual(title: string, index: number) {
  const normalized = normalizeText(title);
  if (normalized.includes('fact')) return { kind: 'document', accent: EFACT_THEME.colors.primary, surface: EFACT_THEME.colors.primary };
  if (normalized.includes('cont')) return { kind: 'calculator', accent: EFACT_THEME.colors.secondary, surface: EFACT_THEME.colors.secondary };
  if (normalized.includes('declara')) return { kind: 'document', accent: EFACT_THEME.colors.info, surface: EFACT_THEME.colors.info };
  if (normalized.includes('rubrica') || normalized.includes('sign')) return { kind: 'pencil', accent: ERUBRICA_COLORS.primary, surface: ERUBRICA_COLORS.primary };
  if (normalized.includes('back')) return { kind: 'briefcase', accent: EFACT_THEME.colors.primaryDark, surface: EFACT_THEME.colors.primaryDark };

  const palette = [
    { kind: 'document', accent: EFACT_THEME.colors.primary, surface: EFACT_THEME.colors.primary },
    { kind: 'calculator', accent: EFACT_THEME.colors.secondary, surface: EFACT_THEME.colors.secondary },
    { kind: 'briefcase', accent: EFACT_THEME.colors.primaryDark, surface: EFACT_THEME.colors.primaryDark },
  ];
  return palette[index % palette.length];
}

function getNotificationTone(notification: NotificacionItem) {
  const source = normalizeText(`${notification.type ?? ''} ${notification.title} ${notification.text}`);
  if (source.includes('error') || source.includes('rechaz') || source.includes('anulad') || source.includes('fall') || source.includes('vencid')) return 'danger';
  if (source.includes('advert') || source.includes('pendient') || source.includes('proces') || source.includes('revision') || source.includes('alert')) return 'warning';
  if (source.includes('exito') || source.includes('correct') || source.includes('autoriz') || source.includes('aprob') || source.includes('emitid')) return 'success';
  return 'info';
}

function getDisplayFirstName(user: LoginResponse, perfil?: PerfilUsuario | null) {
  const value = perfil?.nombres || user.nombres || user.email || 'Usuario';
  return value.split(' ')[0].toLocaleUpperCase('es-EC');
}

function getProfileAvatarUrl(user: LoginResponse, perfil?: PerfilUsuario | null) {
  return perfil?.avatarUrl || user.avatarUrl || null;
}

function formatDashboardMoney(value?: number | null) {
  return `$${Math.round(Number(value ?? 0)).toLocaleString('es-EC')}`;
}

function escapeCsvCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

async function exportRowsToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    Alert.alert('Exportar Excel', 'No hay registros para exportar.');
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(',')),
  ].join('\n');
  const uri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}${filename.replace(/[^a-z0-9._-]/gi, '-')}.csv`;
  await FileSystem.writeAsStringAsync(uri, csv);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { dialogTitle: 'Exportar Excel', mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
    return;
  }

  Alert.alert('Exportar Excel', `Archivo generado: ${uri}`);
}

function menuMatchesView(menu: DynamicMenu, view: Exclude<WorkspaceView, 'portal' | 'dashboard' | 'no-autorizado' | 'nuevo-cliente' | 'nuevo-producto'>) {
  const normalizedRoute = normalizeText(menu.ruta);
  if (ADMIN_ROUTE_VIEW_MAP[normalizedRoute] === view) return true;

  const source = `${normalizedRoute} ${normalizeText(menu.nombre)} ${normalizeText(menu.descripcion)}`;
  return VIEW_ROUTE_ALIASES[view].some((alias) => source.includes(alias));
}

function getAuthorizedViews(menus: DynamicMenu[]) {
  const activeMenus = flattenMenus(menus).filter(isMenuEnabled);
  const views = new Set<WorkspaceView>();

  EFACT_MODULES.forEach((module) => {
    if (activeMenus.some((menu) => menuMatchesView(menu, module.view as Exclude<WorkspaceView, 'portal' | 'dashboard' | 'no-autorizado' | 'nuevo-cliente' | 'nuevo-producto'>))) {
      views.add(module.view);
    }
  });

  if (activeMenus.some((menu) => menuMatchesView(menu, 'compras'))) {
    views.add('compras');
    views.add('nueva-liquidacion-compra');
    views.add('mis-liquidaciones-compra');
  }

  if (activeMenus.some((menu) => menuMatchesView(menu, 'guias-remision'))) {
    views.add('nueva-guia-remision');
    views.add('mis-guias-remision');
  }

  if (activeMenus.some((menu) => menuMatchesView(menu, 'notas-credito'))) {
    views.add('nueva-nota-credito');
    views.add('mis-notas-credito');
  }

  if (activeMenus.some((menu) => menuMatchesView(menu, 'notas-debito'))) {
    views.add('nueva-nota-debito');
    views.add('mis-notas-debito');
  }

  if (views.size > 0) {
    views.add('dashboard');
    views.add('bot');
    views.add('cuentas-cobrar');
    views.add('estado-cuenta');
  }

  return views;
}

function getLoginMenus(user: LoginResponse) {
  return user.menus ?? user.menuItems ?? [];
}

function hasAdminMenu(menus: DynamicMenu[]) {
  return flattenMenus(menus).some((menu) => {
    const route = normalizeText(menu.ruta);
    const source = `${route} ${normalizeText(menu.nombre)} ${normalizeText(menu.descripcion)}`;
    return route.startsWith('administracion') || route.startsWith('configuracion') || source.includes('administracion');
  });
}

function mergeMobileBaseMenus(menus: DynamicMenu[], includeAdmin = false) {
  const visibleMenus = menus.filter((menu) => !isAdministrationMenu(menu));
  const existingRoutes = new Set(visibleMenus.map((menu) => normalizeText(menu.ruta || menu.nombre)));
  const baseMenus = BASE_EFACT_MOBILE_MENUS;
  const missingBaseMenus = baseMenus.filter((menu) => !existingRoutes.has(normalizeText(menu.ruta || menu.nombre)));

  return [...visibleMenus, ...missingBaseMenus];
}

function isAdministrationMenu(menu: DynamicMenu) {
  const route = normalizeText(menu.ruta);
  const name = normalizeText(menu.nombre);
  return route.startsWith('administracion') ||
    route.startsWith('configuracion/seguridad') ||
    route.startsWith('configuracion/impuestos') ||
    route.startsWith('configuracion/usuarios') ||
    route.startsWith('configuracion/identificaciones') ||
    route.startsWith('configuracion/general') ||
    route.startsWith('configuracion/retenciones') ||
    route.startsWith('reportes/logs') ||
    route.startsWith('reportes/auditoria-sql') ||
    name.includes('roles') ||
    name.includes('sql auditoria');
}

function getInitialMenus(user: LoginResponse) {
  const loginMenus = getLoginMenus(user);

  if (loginMenus.length > 0) {
    return loginMenus;
  }

  return getClaimNumber(user, 'idUsuario') ? mergeMobileBaseMenus([], isSuperAdmin(user)) : [];
}

function getServicesFromUser(user: LoginResponse, menus: DynamicMenu[]) {
  const explicit = user.servicios ?? [];
  const fromMenus: ServiceAccess[] = flattenMenus(menus)
    .filter((menu) => menu.codigoServicio || menu.servicio)
    .map((menu) => ({
      codigo: menu.codigoServicio ?? menu.servicio ?? undefined,
      nombre: menu.servicio ?? menu.codigoServicio ?? menu.nombre,
      ruta: menu.ruta,
      estado: menu.estado,
      habilitado: menu.habilitado,
    }));

  const fallbackServices = isSuperAdmin(user) && explicit.length === 0 && fromMenus.length === 0 ? SUPER_ADMIN_SERVICE_CATALOG : [];

  return [...explicit, ...fromMenus, ...fallbackServices].filter((service) => service.estado !== false && service.habilitado !== false);
}

function getLoginToken(response: LoginResponse) {
  return findTokenValue(response);
}

function findTokenValue(value: unknown, depth = 0): string | null {
  if (!value || typeof value !== 'object' || depth > 3) return null;

  const record = value as Record<string, unknown>;
  const tokenKey = Object.keys(record).find((key) => {
    const normalized = key.toLowerCase();
    return ['token', 'accesstoken', 'jwttoken', 'jwt', 'bearertoken'].includes(normalized);
  });

  if (tokenKey && typeof record[tokenKey] === 'string' && record[tokenKey].trim()) {
    return record[tokenKey].trim();
  }

  for (const child of Object.values(record)) {
    const token = findTokenValue(child, depth + 1);
    if (token) return token;
  }

  return null;
}

function clienteToForm(cliente: Cliente): ClienteFormState {
  return {
    tipoCliente: cliente.tipoCliente ?? 0,
    tipoidentificacion: cliente.tipoidentificacion ?? 2,
    nombres: cliente.nombres ?? '',
    apellidos: cliente.apellidos ?? '',
    nombrecomercial: cliente.nombrecomercial ?? '',
    nombrerazonsocial: cliente.nombrerazonsocial ?? '',
    numeroidentificacion: cliente.numeroidentificacion ?? '',
    correo: cliente.correo ?? '',
    correosAdicionales: cliente.correosAdicionales ?? [],
    tipoContactoTelefonico: cliente.telefonoconvencional && !cliente.celular ? 'CONVENCIONAL' : 'CELULAR',
    telefonoconvencional: cliente.telefonoconvencional ?? '',
    celular: cliente.celular ?? '',
    direccion: cliente.direccion ?? '',
    oblgconta: cliente.oblgconta === 'SI' ? 'SI' : 'NO',
    diasCredito: typeof cliente.diasCredito === 'number' ? String(cliente.diasCredito) : '',
    estado: cliente.estado !== false,
    pais: cliente.pais ?? null,
    provincia: cliente.provincia ?? null,
    ciudad: cliente.ciudad ?? null,
    observaciones: cliente.observaciones ?? '',
    esProveedor: cliente.esProveedor ?? false,
    cuentaContableProveedor: cliente.cuentaContableProveedor ?? '21311 - Proveedores',
    creditoTributarioProveedor: cliente.creditoTributarioProveedor ?? '01',
    codigoProveedor: cliente.codigoProveedor ?? '',
    esSujetoRetencionProveedor: cliente.esSujetoRetencionProveedor ?? false,
  };
}

function clienteFormToPayload(form: ClienteFormState) {
  const isEmpresa = form.tipoCliente === 2;
  const diasCredito = form.diasCredito.trim() ? Number(form.diasCredito.trim()) : null;
  const usaConvencional = form.tipoContactoTelefonico === 'CONVENCIONAL';

  return {
    apellidos: isEmpresa ? '' : form.apellidos.trim(),
    nombres: isEmpresa ? '' : form.nombres.trim(),
    nombrecomercial: isEmpresa ? form.nombrecomercial.trim() : '',
    nombrerazonsocial: isEmpresa ? form.nombrerazonsocial.trim() : '',
    numeroidentificacion: form.numeroidentificacion.trim(),
    direccion: form.direccion.trim(),
    telefonoconvencional: usaConvencional ? form.telefonoconvencional.trim() : '',
    celular: usaConvencional ? '' : form.celular.trim(),
    correo: form.correo.trim().toLowerCase(),
    diasCredito: Number.isFinite(diasCredito) ? diasCredito : null,
    correosAdicionales: form.correosAdicionales.map((correo) => correo.trim().toLowerCase()).filter(Boolean),
    oblgconta: form.oblgconta,
    tipoCliente: form.tipoCliente,
    estado: form.estado,
    pais: form.pais,
    provincia: form.provincia,
    ciudad: form.ciudad,
    observaciones: form.observaciones.trim(),
    tipoidentificacion: form.tipoidentificacion,
    esProveedor: form.esProveedor,
    cuentaContableProveedor: form.esProveedor ? form.cuentaContableProveedor.trim() || '21311 - Proveedores' : null,
    creditoTributarioProveedor: form.esProveedor ? form.creditoTributarioProveedor.trim() || '01' : null,
    codigoProveedor: form.esProveedor ? form.codigoProveedor.trim() : null,
    esSujetoRetencionProveedor: form.esProveedor ? form.esSujetoRetencionProveedor : false,
  };
}

function productoToForm(producto: Producto): ProductoFormState {
  const precios = producto.precios?.length ? producto.precios.map((precio) => String(precio)) : [String(producto.precioBase ?? '')];

  return {
    tipo: producto.tipo,
    nombre: producto.nombre ?? '',
    codigo: producto.codigo ?? '',
    precioBase: precios[0] ?? '',
    precios,
    iva: producto.iva === true,
    tarifa: producto.tarifa ?? null,
    categoria: producto.categoria ?? null,
    subcategoria: producto.subcategoria ?? null,
    estado: producto.estado !== false,
  };
}

function productoFormToPayload(form: ProductoFormState) {
  const precios = form.precios
    .map((precio) => Number(precio.replace(',', '.')))
    .filter((precio) => Number.isFinite(precio));
  const precioBase = precios[0] ?? Number(form.precioBase.replace(',', '.'));

  return {
    tipo: form.tipo,
    nombre: form.nombre.trim(),
    codigo: form.codigo.trim() || null,
    precioBase,
    precios,
    preciosAdicionales: precios.slice(1),
    iva: form.iva,
    tarifa: form.tarifa,
    categoria: form.categoria,
    subcategoria: form.subcategoria,
    estado: form.estado,
    Codigo: 0,
    Nombre: form.nombre.trim(),
    CodigoPrincipal: form.codigo.trim() || null,
    ValorUnitario: precioBase,
    Precio2: precios[1] ?? null,
    Precio3: precios[2] ?? null,
    TipoCompravena: form.tipo,
    TipoProducto: form.categoria,
    Idsubtipo: form.subcategoria,
    Codigoimpuesto: form.iva ? '2' : null,
    Porcentajeimpuesto: form.iva && form.tarifa !== null ? String(form.tarifa) : null,
    Estado: form.estado,
  };
}

function categoriaToForm(categoria: CategoriaCatalogo): CategoriaFormState {
  return {
    descripcion: categoria.descripcion ?? '',
    estado: categoria.estado !== false,
  };
}

function subcategoriaToForm(subcategoria: SubcategoriaCatalogo): SubcategoriaFormState {
  return {
    descripcion: subcategoria.descripcion ?? '',
    idCategoria: subcategoria.idCategoria ?? null,
    estado: subcategoria.estado !== false,
  };
}

function emisorToForm(emisor: Emisor): EmisorFormState {
  return {
    razonSocial: emisor.razonSocial ?? '',
    ruc: emisor.ruc ?? '',
    nomComercial: emisor.nomComercial ?? '',
    dirEstablecimiento: emisor.dirEstablecimiento ?? '',
    direccionMatriz: emisor.direccionMatriz ?? '',
    telefono: emisor.telefono ?? '',
    email: emisor.email ?? '',
    llevaContabilidad: emisor.llevaContabilidad === 'SI' ? 'SI' : 'NO',
    logoImagen: emisor.logoImagen ?? '',
    pathCertificado: emisor.pathCertificado ?? '',
    firmaArchivoUri: '',
    firmaArchivoNombre: getFirmaFileName(emisor.pathCertificado) ?? '',
    firmaArchivoMimeType: '',
    claveCertificado: '',
    eliminarClaveCertificado: false,
    estado: emisor.estado !== false,
    codEstablecimiento: emisor.codEstablecimiento ?? '',
    codPuntoEmision: emisor.codPuntoEmision ?? '',
    retenciones: emisor.retenciones ?? 'NO',
    claveInterna: emisor.claveInterna ?? '',
  };
}

function emisorFormToPayload(form: EmisorFormState, base?: Emisor | null) {
  return {
    codigo: base?.codigo ?? 0,
    razonSocial: form.razonSocial.trim(),
    ruc: form.ruc.replace(/\D/g, ''),
    nomComercial: form.nomComercial.trim(),
    dirEstablecimiento: form.dirEstablecimiento.trim(),
    email: form.email.trim().toLowerCase() || null,
    llevaContabilidad: form.llevaContabilidad,
    logoImagen: form.logoImagen.trim() || null,
    direccionMatriz: form.direccionMatriz.trim(),
    claveInterna: form.claveInterna.trim() || null,
    retenciones: form.retenciones.trim() || 'NO',
    pathCertificado: form.pathCertificado.trim() || null,
    claveCertificado: form.claveCertificado.trim() || null,
    eliminarClaveCertificado: form.eliminarClaveCertificado,
    telefono: form.telefono.trim(),
    estado: form.estado,
    idUsuario: base?.idUsuario ?? null,
    codEstablecimiento: form.codEstablecimiento.trim() || base?.codEstablecimiento || null,
    codPuntoEmision: form.codPuntoEmision.trim() || base?.codPuntoEmision || null,
  };
}

function getFirmaFileName(path?: string | null) {
  if (!path?.trim()) return null;
  const parts = path.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || path;
}

function hasFirmaConfigured(emisor: Emisor) {
  return Boolean(emisor.pathCertificado?.trim() && emisor.tieneClaveCertificadoConfigurada);
}

function operationalItemToForm(item: OperationalMobileItem): OperationalFormState {
  return {
    codigo: item.id ?? '',
    descripcion: item.title ?? '',
    valor: item.meta ?? '',
    observacion: item.detail ?? '',
  };
}

function operationalFormToPayload(form: OperationalFormState) {
  return {
    codigo: form.codigo.trim() || null,
    descripcion: form.descripcion.trim(),
    valor: form.valor.trim() || null,
    observacion: form.observacion.trim() || null,
  };
}

function operationalFormToPayloadForContext(module: OperationalModule, tab: string, form: OperationalFormState) {
  const codigo = Number(form.codigo.trim());
  const valor = Number(form.valor.replace(',', '.'));

  if (module === 'cuentas-cobrar' && tab === 'Abonos') {
    return {
      idCliente: Number.isFinite(codigo) ? codigo : 0,
      montoRecibido: Number.isFinite(valor) ? valor : 0,
      observacion: form.observacion.trim() || form.descripcion.trim(),
    };
  }

  if (module === 'recargas' && tab === 'Comprar documentos') {
    return {
      documentos: Number.isFinite(codigo) ? codigo : 0,
      montoTotal: Number.isFinite(valor) ? valor : 0,
      descripcion: form.descripcion.trim() || 'Recarga personalizada',
      emailDestino: form.observacion.trim() || null,
      esIlimitado: form.descripcion.toLowerCase().includes('ilimit'),
    };
  }

  return operationalFormToPayload(form);
}

function getTipoClienteLabel(tipoCliente?: number | null, lookups?: ClienteLookups | null) {
  if (tipoCliente === 1) return 'Persona Natural';
  if (tipoCliente === 2) return 'Persona Juridica';

  const fromLookup = lookups?.tipos.find((tipo) => tipo.tclCodigo === tipoCliente)?.descripcion;
  if (fromLookup?.trim()) return fromLookup.trim();

  return 'Sin tipo';
}

function perfilToForm(perfil?: PerfilUsuario | null): PerfilFormState {
  return {
    nombres: perfil?.nombres ?? '',
    apellidos: perfil?.apellidos ?? '',
    nombreEmpresa: perfil?.nombreEmpresa ?? '',
    email: perfil?.email ?? '',
    avatarUrl: perfil?.avatarUrl ?? '',
    avatarUploadUri: '',
    avatarUploadName: '',
    avatarUploadMimeType: '',
    identificacion: perfil?.identificacion ?? '',
    tipoCliente: perfil?.tipoCliente ?? 0,
    idTipoIdentificacion: perfil?.idTipoIdentificacion ?? null,
    direccionEmpresa: perfil?.direccionEmpresa ?? '',
    celular: perfil?.celular ?? '',
    nuevaPassword: '',
    confirmarPassword: '',
    cambiarClave: false,
  };
}

function perfilFormToPayload(form: PerfilFormState, current?: PerfilUsuario | null) {
  return {
    idUsuario: current?.idUsuario ?? 0,
    nombres: form.nombres.trim(),
    apellidos: form.apellidos.trim(),
    nombreEmpresa: form.nombreEmpresa.trim() || null,
    email: form.email.trim(),
    avatarUrl: form.avatarUrl || current?.avatarUrl || null,
    identificacion: form.identificacion.trim(),
    tipoCliente: form.tipoCliente,
    idTipoIdentificacion: form.idTipoIdentificacion,
    direccionEmpresa: form.direccionEmpresa.trim(),
    celular: form.celular.trim(),
    nuevaPassword: form.cambiarClave ? form.nuevaPassword.trim() || null : null,
    confirmarPassword: form.cambiarClave ? form.confirmarPassword.trim() || null : null,
  };
}

function puntoToForm(punto?: PuntoEmision | null): PuntoFormState {
  return {
    puntoEmision: normalizeSerieCode(punto?.puntoEmision ?? ''),
  };
}

function normalizeSerieCode(value?: string | number | null) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? digits.padStart(3, '0').slice(-3) : '';
}

function getPuntoSerie(punto: PuntoEmision) {
  if (punto.establecimiento && punto.puntoEmision) return `${normalizeSerieCode(punto.establecimiento)}-${normalizeSerieCode(punto.puntoEmision)}`;
  const serie = punto.serieFactura ?? punto.serieNotasCred ?? punto.serieGuia ?? '';
  if (serie.includes('-')) return serie;
  return normalizeSerieCode(punto.puntoEmision ?? punto.numCaja);
}

function getNextPuntoCode(cajas: PuntoEmision[]) {
  const used = cajas
    .map((caja) => Number(normalizeSerieCode(caja.puntoEmision ?? caja.numCaja)))
    .filter((value) => Number.isFinite(value) && value > 0);
  const next = used.length ? Math.max(...used) + 1 : 1;
  return normalizeSerieCode(next);
}

function isConsumidorFinal(cliente: Cliente) {
  const identificacion = (cliente.numeroidentificacion ?? '').trim();
  if (identificacion === '9999999999999') return true;

  const nombres = (cliente.nombres ?? '').trim().toLowerCase();
  const apellidos = (cliente.apellidos ?? '').trim().toLowerCase();
  const correo = (cliente.correo ?? '').trim().toLowerCase();

  return nombres === 'consumidor' && apellidos === 'final' && correo === 'consumidorfinal@numerica';
}

export default function App() {
  return <SafeAreaProvider><AppContent /></SafeAreaProvider>;
}

function AppContent() {
  const [booting, setBooting] = useState(true);
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null);
  const [registerStep, setRegisterStep] = useState(0);
  const [avatarGalleryOpen, setAvatarGalleryOpen] = useState(false);
  const [avatarCategory, setAvatarCategory] = useState<AvatarCategory>('Todos');
  const [biometricLabel, setBiometricLabel] = useState<string | null>(null);
  const [biometricCredentials, setBiometricCredentials] = useState<BiometricCredentials | null>(null);
  const [biometricPendingLogin, setBiometricPendingLogin] = useState<{ response: LoginResponse; credentials: BiometricCredentials } | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'biometric' | 'guest'>('password');

  const [registerForm, setRegisterForm] = useState<RegisterRequest>(initialRegisterForm);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [changeForm, setChangeForm] = useState<ChangePasswordRequest>(initialChangeForm);

  useEffect(() => {
    let mounted = true;
    const minSplash = delay(LAUNCH_DURATION_MS);

    const authCheck = checkAuth()
      .then((response) => {
        if (!mounted || !response.authenticated) return;
        setSessionToken(getLoginToken(response));
        setCurrentUser(response);
      })
      .catch(() => undefined);

    Promise.all([minSplash, authCheck]).finally(() => {
        if (mounted) setBooting(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.all([getBiometricLabel(), readBiometricCredentials()]).then(([label, credentials]) => {
      if (!mounted) return;
      setBiometricLabel(label);
      setBiometricCredentials(credentials);
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  const runRequest = async (action: () => Promise<void>) => {
    if (loading) return;

    setLoading(true);
    setMessage(null);

    try {
      await action();
    } catch (error) {
      const text =
        error instanceof ApiError ? error.message : 'No se pudo completar la solicitud. Intenta nuevamente.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  const submitLogin = () =>
    runRequest(async () => {
      const validation = validateLogin(username, password);
      if (!validation.valid) {
        setMessage({ type: 'error', text: validation.message ?? '' });
        return;
      }

      setAuthenticating(true);

      try {
        const response = await login({ username, password, recordarme });
        setSessionToken(getLoginToken(response));
        await delay(350);

        if (response.requierePoliticas) {
          setMessage({ type: 'info', text: 'Debes aceptar las politicas de privacidad antes de continuar.' });
          return;
        }

        if (response.requiereCambioClave && response.idUsuario) {
          setChangeForm((current) => ({ ...current, idUsuario: response.idUsuario ?? 0 }));
          setMode('change');
          setMessage({ type: 'info', text: 'Ingresa el codigo de acceso o clave temporal para crear una nueva clave.' });
          return;
        }

        if (biometricLabel && !biometricCredentials) {
          setBiometricPendingLogin({ response, credentials: { username, password } });
        } else if (recordarme && biometricLabel) {
          await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify({ username, password }));
          setBiometricCredentials({ username, password });
        } else if (!recordarme) {
          await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
          setBiometricCredentials(null);
        }

        if (biometricLabel && !biometricCredentials) return;
        setCurrentUser(response);
      } finally {
        setAuthenticating(false);
      }
    });

  const submitBiometricLogin = () =>
    runRequest(async () => {
      if (!biometricCredentials || !biometricLabel) return;
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Acceder a e-fact con ${biometricLabel}`,
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });
      if (!result.success) return;
      setAuthenticating(true);
      try {
        const response = await login({ ...biometricCredentials, recordarme: true });
        setSessionToken(getLoginToken(response));
        setCurrentUser(response);
      } finally {
        setAuthenticating(false);
      }
    });

  const submitRegister = () =>
    runRequest(async () => {
      const validation = validateRegisterForm(registerForm);
      if (!validation.valid) {
        setMessage({ type: 'error', text: validation.message ?? '' });
        return;
      }

      const response = await register({
        ...registerForm,
        avatarUrl: registerForm.avatarUrl || initialsAvatarDataUri(registerForm.nombres, registerForm.apellidos, registerForm.razonSocial),
      });
      setMessage({ type: 'success', text: response.message ?? 'Cuenta creada correctamente.' });
      setRegisterStep(0);
      setMode('login');
    });

  const submitRecover = () =>
    runRequest(async () => {
      const validation = validateEmail(recoverEmail);
      if (!validation.valid) {
        setMessage({ type: 'error', text: validation.message ?? '' });
        return;
      }

      const response = await recoverPassword({ email: recoverEmail });
      if (response.idUsuario) {
        setChangeForm((current) => ({ ...current, idUsuario: response.idUsuario ?? 0 }));
        setMode('change');
      }

      setMessage({
        type: 'success',
        text: response.message ?? 'Se envio un mensaje a tu correo para recuperar tu clave.',
      });
    });

  const submitChangePassword = () =>
    runRequest(async () => {
      const validation = validateChangePassword(changeForm);
      if (!validation.valid) {
        setMessage({ type: 'error', text: validation.message ?? '' });
        return;
      }

      const response = await changePassword(changeForm);
      setMessage({ type: 'success', text: response.message ?? 'Clave actualizada correctamente.' });
      setChangeForm(initialChangeForm);
      setMode('login');
    });

  const updateRegister = <K extends keyof RegisterRequest>(key: K, value: RegisterRequest[K]) => {
    setRegisterForm((current) => ({ ...current, [key]: value }));
  };

  const selectRegisterAvatar = (value: string, label: string) => {
    updateRegister('avatarUrl', value);
    setAvatarGalleryOpen(false);
    Alert.alert('Avatar seleccionado', `${label} quedó aplicado a tu cuenta.`);
  };

  const continueRegister = () => {
    const validation = registerStep === 0
      ? validateRegisterForm({ ...registerForm, email: 'paso@efact.local', direccion: 'Direccion temporal', password: 'Aa1!aaaa' })
      : registerStep === 1
        ? validateRegisterForm({ ...registerForm, password: 'Aa1!aaaa' })
        : validateRegisterForm(registerForm);

    if (registerStep === 1 && (!registerForm.email.trim() || !registerForm.direccion.trim() || registerForm.direccion.trim().length < 5)) {
      setMessage({ type: 'error', text: 'Completa un correo y una direccion valida para continuar.' });
      return;
    }
    if (!validation.valid && registerStep < 2) {
      setMessage({ type: 'error', text: validation.message ?? 'Revisa los datos de este paso.' });
      return;
    }
    setMessage(null);
    setRegisterStep((step) => Math.min(step + 1, 2));
  };

  const updateChange = <K extends keyof ChangePasswordRequest>(key: K, value: ChangePasswordRequest[K]) => {
    setChangeForm((current) => ({ ...current, [key]: value }));
  };

  const selectedAvatar = registerForm.avatarUrl.split('/').pop() || '';
  const registerInitials = getInitials(registerForm.nombres, registerForm.apellidos, registerForm.razonSocial);
  const visibleAvatars = avatarCategory === 'Todos' ? AVATARS : AVATARS.filter((avatar) => getAvatarCategory(avatar) === avatarCategory);

  const continueAfterBiometricOffer = async (enable: boolean) => {
    if (!biometricPendingLogin) return;
    if (enable) {
      await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(biometricPendingLogin.credentials));
      setBiometricCredentials(biometricPendingLogin.credentials);
    }
    setCurrentUser(biometricPendingLogin.response);
    setBiometricPendingLogin(null);
  };

  if (booting) {
    return <AppLaunchScreen />;
  }

  if (authenticating) {
    return <LoadingScreen />;
  }

  if (currentUser) {
    return (
      <BusinessHome
        currentUser={currentUser}
        onLogout={() => {
          setSessionToken(null);
          setCurrentUser(null);
          setPassword('');
          setMessage(null);
          setMode('login');
        }}
      />
    );
  }

  return (
    <>
      <ScreenFrame centered={mode !== 'register'}>
        <AuthCard key={mode} wide={mode === 'register'} login={mode === 'login'}>
        {mode === 'login' ? (
          <>
            <View style={styles.loginBrand}>
              <BrandMark />
              <View>
                <Text style={styles.loginProductName}>e-fact</Text>
                <Text style={styles.loginProductCaption}>facturación electrónica</Text>
              </View>
            </View>
            <Text style={[styles.title, styles.loginTitle]}>Bienvenido</Text>
            <Text style={[styles.subtitle, styles.loginSubtitle]}>Ingresa para continuar con tu gestión</Text>
            <LoginActionTiles
              active={loginMethod}
              biometricLabel={biometricLabel}
              onPassword={() => setLoginMethod('password')}
              onBiometric={() => {
                setLoginMethod('biometric');
                if (biometricCredentials && biometricLabel) submitBiometricLogin();
                else setMessage({ type: 'info', text: 'Activa el acceso biométrico después de iniciar sesión por primera vez.' });
              }}
              onGuest={() => {
                setLoginMethod('guest');
                setMessage({ type: 'info', text: 'Modo invitado pendiente.' });
              }}
            />
            {message ? <MessageBox message={message} /> : null}
            {loginMethod === 'password' ? <View style={styles.form}>
              <Field label="Usuario / Correo" value={username} onChangeText={setUsername} autoCapitalize="none" />
              <Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
              <View style={styles.rowBetween}>
                <Pressable style={styles.checkRow} onPress={() => setRecordarme((value) => !value)}>
                  <View style={[styles.checkbox, recordarme && styles.checkboxChecked]}>
                    {recordarme ? <Text style={styles.checkboxTick}>✓</Text> : null}
                  </View>
                  <Text style={styles.rememberText}>Recordarme</Text>
                </Pressable>
                <TextLink label="Olvidaste tu clave?" onPress={() => setMode('forgot')} />
              </View>
              <PrimaryButton label="Ingresar ahora" loading={loading} onPress={submitLogin} />
            </View> : null}
            <InlineSwitch muted="No tienes cuenta?" action="Solicitar Registro" onPress={() => setMode('register')} />
          </>
        ) : null}

        {mode === 'register' ? (
          <>
            <BrandMark />
            <Text style={styles.title}>Crear tu cuenta</Text>
            <Text style={styles.subtitle}>Te guiaremos paso a paso para dejar tu cuenta lista.</Text>
            {message ? <MessageBox message={message} /> : null}

            <View style={styles.registerProgress}>
              <View style={styles.stepper}>
              {['Datos', 'Contacto', 'Perfil'].map((step, index) => (
                <View key={step} style={styles.stepItem}>
                  <View style={[styles.stepDot, index <= registerStep && styles.stepDotActive]}>
                    <Text style={[styles.stepDotText, index <= registerStep && styles.stepDotTextActive]}>{index < registerStep ? '✓' : index + 1}</Text>
                  </View>
                  <Text style={[styles.stepLabel, index === registerStep && styles.stepLabelActive]}>{step}</Text>
                </View>
              ))}
              </View>
              <View style={styles.stepProgressTrack}>
                <View style={[styles.stepProgressFill, { width: `${(registerStep / 2) * 100}%` }]} />
              </View>
              <Text style={styles.stepProgressCaption}>Paso {registerStep + 1} de 3</Text>
            </View>

            {registerStep === 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>¿Cómo vas a usar e-fact?</Text>
                <Text style={styles.sectionHint}>Elige el tipo de cuenta que mejor describe tu negocio.</Text>
                <View style={styles.segment}>
                  <SegmentButton active={registerForm.tipoCliente === 1} icon="account-outline" label="Persona Natural" description="Para una persona" onPress={() => updateRegister('tipoCliente', 1)} />
                  <SegmentButton active={registerForm.tipoCliente === 2} icon="domain" label="Empresa" description="Para un negocio" onPress={() => updateRegister('tipoCliente', 2)} />
                </View>
                <Text style={styles.fieldGroupHint}>Selecciona un documento de identificación</Text>
                <View style={styles.documentOptions}>
                  <View style={styles.documentOptionRow}>
                    {([['CEDULA', 'Cédula ecuatoriana', 'card-account-details-outline'], ['RUC', 'Registro tributario', 'file-document-outline']] as [TipoDocumento, string, React.ComponentProps<typeof MaterialCommunityIcons>['name']][]).map(([tipo, description, icon]) => (
                      <SegmentButton
                        key={tipo}
                        active={registerForm.tipoDocumento === tipo}
                        label={tipo}
                        description={description}
                        icon={icon}
                        onPress={() =>
                          setRegisterForm((current) => ({
                            ...current,
                            tipoDocumento: tipo,
                            identificacion: sanitizeIdentificacion(tipo, current.identificacion),
                          }))
                        }
                      />
                    ))}
                  </View>
                  <View style={styles.documentOptionRow}>
                    <SegmentButton
                      active={registerForm.tipoDocumento === 'PASAPORTE'}
                      label="Identificación del exterior"
                      description="Para documentos extranjeros"
                      icon="passport"
                      onPress={() =>
                        setRegisterForm((current) => ({
                          ...current,
                          tipoDocumento: 'PASAPORTE',
                          identificacion: sanitizeIdentificacion('PASAPORTE', current.identificacion),
                        }))
                      }
                    />
                  </View>
                </View>
                {registerForm.tipoCliente === 2 ? (
                  <Field label="Razon social" value={registerForm.razonSocial} onChangeText={(value) => updateRegister('razonSocial', value)} />
                ) : (
                  <>
                    <Field label="Nombres" value={registerForm.nombres} onChangeText={(value) => updateRegister('nombres', value)} />
                    <Field label="Apellidos" value={registerForm.apellidos} onChangeText={(value) => updateRegister('apellidos', value)} />
                  </>
                )}
                <Field
                  label="Identificacion"
                  value={registerForm.identificacion}
                  onChangeText={(value) => updateRegister('identificacion', sanitizeIdentificacion(registerForm.tipoDocumento, value))}
                  autoCapitalize="characters"
                />
              </View>
            ) : null}

            {registerStep === 1 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>¿Cómo te contactamos?</Text>
                <Text style={styles.sectionHint}>Usaremos estos datos para avisarte sobre tus documentos y cuenta.</Text>
                <Field label="Celular" value={registerForm.celular} onChangeText={(value) => updateRegister('celular', value)} keyboardType="phone-pad" />
                <Field label="Email" value={registerForm.email} onChangeText={(value) => updateRegister('email', value)} autoCapitalize="none" keyboardType="email-address" />
                <Field label="Direccion" value={registerForm.direccion} onChangeText={(value) => updateRegister('direccion', value)} />
              </View>
            ) : null}

            {registerStep === 2 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Protege y personaliza tu cuenta</Text>
                <Text style={styles.sectionHint}>Crea una contraseña segura y elige cómo quieres identificarte.</Text>
                <View style={styles.registerReviewCard}>
                  <Text style={styles.registerReviewTitle}>Revisa tu información</Text>
                  <Text style={styles.registerReviewValue}>{registerForm.tipoCliente === 2 ? registerForm.razonSocial : `${registerForm.nombres} ${registerForm.apellidos}`}</Text>
                  <Text style={styles.registerReviewMeta}>{registerForm.email} · {registerForm.identificacion}</Text>
                </View>
                <Field label="Contraseña segura" value={registerForm.password} onChangeText={(value) => updateRegister('password', value)} secureTextEntry />
                <Text style={styles.passwordHint}>Mínimo 8 caracteres: mayúscula, minúscula, número y símbolo.</Text>
                <Pressable accessibilityLabel="Abrir galería de avatares" style={styles.avatarPreview} onPress={() => setAvatarGalleryOpen(true)}>
                  {isInitialsAvatar(registerForm.avatarUrl) ? (
                    <InitialsAvatar initials={registerInitials} size={56} />
                  ) : (
                    <Image source={avatarImageSource(selectedAvatar)} style={styles.avatarTileImage} />
                  )}
                  <View style={styles.avatarInfo}>
                    <Text style={styles.avatarTitle}>{isInitialsAvatar(registerForm.avatarUrl) ? 'Iniciales del nombre' : 'Avatar seleccionado'}</Text>
                    <Text style={styles.mutedText}>{AVATARS.length} avatares disponibles</Text>
                    <Text style={styles.avatarTapHint}>Toca aquí para cambiarlo</Text>
                  </View>
                </Pressable>
                <Modal visible={avatarGalleryOpen} transparent animationType="slide" onRequestClose={() => setAvatarGalleryOpen(false)}>
                  <View style={styles.avatarModalOverlay}>
                    <Pressable style={styles.avatarModalBackdrop} onPress={() => setAvatarGalleryOpen(false)} />
                    <View style={styles.avatarModalCard}>
                      <View style={styles.avatarModalHeader}>
                        <View>
                          <Text style={styles.avatarModalEyebrow}>PERSONALIZA TU CUENTA</Text>
                          <Text style={styles.avatarModalTitle}>Elige tu avatar</Text>
                        </View>
                        <Pressable style={styles.avatarModalClose} onPress={() => setAvatarGalleryOpen(false)}>
                          <Text style={styles.avatarModalCloseText}>×</Text>
                        </Pressable>
                      </View>
                      <Text style={styles.avatarModalHint}>Toca una opción para seleccionarla.</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarCategoryTabs}>
                        {AVATAR_CATEGORIES.map((category) => (
                          <Pressable key={category} style={[styles.avatarCategoryTab, avatarCategory === category && styles.avatarCategoryTabActive]} onPress={() => setAvatarCategory(category)}>
                            <Text numberOfLines={1} style={[styles.avatarCategoryText, avatarCategory === category && styles.avatarCategoryTextActive]}>{category}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                      <ScrollView style={styles.avatarGalleryScroll} contentContainerStyle={styles.avatarGalleryGrid} showsVerticalScrollIndicator={false}>
                        {avatarCategory === 'Todos' || avatarCategory === 'Especiales' ? (
                          <Pressable
                            style={[styles.avatarGalleryItem, isInitialsAvatar(registerForm.avatarUrl) && styles.avatarChoiceActive]}
                            onPress={() => selectRegisterAvatar('', 'Mis iniciales')}
                          >
                            <InitialsAvatar initials={registerInitials} size={62} />
                            <Text numberOfLines={2} style={styles.avatarGalleryLabel}>Mis iniciales</Text>
                          </Pressable>
                        ) : null}
                        {visibleAvatars.map((avatar) => (
                          <Pressable
                            key={avatar}
                            style={[styles.avatarGalleryItem, selectedAvatar === avatar && styles.avatarChoiceActive]}
                            onPress={() => selectRegisterAvatar(avatarPath(avatar), avatar.replace(/[-_]/g, ' '))}
                          >
                            <Image source={avatarImageSource(avatar)} style={styles.avatarGalleryImage} />
                            <Text numberOfLines={2} style={styles.avatarGalleryLabel}>{avatar.replace(/[-_]/g, ' ')}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </Modal>
              </View>
            ) : null}

            <View style={styles.registerActions}>
              {registerStep > 0 ? <SecondaryButton label="Volver al paso anterior" onPress={() => setRegisterStep((step) => step - 1)} /> : null}
              {registerStep < 2 ? (
                <PrimaryButton label={registerStep === 0 ? 'Continuar a contacto' : 'Continuar a seguridad'} loading={false} onPress={continueRegister} />
              ) : (
                <PrimaryButton label="Crear mi cuenta" loading={loading} onPress={submitRegister} />
              )}
            </View>
            <InlineSwitch muted="Ya tienes cuenta?" action="Inicia sesion" onPress={() => setMode('login')} />
          </>
        ) : null}

        {mode === 'forgot' ? (
          <>
            <BrandLockup />
            <Text style={styles.title}>Recuperar acceso</Text>
            <Text style={styles.subtitle}>Ingresa tu correo para recibir instrucciones y volver a entrar a tu cuenta.</Text>
            {message ? <MessageBox message={message} /> : null}
            <View style={styles.recoveryInfoCard}>
              <MaterialCommunityIcons name="information-outline" size={19} color="#0072BD" />
              <Text style={styles.recoveryInfoText}>Usa el correo registrado en e-fact. Revisa también tu carpeta de spam.</Text>
            </View>
            <View style={styles.form}>
              <Field label="Correo electrónico registrado" value={recoverEmail} onChangeText={setRecoverEmail} autoCapitalize="none" keyboardType="email-address" />
              <PrimaryButton label="Enviar instrucciones" loading={loading} onPress={submitRecover} />
            </View>
            <InlineSwitch muted="¿Recordaste tu contraseña?" action="Volver al inicio de sesión" onPress={() => setMode('login')} />
          </>
        ) : null}

        {mode === 'change' ? (
          <>
            <BrandLockup />
            <Text style={styles.title}>Cambiar contraseña</Text>
            <Text style={styles.subtitle}>Actualiza tu acceso para continuar de forma segura.</Text>
            {message ? <MessageBox message={message} /> : null}
            <View style={styles.changeSecurityCard}>
              <View style={styles.changeSecurityIcon}>
                <MaterialCommunityIcons name="shield-lock-outline" size={23} color="#0072BD" />
              </View>
              <View style={styles.changeSecurityCopy}>
                <Text style={styles.changeSecurityTitle}>Protege tu cuenta</Text>
                <Text style={styles.changeSecurityText}>Usa una clave que no hayas utilizado antes y mantenla en un lugar seguro.</Text>
              </View>
            </View>
            <View style={styles.form}>
              <View style={styles.changeFieldsCard}>
                <Text style={styles.changeFieldsEyebrow}>DATOS DE ACCESO</Text>
                <Text style={styles.changeFieldsHint}>Completa los datos para definir tu nueva clave.</Text>
                <Field label="Id usuario" value={changeForm.idUsuario ? String(changeForm.idUsuario) : ''} onChangeText={(value) => updateChange('idUsuario', Number(value.replace(/\D/g, '')))} keyboardType="number-pad" />
                <Field label="Codigo o clave temporal" value={changeForm.claveActual} onChangeText={(value) => updateChange('claveActual', value)} secureTextEntry />
                <Field label="Nueva clave" value={changeForm.nuevaClave} onChangeText={(value) => updateChange('nuevaClave', value)} secureTextEntry />
                <Field label="Confirmar clave" value={changeForm.confirmarClave} onChangeText={(value) => updateChange('confirmarClave', value)} secureTextEntry />
                <Text style={styles.changePasswordHint}>Mínimo 10 caracteres: mayúscula, minúscula, número y símbolo.</Text>
              </View>
              <PrimaryButton label="Actualizar clave" loading={loading} onPress={submitChangePassword} />
            </View>
            <InlineSwitch muted="Volver a" action="Login" onPress={() => setMode('login')} />
          </>
        ) : null}
        </AuthCard>
      </ScreenFrame>
      {biometricPendingLogin && biometricLabel ? (
        <BiometricSetupModal label={biometricLabel} onChoose={continueAfterBiometricOffer} />
      ) : null}
    </>
  );
}

function BusinessHome({ currentUser, onLogout }: { currentUser: LoginResponse; onLogout: () => void }) {
  const insets = useSafeAreaInsets();
  const [activeView, setActiveView] = useState<WorkspaceView>(isSuperAdmin(currentUser) ? 'portal' : 'dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerProgress = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificacionItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsMessage, setNotificationsMessage] = useState<MessageState>(null);
  const [menus, setMenus] = useState<DynamicMenu[]>(getInitialMenus(currentUser));
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [menuMessage, setMenuMessage] = useState<MessageState>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubcategoriaCatalogo[]>([]);
  const [emisores, setEmisores] = useState<Emisor[]>([]);
  const [firmaEstados, setFirmaEstados] = useState<Record<number, FirmaEstado>>({});
  const [firmaMobileEmisores, setFirmaMobileEmisores] = useState<ERubricaEmisor[]>([]);
  const [loadingFirma, setLoadingFirma] = useState(false);
  const [erubricaData, setErubricaData] = useState<ERubricaDashboard | null>(null);
  const [loadingErubrica, setLoadingErubrica] = useState(false);
  const [erubricaInitialPdf, setErubricaInitialPdf] = useState<{ uri: string; name: string; mimeType?: string } | null>(null);
  const [perfilData, setPerfilData] = useState<PerfilLookup | null>(null);
  const [puntosData, setPuntosData] = useState<PuntosEmisionData | null>(null);
  const [clienteLookups, setClienteLookups] = useState<ClienteLookups | null>(null);
  const [productoLookups, setProductoLookups] = useState<ProductoLookups | null>(null);
  const [provincias, setProvincias] = useState<ProvinciaLookup[]>([]);
  const [ciudades, setCiudades] = useState<CiudadLookup[]>([]);
  const [subcategoriasProducto, setSubcategoriasProducto] = useState<SubcategoriaLookup[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingEmisores, setLoadingEmisores] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [loadingPuntos, setLoadingPuntos] = useState(false);
  const [loadingAdminItems, setLoadingAdminItems] = useState(false);
  const [loadingOperationalItems, setLoadingOperationalItems] = useState(false);
  const [loadingClienteLookups, setLoadingClienteLookups] = useState(false);
  const [loadingProductoLookups, setLoadingProductoLookups] = useState(false);
  const [directoryMessage, setDirectoryMessage] = useState<MessageState>(null);
  const [search, setSearch] = useState('');
  const [clienteTipoFiltro, setClienteTipoFiltro] = useState<'todos' | 'personas' | 'empresas'>('todos');
  const [clienteProveedorFiltro, setClienteProveedorFiltro] = useState<'todos' | 'proveedores'>('todos');
  const [productoTipoFiltro, setProductoTipoFiltro] = useState<'todos' | ProductoTipo>('todos');
  const [productoCategoriaFiltro, setProductoCategoriaFiltro] = useState<number | null>(null);
  const [productoSubcategoriaFiltro, setProductoSubcategoriaFiltro] = useState<number | null>(null);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [reloadKey, setReloadKey] = useState(0);
  const [adminItems, setAdminItems] = useState<AdminMobileItem[]>([]);
  const [adminTabByView, setAdminTabByView] = useState<Record<string, string>>({});
  const [operationalItems, setOperationalItems] = useState<OperationalMobileItem[]>([]);
  const [operationalCounts, setOperationalCounts] = useState<Partial<Record<WorkspaceView, number>>>({});
  const [operationalTabByView, setOperationalTabByView] = useState<Record<string, string>>({});
  const [operationalFormMode, setOperationalFormMode] = useState<OperationalFormMode>(null);
  const [selectedOperationalItem, setSelectedOperationalItem] = useState<OperationalMobileItem | null>(null);
  const [operationalForm, setOperationalForm] = useState<OperationalFormState>(initialOperationalForm);
  const [savingOperational, setSavingOperational] = useState(false);
  const [facturaPreparacion, setFacturaPreparacion] = useState<FacturaPreparacion | null>(null);
  const [facturasList, setFacturasList] = useState<FacturaListItem[]>([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);
  const [savingFactura, setSavingFactura] = useState(false);
  const [facturaForm, setFacturaForm] = useState<NuevaFacturaFormState>(initialNuevaFacturaForm);
  const [facturaCliente, setFacturaCliente] = useState<Cliente | null>(null);
  const [facturaClientes, setFacturaClientes] = useState<Cliente[]>([]);
  const [facturaProductos, setFacturaProductos] = useState<FacturaProducto[]>([]);
  const [facturaLineas, setFacturaLineas] = useState<NuevaFacturaLinea[]>([]);
  const [notaCreditoPreparacion, setNotaCreditoPreparacion] = useState<FacturaPreparacion | null>(null);
  const [notasCreditoList, setNotasCreditoList] = useState<NotaCreditoListItem[]>([]);
  const [notaCreditoFacturas, setNotaCreditoFacturas] = useState<FacturaListItem[]>([]);
  const [notaCreditoFactura, setNotaCreditoFactura] = useState<FacturaListItem | null>(null);
  const [notaCreditoCliente, setNotaCreditoCliente] = useState<Cliente | null>(null);
  const [notaCreditoForm, setNotaCreditoForm] = useState<NotaCreditoFormState>(initialNotaCreditoForm);
  const [notaCreditoLineas, setNotaCreditoLineas] = useState<NuevaFacturaLinea[]>([]);
  const [loadingNotasCredito, setLoadingNotasCredito] = useState(false);
  const [savingNotaCredito, setSavingNotaCredito] = useState(false);
  const [notaDebitoPreparacion, setNotaDebitoPreparacion] = useState<FacturaPreparacion | null>(null);
  const [notasDebitoList, setNotasDebitoList] = useState<NotaDebitoListItem[]>([]);
  const [notaDebitoFacturas, setNotaDebitoFacturas] = useState<FacturaListItem[]>([]);
  const [notaDebitoFactura, setNotaDebitoFactura] = useState<FacturaListItem | null>(null);
  const [notaDebitoCliente, setNotaDebitoCliente] = useState<Cliente | null>(null);
  const [notaDebitoForm, setNotaDebitoForm] = useState<NotaDebitoFormState>(initialNotaDebitoForm);
  const [notaDebitoLineas, setNotaDebitoLineas] = useState<NotaDebitoLinea[]>([initialNotaDebitoLinea]);
  const [loadingNotasDebito, setLoadingNotasDebito] = useState(false);
  const [savingNotaDebito, setSavingNotaDebito] = useState(false);
  const [liquidacionPreparacion, setLiquidacionPreparacion] = useState<FacturaPreparacion | null>(null);
  const [liquidacionesList, setLiquidacionesList] = useState<LiquidacionCompraListItem[]>([]);
  const [liquidacionProveedores, setLiquidacionProveedores] = useState<Cliente[]>([]);
  const [liquidacionProveedor, setLiquidacionProveedor] = useState<Cliente | null>(null);
  const [liquidacionProductos, setLiquidacionProductos] = useState<FacturaProducto[]>([]);
  const [liquidacionForm, setLiquidacionForm] = useState<LiquidacionCompraFormState>(initialLiquidacionCompraForm);
  const [liquidacionLineas, setLiquidacionLineas] = useState<NuevaFacturaLinea[]>([]);
  const [loadingLiquidaciones, setLoadingLiquidaciones] = useState(false);
  const [savingLiquidacion, setSavingLiquidacion] = useState(false);
  const [guiaPreparacion, setGuiaPreparacion] = useState<FacturaPreparacion | null>(null);
  const [guiasList, setGuiasList] = useState<GuiaRemisionListItem[]>([]);
  const [guiaTransportistas, setGuiaTransportistas] = useState<Cliente[]>([]);
  const [guiaTransportista, setGuiaTransportista] = useState<Cliente | null>(null);
  const [guiaClientes, setGuiaClientes] = useState<Cliente[]>([]);
  const [guiaCliente, setGuiaCliente] = useState<Cliente | null>(null);
  const [guiaFacturas, setGuiaFacturas] = useState<FacturaListItem[]>([]);
  const [guiaFactura, setGuiaFactura] = useState<FacturaListItem | null>(null);
  const [guiaProductos, setGuiaProductos] = useState<FacturaProducto[]>([]);
  const [guiaForm, setGuiaForm] = useState<GuiaRemisionFormState>(initialGuiaRemisionForm);
  const [guiaDetalles, setGuiaDetalles] = useState<GuiaRemisionDetalle[]>([]);
  const [loadingGuias, setLoadingGuias] = useState(false);
  const [savingGuia, setSavingGuia] = useState(false);
  const [retencionesList, setRetencionesList] = useState<RetencionListItem[]>([]);
  const [loadingRetenciones, setLoadingRetenciones] = useState(false);
  const [clienteFormMode, setClienteFormMode] = useState<ClienteFormMode>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null);
  const [viewingProducto, setViewingProducto] = useState<Producto | null>(null);
  const [viewingCategoria, setViewingCategoria] = useState<CategoriaCatalogo | null>(null);
  const [viewingSubcategoria, setViewingSubcategoria] = useState<SubcategoriaCatalogo | null>(null);
  const [viewingEmisor, setViewingEmisor] = useState<Emisor | null>(null);
  const [viewingFirma, setViewingFirma] = useState<Emisor | null>(null);
  const [clienteForm, setClienteForm] = useState<ClienteFormState>(initialClienteForm);
  const [savingCliente, setSavingCliente] = useState(false);
  const [productoFormMode, setProductoFormMode] = useState<ProductoFormMode>(null);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [productoForm, setProductoForm] = useState<ProductoFormState>(initialProductoForm);
  const [loadingProductoDetail, setLoadingProductoDetail] = useState(false);
  const [savingProducto, setSavingProducto] = useState(false);
  const [categoriaTab, setCategoriaTab] = useState<CategoriaCatalogTab>('categorias');
  const [categoriaFormMode, setCategoriaFormMode] = useState<CategoriaFormMode>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaCatalogo | null>(null);
  const [categoriaForm, setCategoriaForm] = useState<CategoriaFormState>(initialCategoriaForm);
  const [subcategoriaFormMode, setSubcategoriaFormMode] = useState<CategoriaFormMode>(null);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<SubcategoriaCatalogo | null>(null);
  const [subcategoriaForm, setSubcategoriaForm] = useState<SubcategoriaFormState>(initialSubcategoriaForm);
  const [savingCategoria, setSavingCategoria] = useState(false);
  const [emisorFormMode, setEmisorFormMode] = useState<EmisorFormMode>(null);
  const [selectedEmisor, setSelectedEmisor] = useState<Emisor | null>(null);
  const [emisorForm, setEmisorForm] = useState<EmisorFormState>(initialEmisorForm);
  const [savingEmisor, setSavingEmisor] = useState(false);
  const [perfilForm, setPerfilForm] = useState<PerfilFormState>(initialPerfilForm);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [puntoFormMode, setPuntoFormMode] = useState<PuntoFormMode>(null);
  const [selectedPunto, setSelectedPunto] = useState<PuntoEmision | null>(null);
  const [puntoForm, setPuntoForm] = useState<PuntoFormState>(initialPuntoForm);
  const [savingPunto, setSavingPunto] = useState(false);

  const userId = getClaimNumber(currentUser, 'idUsuario') ?? 0;
  const catalogUserId = getClaimNumber(currentUser, 'idJefe') ?? userId;
  const idTipoUsuario = getClaimNumber(currentUser, 'idTipoUsuario');
  const authorizedViews = useMemo(() => getAuthorizedViews(menus), [menus]);
  const canUsePortal = isSuperAdmin(currentUser);
  const canUseEfact = authorizedViews.has('dashboard');
  const services = useMemo(() => getServicesFromUser(currentUser, menus), [currentUser, menus]);
  const portalFirstName = getDisplayFirstName(currentUser, perfilData?.perfil);
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setReloadKey((value) => value + 1);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    setLoadingNotifications(true);
    setNotificationsMessage(null);

    getNotificaciones(userId)
      .then((items) => {
        if (mounted) setNotifications(items);
        void syncDeviceNotifications(userId, items);
      })
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudieron cargar las notificaciones.';
        if (mounted) {
          setNotifications([]);
          setNotificationsMessage({ type: 'info', text });
        }
      })
      .finally(() => {
        if (mounted) setLoadingNotifications(false);
      });

    return () => {
      mounted = false;
    };
  }, [reloadKey, userId]);

  useEffect(() => {
    if (!userId || !hasMenusByRolEndpoint()) return;

    let mounted = true;
    setLoadingMenus(true);
    setMenuMessage(null);

    getMenusByRol(userId, idTipoUsuario)
      .then((data) => {
        if (mounted && data.length > 0) setMenus(data);
      })
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudieron cargar los menus asignados.';
        if (mounted) setMenuMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingMenus(false);
      });

    return () => {
      mounted = false;
    };
  }, [idTipoUsuario, userId]);

  useEffect(() => {
    const module = getAdminModuleSlug(activeView);
    if (!module || !authorizedViews.has(activeView)) return;

    let mounted = true;
    const activeTab = adminTabByView[activeView] ?? getAdminModuleConfig(activeView).tabs?.[0] ?? '';
    setLoadingAdminItems(true);
    setDirectoryMessage(null);

    getAdminMobileModule(module, debouncedSearch, activeTab)
      .then((data) => {
        if (mounted) setAdminItems(data.items ?? []);
      })
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar el modulo administrativo.';
        if (mounted) {
          setAdminItems([]);
          setDirectoryMessage({ type: 'error', text });
        }
      })
      .finally(() => {
        if (mounted) setLoadingAdminItems(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeView, adminTabByView, authorizedViews, debouncedSearch, reloadKey]);

  useEffect(() => {
    const module = getOperationalModuleSlug(activeView);
    if (!module || !authorizedViews.has(activeView) || activeView === 'comprar-documentos') return;

    let mounted = true;
    const config = getOperationalScreenConfig(activeView, module);
    const activeTab = operationalTabByView[activeView] ?? getOperationalDefaultTab(activeView, module);
    setLoadingOperationalItems(true);
    setDirectoryMessage(null);

    getOperationalMobileModule(module, debouncedSearch, activeTab, { userId: catalogUserId })
      .then((data) => {
        if (mounted) setOperationalItems(data.items ?? []);
      })
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar el modulo operativo.';
        if (mounted) {
          setOperationalItems([]);
          setDirectoryMessage({ type: 'error', text });
        }
      })
      .finally(() => {
        if (mounted) setLoadingOperationalItems(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeView, operationalTabByView, authorizedViews, catalogUserId, debouncedSearch, reloadKey]);

  useEffect(() => {
    if (!catalogUserId || !authorizedViews.has(activeView)) return;
    if (activeView !== 'nueva-factura' && activeView !== 'mis-facturas') return;

    let mounted = true;
    setLoadingFacturas(true);
    setDirectoryMessage(null);

    const request = activeView === 'nueva-factura'
      ? getFacturaPreparacion(catalogUserId).then((data) => {
          if (!mounted) return;
          setFacturaPreparacion(data);
          const serie = data.series?.[0]?.serieRaw ?? data.series?.[0]?.serieVisual ?? data.caja?.serieFactura ?? '';
          const formaPago = data.formasPago?.[0]?.codigo ?? '';
          setFacturaForm((current) => ({ ...current, serie, formaPago }));
        })
      : getFacturas(catalogUserId, 0).then((data) => {
          if (mounted) setFacturasList(data ?? []);
        });

    request
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar facturacion.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingFacturas(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeView, authorizedViews, catalogUserId, reloadKey]);

  useEffect(() => {
    if (!catalogUserId || !authorizedViews.has(activeView) || activeView !== 'retenciones') return;

    let mounted = true;
    setLoadingRetenciones(true);
    setDirectoryMessage(null);

    getRetenciones(catalogUserId, 0)
      .then((data) => {
        if (mounted) setRetencionesList(data ?? []);
      })
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar retenciones.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingRetenciones(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeView, authorizedViews, catalogUserId, reloadKey]);

  useEffect(() => {
    if (!catalogUserId || !authorizedViews.has(activeView)) return;
    if (activeView !== 'nueva-guia-remision' && activeView !== 'mis-guias-remision') return;

    let mounted = true;
    setLoadingGuias(true);
    setDirectoryMessage(null);

    const request = activeView === 'nueva-guia-remision'
      ? getGuiaRemisionPreparacion(catalogUserId).then((data) => {
          if (!mounted) return;
          setGuiaPreparacion(data);
          const serie = data.series?.[0]?.serieRaw ?? data.series?.[0]?.serieVisual ?? data.caja?.serieFactura ?? '';
          setGuiaForm((current) => ({ ...current, serie }));
        })
      : getGuiasRemision(catalogUserId, 0).then((data) => {
          if (mounted) setGuiasList(data ?? []);
        });

    request
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar guias de remision.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingGuias(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeView, authorizedViews, catalogUserId, reloadKey]);

  useEffect(() => {
    if (!catalogUserId || !authorizedViews.has(activeView)) return;
    if (activeView !== 'nueva-liquidacion-compra' && activeView !== 'mis-liquidaciones-compra') return;

    let mounted = true;
    setLoadingLiquidaciones(true);
    setDirectoryMessage(null);

    const request = activeView === 'nueva-liquidacion-compra'
      ? getLiquidacionCompraPreparacion(catalogUserId).then((data) => {
          if (!mounted) return;
          setLiquidacionPreparacion(data);
          const serie = data.series?.[0]?.serieRaw ?? data.series?.[0]?.serieVisual ?? data.caja?.serieFactura ?? '';
          const formaPago = data.formasPago?.[0]?.codigo ?? '';
          setLiquidacionForm((current) => ({ ...current, serie, formaPago }));
        })
      : getLiquidacionesCompra(catalogUserId, 0).then((data) => {
          if (mounted) setLiquidacionesList(data ?? []);
        });

    request
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar liquidaciones.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingLiquidaciones(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeView, authorizedViews, catalogUserId, reloadKey]);

  useEffect(() => {
    if (!catalogUserId || !authorizedViews.has(activeView)) return;
    if (activeView !== 'nueva-nota-debito' && activeView !== 'mis-notas-debito') return;

    let mounted = true;
    setLoadingNotasDebito(true);
    setDirectoryMessage(null);

    const request = activeView === 'nueva-nota-debito'
      ? getNotaDebitoPreparacion(catalogUserId).then((data) => {
          if (!mounted) return;
          setNotaDebitoPreparacion(data);
          const serie = data.series?.[0]?.serieRaw ?? data.series?.[0]?.serieVisual ?? data.caja?.serieFactura ?? '';
          setNotaDebitoForm((current) => ({ ...current, serie }));
        })
      : getNotasDebito(catalogUserId, 0).then((data) => {
          if (mounted) setNotasDebitoList(data ?? []);
        });

    request
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar notas de debito.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingNotasDebito(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeView, authorizedViews, catalogUserId, reloadKey]);

  useEffect(() => {
    if (!catalogUserId || !authorizedViews.has(activeView)) return;
    if (activeView !== 'nueva-nota-credito' && activeView !== 'mis-notas-credito') return;

    let mounted = true;
    setLoadingNotasCredito(true);
    setDirectoryMessage(null);

    const request = activeView === 'nueva-nota-credito'
      ? getNotaCreditoPreparacion(catalogUserId).then((data) => {
          if (!mounted) return;
          setNotaCreditoPreparacion(data);
          const serie = data.series?.[0]?.serieRaw ?? data.series?.[0]?.serieVisual ?? data.caja?.serieFactura ?? '';
          setNotaCreditoForm((current) => ({ ...current, serie }));
        })
      : getNotasCredito(catalogUserId, 0).then((data) => {
          if (mounted) setNotasCreditoList(data ?? []);
        });

    request
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar notas de credito.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingNotasCredito(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeView, authorizedViews, catalogUserId, reloadKey]);

  useEffect(() => {
    if (!catalogUserId || !authorizedViews.has('dashboard')) return;

    let mounted = true;
    const views: WorkspaceView[] = ['cuentas-cobrar', 'estado-cuenta', 'comprar-documentos', 'recargas', 'reporte-documentos', 'centro-normativo'];

    Promise.all(
      views.map(async (view) => {
        const module = getOperationalModuleSlug(view);
        if (!module || !authorizedViews.has(view)) return [view, undefined] as const;

        const tab = getOperationalDefaultTab(view, module);
        try {
          const data = await getOperationalMobileModule(module, '', tab, { userId: catalogUserId });
          return [view, data.items?.length ?? 0] as const;
        } catch {
          return [view, undefined] as const;
        }
      }),
    ).then((entries) => {
      if (!mounted) return;
      setOperationalCounts(
        entries.reduce<Partial<Record<WorkspaceView, number>>>((acc, [view, count]) => {
          if (typeof count === 'number') acc[view] = count;
          return acc;
        }, {}),
      );
    });

    return () => {
      mounted = false;
    };
  }, [authorizedViews, catalogUserId, reloadKey]);

  useEffect(() => {
    if (!authorizedViews.has('e-rubrica') || activeView !== 'e-rubrica') return;

    let mounted = true;
    setLoadingErubrica(true);
    setDirectoryMessage(null);
    getERubricaDashboard()
      .then((data) => { if (mounted) setErubricaData(data); })
      .catch((error) => {
        if (mounted) setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo cargar E-Rúbrica.' });
      })
      .finally(() => { if (mounted) setLoadingErubrica(false); });

    return () => { mounted = false; };
  }, [activeView, authorizedViews, reloadKey]);

  useEffect(() => {
    if (loadingMenus) return;

    if (!canUsePortal && activeView === 'portal') setActiveView(canUseEfact ? 'dashboard' : 'no-autorizado');
    if (activeView === 'dashboard' && !canUseEfact) setActiveView('no-autorizado');
    if (
      activeView !== 'portal' &&
      activeView !== 'dashboard' &&
      activeView !== 'no-autorizado' &&
      activeView !== 'nuevo-cliente' &&
      activeView !== 'nuevo-producto' &&
      !authorizedViews.has(activeView)
    ) {
      setActiveView('no-autorizado');
    }
  }, [activeView, authorizedViews, canUseEfact, canUsePortal, loadingMenus]);

  useEffect(() => {
    if (!userId || !authorizedViews.has('clientes')) return;

    let mounted = true;
    setLoadingClientes(true);
    setDirectoryMessage(null);

    getClientes(userId)
      .then((data) => {
        if (mounted) setClientes(data);
      })
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar clientes.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingClientes(false);
      });

    return () => {
      mounted = false;
    };
  }, [authorizedViews, reloadKey, userId]);

  useEffect(() => {
    if (!authorizedViews.has('clientes') || clienteLookups) return;

    let mounted = true;
    setLoadingClienteLookups(true);

    getClienteLookups()
      .then((data) => {
        if (mounted) setClienteLookups(data);
      })
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudieron cargar los catalogos de clientes.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingClienteLookups(false);
      });

    return () => {
      mounted = false;
    };
  }, [authorizedViews, clienteLookups]);

  useEffect(() => {
    if (!catalogUserId || (!authorizedViews.has('productos') && !authorizedViews.has('categorias'))) return;

    let mounted = true;
    setLoadingProductos(true);
    setDirectoryMessage(null);

    getProductos(catalogUserId)
      .then((data) => {
        if (mounted) setProductos(data);
      })
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar productos.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingProductos(false);
      });

    return () => {
      mounted = false;
    };
  }, [authorizedViews, catalogUserId, reloadKey]);

  useEffect(() => {
    if ((!authorizedViews.has('productos') && !authorizedViews.has('categorias')) || productoLookups) return;

    let mounted = true;
    setLoadingProductoLookups(true);

    getProductoLookups(catalogUserId)
      .then((data) => {
        if (mounted) setProductoLookups(data);
      })
      .catch(() => {
        if (mounted && authorizedViews.has('categorias')) {
          setLoadingCategorias(false);
        }
      })
      .finally(() => {
        if (mounted) setLoadingProductoLookups(false);
      });

    return () => {
      mounted = false;
    };
  }, [authorizedViews, catalogUserId, productoLookups]);

  useEffect(() => {
    if (!catalogUserId || !authorizedViews.has('categorias')) return;

    if (productoLookups && (productoLookups.categorias.length > 0 || productoLookups.subcategorias.length > 0)) {
      setCategorias(
        productoLookups.categorias.map((categoria) => ({
          idCategoria: categoria.idCategoria,
          descripcion: categoria.descripcion,
          estado: true,
        })),
      );
      setSubcategorias(
        productoLookups.subcategorias.map((subcategoria) => ({
          idSubcategoria: subcategoria.idSubcategoria,
          idCategoria: subcategoria.idCategoria ?? null,
          descripcion: subcategoria.descripcion,
          estado: true,
        })),
      );
      setDirectoryMessage(null);
      setLoadingCategorias(false);
      return;
    }

    let mounted = true;
    setLoadingCategorias(true);
    setDirectoryMessage(null);

    Promise.allSettled([getCategorias(catalogUserId), getSubcategorias(catalogUserId)])
      .then(([categoriasResult, subcategoriasResult]) => {
        if (mounted) {
          const categoriasData = categoriasResult.status === 'fulfilled' ? categoriasResult.value : [];
          const subcategoriasData = subcategoriasResult.status === 'fulfilled' ? subcategoriasResult.value : [];

          setCategorias(categoriasData);
          setSubcategorias(subcategoriasData);

          const errors = [categoriasResult, subcategoriasResult]
            .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
            .map((result) => result.reason);
          const non404Error = errors.find((error) => !(error instanceof ApiError && error.status === 404));

          if (non404Error) {
            const text = non404Error instanceof ApiError ? non404Error.message : 'No se pudieron cargar categorias.';
            setDirectoryMessage({ type: 'error', text });
          }
        }
      })
      .finally(() => {
        if (mounted) setLoadingCategorias(false);
      });

    return () => {
      mounted = false;
    };
  }, [authorizedViews, catalogUserId, productoLookups, reloadKey]);

  useEffect(() => {
    if (!authorizedViews.has('categorias') || !productoLookups) return;

    if (categorias.length === 0 && productoLookups.categorias.length > 0) {
      setCategorias(
        productoLookups.categorias.map((categoria) => ({
          idCategoria: categoria.idCategoria,
          descripcion: categoria.descripcion,
          estado: true,
        })),
      );
    }

    if (subcategorias.length === 0 && productoLookups.subcategorias.length > 0) {
      setSubcategorias(
        productoLookups.subcategorias.map((subcategoria) => ({
          idSubcategoria: subcategoria.idSubcategoria,
          idCategoria: subcategoria.idCategoria ?? null,
          descripcion: subcategoria.descripcion,
          estado: true,
        })),
      );
    }
  }, [authorizedViews, categorias.length, productoLookups, subcategorias.length]);

  useEffect(() => {
    if (!authorizedViews.has('categorias') || productos.length === 0) return;

    if (categorias.length === 0) {
      const categoriasDesdeProductos = new Map<number, CategoriaCatalogo>();
      productos.forEach((producto) => {
        if (producto.categoria === null || producto.categoria === undefined) return;
        categoriasDesdeProductos.set(producto.categoria, {
          idCategoria: producto.categoria,
          descripcion: producto.categoriaDescripcion || `Categoria ${producto.categoria}`,
          estado: true,
        });
      });

      if (categoriasDesdeProductos.size > 0) {
        setCategorias(Array.from(categoriasDesdeProductos.values()));
      }
    }

    if (subcategorias.length === 0) {
      const subcategoriasDesdeProductos = new Map<number, SubcategoriaCatalogo>();
      productos.forEach((producto) => {
        if (producto.subcategoria === null || producto.subcategoria === undefined) return;
        subcategoriasDesdeProductos.set(producto.subcategoria, {
          idSubcategoria: producto.subcategoria,
          idCategoria: producto.categoria ?? null,
          descripcion: producto.subcategoriaDescripcion || `Subcategoria ${producto.subcategoria}`,
          estado: true,
        });
      });

      if (subcategoriasDesdeProductos.size > 0) {
        setSubcategorias(Array.from(subcategoriasDesdeProductos.values()));
      }
    }
  }, [authorizedViews, categorias.length, productos, subcategorias.length]);

  useEffect(() => {
    if (!catalogUserId || (!authorizedViews.has('emisor') && !authorizedViews.has('firma'))) return;

    let mounted = true;
    setLoadingEmisores(true);
    setDirectoryMessage(null);

    getEmisores(catalogUserId)
      .then((data) => {
        if (mounted) setEmisores(data);
      })
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar emisores.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingEmisores(false);
      });

    return () => {
      mounted = false;
    };
  }, [authorizedViews, catalogUserId, reloadKey]);

  useEffect(() => {
    if (!userId || !authorizedViews.has('perfil')) return;

    let mounted = true;
    setLoadingPerfil(true);
    setDirectoryMessage(null);

    getPerfil(userId)
      .then((data) => {
        if (!mounted) return;
        setPerfilData(data);
        setPerfilForm(perfilToForm(data.perfil));
      })
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar el perfil.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingPerfil(false);
      });

    return () => {
      mounted = false;
    };
  }, [authorizedViews, reloadKey, userId]);

  useEffect(() => {
    if (!catalogUserId || !authorizedViews.has('punto-emision')) return;

    let mounted = true;
    setLoadingPuntos(true);
    setDirectoryMessage(null);

    getPuntosEmision(catalogUserId)
      .then((data) => {
        if (mounted) setPuntosData(data);
      })
      .catch((error) => {
        const text = error instanceof ApiError ? error.message : 'No se pudo cargar puntos de emision.';
        if (mounted) setDirectoryMessage({ type: 'error', text });
      })
      .finally(() => {
        if (mounted) setLoadingPuntos(false);
      });

    return () => {
      mounted = false;
    };
  }, [authorizedViews, catalogUserId, reloadKey]);

  useEffect(() => {
    if (!authorizedViews.has('firma') || activeView !== 'firma') return;

    let mounted = true;
    setLoadingFirma(true);
    setDirectoryMessage(null);

    getERubricaEmisores()
      .then(async (mobileEmisores) => {
        if (!mounted) return;
        setFirmaMobileEmisores(mobileEmisores);
        const estados: Record<number, FirmaEstado> = {};
        mobileEmisores.forEach((emisor) => {
          const localEmisor = emisores.find((item) => item.codigo === emisor.id || item.id === emisor.id || item.ruc === emisor.ruc);
          const statusKey = localEmisor?.codigo ?? emisor.id;
          estados[statusKey] = {
            tieneCertificado: emisor.tieneCertificado,
            tieneClave: emisor.tieneClave,
            esValida: emisor.esValida ?? false,
            estadoVigencia: emisor.estadoVigencia,
            fechaExpiracion: emisor.fechaExpiracion,
            diasRestantes: emisor.diasRestantes,
            mensaje: emisor.mensaje,
          };
        });
        setFirmaEstados(estados);
        const results = await Promise.allSettled(mobileEmisores.map((emisor) => getERubricaFirmaEstado(emisor.id)));
        if (!mounted) return;
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const mobileEmisor = mobileEmisores[index];
            const localEmisor = emisores.find((item) => item.codigo === mobileEmisor.id || item.id === mobileEmisor.id || item.ruc === mobileEmisor.ruc);
            estados[localEmisor?.codigo ?? mobileEmisor.id] = result.value;
          }
        });
        setFirmaEstados({ ...estados });
      })
      .catch((error) => {
        if (mounted) {
          setFirmaMobileEmisores([]);
          setFirmaEstados({});
          setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo cargar el estado de las firmas.' });
        }
      })
      .finally(() => {
        if (mounted) setLoadingFirma(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeView, authorizedViews, emisores, reloadKey]);

  useEffect(() => {
    if (!clienteForm.pais) {
      setProvincias([]);
      setCiudades([]);
      return;
    }

    let mounted = true;
    getProvincias(clienteForm.pais)
      .then((data) => {
        if (mounted) setProvincias(data);
      })
      .catch(() => {
        if (mounted) setProvincias([]);
      });

    return () => {
      mounted = false;
    };
  }, [clienteForm.pais]);

  useEffect(() => {
    if (!clienteForm.provincia) {
      setCiudades([]);
      return;
    }

    let mounted = true;
    getCiudades(clienteForm.provincia)
      .then((data) => {
        if (mounted) setCiudades(data);
      })
      .catch(() => {
        if (mounted) setCiudades([]);
      });

    return () => {
      mounted = false;
    };
  }, [clienteForm.provincia]);

  useEffect(() => {
    if (!productoForm.categoria) {
      setSubcategoriasProducto([]);
      return;
    }

    const local = productoLookups?.subcategorias.filter((item) => item.idCategoria === productoForm.categoria) ?? [];
    if (local.length) {
      setSubcategoriasProducto(local);
      return;
    }

    let mounted = true;
    getProductoSubcategorias(productoForm.categoria)
      .then((data) => {
        if (mounted) setSubcategoriasProducto(data);
      })
      .catch(() => {
        if (mounted) setSubcategoriasProducto([]);
      });

    return () => {
      mounted = false;
    };
  }, [productoForm.categoria, productoLookups]);

  const filteredClientes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clientes.filter((cliente) =>
      (!term || [
        cliente.nombres,
        cliente.apellidos,
        cliente.nombrerazonsocial,
        cliente.nombrecomercial,
        cliente.numeroidentificacion,
        cliente.correo,
        cliente.celular,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))) &&
      (clienteTipoFiltro === 'todos' || (clienteTipoFiltro === 'personas' ? cliente.tipoCliente === 1 : cliente.tipoCliente === 2)) &&
      (clienteProveedorFiltro === 'todos' || cliente.esProveedor === true),
    );
  }, [clientes, search, clienteTipoFiltro, clienteProveedorFiltro]);

  const clientesActivos = useMemo(() => clientes.filter((cliente) => cliente.estado !== false).length, [clientes]);
  const clientesProveedores = useMemo(() => clientes.filter((cliente) => cliente.esProveedor === true).length, [clientes]);

  const productosConCatalogos = useMemo(() => {
    return productos.map((producto) => ({
      ...producto,
      tarifaDescripcion:
        producto.tarifaDescripcion ??
        productoLookups?.tarifas.find((tarifa) => tarifa.idTarifa === producto.tarifa)?.descripcion,
      categoriaDescripcion:
        producto.categoriaDescripcion ??
        productoLookups?.categorias.find((categoria) => categoria.idCategoria === producto.categoria)?.descripcion,
      subcategoriaDescripcion:
        producto.subcategoriaDescripcion ??
        productoLookups?.subcategorias.find((subcategoria) => subcategoria.idSubcategoria === producto.subcategoria)?.descripcion,
    }));
  }, [productoLookups, productos]);

  const productoCategoriasFiltro = useMemo(() => {
    const map = new Map<number, string>();
    productosConCatalogos.forEach((producto) => {
      if (producto.categoria !== null && producto.categoria !== undefined) {
        map.set(producto.categoria, producto.categoriaDescripcion || `Categoria ${producto.categoria}`);
      }
    });
    return Array.from(map, ([id, label]) => ({ id, label }));
  }, [productosConCatalogos]);

  const productoSubcategoriasFiltro = useMemo(() => {
    const map = new Map<number, string>();
    productosConCatalogos.forEach((producto) => {
      if (productoCategoriaFiltro !== null && producto.categoria !== productoCategoriaFiltro) return;
      if (producto.subcategoria !== null && producto.subcategoria !== undefined) {
        map.set(producto.subcategoria, producto.subcategoriaDescripcion || `Subcategoria ${producto.subcategoria}`);
      }
    });
    return Array.from(map, ([id, label]) => ({ id, label }));
  }, [productoCategoriaFiltro, productosConCatalogos]);

  const filteredProductos = useMemo(() => {
    return productosConCatalogos.filter((producto) =>
      (productoTipoFiltro === 'todos' || producto.tipo === productoTipoFiltro) &&
      (productoCategoriaFiltro === null || producto.categoria === productoCategoriaFiltro) &&
      (productoSubcategoriaFiltro === null || producto.subcategoria === productoSubcategoriaFiltro),
    );
  }, [productoCategoriaFiltro, productoSubcategoriaFiltro, productoTipoFiltro, productosConCatalogos]);

  const filteredCategorias = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categorias;

    return categorias.filter((categoria) => categoria.descripcion.toLowerCase().includes(term));
  }, [categorias, search]);

  const filteredSubcategorias = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return subcategorias;

    return subcategorias.filter((subcategoria) =>
      [subcategoria.descripcion, subcategoria.categoriaDescripcion]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [subcategorias, search]);

  const filteredEmisores = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return emisores;

    return emisores.filter((emisor) =>
      [emisor.razonSocial, emisor.nomComercial, emisor.ruc, emisor.email, emisor.telefono]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [emisores, search]);

  const updateClienteForm = <K extends keyof ClienteFormState>(key: K, value: ClienteFormState[K]) => {
    setClienteForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'pais' ? { provincia: null, ciudad: null } : {}),
      ...(key === 'provincia' ? { ciudad: null } : {}),
      ...(key === 'esProveedor' && value === true
        ? {
            cuentaContableProveedor: current.cuentaContableProveedor || '21311 - Proveedores',
            creditoTributarioProveedor: current.creditoTributarioProveedor || '01',
          }
        : {}),
    }));
  };

  const updateProductoForm = <K extends keyof ProductoFormState>(key: K, value: ProductoFormState[K]) => {
    setProductoForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'categoria' ? { subcategoria: null } : {}),
    }));
  };

  const updateCategoriaForm = <K extends keyof CategoriaFormState>(key: K, value: CategoriaFormState[K]) => {
    setCategoriaForm((current) => ({ ...current, [key]: value }));
  };

  const updateSubcategoriaForm = <K extends keyof SubcategoriaFormState>(key: K, value: SubcategoriaFormState[K]) => {
    setSubcategoriaForm((current) => ({ ...current, [key]: value }));
  };

  const updateEmisorForm = <K extends keyof EmisorFormState>(key: K, value: EmisorFormState[K]) => {
    setEmisorForm((current) => ({ ...current, [key]: value }));
  };

  const updatePerfilForm = <K extends keyof PerfilFormState>(key: K, value: PerfilFormState[K]) => {
    setPerfilForm((current) => ({ ...current, [key]: value }));
  };

  const selectPerfilAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'image/jpeg';
    setSavingPerfil(true);
    setDirectoryMessage(null);

    try {
      const uploaded = await uploadPerfilAvatar(
        userId,
        asset.uri,
        asset.fileName ?? `avatar.${mimeType.includes('png') ? 'png' : 'jpg'}`,
        mimeType,
      );
      const nextForm = {
        ...perfilForm,
        avatarUrl: uploaded.avatarUrl,
        avatarUploadUri: '',
        avatarUploadName: '',
        avatarUploadMimeType: '',
      };
      setPerfilForm(nextForm);
      setPerfilData((current) => current ? { ...current, perfil: { ...current.perfil, avatarUrl: uploaded.avatarUrl } } : current);
      setDirectoryMessage({ type: 'success', text: 'Foto actualizada correctamente.' });
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo subir la foto.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingPerfil(false);
    }
  };

  const selectPresetPerfilAvatar = async (avatar: string) => {
    const avatarUrl = avatarPath(avatar);
    const nextForm = {
      ...perfilForm,
      avatarUrl,
      avatarUploadUri: '',
      avatarUploadName: '',
      avatarUploadMimeType: '',
    };

    setPerfilForm(nextForm);
    setSavingPerfil(true);
    setDirectoryMessage(null);

    try {
      await updatePerfil(userId, perfilFormToPayload(nextForm, perfilData?.perfil));
      setPerfilData((current) => current ? { ...current, perfil: { ...current.perfil, avatarUrl } } : current);
      setDirectoryMessage({ type: 'success', text: 'Avatar actualizado correctamente.' });
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar el avatar.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingPerfil(false);
    }
  };

  const selectInitialsPerfilAvatar = async () => {
    const initialsUrl = initialsAvatarDataUri(perfilForm.nombres, perfilForm.apellidos, perfilForm.nombreEmpresa);
    const nextForm = {
      ...perfilForm,
      avatarUrl: initialsUrl,
      avatarUploadUri: '',
      avatarUploadName: '',
      avatarUploadMimeType: '',
    };

    setPerfilForm(nextForm);
    setSavingPerfil(true);
    setDirectoryMessage(null);

    try {
      await updatePerfil(userId, perfilFormToPayload(nextForm, perfilData?.perfil));
      setPerfilData((current) => current ? { ...current, perfil: { ...current.perfil, avatarUrl: initialsUrl } } : current);
      setDirectoryMessage({ type: 'success', text: 'Iniciales actualizadas correctamente.' });
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar el avatar de iniciales.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingPerfil(false);
    }
  };

  const updatePuntoForm = <K extends keyof PuntoFormState>(key: K, value: PuntoFormState[K]) => {
    setPuntoForm((current) => ({ ...current, [key]: value }));
  };

  const openNewCliente = () => {
    setSelectedCliente(null);
    setClienteForm(initialClienteForm);
    setClienteFormMode('create');
    setDirectoryMessage(null);
    openView('nuevo-cliente');
  };

  const openEditCliente = (cliente: Cliente) => {
    if (isConsumidorFinal(cliente)) {
      setDirectoryMessage({ type: 'info', text: 'Consumidor final es un registro del sistema y no se puede editar.' });
      return;
    }

    setSelectedCliente(cliente);
    setClienteForm(clienteToForm(cliente));
    setClienteFormMode('edit');
    setDirectoryMessage(null);
    openView('nuevo-cliente');
  };

  const closeClienteForm = () => {
    setSelectedCliente(null);
    setClienteForm(initialClienteForm);
    setClienteFormMode(null);
    openView('clientes');
  };

  const saveCliente = async () => {
    if (!userId || savingCliente) return;

    const nombre = clienteForm.tipoCliente === 2 ? clienteForm.nombrerazonsocial : `${clienteForm.nombres} ${clienteForm.apellidos}`;
    const empresaSinNombreComercial = clienteForm.tipoCliente === 2 && !clienteForm.nombrecomercial.trim();
    if (!clienteForm.tipoCliente || !nombre.trim() || empresaSinNombreComercial || !clienteForm.numeroidentificacion.trim() || !clienteForm.correo.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Completa tipo, identificacion, nombre y correo.' });
      return;
    }

    if (!clienteForm.oblgconta) {
      setDirectoryMessage({ type: 'error', text: 'Indica si esta obligado a llevar contabilidad.' });
      return;
    }

    if (clienteForm.diasCredito.trim() && Number(clienteForm.diasCredito.trim()) < 0) {
      setDirectoryMessage({ type: 'error', text: 'Los dias de credito no pueden ser negativos.' });
      return;
    }

    setSavingCliente(true);
    setDirectoryMessage(null);

    try {
      const payload = clienteFormToPayload(clienteForm);

      if (clienteFormMode === 'edit' && selectedCliente) {
        await updateCliente(userId, selectedCliente.codcliente, payload);
        setDirectoryMessage({ type: 'success', text: 'Cliente actualizado correctamente.' });
      } else {
        await createCliente(userId, payload);
        setDirectoryMessage({ type: 'success', text: 'Cliente registrado correctamente.' });
      }

      closeClienteForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar el cliente.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingCliente(false);
    }
  };

  const confirmDeleteCliente = (cliente: Cliente) => {
    if (isConsumidorFinal(cliente)) {
      setDirectoryMessage({ type: 'info', text: 'Consumidor final es un registro del sistema y no se puede eliminar.' });
      return;
    }

    const name =
      cliente.nombrerazonsocial ||
      cliente.nombrecomercial ||
      [cliente.nombres, cliente.apellidos].filter(Boolean).join(' ') ||
      'este cliente';

    Alert.alert('Eliminar cliente', `Deseas eliminar ${name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCliente(userId, cliente.codcliente);
            setDirectoryMessage({ type: 'success', text: 'Cliente eliminado correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo eliminar el cliente.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
  };

  const openNewProducto = () => {
    setSelectedProducto(null);
    setProductoForm(initialProductoForm);
    setProductoFormMode('create');
    setDirectoryMessage(null);
    openView('nuevo-producto');
  };

  const openEditProducto = async (producto: Producto) => {
    setSelectedProducto(producto);
    setProductoForm(productoToForm(producto));
    setProductoFormMode('edit');
    setDirectoryMessage(null);
    setLoadingProductoDetail(true);
    openView('nuevo-producto');

    try {
      const detalle = await getProducto(catalogUserId, producto.codproducto);
      setSelectedProducto(detalle);
      setProductoForm(productoToForm(detalle));
    } catch {
      setProductoForm(productoToForm(producto));
    } finally {
      setLoadingProductoDetail(false);
    }
  };

  const closeProductoForm = () => {
    setSelectedProducto(null);
    setProductoForm(initialProductoForm);
    setProductoFormMode(null);
    openView('productos');
  };

  const saveProducto = async () => {
    if (!catalogUserId || savingProducto) return;

    const precios = productoForm.precios.map((precio) => Number(precio.replace(',', '.')));
    const precioBase = precios[0];
    if (!productoForm.tipo || !productoForm.nombre.trim() || !productoForm.precios[0]?.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Completa tipo, nombre y precio base.' });
      return;
    }

    if (precios.some((precio) => !Number.isFinite(precio) || precio < 0)) {
      setDirectoryMessage({ type: 'error', text: 'Todos los precios deben ser numeros validos mayores o iguales a cero.' });
      return;
    }

    if (productoForm.iva && productoForm.tarifa === null) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona la tarifa de IVA.' });
      return;
    }

    setSavingProducto(true);
    setDirectoryMessage(null);

    try {
      const payload = productoFormToPayload(productoForm);

      if (productoFormMode === 'edit' && selectedProducto) {
        await updateProducto(catalogUserId, selectedProducto.codproducto, payload);
        setDirectoryMessage({ type: 'success', text: 'Producto actualizado correctamente.' });
      } else {
        await createProducto(catalogUserId, payload);
        setDirectoryMessage({ type: 'success', text: 'Producto registrado correctamente.' });
      }

      closeProductoForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar el producto.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingProducto(false);
    }
  };

  const confirmDeleteProducto = (producto: Producto) => {
    const name = producto.nombre || 'este producto';

    Alert.alert('Eliminar producto', `Deseas eliminar ${name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProducto(catalogUserId, producto.codproducto);
            setDirectoryMessage({ type: 'success', text: 'Producto eliminado correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo eliminar el producto.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
  };

  const openNewCategoria = () => {
    setSelectedCategoria(null);
    setCategoriaForm(initialCategoriaForm);
    setCategoriaFormMode('create');
    setDirectoryMessage(null);
  };

  const openEditCategoria = (categoria: CategoriaCatalogo) => {
    setSelectedCategoria(categoria);
    setCategoriaForm(categoriaToForm(categoria));
    setCategoriaFormMode('edit');
    setDirectoryMessage(null);
  };

  const closeCategoriaForm = () => {
    setSelectedCategoria(null);
    setCategoriaForm(initialCategoriaForm);
    setCategoriaFormMode(null);
  };

  const saveCategoria = async () => {
    if (!catalogUserId || savingCategoria) return;

    if (!categoriaForm.descripcion.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Completa la descripcion de la categoria.' });
      return;
    }

    setSavingCategoria(true);
    setDirectoryMessage(null);

    try {
      const payload = { descripcion: categoriaForm.descripcion.trim(), estado: categoriaForm.estado };

      if (categoriaFormMode === 'edit' && selectedCategoria) {
        await updateCategoria(catalogUserId, selectedCategoria.idCategoria, payload);
        setDirectoryMessage({ type: 'success', text: 'Categoria actualizada correctamente.' });
      } else {
        await createCategoria(catalogUserId, payload);
        setDirectoryMessage({ type: 'success', text: 'Categoria registrada correctamente.' });
      }

      closeCategoriaForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar la categoria.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingCategoria(false);
    }
  };

  const confirmDeleteCategoria = (categoria: CategoriaCatalogo) => {
    Alert.alert('Eliminar categoria', `Deseas eliminar ${categoria.descripcion}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategoria(catalogUserId, categoria.idCategoria);
            setDirectoryMessage({ type: 'success', text: 'Categoria eliminada correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo eliminar la categoria.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
  };

  const openNewSubcategoria = () => {
    setSelectedSubcategoria(null);
    setSubcategoriaForm(initialSubcategoriaForm);
    setSubcategoriaFormMode('create');
    setDirectoryMessage(null);
  };

  const openEditSubcategoria = (subcategoria: SubcategoriaCatalogo) => {
    setSelectedSubcategoria(subcategoria);
    setSubcategoriaForm(subcategoriaToForm(subcategoria));
    setSubcategoriaFormMode('edit');
    setDirectoryMessage(null);
  };

  const closeSubcategoriaForm = () => {
    setSelectedSubcategoria(null);
    setSubcategoriaForm(initialSubcategoriaForm);
    setSubcategoriaFormMode(null);
  };

  const saveSubcategoria = async () => {
    if (!catalogUserId || savingCategoria) return;

    if (!subcategoriaForm.descripcion.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Completa la descripcion de la subcategoria.' });
      return;
    }

    setSavingCategoria(true);
    setDirectoryMessage(null);

    try {
      const payload = {
        descripcion: subcategoriaForm.descripcion.trim(),
        idCategoria: subcategoriaForm.idCategoria,
        estado: subcategoriaForm.estado,
      };

      if (subcategoriaFormMode === 'edit' && selectedSubcategoria) {
        await updateSubcategoria(catalogUserId, selectedSubcategoria.idSubcategoria, payload);
        setDirectoryMessage({ type: 'success', text: 'Subcategoria actualizada correctamente.' });
      } else {
        await createSubcategoria(catalogUserId, payload);
        setDirectoryMessage({ type: 'success', text: 'Subcategoria registrada correctamente.' });
      }

      closeSubcategoriaForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar la subcategoria.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingCategoria(false);
    }
  };

  const confirmDeleteSubcategoria = (subcategoria: SubcategoriaCatalogo) => {
    Alert.alert('Eliminar subcategoria', `Deseas eliminar ${subcategoria.descripcion}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSubcategoria(catalogUserId, subcategoria.idSubcategoria);
            setDirectoryMessage({ type: 'success', text: 'Subcategoria eliminada correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo eliminar la subcategoria.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
  };

  const savePerfil = async () => {
    if (!userId || savingPerfil) return;

    const esEmpresa = perfilForm.tipoCliente === 2;
    if (!perfilForm.tipoCliente || !perfilForm.idTipoIdentificacion || !perfilForm.identificacion.trim() || !perfilForm.direccionEmpresa.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Completa tipo de cliente, identificacion y direccion.' });
      return;
    }

    if (esEmpresa && !perfilForm.nombreEmpresa.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Completa la razon social o nombre de empresa.' });
      return;
    }

    if (!esEmpresa && (!perfilForm.nombres.trim() || !perfilForm.apellidos.trim())) {
      setDirectoryMessage({ type: 'error', text: 'Completa nombres y apellidos.' });
      return;
    }

    if (perfilForm.email.trim() && !validateEmail(perfilForm.email.trim()).valid) {
      setDirectoryMessage({ type: 'error', text: 'El formato del correo electronico no es valido.' });
      return;
    }

    if (perfilForm.cambiarClave) {
      if (!perfilForm.nuevaPassword || !perfilForm.confirmarPassword) {
        setDirectoryMessage({ type: 'error', text: 'Completa la nueva clave y su confirmacion.' });
        return;
      }

      if (perfilForm.nuevaPassword !== perfilForm.confirmarPassword) {
        setDirectoryMessage({ type: 'error', text: 'Las claves no coinciden.' });
        return;
      }

      if (perfilForm.nuevaPassword.length < 6) {
        setDirectoryMessage({ type: 'error', text: 'La nueva clave debe tener al menos 6 caracteres.' });
        return;
      }
    }

    setSavingPerfil(true);
    setDirectoryMessage(null);

    try {
      let formToSave = perfilForm;
      if (perfilForm.avatarUploadUri) {
        const uploaded = await uploadPerfilAvatar(
          userId,
          perfilForm.avatarUploadUri,
          perfilForm.avatarUploadName || 'avatar.jpg',
          perfilForm.avatarUploadMimeType || 'image/jpeg',
        );
        formToSave = {
          ...perfilForm,
          avatarUrl: uploaded.avatarUrl,
          avatarUploadUri: '',
          avatarUploadName: '',
          avatarUploadMimeType: '',
        };
        setPerfilForm(formToSave);
      }

      await updatePerfil(userId, perfilFormToPayload(formToSave, perfilData?.perfil));
      setDirectoryMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar el perfil.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingPerfil(false);
    }
  };

  const openNewPunto = () => {
    if (!puntosData?.emisor) {
      setDirectoryMessage({ type: 'info', text: 'Primero registra un emisor para crear puntos de emision.' });
      return;
    }

    setSelectedPunto(null);
    setPuntoForm({ puntoEmision: getNextPuntoCode(puntosData.cajas) });
    setPuntoFormMode('create');
    setDirectoryMessage(null);
  };

  const openEditPunto = (punto: PuntoEmision) => {
    setSelectedPunto(punto);
    setPuntoForm(puntoToForm(punto));
    setPuntoFormMode('edit');
    setDirectoryMessage(null);
  };

  const closePuntoForm = () => {
    setSelectedPunto(null);
    setPuntoForm(initialPuntoForm);
    setPuntoFormMode(null);
  };

  const savePunto = async () => {
    if (!catalogUserId || savingPunto) return;

    const punto = normalizeSerieCode(puntoForm.puntoEmision);
    if (!punto) {
      setDirectoryMessage({ type: 'error', text: 'Ingresa el punto de emision.' });
      return;
    }

    setSavingPunto(true);
    setDirectoryMessage(null);

    try {
      if (puntoFormMode === 'edit' && selectedPunto) {
        await updatePuntoEmision(catalogUserId, selectedPunto.sec, punto);
        setDirectoryMessage({ type: 'success', text: 'Punto de emision actualizado correctamente.' });
      } else {
        await createPuntoEmision(catalogUserId, punto, puntosData?.emisor?.codEstablecimiento);
        setDirectoryMessage({ type: 'success', text: 'Punto de emision registrado correctamente.' });
      }

      closePuntoForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar el punto de emision.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingPunto(false);
    }
  };

  const confirmDeletePunto = (punto: PuntoEmision) => {
    Alert.alert('Eliminar punto de emision', `Deseas eliminar la serie ${getPuntoSerie(punto)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePuntoEmision(catalogUserId, punto.sec);
            setDirectoryMessage({ type: 'success', text: 'Punto de emision eliminado correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo eliminar el punto de emision.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
  };

  const makePuntoPrincipal = async (punto: PuntoEmision) => {
    if (!catalogUserId) return;

    try {
      await markPuntoPrincipal(catalogUserId, punto.sec);
      setDirectoryMessage({ type: 'success', text: 'Punto principal actualizado correctamente.' });
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo marcar como principal.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const openNewEmisor = () => {
    if (emisores.some((emisor) => emisor.estado !== false)) {
      setDirectoryMessage({ type: 'info', text: 'Ya existe un emisor registrado. Puedes editar el emisor actual.' });
      return;
    }

    setSelectedEmisor(null);
    setEmisorForm(initialEmisorForm);
    setEmisorFormMode('create');
    setDirectoryMessage(null);
  };

  const openEditEmisor = async (emisor: Emisor) => {
    setSelectedEmisor(emisor);
    setEmisorForm(emisorToForm(emisor));
    setEmisorFormMode('edit');
    setDirectoryMessage(null);

    try {
      const detalle = await getEmisor(catalogUserId, emisor.codigo);
      setSelectedEmisor(detalle);
      setEmisorForm(emisorToForm(detalle));
    } catch {
      setEmisorForm(emisorToForm(emisor));
    }
  };

  const closeEmisorForm = () => {
    setSelectedEmisor(null);
    setEmisorForm(initialEmisorForm);
    setEmisorFormMode(null);
  };

  const saveEmisor = async () => {
    if (!catalogUserId || savingEmisor) return;

    const ruc = emisorForm.ruc.replace(/\D/g, '');
    if (!emisorForm.razonSocial.trim() || !emisorForm.nomComercial.trim() || !ruc) {
      setDirectoryMessage({ type: 'error', text: 'Completa razon social, nombre comercial y RUC.' });
      return;
    }

    if (ruc.length !== 13) {
      setDirectoryMessage({ type: 'error', text: 'El RUC debe tener 13 digitos.' });
      return;
    }

    if (!emisorForm.dirEstablecimiento.trim() || !emisorForm.direccionMatriz.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Completa las direcciones del emisor.' });
      return;
    }

    if (emisorForm.email.trim() && !validateEmail(emisorForm.email.trim()).valid) {
      setDirectoryMessage({ type: 'error', text: 'El formato del correo electronico no es valido.' });
      return;
    }

    if (activeView === 'firma') {
      const firmaPath = emisorForm.pathCertificado.trim();
      const tieneArchivoNuevo = Boolean(emisorForm.firmaArchivoUri);
      const tieneClave = Boolean(emisorForm.claveCertificado.trim() || selectedEmisor?.tieneClaveCertificadoConfigurada);

      if ((!firmaPath && !tieneArchivoNuevo) || !tieneClave) {
        setDirectoryMessage({ type: 'error', text: 'Agrega el archivo .p12 y la clave del certificado.' });
        return;
      }

      const nombreArchivo = emisorForm.firmaArchivoNombre || firmaPath;
      if (!nombreArchivo.toLowerCase().endsWith('.p12')) {
        setDirectoryMessage({ type: 'error', text: 'El archivo de firma debe ser .p12.' });
        return;
      }
    }

    setSavingEmisor(true);
    setDirectoryMessage(null);

    try {
      let formToSave = emisorForm;

      if (activeView === 'firma' && selectedEmisor && emisorForm.firmaArchivoUri) {
        const uploaded = await uploadFirmaArchivo(catalogUserId, selectedEmisor.codigo, {
          uri: emisorForm.firmaArchivoUri,
          name: emisorForm.firmaArchivoNombre,
          mimeType: emisorForm.firmaArchivoMimeType,
        });
        formToSave = {
          ...emisorForm,
          pathCertificado: uploaded.pathCertificado,
          firmaArchivoUri: '',
          firmaArchivoNombre: uploaded.nombreArchivo ?? emisorForm.firmaArchivoNombre,
          firmaArchivoMimeType: '',
          eliminarClaveCertificado: false,
        };
        setEmisorForm(formToSave);
      }

      const payload = emisorFormToPayload(formToSave, selectedEmisor);

      if (emisorFormMode === 'edit' && selectedEmisor) {
        await updateEmisor(catalogUserId, selectedEmisor.codigo, payload);
        setDirectoryMessage({ type: 'success', text: activeView === 'firma' ? 'Firma guardada correctamente.' : 'Emisor actualizado correctamente.' });
      } else {
        await createEmisor(catalogUserId, payload);
        setDirectoryMessage({ type: 'success', text: 'Emisor registrado correctamente.' });
      }

      closeEmisorForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar el emisor.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingEmisor(false);
    }
  };

  const openFirmaForm = (emisor: Emisor) => {
    setSelectedEmisor(emisor);
    setEmisorForm(emisorToForm(emisor));
    setEmisorFormMode('edit');
    setDirectoryMessage(null);
  };

  const openAddFirma = () => {
    const emisor = emisores.find((item) => !hasFirmaConfigured(item)) ?? emisores[0];
    if (!emisor) {
      setDirectoryMessage({ type: 'info', text: 'Primero registra un emisor para agregar la firma.' });
      return;
    }

    openFirmaForm(emisor);
  };

  const clearFirmaFields = () => {
    setEmisorForm((current) => ({
      ...current,
      pathCertificado: '',
      firmaArchivoUri: '',
      firmaArchivoNombre: '',
      firmaArchivoMimeType: '',
      claveCertificado: '',
      eliminarClaveCertificado: true,
    }));
  };

  const confirmDeleteFirma = (emisor: Emisor) => {
    const title = emisor.nomComercial || emisor.razonSocial || 'este emisor';
    Alert.alert('Eliminar firma', `Deseas quitar la firma configurada de ${title}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (!catalogUserId) return;
          try {
            const form = {
              ...emisorToForm(emisor),
              pathCertificado: '',
              firmaArchivoUri: '',
              firmaArchivoNombre: '',
              firmaArchivoMimeType: '',
              claveCertificado: '',
              eliminarClaveCertificado: true,
            };
            await updateEmisor(catalogUserId, emisor.codigo, emisorFormToPayload(form, emisor));
            setDirectoryMessage({ type: 'success', text: 'Firma eliminada correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo eliminar la firma.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
  };

  const selectFirmaArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      if (!asset.name.toLowerCase().endsWith('.p12')) {
        setDirectoryMessage({ type: 'error', text: 'Solo se permiten archivos .p12.' });
        return;
      }

      if (asset.size && asset.size > 5 * 1024 * 1024) {
        setDirectoryMessage({ type: 'error', text: 'El archivo de firma no debe superar 5 MB.' });
        return;
      }

      setEmisorForm((current) => ({
        ...current,
        pathCertificado: current.pathCertificado,
        firmaArchivoUri: asset.uri,
        firmaArchivoNombre: asset.name,
        firmaArchivoMimeType: asset.mimeType || 'application/x-pkcs12',
        eliminarClaveCertificado: false,
      }));
      setDirectoryMessage({ type: 'info', text: 'Archivo .p12 seleccionado. Ingresa la clave y guarda la firma.' });
    } catch (error) {
      const text = error instanceof Error ? error.message : 'No se pudo seleccionar el archivo .p12.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const selectEmisorLogo = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setDirectoryMessage({ type: 'error', text: 'Se necesita permiso para seleccionar el logo.' });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [2, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset?.base64) {
        setDirectoryMessage({ type: 'error', text: 'No se pudo leer la imagen seleccionada.' });
        return;
      }

      if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
        setDirectoryMessage({ type: 'error', text: 'El logo no debe superar 2 MB.' });
        return;
      }

      const extension = asset.fileName?.split('.').pop()?.toLowerCase();
      const mimeType = asset.mimeType || (extension === 'png' ? 'image/png' : 'image/jpeg');
      if (!['image/jpeg', 'image/png'].includes(mimeType)) {
        setDirectoryMessage({ type: 'error', text: 'El logo debe ser JPG, JPEG o PNG.' });
        return;
      }

      setEmisorForm((current) => ({
        ...current,
        logoImagen: `data:${mimeType};base64,${asset.base64}`,
      }));
      setDirectoryMessage({ type: 'info', text: 'Logo seleccionado. Revisa la vista previa y guarda el emisor.' });
    } catch (error) {
      const text = error instanceof Error ? error.message : 'No se pudo seleccionar el logo.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const confirmDeleteEmisor = (emisor: Emisor) => {
    const name = emisor.razonSocial || emisor.nomComercial || 'este emisor';

    Alert.alert('Eliminar emisor', `Deseas eliminar ${name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEmisor(catalogUserId, emisor.codigo);
            setDirectoryMessage({ type: 'success', text: 'Emisor eliminado correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo eliminar el emisor.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
  };

  const showAdminCrudPending = (action: string, item?: AdminMobileItem) => {
    const moduleName = getWorkspaceTitle(activeView);
    const itemName = item?.title || item?.id || 'este registro';

    setDirectoryMessage({
      type: 'info',
      text: `${action} en ${moduleName} aun no tiene formulario o endpoint CRUD conectado para ${item ? itemName : 'movil'}.`,
    });
  };

  const showAdminItemDetail = (item: AdminMobileItem) => {
    Alert.alert(item.title || 'Detalle', [item.subtitle, item.meta, item.detail].filter(Boolean).join('\n') || item.id);
  };

  const openNewOperational = () => {
    setSelectedOperationalItem(null);
    setOperationalForm(initialOperationalForm);
    setOperationalFormMode('create');
    setDirectoryMessage(null);
  };

  const openEditOperational = (item: OperationalMobileItem) => {
    setSelectedOperationalItem(item);
    setOperationalForm(operationalItemToForm(item));
    setOperationalFormMode('edit');
    setDirectoryMessage(null);
  };

  const closeOperationalForm = () => {
    setOperationalFormMode(null);
    setSelectedOperationalItem(null);
    setOperationalForm(initialOperationalForm);
  };

  const updateOperationalForm = (field: keyof OperationalFormState, value: string) => {
    setOperationalForm((current) => ({ ...current, [field]: value }));
  };

  const updateRechargeForm = (field: 'codigo' | 'valor', rawValue: string) => {
    setOperationalForm((current) => {
      if (field === 'codigo') {
        const codigo = rawValue.replace(/\D/g, '');
        const documentos = Number(codigo) || 0;
        return {
          ...current,
          codigo,
          valor: documentos > 0 ? calculateMobileRechargeTotal(documentos).toFixed(2) : '',
          descripcion: documentos > 0 ? `Recarga de ${documentos} documentos` : '',
        };
      }

      const valor = rawValue.replace(/[^\d,.]/g, '');
      const monto = Number(valor.replace(',', '.')) || 0;
      const documentos = calculateMobileRechargeDocuments(monto);
      return {
        ...current,
        valor,
        codigo: documentos > 0 ? String(documentos) : '',
        descripcion: documentos > 0 ? `Recarga de ${documentos} documentos` : '',
      };
    });
  };

  const selectRechargePlan = (documents: number, amount: number, unlimited: boolean) => {
    setOperationalForm((current) => ({
      ...current,
      codigo: unlimited ? '0' : String(documents),
      valor: amount.toFixed(2),
      descripcion: unlimited ? 'Documentos ilimitados por 1 año' : `Recarga de ${documents} documentos`,
    }));
  };

  const getCurrentOperationalContext = () => {
    const module = getOperationalModuleSlug(activeView);
    if (!module) return null;
    const tab = operationalTabByView[activeView] ?? getOperationalDefaultTab(activeView, module);

    return { module, tab };
  };

  const saveOperational = async () => {
    const context = getCurrentOperationalContext();
    if (!context) return;

    if (!operationalForm.descripcion.trim() && !(context.module === 'recargas' && context.tab === 'Comprar documentos')) {
      setDirectoryMessage({ type: 'error', text: 'Completa la descripcion del registro.' });
      return;
    }

    setSavingOperational(true);
    setDirectoryMessage(null);

    try {
      const payload = operationalFormToPayloadForContext(context.module, context.tab, operationalForm);
      if (context.module === 'recargas' && context.tab === 'Comprar documentos' && catalogUserId) {
        const payment = await iniciarPagoCompraDocumentos(catalogUserId, {
          documentos: Number(operationalForm.codigo.trim()) || 0,
          montoTotal: Number(operationalForm.valor.replace(',', '.')) || 0,
          descripcion: operationalForm.descripcion.trim() || 'Recarga personalizada',
          emailDestino: operationalForm.observacion.trim() || null,
          esIlimitado: operationalForm.descripcion.toLowerCase().includes('ilimit'),
        });
        await Linking.openURL(payment.paymentUrl);
        setDirectoryMessage({ type: 'success', text: 'Checkout de Pagomedios abierto. La recarga se acreditara al aprobar el pago.' });
        return;
      }
      if (operationalFormMode === 'edit' && selectedOperationalItem?.id) {
        await updateOperationalItem(context.module, context.tab, selectedOperationalItem.id, payload, { userId: catalogUserId });
      } else {
        await createOperationalItem(context.module, context.tab, payload, { userId: catalogUserId });
      }

      setDirectoryMessage({ type: 'success', text: 'Registro guardado correctamente.' });
      closeOperationalForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar el registro.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingOperational(false);
    }
  };

  const showOperationalItemDetail = (item: OperationalMobileItem) => {
    Alert.alert(item.title || 'Detalle', [item.subtitle, item.meta, item.status, item.detail].filter(Boolean).join('\n') || item.id);
  };

  const confirmDeleteOperational = (item: OperationalMobileItem) => {
    const context = getCurrentOperationalContext();
    if (!context) return;

    Alert.alert('Eliminar registro', `Deseas eliminar ${item.title || item.id || 'este registro'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteOperationalItem(context.module, context.tab, item.id, { userId: catalogUserId });
            setDirectoryMessage({ type: 'success', text: 'Registro eliminado correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo eliminar el registro.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
  };

  const updateFacturaForm = (field: keyof NuevaFacturaFormState, value: string) => {
    setFacturaForm((current) => ({ ...current, [field]: value }));
  };

  const searchFacturaClientes = async () => {
    if (!catalogUserId || !facturaForm.clienteBusqueda.trim()) return;
    setLoadingFacturas(true);
    setDirectoryMessage(null);
    try {
      setFacturaClientes(await buscarFacturaClientes(catalogUserId, facturaForm.clienteBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar clientes.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingFacturas(false);
    }
  };

  const searchFacturaProductos = async () => {
    if (!catalogUserId || !facturaForm.productoBusqueda.trim()) return;
    setLoadingFacturas(true);
    setDirectoryMessage(null);
    try {
      setFacturaProductos(await buscarFacturaProductos(catalogUserId, facturaForm.productoBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar productos.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingFacturas(false);
    }
  };

  const addFacturaProducto = (producto: FacturaProducto) => {
    setFacturaLineas((current) => [
      ...current,
      {
        producto,
        cantidad: '1',
        precio: String(producto.precioUnitario ?? 0),
        descuento: '0',
        tarifa: String(producto.tarifaIva ?? 15),
      },
    ]);
    setFacturaProductos([]);
    setFacturaForm((current) => ({ ...current, productoBusqueda: '' }));
  };

  const updateFacturaLinea = (index: number, field: keyof Omit<NuevaFacturaLinea, 'producto'>, value: string) => {
    setFacturaLineas((current) => current.map((linea, currentIndex) => currentIndex === index ? { ...linea, [field]: value } : linea));
  };

  const removeFacturaLinea = (index: number) => {
    setFacturaLineas((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const clearFacturaForm = () => {
    setFacturaForm(initialNuevaFacturaForm);
    setFacturaCliente(null);
    setFacturaClientes([]);
    setFacturaProductos([]);
    setFacturaLineas([]);
    setDirectoryMessage(null);
  };

  const saveNuevaFactura = async () => {
    if (!catalogUserId) return;
    if (!facturaCliente) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona un cliente para la factura.' });
      return;
    }
    if (facturaLineas.length === 0) {
      setDirectoryMessage({ type: 'error', text: 'Agrega al menos un producto o servicio.' });
      return;
    }

    setSavingFactura(true);
    setDirectoryMessage(null);
    try {
      const result = await guardarFactura({
        idUsuario: catalogUserId,
        cliente: facturaCliente,
        serie: facturaForm.serie,
        codemisor: facturaPreparacion?.series?.[0]?.codemisor ?? facturaPreparacion?.caja?.codemisor,
        formaPago: facturaForm.formaPago,
        referencia: facturaForm.referencia,
        correos: facturaForm.correoAdicional ? [facturaForm.correoAdicional] : [],
        detalles: facturaLineas.map((linea) => ({
          producto: linea.producto,
          cantidad: Number(linea.cantidad.replace(',', '.')) || 0,
          precio: Number(linea.precio.replace(',', '.')) || 0,
          descuento: Number(linea.descuento.replace(',', '.')) || 0,
          tarifa: Number(linea.tarifa.replace(',', '.')) || 0,
        })),
      });
      setDirectoryMessage({ type: 'success', text: `${result.mensaje} ${result.numeroComprobante ?? ''}`.trim() });
      clearFacturaForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar la factura.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingFactura(false);
    }
  };

  const openFacturaAsset = async (loader: () => Promise<{ url: string }>) => {
    try {
      const response = await loader();
      const url = response.url?.startsWith('http') ? response.url : `${API_BASE_URL.replace(/\/$/, '')}/${response.url.replace(/^\//, '')}`;
      await Linking.openURL(url);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo abrir el documento.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const openPdfOptions = async (loader: () => Promise<{ url: string }>, fileName: string) => {
    try {
      const response = await loader();
      const url = response.url?.startsWith('http') ? response.url : `${API_BASE_URL.replace(/\/$/, '')}/${response.url.replace(/^\//, '')}`;
      Alert.alert('Abrir PDF', '¿Cómo deseas abrir este documento?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir PDF', onPress: () => Linking.openURL(url) },
        {
          text: 'Abrir con E-Rúbrica',
          onPress: async () => {
            try {
              const target = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}erubrica-${Date.now()}.pdf`;
              const download = await FileSystem.downloadAsync(url, target);
              setErubricaInitialPdf({ uri: download.uri, name: fileName, mimeType: 'application/pdf' });
              openView('e-rubrica');
            } catch (error) {
              setDirectoryMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo cargar el PDF en E-Rúbrica.' });
            }
          },
        },
      ]);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo abrir el documento.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const sendFacturaCorreo = async (factura: FacturaListItem) => {
    if (!catalogUserId) return;
    try {
      await enviarFacturaCorreo(catalogUserId, factura.codfactura);
      setDirectoryMessage({ type: 'success', text: 'Correo enviado correctamente.' });
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo enviar el correo.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const confirmAnularFactura = (factura: FacturaListItem) => {
    if (!catalogUserId) return;
    Alert.alert('Anular factura', `Deseas anular ${factura.numeroCompleto ?? factura.numfactura ?? 'esta factura'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Anular',
        style: 'destructive',
        onPress: async () => {
          try {
            await anularFactura(catalogUserId, factura.codfactura);
            setDirectoryMessage({ type: 'success', text: 'Factura anulada correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo anular la factura.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
  };

  const updateNotaCreditoForm = (field: keyof NotaCreditoFormState, value: string) => {
    setNotaCreditoForm((current) => ({ ...current, [field]: value }));
  };

  const searchNotaCreditoFacturas = async () => {
    if (!catalogUserId || !notaCreditoForm.facturaBusqueda.trim()) return;
    setLoadingNotasCredito(true);
    setDirectoryMessage(null);
    try {
      setNotaCreditoFacturas(await buscarNotaCreditoFacturas(catalogUserId, notaCreditoForm.facturaBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar facturas.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingNotasCredito(false);
    }
  };

  const selectNotaCreditoFactura = (factura: FacturaListItem) => {
    const cliente: Cliente = {
      codcliente: 0,
      nombrerazonsocial: factura.cliente,
      numeroidentificacion: factura.identificacionCliente,
    };
    setNotaCreditoFactura(factura);
    setNotaCreditoCliente(cliente);
    setNotaCreditoFacturas([]);
    setNotaCreditoForm((current) => ({
      ...current,
      facturaBusqueda: factura.numeroCompleto ?? factura.numfactura ?? '',
      clienteBusqueda: factura.cliente ?? '',
      correoPrincipal: '',
      tipoIdentificacion: '',
      tipoCliente: '',
      obligadoContabilidad: '',
      direccion: '',
      telefono: '',
    }));
    if (notaCreditoLineas.length === 0) {
      setNotaCreditoLineas([{
        producto: {
          codproducto: 0,
          codprincipal: 'NC',
          descripcion: `Ajuste factura ${factura.numeroCompleto ?? factura.numfactura ?? ''}`.trim(),
          precioUnitario: Number(factura.total ?? 0),
          tarifaIva: 0,
        },
        cantidad: '1',
        precio: String(Number(factura.total ?? 0)),
        descuento: '0',
        tarifa: '0',
      }]);
    }
  };

  const addNotaCreditoProducto = (producto: FacturaProducto) => {
    setNotaCreditoLineas((current) => [
      ...current,
      {
        producto,
        cantidad: '1',
        precio: String(producto.precioUnitario ?? 0),
        descuento: '0',
        tarifa: String(producto.tarifaIva ?? 15),
      },
    ]);
  };

  const updateNotaCreditoLinea = (index: number, field: keyof Omit<NuevaFacturaLinea, 'producto'>, value: string) => {
    setNotaCreditoLineas((current) => current.map((linea, currentIndex) => currentIndex === index ? { ...linea, [field]: value } : linea));
  };

  const removeNotaCreditoLinea = (index: number) => {
    setNotaCreditoLineas((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const clearNotaCreditoForm = () => {
    setNotaCreditoForm(initialNotaCreditoForm);
    setNotaCreditoFactura(null);
    setNotaCreditoCliente(null);
    setNotaCreditoFacturas([]);
    setNotaCreditoLineas([]);
    setDirectoryMessage(null);
  };

  const saveNuevaNotaCredito = async () => {
    if (!catalogUserId) return;
    if (!notaCreditoCliente) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona la factura modificada para cargar el cliente.' });
      return;
    }
    if (notaCreditoLineas.length === 0) {
      setDirectoryMessage({ type: 'error', text: 'Agrega al menos un detalle para la nota de credito.' });
      return;
    }

    setSavingNotaCredito(true);
    setDirectoryMessage(null);
    try {
      const result = await guardarNotaCredito({
        idUsuario: catalogUserId,
        cliente: notaCreditoCliente,
        facturaModificada: notaCreditoFactura,
        serie: notaCreditoForm.serie,
        codemisor: notaCreditoPreparacion?.series?.[0]?.codemisor ?? notaCreditoPreparacion?.caja?.codemisor,
        motivo: notaCreditoForm.motivo,
        observacion: notaCreditoForm.observacion,
        correos: notaCreditoForm.correoAdicional ? [notaCreditoForm.correoAdicional] : [],
        detalles: notaCreditoLineas.map((linea) => ({
          producto: linea.producto,
          cantidad: Number(linea.cantidad.replace(',', '.')) || 0,
          precio: Number(linea.precio.replace(',', '.')) || 0,
          descuento: Number(linea.descuento.replace(',', '.')) || 0,
          tarifa: Number(linea.tarifa.replace(',', '.')) || 0,
        })),
      });
      setDirectoryMessage({ type: 'success', text: `${result.mensaje} ${result.numeroComprobante ?? ''}`.trim() });
      clearNotaCreditoForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar la nota de credito.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingNotaCredito(false);
    }
  };

  const sendNotaCreditoCorreo = async (nota: NotaCreditoListItem) => {
    if (!catalogUserId) return;
    try {
      await enviarNotaCreditoCorreo(catalogUserId, nota.codNotaCredito);
      setDirectoryMessage({ type: 'success', text: 'Correo enviado correctamente.' });
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo enviar el correo.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const updateNotaDebitoForm = (field: keyof NotaDebitoFormState, value: string) => {
    setNotaDebitoForm((current) => ({ ...current, [field]: value }));
  };

  const searchNotaDebitoFacturas = async () => {
    if (!catalogUserId || !notaDebitoForm.facturaBusqueda.trim()) return;
    setLoadingNotasDebito(true);
    setDirectoryMessage(null);
    try {
      setNotaDebitoFacturas(await buscarNotaDebitoFacturas(catalogUserId, notaDebitoForm.facturaBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar facturas.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingNotasDebito(false);
    }
  };

  const selectNotaDebitoFactura = (factura: FacturaListItem) => {
    const cliente: Cliente = {
      codcliente: 0,
      nombrerazonsocial: factura.cliente,
      numeroidentificacion: factura.identificacionCliente,
    };
    setNotaDebitoFactura(factura);
    setNotaDebitoCliente(cliente);
    setNotaDebitoFacturas([]);
    setNotaDebitoForm((current) => ({
      ...current,
      facturaBusqueda: factura.numeroCompleto ?? factura.numfactura ?? '',
      clienteBusqueda: factura.cliente ?? '',
      correoPrincipal: '',
      tipoIdentificacion: '',
      tipoCliente: '',
      obligadoContabilidad: '',
      direccion: '',
      telefono: '',
    }));
  };

  const updateNotaDebitoLinea = (index: number, field: keyof NotaDebitoLinea, value: string) => {
    setNotaDebitoLineas((current) => current.map((linea, currentIndex) => currentIndex === index ? { ...linea, [field]: value } : linea));
  };

  const addNotaDebitoLinea = () => {
    setNotaDebitoLineas((current) => [...current, initialNotaDebitoLinea]);
  };

  const removeNotaDebitoLinea = (index: number) => {
    setNotaDebitoLineas((current) => current.length <= 1 ? current : current.filter((_, currentIndex) => currentIndex !== index));
  };

  const clearNotaDebitoForm = () => {
    setNotaDebitoForm(initialNotaDebitoForm);
    setNotaDebitoFactura(null);
    setNotaDebitoCliente(null);
    setNotaDebitoFacturas([]);
    setNotaDebitoLineas([initialNotaDebitoLinea]);
    setDirectoryMessage(null);
  };

  const saveNuevaNotaDebito = async () => {
    if (!catalogUserId) return;
    if (!notaDebitoCliente) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona la factura modificada para cargar el cliente.' });
      return;
    }

    setSavingNotaDebito(true);
    setDirectoryMessage(null);
    try {
      const result = await guardarNotaDebito({
        idUsuario: catalogUserId,
        cliente: notaDebitoCliente,
        facturaModificada: notaDebitoFactura,
        serie: notaDebitoForm.serie,
        codemisor: notaDebitoPreparacion?.series?.[0]?.codemisor ?? notaDebitoPreparacion?.caja?.codemisor,
        correos: notaDebitoForm.correoAdicional ? [notaDebitoForm.correoAdicional] : [],
        detalles: notaDebitoLineas.map((linea) => ({
          descripcion: linea.descripcion,
          precio: Number(linea.precio.replace(',', '.')) || 0,
          tarifa: Number(linea.tarifa.replace(',', '.')) || 0,
          impuestoIce: linea.impuestoIce,
          valorIce: Number(linea.valorIce.replace(',', '.')) || 0,
        })),
      });
      setDirectoryMessage({ type: 'success', text: `${result.mensaje} ${result.numeroComprobante ?? ''}`.trim() });
      clearNotaDebitoForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar la nota de debito.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingNotaDebito(false);
    }
  };

  const sendNotaDebitoCorreo = async (nota: NotaDebitoListItem) => {
    if (!catalogUserId) return;
    try {
      await enviarNotaDebitoCorreo(catalogUserId, nota.codNotaDebito);
      setDirectoryMessage({ type: 'success', text: 'Correo enviado correctamente.' });
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo enviar el correo.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const updateLiquidacionForm = (field: keyof LiquidacionCompraFormState, value: string) => {
    setLiquidacionForm((current) => ({ ...current, [field]: value }));
  };

  const searchLiquidacionProveedores = async () => {
    if (!catalogUserId || !liquidacionForm.clienteBusqueda.trim()) return;
    setLoadingLiquidaciones(true);
    setDirectoryMessage(null);
    try {
      setLiquidacionProveedores(await buscarLiquidacionProveedores(catalogUserId, liquidacionForm.clienteBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar proveedores.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingLiquidaciones(false);
    }
  };

  const searchLiquidacionProductos = async () => {
    if (!catalogUserId || !liquidacionForm.productoBusqueda.trim()) return;
    setLoadingLiquidaciones(true);
    setDirectoryMessage(null);
    try {
      setLiquidacionProductos(await buscarLiquidacionProductos(catalogUserId, liquidacionForm.productoBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar productos.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingLiquidaciones(false);
    }
  };

  const selectLiquidacionProveedor = (proveedor: Cliente) => {
    setLiquidacionProveedor(proveedor);
    setLiquidacionProveedores([]);
    setLiquidacionForm((current) => ({
      ...current,
      clienteBusqueda: getClienteDisplayName(proveedor),
      direccion: proveedor.direccion ?? '',
      telefono: proveedor.celular || proveedor.telefonoconvencional || '',
      correoPrincipal: getClienteEmail(proveedor),
    }));
  };

  const addLiquidacionProducto = (producto: FacturaProducto) => {
    setLiquidacionLineas((current) => [...current, {
      producto,
      cantidad: '1',
      precio: String(producto.precioUnitario ?? 0),
      descuento: '0',
      tarifa: String(producto.tarifaIva ?? 15),
    }]);
    setLiquidacionProductos([]);
    setLiquidacionForm((current) => ({ ...current, productoBusqueda: '' }));
  };

  const updateLiquidacionLinea = (index: number, field: keyof Omit<NuevaFacturaLinea, 'producto'>, value: string) => {
    setLiquidacionLineas((current) => current.map((linea, currentIndex) => currentIndex === index ? { ...linea, [field]: value } : linea));
  };

  const removeLiquidacionLinea = (index: number) => {
    setLiquidacionLineas((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const clearLiquidacionForm = () => {
    setLiquidacionForm(initialLiquidacionCompraForm);
    setLiquidacionProveedor(null);
    setLiquidacionProveedores([]);
    setLiquidacionProductos([]);
    setLiquidacionLineas([]);
    setDirectoryMessage(null);
  };

  const saveNuevaLiquidacion = async () => {
    if (!catalogUserId) return;
    if (!liquidacionProveedor) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona un proveedor para la liquidacion.' });
      return;
    }
    if (liquidacionLineas.length === 0) {
      setDirectoryMessage({ type: 'error', text: 'Agrega al menos un producto o servicio.' });
      return;
    }
    setSavingLiquidacion(true);
    setDirectoryMessage(null);
    try {
      const result = await guardarLiquidacionCompra({
        idUsuario: catalogUserId,
        proveedor: liquidacionProveedor,
        serie: liquidacionForm.serie,
        codemisor: liquidacionPreparacion?.series?.[0]?.codemisor ?? liquidacionPreparacion?.caja?.codemisor,
        formaPago: liquidacionForm.formaPago,
        diasCredito: Number(liquidacionForm.diasCredito) || 0,
        correos: liquidacionForm.correoAdicional ? [liquidacionForm.correoAdicional] : [],
        detalles: liquidacionLineas.map((linea) => ({
          producto: linea.producto,
          cantidad: Number(linea.cantidad.replace(',', '.')) || 0,
          precio: Number(linea.precio.replace(',', '.')) || 0,
          descuento: Number(linea.descuento.replace(',', '.')) || 0,
          tarifa: Number(linea.tarifa.replace(',', '.')) || 0,
        })),
      });
      setDirectoryMessage({ type: 'success', text: `${result.mensaje} ${result.numeroComprobante ?? ''}`.trim() });
      clearLiquidacionForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar la liquidacion.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingLiquidacion(false);
    }
  };

  const sendLiquidacionCorreo = async (liquidacion: LiquidacionCompraListItem) => {
    if (!catalogUserId) return;
    try {
      await enviarLiquidacionCompraCorreo(catalogUserId, liquidacion.codLiquidacion);
      setDirectoryMessage({ type: 'success', text: 'Correo enviado correctamente.' });
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo enviar el correo.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const updateGuiaForm = (field: keyof GuiaRemisionFormState, value: string | boolean) => {
    setGuiaForm((current) => ({ ...current, [field]: value }));
  };

  const searchGuiaTransportistas = async () => {
    if (!catalogUserId || !guiaForm.transportistaBusqueda.trim()) return;
    setLoadingGuias(true);
    setDirectoryMessage(null);
    try {
      setGuiaTransportistas(await buscarGuiaTransportistas(catalogUserId, guiaForm.transportistaBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar transportistas.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingGuias(false);
    }
  };

  const searchGuiaClientes = async () => {
    if (!catalogUserId || !guiaForm.clienteBusquedaGuia.trim()) return;
    setLoadingGuias(true);
    setDirectoryMessage(null);
    try {
      setGuiaClientes(await buscarGuiaClientes(catalogUserId, guiaForm.clienteBusquedaGuia));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar clientes.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingGuias(false);
    }
  };

  const searchGuiaFacturas = async () => {
    if (!catalogUserId || !guiaForm.facturaBusqueda.trim()) return;
    setLoadingGuias(true);
    setDirectoryMessage(null);
    try {
      setGuiaFacturas(await buscarGuiaFacturas(catalogUserId, guiaForm.facturaBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar facturas.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingGuias(false);
    }
  };

  const searchGuiaProductos = async () => {
    if (!catalogUserId || !guiaForm.productoBusqueda.trim()) return;
    setLoadingGuias(true);
    setDirectoryMessage(null);
    try {
      setGuiaProductos(await buscarGuiaProductos(catalogUserId, guiaForm.productoBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar productos.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingGuias(false);
    }
  };

  const selectGuiaTransportista = (transportista: Cliente) => {
    setGuiaTransportista(transportista);
    setGuiaTransportistas([]);
    setGuiaForm((current) => ({ ...current, transportistaBusqueda: getClienteDisplayName(transportista) }));
  };

  const selectGuiaCliente = (cliente: Cliente) => {
    setGuiaCliente(cliente);
    setGuiaClientes([]);
    setGuiaForm((current) => ({ ...current, clienteBusquedaGuia: getClienteDisplayName(cliente) }));
  };

  const selectGuiaFactura = (factura: FacturaListItem) => {
    setGuiaFactura(factura);
    setGuiaFacturas([]);
    setGuiaForm((current) => ({ ...current, facturaBusqueda: factura.numeroCompleto ?? factura.numfactura ?? '', clienteBusquedaGuia: factura.cliente ?? current.clienteBusquedaGuia }));
    if (!guiaCliente && factura.cliente) {
      setGuiaCliente({ codcliente: 0, nombrerazonsocial: factura.cliente, numeroidentificacion: factura.identificacionCliente });
    }
  };

  const addGuiaProducto = (producto: FacturaProducto) => {
    setGuiaDetalles((current) => [...current, { producto, cantidad: '1' }]);
    setGuiaProductos([]);
    setGuiaForm((current) => ({ ...current, productoBusqueda: '' }));
  };

  const updateGuiaDetalle = (index: number, value: string) => {
    setGuiaDetalles((current) => current.map((detalle, currentIndex) => currentIndex === index ? { ...detalle, cantidad: value } : detalle));
  };

  const removeGuiaDetalle = (index: number) => {
    setGuiaDetalles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const clearGuiaForm = () => {
    setGuiaForm(initialGuiaRemisionForm);
    setGuiaTransportista(null);
    setGuiaCliente(null);
    setGuiaFactura(null);
    setGuiaTransportistas([]);
    setGuiaClientes([]);
    setGuiaFacturas([]);
    setGuiaProductos([]);
    setGuiaDetalles([]);
    setDirectoryMessage(null);
  };

  const saveNuevaGuia = async () => {
    if (!catalogUserId) return;
    if (!guiaTransportista) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona un transportista para la guia.' });
      return;
    }
    if (guiaDetalles.length === 0) {
      setDirectoryMessage({ type: 'error', text: 'Agrega al menos un detalle de traslado.' });
      return;
    }
    setSavingGuia(true);
    setDirectoryMessage(null);
    try {
      const result = await guardarGuiaRemision({
        idUsuario: catalogUserId,
        transportista: guiaTransportista,
        destinatario: guiaCliente,
        factura: guiaFactura,
        serie: guiaForm.serie,
        codemisor: guiaPreparacion?.series?.[0]?.codemisor ?? guiaPreparacion?.caja?.codemisor,
        placa: guiaForm.placa,
        contribuyenteEspecial: guiaForm.contribuyenteEspecial,
        obligadoContabilidad: guiaForm.transportistaObligadoContabilidad,
        fechaEmision: guiaForm.fechaEmision,
        fechaInicioTraslado: guiaForm.fechaInicioTraslado,
        fechaFinTraslado: guiaForm.fechaFinTraslado,
        detalle: guiaForm.referencia,
        direccionOrigen: guiaForm.direccionOrigen,
        puntoEmision: guiaForm.serie,
        detalles: guiaDetalles.map((detalle) => ({ producto: detalle.producto, cantidad: Number(detalle.cantidad.replace(',', '.')) || 0 })),
      });
      setDirectoryMessage({ type: 'success', text: `${result.mensaje} ${result.numeroComprobante ?? ''}`.trim() });
      clearGuiaForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar la guia de remision.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setSavingGuia(false);
    }
  };

  const sendGuiaCorreo = async (guia: GuiaRemisionListItem) => {
    if (!catalogUserId) return;
    try {
      await enviarGuiaRemisionCorreo(catalogUserId, guia.codGuia);
      setDirectoryMessage({ type: 'success', text: 'Correo enviado correctamente.' });
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo enviar el correo.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const sendRetencionCorreo = async (retencion: RetencionListItem) => {
    if (!catalogUserId) return;
    try {
      await enviarRetencionCorreo(catalogUserId, retencion.codRetencion);
      setDirectoryMessage({ type: 'success', text: 'Correo enviado correctamente.' });
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo enviar el correo.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const modules: MobileModule[] = EFACT_MODULES.map((module) => {
    const count =
      module.view === 'clientes'
        ? clientes.length
        : module.view === 'productos'
          ? productos.length
            : module.view === 'categorias'
              ? categorias.length + subcategorias.length
              : module.view === 'mis-facturas'
                ? facturasList.length
                : module.view === 'nueva-factura'
                  ? facturaLineas.length
                  : module.view === 'mis-notas-credito'
                    ? notasCreditoList.length
                    : module.view === 'nueva-nota-credito'
                      ? notaCreditoLineas.length
                      : module.view === 'mis-notas-debito'
                        ? notasDebitoList.length
                        : module.view === 'nueva-nota-debito'
                          ? notaDebitoLineas.length
                          : module.view === 'mis-liquidaciones-compra'
                            ? liquidacionesList.length
                            : module.view === 'nueva-liquidacion-compra'
                              ? liquidacionLineas.length
                              : module.view === 'mis-guias-remision'
                                ? guiasList.length
                                : module.view === 'nueva-guia-remision'
                                  ? guiaDetalles.length
                                  : module.view === 'retenciones'
                                    ? retencionesList.length
            : module.view === 'emisor'
              ? emisores.length
              : module.view === 'firma'
                ? emisores.filter(hasFirmaConfigured).length
                : module.view === 'perfil'
                  ? perfilData?.perfil ? 1 : 0
                  : module.view === 'punto-emision'
                    ? puntosData?.cajas.length ?? 0
                    : getOperationalModuleSlug(module.view)
                      ? operationalCounts[module.view]
                : undefined;

    return {
      ...module,
      count,
      enabled: [
        'clientes',
        'productos',
        'categorias',
        'nueva-factura',
        'mis-facturas',
        'nueva-nota-credito',
        'mis-notas-credito',
        'nueva-nota-debito',
        'mis-notas-debito',
        'nueva-liquidacion-compra',
        'mis-liquidaciones-compra',
        'nueva-guia-remision',
        'mis-guias-remision',
        'retenciones',
        'emisor',
        'firma',
        'perfil',
        'punto-emision',
        'cuentas-cobrar',
        'estado-cuenta',
        'comprar-documentos',
         'reporte-documentos',
         'recargas',
         'centro-normativo',
         'bot',
      ].includes(module.view),
    };
  });

  const openView = (view: WorkspaceView) => {
    setMenuOpen(false);
    setSearch('');

    if (view === 'portal' && canUsePortal) {
      setActiveView(view);
      return;
    }

    if (view === 'dashboard' && canUseEfact) {
      setActiveView(view);
      return;
    }

    if (view === 'nuevo-cliente' && authorizedViews.has('clientes')) {
      setActiveView(view);
      return;
    }

    if (view === 'nuevo-producto' && authorizedViews.has('productos')) {
      setActiveView(view);
      return;
    }

    if (view === 'bot' && canUseEfact) {
      setActiveView(view);
      return;
    }

    if (authorizedViews.has(view)) {
      setActiveView(view);
      return;
    }

    setActiveView('no-autorizado');
  };

  useEffect(() => {
    if (!menuOpen) {
      drawerProgress.setValue(0);
      return;
    }

    Animated.timing(drawerProgress, {
      toValue: 1,
      duration: reduceMotion ? 0 : 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [drawerProgress, menuOpen, reduceMotion]);

  const toggleMenuSection = (key: string) => {
    setExpandedMenus((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const hasActiveEmisor = emisores.some((emisor) => emisor.estado !== false);
  const hasConfiguredFirma = emisores.some(hasFirmaConfigured);
  const moduleByView = new Map<WorkspaceView, MobileModule>(modules.map((module) => [module.view, module]));
  const menuNode = (view: WorkspaceView, label?: string): DrawerMenuNode => {
    const module = moduleByView.get(view);
    return {
      key: `${view}-${label ?? module?.title ?? getWorkspaceTitle(view)}`,
      label: label ?? module?.title ?? getWorkspaceTitle(view),
      view,
      count: module?.count,
      disabled: module ? !module.enabled : !authorizedViews.has(view),
    };
  };
  const drawerMenu: DrawerMenuNode[] = [
    { key: 'dashboard', label: 'Inicio', view: 'dashboard', disabled: !canUseEfact },
    {
      ...menuNode('clientes', 'Clientes / Proveedores'),
      children: [
        {
          key: 'nuevo-cliente',
          label: 'Nuevo cliente',
          view: 'nuevo-cliente',
          disabled: !authorizedViews.has('clientes'),
        },
      ],
    },
    {
      key: 'facturas',
      label: 'Facturas',
      children: [
        menuNode('nueva-factura', 'Nueva Factura'),
        menuNode('mis-facturas', 'Mis Facturas'),
      ],
    },
    {
      key: 'otros-documentos',
      label: 'Emision de otros Documentos',
      children: [
        menuNode('nueva-guia-remision', 'Guia de Remision'),
        menuNode('nueva-liquidacion-compra', 'Liquidacion de Compra'),
        menuNode('nueva-nota-credito', 'Nota de Credito'),
        menuNode('nueva-nota-debito', 'Nota de Debito'),
      ],
    },
    {
      key: 'cuentas-cobrar',
      label: 'Cuentas Por Cobrar',
      view: 'cuentas-cobrar',
      count: operationalCounts['cuentas-cobrar'],
      disabled: !authorizedViews.has('cuentas-cobrar'),
      children: [menuNode('estado-cuenta', 'Estado de cuenta')],
    },
    {
      key: 'productos',
      label: 'Productos',
      view: 'productos',
      count: productos.length,
      disabled: !authorizedViews.has('productos'),
      children: [
        {
          key: 'nuevo-producto',
          label: 'Nuevo producto',
          view: 'nuevo-producto',
          disabled: !authorizedViews.has('productos'),
        },
        menuNode('categorias', 'Categorias'),
      ],
    },
    {
      key: 'recargas',
      label: 'Recargas',
      view: 'comprar-documentos',
      count: operationalCounts.recargas,
      disabled: !authorizedViews.has('recargas'),
      children: [menuNode('recargas', 'Mis recargas')],
    },
    menuNode('reporte-documentos', 'Reporte documentos'),
    {
      key: 'documentos-generados',
      label: 'Documentos Generados',
      children: [
        menuNode('mis-notas-credito', 'Mis Notas de Credito'),
        menuNode('retenciones', 'Mis Retenciones'),
        menuNode('mis-guias-remision', 'Mis Guias de Remision'),
        menuNode('mis-liquidaciones-compra', 'Mis Liquidaciones Compras'),
        menuNode('mis-notas-debito', 'Mis Notas de Debito'),
      ],
    },
    {
      key: 'configuracion',
      label: 'Configuracion',
      children: [
        menuNode('emisor', 'Emisor'),
        menuNode('perfil', 'Mi Perfil'),
        menuNode('punto-emision', 'Pto. Emision'),
        menuNode('centro-normativo', 'Centro normativo'),
        menuNode('firma', 'Firma'),
        menuNode('e-rubrica', 'E-Rúbrica'),
      ],
    },
  ];
  const renderDrawerNode = (node: DrawerMenuNode, inset = false) => {
    const active = node.view === activeView || Boolean(node.children?.some((child) => child.view === activeView));
    const enabledChildren = node.children?.filter((child) => !child.disabled) ?? [];
    const disabled = node.disabled && enabledChildren.length === 0;
    const hasChildren = Boolean(node.children?.length);
    const expanded = hasChildren && (expandedMenus.has(node.key) || active);

    return (
      <View key={node.key} style={node.children?.length ? styles.menuSection : undefined}>
        <MenuItem
          active={active}
          count={node.count}
          disabled={disabled}
          expanded={expanded}
          hasChildren={hasChildren}
          inset={inset}
          label={node.label}
          onToggle={() => toggleMenuSection(node.key)}
          onPress={() => {
            if (hasChildren && !node.view) {
              toggleMenuSection(node.key);
              return;
            }
            if (node.view && !disabled) openView(node.view);
          }}
        />
        {expanded ? (
          <View style={styles.menuChildren}>
            {node.children?.map((child) => renderDrawerNode(child, true))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.workspaceSafeArea, activeView === 'portal' && styles.portalSafeArea]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.workspaceCanvasWithBottomNav, { paddingBottom: 88 + insets.bottom }]} keyboardShouldPersistTaps="handled">
        {activeView === 'portal' ? (
          <View style={styles.dashboardHeader}>
            <View style={styles.dashboardBrandBlock}>
              <PortalHeaderAvatar />
              <View style={styles.dashboardBrandText}>
                <Text style={styles.dashboardBrandTitle}>{getWorkspaceTitle(activeView)}</Text>
              </View>
            </View>
            <View style={styles.dashboardHeaderActions}>
              <Pressable style={styles.dashboardIconButton} onPress={() => setNotificationsOpen(true)}>
                <MaterialCommunityIcons name="bell-outline" size={22} color="#FFFFFF" />
                {unreadNotifications > 0 ? <View style={styles.dashboardNotificationDot} /> : null}
              </Pressable>
              <Pressable style={styles.dashboardIconButton} onPress={() => setMenuOpen(true)}>
                <MaterialCommunityIcons name="menu" size={25} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : activeView === 'dashboard' ? (
          <View style={styles.dashboardHeader}>
            <View style={styles.dashboardBrandBlock}>
              <PortalHeaderAvatar />
              <View style={styles.dashboardBrandText}>
                <Text style={styles.dashboardBrandTitle}>{getWorkspaceTitle(activeView)}</Text>
              </View>
            </View>
            <View style={styles.dashboardHeaderActions}>
              <Pressable style={styles.dashboardIconButton} onPress={() => setNotificationsOpen(true)}>
                <MaterialCommunityIcons name="bell-outline" size={22} color="#FFFFFF" />
                {unreadNotifications > 0 ? <View style={styles.dashboardNotificationDot} /> : null}
              </Pressable>
              <Pressable style={styles.dashboardIconButton} onPress={() => setMenuOpen(true)}>
                <MaterialCommunityIcons name="menu" size={25} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.workspaceHeader}>
            <View style={styles.workspaceBrand}>
              <BrandMark />
              <View style={styles.workspaceBrandText}>
                <Text style={styles.workspaceTitle}>{getWorkspaceTitle(activeView)}</Text>
              </View>
            </View>
            <View style={styles.workspaceHeaderActions}>
              <Pressable style={styles.menuButton} onPress={() => setNotificationsOpen(true)}>
                <MaterialCommunityIcons name="bell-outline" size={22} color="#FFFFFF" />
                {unreadNotifications > 0 ? <View style={styles.dashboardNotificationDot} /> : null}
              </Pressable>
              <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
                <Text style={styles.menuButtonIcon}>☰</Text>
              </Pressable>
            </View>
          </View>
        )}

        <ScreenTransition key={activeView}>
        {menuMessage ? <MessageBox message={menuMessage} /> : null}

        {loadingMenus ? (
          <View style={styles.directoryLoading}>
            <ActivityIndicator color="#0072BD" />
            <Text style={styles.mutedText}>Cargando menus autorizados...</Text>
          </View>
        ) : null}

        {!loadingMenus && activeView === 'portal' ? (
          <View style={styles.portalStack}>
            <View style={styles.portalShowcase}>
              <View style={styles.portalShowcaseIcon}>
                <MaterialCommunityIcons name="view-dashboard-outline" size={26} color="#FFFFFF" />
              </View>
              <View style={styles.portalShowcaseCopy}>
                <Text style={styles.portalShowcaseTitle}>Servicios Numerica</Text>
                <Text style={styles.portalShowcaseText}>Accede a tus herramientas operativas desde un panel limpio y directo.</Text>
              </View>
            </View>
            <View style={styles.portalSectionHeader}>
              <View style={styles.portalSectionTitleWrap}>
                <Text style={styles.portalSectionTitle}>Mis servicios</Text>
              </View>
            </View>

            <View style={styles.portalServiceList}>
              <PortalServiceCard
                title="E-FACT"
                description="Facturacion electronica movil segun menus asignados."
                enabled={canUseEfact}
                onPress={() => openView('dashboard')}
                index={0}
              />
              {services
                .filter((service) => normalizeText(service.codigo ?? service.nombre) !== 'e-fact')
                .map((service, index) => (
                  <PortalServiceCard
                    key={`${service.codigo ?? service.nombre ?? 'servicio'}-${index}`}
                    title={getServiceDisplayName(service)}
                    description={isERubricaService(service) || getServiceDisplayName(service) === 'E-RÚBRICA' ? 'Firma, valida y comparte documentos desde el móvil.' : 'Acceso preparado para una siguiente version movil.'}
                    enabled={isERubricaService(service) || getServiceDisplayName(service) === 'E-RÚBRICA'}
                    onPress={() => (isERubricaService(service) || getServiceDisplayName(service) === 'E-RÚBRICA') && openView('e-rubrica')}
                    index={index + 1}
                  />
                ))}
              {!services.some(isERubricaService) ? (
                <PortalServiceCard
                  title="E-RÚBRICA"
                  description="Firma, valida y comparte documentos desde el móvil."
                  enabled={true}
                  onPress={() => openView('e-rubrica')}
                  index={services.length + 1}
                />
              ) : null}
            </View>
          </View>
        ) : null}

        {!loadingMenus && activeView === 'no-autorizado' ? (
          <EmptyState
            title="No autorizado"
            text="Tu usuario no tiene permisos suficientes para acceder a esta ruta desde la app movil."
          />
        ) : null}

        {!loadingMenus && activeView === 'dashboard' ? (
          <DashboardHomeScreen
            clientesCount={clientes.length}
            productosCount={productos.length}
            facturas={facturasList}
            modules={modules}
            onOpenView={openView}
          />
        ) : null}

        {!loadingMenus && activeView === 'e-rubrica' ? (
          <ERubricaMobileScreen
            data={erubricaData}
            initialPdf={erubricaInitialPdf}
            loading={loadingErubrica}
            message={directoryMessage}
            onRefresh={() => setReloadKey((value) => value + 1)}
            onSync={async () => {
              try {
                await sincronizarERubricaPendientes();
                setDirectoryMessage({ type: 'success', text: 'Solicitudes pendientes sincronizadas.' });
                setReloadKey((value) => value + 1);
              } catch (error) {
                setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo sincronizar E-Rúbrica.' });
              }
            }}
          />
        ) : null}

        {!loadingMenus && activeView !== 'portal' && activeView !== 'dashboard' && activeView !== 'e-rubrica' && activeView !== 'no-autorizado' ? (
           <View style={[styles.directoryCard, activeView === 'clientes' && styles.clientDirectoryCard]}>
             {activeView === 'nuevo-cliente' ? (
               <ClienteForm
                 form={clienteForm}
                 mode={clienteFormMode ?? 'create'}
                 saving={savingCliente}
                 lookups={clienteLookups}
                 provincias={provincias}
                 ciudades={ciudades}
                 loadingLookups={loadingClienteLookups}
                 onCancel={closeClienteForm}
                 onChange={updateClienteForm}
                 onReset={() => setClienteForm(initialClienteForm)}
                 onSave={saveCliente}
               />
             ) : activeView === 'bot' ? (
               <EfactBotScreen userName={portalFirstName} />
             ) : activeView === 'clientes' ? (
               <>
                 <DirectoryHero
                   eyebrow="TU CARTERA COMERCIAL"
                   title="Clientes"
                   subtitle="Personas y empresas en un solo lugar"
                   icon="account-group-outline"
                   metrics={[
                     { value: clientes.length, label: 'Clientes' },
                     { value: clientesActivos, label: 'Activos' },
                     { value: clientesProveedores, label: 'Proveedores' },
                   ]}
                   onCreate={openNewCliente}
                   createLabel="Nuevo cliente"
                 />
                 <View style={styles.clientToolsPanel}>
                   <View style={styles.clientToolsHeader}>
                     <View>
                       <Text style={styles.clientToolsEyebrow}>Filtros</Text>
                       <Text style={styles.clientToolsTitle}>Clientes registrados</Text>
                     </View>
                     <Pressable style={styles.clientFilterResetButton} onPress={() => { setClienteTipoFiltro('todos'); setClienteProveedorFiltro('todos'); setSearch(''); }}>
                       <MaterialCommunityIcons name="filter-remove-outline" size={17} color="#00649D" />
                       <Text style={styles.clientFilterClear}>Limpiar</Text>
                     </Pressable>
                   </View>
                   <View style={styles.clientSearchBar}>
                     <MaterialCommunityIcons name="magnify" size={21} color="#0072BD" />
                     <TextInput
                       accessibilityLabel="Buscar clientes"
                       autoCapitalize="none"
                       autoCorrect={false}
                       placeholder="Nombre, RUC, correo..."
                       placeholderTextColor="#8191A2"
                       style={styles.clientSearchInput}
                       value={search}
                       onChangeText={setSearch}
                     />
                     {search ? (
                       <Pressable accessibilityLabel="Limpiar busqueda" hitSlop={8} onPress={() => setSearch('')}>
                         <MaterialCommunityIcons name="close-circle" size={19} color="#8AA0B2" />
                       </Pressable>
                     ) : null}
                     <View style={styles.clientSearchCount}>
                       <Text style={styles.clientSearchCountText}>{filteredClientes.length}</Text>
                     </View>
                   </View>
                   <View style={styles.clientFilterPanel}>
                     <View style={styles.clientFilterLine}>
                       <Text style={styles.clientFilterLabel}>Perfil</Text>
                     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clientFilterRow}>
                      {([['todos', 'Todos'], ['personas', 'Persona Natural'], ['empresas', 'Persona Juridica'], ['proveedores', 'Proveedores']] as const).map(([value, label]) => {
                        const active = value === 'proveedores' ? clienteProveedorFiltro === 'proveedores' : clienteTipoFiltro === value;
                        return (
                          <Pressable key={value} style={[styles.clientFilterChip, active && styles.clientFilterChipActive]} onPress={() => value === 'proveedores' ? setClienteProveedorFiltro(active ? 'todos' : 'proveedores') : setClienteTipoFiltro(value as 'todos' | 'personas' | 'empresas')}>
                            <Text style={[styles.clientFilterChipText, active && styles.clientFilterChipTextActive]}>{label}</Text>
                          </Pressable>
                        );
                       })}
                     </ScrollView>
                     </View>
                   </View>
                 </View>
                {directoryMessage ? <MessageBox message={directoryMessage} /> : null}
                {loadingClientes ? (
                  <View style={styles.directoryLoading}>
                    <ActivityIndicator color="#0072BD" />
                    <Text style={styles.mutedText}>Cargando clientes...</Text>
                  </View>
                ) : null}
                {!loadingClientes && filteredClientes.length === 0 ? (
                  <EmptyState title={search ? 'Sin coincidencias' : 'Sin clientes para mostrar'} text={search ? 'Prueba con otro nombre, identificacion o correo.' : 'Cuando existan registros, apareceran aqui.'} />
                ) : null}
                <View style={styles.clientListPanel}>
                  <View style={styles.clientListHeader}>
                    <View>
                      <Text style={styles.clientListEyebrow}>Listado</Text>
                      <Text style={styles.clientListTitle}>Clientes registrados</Text>
                    </View>
                    <View style={styles.clientListActions}>
                      <Pressable
                        style={[styles.clientFilterResetButton, styles.clientExportButton]}
                        onPress={() => exportRowsToCsv('clientes.csv', filteredClientes.map((cliente) => ({
                          Identificacion: cliente.numeroidentificacion,
                          Nombre: getClienteDisplayName(cliente),
                          Tipo: getTipoClienteLabel(cliente.tipoCliente, clienteLookups),
                          Correo: getClienteEmail(cliente),
                          Telefono: cliente.celular || cliente.telefonoconvencional || '',
                          Proveedor: cliente.esProveedor ? 'Si' : 'No',
                          Estado: cliente.estado === false ? 'Inactivo' : 'Activo',
                        })))}
                      >
                        <MaterialCommunityIcons name="file-excel-outline" size={17} color="#128A46" />
                        <Text style={[styles.clientFilterClear, styles.clientExportText]}>Exportar listado</Text>
                      </Pressable>
                      <Text style={styles.clientListCount}>{filteredClientes.length}</Text>
                    </View>
                  </View>
                  <ResultCollection
                    items={filteredClientes}
                    variant="plain"
                    resetKey={`${search}-${clienteTipoFiltro}-${clienteProveedorFiltro}`}
                    pageSize={8}
                    keyExtractor={(cliente, index) => `cliente-${cliente.codcliente}-${cliente.numeroidentificacion ?? index}`}
                    renderItem={(cliente) => (
                      <ClienteCard
                        cliente={cliente}
                        tipoClienteLabel={getTipoClienteLabel(cliente.tipoCliente, clienteLookups)}
                        stats={getClienteFacturaStats(cliente, facturasList)}
                        onView={() => setViewingCliente(cliente)}
                        onEdit={() => openEditCliente(cliente)}
                        onDelete={() => confirmDeleteCliente(cliente)}
                      />
                    )}
                  />
                </View>
              </>
            ) : null}

             {activeView === 'nuevo-producto' ? (
               <ProductoForm
                 form={productoForm}
                 mode={productoFormMode ?? 'create'}
                 saving={savingProducto}
                 lookups={productoLookups}
                 subcategorias={subcategoriasProducto}
                 loadingLookups={loadingProductoLookups || loadingProductoDetail}
                 onCancel={closeProductoForm}
                 onChange={updateProductoForm}
                 onReset={() => setProductoForm(initialProductoForm)}
                 onSave={saveProducto}
               />
             ) : activeView === 'productos' ? (
              <>
                <DirectoryHero
                  eyebrow="CATALOGO COMERCIAL"
                  title="Productos"
                  subtitle="Productos y servicios listos para facturar"
                  icon="package-variant-closed"
                  metrics={[
                    { value: productos.length, label: 'Registros' },
                    { value: productos.filter((producto) => producto.tipo === 'PRODUCTO').length, label: 'Productos' },
                    { value: productos.filter((producto) => producto.tipo === 'SERVICIO').length, label: 'Servicios' },
                  ]}
                  onCreate={openNewProducto}
                  createLabel="Nuevo producto"
                />
                <View style={styles.clientToolsPanel}>
                  <View style={styles.clientToolsHeader}>
                    <View>
                      <Text style={styles.clientToolsEyebrow}>Filtros</Text>
                      <Text style={styles.clientToolsTitle}>Productos registrados</Text>
                    </View>
                    <Pressable
                      style={styles.clientFilterResetButton}
                      onPress={() => {
                        setProductoTipoFiltro('todos');
                        setProductoCategoriaFiltro(null);
                        setProductoSubcategoriaFiltro(null);
                      }}
                    >
                      <MaterialCommunityIcons name="filter-remove-outline" size={17} color="#00649D" />
                      <Text style={styles.clientFilterClear}>Limpiar</Text>
                    </Pressable>
                  </View>
                  <View style={styles.clientFilterPanel}>
                    <View style={styles.clientFilterLine}>
                      <Text style={styles.clientFilterLabel}>Tipo</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clientFilterRow}>
                        {([['todos', 'Todos'], ['PRODUCTO', 'Productos'], ['SERVICIO', 'Servicios']] as const).map(([value, label]) => {
                          const active = productoTipoFiltro === value;
                          return (
                            <Pressable key={value} style={[styles.clientFilterChip, active && styles.clientFilterChipActive]} onPress={() => setProductoTipoFiltro(value as 'todos' | ProductoTipo)}>
                              <Text style={[styles.clientFilterChipText, active && styles.clientFilterChipTextActive]}>{label}</Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>
                    <View style={styles.clientFilterLine}>
                      <Text style={styles.clientFilterLabel}>Categoria</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clientFilterRow}>
                        <Pressable style={[styles.clientFilterChip, productoCategoriaFiltro === null && styles.clientFilterChipActive]} onPress={() => { setProductoCategoriaFiltro(null); setProductoSubcategoriaFiltro(null); }}>
                          <Text style={[styles.clientFilterChipText, productoCategoriaFiltro === null && styles.clientFilterChipTextActive]}>Todas</Text>
                        </Pressable>
                        {productoCategoriasFiltro.map((categoria) => {
                          const active = productoCategoriaFiltro === categoria.id;
                          return (
                            <Pressable key={`producto-categoria-${categoria.id}`} style={[styles.clientFilterChip, active && styles.clientFilterChipActive]} onPress={() => { setProductoCategoriaFiltro(categoria.id); setProductoSubcategoriaFiltro(null); }}>
                              <Text style={[styles.clientFilterChipText, active && styles.clientFilterChipTextActive]} numberOfLines={1}>{categoria.label}</Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>
                    <View style={styles.clientFilterLine}>
                      <Text style={styles.clientFilterLabel}>Subcategoria</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clientFilterRow}>
                        <Pressable style={[styles.clientFilterChip, productoSubcategoriaFiltro === null && styles.clientFilterChipActive]} onPress={() => setProductoSubcategoriaFiltro(null)}>
                          <Text style={[styles.clientFilterChipText, productoSubcategoriaFiltro === null && styles.clientFilterChipTextActive]}>Todas</Text>
                        </Pressable>
                        {productoSubcategoriasFiltro.map((subcategoria) => {
                          const active = productoSubcategoriaFiltro === subcategoria.id;
                          return (
                            <Pressable key={`producto-subcategoria-${subcategoria.id}`} style={[styles.clientFilterChip, active && styles.clientFilterChipActive]} onPress={() => setProductoSubcategoriaFiltro(subcategoria.id)}>
                              <Text style={[styles.clientFilterChipText, active && styles.clientFilterChipTextActive]} numberOfLines={1}>{subcategoria.label}</Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>
                  </View>
                </View>
                {directoryMessage ? <MessageBox message={directoryMessage} /> : null}
                {loadingProductos ? (
                  <View style={styles.directoryLoading}>
                    <ActivityIndicator color="#0072BD" />
                    <Text style={styles.mutedText}>Cargando productos...</Text>
                  </View>
                ) : null}
                {!loadingProductos && filteredProductos.length === 0 ? (
                  <EmptyState title="Sin productos para mostrar" text="Prueba con otra categoria, subcategoria o tipo." />
                ) : null}
                <View style={styles.clientListPanel}>
                  <View style={styles.clientListHeader}>
                    <View>
                      <Text style={styles.clientListEyebrow}>Listado</Text>
                      <Text style={styles.clientListTitle}>Productos y servicios</Text>
                    </View>
                    <View style={styles.clientListActions}>
                      <Pressable
                        style={[styles.clientFilterResetButton, styles.clientExportButton]}
                        onPress={() => exportRowsToCsv('productos.csv', filteredProductos.map((producto) => ({
                          Codigo: producto.codigo || producto.codproducto,
                          Nombre: producto.nombre,
                          Tipo: producto.tipo,
                          Categoria: producto.categoriaDescripcion,
                          Subcategoria: producto.subcategoriaDescripcion,
                          Tarifa: producto.tarifaDescripcion,
                          Precio: producto.precioBase,
                        })))}
                      >
                        <MaterialCommunityIcons name="file-excel-outline" size={17} color="#128A46" />
                        <Text style={[styles.clientFilterClear, styles.clientExportText]}>Exportar listado</Text>
                      </Pressable>
                      <Text style={styles.clientListCount}>{filteredProductos.length}</Text>
                    </View>
                  </View>
                  <ResultCollection
                    items={filteredProductos}
                    variant="plain"
                    resetKey={`${productoTipoFiltro}-${productoCategoriaFiltro ?? 'todas'}-${productoSubcategoriaFiltro ?? 'todas'}`}
                    keyExtractor={(producto, index) => `producto-${producto.codproducto}-${producto.codigo ?? producto.nombre}-${index}`}
                    renderItem={(producto) => (
                      <ProductoCard
                        producto={producto}
                        onView={() => setViewingProducto(producto)}
                        onEdit={() => openEditProducto(producto)}
                        onDelete={() => confirmDeleteProducto(producto)}
                      />
                    )}
                  />
                </View>
              </>
            ) : null}

            {activeView === 'categorias' ? (
              <>
                <DirectoryHero
                  eyebrow="CLASIFICACION"
                  title={categoriaTab === 'categorias' ? 'Categorias' : 'Subcategorias'}
                  subtitle="Ordena tu catalogo para facturar mas rapido"
                  icon="shape-outline"
                  metrics={[
                    { value: categorias.length, label: 'Categorias' },
                    { value: subcategorias.length, label: 'Subcategorias' },
                    { value: categoriaTab === 'categorias' ? filteredCategorias.length : filteredSubcategorias.length, label: 'Filtrados' },
                  ]}
                  onCreate={categoriaTab === 'categorias' ? openNewCategoria : openNewSubcategoria}
                  createLabel={categoriaTab === 'categorias' ? 'Nueva categoria' : 'Nueva subcategoria'}
                />
                <View style={styles.clientToolsPanel}>
                  <View style={styles.clientToolsHeader}>
                    <View>
                      <Text style={styles.clientToolsEyebrow}>Catalogo</Text>
                      <Text style={styles.clientToolsTitle}>Categorias y subcategorias</Text>
                    </View>
                  </View>
                  <View style={styles.directoryTabs}>
                    <DirectoryTabButton active={categoriaTab === 'categorias'} label="Categorias" onPress={() => setCategoriaTab('categorias')} />
                    <DirectoryTabButton active={categoriaTab === 'subcategorias'} label="Subcategorias" onPress={() => setCategoriaTab('subcategorias')} />
                  </View>
                  <SearchField
                    label={categoriaTab === 'categorias' ? 'Buscar categorias' : 'Buscar subcategorias'}
                    placeholder="Escribe una descripcion"
                    value={search}
                    onChangeText={setSearch}
                    resultCount={categoriaTab === 'categorias' ? filteredCategorias.length : filteredSubcategorias.length}
                    totalCount={categoriaTab === 'categorias' ? categorias.length : subcategorias.length}
                  />
                </View>
                {categoriaTab === 'categorias' && categoriaFormMode ? (
                  <CategoriaForm
                    form={categoriaForm}
                    mode={categoriaFormMode}
                    saving={savingCategoria}
                    onCancel={closeCategoriaForm}
                    onChange={updateCategoriaForm}
                    onReset={() => setCategoriaForm(initialCategoriaForm)}
                    onSave={saveCategoria}
                  />
                ) : null}
                {categoriaTab === 'subcategorias' && subcategoriaFormMode ? (
                  <SubcategoriaForm
                    form={subcategoriaForm}
                    mode={subcategoriaFormMode}
                    saving={savingCategoria}
                    categorias={categorias}
                    onCancel={closeSubcategoriaForm}
                    onChange={updateSubcategoriaForm}
                    onReset={() => setSubcategoriaForm(initialSubcategoriaForm)}
                    onSave={saveSubcategoria}
                  />
                ) : null}
                {directoryMessage ? <MessageBox message={directoryMessage} /> : null}
                {loadingCategorias ? (
                  <View style={styles.directoryLoading}>
                    <ActivityIndicator color="#0072BD" />
                    <Text style={styles.mutedText}>Cargando categorias...</Text>
                  </View>
                ) : null}
                {!loadingCategorias && categoriaTab === 'categorias' && filteredCategorias.length === 0 ? (
                  <EmptyState title="Sin categorias para mostrar" text="Cuando existan registros, apareceran aqui." />
                ) : null}
                {!loadingCategorias && categoriaTab === 'subcategorias' && filteredSubcategorias.length === 0 ? (
                  <EmptyState title="Sin subcategorias para mostrar" text="No es obligatorio crear subcategorias." />
                ) : null}
                {categoriaTab === 'categorias' ? (
                  <View style={styles.clientListPanel}>
                    <View style={styles.clientListHeader}>
                      <View>
                        <Text style={styles.clientListEyebrow}>Listado</Text>
                        <Text style={styles.clientListTitle}>Categorias</Text>
                      </View>
                      <Text style={styles.clientListCount}>{filteredCategorias.length}</Text>
                    </View>
                    <ResultCollection
                      items={filteredCategorias}
                      variant="plain"
                      resetKey={`${categoriaTab}-${search}`}
                      keyExtractor={(categoria, index) => `categoria-${categoria.idCategoria}-${categoria.descripcion}-${index}`}
                      renderItem={(categoria) => (
                          <CategoriaCard
                          categoria={categoria}
                          onView={() => setViewingCategoria(categoria)}
                          onEdit={() => openEditCategoria(categoria)}
                          onDelete={() => confirmDeleteCategoria(categoria)}
                        />
                      )}
                    />
                  </View>
                ) : (
                  <View style={styles.clientListPanel}>
                    <View style={styles.clientListHeader}>
                      <View>
                        <Text style={styles.clientListEyebrow}>Listado</Text>
                        <Text style={styles.clientListTitle}>Subcategorias</Text>
                      </View>
                      <Text style={styles.clientListCount}>{filteredSubcategorias.length}</Text>
                    </View>
                    <ResultCollection
                      items={filteredSubcategorias}
                      variant="plain"
                      resetKey={`${categoriaTab}-${search}`}
                      keyExtractor={(subcategoria, index) => `subcategoria-${subcategoria.idSubcategoria}-${subcategoria.descripcion}-${index}`}
                      renderItem={(subcategoria) => (
                          <SubcategoriaCard
                            subcategoria={subcategoria}
                            categoriaDescripcion={
                              subcategoria.categoriaDescripcion ??
                              categorias.find((categoria) => categoria.idCategoria === subcategoria.idCategoria)?.descripcion
                            }
                            onView={() => setViewingSubcategoria(subcategoria)}
                            onEdit={() => openEditSubcategoria(subcategoria)}
                            onDelete={() => confirmDeleteSubcategoria(subcategoria)}
                          />
                      )}
                    />
                  </View>
                )}
              </>
            ) : null}

            {activeView === 'emisor' ? (
              <>
                <DirectoryHero
                  eyebrow="DATOS TRIBUTARIOS"
                  title="Emisor"
                  subtitle="Identidad fiscal para emitir comprobantes"
                  icon="domain"
                  metrics={[
                    { value: emisores.length, label: 'Emisores' },
                    { value: emisores.filter((emisor) => emisor.estado !== false).length, label: 'Activos' },
                    { value: emisores.filter(hasFirmaConfigured).length, label: 'Con firma' },
                  ]}
                  onCreate={!hasActiveEmisor ? openNewEmisor : undefined}
                  createLabel="Nuevo emisor"
                />
                <View style={styles.clientToolsPanel}>
                  <View style={styles.clientToolsHeader}>
                    <View>
                      <Text style={styles.clientToolsEyebrow}>Configuracion</Text>
                      <Text style={styles.clientToolsTitle}>Emisores registrados</Text>
                    </View>
                  </View>
                  <SearchField label="Buscar emisores" placeholder="Razon social, RUC, nombre comercial o correo" value={search} onChangeText={setSearch} resultCount={filteredEmisores.length} totalCount={emisores.length} />
                </View>
                {emisorFormMode ? (
                  <EmisorForm
                    form={emisorForm}
                    mode={emisorFormMode}
                    saving={savingEmisor}
                    onCancel={closeEmisorForm}
                    onChange={updateEmisorForm}
                    onReset={() => setEmisorForm(selectedEmisor ? emisorToForm(selectedEmisor) : initialEmisorForm)}
                    onSelectLogo={selectEmisorLogo}
                    onSave={saveEmisor}
                  />
                ) : null}
                {directoryMessage ? <MessageBox message={directoryMessage} /> : null}
                {loadingEmisores ? (
                  <View style={styles.directoryLoading}>
                    <ActivityIndicator color="#0072BD" />
                    <Text style={styles.mutedText}>Cargando emisores...</Text>
                  </View>
                ) : null}
                {!loadingEmisores && filteredEmisores.length === 0 ? (
                  <EmptyState title="Sin emisores para mostrar" text="Cuando existan registros, apareceran aqui." />
                ) : null}
                <View style={styles.clientListPanel}>
                  <View style={styles.clientListHeader}>
                    <View>
                      <Text style={styles.clientListEyebrow}>Listado</Text>
                      <Text style={styles.clientListTitle}>Emisores</Text>
                    </View>
                    <Text style={styles.clientListCount}>{filteredEmisores.length}</Text>
                  </View>
                  <ResultCollection
                    items={filteredEmisores}
                    variant="plain"
                    resetKey={search}
                    keyExtractor={(emisor, index) => `emisor-${emisor.codigo}-${emisor.ruc ?? index}`}
                    renderItem={(emisor) => (
                      <EmisorCard
                        emisor={emisor}
                        onView={() => setViewingEmisor(emisor)}
                        onEdit={() => openEditEmisor(emisor)}
                        onDelete={() => confirmDeleteEmisor(emisor)}
                      />
                    )}
                  />
                </View>
              </>
            ) : null}

            {activeView === 'firma' ? (
              <>
                <DirectoryHero
                  eyebrow="SEGURIDAD TRIBUTARIA"
                  title="Firma electronica"
                  subtitle="Certificados, vigencia y clave para comprobantes"
                  icon="file-certificate-outline"
                  metrics={[
                    { value: filteredEmisores.length, label: 'Emisores' },
                    { value: emisores.filter(hasFirmaConfigured).length, label: 'Firmas' },
                    { value: Object.values(firmaEstados).filter((estado) => estado.esValida).length, label: 'Vigentes' },
                  ]}
                  onCreate={!hasConfiguredFirma ? openAddFirma : undefined}
                  createLabel="Agregar firma"
                />
                <View style={styles.clientToolsPanel}>
                  <View style={styles.clientToolsHeader}>
                    <View>
                      <Text style={styles.clientToolsEyebrow}>Firmas</Text>
                      <Text style={styles.clientToolsTitle}>Certificados registrados</Text>
                    </View>
                  </View>
                  <SearchField label="Buscar firmas" placeholder="Razon social o RUC del emisor" value={search} onChangeText={setSearch} resultCount={filteredEmisores.length} totalCount={emisores.length} />
                </View>
                {emisorFormMode && selectedEmisor ? (
                  <FirmaForm
                    emisor={selectedEmisor}
                    form={emisorForm}
                    saving={savingEmisor}
                      estado={firmaEstados[selectedEmisor.codigo]}
                    onCancel={closeEmisorForm}
                    onChange={updateEmisorForm}
                    onClear={clearFirmaFields}
                    onSelectArchivo={selectFirmaArchivo}
                    onSave={saveEmisor}
                  />
                ) : null}
                {directoryMessage ? <MessageBox message={directoryMessage} /> : null}
                {loadingEmisores || loadingFirma ? (
                  <View style={styles.directoryLoading}>
                    <ActivityIndicator color="#0072BD" />
                    <Text style={styles.mutedText}>Consultando vigencia de la firma...</Text>
                  </View>
                ) : null}
                {!loadingEmisores && filteredEmisores.length === 0 ? (
                  <EmptyState title="Sin emisores para firma" text="Primero registra los datos del emisor." />
                ) : null}
                <View style={styles.clientListPanel}>
                  <View style={styles.clientListHeader}>
                    <View>
                      <Text style={styles.clientListEyebrow}>Listado</Text>
                      <Text style={styles.clientListTitle}>Firmas</Text>
                    </View>
                    <Text style={styles.clientListCount}>{filteredEmisores.length}</Text>
                  </View>
                  <ResultCollection
                    items={filteredEmisores}
                    variant="plain"
                    resetKey={search}
                    keyExtractor={(emisor, index) => `firma-${emisor.codigo}-${emisor.ruc ?? index}`}
                    renderItem={(emisor) => (
                      <FirmaCard
                        emisor={emisor}
                        estado={firmaEstados[emisor.codigo]}
                        onView={() => setViewingFirma(emisor)}
                        onEdit={() => openFirmaForm(emisor)}
                        onDelete={() => confirmDeleteFirma(emisor)}
                      />
                    )}
                  />
                </View>
              </>
            ) : null}

            {activeView === 'perfil' ? (
              <>
                {directoryMessage ? <MessageBox message={directoryMessage} /> : null}
                {loadingPerfil ? (
                  <View style={styles.directoryLoading}>
                    <ActivityIndicator color="#0072BD" />
                    <Text style={styles.mutedText}>Cargando perfil...</Text>
                  </View>
                ) : null}
                {!loadingPerfil ? (
                  <PerfilForm
                    form={perfilForm}
                    lookup={perfilData}
                    saving={savingPerfil}
                    onChange={updatePerfilForm}
                    onReset={() => setPerfilForm(perfilToForm(perfilData?.perfil))}
                    onSelectAvatar={selectPerfilAvatar}
                    onSelectInitialsAvatar={selectInitialsPerfilAvatar}
                    onSelectPresetAvatar={selectPresetPerfilAvatar}
                    onSave={savePerfil}
                  />
                ) : null}
              </>
            ) : null}

            {activeView === 'punto-emision' ? (
              <>
                {puntosData?.emisor ? (
                  <View style={styles.puntoHero}>
                    <Text style={styles.puntoHeroEyebrow}>Configuracion tributaria</Text>
                    <Text style={styles.puntoHeroTitle}>Establecimientos y puntos de emision</Text>
                    <Text style={styles.puntoHeroText}>Administra las series electronicas que utilizaras para emitir documentos.</Text>
                    <View style={styles.puntoHeroBadge}>
                      <Text style={styles.puntoHeroBadgeLabel}>Serie en uso</Text>
                      <Text style={styles.puntoHeroBadgeValue}>
                        {getPuntoSerie((puntosData.cajas ?? []).find((punto) => punto.esPrincipal) ?? (puntosData.cajas ?? [])[0] ?? { sec: 0 }) || '001-000'}
                      </Text>
                    </View>
                  </View>
                ) : null}
                <View style={styles.metricGrid}>
                  <MetricBox value={puntosData?.emisor ? 1 : 0} label="Emisor activo" />
                  <MetricBox value={puntosData?.cajas.length ?? 0} label="Puntos" />
                </View>
                {puntosData?.emisor ? (
                  <View style={styles.profileBox}>
                    <Text style={styles.profileLabel}>Establecimiento seleccionado</Text>
                    <Text style={styles.profileValue}>{`${normalizeSerieCode(puntosData.emisor.codEstablecimiento) || '001'} - Matriz`}</Text>
                    <Text style={styles.profileLabel}>Emisor</Text>
                    <Text style={styles.profileValue}>{puntosData.emisor.razonSocial || puntosData.emisor.nomComercial || 'Emisor registrado'}</Text>
                    <Text style={styles.profileLabel}>Direccion</Text>
                    <Text style={styles.profileValue}>{puntosData.emisor.dirEstablecimiento || puntosData.emisor.direccionMatriz || 'Sin direccion configurada'}</Text>
                  </View>
                ) : null}
                <View style={styles.actionRow}>
                  <PrimaryButton label="Agregar punto de emision" loading={false} onPress={openNewPunto} />
                </View>
                {puntoFormMode ? (
                  <PuntoEmisionForm
                    form={puntoForm}
                    mode={puntoFormMode}
                    saving={savingPunto}
                    establecimiento={normalizeSerieCode(puntosData?.emisor?.codEstablecimiento)}
                    onCancel={closePuntoForm}
                    onChange={updatePuntoForm}
                    onReset={() => setPuntoForm(selectedPunto ? puntoToForm(selectedPunto) : { puntoEmision: getNextPuntoCode(puntosData?.cajas ?? []) })}
                    onSave={savePunto}
                  />
                ) : null}
                <SearchField label="Buscar puntos de emision" placeholder="Establecimiento, caja o serie" value={search} onChangeText={setSearch} totalCount={puntosData?.cajas.length ?? 0} />
                {directoryMessage ? <MessageBox message={directoryMessage} /> : null}
                {loadingPuntos ? (
                  <View style={styles.directoryLoading}>
                    <ActivityIndicator color="#0072BD" />
                    <Text style={styles.mutedText}>Cargando puntos de emision...</Text>
                  </View>
                ) : null}
                {!loadingPuntos && (puntosData?.cajas.length ?? 0) === 0 ? (
                  <EmptyState title="Sin puntos de emision" text="Cuando existan registros, apareceran aqui." />
                ) : null}
                <View style={styles.listStack}>
                  {(puntosData?.cajas ?? [])
                    .filter((punto) => {
                      const term = search.trim().toLowerCase();
                      if (!term) return true;
                      return [getPuntoSerie(punto), punto.puntoEmision, punto.establecimiento]
                        .filter(Boolean)
                        .some((value) => String(value).toLowerCase().includes(term));
                    })
                    .map((punto, index, list) => (
                      <PuntoEmisionCard
                        key={`punto-${punto.sec}-${index}`}
                        punto={punto}
                        canDelete={!punto.esPrincipal && list.length > 1}
                        onEdit={() => openEditPunto(punto)}
                        onDelete={() => confirmDeletePunto(punto)}
                        onMakePrincipal={() => makePuntoPrincipal(punto)}
                      />
                    ))}
                </View>
              </>
            ) : null}

            {activeView === 'nueva-factura' ? (
              <NuevaFacturaMobileScreen
                form={facturaForm}
                preparacion={facturaPreparacion}
                cliente={facturaCliente}
                clientes={facturaClientes}
                productos={facturaProductos}
                lineas={facturaLineas}
                loading={loadingFacturas}
                saving={savingFactura}
                message={directoryMessage}
                onChange={updateFacturaForm}
                onSearchClientes={searchFacturaClientes}
                onSelectCliente={(cliente) => {
                  setFacturaCliente(cliente);
                  setFacturaClientes([]);
                  setFacturaForm((current) => ({
                    ...current,
                    clienteBusqueda: getClienteDisplayName(cliente),
                    tipoIdentificacion: String(cliente.tipoidentificacion ?? ''),
                    tipoCliente: String(cliente.tipoCliente ?? ''),
                    obligadoContabilidad: cliente.oblgconta ?? '',
                    direccion: cliente.direccion ?? '',
                    telefono: cliente.celular || cliente.telefonoconvencional || '',
                    correoPrincipal: getClienteEmail(cliente),
                  }));
                }}
                onSearchProductos={searchFacturaProductos}
                onAddProducto={addFacturaProducto}
                onUpdateLinea={updateFacturaLinea}
                onRemoveLinea={removeFacturaLinea}
                onClear={clearFacturaForm}
                onSave={saveNuevaFactura}
              />
            ) : null}

            {activeView === 'mis-facturas' ? (
              <MisFacturasMobileScreen
                facturas={facturasList}
                loading={loadingFacturas}
                message={directoryMessage}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onPdf={(factura) => catalogUserId && openPdfOptions(() => getFacturaPdf(catalogUserId, factura.codfactura), `${factura.numeroCompleto ?? 'factura'}.pdf`)}
                onXml={(factura) => catalogUserId && openFacturaAsset(() => getFacturaXml(catalogUserId, factura.codfactura))}
                onEmail={sendFacturaCorreo}
                onAnular={confirmAnularFactura}
              />
            ) : null}

            {activeView === 'nueva-nota-credito' ? (
              <NuevaNotaCreditoMobileScreen
                form={notaCreditoForm}
                preparacion={notaCreditoPreparacion}
                factura={notaCreditoFactura}
                facturas={notaCreditoFacturas}
                cliente={notaCreditoCliente}
                lineas={notaCreditoLineas}
                loading={loadingNotasCredito}
                saving={savingNotaCredito}
                message={directoryMessage}
                onChange={updateNotaCreditoForm}
                onSearchFacturas={searchNotaCreditoFacturas}
                onSelectFactura={selectNotaCreditoFactura}
                onAddLinea={addNotaCreditoProducto}
                onUpdateLinea={updateNotaCreditoLinea}
                onRemoveLinea={removeNotaCreditoLinea}
                onClear={clearNotaCreditoForm}
                onSave={saveNuevaNotaCredito}
              />
            ) : null}

            {activeView === 'mis-notas-credito' ? (
              <MisNotasCreditoMobileScreen
                notas={notasCreditoList}
                loading={loadingNotasCredito}
                message={directoryMessage}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onPdf={(nota) => catalogUserId && openPdfOptions(() => getNotaCreditoPdf(catalogUserId, nota.codNotaCredito), 'nota-credito.pdf')}
                onXml={(nota) => catalogUserId && openFacturaAsset(() => getNotaCreditoXml(catalogUserId, nota.codNotaCredito))}
                onEmail={sendNotaCreditoCorreo}
              />
            ) : null}

            {activeView === 'nueva-nota-debito' ? (
              <NuevaNotaDebitoMobileScreen
                form={notaDebitoForm}
                preparacion={notaDebitoPreparacion}
                factura={notaDebitoFactura}
                facturas={notaDebitoFacturas}
                cliente={notaDebitoCliente}
                lineas={notaDebitoLineas}
                loading={loadingNotasDebito}
                saving={savingNotaDebito}
                message={directoryMessage}
                onChange={updateNotaDebitoForm}
                onSearchFacturas={searchNotaDebitoFacturas}
                onSelectFactura={selectNotaDebitoFactura}
                onAddLinea={addNotaDebitoLinea}
                onUpdateLinea={updateNotaDebitoLinea}
                onRemoveLinea={removeNotaDebitoLinea}
                onClear={clearNotaDebitoForm}
                onSave={saveNuevaNotaDebito}
              />
            ) : null}

            {activeView === 'mis-notas-debito' ? (
              <MisNotasDebitoMobileScreen
                notas={notasDebitoList}
                loading={loadingNotasDebito}
                message={directoryMessage}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onPdf={(nota) => catalogUserId && openPdfOptions(() => getNotaDebitoPdf(catalogUserId, nota.codNotaDebito), 'nota-debito.pdf')}
                onXml={(nota) => catalogUserId && openFacturaAsset(() => getNotaDebitoXml(catalogUserId, nota.codNotaDebito))}
                onEmail={sendNotaDebitoCorreo}
              />
            ) : null}

            {activeView === 'nueva-liquidacion-compra' ? (
              <NuevaLiquidacionCompraMobileScreen
                form={liquidacionForm}
                preparacion={liquidacionPreparacion}
                proveedor={liquidacionProveedor}
                proveedores={liquidacionProveedores}
                productos={liquidacionProductos}
                lineas={liquidacionLineas}
                loading={loadingLiquidaciones}
                saving={savingLiquidacion}
                message={directoryMessage}
                onChange={updateLiquidacionForm}
                onSearchProveedores={searchLiquidacionProveedores}
                onSelectProveedor={selectLiquidacionProveedor}
                onSearchProductos={searchLiquidacionProductos}
                onAddProducto={addLiquidacionProducto}
                onUpdateLinea={updateLiquidacionLinea}
                onRemoveLinea={removeLiquidacionLinea}
                onClear={clearLiquidacionForm}
                onSave={saveNuevaLiquidacion}
              />
            ) : null}

            {activeView === 'mis-liquidaciones-compra' ? (
              <MisLiquidacionesCompraMobileScreen
                liquidaciones={liquidacionesList}
                loading={loadingLiquidaciones}
                message={directoryMessage}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onPdf={(liquidacion) => catalogUserId && openPdfOptions(() => getLiquidacionCompraPdf(catalogUserId, liquidacion.codLiquidacion), 'liquidacion-compra.pdf')}
                onXml={(liquidacion) => catalogUserId && openFacturaAsset(() => getLiquidacionCompraXml(catalogUserId, liquidacion.codLiquidacion))}
                onEmail={sendLiquidacionCorreo}
              />
            ) : null}

            {activeView === 'nueva-guia-remision' ? (
              <NuevaGuiaRemisionMobileScreen
                form={guiaForm}
                preparacion={guiaPreparacion}
                transportista={guiaTransportista}
                transportistas={guiaTransportistas}
                cliente={guiaCliente}
                clientes={guiaClientes}
                factura={guiaFactura}
                facturas={guiaFacturas}
                productos={guiaProductos}
                detalles={guiaDetalles}
                loading={loadingGuias}
                saving={savingGuia}
                message={directoryMessage}
                onChange={updateGuiaForm}
                onSearchTransportistas={searchGuiaTransportistas}
                onSelectTransportista={selectGuiaTransportista}
                onSearchClientes={searchGuiaClientes}
                onSelectCliente={selectGuiaCliente}
                onSearchFacturas={searchGuiaFacturas}
                onSelectFactura={selectGuiaFactura}
                onSearchProductos={searchGuiaProductos}
                onAddProducto={addGuiaProducto}
                onUpdateDetalle={updateGuiaDetalle}
                onRemoveDetalle={removeGuiaDetalle}
                onClear={clearGuiaForm}
                onSave={saveNuevaGuia}
              />
            ) : null}

            {activeView === 'mis-guias-remision' ? (
              <MisGuiasRemisionMobileScreen
                guias={guiasList}
                loading={loadingGuias}
                message={directoryMessage}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onPdf={(guia) => catalogUserId && openPdfOptions(() => getGuiaRemisionPdf(catalogUserId, guia.codGuia), 'guia-remision.pdf')}
                onXml={(guia) => catalogUserId && openFacturaAsset(() => getGuiaRemisionXml(catalogUserId, guia.codGuia))}
                onEmail={sendGuiaCorreo}
              />
            ) : null}

            {activeView === 'retenciones' ? (
              <MisRetencionesMobileScreen
                retenciones={retencionesList}
                loading={loadingRetenciones}
                message={directoryMessage}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onPdf={(retencion) => catalogUserId && openPdfOptions(() => getRetencionPdf(catalogUserId, retencion.codRetencion), 'retencion.pdf')}
                onXml={(retencion) => catalogUserId && openFacturaAsset(() => getRetencionXml(catalogUserId, retencion.codRetencion))}
                onEmail={sendRetencionCorreo}
              />
            ) : null}

            {isAdminMobileView(activeView) ? (
              <AdminModuleScreen
                view={activeView}
                search={search}
                items={adminItems}
                loading={loadingAdminItems}
                message={directoryMessage}
                activeTab={adminTabByView[activeView]}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onSearch={setSearch}
                onTabChange={(tab) => setAdminTabByView((current) => ({ ...current, [activeView]: tab }))}
                onCreate={() => showAdminCrudPending('Registrar')}
                onView={showAdminItemDetail}
                onEdit={(item) => showAdminCrudPending('Editar', item)}
                onDelete={(item) => showAdminCrudPending('Eliminar', item)}
              />
            ) : null}

            {isOperationalMobileView(activeView) ? (
              activeView === 'comprar-documentos' ? (
                <PurchaseDocumentsScreen
                  form={operationalForm}
                  saving={savingOperational}
                  message={directoryMessage}
                  onChange={updateRechargeForm}
                  onSelectPlan={selectRechargePlan}
                  onSave={saveOperational}
                />
              ) : (
                <OperationalModuleScreen
                view={activeView}
                search={search}
                items={operationalItems}
                loading={loadingOperationalItems}
                saving={savingOperational}
                message={directoryMessage}
                activeTab={operationalTabByView[activeView]}
                formMode={operationalFormMode}
                form={operationalForm}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onSearch={setSearch}
                onTabChange={(tab) => {
                  closeOperationalForm();
                  setOperationalTabByView((current) => ({ ...current, [activeView]: tab }));
                }}
                onCreate={openNewOperational}
                onCancel={closeOperationalForm}
                onChange={updateOperationalForm}
                onSave={saveOperational}
                onView={showOperationalItemDetail}
                onEdit={openEditOperational}
                onDelete={confirmDeleteOperational}
                />
              )
            ) : null}

          </View>
        ) : null}
        </ScreenTransition>

      </ScrollView>
      <PortalBottomNav
        bottomInset={insets.bottom}
        activeView={activeView}
        onHome={() => openView('dashboard')}
        onServices={() => canUsePortal ? openView('portal') : setMenuOpen(true)}
        onBot={() => openView('bot')}
        onNewInvoice={() => openView('nueva-factura')}
        onProfile={() => openView('perfil')}
      />
      <ItemDetailModal
        visible={Boolean(viewingCliente)}
        title={viewingCliente ? getClienteDisplayName(viewingCliente) : 'Cliente'}
        values={viewingCliente ? getClienteDetailValues(viewingCliente, getTipoClienteLabel(viewingCliente.tipoCliente, clienteLookups), facturasList) : []}
        onClose={() => setViewingCliente(null)}
      />
      <ItemDetailModal
        visible={Boolean(viewingProducto)}
        title={viewingProducto?.nombre || 'Producto'}
        values={viewingProducto ? getProductoDetailValues(viewingProducto) : []}
        onClose={() => setViewingProducto(null)}
      />
      <ItemDetailModal
        visible={Boolean(viewingCategoria)}
        title={viewingCategoria?.descripcion || 'Categoria'}
        values={viewingCategoria ? [`Estado: ${viewingCategoria.estado === false ? 'Inactiva' : 'Activa'}`] : []}
        onClose={() => setViewingCategoria(null)}
      />
      <ItemDetailModal
        visible={Boolean(viewingSubcategoria)}
        title={viewingSubcategoria?.descripcion || 'Subcategoria'}
        values={viewingSubcategoria ? [
          `Categoria: ${viewingSubcategoria.categoriaDescripcion ?? categorias.find((categoria) => categoria.idCategoria === viewingSubcategoria.idCategoria)?.descripcion ?? 'Sin categoria asociada'}`,
          `Estado: ${viewingSubcategoria.estado === false ? 'Inactiva' : 'Activa'}`,
        ] : []}
        onClose={() => setViewingSubcategoria(null)}
      />
      <ItemDetailModal
        visible={Boolean(viewingEmisor)}
        title={viewingEmisor?.razonSocial || viewingEmisor?.nomComercial || 'Emisor'}
        values={viewingEmisor ? getEmisorDetailValues(viewingEmisor) : []}
        onClose={() => setViewingEmisor(null)}
      />
      <ItemDetailModal
        visible={Boolean(viewingFirma)}
        title={viewingFirma?.razonSocial || viewingFirma?.nomComercial || 'Firma'}
        values={viewingFirma ? getFirmaDetailValues(viewingFirma, firmaEstados[viewingFirma.codigo]) : []}
        onClose={() => setViewingFirma(null)}
      />
      <Modal visible={notificationsOpen} animationType="fade" transparent statusBarTranslucent onRequestClose={() => setNotificationsOpen(false)}>
        <View style={styles.notificationsOverlay}>
          <Pressable style={styles.notificationsBackdrop} onPress={() => setNotificationsOpen(false)} />
          <View style={[styles.notificationsPanel, { marginTop: Math.max(16, insets.top + 12), marginBottom: Math.max(16, insets.bottom + 12) }]}>
            <View style={styles.notificationsHeader}>
              <View>
                <Text style={styles.notificationsTitle}>NOTIFICACIONES</Text>
                <Text style={styles.notificationsSubtitle}>{loadingNotifications ? 'Cargando actividad...' : `${notifications.length} registros del sistema`}</Text>
              </View>
              <Pressable style={styles.menuCloseButton} onPress={() => setNotificationsOpen(false)}>
                <Text style={styles.menuCloseText}>×</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.notificationsList}>
              {notificationsMessage ? <MessageBox message={notificationsMessage} /> : null}
              {loadingNotifications ? (
                <View style={styles.notificationsLoading}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.notificationText}>Cargando notificaciones...</Text>
                </View>
              ) : null}
              {!loadingNotifications && !notifications.length && !notificationsMessage ? (
                <View style={styles.notificationEmpty}>
                  <Text style={styles.notificationTitle}>Sin notificaciones</Text>
                  <Text style={styles.notificationText}>No hay actividad pendiente para mostrar.</Text>
                </View>
              ) : null}
              {!loadingNotifications ? notifications.map((notification) => {
                const tone = getNotificationTone(notification);
                const itemToneStyle = tone === 'danger'
                  ? styles.notificationItemDanger
                  : tone === 'warning'
                    ? styles.notificationItemWarning
                    : tone === 'success'
                      ? styles.notificationItemSuccess
                      : styles.notificationItemInfo;
                const bulletToneStyle = tone === 'danger'
                  ? styles.notificationBulletDanger
                  : tone === 'warning'
                    ? styles.notificationBulletWarning
                    : tone === 'success'
                      ? styles.notificationBulletSuccess
                      : styles.notificationBulletInfo;
                return (
                <View key={notification.id} style={[styles.notificationItem, itemToneStyle, notification.read && styles.notificationItemRead]}>
                  <View style={[styles.notificationBullet, bulletToneStyle]} />
                  <View style={styles.notificationCopy}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationText}>{notification.text}</Text>
                    {notification.date ? <Text style={styles.notificationMeta}>{notification.date}</Text> : null}
                  </View>
                </View>
              );
              }) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal visible={menuOpen} animationType="fade" transparent onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.menuOverlay}>
          <Animated.View style={[styles.menuBackdropWrap, { opacity: drawerProgress }]}>
            <Pressable accessibilityLabel="Cerrar menu" accessibilityRole="button" style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
          </Animated.View>
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.menuDrawer,
              { transform: [{ translateX: drawerProgress.interpolate({ inputRange: [0, 1], outputRange: [36, 0] }) }] },
            ]}
          >
            <View style={styles.menuHeader}>
              <View>
                <Text style={styles.menuTitle}>Menu</Text>
                <Text style={styles.menuSubtitle}>Numérica Software</Text>
              </View>
              <Pressable accessibilityLabel="Cerrar menu" accessibilityRole="button" hitSlop={6} style={styles.menuCloseButton} onPress={() => setMenuOpen(false)}>
                <Text style={styles.menuCloseText}>×</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.menuList} showsVerticalScrollIndicator={false}>
              {canUsePortal ? <MenuItem active={activeView === 'portal'} label="Portal" onPress={() => openView('portal')} /> : null}
              {drawerMenu.map((node) => renderDrawerNode(node))}
            </ScrollView>
            <Pressable
              accessibilityLabel="Cerrar sesion"
              accessibilityRole="button"
              style={styles.menuLogoutButton}
              onPress={() => {
                setMenuOpen(false);
                onLogout();
              }}
            >
              <Text style={styles.menuLogoutText}>Salir</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
      <StatusBar style="light" backgroundColor="#07305E" translucent={false} />
    </SafeAreaView>
  );
}

function getWorkspaceTitle(view: WorkspaceView) {
  const titles: Record<WorkspaceView, string> = {
    portal: 'Portal de Servicios',
    dashboard: 'Inicio',
    perfil: 'Perfil',
    emisor: 'Emisor',
    firma: 'Mi firma',
    'e-rubrica': 'E-Rúbrica',
    'punto-emision': 'Punto de emision / caja',
    'admin-cajas-secuencias': 'Cajas y secuencias',
    'admin-roles-permisos': 'Roles y Permisos',
    'admin-impuestos': 'Impuestos',
    'admin-usuarios': 'Usuarios',
    'admin-identificaciones': 'Identificaciones',
    'admin-formas-pago': 'Formas de Pago',
    'admin-logs-inicio': 'Logs de Inicio',
    'admin-retenciones': 'Retenciones',
    'admin-sql-auditoria': 'SQL Auditoria',
    clientes: 'Clientes',
    'nuevo-cliente': 'Clientes',
    'nuevo-producto': 'Productos',
    proveedores: 'Proveedores',
    productos: 'Productos',
    categorias: 'Categorias',
    facturacion: 'Facturacion',
    'nueva-factura': 'Nueva Factura',
    'mis-facturas': 'Mis Facturas',
    'notas-credito': 'Notas de credito',
    'nueva-nota-credito': 'Nueva Nota de Credito',
    'mis-notas-credito': 'Mis Notas de Credito',
    'notas-debito': 'Notas de debito',
    'nueva-nota-debito': 'Nueva Nota de Debito',
    'mis-notas-debito': 'Mis Notas de Debito',
    retenciones: 'Retenciones',
    'guias-remision': 'Guias de remision',
    'nueva-guia-remision': 'Nueva Guia de Remision',
    'mis-guias-remision': 'Mis Guias de Remision',
    compras: 'Liquidacion de Compra',
    'nueva-liquidacion-compra': 'Nueva Liquidacion de Compra',
    'mis-liquidaciones-compra': 'Mis Liquidaciones de Compra',
    'cuentas-cobrar': 'Cuentas por cobrar',
    'estado-cuenta': 'Estado de cuenta',
    recargas: 'Mis recargas',
    'comprar-documentos': 'Comprar documentos',
    reportes: 'Reportes',
    'reporte-documentos': 'Reporte documentos',
    configuracion: 'Configuracion',
     soporte: 'Soporte',
     bot: 'Númi Bot',
     tutoriales: 'Tutoriales',
    'centro-normativo': 'Centro normativo',
    'no-autorizado': 'No autorizado',
  };

  return titles[view];
}

function isAdminMobileView(view: WorkspaceView) {
  return view.startsWith('admin-');
}

function isOperationalMobileView(view: WorkspaceView) {
  return Boolean(getOperationalModuleSlug(view));
}

function getOperationalModuleSlug(view: WorkspaceView): OperationalModule | undefined {
  const modules: Partial<Record<WorkspaceView, OperationalModule>> = {
    compras: 'compras',
    'cuentas-cobrar': 'cuentas-cobrar',
    'estado-cuenta': 'cuentas-cobrar',
    recargas: 'recargas',
    'comprar-documentos': 'recargas',
    reportes: 'reportes',
    'reporte-documentos': 'reportes',
    'centro-normativo': 'centro-normativo',
  };

  return modules[view];
}

function getOperationalDefaultTab(view: WorkspaceView, module: OperationalModule) {
  const defaults: Partial<Record<WorkspaceView, string>> = {
    'cuentas-cobrar': 'Cuentas por cobrar',
    'estado-cuenta': 'Estado de cuenta',
    'comprar-documentos': 'Comprar documentos',
    recargas: 'Historial',
    'reporte-documentos': 'Documentos',
  };

  return defaults[view] ?? getOperationalModuleConfig(module).tabs[0] ?? '';
}

function getOperationalScreenConfig(view: WorkspaceView, module: OperationalModule) {
  const base = getOperationalModuleConfig(module);
  const overrides: Partial<Record<WorkspaceView, { eyebrow: string; title: string; description: string; tabs: string[]; placeholder: string }>> = {
    'cuentas-cobrar': {
      eyebrow: 'Cartera',
      title: 'Cuentas por cobrar',
      description: 'Consulta facturas pendientes y registra abonos.',
      tabs: ['Cuentas por cobrar', 'Abonos'],
      placeholder: base.placeholder,
    },
    'estado-cuenta': {
      eyebrow: 'Cartera',
      title: 'Estado de cuenta',
      description: 'Revisa saldos, abonos y movimientos por cliente.',
      tabs: ['Estado de cuenta'],
      placeholder: base.placeholder,
    },
    'comprar-documentos': {
      eyebrow: 'Documentos',
      title: 'Comprar documentos',
      description: 'Compra paquetes y consulta tu saldo de documentos.',
      tabs: ['Comprar documentos', 'Paquetes'],
      placeholder: base.placeholder,
    },
    recargas: {
      eyebrow: 'Documentos',
      title: 'Mis recargas',
      description: 'Consulta únicamente tus recargas realizadas.',
      tabs: ['Historial'],
      placeholder: base.placeholder,
    },
    'reporte-documentos': {
      eyebrow: 'Reportes',
      title: 'Reporte documentos',
      description: 'Consulta documentos emitidos y recibidos.',
      tabs: ['Documentos', 'Emitidos', 'Recibidos'],
      placeholder: base.placeholder,
    },
    compras: {
      eyebrow: 'Emision de otros Documentos',
      title: 'Liquidacion de Compra',
      description: 'Consulta documentos de compra, liquidaciones y XML publicados en e-fact.',
      tabs: ['Liquidaciones', 'Documentos', 'XML'],
      placeholder: base.placeholder,
    },
  };

  return overrides[view] ?? base;
}

function getAdminModuleSlug(view: WorkspaceView) {
  const modules: Partial<Record<WorkspaceView, string>> = {
    'admin-cajas-secuencias': 'cajas-secuencias',
    'admin-roles-permisos': 'roles-permisos',
    'admin-impuestos': 'impuestos',
    'admin-usuarios': 'usuarios',
    'admin-identificaciones': 'identificaciones',
    'admin-formas-pago': 'formas-pago',
    'admin-logs-inicio': 'logs-inicio',
    'admin-retenciones': 'retenciones',
    'admin-sql-auditoria': 'sql-auditoria',
  };

  return modules[view];
}

function getAdminModuleConfig(view: WorkspaceView) {
  const configs: Partial<Record<WorkspaceView, { eyebrow: string; title: string; description: string; tabs?: string[]; placeholder: string; action?: string }>> = {
    'admin-cajas-secuencias': { eyebrow: 'Administracion', title: 'Cajas y secuencias', description: 'Consulta puntos de emision y ultimos secuenciales de todos los clientes.', placeholder: 'Cliente, correo, RUC, empresa, serie o SEC', action: 'Refrescar' },
    'admin-roles-permisos': { eyebrow: 'Control de accesos', title: 'Panel de seguridad', description: 'Consulta roles y perfiles registrados.', placeholder: 'Buscar perfil, modulo o permiso', action: 'Refrescar' },
    'admin-impuestos': { eyebrow: 'Listado activo', title: 'Impuestos', description: 'Administra codigos de impuesto y porcentajes IVA.', tabs: ['Codigos de Impuesto', 'Porcentajes IVA'], placeholder: 'Buscar por codigo, descripcion o valor', action: 'Refrescar' },
    'admin-usuarios': { eyebrow: 'Administracion de accesos', title: 'Usuarios del sistema', description: 'Gestiona perfiles, roles y seguridad operativa.', placeholder: 'Buscar usuario, correo o rol', action: 'Refrescar' },
    'admin-identificaciones': { eyebrow: 'Busqueda y control', title: 'Identificaciones registradas', description: 'Filtra por codigo o descripcion y administra tus registros.', placeholder: 'Buscar por codigo o descripcion', action: 'Refrescar' },
    'admin-formas-pago': { eyebrow: 'Catalogo transaccional', title: 'Configuracion general', description: 'Gestiona formas de pago y tipos de documento.', tabs: ['Formas de Pago', 'Tipos de Documento'], placeholder: 'Buscar por codigo, descripcion o SRI', action: 'Refrescar' },
    'admin-logs-inicio': { eyebrow: 'Auditoria de seguridad', title: 'Historial de accesos', description: 'Revisa inicios de sesion, eventos fallidos y actividad reciente.', tabs: ['Hoy', 'Ultimos 7 dias', 'Ultimos 30 dias'], placeholder: 'Usuario, correo, IP o estado', action: 'Refrescar' },
    'admin-retenciones': { eyebrow: 'Panel fiscal', title: 'Retenciones', description: 'Filtra por codigo o descripcion y administra IVA, ISD y renta.', tabs: ['IVA', 'ISD', 'Renta'], placeholder: 'Buscar por codigo o descripcion', action: 'Refrescar' },
    'admin-sql-auditoria': { eyebrow: 'Bitacora', title: 'Eventos de auditoria SQL', description: 'Consulta acciones, entidades, campos y ruta/IP de auditoria.', placeholder: 'Entidad, tabla, campo, ruta o IP', action: 'Refrescar' },
  };

  return configs[view] ?? { eyebrow: 'Administracion', title: getWorkspaceTitle(view), description: 'Modulo administrativo preparado para movil.', placeholder: 'Buscar' };
}

function getClienteDisplayName(cliente: Cliente) {
  const row = cliente as Cliente & Record<string, unknown>;
  return String(
    cliente.nombrerazonsocial ||
      row.Nombrerazonsocial ||
      row.NombreRazonSocial ||
      [cliente.nombres || row.Nombres, cliente.apellidos || row.Apellidos].filter(Boolean).join(' ') ||
      cliente.numeroidentificacion ||
      row.Numeroidentificacion ||
      row.NumeroIdentificacion ||
      'Cliente',
  );
}

function getClienteIdentification(cliente: Cliente) {
  const row = cliente as Cliente & Record<string, unknown>;
  return String(cliente.numeroidentificacion || row.Numeroidentificacion || row.NumeroIdentificacion || '');
}

function getClienteEmail(cliente: Cliente) {
  const row = cliente as Cliente & Record<string, unknown>;
  return String(cliente.correo || row.Correo || row.Email || '');
}

function getClienteDetailValues(cliente: Cliente, tipoClienteLabel: string, facturas: FacturaListItem[] = []) {
  const stats = getClienteFacturaStats(cliente, facturas);
  const values = [
    `Identificacion: ${getClienteIdentification(cliente) || 'Sin identificacion'}`,
    `Tipo: ${tipoClienteLabel}`,
    `Correo: ${getClienteEmail(cliente) || 'Sin correo'}`,
    `Telefono: ${cliente.celular || cliente.telefonoconvencional || 'Sin telefono'}`,
    `Direccion: ${cliente.direccion || 'Sin direccion'}`,
    `Facturas emitidas: ${stats.facturasEmitidas}`,
    `Saldo pendiente: ${formatMoney(stats.saldoPendiente)}`,
    `Estado: ${cliente.estado === false ? 'Inactivo' : 'Activo'}`,
    cliente.esProveedor ? 'Perfil: Proveedor' : 'Perfil: Cliente',
    cliente.oblgconta ? `Obligado a contabilidad: ${cliente.oblgconta}` : '',
    typeof cliente.diasCredito === 'number' ? `Dias de credito: ${cliente.diasCredito}` : '',
    cliente.observaciones ? `Observaciones: ${cliente.observaciones}` : '',
  ];

  return values.filter(Boolean);
}

function getClienteFacturaStats(cliente: Cliente, facturas: FacturaListItem[]) {
  const row = cliente as Cliente & Record<string, unknown>;
  const directFacturas = numberValue(
    row.facturasEmitidas ??
      row.FacturasEmitidas ??
      row.totalFacturas ??
      row.TotalFacturas,
  );
  const directSaldo = numberValue(
    row.saldoPendiente ??
      row.SaldoPendiente ??
      row.saldo ??
      row.Saldo,
  );
  const identification = getClienteIdentification(cliente).trim();
  const matched = identification
    ? facturas.filter((factura) => String(factura.identificacionCliente ?? '').trim() === identification)
    : [];

  return {
    facturasEmitidas: directFacturas || matched.length,
    saldoPendiente: directSaldo || matched.reduce((sum, factura) => sum + Number(factura.saldoPendiente ?? 0), 0),
  };
}

function numberValue(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getClienteKey(cliente: Cliente, index: number) {
  const row = cliente as Cliente & Record<string, unknown>;
  return String(cliente.codcliente || row.Codcliente || row.CodCliente || getClienteIdentification(cliente) || `${getClienteDisplayName(cliente)}-${index}`);
}

function getProductoDetailValues(producto: Producto) {
  return [
    `Tipo: ${producto.tipo === 'SERVICIO' ? 'Servicio' : 'Producto'}`,
    `Codigo: ${producto.codigo || 'Sin codigo'}`,
    `Precio base: ${formatMoney(producto.precioBase)}`,
    `IVA: ${producto.iva ? 'Si' : 'No'}`,
    `Tarifa: ${producto.tarifaDescripcion ?? producto.tarifa ?? 'Sin tarifa'}`,
    `Categoria: ${producto.categoriaDescripcion || 'Sin categoria'}`,
    `Subcategoria: ${producto.subcategoriaDescripcion || 'Sin subcategoria'}`,
    `Estado: ${producto.estado === false ? 'Inactivo' : 'Activo'}`,
  ];
}

function getEmisorDetailValues(emisor: Emisor) {
  return [
    `RUC: ${emisor.ruc || 'Sin RUC'}`,
    `Nombre comercial: ${emisor.nomComercial || 'Sin nombre comercial'}`,
    `Correo: ${emisor.email || 'Sin correo'}`,
    `Telefono: ${emisor.telefono || 'Sin telefono'}`,
    `Direccion establecimiento: ${emisor.dirEstablecimiento || 'Sin direccion'}`,
    `Direccion matriz: ${emisor.direccionMatriz || 'Sin direccion'}`,
    `Lleva contabilidad: ${emisor.llevaContabilidad || 'NO'}`,
    `Retenciones: ${emisor.retenciones || 'NO'}`,
    `Estado: ${emisor.estado === false ? 'Inactivo' : 'Activo'}`,
  ];
}

function getFirmaDetailValues(emisor: Emisor, estado?: FirmaEstado) {
  return [
    `Emisor: ${emisor.razonSocial || emisor.nomComercial || 'Sin emisor'}`,
    `RUC: ${emisor.ruc || 'Sin RUC'}`,
    `Archivo: ${getFirmaFileName(emisor.pathCertificado) || 'Sin archivo'}`,
    `Estado: ${estado?.esValida ? 'Vigente' : estado ? 'No valida' : hasFirmaConfigured(emisor) ? 'Configurada' : 'Pendiente'}`,
    estado?.diasRestantes !== null && estado?.diasRestantes !== undefined ? `Dias restantes: ${estado.diasRestantes}` : '',
    estado?.fechaExpiracion ? `Expira: ${formatDocumentDate(estado.fechaExpiracion)}` : '',
    estado?.nombreTitular ? `Titular: ${estado.nombreTitular}` : '',
    estado?.identificacion ? `Identificacion: ${estado.identificacion}` : '',
  ].filter(Boolean);
}

function formatMoney(value?: number | null) {
  return `$ ${Number(value ?? 0).toFixed(2)}`;
}

function formatDocumentDate(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '-';
  const source = String(value);
  const dotNetMatch = /\/Date\((\d+)\)\//.exec(source);
  const date = dotNetMatch ? new Date(Number(dotNetMatch[1])) : new Date(source);
  if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('es-EC');
  return source.slice(0, 10);
}

function listItemKey(prefix: string, parts: Array<string | number | null | undefined>, index: number) {
  const stable = parts
    .filter((part) => part !== null && part !== undefined && String(part).trim() !== '' && String(part).trim() !== '0')
    .map((part) => String(part).trim().replace(/\s+/g, '-'))
    .join('-');

  return `${prefix}-${stable || 'item'}-${index}`;
}

function NuevaFacturaMobileScreen({
  form,
  preparacion,
  cliente,
  clientes,
  productos,
  lineas,
  loading,
  saving,
  message,
  onChange,
  onSearchClientes,
  onSelectCliente,
  onSearchProductos,
  onAddProducto,
  onUpdateLinea,
  onRemoveLinea,
  onClear,
  onSave,
}: {
  form: NuevaFacturaFormState;
  preparacion: FacturaPreparacion | null;
  cliente: Cliente | null;
  clientes: Cliente[];
  productos: FacturaProducto[];
  lineas: NuevaFacturaLinea[];
  loading: boolean;
  saving: boolean;
  message?: MessageState;
  onChange: (field: keyof NuevaFacturaFormState, value: string) => void;
  onSearchClientes: () => void;
  onSelectCliente: (cliente: Cliente) => void;
  onSearchProductos: () => void;
  onAddProducto: (producto: FacturaProducto) => void;
  onUpdateLinea: (index: number, field: keyof Omit<NuevaFacturaLinea, 'producto'>, value: string) => void;
  onRemoveLinea: (index: number) => void;
  onClear: () => void;
  onSave: () => void;
}) {
  const toNumber = (value: string) => Number(value.replace(',', '.')) || 0;
  const totals = lineas.reduce(
    (acc, item) => {
      const quantity = toNumber(item.cantidad);
      const price = toNumber(item.precio);
      const discount = toNumber(item.descuento);
      const rate = toNumber(item.tarifa);
      const base = Math.max(quantity * price - discount, 0);
      const tax = base * (rate / 100);
      const key = rate <= 0 ? 'baseZero' : 'baseTaxed';
      return {
        ...acc,
        [key]: acc[key] + base,
        discount: acc.discount + discount,
        iva: acc.iva + tax,
        total: acc.total + base + tax,
      };
    },
    { baseTaxed: 0, baseZero: 0, discount: 0, iva: 0, total: 0 },
  );
  const serieOptions = preparacion?.series ?? [];
  const formaPagoOptions = preparacion?.formasPago ?? [];
  const ivaOptions = preparacion?.porcentajesIva ?? [];
  const selectedSerie = serieOptions.find((item) => item.serieRaw === form.serie || item.serieVisual === form.serie);
  const serieLabel = selectedSerie?.serieVisual || selectedSerie?.serieRaw || form.serie || preparacion?.caja?.serieFactura || '001-001';
  const invoiceNumber = form.numeroFactura || String((preparacion?.caja?.sec ?? 1) + 1).padStart(9, '0');
  const referenciaWords = form.referencia.trim().split(/\s+/).filter(Boolean).length;
  const displayProductos = productos.length > 0 ? productos.slice(0, 2) : lineas.map((item) => item.producto).slice(0, 2);
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step === 0 && !cliente) return;
    if (step === 1 && lineas.length === 0) return;
    setStep((current) => Math.min(current + 1, 2));
  };
  const handleClear = () => {
    onClear();
    setStep(0);
  };

  return (
    <>
      <View style={[styles.adminHeroCard, styles.invoiceHeroCard]}>
        <View style={styles.invoiceHeroText}>
          <Text style={styles.heroEyebrow}>Documento de venta</Text>
          <Text style={styles.heroTitle}>Nueva factura</Text>
          <Text style={styles.heroText}>Completa cliente, detalle y cobro con una vista ordenada.</Text>
        </View>
        <View style={styles.invoiceHeaderActions}>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Serie</Text>
            <Text style={styles.invoiceHeaderValue}>{serieLabel}</Text>
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Numero de factura</Text>
            <Text style={styles.invoiceHeaderValue}>{invoiceNumber}</Text>
          </View>
           <SecondaryButton label="Limpiar pantalla" onPress={handleClear} />
        </View>
      </View>
      <View style={styles.invoiceSteps}>
        {['Cliente', 'Productos', 'Revisión'].map((label, index) => (
          <Pressable key={label} style={styles.invoiceStepItem} onPress={() => index <= step && setStep(index)}>
            <View style={[styles.invoiceStepNumber, index <= step && styles.invoiceStepNumberActive]}>
              <Text style={[styles.invoiceStepNumberText, index <= step && styles.invoiceStepNumberTextActive]}>{index + 1}</Text>
            </View>
            <Text style={[styles.invoiceStepLabel, index === step && styles.invoiceStepLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando facturacion...</Text>
        </View>
      ) : null}
      {step === 0 ? <>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Buscador de cliente</Text>
        <Text style={styles.invoiceSectionHelp}>Busca por nombre, RUC o cédula. Solo necesitas seleccionar un resultado.</Text>
        <SearchField label="Encontrar cliente" placeholder="Identificacion, nombres, apellidos o razon social" value={form.clienteBusqueda} onChangeText={(value) => onChange('clienteBusqueda', value)} resultCount={clientes.length} onSubmit={onSearchClientes} />
        {cliente ? <Text style={styles.profileValue}>Seleccionado: {getClienteDisplayName(cliente)} - {cliente.numeroidentificacion}</Text> : null}
        <View style={styles.listStack}>
          {clientes.map((item, index) => (
            <Pressable key={`factura-cliente-${getClienteKey(item, index)}`} style={styles.clientCard} onPress={() => onSelectCliente(item)}>
              <Text style={styles.clientName}>{getClienteDisplayName(item)}</Text>
              <Text style={styles.clientMeta}>{getClienteIdentification(item) || 'Sin identificacion'} · {getClienteEmail(item) || 'Sin correo'}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {cliente ? <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Informacion del Cliente</Text>
          <Text style={styles.invoicePanelPill}>Datos del cliente seleccionado</Text>
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Tipo identificacion" value={form.tipoIdentificacion} onChangeText={(value) => onChange('tipoIdentificacion', value)} />
          <Field label="Numero de identificacion" value={cliente?.numeroidentificacion ?? ''} onChangeText={() => undefined} />
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Tipo cliente" value={form.tipoCliente} onChangeText={(value) => onChange('tipoCliente', value)} />
          <Field label="Obligado a llevar contabilidad" value={form.obligadoContabilidad} onChangeText={(value) => onChange('obligadoContabilidad', value)} />
        </View>
        <Field label="Direccion (max 100)" value={form.direccion} onChangeText={(value) => onChange('direccion', value)} />
        <View style={styles.invoiceGrid}>
          <Field label="Telefono (opcional)" value={form.telefono} onChangeText={(value) => onChange('telefono', value)} keyboardType="phone-pad" />
          <Field label="Correo electronico principal" value={form.correoPrincipal} onChangeText={(value) => onChange('correoPrincipal', value)} autoCapitalize="none" keyboardType="email-address" />
        </View>
        <SecondaryButton label="Agregar correo" onPress={() => onChange('correoAdicional', form.correoPrincipal)} />
       </View> : null}
       <View style={styles.formActions}>
         <PrimaryButton label="Continuar con productos" loading={false} onPress={nextStep} />
       </View>
      </> : null}
      {step === 1 ? <>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Detalle de Factura</Text>
        </View>
        <SearchField label="Encontrar producto o servicio" placeholder="Codigo, nombre o descripcion" value={form.productoBusqueda} onChangeText={(value) => onChange('productoBusqueda', value)} resultCount={productos.length} onSubmit={onSearchProductos} />
        <Text style={styles.invoiceSectionHelp}>Busca un producto, selecciónalo y ajusta cantidad o precio si hace falta.</Text>
        <View style={styles.listStack}>
          {productos.map((producto) => (
            <Pressable key={`factura-producto-${producto.codproducto}`} style={styles.clientCard} onPress={() => onAddProducto(producto)}>
              <Text style={styles.clientName}>{producto.descripcion ?? producto.codprincipal ?? 'Producto'}</Text>
              <Text style={styles.clientMeta}>{producto.codprincipal ?? 'Sin codigo'} · {formatMoney(producto.precioUnitario)}</Text>
            </Pressable>
          ))}
        </View>
        {lineas.length === 0 ? <EmptyState title="Sin detalle" text="Agrega al menos un producto o servicio para emitir la factura." /> : null}
        {lineas.map((linea, index) => {
          const quantity = toNumber(linea.cantidad);
          const price = toNumber(linea.precio);
          const discount = toNumber(linea.descuento);
          const base = Math.max(quantity * price - discount, 0);
          const rate = toNumber(linea.tarifa);
          const total = base + base * (rate / 100);

          return (
            <View key={`linea-factura-${index}`} style={styles.invoiceLineCard}>
              <View style={styles.clientCardHeader}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{linea.producto.descripcion ?? linea.producto.codprincipal}</Text>
                  <Text style={styles.clientMeta}>Codigo: {linea.producto.codprincipal ?? linea.producto.codproducto}</Text>
                </View>
                <Text style={styles.invoiceLineTotal}>{formatMoney(total)}</Text>
              </View>
              <Field label="Detalle adicional o concepto extendido" value={form.detalleLinea} onChangeText={(value) => onChange('detalleLinea', value)} />
              <View style={styles.clientDetailGrid}>
                <Field label="Cant." value={linea.cantidad} onChangeText={(value) => onUpdateLinea(index, 'cantidad', value)} keyboardType="decimal-pad" />
                <Field label="Precio" value={linea.precio} onChangeText={(value) => onUpdateLinea(index, 'precio', value)} keyboardType="decimal-pad" />
              </View>
              <View style={styles.clientDetailGrid}>
                <Field label="Descuento" value={linea.descuento} onChangeText={(value) => onUpdateLinea(index, 'descuento', value)} keyboardType="decimal-pad" />
                {ivaOptions.length > 0 ? (
                  <DropdownField
                    label="IVA"
                    options={ivaOptions.map((item, optionIndex) => ({ label: item.descripcion || `${item.valorCalculo ?? item.valor ?? 0}%`, value: optionIndex + 1 }))}
                    value={Math.max(ivaOptions.findIndex((item) => Number(item.valorCalculo ?? item.valor ?? 0) === rate) + 1, 0) || null}
                    onChange={(value) => onUpdateLinea(index, 'tarifa', value ? String(ivaOptions[value - 1]?.valorCalculo ?? ivaOptions[value - 1]?.valor ?? 0) : '0')}
                    allowClear
                  />
                ) : (
                  <Field label="IVA %" value={linea.tarifa} onChangeText={(value) => onUpdateLinea(index, 'tarifa', value)} keyboardType="decimal-pad" />
                )}
              </View>
              <View style={styles.clientDetailGrid}>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Desc. apl.</Text>
                  <Text style={styles.clientDetailValue}>{formatMoney(discount)}</Text>
                </View>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Base imp.</Text>
                  <Text style={styles.clientDetailValue}>{formatMoney(base)}</Text>
                </View>
              </View>
              <SecondaryButton label="Quitar linea" onPress={() => onRemoveLinea(index)} />
            </View>
          );
        })}
      </View>
      <View style={styles.formActions}>
        <SecondaryButton label="Volver al cliente" onPress={() => setStep(0)} />
        <PrimaryButton label="Continuar con revisión" loading={false} onPress={nextStep} />
      </View>
      </> : null}
      {step === 2 ? <>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Cobro y datos finales</Text>
          <Text style={styles.invoicePanelPill}>Último paso</Text>
        </View>
        <View style={styles.invoiceChargeBox}>
          <Text style={styles.clientFormSubtitle}>Forma de pago</Text>
          <DropdownField
            label="Forma de pago (SRI)"
            options={formaPagoOptions.map((item, index) => ({ label: item.descripcionSri || item.descripcion || item.codigo || `Forma ${index + 1}`, value: index + 1 }))}
            value={Math.max(formaPagoOptions.findIndex((item) => item.codigo === form.formaPago) + 1, 0) || null}
            onChange={(value) => onChange('formaPago', value ? formaPagoOptions[value - 1]?.codigo ?? '' : '')}
            allowClear
          />
        </View>
        <DropdownField
          label="Serie"
          options={serieOptions.map((item, index) => ({ label: item.serieVisual || item.serieRaw || `Serie ${index + 1}`, value: index + 1 }))}
          value={Math.max(serieOptions.findIndex((item) => item.serieRaw === form.serie || item.serieVisual === form.serie) + 1, 0) || null}
          onChange={(value) => onChange('serie', value ? serieOptions[value - 1]?.serieRaw ?? serieOptions[value - 1]?.serieVisual ?? '' : '')}
          allowClear
        />
        <Field label="Correo adicional (opcional)" value={form.correoAdicional} onChangeText={(value) => onChange('correoAdicional', value)} autoCapitalize="none" keyboardType="email-address" />
        <View style={styles.invoiceReferenceHeader}>
          <Text style={styles.clientFormSubtitle}>Nota o referencia</Text>
          <Text style={styles.invoicePanelPill}>{referenciaWords} / 100 palabras</Text>
        </View>
        <Field label="Observaciones (opcional)" value={form.referencia} onChangeText={(value) => onChange('referencia', value)} />
      </View>
      <View style={styles.invoiceBottomGrid}>
        <View style={[styles.formSectionBox, styles.invoiceFrequentBox]}>
          <Text style={styles.clientFormSubtitle}>Productos frecuentes del cliente</Text>
          <Text style={styles.invoiceSectionHelp}>Selecciona un cliente para usar sus productos habituales</Text>
          {displayProductos.length === 0 ? <Text style={styles.clientMeta}>Busca productos para mostrarlos aqui.</Text> : null}
          {displayProductos.map((producto) => (
            <Pressable key={`producto-frecuente-${producto.codproducto}`} style={styles.invoiceFrequentItem} onPress={() => onAddProducto(producto)}>
              <Text style={styles.clientName}>{producto.descripcion ?? producto.codprincipal ?? 'Producto'}</Text>
              <Text style={styles.clientMeta}>{producto.codprincipal ?? 'Sin codigo'} - {formatMoney(producto.precioUnitario)}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[styles.formSectionBox, styles.invoiceSummaryBox]}>
          <Text style={styles.clientFormSubtitle}>Resumen</Text>
          <Text style={styles.invoiceSectionHelp}>Totales del comprobante</Text>
          <InvoiceSummaryRow label="Subtotal base gravada" value={totals.baseTaxed} />
          <InvoiceSummaryRow label="Subtotal base 0%" value={totals.baseZero} />
          <InvoiceSummaryRow label="Subtotal no objeto IVA" value={0} />
          <InvoiceSummaryRow label="Subtotal exento IVA" value={0} />
          <InvoiceSummaryRow label="Descuento" value={totals.discount} danger />
          <InvoiceSummaryRow label="Subtotal con descuento" value={totals.baseTaxed + totals.baseZero} />
          <InvoiceSummaryRow label="ICE" value={0} />
          <InvoiceSummaryRow label="Servicio 10%" value={0} />
          <InvoiceSummaryRow label="IRBPNR" value={0} />
          <View style={styles.invoiceTotalRow}>
            <Text style={styles.invoiceTotalLabel}>Total</Text>
            <Text style={styles.invoiceTotalValue}>{formatMoney(totals.total)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.formActions}>
        <SecondaryButton label="Volver a productos" onPress={() => setStep(1)} />
        <SecondaryButton label="Limpiar" onPress={handleClear} />
        <PrimaryButton label="Generar factura" loading={saving} onPress={onSave} />
      </View>
      </> : null}
    </>
  );
}

function InvoiceSummaryRow({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
  return (
    <View style={styles.invoiceSummaryRow}>
      <Text style={styles.invoiceSummaryLabel}>{label}</Text>
      <Text style={[styles.invoiceSummaryValue, danger && styles.invoiceSummaryDanger]}>{formatMoney(value)}</Text>
    </View>
  );
}

function NuevaNotaCreditoMobileScreen({
  form,
  preparacion,
  factura,
  facturas,
  cliente,
  lineas,
  loading,
  saving,
  message,
  onChange,
  onSearchFacturas,
  onSelectFactura,
  onAddLinea,
  onUpdateLinea,
  onRemoveLinea,
  onClear,
  onSave,
}: {
  form: NotaCreditoFormState;
  preparacion: FacturaPreparacion | null;
  factura: FacturaListItem | null;
  facturas: FacturaListItem[];
  cliente: Cliente | null;
  lineas: NuevaFacturaLinea[];
  loading: boolean;
  saving: boolean;
  message?: MessageState;
  onChange: (field: keyof NotaCreditoFormState, value: string) => void;
  onSearchFacturas: () => void;
  onSelectFactura: (factura: FacturaListItem) => void;
  onAddLinea: (producto: FacturaProducto) => void;
  onUpdateLinea: (index: number, field: keyof Omit<NuevaFacturaLinea, 'producto'>, value: string) => void;
  onRemoveLinea: (index: number) => void;
  onClear: () => void;
  onSave: () => void;
}) {
  const toNumber = (value: string) => Number(value.replace(',', '.')) || 0;
  const totals = lineas.reduce(
    (acc, item) => {
      const base = Math.max(toNumber(item.cantidad) * toNumber(item.precio) - toNumber(item.descuento), 0);
      const iva = base * (toNumber(item.tarifa) / 100);
      return {
        subtotal: acc.subtotal + base,
        descuento: acc.descuento + toNumber(item.descuento),
        iva: acc.iva + iva,
        ivaZero: toNumber(item.tarifa) <= 0 ? acc.ivaZero + base : acc.ivaZero,
        total: acc.total + base + iva,
      };
    },
    { subtotal: 0, descuento: 0, iva: 0, ivaZero: 0, total: 0 },
  );
  const serieOptions = preparacion?.series ?? [];
  const selectedSerie = serieOptions.find((item) => item.serieRaw === form.serie || item.serieVisual === form.serie);
  const serieLabel = selectedSerie?.serieVisual || selectedSerie?.serieRaw || form.serie || '001-002';
  const notaNumber = form.numeroFactura || String((preparacion?.caja?.sec ?? 0) + 1).padStart(9, '0');
  const addDefaultLine = () => onAddLinea({
    codproducto: 0,
    codprincipal: 'NC',
    descripcion: factura ? `Ajuste factura ${factura.numeroCompleto ?? factura.numfactura ?? ''}`.trim() : 'Detalle nota de credito',
    precioUnitario: Number(factura?.total ?? 0.01),
    tarifaIva: 0,
  });

  return (
    <>
      <View style={[styles.adminHeroCard, styles.invoiceHeroCard]}>
        <View style={styles.invoiceHeroText}>
          <Text style={styles.heroEyebrow}>Documento de ajuste</Text>
          <Text style={styles.heroTitle}>Nueva nota de credito</Text>
          <Text style={styles.heroText}>Parte de la factura original, corrige el detalle y conserva una vista clara.</Text>
        </View>
        <View style={styles.invoiceHeaderActions}>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Serie</Text>
            <Text style={styles.invoiceHeaderValue}>{serieLabel}</Text>
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Nota de credito</Text>
            <Text style={styles.invoiceHeaderValue}>{notaNumber}</Text>
          </View>
          <SecondaryButton label="Historial" onPress={onClear} />
          <SecondaryButton label="Limpiar pantalla" onPress={onClear} />
        </View>
      </View>
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando notas de credito...</Text>
        </View>
      ) : null}
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Opciones de emision</Text>
        <Text style={styles.invoiceSectionHelp}>Tambien puedes emitir la nota de credito de estas formas</Text>
        <View style={styles.invoiceGrid}>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceHeaderValue}>Manual</Text>
            <Text style={styles.invoiceSectionHelp}>Ingresa cliente, motivo y detalle sin partir del buscador.</Text>
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceHeaderValue}>Desde XML</Text>
            <Text style={styles.invoiceSectionHelp}>Carga el XML de la factura para precargar datos y ajustar el detalle.</Text>
          </View>
        </View>
      </View>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Buscador de factura</Text>
        <Text style={styles.invoiceSectionHelp}>Encuentra la Factura Modificada para emitir la nota de credito</Text>
        <SearchField label="Encontrar factura" placeholder="Numero completo o secuencial" value={form.facturaBusqueda} onChangeText={(value) => onChange('facturaBusqueda', value)} resultCount={facturas.length} onSubmit={onSearchFacturas} />
        <View style={styles.listStack}>
          {facturas.map((item, index) => (
            <Pressable key={`nota-factura-${item.codfactura}-${index}`} style={styles.clientCard} onPress={() => onSelectFactura(item)}>
              <Text style={styles.clientName}>{item.numeroCompleto ?? item.numfactura ?? `Factura ${item.codfactura}`}</Text>
              <Text style={styles.clientMeta}>{item.cliente ?? 'Consumidor final'} - {formatMoney(item.total)}</Text>
            </Pressable>
          ))}
        </View>
        {factura ? <Text style={styles.profileValue}>Factura modificada: {factura.numeroCompleto ?? factura.numfactura}</Text> : null}
      </View>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Informacion del Cliente</Text>
          <Text style={styles.invoicePanelPill}>Cargado desde factura</Text>
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Tipo identificacion" value={form.tipoIdentificacion} onChangeText={(value) => onChange('tipoIdentificacion', value)} />
          <Field label="Numero identificacion" value={cliente?.numeroidentificacion ?? ''} onChangeText={() => undefined} />
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Tipo cliente" value={form.tipoCliente} onChangeText={(value) => onChange('tipoCliente', value)} />
          <Field label="Obligado a llevar contabilidad" value={form.obligadoContabilidad} onChangeText={(value) => onChange('obligadoContabilidad', value)} />
        </View>
        <Field label="Nombre / razon social" value={cliente ? getClienteDisplayName(cliente) : form.clienteBusqueda} onChangeText={(value) => onChange('clienteBusqueda', value)} />
        <Field label="Direccion (max 100)" value={form.direccion} onChangeText={(value) => onChange('direccion', value)} />
        <View style={styles.invoiceGrid}>
          <Field label="Telefono" value={form.telefono} onChangeText={(value) => onChange('telefono', value)} keyboardType="phone-pad" />
          <Field label="Correo electronico principal" value={form.correoPrincipal} onChangeText={(value) => onChange('correoPrincipal', value)} autoCapitalize="none" keyboardType="email-address" />
        </View>
        <SecondaryButton label="Agregar correo" onPress={() => onChange('correoAdicional', form.correoPrincipal)} />
        <View style={styles.invoiceGrid}>
          <DropdownField
            label="Motivo de la nota de credito"
            options={[
              { label: 'Anular operaciones', value: 1 },
              { label: 'Devolucion parcial', value: 2 },
              { label: 'Descuento o bonificacion', value: 3 },
              { label: 'Correccion de valores', value: 4 },
            ]}
            value={Math.max(['Anular operaciones', 'Devolucion parcial', 'Descuento o bonificacion', 'Correccion de valores'].findIndex((item) => item === form.motivo) + 1, 1)}
            onChange={(value) => onChange('motivo', ['Anular operaciones', 'Devolucion parcial', 'Descuento o bonificacion', 'Correccion de valores'][(value ?? 1) - 1])}
          />
          <Field label="Observacion (max 250 caracteres)" value={form.observacion} onChangeText={(value) => onChange('observacion', value.slice(0, 250))} />
        </View>
      </View>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Detalle de Nota de Credito</Text>
        </View>
        <SecondaryButton label="Agregar detalle" onPress={addDefaultLine} />
        {lineas.length === 0 ? <EmptyState title="Sin detalle" text="Agrega el detalle que sera ajustado por la nota de credito." /> : null}
        {lineas.map((linea, index) => {
          const base = Math.max(toNumber(linea.cantidad) * toNumber(linea.precio) - toNumber(linea.descuento), 0);
          const total = base + base * (toNumber(linea.tarifa) / 100);
          return (
            <View key={`linea-nota-credito-${index}`} style={styles.invoiceLineCard}>
              <View style={styles.clientCardHeader}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{linea.producto.descripcion ?? linea.producto.codprincipal}</Text>
                  <Text style={styles.clientMeta}>Codigo: {linea.producto.codprincipal ?? linea.producto.codproducto}</Text>
                </View>
                <Text style={styles.invoiceLineTotal}>{formatMoney(total)}</Text>
              </View>
              <Field label="Detalle adicional o concepto extendido" value={form.detalleLinea} onChangeText={(value) => onChange('detalleLinea', value)} />
              <View style={styles.clientDetailGrid}>
                <Field label="Cant." value={linea.cantidad} onChangeText={(value) => onUpdateLinea(index, 'cantidad', value)} keyboardType="decimal-pad" />
                <Field label="Precio" value={linea.precio} onChangeText={(value) => onUpdateLinea(index, 'precio', value)} keyboardType="decimal-pad" />
              </View>
              <View style={styles.clientDetailGrid}>
                <Field label="Descuento" value={linea.descuento} onChangeText={(value) => onUpdateLinea(index, 'descuento', value)} keyboardType="decimal-pad" />
                <Field label="IVA %" value={linea.tarifa} onChangeText={(value) => onUpdateLinea(index, 'tarifa', value)} keyboardType="decimal-pad" />
              </View>
              <SecondaryButton label="Quitar linea" onPress={() => onRemoveLinea(index)} />
            </View>
          );
        })}
      </View>
      <View style={[styles.formSectionBox, styles.invoiceSummaryBox]}>
        <Text style={styles.clientFormSubtitle}>Resumen</Text>
        <Text style={styles.invoiceSectionHelp}>Totales del comprobante</Text>
        <InvoiceSummaryRow label="Subtotal" value={totals.subtotal} />
        <InvoiceSummaryRow label="Descuento" value={totals.descuento} danger />
        <InvoiceSummaryRow label="Subtotal + ICE" value={totals.subtotal} />
        <InvoiceSummaryRow label="ICE" value={0} />
        <InvoiceSummaryRow label="IVA" value={totals.iva} />
        <InvoiceSummaryRow label="IVA 0%" value={totals.ivaZero} />
        <View style={styles.invoiceTotalRow}>
          <Text style={styles.invoiceTotalLabel}>Total</Text>
          <Text style={styles.invoiceTotalValue}>{formatMoney(totals.total)}</Text>
        </View>
      </View>
      <View style={styles.formActions}>
        <SecondaryButton label="Previsualizar PDF" onPress={() => Alert.alert('Previsualizar PDF', 'Genera la nota de credito para consultar el PDF.')} />
        <SecondaryButton label="Cancelar / limpiar" onPress={onClear} />
        <PrimaryButton label="Generar Nota de Credito" loading={saving} onPress={onSave} />
      </View>
    </>
  );
}

type DocumentAction = {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  tone: 'primary' | 'success' | 'danger' | 'warning' | 'purple';
  onPress: () => void;
};

function DocumentActionsMenu({ actions }: { actions: DocumentAction[] }) {
  const [open, setOpen] = useState(false);
  const toneColor = (tone: DocumentAction['tone']) => {
    if (tone === 'success') return '#0F6B32';
    if (tone === 'danger') return '#8A1B1B';
    if (tone === 'warning') return '#8A4B12';
    if (tone === 'purple') return '#5630A8';
    return '#004F88';
  };

  return (
    <View style={styles.documentActionWrap}>
      <Pressable style={styles.documentActionTrigger} onPress={() => setOpen((value) => !value)} accessibilityLabel="Ver acciones">
        <MaterialCommunityIcons name="dots-horizontal" size={21} color="#294D69" />
      </Pressable>
      {open ? (
        <View style={styles.documentActionMenu}>
          {actions.map((action) => {
            const color = toneColor(action.tone);
            return (
              <Pressable
                key={action.label}
                style={styles.documentActionItem}
                onPress={() => {
                  setOpen(false);
                  action.onPress();
                }}
              >
                <View style={styles.documentActionIcon}>
                  <MaterialCommunityIcons name={action.icon} size={16} color={color} />
                </View>
                <Text style={[styles.documentActionText, { color }]}>{action.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function MisNotasCreditoMobileScreen({
  notas,
  loading,
  message,
  onRefresh,
  onPdf,
  onXml,
  onEmail,
}: {
  notas: NotaCreditoListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (nota: NotaCreditoListItem) => void;
  onXml: (nota: NotaCreditoListItem) => void;
  onEmail: (nota: NotaCreditoListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const visibleNotas = notas.filter((nota) => {
    const term = filter.trim().toLowerCase();
    const matchesText = !term || [
      nota.numeroNota,
      nota.facturaModificada,
      nota.cliente,
      nota.identificacionCliente,
      nota.estadoSri,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    const isAuthorized = nota.autorizado || String(nota.estadoSri ?? '').toUpperCase().includes('AUTORIZ');
    const matchesStatus = statusFilter === 1 || (statusFilter === 2 && isAuthorized) || (statusFilter === 3 && !isAuthorized);
    return matchesText && matchesStatus;
  });
  const total = visibleNotas.reduce((sum, nota) => sum + Number(nota.total ?? 0), 0);
  const autorizadas = visibleNotas.filter((nota) => nota.autorizado || String(nota.estadoSri ?? '').toUpperCase().includes('AUTORIZ')).length;

  return (
    <>
      <View style={styles.adminHeroCard}>
        <Text style={styles.heroEyebrow}>Ajustes emitidos</Text>
        <Text style={styles.heroTitle}>Mis notas de credito con filtros, reporte y acciones unificadas</Text>
        <Text style={styles.heroText}>Busca por cliente, documento modificado o motivo, exporta el resultado visible y abre el XML o PDF desde la misma vista.</Text>
      </View>
      <View style={styles.metricGrid}>
        <MetricBox value={visibleNotas.length} label="Notas filtradas" />
        <MetricBox value={formatMoney(total)} label="Total filtrado" />
        <MetricBox value={autorizadas} label="Autorizadas" />
      </View>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
        <Text style={styles.clientName}>Notas de credito generadas</Text>
        <SearchField label="Buscar notas de credito" placeholder="Numero, factura, cliente o identificacion" value={filter} onChangeText={setFilter} resultCount={visibleNotas.length} totalCount={notas.length} />
        <DropdownField
          label="Estado SRI"
          options={[
            { label: 'Todos', value: 1 },
            { label: 'Autorizadas', value: 2 },
            { label: 'No autorizadas', value: 3 },
          ]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value ?? 1)}
        />
        <View style={styles.formActions}>
          <SecondaryButton label="Descargar Excel" onPress={() => Alert.alert('Descargar Excel', 'Exportacion pendiente de endpoint movil.')} />
          <PrimaryButton label="Refrescar" loading={loading} onPress={onRefresh} />
        </View>
      </View>
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando notas de credito...</Text>
        </View>
      ) : null}
      {!loading && visibleNotas.length === 0 ? <EmptyState title="Sin notas de credito" text="Cuando generes notas de credito, apareceran aqui." /> : null}
      <View style={styles.listStack}>
        {visibleNotas.map((nota, index) => {
          const notaKey = listItemKey('mis-notas-credito', [nota.codNotaCredito, nota.numeroNota, nota.facturaModificada], index);
          return (
            <View key={notaKey} style={styles.clientCard}>
              <View style={styles.clientCardHeader}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{nota.numeroNota ?? `Nota ${nota.codNotaCredito}`}</Text>
                  <Text style={styles.clientMeta}>Factura modificada: {nota.facturaModificada ?? '-'} - {nota.cliente ?? 'Consumidor final'}</Text>
                </View>
                <View style={styles.systemPill}>
                  <Text style={styles.systemPillText}>{nota.estadoSri ?? (nota.autorizado ? 'AUTORIZADO' : 'NO AUTORIZADO')}</Text>
                </View>
              </View>
              <View style={styles.clientDetailGrid}>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Fecha sustento</Text>
                  <Text style={styles.clientDetailValue}>{formatDocumentDate(nota.fechaSustento)}</Text>
                </View>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Total</Text>
                  <Text style={styles.clientDetailValue}>{formatMoney(nota.total)}</Text>
                </View>
              </View>
              <DocumentActionsMenu actions={[
                { label: 'Ver', icon: 'eye-outline', tone: 'primary', onPress: () => onPdf(nota) },
                { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(nota) },
                { label: 'Descargar PDF', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(nota) },
                { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(nota) },
              ]} />
            </View>
          );
        })}
      </View>
    </>
  );
}

function NuevaNotaDebitoMobileScreen({
  form,
  preparacion,
  factura,
  facturas,
  cliente,
  lineas,
  loading,
  saving,
  message,
  onChange,
  onSearchFacturas,
  onSelectFactura,
  onAddLinea,
  onUpdateLinea,
  onRemoveLinea,
  onClear,
  onSave,
}: {
  form: NotaDebitoFormState;
  preparacion: FacturaPreparacion | null;
  factura: FacturaListItem | null;
  facturas: FacturaListItem[];
  cliente: Cliente | null;
  lineas: NotaDebitoLinea[];
  loading: boolean;
  saving: boolean;
  message?: MessageState;
  onChange: (field: keyof NotaDebitoFormState, value: string) => void;
  onSearchFacturas: () => void;
  onSelectFactura: (factura: FacturaListItem) => void;
  onAddLinea: () => void;
  onUpdateLinea: (index: number, field: keyof NotaDebitoLinea, value: string) => void;
  onRemoveLinea: (index: number) => void;
  onClear: () => void;
  onSave: () => void;
}) {
  const toNumber = (value: string) => Number(value.replace(',', '.')) || 0;
  const totals = lineas.reduce(
    (acc, item) => {
      const base = toNumber(item.precio);
      const ice = toNumber(item.valorIce);
      const iva = (base + ice) * (toNumber(item.tarifa) / 100);
      return {
        subtotal: acc.subtotal + base,
        ice: acc.ice + ice,
        iva: acc.iva + iva,
        ivaZero: toNumber(item.tarifa) <= 0 ? acc.ivaZero + base + ice : acc.ivaZero,
        total: acc.total + base + ice + iva,
      };
    },
    { subtotal: 0, ice: 0, iva: 0, ivaZero: 0, total: 0 },
  );
  const serieOptions = preparacion?.series ?? [];
  const selectedSerie = serieOptions.find((item) => item.serieRaw === form.serie || item.serieVisual === form.serie);
  const serieLabel = selectedSerie?.serieVisual || selectedSerie?.serieRaw || form.serie || '001-002';
  const notaNumber = form.numeroFactura || String((preparacion?.caja?.sec ?? 1158) + 1).padStart(9, '0');

  return (
    <>
      <View style={[styles.adminHeroCard, styles.invoiceHeroCard]}>
        <View style={styles.invoiceHeroText}>
          <Text style={styles.heroEyebrow}>Documento de ajuste</Text>
          <Text style={styles.heroTitle}>Nueva nota de debito</Text>
          <Text style={styles.heroText}>Emite cargos por intereses, costos o gastos posteriores a la factura.</Text>
        </View>
        <View style={styles.invoiceHeaderActions}>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Serie</Text>
            <Text style={styles.invoiceHeaderValue}>{serieLabel}</Text>
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Nota de debito</Text>
            <Text style={styles.invoiceHeaderValue}>{notaNumber}</Text>
          </View>
          <SecondaryButton label="Historial" onPress={onClear} />
          <SecondaryButton label="Limpiar pantalla" onPress={onClear} />
        </View>
      </View>
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando notas de debito...</Text>
        </View>
      ) : null}
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Opciones de emision</Text>
        <Text style={styles.invoiceSectionHelp}>Tambien puedes emitir la nota de debito de estas formas</Text>
        <View style={styles.invoiceGrid}>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceHeaderValue}>Manual</Text>
            <Text style={styles.invoiceSectionHelp}>Ingresa cliente, factura modificada, motivo y detalle directamente.</Text>
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceHeaderValue}>Desde XML</Text>
            <Text style={styles.invoiceSectionHelp}>Carga el XML de la factura para precargar datos y editar valores.</Text>
          </View>
        </View>
      </View>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Buscador de factura</Text>
        <Text style={styles.invoiceSectionHelp}>Encuentra la Factura Modificada para emitir la nota de debito</Text>
        <SearchField label="Encontrar factura" placeholder="Numero completo o secuencial" value={form.facturaBusqueda} onChangeText={(value) => onChange('facturaBusqueda', value)} resultCount={facturas.length} onSubmit={onSearchFacturas} />
        <View style={styles.listStack}>
          {facturas.map((item, index) => (
            <Pressable key={`debito-factura-${item.codfactura}-${index}`} style={styles.clientCard} onPress={() => onSelectFactura(item)}>
              <Text style={styles.clientName}>{item.numeroCompleto ?? item.numfactura ?? `Factura ${item.codfactura}`}</Text>
              <Text style={styles.clientMeta}>{item.cliente ?? 'Consumidor final'} - {formatMoney(item.total)}</Text>
            </Pressable>
          ))}
        </View>
        {factura ? <Text style={styles.profileValue}>Factura modificada: {factura.numeroCompleto ?? factura.numfactura}</Text> : null}
      </View>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Informacion del Cliente</Text>
          <Text style={styles.invoicePanelPill}>Datos del documento</Text>
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Tipo identificacion" value={form.tipoIdentificacion} onChangeText={(value) => onChange('tipoIdentificacion', value)} />
          <Field label="Numero identificacion" value={cliente?.numeroidentificacion ?? ''} onChangeText={() => undefined} />
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Tipo cliente" value={form.tipoCliente} onChangeText={(value) => onChange('tipoCliente', value)} />
          <Field label="Obligado a llevar contabilidad" value={form.obligadoContabilidad} onChangeText={(value) => onChange('obligadoContabilidad', value)} />
        </View>
        <Field label="Nombre / razon social" value={cliente ? getClienteDisplayName(cliente) : form.clienteBusqueda} onChangeText={(value) => onChange('clienteBusqueda', value)} />
        <Field label="Direccion" value={form.direccion} onChangeText={(value) => onChange('direccion', value)} />
        <View style={styles.invoiceGrid}>
          <Field label="Telefono (opcional)" value={form.telefono} onChangeText={(value) => onChange('telefono', value)} keyboardType="phone-pad" />
          <Field label="Correo electronico principal" value={form.correoPrincipal} onChangeText={(value) => onChange('correoPrincipal', value)} autoCapitalize="none" keyboardType="email-address" />
        </View>
        <SecondaryButton label="Agregar correo" onPress={() => onChange('correoAdicional', form.correoPrincipal)} />
      </View>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Detalle de la Nota de Debito</Text>
        </View>
        <SecondaryButton label="Agregar detalle" onPress={onAddLinea} />
        {lineas.map((linea, index) => {
          const base = toNumber(linea.precio);
          const ice = toNumber(linea.valorIce);
          const iva = (base + ice) * (toNumber(linea.tarifa) / 100);
          const total = base + ice + iva;
          return (
            <View key={`linea-nota-debito-${index}`} style={styles.invoiceLineCard}>
              <View style={styles.clientCardHeader}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{linea.descripcion || 'Motivo de la nota de debito'}</Text>
                  <Text style={styles.clientMeta}>Tarifa IVA {linea.tarifa || '0'}% - ICE {formatMoney(ice)}</Text>
                </View>
                <Text style={styles.invoiceLineTotal}>{formatMoney(total)}</Text>
              </View>
              <Field label="Descripcion" value={linea.descripcion} onChangeText={(value) => onUpdateLinea(index, 'descripcion', value)} />
              <View style={styles.clientDetailGrid}>
                <Field label="Precio" value={linea.precio} onChangeText={(value) => onUpdateLinea(index, 'precio', value)} keyboardType="decimal-pad" />
                <Field label="Tarifa IVA" value={linea.tarifa} onChangeText={(value) => onUpdateLinea(index, 'tarifa', value)} keyboardType="decimal-pad" />
              </View>
              <View style={styles.clientDetailGrid}>
                <Field label="Impuestos ICE" value={linea.impuestoIce} onChangeText={(value) => onUpdateLinea(index, 'impuestoIce', value)} />
                <Field label="Valor ICE" value={linea.valorIce} onChangeText={(value) => onUpdateLinea(index, 'valorIce', value)} keyboardType="decimal-pad" />
              </View>
              <SecondaryButton label="Quitar linea" onPress={() => onRemoveLinea(index)} />
            </View>
          );
        })}
      </View>
      <View style={[styles.formSectionBox, styles.invoiceSummaryBox]}>
        <Text style={styles.clientFormSubtitle}>Resumen</Text>
        <Text style={styles.invoiceSectionHelp}>Totales del comprobante</Text>
        <InvoiceSummaryRow label="Subtotal" value={totals.subtotal} />
        <InvoiceSummaryRow label="Descuento" value={0} danger />
        <InvoiceSummaryRow label="Subtotal + ICE" value={totals.subtotal + totals.ice} />
        <InvoiceSummaryRow label="ICE" value={totals.ice} />
        <InvoiceSummaryRow label="IVA 15%" value={totals.iva} />
        <InvoiceSummaryRow label="IVA 0%" value={totals.ivaZero} />
        <View style={styles.invoiceTotalRow}>
          <Text style={styles.invoiceTotalLabel}>Total</Text>
          <Text style={styles.invoiceTotalValue}>{formatMoney(totals.total)}</Text>
        </View>
      </View>
      <View style={styles.formActions}>
        <SecondaryButton label="Previsualizar PDF" onPress={() => Alert.alert('Previsualizar PDF', 'Genera la nota de debito para consultar el PDF.')} />
        <SecondaryButton label="Cancelar / limpiar" onPress={onClear} />
        <PrimaryButton label="Generar Nota de Debito" loading={saving} onPress={onSave} />
      </View>
    </>
  );
}

function MisNotasDebitoMobileScreen({
  notas,
  loading,
  message,
  onRefresh,
  onPdf,
  onXml,
  onEmail,
}: {
  notas: NotaDebitoListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (nota: NotaDebitoListItem) => void;
  onXml: (nota: NotaDebitoListItem) => void;
  onEmail: (nota: NotaDebitoListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const visibleNotas = notas.filter((nota) => {
    const term = filter.trim().toLowerCase();
    const matchesText = !term || [nota.numeroNota, nota.facturaModificada, nota.cliente, nota.identificacionCliente, nota.estadoSri].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    const isAuthorized = nota.autorizado || String(nota.estadoSri ?? '').toUpperCase().includes('AUTORIZ');
    const matchesStatus = statusFilter === 1 || (statusFilter === 2 && isAuthorized) || (statusFilter === 3 && !isAuthorized);
    return matchesText && matchesStatus;
  });
  const total = visibleNotas.reduce((sum, nota) => sum + Number(nota.total ?? 0), 0);
  const autorizadas = visibleNotas.filter((nota) => nota.autorizado || String(nota.estadoSri ?? '').toUpperCase().includes('AUTORIZ')).length;

  return (
    <>
      <View style={styles.adminHeroCard}>
        <Text style={styles.heroEyebrow}>Cargos emitidos</Text>
        <Text style={styles.heroTitle}>Mis notas de debito con filtros, reporte y acciones unificadas</Text>
        <Text style={styles.heroText}>Filtra por cliente, documento modificado o motivo, exporta tu consulta y abre cada comprobante.</Text>
      </View>
      <View style={styles.metricGrid}>
        <MetricBox value={visibleNotas.length} label="Notas filtradas" />
        <MetricBox value={formatMoney(total)} label="Total filtrado" />
        <MetricBox value={autorizadas} label="Autorizadas" />
      </View>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
        <Text style={styles.clientName}>Notas de debito generadas</Text>
        <SearchField label="Buscar notas de debito" placeholder="Numero, factura, cliente o identificacion" value={filter} onChangeText={setFilter} resultCount={visibleNotas.length} totalCount={notas.length} />
        <DropdownField
          label="Estado SRI"
          options={[
            { label: 'Todos', value: 1 },
            { label: 'Autorizadas', value: 2 },
            { label: 'No autorizadas', value: 3 },
          ]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value ?? 1)}
        />
        <View style={styles.formActions}>
          <SecondaryButton label="Descargar Excel" onPress={() => Alert.alert('Descargar Excel', 'Exportacion pendiente de endpoint movil.')} />
          <PrimaryButton label="Refrescar" loading={loading} onPress={onRefresh} />
        </View>
      </View>
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando notas de debito...</Text>
        </View>
      ) : null}
      {!loading && visibleNotas.length === 0 ? <EmptyState title="Sin notas de debito" text="Cuando generes notas de debito, apareceran aqui." /> : null}
      <View style={styles.listStack}>
        {visibleNotas.map((nota, index) => {
          const notaKey = listItemKey('mis-notas-debito', [nota.codNotaDebito, nota.numeroNota, nota.facturaModificada], index);
          return (
            <View key={notaKey} style={styles.clientCard}>
              <View style={styles.clientCardHeader}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{nota.numeroNota ?? `Nota ${nota.codNotaDebito}`}</Text>
                  <Text style={styles.clientMeta}>Factura modificada: {nota.facturaModificada ?? '-'} - {nota.cliente ?? 'Consumidor final'}</Text>
                </View>
                <View style={styles.systemPill}>
                  <Text style={styles.systemPillText}>{nota.estadoSri ?? (nota.autorizado ? 'AUTORIZADO' : 'PENDIENTE')}</Text>
                </View>
              </View>
              <View style={styles.clientDetailGrid}>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Fecha sustento</Text>
                  <Text style={styles.clientDetailValue}>{formatDocumentDate(nota.fechaSustento)}</Text>
                </View>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Total</Text>
                  <Text style={styles.clientDetailValue}>{formatMoney(nota.total)}</Text>
                </View>
              </View>
              <DocumentActionsMenu actions={[
                { label: 'Ver', icon: 'eye-outline', tone: 'primary', onPress: () => onPdf(nota) },
                { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(nota) },
                { label: 'Descargar PDF', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(nota) },
                { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(nota) },
              ]} />
            </View>
          );
        })}
      </View>
    </>
  );
}

function NuevaLiquidacionCompraMobileScreen({
  form,
  preparacion,
  proveedor,
  proveedores,
  productos,
  lineas,
  loading,
  saving,
  message,
  onChange,
  onSearchProveedores,
  onSelectProveedor,
  onSearchProductos,
  onAddProducto,
  onUpdateLinea,
  onRemoveLinea,
  onClear,
  onSave,
}: {
  form: LiquidacionCompraFormState;
  preparacion: FacturaPreparacion | null;
  proveedor: Cliente | null;
  proveedores: Cliente[];
  productos: FacturaProducto[];
  lineas: NuevaFacturaLinea[];
  loading: boolean;
  saving: boolean;
  message?: MessageState;
  onChange: (field: keyof LiquidacionCompraFormState, value: string) => void;
  onSearchProveedores: () => void;
  onSelectProveedor: (proveedor: Cliente) => void;
  onSearchProductos: () => void;
  onAddProducto: (producto: FacturaProducto) => void;
  onUpdateLinea: (index: number, field: keyof Omit<NuevaFacturaLinea, 'producto'>, value: string) => void;
  onRemoveLinea: (index: number) => void;
  onClear: () => void;
  onSave: () => void;
}) {
  const toNumber = (value: string) => Number(value.replace(',', '.')) || 0;
  const totals = lineas.reduce(
    (acc, item) => {
      const base = Math.max(toNumber(item.cantidad) * toNumber(item.precio) - toNumber(item.descuento), 0);
      const iva = base * (toNumber(item.tarifa) / 100);
      return { subtotal: acc.subtotal + base, descuento: acc.descuento + toNumber(item.descuento), iva: acc.iva + iva, total: acc.total + base + iva };
    },
    { subtotal: 0, descuento: 0, iva: 0, total: 0 },
  );
  const serieOptions = preparacion?.series ?? [];
  const formaPagoOptions = preparacion?.formasPago ?? [];
  const selectedSerie = serieOptions.find((item) => item.serieRaw === form.serie || item.serieVisual === form.serie);
  const serieLabel = selectedSerie?.serieVisual || selectedSerie?.serieRaw || form.serie || '001-002';

  return (
    <>
      <View style={[styles.adminHeroCard, styles.invoiceHeroCard]}>
        <View style={styles.invoiceHeroText}>
          <Text style={styles.heroEyebrow}>Documento de compra</Text>
          <Text style={styles.heroTitle}>Nueva liquidacion de compra</Text>
          <Text style={styles.heroText}>Completa proveedor, detalle y forma de pago con una vista limpia.</Text>
        </View>
        <View style={styles.invoiceHeaderActions}>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Serie</Text>
            <Text style={styles.invoiceHeaderValue}>{serieLabel}</Text>
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Liquidacion</Text>
            <Text style={styles.invoiceHeaderValue}>{form.numeroFactura || '-'}</Text>
          </View>
          <SecondaryButton label="Historial" onPress={onClear} />
          <SecondaryButton label="Limpiar pantalla" onPress={onClear} />
        </View>
      </View>
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando liquidaciones...</Text>
        </View>
      ) : null}
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Buscador de proveedor</Text>
        <Text style={styles.invoiceSectionHelp}>Encuentra o completa el proveedor de la liquidacion</Text>
        <SearchField label="Encontrar proveedor" placeholder="Identificacion o nombre" value={form.clienteBusqueda} onChangeText={(value) => onChange('clienteBusqueda', value)} resultCount={proveedores.length} onSubmit={onSearchProveedores} />
        <View style={styles.formActions}>
          <SecondaryButton label="Nuevo Proveedor" onPress={onSearchProveedores} />
        </View>
        <View style={styles.listStack}>
          {proveedores.map((item, index) => (
            <Pressable key={`liquidacion-proveedor-${getClienteKey(item, index)}`} style={styles.clientCard} onPress={() => onSelectProveedor(item)}>
              <Text style={styles.clientName}>{getClienteDisplayName(item)}</Text>
              <Text style={styles.clientMeta}>{getClienteIdentification(item) || 'Sin identificacion'} - {getClienteEmail(item) || 'Sin correo'}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Datos del Documento</Text>
          <Text style={styles.invoicePanelPill}>Datos de proveedor y forma de pago de la liquidacion.</Text>
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Identificacion" value={proveedor?.numeroidentificacion ?? ''} onChangeText={() => undefined} />
          <Field label="Nombre proveedor" value={proveedor ? getClienteDisplayName(proveedor) : form.clienteBusqueda} onChangeText={(value) => onChange('clienteBusqueda', value)} />
          <Field label="Telefono" value={form.telefono} onChangeText={(value) => onChange('telefono', value)} keyboardType="phone-pad" />
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Correo electronico principal" value={form.correoPrincipal} onChangeText={(value) => onChange('correoPrincipal', value)} autoCapitalize="none" keyboardType="email-address" />
          <Field label="Direccion" value={form.direccion} onChangeText={(value) => onChange('direccion', value)} />
        </View>
        <SecondaryButton label="Agregar correo" onPress={() => onChange('correoAdicional', form.correoPrincipal)} />
        <View style={styles.invoiceGrid}>
          <DropdownField
            label="Forma de pago"
            options={formaPagoOptions.map((item, index) => ({ label: item.descripcionSri || item.descripcion || item.codigo || `Forma ${index + 1}`, value: index + 1 }))}
            value={Math.max(formaPagoOptions.findIndex((item) => item.codigo === form.formaPago) + 1, 0) || null}
            onChange={(value) => onChange('formaPago', value ? formaPagoOptions[value - 1]?.codigo ?? '' : '')}
            allowClear
          />
          <Field label="Dias de credito" value={form.diasCredito} onChangeText={(value) => onChange('diasCredito', value.replace(/[^\d]/g, ''))} keyboardType="number-pad" />
        </View>
      </View>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Detalle de la Liquidacion</Text>
          <Text style={styles.invoicePanelPill}>Registra los productos o servicios adquiridos.</Text>
        </View>
        <SearchField label="Encontrar producto o servicio" placeholder="Codigo, nombre o descripcion" value={form.productoBusqueda} onChangeText={(value) => onChange('productoBusqueda', value)} resultCount={productos.length} onSubmit={onSearchProductos} />
        <View style={styles.formActions}>
          <SecondaryButton label="Registrar nuevo producto" onPress={onSearchProductos} />
        </View>
        <View style={styles.listStack}>
          {productos.map((producto) => (
            <Pressable key={`liquidacion-producto-${producto.codproducto}`} style={styles.clientCard} onPress={() => onAddProducto(producto)}>
              <Text style={styles.clientName}>{producto.descripcion ?? producto.codprincipal ?? 'Producto'}</Text>
              <Text style={styles.clientMeta}>{producto.codprincipal ?? 'Sin codigo'} - {formatMoney(producto.precioUnitario)}</Text>
            </Pressable>
          ))}
        </View>
        {lineas.length === 0 ? <EmptyState title="Sin detalle" text="Agrega al menos un producto o servicio para emitir la liquidacion." /> : null}
        {lineas.map((linea, index) => {
          const base = Math.max(toNumber(linea.cantidad) * toNumber(linea.precio) - toNumber(linea.descuento), 0);
          const total = base + base * (toNumber(linea.tarifa) / 100);
          return (
            <View key={`linea-liquidacion-${index}`} style={styles.invoiceLineCard}>
              <View style={styles.clientCardHeader}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{linea.producto.descripcion ?? linea.producto.codprincipal}</Text>
                  <Text style={styles.clientMeta}>Codigo: {linea.producto.codprincipal ?? linea.producto.codproducto}</Text>
                </View>
                <Text style={styles.invoiceLineTotal}>{formatMoney(total)}</Text>
              </View>
              <Field label="Detalle adicional o concepto extendido" value={form.detalleLinea} onChangeText={(value) => onChange('detalleLinea', value)} />
              <View style={styles.clientDetailGrid}>
                <Field label="Cant." value={linea.cantidad} onChangeText={(value) => onUpdateLinea(index, 'cantidad', value)} keyboardType="decimal-pad" />
                <Field label="Precio" value={linea.precio} onChangeText={(value) => onUpdateLinea(index, 'precio', value)} keyboardType="decimal-pad" />
              </View>
              <View style={styles.clientDetailGrid}>
                <Field label="Descuento" value={linea.descuento} onChangeText={(value) => onUpdateLinea(index, 'descuento', value)} keyboardType="decimal-pad" />
                <Field label="IVA %" value={linea.tarifa} onChangeText={(value) => onUpdateLinea(index, 'tarifa', value)} keyboardType="decimal-pad" />
              </View>
              <SecondaryButton label="Quitar linea" onPress={() => onRemoveLinea(index)} />
            </View>
          );
        })}
      </View>
      <View style={[styles.formSectionBox, styles.invoiceSummaryBox]}>
        <Text style={styles.clientFormSubtitle}>Resumen</Text>
        <InvoiceSummaryRow label="Subtotal" value={totals.subtotal} />
        <InvoiceSummaryRow label="Descuento" value={totals.descuento} danger />
        <InvoiceSummaryRow label="Base imponible" value={totals.subtotal} />
        <InvoiceSummaryRow label="IVA" value={totals.iva} />
        <View style={styles.invoiceTotalRow}>
          <Text style={styles.invoiceTotalLabel}>Total</Text>
          <Text style={styles.invoiceTotalValue}>{formatMoney(totals.total)}</Text>
        </View>
      </View>
      <View style={styles.formActions}>
        <SecondaryButton label="Previsualizar PDF" onPress={() => Alert.alert('Previsualizar PDF', 'Genera la liquidacion para consultar el PDF.')} />
        <PrimaryButton label="Generar Liquidacion" loading={saving} onPress={onSave} />
        <SecondaryButton label="Cancelar / limpiar" onPress={onClear} />
      </View>
    </>
  );
}

function MisLiquidacionesCompraMobileScreen({
  liquidaciones,
  loading,
  message,
  onRefresh,
  onPdf,
  onXml,
  onEmail,
}: {
  liquidaciones: LiquidacionCompraListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (liquidacion: LiquidacionCompraListItem) => void;
  onXml: (liquidacion: LiquidacionCompraListItem) => void;
  onEmail: (liquidacion: LiquidacionCompraListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const visibleLiquidaciones = liquidaciones.filter((liquidacion) => {
    const term = filter.trim().toLowerCase();
    const matchesText = !term || [liquidacion.numero, liquidacion.fecha, liquidacion.proveedor, liquidacion.identificacionProveedor, liquidacion.estadoSri].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    const isAuthorized = liquidacion.autorizado || String(liquidacion.estadoSri ?? '').toUpperCase().includes('AUTORIZ');
    const matchesStatus = statusFilter === 1 || (statusFilter === 2 && isAuthorized) || (statusFilter === 3 && !isAuthorized);
    return matchesText && matchesStatus;
  });
  const total = visibleLiquidaciones.reduce((sum, item) => sum + Number(item.total ?? 0), 0);
  const autorizadas = visibleLiquidaciones.filter((item) => item.autorizado || String(item.estadoSri ?? '').toUpperCase().includes('AUTORIZ')).length;

  return (
    <>
      <View style={styles.adminHeroCard}>
        <Text style={styles.heroEyebrow}>Compras emitidas</Text>
        <Text style={styles.heroTitle}>Mis liquidaciones con filtros, reporte y acciones unificadas</Text>
        <Text style={styles.heroText}>Filtra por proveedor, numero o identificacion, exporta tu consulta y abre cada comprobante.</Text>
      </View>
      <View style={styles.metricGrid}>
        <MetricBox value={visibleLiquidaciones.length} label="Liquidaciones filtradas" />
        <MetricBox value={formatMoney(total)} label="Total filtrado" />
        <MetricBox value={autorizadas} label="Autorizadas" />
      </View>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
        <Text style={styles.clientName}>Liquidaciones de compra generadas</Text>
        <SearchField label="Buscar liquidaciones" placeholder="Numero, proveedor o identificacion" value={filter} onChangeText={setFilter} resultCount={visibleLiquidaciones.length} totalCount={liquidaciones.length} />
        <DropdownField
          label="Estado SRI"
          options={[{ label: 'Todos', value: 1 }, { label: 'Autorizadas', value: 2 }, { label: 'No autorizadas', value: 3 }]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value ?? 1)}
        />
        <View style={styles.formActions}>
          <SecondaryButton label="Descargar Excel" onPress={() => Alert.alert('Descargar Excel', 'Exportacion pendiente de endpoint movil.')} />
          <PrimaryButton label="Refrescar" loading={loading} onPress={onRefresh} />
        </View>
      </View>
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando liquidaciones...</Text>
        </View>
      ) : null}
      {!loading && visibleLiquidaciones.length === 0 ? <EmptyState title="Sin liquidaciones" text="Cuando generes liquidaciones de compra, apareceran aqui." /> : null}
      <View style={styles.listStack}>
        {visibleLiquidaciones.map((liquidacion, index) => {
          const key = listItemKey('mis-liquidaciones', [liquidacion.codLiquidacion, liquidacion.numero, liquidacion.identificacionProveedor], index);
          return (
            <View key={key} style={styles.clientCard}>
              <View style={styles.clientCardHeader}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{liquidacion.numero ?? `Liquidacion ${liquidacion.codLiquidacion}`}</Text>
                  <Text style={styles.clientMeta}>{liquidacion.proveedor ?? 'Proveedor'} - {liquidacion.identificacionProveedor ?? 'Sin identificacion'}</Text>
                </View>
                <View style={styles.systemPill}>
                  <Text style={styles.systemPillText}>{liquidacion.estadoSri ?? (liquidacion.autorizado ? 'AUTORIZADO' : 'NO AUTORIZADO')}</Text>
                </View>
              </View>
              <View style={styles.clientDetailGrid}>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Fecha</Text>
                  <Text style={styles.clientDetailValue}>{formatDocumentDate(liquidacion.fecha)}</Text>
                </View>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Base</Text>
                  <Text style={styles.clientDetailValue}>{formatMoney(liquidacion.base)}</Text>
                </View>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>IVA</Text>
                  <Text style={styles.clientDetailValue}>{formatMoney(liquidacion.iva)}</Text>
                </View>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Total</Text>
                  <Text style={styles.clientDetailValue}>{formatMoney(liquidacion.total)}</Text>
                </View>
              </View>
              <DocumentActionsMenu actions={[
                { label: 'Ver', icon: 'eye-outline', tone: 'primary', onPress: () => onPdf(liquidacion) },
                { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(liquidacion) },
                { label: 'Descargar PDF', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(liquidacion) },
                { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(liquidacion) },
              ]} />
            </View>
          );
        })}
      </View>
    </>
  );
}

function NuevaGuiaRemisionMobileScreen({
  form,
  preparacion,
  transportista,
  transportistas,
  cliente,
  clientes,
  factura,
  facturas,
  productos,
  detalles,
  loading,
  saving,
  message,
  onChange,
  onSearchTransportistas,
  onSelectTransportista,
  onSearchClientes,
  onSelectCliente,
  onSearchFacturas,
  onSelectFactura,
  onSearchProductos,
  onAddProducto,
  onUpdateDetalle,
  onRemoveDetalle,
  onClear,
  onSave,
}: {
  form: GuiaRemisionFormState;
  preparacion: FacturaPreparacion | null;
  transportista: Cliente | null;
  transportistas: Cliente[];
  cliente: Cliente | null;
  clientes: Cliente[];
  factura: FacturaListItem | null;
  facturas: FacturaListItem[];
  productos: FacturaProducto[];
  detalles: GuiaRemisionDetalle[];
  loading: boolean;
  saving: boolean;
  message?: MessageState;
  onChange: (field: keyof GuiaRemisionFormState, value: string | boolean) => void;
  onSearchTransportistas: () => void;
  onSelectTransportista: (transportista: Cliente) => void;
  onSearchClientes: () => void;
  onSelectCliente: (cliente: Cliente) => void;
  onSearchFacturas: () => void;
  onSelectFactura: (factura: FacturaListItem) => void;
  onSearchProductos: () => void;
  onAddProducto: (producto: FacturaProducto) => void;
  onUpdateDetalle: (index: number, value: string) => void;
  onRemoveDetalle: (index: number) => void;
  onClear: () => void;
  onSave: () => void;
}) {
  const serieOptions = preparacion?.series ?? [];
  const selectedSerie = serieOptions.find((item) => item.serieRaw === form.serie || item.serieVisual === form.serie);
  const serieLabel = selectedSerie?.serieVisual || selectedSerie?.serieRaw || form.serie || '001-002';
  const totalCantidad = detalles.reduce((sum, item) => sum + (Number(item.cantidad.replace(',', '.')) || 0), 0);

  return (
    <>
      <View style={[styles.adminHeroCard, styles.invoiceHeroCard]}>
        <View style={styles.invoiceHeroText}>
          <Text style={styles.heroEyebrow}>Auto carga desde factura</Text>
          <Text style={styles.heroTitle}>Nueva guia de remision</Text>
          <Text style={styles.heroText}>Carga la factura de origen, valida el traslado y guarda la guia de remision.</Text>
        </View>
        <View style={styles.invoiceHeaderActions}>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Serie guia</Text>
            <Text style={styles.invoiceHeaderValue}>{serieLabel}</Text>
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Numero de guia</Text>
            <Text style={styles.invoiceHeaderValue}>{form.numeroFactura || '-'}</Text>
          </View>
          <SecondaryButton label="Historial" onPress={onClear} />
          <SecondaryButton label="Limpiar pantalla" onPress={onClear} />
        </View>
      </View>
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando guias de remision...</Text>
        </View>
      ) : null}
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Datos operativos de la guia</Text>
          <Text style={styles.invoicePanelPill}>Completa transportista, destinatario y fechas</Text>
        </View>
        <SearchField label="Encontrar transportista" placeholder="Identificacion o razon social" value={form.transportistaBusqueda} onChangeText={(value) => onChange('transportistaBusqueda', value)} resultCount={transportistas.length} onSubmit={onSearchTransportistas} />
        <View style={styles.formActions}>
          <SecondaryButton label="Nuevo Transportista" onPress={onSearchTransportistas} />
        </View>
        <View style={styles.listStack}>
          {transportistas.map((item, index) => (
            <Pressable key={`guia-transportista-${getClienteKey(item, index)}`} style={styles.clientCard} onPress={() => onSelectTransportista(item)}>
              <Text style={styles.clientName}>{getClienteDisplayName(item)}</Text>
              <Text style={styles.clientMeta}>{getClienteIdentification(item) || 'Sin identificacion'}</Text>
            </Pressable>
          ))}
        </View>
        <SearchField label="Encontrar destinatario" placeholder="Identificacion o nombre del cliente" value={form.clienteBusquedaGuia} onChangeText={(value) => onChange('clienteBusquedaGuia', value)} resultCount={clientes.length} onSubmit={onSearchClientes} />
        <SearchField label="Vincular factura (opcional)" placeholder="Numero completo o secuencial" value={form.facturaBusqueda} onChangeText={(value) => onChange('facturaBusqueda', value)} resultCount={facturas.length} onSubmit={onSearchFacturas} />
        <View style={styles.listStack}>
          {clientes.map((item, index) => (
            <Pressable key={`guia-cliente-${getClienteKey(item, index)}`} style={styles.clientCard} onPress={() => onSelectCliente(item)}>
              <Text style={styles.clientName}>{getClienteDisplayName(item)}</Text>
              <Text style={styles.clientMeta}>{getClienteIdentification(item) || 'Sin identificacion'}</Text>
            </Pressable>
          ))}
          {facturas.map((item, index) => (
            <Pressable key={`guia-factura-${item.codfactura}-${index}`} style={styles.clientCard} onPress={() => onSelectFactura(item)}>
              <Text style={styles.clientName}>{item.numeroCompleto ?? item.numfactura ?? `Factura ${item.codfactura}`}</Text>
              <Text style={styles.clientMeta}>{item.cliente ?? 'Consumidor final'}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Punto de emision" value={form.serie} onChangeText={(value) => onChange('serie', value)} />
          <Field label="Placa" value={form.placa} onChangeText={(value) => onChange('placa', value)} autoCapitalize="characters" />
        </View>
        <View style={styles.invoiceBottomGrid}>
          <View style={styles.clientCard}>
            <Text style={styles.clientName}>Informacion del Transportista</Text>
            <Field label="Identificacion" value={transportista?.numeroidentificacion ?? ''} onChangeText={() => undefined} />
            <Field label="Razon social" value={transportista ? getClienteDisplayName(transportista) : ''} onChangeText={() => undefined} />
            <Field label="Contribuyente especial" value={form.contribuyenteEspecial} onChangeText={(value) => onChange('contribuyenteEspecial', value)} />
            <ToggleRow label="Obligado a llevar contabilidad" text="Marca si aplica para el transportista." value={form.transportistaObligadoContabilidad} onChange={(value) => onChange('transportistaObligadoContabilidad', value)} />
            <View style={styles.invoiceGrid}>
              <Field label="Fecha emision" value={form.fechaEmision} onChangeText={(value) => onChange('fechaEmision', value)} />
              <Field label="Fecha inicio traslado" value={form.fechaInicioTraslado} onChangeText={(value) => onChange('fechaInicioTraslado', value)} />
            </View>
            <View style={styles.invoiceGrid}>
              <Field label="Fecha fin traslado" value={form.fechaFinTraslado} onChangeText={(value) => onChange('fechaFinTraslado', value)} />
              <Field label="Detalle" value={form.referencia} onChangeText={(value) => onChange('referencia', value)} />
            </View>
            <Field label="Direccion de origen" value={form.direccionOrigen} onChangeText={(value) => onChange('direccionOrigen', value)} />
          </View>
          <View style={styles.clientCard}>
            <Text style={styles.clientName}>Informacion de cliente o factura</Text>
            <Text style={styles.clientMeta}>Destinatario: {cliente ? getClienteDisplayName(cliente) : factura?.cliente ?? '-'}</Text>
            <Text style={styles.clientMeta}>Identificacion: {cliente?.numeroidentificacion ?? factura?.identificacionCliente ?? '-'}</Text>
            <Text style={styles.clientMeta}>Factura: {factura?.numeroCompleto ?? factura?.numfactura ?? '-'}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Detalles de traslado</Text>
          <Text style={styles.invoicePanelPill}>Se cargan automaticamente desde la factura y puedes ajustar cantidades.</Text>
        </View>
        <SearchField label="Encontrar producto o detalle" placeholder="Codigo, nombre o descripcion" value={form.productoBusqueda} onChangeText={(value) => onChange('productoBusqueda', value)} resultCount={productos.length} onSubmit={onSearchProductos} />
        <View style={styles.formActions}>
          <SecondaryButton label="Agregar detalle" onPress={onSearchProductos} />
        </View>
        <View style={styles.listStack}>
          {productos.map((producto) => (
            <Pressable key={`guia-producto-${producto.codproducto}`} style={styles.clientCard} onPress={() => onAddProducto(producto)}>
              <Text style={styles.clientName}>{producto.descripcion ?? producto.codprincipal ?? 'Producto'}</Text>
              <Text style={styles.clientMeta}>{producto.codprincipal ?? 'Sin codigo'}</Text>
            </Pressable>
          ))}
        </View>
        {detalles.length === 0 ? <EmptyState title="Sin detalles" text="Agrega productos del catalogo o registra un detalle manual." /> : null}
        {detalles.map((detalle, index) => (
          <View key={`guia-detalle-${index}`} style={styles.invoiceLineCard}>
            <Text style={styles.clientName}>{detalle.producto.descripcion ?? detalle.producto.codprincipal}</Text>
            <View style={styles.clientDetailGrid}>
              <View style={styles.clientDetailItem}>
                <Text style={styles.clientDetailLabel}>Codigo interno</Text>
                <Text style={styles.clientDetailValue}>{detalle.producto.codprincipal ?? detalle.producto.codproducto}</Text>
              </View>
              <Field label="Cantidad" value={detalle.cantidad} onChangeText={(value) => onUpdateDetalle(index, value)} keyboardType="decimal-pad" />
            </View>
            <SecondaryButton label="Quitar detalle" onPress={() => onRemoveDetalle(index)} />
          </View>
        ))}
      </View>
      <View style={[styles.formSectionBox, styles.invoiceSummaryBox]}>
        <Text style={styles.clientFormSubtitle}>Resumen</Text>
        <Text style={styles.invoiceSectionHelp}>Totales del traslado</Text>
        <InvoiceSummaryRow label="Subtotal bruto" value={0} />
        <InvoiceSummaryRow label="Subtotal con descuento" value={0} />
        <InvoiceSummaryRow label="IVA" value={0} />
        <View style={styles.invoiceTotalRow}>
          <Text style={styles.invoiceTotalLabel}>Total items</Text>
          <Text style={styles.invoiceTotalValue}>{totalCantidad.toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.formActions}>
        <SecondaryButton label="Previsualizar PDF" onPress={() => Alert.alert('Previsualizar PDF', 'Genera la guia para consultar el PDF.')} />
        <SecondaryButton label="Cancelar / limpiar" onPress={onClear} />
        <PrimaryButton label="Generar Guia de Remision" loading={saving} onPress={onSave} />
      </View>
    </>
  );
}

function MisGuiasRemisionMobileScreen({
  guias,
  loading,
  message,
  onRefresh,
  onPdf,
  onXml,
  onEmail,
}: {
  guias: GuiaRemisionListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (guia: GuiaRemisionListItem) => void;
  onXml: (guia: GuiaRemisionListItem) => void;
  onEmail: (guia: GuiaRemisionListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const visibleGuias = guias.filter((guia) => {
    const term = filter.trim().toLowerCase();
    const matchesText = !term || [guia.numero, guia.destinatario, guia.identificacionDestinatario, guia.transportista, guia.estadoSri].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    const isAuthorized = guia.autorizado || String(guia.estadoSri ?? '').toUpperCase().includes('AUTORIZ');
    const matchesStatus = statusFilter === 1 || (statusFilter === 2 && isAuthorized) || (statusFilter === 3 && !isAuthorized);
    return matchesText && matchesStatus;
  });
  const autorizadas = visibleGuias.filter((guia) => guia.autorizado || String(guia.estadoSri ?? '').toUpperCase().includes('AUTORIZ')).length;

  return (
    <>
      <View style={styles.adminHeroCard}>
        <Text style={styles.heroEyebrow}>Traslados emitidos</Text>
        <Text style={styles.heroTitle}>Mis guias de remision con filtros, reporte y acciones unificadas</Text>
        <Text style={styles.heroText}>Filtra por destinatario, transportista o numero, exporta tu consulta y abre cada comprobante.</Text>
      </View>
      <View style={styles.metricGrid}>
        <MetricBox value={visibleGuias.length} label="Guias filtradas" />
        <MetricBox value={autorizadas} label="Autorizadas" />
        <MetricBox value={visibleGuias.length} label="Guias visibles" />
      </View>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
        <Text style={styles.clientName}>Guias de remision generadas</Text>
        <SearchField label="Buscar guias" placeholder="Guia, destinatario, identificacion o transportista" value={filter} onChangeText={setFilter} resultCount={visibleGuias.length} totalCount={guias.length} />
        <DropdownField
          label="Estado SRI"
          options={[{ label: 'Todos', value: 1 }, { label: 'Autorizadas', value: 2 }, { label: 'No autorizadas', value: 3 }]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value ?? 1)}
        />
        <View style={styles.formActions}>
          <SecondaryButton label="Descargar Excel" onPress={() => Alert.alert('Descargar Excel', 'Exportacion pendiente de endpoint movil.')} />
          <PrimaryButton label="Refrescar" loading={loading} onPress={onRefresh} />
        </View>
      </View>
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando guias de remision...</Text>
        </View>
      ) : null}
      {!loading && visibleGuias.length === 0 ? <EmptyState title="Sin guias" text="Cuando generes guias de remision, apareceran aqui." /> : null}
      <View style={styles.listStack}>
        {visibleGuias.map((guia, index) => {
          const key = listItemKey('mis-guias', [guia.codGuia, guia.numero, guia.identificacionDestinatario], index);
          return (
            <View key={key} style={styles.clientCard}>
              <View style={styles.clientCardHeader}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{guia.numero ?? `Guia ${guia.codGuia}`}</Text>
                  <Text style={styles.clientMeta}>{guia.destinatario ?? 'Destinatario'} - {guia.identificacionDestinatario ?? 'Sin identificacion'}</Text>
                </View>
                <View style={styles.systemPill}>
                  <Text style={styles.systemPillText}>{guia.estadoSri ?? (guia.autorizado ? 'AUTORIZADO' : 'PENDIENTE')}</Text>
                </View>
              </View>
              <View style={styles.clientDetailGrid}>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Fecha</Text>
                  <Text style={styles.clientDetailValue}>{formatDocumentDate(guia.fecha)}</Text>
                </View>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Transportista</Text>
                  <Text style={styles.clientDetailValue}>{guia.transportista ?? '-'}</Text>
                </View>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Traslado</Text>
                  <Text style={styles.clientDetailValue}>{formatDocumentDate(guia.fechaTraslado)}</Text>
                </View>
              </View>
              <DocumentActionsMenu actions={[
                { label: 'Ver', icon: 'eye-outline', tone: 'primary', onPress: () => onPdf(guia) },
                { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(guia) },
                { label: 'Descargar PDF', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(guia) },
                { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(guia) },
              ]} />
            </View>
          );
        })}
      </View>
    </>
  );
}

function MisRetencionesMobileScreen({
  retenciones,
  loading,
  message,
  onRefresh,
  onPdf,
  onXml,
  onEmail,
}: {
  retenciones: RetencionListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (retencion: RetencionListItem) => void;
  onXml: (retencion: RetencionListItem) => void;
  onEmail: (retencion: RetencionListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const visibleRetenciones = retenciones.filter((retencion) => {
    const term = filter.trim().toLowerCase();
    const matchesText = !term || [retencion.numero, retencion.documentoSustento, retencion.proveedor, retencion.identificacionProveedor, retencion.estadoSri].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    const isAuthorized = retencion.autorizado || String(retencion.estadoSri ?? '').toUpperCase().includes('AUTORIZ');
    const matchesStatus = statusFilter === 1 || (statusFilter === 2 && isAuthorized) || (statusFilter === 3 && !isAuthorized);
    return matchesText && matchesStatus;
  });
  const base = visibleRetenciones.reduce((sum, item) => sum + Number(item.base ?? 0), 0);
  const autorizadas = visibleRetenciones.filter((item) => item.autorizado || String(item.estadoSri ?? '').toUpperCase().includes('AUTORIZ')).length;

  return (
    <>
      <View style={styles.adminHeroCard}>
        <Text style={styles.heroEyebrow}>Retenciones emitidas</Text>
        <Text style={styles.heroTitle}>Mis retenciones con filtros, reporte y acciones unificadas</Text>
        <Text style={styles.heroText}>Busca por proveedor, comprobante o documento sustento, revisa el estado y exporta la consulta visible.</Text>
      </View>
      <View style={styles.metricGrid}>
        <MetricBox value={visibleRetenciones.length} label="Retenciones filtradas" />
        <MetricBox value={formatMoney(base)} label="Base filtrada" />
        <MetricBox value={autorizadas} label="Autorizadas" />
      </View>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
        <Text style={styles.clientName}>Retenciones generadas</Text>
        <SearchField label="Buscar retenciones" placeholder="Numero, sustento, proveedor o identificacion" value={filter} onChangeText={setFilter} resultCount={visibleRetenciones.length} totalCount={retenciones.length} />
        <DropdownField
          label="Estado SRI"
          options={[{ label: 'Todos', value: 1 }, { label: 'Autorizadas', value: 2 }, { label: 'No autorizadas', value: 3 }]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value ?? 1)}
        />
        <View style={styles.formActions}>
          <SecondaryButton label="Descargar Excel" onPress={() => Alert.alert('Descargar Excel', 'Exportacion pendiente de endpoint movil.')} />
          <PrimaryButton label="Refrescar" loading={loading} onPress={onRefresh} />
        </View>
      </View>
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando retenciones...</Text>
        </View>
      ) : null}
      {!loading && visibleRetenciones.length === 0 ? <EmptyState title="Sin retenciones" text="Cuando existan retenciones generadas, apareceran aqui." /> : null}
      <View style={styles.listStack}>
        {visibleRetenciones.map((retencion, index) => {
          const key = listItemKey('mis-retenciones', [retencion.codRetencion, retencion.numero, retencion.documentoSustento, retencion.identificacionProveedor], index);
          return (
            <View key={key} style={styles.clientCard}>
              <View style={styles.clientCardHeader}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{retencion.numero ?? `Retencion ${retencion.codRetencion}`}</Text>
                  <Text style={styles.clientMeta}>{retencion.documentoSustento ?? 'Sin sustento'} - {retencion.proveedor ?? 'Proveedor'}</Text>
                </View>
                <View style={styles.systemPill}>
                  <Text style={styles.systemPillText}>{retencion.estadoSri ?? (retencion.autorizado ? 'AUTORIZADO' : 'PENDIENTE')}</Text>
                </View>
              </View>
              <View style={styles.clientDetailGrid}>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Fecha</Text>
                  <Text style={styles.clientDetailValue}>{formatDocumentDate(retencion.fecha)}</Text>
                </View>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Base</Text>
                  <Text style={styles.clientDetailValue}>{formatMoney(retencion.base)}</Text>
                </View>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Retenido</Text>
                  <Text style={styles.clientDetailValue}>{formatMoney(retencion.retenido)}</Text>
                </View>
              </View>
              <DocumentActionsMenu actions={[
                { label: 'Ver', icon: 'eye-outline', tone: 'primary', onPress: () => onPdf(retencion) },
                { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(retencion) },
                { label: 'Descargar PDF', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(retencion) },
                { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(retencion) },
              ]} />
            </View>
          );
        })}
      </View>
    </>
  );
}

function MisFacturasMobileScreen({
  facturas,
  loading,
  message,
  onRefresh,
  onPdf,
  onXml,
  onEmail,
  onAnular,
}: {
  facturas: FacturaListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (factura: FacturaListItem) => void;
  onXml: (factura: FacturaListItem) => void;
  onEmail: (factura: FacturaListItem) => void;
  onAnular: (factura: FacturaListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const visibleFacturas = facturas.filter((factura) => {
    const term = filter.trim().toLowerCase();
    const matchesText = !term || [
      factura.numeroCompleto,
      factura.numfactura,
      factura.cliente,
      factura.identificacionCliente,
      factura.estadoSri,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    const isAuthorized = factura.autorizado || String(factura.estadoSri ?? '').toUpperCase().includes('AUTORIZ');
    const matchesStatus = statusFilter === 1 || (statusFilter === 2 && isAuthorized) || (statusFilter === 3 && !isAuthorized);
    return matchesText && matchesStatus;
  });
  const autorizadas = visibleFacturas.filter((factura) => factura.autorizado || String(factura.estadoSri ?? '').toUpperCase().includes('AUTORIZ')).length;
  const total = visibleFacturas.reduce((sum, factura) => sum + Number(factura.total ?? 0), 0);

  return (
    <>
      <View style={styles.adminHeroCard}>
        <Text style={styles.heroEyebrow}>Panel comercial</Text>
        <Text style={styles.heroTitle}>Mis facturas</Text>
        <Text style={styles.heroText}>Consulta tus facturas generadas y ejecuta acciones del comprobante.</Text>
      </View>
      <View style={styles.metricGrid}>
        <MetricBox value={visibleFacturas.length} label="Facturas filtradas" />
        <MetricBox value={formatMoney(total)} label="Monto" />
        <MetricBox value={autorizadas} label="Autorizadas" />
      </View>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
        <SearchField label="Buscar facturas" placeholder="Numero, cliente, identificacion o estado" value={filter} onChangeText={setFilter} resultCount={visibleFacturas.length} totalCount={facturas.length} />
        <DropdownField
          label="Estado SRI"
          options={[
            { label: 'Todos', value: 1 },
            { label: 'Autorizadas', value: 2 },
            { label: 'No autorizadas', value: 3 },
          ]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value ?? 1)}
        />
        <PrimaryButton label="Refrescar" loading={loading} onPress={onRefresh} />
      </View>
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando facturas...</Text>
        </View>
      ) : null}
      {!loading && visibleFacturas.length === 0 ? <EmptyState title={filter || statusFilter !== 1 ? 'Sin coincidencias' : 'Sin facturas'} text={filter || statusFilter !== 1 ? 'Prueba con otros terminos o cambia el estado seleccionado.' : 'Cuando generes facturas, apareceran aqui.'} /> : null}
      <View style={styles.listStack}>
        {visibleFacturas.map((factura, index) => {
          const facturaKey = listItemKey('mis-facturas', [factura.codfactura, factura.numeroCompleto, factura.numfactura, factura.serie, factura.fechaEmision], index);

          return (
          <View key={facturaKey} style={styles.clientCard}>
            <View style={styles.clientCardHeader}>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{factura.numeroCompleto ?? factura.numfactura ?? `Factura ${factura.codfactura}`}</Text>
                <Text style={styles.clientMeta}>{factura.cliente ?? 'Consumidor final'} · {factura.identificacionCliente ?? 'Sin identificacion'}</Text>
              </View>
              <View style={styles.systemPill}>
                <Text style={styles.systemPillText}>{factura.estadoSri ?? (factura.autorizado ? 'AUTORIZADO' : 'PENDIENTE')}</Text>
              </View>
            </View>
            <View style={styles.clientDetailGrid}>
              <View style={styles.clientDetailItem}>
                <Text style={styles.clientDetailLabel}>Fecha</Text>
                <Text style={styles.clientDetailValue}>{formatDocumentDate(factura.fechaEmision)}</Text>
              </View>
              <View style={styles.clientDetailItem}>
                <Text style={styles.clientDetailLabel}>Total</Text>
                <Text style={styles.clientDetailValue}>{formatMoney(factura.total)}</Text>
              </View>
            </View>
            <DocumentActionsMenu actions={[
              { label: 'Ver', icon: 'eye-outline', tone: 'primary', onPress: () => onPdf(factura) },
              { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(factura) },
              { label: 'Descargar PDF', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(factura) },
              { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(factura) },
              { label: 'Anular factura', icon: 'trash-can-outline', tone: 'danger', onPress: () => onAnular(factura) },
            ]} />
          </View>
          );
        })}
      </View>
    </>
  );
}

function AdminModuleScreen({
  view,
  search,
  items,
  loading,
  message,
  activeTab,
  onRefresh,
  onSearch,
  onTabChange,
  onCreate,
  onView,
  onEdit,
  onDelete,
}: {
  view: WorkspaceView;
  search: string;
  items: AdminMobileItem[];
  loading: boolean;
  message?: MessageState;
  activeTab?: string;
  onRefresh: () => void;
  onSearch: (value: string) => void;
  onTabChange: (tab: string) => void;
  onCreate: () => void;
  onView: (item: AdminMobileItem) => void;
  onEdit: (item: AdminMobileItem) => void;
  onDelete: (item: AdminMobileItem) => void;
}) {
  const config = getAdminModuleConfig(view);
  const selectedTab = activeTab ?? config.tabs?.[0];
  const [detailItem, setDetailItem] = useState<AdminMobileItem | null>(null);

  return (
    <>
      <View style={styles.adminHeroCard}>
        <Text style={styles.heroEyebrow}>{config.eyebrow}</Text>
        <Text style={styles.heroTitle}>{config.title}</Text>
        <Text style={styles.heroText}>{config.description}</Text>
      </View>
      {config.tabs ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminTabs}>
          {config.tabs.map((tab) => (
            <Pressable key={tab} style={[styles.adminTab, selectedTab === tab && styles.adminTabActive]} onPress={() => onTabChange(tab)}>
              <Text style={[styles.adminTabText, selectedTab === tab && styles.adminTabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <View style={styles.actionRow}>
        <PrimaryButton label="Registrar" loading={false} onPress={onCreate} />
      </View>
      <View style={styles.formSectionBox}>
        <View style={styles.adminSearchHeader}>
          <View style={styles.adminSearchTitleBlock}>
            <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
            <Text style={styles.clientFormTitle}>{config.title}</Text>
          </View>
          {config.action ? (
            <Pressable style={styles.adminActionPill} onPress={onRefresh}>
              <Text style={styles.adminActionText}>{config.action}</Text>
            </Pressable>
          ) : null}
        </View>
        <SearchField label={`Buscar en ${config.title}`} placeholder={config.placeholder} value={search} onChangeText={onSearch} resultCount={items.length} loading={loading} />
        {message ? <MessageBox message={message} /> : null}
        {loading ? <EmptyState title="Cargando registros" text="Consultando la informacion administrativa..." /> : null}
        {!loading && !message && items.length === 0 ? <EmptyState title="Sin registros para mostrar" text="Cuando existan registros, apareceran aqui." /> : null}
        {!loading && items.length > 0 ? (
          <ResultCollection
            items={items}
            resetKey={`${view}-${selectedTab}-${search}`}
            keyExtractor={(item, index) => `${view}-${item.id || 'item'}-${index}`}
            renderItem={(item) => (
              <AdminMobileItemCard
                item={item}
                onView={() => {
                  setDetailItem(item);
                }}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
              />
            )}
          />
        ) : null}
      </View>
      <ItemDetailModal
        visible={Boolean(detailItem)}
        title={detailItem?.title || detailItem?.id || 'Detalle'}
        values={detailItem ? [detailItem.subtitle, detailItem.status, detailItem.meta, detailItem.detail].filter(Boolean) as string[] : []}
        onClose={() => setDetailItem(null)}
      />
    </>
  );
}

function AdminMobileItemCard({
  item,
  onView,
  onEdit,
  onDelete,
}: {
  item: AdminMobileItem;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.clientCard}>
      <View style={styles.clientCardHeader}>
        <View style={styles.clientAvatar}>
          <Text style={styles.clientAvatarText}>{(item.title || item.id || 'A').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.title || item.id}</Text>
          {item.subtitle ? <Text style={styles.clientMeta}>{item.subtitle}</Text> : null}
        </View>
        {item.status ? (
          <View style={styles.systemPill}>
            <Text style={styles.systemPillText}>{item.status}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.clientDetailGrid}>
        {item.meta ? (
          <View style={styles.clientDetailItem}>
            <Text style={styles.clientDetailLabel}>Dato</Text>
            <Text style={styles.clientDetailValue}>{item.meta}</Text>
          </View>
        ) : null}
        {item.detail ? (
          <View style={styles.clientDetailItem}>
            <Text style={styles.clientDetailLabel}>Detalle</Text>
            <Text style={styles.clientDetailValue}>{item.detail}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.clientActions}>
        <Pressable style={styles.smallActionButton} onPress={onView}>
          <Text style={styles.smallActionText}>Ver</Text>
        </Pressable>
        <Pressable style={styles.smallActionButton} onPress={onEdit}>
          <Text style={styles.smallActionText}>Editar</Text>
        </Pressable>
        <Pressable style={[styles.smallActionButton, styles.smallDangerButton]} onPress={onDelete}>
          <Text style={[styles.smallActionText, styles.smallDangerText]}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function OperationalModuleScreen({
  view,
  search,
  items,
  loading,
  saving,
  message,
  activeTab,
  formMode,
  form,
  onRefresh,
  onSearch,
  onTabChange,
  onCreate,
  onCancel,
  onChange,
  onSave,
  onView,
  onEdit,
  onDelete,
}: {
  view: WorkspaceView;
  search: string;
  items: OperationalMobileItem[];
  loading: boolean;
  saving: boolean;
  message?: MessageState;
  activeTab?: string;
  formMode: OperationalFormMode;
  form: OperationalFormState;
  onRefresh: () => void;
  onSearch: (value: string) => void;
  onTabChange: (tab: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  onChange: (field: keyof OperationalFormState, value: string) => void;
  onSave: () => void;
  onView: (item: OperationalMobileItem) => void;
  onEdit: (item: OperationalMobileItem) => void;
  onDelete: (item: OperationalMobileItem) => void;
}) {
  const module = getOperationalModuleSlug(view);
  const config = module ? getOperationalScreenConfig(view, module) : null;
  const selectedTab = module ? activeTab ?? getOperationalDefaultTab(view, module) : activeTab;
  const capabilities = getOperationalCapabilities(view, selectedTab ?? '');
  const [detailItem, setDetailItem] = useState<OperationalMobileItem | null>(null);

  if (!config) return null;

  return (
    <>
      <View style={styles.adminHeroCard}>
        <Text style={styles.heroEyebrow}>{config.eyebrow}</Text>
        <Text style={styles.heroTitle}>{config.title}</Text>
        <Text style={styles.heroText}>{config.description}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminTabs}>
        {config.tabs.map((tab) => (
          <Pressable key={tab} style={[styles.adminTab, selectedTab === tab && styles.adminTabActive]} onPress={() => onTabChange(tab)}>
            <Text style={[styles.adminTabText, selectedTab === tab && styles.adminTabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {capabilities.canCreate ? (
        <View style={styles.actionRow}>
          <PrimaryButton label={selectedTab === 'Comprar documentos' ? 'Comprar' : 'Registrar'} loading={false} onPress={onCreate} />
        </View>
      ) : null}
      {formMode ? (
        <OperationalForm
          title={formMode === 'edit' ? `Editar ${selectedTab}` : selectedTab === 'Comprar documentos' ? 'Comprar documentos' : `Registrar ${selectedTab}`}
          form={form}
          saving={saving}
          onCancel={onCancel}
          onChange={onChange}
          onSave={onSave}
        />
      ) : null}
      <View style={styles.formSectionBox}>
        <View style={styles.adminSearchHeader}>
          <View style={styles.adminSearchTitleBlock}>
            <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
            <Text style={styles.clientFormTitle}>{selectedTab}</Text>
          </View>
          <Pressable style={styles.adminActionPill} onPress={onRefresh}>
            <Text style={styles.adminActionText}>Refrescar</Text>
          </Pressable>
        </View>
        <SearchField label={`Buscar en ${selectedTab}`} placeholder={config.placeholder} value={search} onChangeText={onSearch} resultCount={items.length} loading={loading} />
        {message ? <MessageBox message={message} /> : null}
        {loading ? <EmptyState title="Cargando registros" text="Consultando la informacion del modulo..." /> : null}
        {!loading && !message && items.length === 0 ? <EmptyState title="Sin registros para mostrar" text="Cuando existan registros, apareceran aqui." /> : null}
        {!loading && items.length > 0 ? (
          <ResultCollection
            items={items}
            resetKey={`${view}-${selectedTab}-${search}`}
            keyExtractor={(item, index) => `${view}-${item.id || 'item'}-${index}`}
            renderItem={(item) => (
              <OperationalMobileItemCard
                item={item}
                canEdit={capabilities.canEdit}
                canDelete={capabilities.canDelete}
                onView={() => {
                  setDetailItem(item);
                }}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
              />
            )}
          />
        ) : null}
      </View>
      <ItemDetailModal
        visible={Boolean(detailItem)}
        title={detailItem?.title || detailItem?.id || 'Detalle'}
        values={detailItem ? [detailItem.subtitle, detailItem.status, detailItem.meta, detailItem.detail].filter(Boolean) as string[] : []}
        onClose={() => setDetailItem(null)}
      />
    </>
  );
}

const MOBILE_DOCUMENT_PRICES = {
  tier25: 0.46,
  tier48: 17.66 / 48,
  tier120: 31.74 / 120,
  tier240: 44.16 / 240,
  tier600: 69 / 600,
  high: 0.06,
};

function calculateMobileRechargeTotal(documents: number) {
  if (documents <= 0) return 0;

  let price = MOBILE_DOCUMENT_PRICES.tier25;
  if (documents > 25 && documents <= 48) price = MOBILE_DOCUMENT_PRICES.tier48;
  else if (documents > 48 && documents <= 120) price = MOBILE_DOCUMENT_PRICES.tier120;
  else if (documents > 120 && documents <= 240) price = MOBILE_DOCUMENT_PRICES.tier240;
  else if (documents > 240 && documents <= 600) price = MOBILE_DOCUMENT_PRICES.tier600;
  else if (documents > 600) price = MOBILE_DOCUMENT_PRICES.high;

  const total = Math.round(documents * price * 100) / 100;
  const roundedInteger = Math.round(total);
  return Math.abs(total - roundedInteger) <= 0.1 ? roundedInteger : total;
}

function calculateMobileRechargeDocuments(amount: number) {
  if (amount <= 0) return 0;

  let price = MOBILE_DOCUMENT_PRICES.tier25;
  if (amount >= 65) price = MOBILE_DOCUMENT_PRICES.high;
  else if (amount > 17.66 && amount <= 44.16) price = MOBILE_DOCUMENT_PRICES.tier240;
  else if (amount > 11.5 && amount <= 17.66) price = MOBILE_DOCUMENT_PRICES.tier48;
  else if (amount > 44.16) price = MOBILE_DOCUMENT_PRICES.tier600;

  return Math.max(0, Math.round(amount / price));
}

function PurchaseDocumentsScreen({
  form,
  saving,
  message,
  onChange,
  onSelectPlan,
  onSave,
}: {
  form: OperationalFormState;
  saving: boolean;
  message?: MessageState;
  onChange: (field: 'codigo' | 'valor', value: string) => void;
  onSelectPlan: (documents: number, amount: number, unlimited: boolean) => void;
  onSave: () => void;
}) {
  const documents = Number(form.codigo) || 0;
  const amount = Number(form.valor.replace(',', '.')) || 0;
  const [localMessage, setLocalMessage] = useState<MessageState>(null);
  const plans = [
    { documents: 25, amount: 11.5, caption: 'Una recarga simple para comenzar.', color: '#EAF5FC' },
    { documents: 120, amount: 31.74, caption: 'Equilibrio ideal para tu operación diaria.', color: '#FFF6E5', recommended: true },
    { documents: 600, amount: 69, caption: 'Más documentos para una operación constante.', color: '#E8F8F3' },
    { documents: 0, amount: 90, caption: 'Emite sin descontar saldo por un año.', color: '#ECF8EE', unlimited: true },
  ];
  const selectPlan = (plan: typeof plans[number]) => {
    onSelectPlan(plan.documents, plan.amount, Boolean(plan.unlimited));
    setLocalMessage(null);
  };
  const confirm = () => {
    const unlimited = form.descripcion.toLowerCase().includes('ilimit');
    if ((!unlimited && documents < 11) || amount < 5) {
      setLocalMessage({ type: 'info', text: 'Ingresa al menos 11 documentos y un monto mínimo de $5,00.' });
      return;
    }
    if (amount > 1000) {
      setLocalMessage({ type: 'info', text: 'El monto máximo permitido para una recarga es de $1.000,00.' });
      return;
    }
    if (!Number.isFinite(documents) || !Number.isFinite(amount)) {
      setLocalMessage({ type: 'info', text: 'Verifica que la cantidad y el valor sean números válidos.' });
      return;
    }
    setLocalMessage(null);
    onSave();
  };
  const total = amount;

  return (
    <View style={styles.rechargePage}>
      <View style={styles.rechargeHero}>
        <View style={styles.rechargeHeroCopy}>
          <Text style={styles.rechargeEyebrow}>Recarga personalizada</Text>
          <Text style={styles.rechargeTitle}>Compra por documentos o por dinero</Text>
          <Text style={styles.rechargeText}>Edita cualquiera de los dos valores y el sistema calcula automáticamente el otro.</Text>
        </View>
        <View style={styles.rechargeInputs}>
          <Field label="¿Cuántos documentos deseas comprar?" value={form.codigo} onChangeText={(value) => onChange('codigo', value)} keyboardType="number-pad" />
          <Text style={styles.rechargeHint}>Mínimo 11 documentos (equivalente a una recarga desde $5,00)</Text>
          <Field label="Valor de la recarga" value={form.valor} onChangeText={(value) => onChange('valor', value)} keyboardType="decimal-pad" />
          <Text style={styles.rechargeHint}>Monto mínimo de recarga: $5,00</Text>
        </View>
      </View>

      <View style={styles.rechargeSummary}>
        <Text style={styles.rechargeEyebrow}>Resumen de compra</Text>
        <Text style={styles.rechargeSummaryTitle}>{documents || amount ? 'Tu recarga' : 'Selecciona una opción'}</Text>
        <View style={styles.rechargeSummaryRow}><Text style={styles.rechargeSummaryLabel}>Documentos</Text><Text style={styles.rechargeSummaryValue}>{documents || 0}</Text></View>
        <View style={styles.rechargeSummaryRow}><Text style={styles.rechargeSummaryLabel}>Total a pagar</Text><Text style={styles.rechargeSummaryTotal}>USD ${total.toFixed(2)}</Text></View>
        {localMessage ? <MessageBox message={localMessage} /> : null}
        {message ? <MessageBox message={message} /> : null}
        <PrimaryButton label="Confirmar recarga" loading={saving} onPress={confirm} />
        <Text style={styles.rechargeSecure}>🔒 Pago 100% seguro{`\n`}El saldo se acredita automáticamente al aprobarse el pago.</Text>
      </View>

      <View style={styles.rechargeSectionHeader}>
        <View>
          <Text style={styles.rechargeEyebrow}>Opciones recomendadas</Text>
          <Text style={styles.rechargeSectionTitle}>Elige una recarga rápida</Text>
        </View>
        <Text style={styles.rechargeVatHint}>Precios finales con IVA incluido</Text>
      </View>

      <View style={styles.rechargePlanGrid}>
        {plans.map((plan) => (
          <View key={plan.unlimited ? 'unlimited' : plan.documents} style={[styles.rechargePlan, { backgroundColor: plan.color }, documents === plan.documents && amount === plan.amount ? styles.rechargePlanSelected : null]}>
            {plan.recommended ? <Text style={styles.rechargePlanBadge}>Recomendado</Text> : null}
            {plan.unlimited ? <Text style={styles.rechargePlanDocuments}>Ilimitados</Text> : <Text style={styles.rechargePlanDocuments}>{plan.documents}</Text>}
            {!plan.unlimited ? <Text style={styles.rechargePlanUnit}>documentos</Text> : <Text style={styles.rechargePlanUnit}>durante 1 año</Text>}
            <Text style={styles.rechargePlanAmount}>USD ${plan.amount.toFixed(2)}</Text>
            <Text style={styles.rechargePlanCaption}>{plan.caption}</Text>
            <SecondaryButton label="Elegir plan  →" onPress={() => selectPlan(plan)} />
          </View>
        ))}
      </View>

    </View>
  );
}

function getOperationalCapabilities(view: WorkspaceView, tab: string) {
  const readOnlyViews: WorkspaceView[] = ['estado-cuenta', 'reporte-documentos', 'reportes', 'centro-normativo'];
  if (readOnlyViews.includes(view)) {
    return { canCreate: false, canEdit: false, canDelete: false };
  }

  if (view === 'cuentas-cobrar') {
    return { canCreate: tab === 'Abonos', canEdit: false, canDelete: false };
  }

  if (view === 'comprar-documentos' || view === 'recargas') {
    return { canCreate: tab === 'Comprar documentos', canEdit: false, canDelete: false };
  }

  return { canCreate: false, canEdit: false, canDelete: false };
}

function OperationalForm({
  title,
  form,
  saving,
  onCancel,
  onChange,
  onSave,
}: {
  title: string;
  form: OperationalFormState;
  saving: boolean;
  onCancel: () => void;
  onChange: (field: keyof OperationalFormState, value: string) => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.formSectionBox}>
      <Text style={styles.clientFormSubtitle}>Operacion</Text>
      <Text style={styles.clientFormTitle}>{title}</Text>
      <Field label="Codigo (opcional)" value={form.codigo} onChangeText={(value) => onChange('codigo', value)} autoCapitalize="characters" />
      <Field label="Descripcion *" value={form.descripcion} onChangeText={(value) => onChange('descripcion', value)} />
      <Field label="Valor / cantidad (opcional)" value={form.valor} onChangeText={(value) => onChange('valor', value)} keyboardType="decimal-pad" />
      <Field label="Observacion (opcional)" value={form.observacion} onChangeText={(value) => onChange('observacion', value)} />
      <View style={styles.formActions}>
        <PrimaryButton label="Guardar" loading={saving} onPress={onSave} />
        <SecondaryButton label="Cancelar" onPress={onCancel} />
      </View>
    </View>
  );
}

function OperationalMobileItemCard({
  item,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: {
  item: OperationalMobileItem;
  canEdit: boolean;
  canDelete: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.clientCard}>
      <View style={styles.clientCardHeader}>
        <View style={styles.clientAvatar}>
          <Text style={styles.clientAvatarText}>{(item.title || item.id || 'O').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.title || item.id}</Text>
          {item.subtitle ? <Text style={styles.clientMeta}>{item.subtitle}</Text> : null}
        </View>
        {item.status ? (
          <View style={styles.systemPill}>
            <Text style={styles.systemPillText}>{item.status}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.clientDetailGrid}>
        {item.meta ? (
          <View style={styles.clientDetailItem}>
            <Text style={styles.clientDetailLabel}>Dato</Text>
            <Text style={styles.clientDetailValue}>{item.meta}</Text>
          </View>
        ) : null}
        {item.detail ? (
          <View style={styles.clientDetailItem}>
            <Text style={styles.clientDetailLabel}>Detalle</Text>
            <Text style={styles.clientDetailValue}>{item.detail}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.clientActions}>
        <Pressable style={styles.smallActionButton} onPress={onView}>
          <Text style={styles.smallActionText}>Ver</Text>
        </Pressable>
        {canEdit ? (
          <Pressable style={styles.smallActionButton} onPress={onEdit}>
            <Text style={styles.smallActionText}>Editar</Text>
          </Pressable>
        ) : null}
        {canDelete ? (
          <Pressable style={[styles.smallActionButton, styles.smallDangerButton]} onPress={onDelete}>
            <Text style={[styles.smallActionText, styles.smallDangerText]}>Eliminar</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function MetricBox({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function PortalServiceCard({
  title,
  description,
  enabled,
  onPress,
  index,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onPress: () => void;
  index: number;
}) {
  const visual = getPortalServiceVisual(title, index);

  return (
    <Pressable
      disabled={!enabled}
      style={[styles.portalServiceCard, { borderColor: visual.accent }, !enabled && styles.portalServiceCardDisabled]}
      onPress={onPress}
    >
      <View style={[styles.portalServiceIcon, { backgroundColor: visual.surface, borderColor: visual.accent }]}>
        <PortalServiceGlyph kind={visual.kind} />
      </View>
      <View style={styles.portalServiceCopy}>
        <Text style={styles.portalServiceTitle}>{title}</Text>
        <Text style={styles.portalServiceDescription}>{description}</Text>
      </View>
      <View style={styles.portalServiceActionWrap}>
        <Text
          style={[styles.portalServicePill, { borderColor: visual.accent, color: visual.accent }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.62}
        >
          {enabled ? 'ABRIR' : 'PRÓXIMAMENTE'}
        </Text>
        <View style={[styles.portalServiceArrow, { borderColor: visual.accent }]}>
          <Text style={[styles.portalServiceArrowText, { color: visual.accent }]}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

function PortalServiceGlyph({ kind }: { kind: string }) {
  if (kind === 'calculator') {
    return (
      <View style={styles.portalGlyphCalculator}>
        <View style={styles.portalGlyphCalculatorScreen} />
        <View style={styles.portalGlyphCalculatorGrid}>
          {Array.from({ length: 9 }).map((_, index) => <View key={`calc-dot-${index}`} style={styles.portalGlyphCalculatorDot} />)}
        </View>
      </View>
    );
  }

  if (kind === 'pencil') {
    return (
      <View style={styles.portalGlyphPencilWrap}>
        <Text style={styles.portalGlyphPencil}>✎</Text>
        <View style={styles.portalGlyphPencilLine} />
      </View>
    );
  }

  if (kind === 'briefcase') {
    return (
      <View style={styles.portalGlyphBriefcase}>
        <View style={styles.portalGlyphBriefcaseHandle} />
        <View style={styles.portalGlyphBriefcaseBody} />
      </View>
    );
  }

  return (
    <View style={styles.portalGlyphDocument}>
      <View style={styles.portalGlyphDocumentFold} />
      <View style={styles.portalGlyphDocumentLine} />
      <View style={styles.portalGlyphDocumentLine} />
      <Text style={styles.portalGlyphDocumentMoney}>$</Text>
    </View>
  );
}

function DirectoryHero({
  eyebrow,
  title,
  subtitle,
  icon,
  metrics,
  onCreate,
  createLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  metrics: { value: string | number; label: string }[];
  onCreate?: () => void;
  createLabel?: string;
}) {
  return (
    <View style={styles.clientBankSummary}>
      <View style={styles.clientBankSummaryHeader}>
        <View style={styles.clientHeroTitleBlock}>
          <View style={styles.clientHeroIcon}>
            <MaterialCommunityIcons name={icon} size={26} color="#FFFFFF" />
          </View>
          <View style={styles.clientHeroCopy}>
            <Text style={styles.clientBankEyebrow}>{eyebrow}</Text>
            <Text style={styles.clientBankTitle}>{title}</Text>
            <Text style={styles.clientHeroSubtitle}>{subtitle}</Text>
          </View>
        </View>
        {onCreate ? (
          <Pressable style={styles.clientHeroAddButton} onPress={onCreate} accessibilityLabel={createLabel ?? 'Nuevo registro'}>
            <Text style={styles.clientHeroAddGlyph}>+</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.clientBankMetrics}>
        {metrics.map((metric, index) => (
          <View key={`${metric.label}-${index}`} style={styles.clientBankMetricSlot}>
            {index > 0 ? <View style={styles.clientBankMetricDivider} /> : null}
            <View style={styles.clientBankMetric}>
              <Text style={styles.clientBankMetricValue}>{metric.value}</Text>
              <Text style={styles.clientBankMetricLabel}>{metric.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

type BotMessage = { id: string; role: 'user' | 'assistant'; text: string };

function TypingDots() {
  return (
    <View style={styles.typingDots}>
      <Text style={styles.typingDotText}>.</Text>
      <Text style={styles.typingDotText}>.</Text>
      <Text style={styles.typingDotText}>.</Text>
    </View>
  );
}

function EfactBotScreen({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<BotMessage[]>([
    { id: 'welcome', role: 'assistant', text: `Hola ${userName || ''}. Soy Númi, tu asistente de E-FACT. ¿En qué te ayudo hoy?` },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [feedbackByMessage, setFeedbackByMessage] = useState<Record<string, 'like' | 'dislike'>>({});
  const voiceRecognition = useRef<any>(null);

  const send = async (preset?: string) => {
    const text = (preset ?? draft).trim();
    if (!text || sending) return;
    setDraft('');
    setError('');
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', text }]);
    setSending(true);
    try {
      const answer = await sendBotMessage({
        message: text,
        contexto: 'e-rúbrica: guía para crear solicitudes de firma, completar firmantes y documentos, firmar documentos y validar el estado y la autenticidad de las firmas. Explica los pasos según las opciones disponibles en e-rúbrica y no inventes funciones que no estén disponibles.',
      });
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', text: answer }]);
      Speech.speak(answer, { language: 'es-EC', rate: 0.96 });
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'No se pudo contactar al bot.');
    } finally {
      setSending(false);
    }
  };

  const toggleVoiceInput = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Comandos por voz', 'El dictado nativo requiere habilitar el módulo de reconocimiento de voz en la compilación móvil. La lectura de respuestas ya está disponible.');
      return;
    }

    const browser = globalThis as typeof globalThis & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    if (listening) {
      voiceRecognition.current?.stop();
      return;
    }
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) {
      setError('Este navegador no permite dictado por voz.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'es-EC';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => setDraft(event.results?.[0]?.[0]?.transcript ?? '');
    recognition.onerror = () => setError('No se pudo reconocer la voz. Intenta nuevamente.');
    recognition.onend = () => setListening(false);
    voiceRecognition.current = recognition;
    recognition.start();
  };

  return (
    <KeyboardAvoidingView style={styles.botScreen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.botMessages} contentContainerStyle={styles.botMessagesContent} keyboardShouldPersistTaps="handled">
        {messages.map((message) => (
          <View key={message.id} style={message.role === 'user' ? styles.botUserRow : styles.botAssistantRow}>
            {message.role === 'assistant' ? <Image source={require('./assets/numi-chat-avatar.jpg')} style={styles.botMessageAvatar} /> : null}
            <View style={[styles.botBubble, message.role === 'user' ? styles.botUserBubble : styles.botAssistantBubble]}>
              <View style={styles.botMessageRow}>
                <Text style={[styles.botBubbleText, message.role === 'user' && styles.botUserBubbleText]}>{message.text}</Text>
                {message.role === 'assistant' ? <Pressable style={styles.botAudioButton} onPress={() => Speech.speak(message.text, { language: 'es-EC', rate: 0.96 })} hitSlop={8}><MaterialCommunityIcons name="volume-high" size={16} color="#0878C9" /></Pressable> : null}
              </View>
              {message.role === 'assistant' ? (
                <View style={styles.botBubbleFeedback}>
                  <Pressable accessibilityLabel="Respuesta util" hitSlop={6} style={[styles.botFeedbackButton, feedbackByMessage[message.id] === 'like' && styles.botFeedbackButtonActive]} onPress={() => setFeedbackByMessage((current) => {
                    const next = { ...current };
                    if (next[message.id] === 'like') delete next[message.id];
                    else next[message.id] = 'like';
                    return next;
                  })}>
                    <MaterialCommunityIcons name="thumb-up-outline" size={15} color={feedbackByMessage[message.id] === 'like' ? '#FFFFFF' : '#6E94B4'} />
                  </Pressable>
                  <Pressable accessibilityLabel="Respuesta no util" hitSlop={6} style={[styles.botFeedbackButton, feedbackByMessage[message.id] === 'dislike' && styles.botFeedbackButtonActive]} onPress={() => setFeedbackByMessage((current) => {
                    const next = { ...current };
                    if (next[message.id] === 'dislike') delete next[message.id];
                    else next[message.id] = 'dislike';
                    return next;
                  })}>
                    <MaterialCommunityIcons name="thumb-down-outline" size={15} color={feedbackByMessage[message.id] === 'dislike' ? '#FFFFFF' : '#6E94B4'} />
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        ))}
        {sending ? (
          <View style={styles.botAssistantRow}>
            <Image source={require('./assets/numi-chat-avatar.jpg')} style={styles.botMessageAvatar} />
            <View style={[styles.botBubble, styles.botAssistantBubble, styles.botTypingBubble]}>
              <TypingDots />
            </View>
          </View>
        ) : null}
      </ScrollView>
      {error ? <Text style={styles.botError}>{error}</Text> : null}
      {emojiOpen ? (
        <View style={styles.botEmojiTray}>
          {['👍', 'Gracias', 'Factura', 'Firma', 'Ayuda'].map((emoji) => (
            <Pressable key={emoji} style={styles.botEmojiChip} onPress={() => setDraft((current) => `${current}${current ? ' ' : ''}${emoji}`)}>
              <Text style={styles.botEmojiText}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.botComposer}>
        <Pressable style={[styles.botToolButton, emojiOpen && styles.botToolButtonActive]} disabled={sending} onPress={() => setEmojiOpen((value) => !value)}>
          <MaterialCommunityIcons name="emoticon-outline" size={19} color={emojiOpen ? '#FFFFFF' : '#6E94B4'} />
        </Pressable>
        <Pressable style={[styles.botVoiceButton, listening && styles.botVoiceButtonActive]} onPress={toggleVoiceInput} disabled={sending}>
          <MaterialCommunityIcons name={listening ? 'microphone' : 'microphone-outline'} size={21} color={listening ? '#FFFFFF' : '#0878C9'} />
        </Pressable>
        <TextInput value={draft} onChangeText={setDraft} placeholder={listening ? 'Escuchando...' : 'Escribe o dicta tu consulta...'} placeholderTextColor="#8DA1B4" style={styles.botInput} editable={!sending && !listening} multiline maxLength={800} onSubmitEditing={() => send()} />
        <Pressable style={[styles.botSendButton, (!draft.trim() || sending) && styles.botSendButtonDisabled]} onPress={() => send()} disabled={!draft.trim() || sending}>
          <Text style={styles.botSendText}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function PdfSignaturePositionPicker({
  page,
  position,
  onPageChange,
  onPositionChange,
}: {
  page: number;
  position: { x: number; y: number };
  onPageChange: (page: number) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}) {
  const pageWidth = 248;
  const pageHeight = 350;
  const signatureWidth = 92;
  const signatureHeight = 42;

  return (
    <View style={styles.pdfPositionCard}>
      <View style={styles.pdfPositionHeader}>
        <View style={styles.pdfPositionCopy}>
          <Text style={styles.clientDetailLabel}>Ubica tu firma</Text>
          <Text style={styles.clientMeta}>Toca sobre la página el lugar donde deseas colocarla.</Text>
        </View>
        <View style={styles.pdfPositionBadge}><MaterialCommunityIcons name="gesture-tap" size={18} color={ERUBRICA_COLORS.primary} /><Text style={styles.pdfPositionBadgeText}>TÁCTIL</Text></View>
      </View>
      <View style={styles.pdfPageToolbar}>
        <Text style={styles.pdfPageLabel}>Página</Text>
        <Pressable accessibilityLabel="Página anterior" disabled={page <= 1} style={[styles.pdfPageButton, page <= 1 && styles.pdfPageButtonDisabled]} onPress={() => onPageChange(Math.max(1, page - 1))}>
          <MaterialCommunityIcons name="chevron-left" size={20} color={page <= 1 ? EFACT_THEME.colors.disabled : ERUBRICA_COLORS.primary} />
        </Pressable>
        <Text style={styles.pdfPageNumber}>{page}</Text>
        <Pressable accessibilityLabel="Página siguiente" style={styles.pdfPageButton} onPress={() => onPageChange(page + 1)}>
          <MaterialCommunityIcons name="chevron-right" size={20} color={ERUBRICA_COLORS.primary} />
        </Pressable>
      </View>
      <View style={styles.pdfPageStage}>
        <Pressable
          accessibilityLabel="Seleccionar ubicación de firma en la página"
          style={[styles.pdfPage, { width: pageWidth, height: pageHeight }]}
          onPress={(event) => {
            const { locationX, locationY } = event.nativeEvent;
            const x = Math.min(1, Math.max(0, locationX / pageWidth));
            const y = Math.min(1, Math.max(0, locationY / pageHeight));
            onPositionChange({ x, y });
          }}
        >
          <View style={styles.pdfPageBrandLine} />
          <View style={styles.pdfPageTitleLine} />
          <View style={styles.pdfPageSubtitleLine} />
          <View style={styles.pdfPageTable}>
            {Array.from({ length: 9 }).map((_, index) => <View key={`pdf-line-${index}`} style={[styles.pdfPageTextLine, index % 3 === 0 && styles.pdfPageTextLineShort]} />)}
          </View>
          <View style={styles.pdfPageFooterLine} />
          <View style={[styles.pdfSignatureMarker, { left: Math.max(0, Math.min(pageWidth - signatureWidth, position.x * pageWidth - signatureWidth / 2)), top: Math.max(0, Math.min(pageHeight - signatureHeight, position.y * pageHeight - signatureHeight / 2)), width: signatureWidth, height: signatureHeight }]}>
            <MaterialCommunityIcons name="draw-pen" size={16} color={ERUBRICA_COLORS.primary} />
            <Text style={styles.pdfSignatureMarkerText}>FIRMA AQUÍ</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.pdfPositionInfo}>
        <MaterialCommunityIcons name="information-outline" size={18} color={ERUBRICA_COLORS.primary} />
        <Text style={styles.pdfPositionInfoText}>Página {page} · posición horizontal {Math.round(position.x * 100)}% · vertical {Math.round(position.y * 100)}%</Text>
      </View>
    </View>
  );
}

function ERubricaMobileScreen({
  data,
  initialPdf,
  loading,
  message,
  onRefresh,
  onSync,
}: {
  data: ERubricaDashboard | null;
  initialPdf?: { uri: string; name: string; mimeType?: string } | null;
  loading: boolean;
  message: MessageState;
  onRefresh: () => void;
  onSync: () => Promise<void>;
}) {
  const [tab, setTab] = useState<'solicitudes' | 'firmas' | 'firmar' | 'validar'>('solicitudes');
  const [qrInput, setQrInput] = useState('');
  const [qrResult, setQrResult] = useState<unknown>(null);
  const [validatingQr, setValidatingQr] = useState(false);
  const [pdfFile, setPdfFile] = useState<{ uri: string; name: string; mimeType?: string } | null>(initialPdf ?? null);
  const [certificateFile, setCertificateFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [signing, setSigning] = useState(false);
  const [signedFileUri, setSignedFileUri] = useState<string | null>(null);
  const [signaturePage, setSignaturePage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState({ x: 0.68, y: 0.82 });
  useEffect(() => {
    if (initialPdf) {
      setPdfFile(initialPdf);
      setTab('firmar');
    }
  }, [initialPdf]);
  const solicitudes = Array.isArray(data?.solicitudes) ? data.solicitudes : [];
  const firmas = Array.isArray(data?.firmas) ? data.firmas : [];
  const notificaciones = Array.isArray(data?.notificaciones) ? data.notificaciones : [];
  const entregas = Array.isArray(data?.entregasFirma) ? data.entregasFirma : [];
  const menus = Array.isArray(data?.menus) ? data.menus : [];
  const label = (item: unknown, keys: string[], fallback: string) => {
    if (!item || typeof item !== 'object') return fallback;
    const record = item as Record<string, unknown>;
    const value = keys.map((key) => record[key]).find((candidate) => candidate !== null && candidate !== undefined && String(candidate).trim());
    return value === undefined ? fallback : String(value);
  };

  return (
    <View style={styles.portalStack}>
      <View style={[styles.portalHeroPanel, { backgroundColor: ERUBRICA_COLORS.dark }]}>
        <View style={styles.portalHeroCopy}>
          <Text style={styles.dashboardPanelLabel}>Firma electrónica</Text>
          <Text style={styles.portalHeroTitle}>E-Rúbrica</Text>
          <Text style={styles.portalHeroText}>Gestiona solicitudes, documentos firmados y validaciones desde tu móvil.</Text>
        </View>
        <View style={[styles.portalHeroBadge, { borderColor: ERUBRICA_COLORS.border }]}>
          <Text style={styles.portalHeroBadgeText}>{solicitudes.length}</Text>
          <Text style={styles.portalHeroBadgeLabel}>solicitudes</Text>
        </View>
      </View>

      {message ? <MessageBox message={message} /> : null}
      <View style={styles.portalMetrics}>
        <View style={styles.portalMetricItem}><Text style={[styles.portalMetricValue, { color: ERUBRICA_COLORS.primary }]}>{firmas.length}</Text><Text style={styles.portalMetricLabel}>FIRMAS</Text></View>
        <View style={styles.portalMetricDivider} />
        <View style={styles.portalMetricItem}><Text style={[styles.portalMetricValue, { color: ERUBRICA_COLORS.primary }]}>{entregas.length}</Text><Text style={styles.portalMetricLabel}>PENDIENTES</Text></View>
        <View style={styles.portalMetricDivider} />
        <View style={styles.portalMetricItem}><Text style={[styles.portalMetricValue, { color: ERUBRICA_COLORS.primary }]}>{notificaciones.length}</Text><Text style={styles.portalMetricLabel}>AVISOS</Text></View>
      </View>

      {menus.length > 0 ? (
        <View style={styles.clientCard}>
          <Text style={styles.clientDetailLabel}>Menú autorizado</Text>
          <Text style={styles.clientMeta}>Opciones disponibles según el rol de tu usuario.</Text>
          <View style={styles.segment}>
            {menus.map((item, index) => (
              <Text key={`erubrica-menu-${index}`} style={styles.adminTabText}>{label(item, ['nombre', 'Nombre', 'nombremenu'], 'Opción')}</Text>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.segment}>
        <SegmentButton accentColor={ERUBRICA_COLORS.primary} active={tab === 'solicitudes'} label={`Solicitudes (${solicitudes.length})`} onPress={() => setTab('solicitudes')} />
        <SegmentButton accentColor={ERUBRICA_COLORS.primary} active={tab === 'firmas'} label={`Firmas (${firmas.length})`} onPress={() => setTab('firmas')} />
        <SegmentButton accentColor={ERUBRICA_COLORS.primary} active={tab === 'firmar'} label="Firmar PDF" onPress={() => setTab('firmar')} />
        <SegmentButton accentColor={ERUBRICA_COLORS.primary} active={tab === 'validar'} label="Validar QR" onPress={() => setTab('validar')} />
      </View>

      <View style={styles.portalSectionHeader}>
        <View style={styles.portalSectionTitleWrap}><Text style={styles.portalSectionTitle}>Actividad reciente</Text></View>
        <Pressable style={styles.portalSectionAction} onPress={onRefresh}><MaterialCommunityIcons name="refresh" size={22} color={ERUBRICA_COLORS.primary} /></Pressable>
      </View>

      {loading ? <View style={styles.directoryLoading}><ActivityIndicator color={ERUBRICA_COLORS.primary} /><Text style={styles.mutedText}>Cargando E-Rúbrica...</Text></View> : null}
      {tab === 'firmar' ? (
        <View style={styles.clientCard}>
          <Text style={styles.clientDetailLabel}>Firmar documento PDF</Text>
          <Text style={styles.clientMeta}>Selecciona el PDF y tu certificado .p12. Al finalizar podrás compartir el archivo firmado.</Text>
          <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label={pdfFile ? `PDF: ${pdfFile.name}` : 'Seleccionar PDF'} onPress={async () => {
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
            if (!result.canceled) {
              setPdfFile(result.assets[0]);
              setSignedFileUri(null);
              setSignaturePage(1);
              setSignaturePosition({ x: 0.68, y: 0.82 });
            }
          }} />
          {pdfFile ? <PdfSignaturePositionPicker page={signaturePage} position={signaturePosition} onPageChange={setSignaturePage} onPositionChange={setSignaturePosition} /> : null}
          <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label={certificateFile ? `Certificado: ${certificateFile.name}` : 'Seleccionar certificado .p12'} onPress={async () => {
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/x-pkcs12', copyToCacheDirectory: true });
            if (!result.canceled) setCertificateFile(result.assets[0]);
          }} />
          <Field label="Clave del certificado" value={certificatePassword} onChangeText={setCertificatePassword} secureTextEntry />
          <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Firmar documento" loading={signing} onPress={async () => {
            if (!pdfFile || !certificateFile || !certificatePassword.trim()) return;
            setSigning(true);
            setSignedFileUri(null);
            try {
              const form = new FormData();
              form.append('pdf', { uri: pdfFile.uri, name: pdfFile.name || 'documento.pdf', type: pdfFile.mimeType || 'application/pdf' } as unknown as Blob);
              form.append('certificado', { uri: certificateFile.uri, name: certificateFile.name || 'certificado.p12', type: certificateFile.mimeType || 'application/x-pkcs12' } as unknown as Blob);
              form.append('clave', certificatePassword);
              form.append('pagina', String(signaturePage));
              form.append('posicionX', signaturePosition.x.toFixed(4));
              form.append('posicionY', signaturePosition.y.toFixed(4));
              const result = await firmarERubricaDocumento(form);
              const bytes = new Uint8Array(result.bytes);
              let binary = '';
              for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
              const base64 = btoa(binary);
              const uri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}documento-firmado-${Date.now()}.pdf`;
              await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
              setSignedFileUri(uri);
              Alert.alert('Documento firmado', 'El PDF se firmó correctamente. Ya puedes compartirlo.');
            } catch (error) {
              Alert.alert('No se pudo firmar', error instanceof ApiError ? error.message : 'Verifica los archivos y la clave del certificado.');
            } finally { setSigning(false); }
          }} />
          {signedFileUri ? <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Compartir documento firmado" loading={false} onPress={async () => {
            if (!signedFileUri) return;
            if (!(await Sharing.isAvailableAsync())) { Alert.alert('No disponible', 'Este dispositivo no permite compartir archivos.'); return; }
            await Sharing.shareAsync(signedFileUri, { mimeType: 'application/pdf', dialogTitle: 'Compartir documento firmado', UTI: 'com.adobe.pdf' });
          }} /> : null}
        </View>
      ) : null}
      {tab === 'validar' ? (
          <View style={[styles.clientCard, { borderLeftColor: ERUBRICA_COLORS.primary, borderColor: ERUBRICA_COLORS.border }]}>
          <Text style={styles.clientDetailLabel}>Validar firma por QR</Text>
          <Text style={styles.clientMeta}>Pega el texto o URL contenido en el código QR del documento.</Text>
          <Field label="Entrada QR" value={qrInput} onChangeText={setQrInput} autoCapitalize="none" />
          <PrimaryButton
            accentColor={ERUBRICA_COLORS.primary}
            label="Validar"
            loading={validatingQr}
            onPress={async () => {
              if (!qrInput.trim()) return;
              setValidatingQr(true);
              setQrResult(null);
              try { setQrResult(await validarERubricaQr(qrInput)); }
              catch (error) { setQrResult({ mensaje: error instanceof ApiError ? error.message : 'No se pudo validar el QR.' }); }
              finally { setValidatingQr(false); }
            }}
          />
          {qrResult ? <Text style={styles.clientDetailValue}>{JSON.stringify(qrResult, null, 2)}</Text> : null}
        </View>
      ) : null}
      {tab === 'solicitudes' && !loading && solicitudes.length === 0 ? <EmptyState title="Sin solicitudes" text="No hay solicitudes de firma para mostrar." /> : null}
      {tab === 'solicitudes' && !loading && solicitudes.slice(0, 8).map((item, index) => (
        <View key={`erubrica-solicitud-${index}`} style={[styles.clientCard, { borderLeftColor: ERUBRICA_COLORS.primary, borderColor: ERUBRICA_COLORS.border }]}>
            <View style={styles.clientCardHeader}>
            <View style={styles.clientHeroTitleBlock}>
              <Text style={styles.clientDetailLabel}>{label(item, ['solId', 'id', 'numero', 'solicitud'], 'Solicitud de firma')}</Text>
              <Text style={styles.clientMeta}>{label(item, ['estado', 'status', 'solEstado'], 'Pendiente')}</Text>
            </View>
            <MaterialCommunityIcons name="file-sign" size={25} color={ERUBRICA_COLORS.primary} />
          </View>
          <Text style={styles.clientDetailValue}>{label(item, ['solFormatoFirma', 'formato', 'producto', 'descripcion'], 'Solicitud E-Rúbrica')}</Text>
        </View>
      ))}

      {tab === 'firmas' && !loading && firmas.length === 0 ? <EmptyState title="Sin firmas" text="No hay certificados o firmas disponibles." /> : null}
      {tab === 'firmas' && !loading && firmas.slice(0, 8).map((item, index) => (
        <View key={`erubrica-firma-${index}`} style={[styles.clientCard, { borderLeftColor: ERUBRICA_COLORS.primary, borderColor: ERUBRICA_COLORS.border }]}>
          <Text style={styles.clientDetailLabel}>{label(item, ['nombreTitular', 'titular', 'razonSocial'], 'Firma electrónica')}</Text>
          <Text style={styles.clientMeta}>{label(item, ['estado', 'estadoVigencia', 'status'], 'Estado no disponible')}</Text>
          <Text style={styles.clientDetailValue}>{label(item, ['fechaExpiracion', 'diasRestantes', 'numeroSerie'], 'Sin detalle adicional')}</Text>
        </View>
      ))}

      {tab !== 'validar' && tab !== 'firmar' ? <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Sincronizar solicitudes pendientes" loading={false} onPress={onSync} /> : null}
    </View>
  );
}

function DashboardHomeScreen({
  clientesCount,
  productosCount,
  facturas,
  modules,
  onOpenView,
}: {
  clientesCount: number;
  productosCount: number;
  facturas: FacturaListItem[];
  modules: MobileModule[];
  onOpenView: (view: WorkspaceView) => void;
}) {
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const ventasTotal = facturas.reduce((sum, factura) => sum + Number(factura.total ?? 0), 0);
  const latestFacturas = facturas.slice(0, 3);
  const mainModules = modules
    .filter((module) => ['mis-facturas', 'clientes', 'productos', 'reporte-documentos', 'emisor', 'punto-emision'].includes(module.view))
    .slice(0, 5);
  const recentFactura = facturas[0];

  return (
    <View style={styles.dashboardHome}>
      <View style={styles.dashboardIntro}>
        <View style={styles.dashboardIntroText}>
          <Text style={styles.dashboardEyebrow}>E-FACT MOVIL</Text>
          <Text style={styles.dashboardGreeting} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.78}>Inicio</Text>
          <Text style={styles.dashboardIntroCopy}>Tu operación tributaria al día, simple y ordenada.</Text>
        </View>
        <Pressable accessibilityLabel="Ver servicios" style={styles.dashboardSmallIconButton} onPress={() => onOpenView('portal')}>
          <MaterialCommunityIcons name="view-grid-outline" size={22} color={EFACT_THEME.colors.primaryDark} />
        </Pressable>
      </View>

      <View style={styles.dashboardSummaryPanel}>
        <View style={styles.dashboardSummaryHeader}>
          <View>
            <Text style={styles.dashboardPanelLabel}>Resumen principal</Text>
            <Text style={styles.dashboardSummaryTitle}>Facturación de este mes</Text>
          </View>
          <View style={styles.dashboardPeriodPill}>
            <Text style={styles.dashboardPeriodText}>Activo</Text>
          </View>
        </View>
        <Text style={styles.dashboardMoneyValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>{formatDashboardMoney(ventasTotal)}</Text>
        <View style={styles.dashboardSummaryDivider} />
        <View style={styles.dashboardSummaryStats}>
          <DashboardMetric value={facturas.length} label="Facturas" />
          <DashboardMetric value={clientesCount} label="Clientes" />
          <DashboardMetric value={productosCount} label="Productos" />
        </View>
      </View>

      <DashboardChartCard facturas={facturas} />

      <View style={styles.dashboardSectionHeader}>
        <Text style={styles.dashboardSectionTitle}>Acciones principales</Text>
      </View>
      <View style={[styles.dashboardActionRow, compact && styles.dashboardActionRowCompact]}>
        <DashboardPrimaryAction icon="file-plus-outline" label="Nueva factura" text="Emitir comprobante" primary onPress={() => onOpenView('nueva-factura')} />
        <DashboardPrimaryAction icon="account-plus-outline" label="Nuevo cliente" text="Registrar datos" onPress={() => onOpenView('nuevo-cliente')} />
        <DashboardPrimaryAction icon="robot-outline" label="Númi" text="Asistente" onPress={() => onOpenView('bot')} />
        <DashboardPrimaryAction icon="file-document-outline" label="Mis facturas" text="Consultar emitidas" onPress={() => onOpenView('mis-facturas')} />
        <DashboardPrimaryAction icon="package-variant-closed" label="Productos" text="Catalogo" onPress={() => onOpenView('productos')} />
        <DashboardPrimaryAction icon="chart-box-outline" label="Reportes" text="Documentos" onPress={() => onOpenView('reporte-documentos')} />
      </View>

      <View style={styles.dashboardActivityPanel}>
        <View style={styles.dashboardSectionHeader}>
          <Text style={styles.dashboardSectionTitle}>Actividad reciente</Text>
          <Pressable hitSlop={8} onPress={() => onOpenView('mis-facturas')}>
            <Text style={styles.dashboardViewAll}>Ver facturas</Text>
          </Pressable>
        </View>
        {latestFacturas.length ? latestFacturas.map((factura, index) => (
          <DashboardActivityItem
            key={listItemKey('dashboard-factura', [factura.codfactura, factura.numeroCompleto, factura.numfactura], index)}
            color={EFACT_THEME.colors.secondary}
            title={factura.numeroCompleto ?? factura.numfactura ?? 'Factura emitida'}
            subtitle={`${factura.cliente ?? 'Cliente'} · ${formatDocumentDate(factura.fechaEmision)}`}
            amount={formatMoney(factura.total)}
            status={factura.autorizado || String(factura.estadoSri ?? '').toUpperCase().includes('AUTORIZ') ? 'Autorizada' : factura.estadoSri ?? 'Pendiente'}
          />
        )) : (
          <DashboardActivityItem
            color={EFACT_THEME.colors.info}
            title={recentFactura?.numeroCompleto ?? 'Sin documentos recientes'}
            subtitle="Cuando emitas comprobantes aparecerán aquí."
            status="Borrador"
          />
        )}
      </View>

      <View style={styles.dashboardSectionHeader}>
        <Text style={styles.dashboardSectionTitle}>Servicios frecuentes</Text>
        <Pressable hitSlop={8} onPress={() => onOpenView('portal')}>
          <Text style={styles.dashboardViewAll}>Ver todos</Text>
        </Pressable>
      </View>
      <View style={styles.dashboardServiceList}>
        {mainModules.map((module, index) => (
          <DashboardServiceRow
            key={`home-module-${module.view}`}
            module={module}
            index={index}
            onPress={() => onOpenView(module.view)}
          />
        ))}
      </View>
    </View>
  );
}

function DashboardMetric({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.dashboardMetric}>
      <Text style={styles.dashboardMetricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>{value}</Text>
      <Text style={styles.dashboardMetricLabel}>{label}</Text>
    </View>
  );
}

function DashboardPrimaryAction({
  icon,
  label,
  text,
  primary,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  text: string;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.dashboardPrimaryAction, primary && styles.dashboardPrimaryActionMain, pressed && styles.dashboardFavoritePressed]} onPress={onPress}>
      <View style={[styles.dashboardPrimaryActionIcon, primary && styles.dashboardPrimaryActionIconMain]}>
        <MaterialCommunityIcons name={icon} size={22} color={primary ? '#FFFFFF' : EFACT_THEME.colors.primary} />
      </View>
      <Text style={[styles.dashboardPrimaryActionLabel, primary && styles.dashboardPrimaryActionLabelMain]} numberOfLines={1}>{label}</Text>
      <Text style={[styles.dashboardPrimaryActionText, primary && styles.dashboardPrimaryActionTextMain]} numberOfLines={2}>{text}</Text>
    </Pressable>
  );
}

function DashboardFavorite({ icon, label, color, onPress }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.dashboardFavorite, pressed && styles.dashboardFavoritePressed]} onPress={onPress}>
      <View style={[styles.dashboardFavoriteIcon, { backgroundColor: `${color}16` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.dashboardFavoriteLabel} numberOfLines={2}>{label}</Text>
      <Text style={[styles.dashboardFavoriteArrow, { color }]}>›</Text>
    </Pressable>
  );
}

function DashboardStatCard({ accent, compact, kind, value, label, trend }: { accent: string; compact?: boolean; kind: string; value: string | number; label: string; trend: string }) {
  return (
    <View style={[styles.dashboardStatCard, compact && styles.dashboardStatCardCompact]}>
      <View style={[styles.dashboardStatIcon, { backgroundColor: `${accent}18` }]}>
        <Text style={[styles.dashboardStatIconText, { color: accent }]}>{kind === 'money' ? '$' : kind === 'people' ? '••' : kind === 'box' ? '+' : '▤'}</Text>
      </View>
      <Text style={styles.dashboardStatValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>{value}</Text>
      <Text style={styles.dashboardStatLabel} numberOfLines={2}>{label}</Text>
      <Text style={styles.dashboardStatTrend} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>↗ {trend} vs mes anterior</Text>
    </View>
  );
}

function DashboardChartCard({ facturas }: { facturas: FacturaListItem[] }) {
  const values = [500, 1200, 720, 1350, 1680, 1640, 2450].map((fallback, index) => Number(facturas[index]?.total ?? fallback));
  const max = Math.max(...values, 1);

  return (
    <View style={styles.dashboardChartCard}>
      <Text style={styles.dashboardPanelTitle} numberOfLines={1} adjustsFontSizeToFit>Ventas de los últimos 7 días</Text>
      <View style={styles.dashboardChartArea}>
        {values.map((value, index) => (
          <View key={`chart-${index}`} style={styles.dashboardChartColumn}>
            <View style={[styles.dashboardChartBar, { height: `${Math.max(12, (value / max) * 86)}%` }]} />
            <View style={[styles.dashboardChartPoint, { bottom: `${Math.max(8, (value / max) * 78)}%` }]} />
          </View>
        ))}
      </View>
      <View style={styles.dashboardChartLabels}>
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => <Text key={day} style={styles.dashboardChartLabel}>{day}</Text>)}
      </View>
    </View>
  );
}

function DashboardQuickAction({ color, label, onPress }: { color: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.dashboardQuickAction} onPress={onPress}>
      <View style={[styles.dashboardQuickIcon, { backgroundColor: color }]}>
        <Text style={styles.dashboardQuickIconText}>+</Text>
      </View>
      <Text style={styles.dashboardQuickLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>{label}</Text>
      <Text style={styles.dashboardQuickArrow}>›</Text>
    </Pressable>
  );
}

function DashboardServiceRow({ module, index, onPress }: { module: MobileModule; index: number; onPress: () => void }) {
  const colors = [EFACT_THEME.colors.primary, EFACT_THEME.colors.secondary, EFACT_THEME.colors.info, EFACT_THEME.colors.warning, EFACT_THEME.colors.primaryDark];
  const color = colors[index % colors.length];
  return (
    <Pressable style={({ pressed }) => [styles.dashboardServiceRow, pressed && styles.dashboardFavoritePressed]} onPress={onPress}>
      <View style={[styles.dashboardServiceIcon, { backgroundColor: `${color}16` }]}>
        <MaterialCommunityIcons name="chevron-right-circle-outline" size={22} color={color} />
      </View>
      <View style={styles.dashboardServiceCopy}>
        <Text style={styles.dashboardServiceTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>{module.title}</Text>
        <Text style={styles.dashboardServiceText} numberOfLines={2}>{module.description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={EFACT_THEME.colors.textMuted} />
    </Pressable>
  );
}

function DashboardActivityItem({ color, title, subtitle, amount, status }: { color: string; title: string; subtitle: string; amount?: string; status?: string }) {
  return (
    <View style={styles.dashboardActivityItem}>
      <View style={[styles.dashboardActivityIcon, { backgroundColor: `${color}28` }]}>
        <Text style={[styles.dashboardActivityIconText, { color }]}>✓</Text>
      </View>
      <View style={styles.dashboardActivityCopy}>
        <Text style={styles.dashboardActivityTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.dashboardActivityText} numberOfLines={2}>{subtitle}</Text>
      </View>
      {amount ? <Text style={styles.dashboardActivityAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{amount}</Text> : null}
      {status ? <Text style={styles.dashboardActivityStatus} numberOfLines={1}>{status}</Text> : null}
    </View>
  );
}

function PortalHeaderAvatar() {
  return (
    <Image source={require('./assets/logo-numerica.png')} style={styles.portalHeaderLogo} />
  );
}

function PortalBottomNav({
  bottomInset,
  activeView,
  onHome,
  onServices,
  onBot,
  onNewInvoice,
  onProfile,
}: {
  bottomInset: number;
  activeView: WorkspaceView;
  onHome: () => void;
  onServices: () => void;
  onBot: () => void;
  onNewInvoice: () => void;
  onProfile: () => void;
}) {
  return (
    <View style={[styles.portalBottomNav, { bottom: Math.max(8, bottomInset + 4) }]}>
      <PortalTabButton active={activeView === 'dashboard'} icon="home" label="Inicio" onPress={onHome} />
      <PortalTabButton active={activeView === 'portal'} icon="grid" label="Servicios" onPress={onServices} />
      <PortalTabButton active={activeView === 'bot'} icon="bot" label="Númi" onPress={onBot} />
      <PortalTabButton active={activeView === 'nueva-factura'} icon="invoice" label="Factura" onPress={onNewInvoice} />
      <PortalTabButton active={activeView === 'perfil'} icon="profile" label="Perfil" onPress={onProfile} />
    </View>
  );
}

function PortalTabButton({ active, icon, label, onPress }: { active: boolean; icon: 'home' | 'grid' | 'document' | 'profile' | 'settings' | 'bot' | 'invoice'; label: string; onPress: () => void }) {
  const iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'] =
    icon === 'home' ? 'home-variant-outline'
      : icon === 'grid' ? 'view-grid-outline'
        : icon === 'document' ? 'file-document-outline'
          : icon === 'invoice' ? 'file-plus-outline'
            : icon === 'profile' ? 'account-circle-outline'
              : icon === 'settings' ? 'cog-outline'
                : 'robot-outline';

  return (
    <Pressable hitSlop={6} accessibilityRole="button" accessibilityLabel={label} style={[styles.portalTabButton, active && styles.portalTabButtonActive]} onPress={onPress}>
      <View style={[styles.portalTabIcon, active && styles.portalTabIconBubble]}>
        <MaterialCommunityIcons name={iconName} size={22} color={active ? '#FFFFFF' : EFACT_THEME.colors.textMuted} />
      </View>
      <Text style={[styles.portalTabText, active && styles.portalTabTextActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>{label}</Text>
    </Pressable>
  );
}

function ModuleCard({
  title,
  description,
  count,
  enabled,
  onPress,
}: {
  title: string;
  description: string;
  count?: number;
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <SmoothPressable accessibilityHint={enabled ? `Abre ${title}` : 'Esta opcion aun no esta disponible'} disabled={!enabled} style={[styles.moduleCard, !enabled && styles.moduleCardDisabled]} onPress={onPress}>
      <View style={styles.moduleTopRow}>
        <Text style={styles.moduleTitle}>{title}</Text>
        {typeof count === 'number' ? <Text style={styles.moduleCount}>{count}</Text> : null}
      </View>
      <Text style={styles.moduleDescription}>{description}</Text>
      <Text style={styles.moduleAction}>{enabled ? 'Abrir' : 'Proximamente'}</Text>
    </SmoothPressable>
  );
}

function NavButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.navButton, active && styles.navButtonActive]} onPress={onPress}>
      <Text style={[styles.navButtonText, active && styles.navButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function MenuItem({
  active,
  count,
  disabled,
  expanded,
  hasChildren,
  inset,
  label,
  onPress,
  onToggle,
}: {
  active: boolean;
  count?: number;
  disabled?: boolean;
  expanded?: boolean;
  hasChildren?: boolean;
  inset?: boolean;
  label: string;
  onPress: () => void;
  onToggle?: () => void;
}) {
  return (
    <SmoothPressable
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled), expanded: hasChildren ? Boolean(expanded) : undefined, selected: active }}
      disabled={disabled}
      style={[styles.menuItem, inset && styles.menuItemInset, active && styles.menuItemActive, disabled && styles.menuItemDisabled]}
      onPress={onPress}
    >
      <Text style={[styles.menuItemText, active && styles.menuItemTextActive]} numberOfLines={1}>{label}</Text>
      {typeof count === 'number' ? <Text style={[styles.menuItemCount, active && styles.menuItemCountActive]}>{count}</Text> : null}
      {hasChildren ? (
        <Pressable
          accessibilityLabel={`${expanded ? 'Contraer' : 'Expandir'} ${label}`}
          accessibilityRole="button"
          hitSlop={10}
          onPress={(event) => {
            event.stopPropagation();
            onToggle?.();
          }}
        >
          <Text style={[styles.menuItemChevron, expanded && styles.menuItemChevronExpanded, active && styles.menuItemTextActive]}>⌄</Text>
        </Pressable>
      ) : null}
    </SmoothPressable>
  );
}

function InitialsAvatar({ initials, size }: { initials: string; size: number }) {
  return (
    <View style={[styles.initialsAvatar, { backgroundColor: getInitialsColor(initials), borderRadius: Math.round(size * 0.22), height: size, width: size }]}>
      <Text style={[styles.initialsAvatarText, { fontSize: Math.max(16, Math.round(size * 0.42)) }]}>{initials}</Text>
    </View>
  );
}

function DirectoryTabButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.directoryTab, active && styles.directoryTabActive]} onPress={onPress}>
      <Text style={[styles.directoryTabText, active && styles.directoryTabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function DropdownField({
  label,
  options,
  value,
  onChange,
  placeholder,
  allowClear,
}: {
  label: string;
  options: { label: string; value: number }[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.dropdownField}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.dropdownButton} onPress={() => setOpen(true)}>
        <Text style={[styles.dropdownButtonText, !selected && styles.dropdownPlaceholder]} numberOfLines={1}>
          {selected?.label ?? placeholder ?? `Seleccione ${label.toLowerCase()}`}
        </Text>
        <Text style={styles.dropdownChevron}>v</Text>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.dropdownOverlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdownSheet}>
            <Text style={styles.dropdownTitle}>{label}</Text>
            <ScrollView style={styles.dropdownList} contentContainerStyle={styles.dropdownListContent}>
              {allowClear ? (
                <Pressable
                  style={[styles.dropdownOption, value === null && styles.dropdownOptionActive]}
                  onPress={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownOptionText, value === null && styles.dropdownOptionTextActive]}>
                    {placeholder ?? '-- Sin seleccionar --'}
                  </Text>
                </Pressable>
              ) : null}
              {options.map((option, index) => (
                <Pressable
                  key={`${label}-${option.value}-${option.label}-${index}`}
                  style={[styles.dropdownOption, value === option.value && styles.dropdownOptionActive]}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownOptionText, value === option.value && styles.dropdownOptionTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function ToggleRow({
  label,
  text,
  value,
  onChange,
}: {
  label: string;
  text: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable style={styles.toggleRow} onPress={() => onChange(!value)}>
      <View style={[styles.toggleBox, value && styles.toggleBoxActive]}>
        {value ? <Text style={styles.toggleCheck}>OK</Text> : null}
      </View>
      <View style={styles.toggleTextBlock}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleHelp}>{text}</Text>
      </View>
    </Pressable>
  );
}

function FormTopBar({ onBack, onDiscard }: { onBack: () => void; onDiscard: () => void }) {
  return (
    <View style={styles.clientFormTopBar}>
      <Pressable accessibilityLabel="Volver" style={styles.clientFormBackButton} onPress={onBack}>
        <MaterialCommunityIcons name="arrow-left" size={19} color="#00649D" />
        <Text style={styles.clientFormBackText}>Volver</Text>
      </Pressable>
      <Pressable accessibilityLabel="Descartar cambios" style={styles.clientFormDiscardButton} onPress={onDiscard}>
        <MaterialCommunityIcons name="close" size={17} color="#6B7D8C" />
        <Text style={styles.clientFormDiscardText}>Descartar</Text>
      </Pressable>
    </View>
  );
}

function ClienteForm({
  form,
  mode,
  saving,
  lookups,
  provincias,
  ciudades,
  loadingLookups,
  onCancel,
  onChange,
  onReset,
  onSave,
}: {
  form: ClienteFormState;
  mode: Exclude<ClienteFormMode, null>;
  saving: boolean;
  lookups: ClienteLookups | null;
  provincias: ProvinciaLookup[];
  ciudades: CiudadLookup[];
  loadingLookups: boolean;
  onCancel: () => void;
  onChange: <K extends keyof ClienteFormState>(key: K, value: ClienteFormState[K]) => void;
  onReset: () => void;
  onSave: () => void;
}) {
  const isEmpresa = form.tipoCliente === 2;
  const tiposClienteBase = lookups?.tipos.length ? lookups.tipos : [
    { tclCodigo: 1, descripcion: 'Persona Natural' },
    { tclCodigo: 2, descripcion: 'Persona Jurídica' },
  ];
  const tiposCliente = tiposClienteBase.map((tipo) => ({
    ...tipo,
    descripcion: getTipoClienteLabel(tipo.tclCodigo),
  }));
  const identificaciones = lookups?.identificaciones.length ? lookups.identificaciones : [
    { ideSec: 2, ideCodigo: '05', ideDescripcion: 'Cedula' },
    { ideSec: 1, ideCodigo: '04', ideDescripcion: 'RUC' },
    { ideSec: 3, ideCodigo: '06', ideDescripcion: 'Pasaporte' },
    { ideSec: 4, ideCodigo: '08', ideDescripcion: 'Identificacion del exterior' },
  ];
  const identificacionesPorTipoCliente = identificaciones.filter((item) => {
    const label = normalizeText(`${item.ideCodigo} ${item.ideDescripcion}`);
    if (!isEmpresa) return label.includes('ruc') || label.includes('cedula') || label.includes('pasaporte') || label.includes('exterior');
    return label.includes('ruc') || label.includes('pasaporte') || label.includes('exterior');
  });
  const paises = lookups?.paises ?? [];
  const diasCreditoRapidos = ['0', '15', '30', '45'];
  const diasCreditoPersonalizado = form.diasCredito.trim() !== '' && !diasCreditoRapidos.includes(form.diasCredito.trim());

  return (
    <View style={styles.clientFormCard}>
      <FormTopBar onBack={onCancel} onDiscard={onReset} />
      <Text style={styles.clientFormTitle}>{mode === 'edit' ? 'Editar cliente / proveedor' : 'Nuevo cliente / proveedor'}</Text>
      {loadingLookups ? <Text style={styles.mutedText}>Cargando catalogos...</Text> : null}

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Informacion basica</Text>
        <View style={styles.compactFieldRow}>
          <View style={styles.compactFieldGrow}>
            <DropdownField
              label="Tipo de cliente *"
              options={tiposCliente.map((tipo) => ({ label: tipo.descripcion, value: tipo.tclCodigo }))}
              value={form.tipoCliente || null}
              placeholder="-- Seleccione Tipo --"
              allowClear
              onChange={(value) => {
                onChange('tipoCliente', value ?? 0);
                if (value === 2) {
                  const currentIdentification = identificaciones.find((item) => item.ideSec === form.tipoidentificacion);
                  const currentLabel = normalizeText(`${currentIdentification?.ideCodigo ?? ''} ${currentIdentification?.ideDescripcion ?? ''}`);
                  if (currentLabel.includes('cedula')) onChange('tipoidentificacion', 0);
                }
              }}
            />
          </View>
          <View style={styles.compactFieldGrow}>
            <DropdownField
              label="Tipo identificacion *"
              options={identificacionesPorTipoCliente.map((item) => ({ label: item.ideDescripcion, value: item.ideSec }))}
              value={form.tipoidentificacion}
              onChange={(value) => {
                if (value !== null) onChange('tipoidentificacion', value);
              }}
            />
          </View>
        </View>
        <Field
          label="Numero identificacion *"
          value={form.numeroidentificacion}
          onChangeText={(value) => onChange('numeroidentificacion', value)}
          keyboardType={form.tipoidentificacion === 3 ? 'default' : 'number-pad'}
        />
        {isEmpresa ? (
          <>
            <View style={styles.compactFieldRow}>
              <View style={styles.compactFieldGrow}>
                <Field label="Nombre comercial *" value={form.nombrecomercial} onChangeText={(value) => onChange('nombrecomercial', value)} />
              </View>
              <View style={styles.compactFieldGrow}>
                <Field label="Razon social *" value={form.nombrerazonsocial} onChangeText={(value) => onChange('nombrerazonsocial', value)} />
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.compactFieldRow}>
              <View style={styles.compactFieldGrow}>
                <Field label="Apellidos *" value={form.apellidos} onChangeText={(value) => onChange('apellidos', value)} />
              </View>
              <View style={styles.compactFieldGrow}>
                <Field label="Nombres *" value={form.nombres} onChangeText={(value) => onChange('nombres', value)} />
              </View>
            </View>
          </>
        )}
        <ToggleRow
          label="Es proveedor"
          text="Tambien se registra para compras, retenciones y liquidaciones."
          value={form.esProveedor}
          onChange={(value) => onChange('esProveedor', value)}
        />
      </View>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Contacto</Text>
        <Field label="Correo principal *" value={form.correo} onChangeText={(value) => onChange('correo', value)} autoCapitalize="none" keyboardType="email-address" />
        {form.correosAdicionales.map((correo, index) => (
          <View key={`correo-${index}`} style={styles.inlineFieldRow}>
            <View style={styles.inlineFieldGrow}>
              <Field
                label={`Correo adicional ${index + 1}`}
                value={correo}
                onChangeText={(value) => {
                  const next = [...form.correosAdicionales];
                  next[index] = value;
                  onChange('correosAdicionales', next);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <Pressable
              style={styles.smallDangerButtonSolid}
              onPress={() => onChange('correosAdicionales', form.correosAdicionales.filter((_, itemIndex) => itemIndex !== index))}
            >
              <Text style={styles.smallDangerSolidText}>Quitar</Text>
            </Pressable>
          </View>
        ))}
        <SecondaryButton label="Agregar correo adicional" onPress={() => onChange('correosAdicionales', [...form.correosAdicionales, ''])} />
        <ToggleRow
          label="Obligado a llevar contabilidad *"
          text={form.oblgconta === 'SI' ? 'SI' : 'NO'}
          value={form.oblgconta === 'SI'}
          onChange={(value) => onChange('oblgconta', value ? 'SI' : 'NO')}
        />
        <View style={styles.segment}>
          <SegmentButton active={form.tipoContactoTelefonico === 'CELULAR'} label="Celular" onPress={() => onChange('tipoContactoTelefonico', 'CELULAR')} />
          <SegmentButton active={form.tipoContactoTelefonico === 'CONVENCIONAL'} label="Convencional" onPress={() => onChange('tipoContactoTelefonico', 'CONVENCIONAL')} />
        </View>
        {form.tipoContactoTelefonico === 'CONVENCIONAL' ? (
          <Field label="Telefono convencional" value={form.telefonoconvencional} onChangeText={(value) => onChange('telefonoconvencional', value)} keyboardType="phone-pad" />
        ) : (
          <Field label="Celular" value={form.celular} onChangeText={(value) => onChange('celular', value)} keyboardType="phone-pad" />
        )}
      </View>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Direccion</Text>
        <Field label="Direccion" value={form.direccion} onChangeText={(value) => onChange('direccion', value)} />
        <View style={styles.compactFieldRow}>
          {paises.length ? (
            <View style={styles.compactFieldGrow}>
              <DropdownField
                label="Pais"
                options={paises.map((pais) => ({ label: pais.descripcion, value: pais.idPais }))}
                value={form.pais}
                onChange={(value) => onChange('pais', value)}
              />
            </View>
          ) : null}
          {provincias.length ? (
            <View style={styles.compactFieldGrow}>
              <DropdownField
                label="Provincia"
                options={provincias.map((provincia) => ({ label: provincia.descripcion, value: provincia.idProvincia }))}
                value={form.provincia}
                onChange={(value) => onChange('provincia', value)}
              />
            </View>
          ) : null}
          {ciudades.length ? (
            <View style={styles.compactFieldGrow}>
              <DropdownField
                label="Canton"
                options={ciudades.map((ciudad) => ({ label: ciudad.descripcion, value: ciudad.idCiudad }))}
                value={form.ciudad}
                onChange={(value) => onChange('ciudad', value)}
              />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Informacion adicional</Text>
        <View style={styles.segment}>
          {diasCreditoRapidos.map((dias) => (
            <SegmentButton key={dias} active={form.diasCredito === dias} label={`${dias} dias`} onPress={() => onChange('diasCredito', dias)} />
          ))}
          <SegmentButton active={diasCreditoPersonalizado} label="Otro" onPress={() => onChange('diasCredito', diasCreditoPersonalizado ? '0' : '')} />
        </View>
        {diasCreditoPersonalizado || form.diasCredito.trim() === '' ? (
          <Field label="Dias de credito" value={form.diasCredito} onChangeText={(value) => onChange('diasCredito', value.replace(/[^\d]/g, ''))} keyboardType="number-pad" />
        ) : null}
        <Field label="Observaciones" value={form.observaciones} onChangeText={(value) => onChange('observaciones', value)} />
      </View>

      <View style={styles.formActions}>
        <SecondaryButton label="Limpiar formulario" onPress={onReset} />
        <PrimaryButton label={mode === 'edit' ? 'Guardar' : 'Registrar'} loading={saving} onPress={onSave} />
      </View>
    </View>
  );
}

function ClienteCard({
  cliente,
  tipoClienteLabel,
  stats,
  onView,
  onEdit,
  onDelete,
}: {
  cliente: Cliente;
  tipoClienteLabel: string;
  stats: { facturasEmitidas: number; saldoPendiente: number };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const name =
    cliente.nombrerazonsocial ||
    cliente.nombrecomercial ||
    [cliente.nombres, cliente.apellidos].filter(Boolean).join(' ') ||
    'Cliente sin nombre';
  const protectedSystem = isConsumidorFinal(cliente);
  const contact = cliente.correo || cliente.celular || cliente.telefonoconvencional || 'Sin contacto';

  return (
    <View style={[styles.clientCard, protectedSystem && styles.clientCardSystem]}>
      <View style={styles.clientCardHeader}>
        <View style={[styles.clientAvatar, protectedSystem && styles.clientAvatarSystem]}>
          <Text style={styles.clientAvatarText}>{protectedSystem ? 'CF' : name.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{name}</Text>
          <Text style={styles.clientMeta}>{cliente.numeroidentificacion || 'Sin identificacion'}</Text>
        </View>
         {protectedSystem ? (
           <View style={styles.clientBadgeStack}>
             <View style={styles.systemPill}>
               <Text style={styles.systemPillText}>Sistema</Text>
             </View>
           </View>
         ) : null}
       </View>

      <View style={styles.clientDetailGrid}>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>Contacto</Text>
          <Text style={styles.clientDetailValue} numberOfLines={1}>{contact}</Text>
        </View>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>Tipo</Text>
          <Text style={styles.clientDetailValue}>{tipoClienteLabel}</Text>
        </View>
      </View>

      <View style={styles.clientStatsGrid}>
        <View style={styles.clientStatItem}>
          <Text style={styles.clientDetailLabel}>Facturas emitidas</Text>
          <Text style={styles.clientStatValue}>{stats.facturasEmitidas}</Text>
        </View>
        <View style={styles.clientStatItem}>
          <Text style={styles.clientDetailLabel}>Saldo pendiente</Text>
          <Text style={styles.clientStatValue}>{formatMoney(stats.saldoPendiente)}</Text>
        </View>
      </View>

      {protectedSystem ? (
        <View style={styles.clientActions}>
          <View style={styles.systemNoticeCompact}>
            <Text style={styles.systemNoticeText}>Registro fijo para facturacion.</Text>
          </View>
          <Pressable style={styles.smallActionButton} onPress={onView}>
            <MaterialCommunityIcons name="eye-outline" size={16} color="#00649D" />
            <Text style={styles.smallActionText}>Ver</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.clientActions}>
          <Pressable style={styles.smallActionButton} onPress={onView}>
            <MaterialCommunityIcons name="eye-outline" size={16} color="#00649D" />
            <Text style={styles.smallActionText}>Ver</Text>
          </Pressable>
          <Pressable style={styles.smallActionButton} onPress={onEdit}>
            <MaterialCommunityIcons name="pencil-outline" size={16} color="#00649D" />
            <Text style={styles.smallActionText}>Editar</Text>
          </Pressable>
          <Pressable style={[styles.smallActionButton, styles.smallDangerButton]} onPress={onDelete}>
            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#B4232D" />
            <Text style={[styles.smallActionText, styles.smallDangerText]}>Eliminar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function ProductoForm({
  form,
  mode,
  saving,
  lookups,
  subcategorias,
  loadingLookups,
  onCancel,
  onChange,
  onReset,
  onSave,
}: {
  form: ProductoFormState;
  mode: Exclude<ProductoFormMode, null>;
  saving: boolean;
  lookups: ProductoLookups | null;
  subcategorias: SubcategoriaLookup[];
  loadingLookups: boolean;
  onCancel: () => void;
  onChange: <K extends keyof ProductoFormState>(key: K, value: ProductoFormState[K]) => void;
  onReset: () => void;
  onSave: () => void;
}) {
  const tarifas = lookups?.tarifas.length ? lookups.tarifas : FALLBACK_TARIFAS_IVA;
  const categorias = lookups?.categorias ?? [];

  return (
    <View style={styles.clientFormCard}>
      <FormTopBar onBack={onCancel} onDiscard={onReset} />
      <Text style={styles.clientFormTitle}>{mode === 'edit' ? 'Editar producto o servicio' : 'Registrar producto o servicio'}</Text>
      {loadingLookups ? <Text style={styles.mutedText}>Cargando catalogos...</Text> : null}

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Informacion basica</Text>
        <View style={styles.segment}>
          <SegmentButton active={form.tipo === 'PRODUCTO'} label="Producto" onPress={() => onChange('tipo', 'PRODUCTO')} />
          <SegmentButton active={form.tipo === 'SERVICIO'} label="Servicio" onPress={() => onChange('tipo', 'SERVICIO')} />
        </View>
        <Field label="Nombre *" value={form.nombre} onChangeText={(value) => onChange('nombre', value)} />
        <Field label="Codigo (opcional)" value={form.codigo} onChangeText={(value) => onChange('codigo', value)} autoCapitalize="characters" />
      </View>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Precios y tarifas</Text>
        {form.precios.map((precio, index) => (
          <View key={`precio-${index}`} style={styles.inlineFieldRow}>
            <View style={styles.inlineFieldGrow}>
              <Field
                label={index === 0 ? 'Precio base *' : `Precio adicional ${index}`}
                value={precio}
                onChangeText={(value) => {
                  const next = [...form.precios];
                  next[index] = value.replace(/[^\d.,]/g, '');
                  onChange('precios', next);
                  if (index === 0) onChange('precioBase', next[0]);
                }}
                keyboardType="decimal-pad"
              />
            </View>
            {index > 0 ? (
              <Pressable
                style={styles.smallDangerButtonSolid}
                onPress={() => {
                  const next = form.precios.filter((_, itemIndex) => itemIndex !== index);
                  onChange('precios', next.length ? next : ['']);
                  onChange('precioBase', next[0] ?? '');
                }}
              >
                <Text style={styles.smallDangerSolidText}>Quitar</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        <SecondaryButton label="Agregar precio" onPress={() => onChange('precios', [...form.precios, ''])} />
        <ToggleRow
          label="IVA (opcional)"
          text={form.iva ? 'Aplicar IVA al producto o servicio.' : 'Sin IVA configurado.'}
          value={form.iva}
          onChange={(value) => {
            onChange('iva', value);
            if (!value) onChange('tarifa', null);
          }}
        />
        <DropdownField
          label={form.iva ? 'Tarifa *' : 'Tarifa (opcional)'}
          options={tarifas.map((tarifa) => ({ label: tarifa.descripcion, value: tarifa.idTarifa }))}
          value={form.tarifa}
          placeholder="-- Seleccione --"
          allowClear
          onChange={(value) => onChange('tarifa', value)}
        />
      </View>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Clasificacion y configuracion</Text>
        <DropdownField
          label="Categoria (opcional)"
          options={categorias.map((categoria) => ({ label: categoria.descripcion, value: categoria.idCategoria }))}
          value={form.categoria}
          placeholder="-- Sin categoria --"
          allowClear
          onChange={(value) => onChange('categoria', value)}
        />
        <DropdownField
          label="Subcategoria (opcional)"
          options={subcategorias.map((subcategoria) => ({ label: subcategoria.descripcion, value: subcategoria.idSubcategoria }))}
          value={form.subcategoria}
          placeholder={form.categoria ? '-- Sin subcategoria --' : '-- Seleccione una categoria primero --'}
          allowClear
          onChange={(value) => onChange('subcategoria', value)}
        />
      </View>

      <View style={styles.formActions}>
        <SecondaryButton label="Limpiar formulario" onPress={onReset} />
        <PrimaryButton label={mode === 'edit' ? 'Guardar' : 'Crear registro'} loading={saving} onPress={onSave} />
      </View>
    </View>
  );
}

function ProductoCard({ producto, onView, onEdit, onDelete }: { producto: Producto; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const precioBase = Number.isFinite(producto.precioBase) ? producto.precioBase : 0;
  const tarifa = producto.tarifaDescripcion ?? (producto.tarifa !== null && producto.tarifa !== undefined ? `${producto.tarifa}%` : null);
  const ivaTarifa = tarifa ? `Con IVA - ${tarifa}` : producto.iva ? 'Con IVA' : 'Sin IVA';
  const detail = [
    producto.codigo ? `Cod. ${producto.codigo}` : null,
    producto.categoriaDescripcion,
    producto.subcategoriaDescripcion,
  ].filter(Boolean).join(' - ');

  return (
    <View style={styles.clientCard}>
      <View style={styles.clientCardHeader}>
        <View style={styles.clientAvatar}>
          <Text style={styles.clientAvatarText}>{producto.tipo === 'SERVICIO' ? 'S' : 'P'}</Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{producto.nombre || 'Producto sin nombre'}</Text>
          <Text style={styles.clientMeta}>{detail || (producto.tipo === 'SERVICIO' ? 'Servicio' : 'Producto')}</Text>
        </View>
      </View>

      <View style={styles.clientDetailGrid}>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>Precio base</Text>
          <Text style={styles.clientDetailValue}>${precioBase.toFixed(2)}</Text>
        </View>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>IVA / Tarifa</Text>
          <Text style={styles.clientDetailValue} numberOfLines={1}>{ivaTarifa}</Text>
        </View>
      </View>

      <View style={styles.clientDetailGrid}>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>Categoria</Text>
          <Text style={styles.clientDetailValue} numberOfLines={1}>{producto.categoriaDescripcion || 'Sin categoria'}</Text>
        </View>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>Subcategoria</Text>
          <Text style={styles.clientDetailValue} numberOfLines={1}>{producto.subcategoriaDescripcion || 'Sin subcategoria'}</Text>
        </View>
      </View>

      <View style={styles.clientActions}>
        <Pressable style={styles.smallActionButton} onPress={onView}>
          <MaterialCommunityIcons name="eye-outline" size={16} color="#00649D" />
          <Text style={styles.smallActionText}>Ver</Text>
        </Pressable>
        <Pressable style={styles.smallActionButton} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color="#00649D" />
          <Text style={styles.smallActionText}>Editar</Text>
        </Pressable>
        <Pressable style={[styles.smallActionButton, styles.smallDangerButton]} onPress={onDelete}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#B4232D" />
          <Text style={[styles.smallActionText, styles.smallDangerText]}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CategoriaForm({
  form,
  mode,
  saving,
  onCancel,
  onChange,
  onReset,
  onSave,
}: {
  form: CategoriaFormState;
  mode: Exclude<CategoriaFormMode, null>;
  saving: boolean;
  onCancel: () => void;
  onChange: <K extends keyof CategoriaFormState>(key: K, value: CategoriaFormState[K]) => void;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.clientFormCard}>
      <FormTopBar onBack={onCancel} onDiscard={onReset} />
      <Text style={styles.clientFormTitle}>{mode === 'edit' ? 'Editar categoria' : 'Nueva categoria'}</Text>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Operacion</Text>
        <Field label="Descripcion *" value={form.descripcion} onChangeText={(value) => onChange('descripcion', value)} />
      </View>
      <View style={styles.formActions}>
        <SecondaryButton label="Limpiar formulario" onPress={onReset} />
        <PrimaryButton label="Guardar" loading={saving} onPress={onSave} />
      </View>
    </View>
  );
}

function SubcategoriaForm({
  form,
  mode,
  saving,
  categorias,
  onCancel,
  onChange,
  onReset,
  onSave,
}: {
  form: SubcategoriaFormState;
  mode: Exclude<CategoriaFormMode, null>;
  saving: boolean;
  categorias: CategoriaCatalogo[];
  onCancel: () => void;
  onChange: <K extends keyof SubcategoriaFormState>(key: K, value: SubcategoriaFormState[K]) => void;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.clientFormCard}>
      <FormTopBar onBack={onCancel} onDiscard={onReset} />
      <Text style={styles.clientFormTitle}>{mode === 'edit' ? 'Editar subcategoria' : 'Nueva subcategoria'}</Text>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Operacion</Text>
        <Field label="Descripcion *" value={form.descripcion} onChangeText={(value) => onChange('descripcion', value)} />
        <DropdownField
          label="Categoria (opcional)"
          options={categorias.map((categoria) => ({ label: categoria.descripcion, value: categoria.idCategoria }))}
          value={form.idCategoria}
          placeholder="-- Seleccione --"
          allowClear
          onChange={(value) => onChange('idCategoria', value)}
        />
      </View>
      <View style={styles.formActions}>
        <SecondaryButton label="Limpiar formulario" onPress={onReset} />
        <PrimaryButton label="Guardar" loading={saving} onPress={onSave} />
      </View>
    </View>
  );
}

function CategoriaCard({ categoria, onView, onEdit, onDelete }: { categoria: CategoriaCatalogo; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <CatalogCard
      initials="C"
      title={categoria.descripcion || 'Categoria sin descripcion'}
      subtitle="Categoria"
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function SubcategoriaCard({
  subcategoria,
  categoriaDescripcion,
  onView,
  onEdit,
  onDelete,
}: {
  subcategoria: SubcategoriaCatalogo;
  categoriaDescripcion?: string | null;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <CatalogCard
      initials="S"
      title={subcategoria.descripcion || 'Subcategoria sin descripcion'}
      subtitle={categoriaDescripcion || 'Sin categoria asociada'}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function CatalogCard({
  initials,
  title,
  subtitle,
  onView,
  onEdit,
  onDelete,
}: {
  initials: string;
  title: string;
  subtitle: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.clientCard}>
      <View style={styles.clientCardHeader}>
        <View style={styles.clientAvatar}>
          <Text style={styles.clientAvatarText}>{initials}</Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{title}</Text>
          <Text style={styles.clientMeta}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.clientActions}>
        <Pressable style={styles.smallActionButton} onPress={onView}>
          <MaterialCommunityIcons name="eye-outline" size={16} color="#00649D" />
          <Text style={styles.smallActionText}>Ver</Text>
        </Pressable>
        <Pressable style={styles.smallActionButton} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color="#00649D" />
          <Text style={styles.smallActionText}>Editar</Text>
        </Pressable>
        <Pressable style={[styles.smallActionButton, styles.smallDangerButton]} onPress={onDelete}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#B4232D" />
          <Text style={[styles.smallActionText, styles.smallDangerText]}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function EmisorForm({
  form,
  mode,
  saving,
  onCancel,
  onChange,
  onReset,
  onSelectLogo,
  onSave,
}: {
  form: EmisorFormState;
  mode: Exclude<EmisorFormMode, null>;
  saving: boolean;
  onCancel: () => void;
  onChange: <K extends keyof EmisorFormState>(key: K, value: EmisorFormState[K]) => void;
  onReset: () => void;
  onSelectLogo: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.clientFormCard}>
      <FormTopBar onBack={onCancel} onDiscard={onReset} />
      <Text style={styles.clientFormTitle}>{mode === 'edit' ? 'Editar emisor' : 'Registrar emisor'}</Text>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Informacion fiscal</Text>
        <Field label="Razon Social *" value={form.razonSocial} onChangeText={(value) => onChange('razonSocial', value)} />
        <Field label="RUC *" value={form.ruc} onChangeText={(value) => onChange('ruc', value.replace(/\D/g, ''))} keyboardType="number-pad" />
        <Field label="Nombre Comercial *" value={form.nomComercial} onChangeText={(value) => onChange('nomComercial', value)} />
        <Field label="Direccion Establecimiento *" value={form.dirEstablecimiento} onChangeText={(value) => onChange('dirEstablecimiento', value)} />
        <Field label="Direccion Matriz *" value={form.direccionMatriz} onChangeText={(value) => onChange('direccionMatriz', value)} />
        <ToggleRow
          label="Lleva contabilidad"
          text={form.llevaContabilidad}
          value={form.llevaContabilidad === 'SI'}
          onChange={(value) => onChange('llevaContabilidad', value ? 'SI' : 'NO')}
        />
      </View>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Identidad visual</Text>
        <SecondaryButton label="Seleccionar logo" onPress={onSelectLogo} />
        {form.logoImagen ? (
          <View style={styles.logoPreviewBox}>
            <Image source={{ uri: form.logoImagen }} style={styles.logoPreviewImage} resizeMode="contain" />
            <SecondaryButton label="Quitar logo" onPress={() => onChange('logoImagen', '')} />
          </View>
        ) : (
          <Text style={styles.mutedText}>Ningún logo seleccionado.</Text>
        )}
      </View>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Contacto</Text>
        <Field label="Telefono *" value={form.telefono} onChangeText={(value) => onChange('telefono', value)} keyboardType="phone-pad" />
        <Field label="Correo Electronico" value={form.email} onChangeText={(value) => onChange('email', value)} autoCapitalize="none" keyboardType="email-address" />
      </View>

      <View style={styles.formActions}>
        <SecondaryButton label="Limpiar formulario" onPress={onReset} />
        <PrimaryButton label={mode === 'edit' ? 'Guardar cambios' : 'Crear emisor'} loading={saving} onPress={onSave} />
      </View>
    </View>
  );
}

function EmisorCard({ emisor, onView, onEdit, onDelete }: { emisor: Emisor; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const title = emisor.razonSocial || emisor.nomComercial || 'Emisor sin nombre';
  const contact = [emisor.email, emisor.telefono].filter(Boolean).join(' - ') || 'Sin contacto';

  return (
    <View style={styles.clientCard}>
      <View style={styles.clientCardHeader}>
        <View style={styles.clientAvatar}>
          <Text style={styles.clientAvatarText}>E</Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{title}</Text>
          <Text style={styles.clientMeta}>{emisor.ruc || 'Sin RUC'}</Text>
        </View>
      </View>

      <View style={styles.clientDetailGrid}>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>Nombre comercial</Text>
          <Text style={styles.clientDetailValue} numberOfLines={1}>{emisor.nomComercial || 'Sin nombre comercial'}</Text>
        </View>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>Contacto</Text>
          <Text style={styles.clientDetailValue} numberOfLines={1}>{contact}</Text>
        </View>
      </View>

      <View style={styles.clientActions}>
        <Pressable style={styles.smallActionButton} onPress={onView}>
          <MaterialCommunityIcons name="eye-outline" size={16} color="#00649D" />
          <Text style={styles.smallActionText}>Ver</Text>
        </Pressable>
        <Pressable style={styles.smallActionButton} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color="#00649D" />
          <Text style={styles.smallActionText}>Editar</Text>
        </Pressable>
        <Pressable style={[styles.smallActionButton, styles.smallDangerButton]} onPress={onDelete}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#B4232D" />
          <Text style={[styles.smallActionText, styles.smallDangerText]}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FirmaForm({
  emisor,
  form,
  saving,
  estado,
  onCancel,
  onChange,
  onClear,
  onSelectArchivo,
  onSave,
}: {
  emisor: Emisor;
  form: EmisorFormState;
  saving: boolean;
  estado?: FirmaEstado;
  onCancel: () => void;
  onChange: <K extends keyof EmisorFormState>(key: K, value: EmisorFormState[K]) => void;
  onClear: () => void;
  onSelectArchivo: () => void;
  onSave: () => void;
}) {
  const configured = hasFirmaConfigured({ ...emisor, pathCertificado: form.pathCertificado || emisor.pathCertificado });
  const archivoLabel = form.firmaArchivoNombre || getFirmaFileName(form.pathCertificado) || 'Ningún .p12 seleccionado';

  return (
    <View style={styles.clientFormCard}>
      <FormTopBar onBack={onCancel} onDiscard={onClear} />
      <Text style={styles.clientFormTitle}>{emisor.nomComercial || emisor.razonSocial || 'Firma electronica'}</Text>
      <Text style={styles.clientMeta}>{emisor.ruc ? `RUC ${emisor.ruc}` : 'RUC no disponible'}</Text>

      {estado ? (
        <MessageBox
          message={{
            type: estado.esValida ? 'success' : 'error',
            text: estado.esValida
              ? `Firma vigente${estado.diasRestantes !== null && estado.diasRestantes !== undefined ? `, ${estado.diasRestantes} dias restantes` : ''}.`
              : estado.mensaje || 'Firma no valida.',
          }}
        />
      ) : configured ? (
        <MessageBox message={{ type: 'info', text: 'Firma configurada. Se validara al refrescar o guardar.' }} />
      ) : null}

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Archivo de firma</Text>
        <SecondaryButton label={configured ? 'Cambiar archivo .p12' : 'Seleccionar archivo .p12'} onPress={onSelectArchivo} />
        <Text style={styles.mutedText}>{archivoLabel}</Text>
        <Field label="Clave del certificado" value={form.claveCertificado} onChangeText={(value) => onChange('claveCertificado', value)} secureTextEntry />
        {emisor.tieneClaveCertificadoConfigurada ? <Text style={styles.mutedText}>Clave configurada actualmente.</Text> : null}
      </View>

      <View style={styles.formActions}>
        {configured ? <SecondaryButton label="Quitar firma" onPress={onClear} /> : null}
        <PrimaryButton label={configured ? 'Guardar firma' : 'Agregar firma'} loading={saving} onPress={onSave} />
      </View>
    </View>
  );
}

function FirmaCard({ emisor, estado, onView, onEdit, onDelete }: { emisor: Emisor; estado?: FirmaEstado; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const configured = hasFirmaConfigured(emisor) || estado?.tieneCertificado === true;
  const title = emisor.razonSocial || emisor.nomComercial || 'Emisor sin nombre';
  const status = !configured
    ? 'Pendiente'
    : estado?.esValida
      ? 'Vigente'
      : estado
        ? 'No valida'
        : 'Configurada';

  return (
    <View style={styles.clientCard}>
      <View style={styles.clientCardHeader}>
        <View style={[styles.clientAvatar, configured && styles.clientAvatarSystem]}>
          <Text style={styles.clientAvatarText}>F</Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{title}</Text>
          <Text style={styles.clientMeta}>{emisor.ruc || 'Sin RUC'}</Text>
        </View>
      </View>

      <View style={[styles.clientDetailGrid, styles.firmaCompactGrid]}>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>Firma</Text>
          <Text style={styles.clientDetailValue}>{status}</Text>
        </View>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>Vigencia</Text>
          <Text style={[styles.clientDetailValue, estado?.diasRestantes !== null && estado?.diasRestantes !== undefined && { color: estado.diasRestantes <= 30 ? EFACT_THEME.colors.warning : EFACT_THEME.colors.success }]}>
            {estado?.diasRestantes !== null && estado?.diasRestantes !== undefined ? `${estado.diasRestantes} dias` : 'No disponible'}
          </Text>
        </View>
      </View>
      <View style={styles.systemNoticeCompact}>
        <Text style={styles.systemNoticeText} numberOfLines={2}>
          {configured ? `Archivo: ${getFirmaFileName(emisor.pathCertificado) || 'certificado configurado'}` : 'Carga el archivo .p12 y su clave para habilitar la firma.'}
        </Text>
      </View>

      <View style={styles.clientActions}>
        <Pressable style={styles.smallActionButton} onPress={onView}>
          <MaterialCommunityIcons name="eye-outline" size={16} color="#00649D" />
          <Text style={styles.smallActionText}>Ver</Text>
        </Pressable>
        <Pressable style={[styles.smallActionButton, styles.smallSuccessButton]} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color="#128A46" />
          <Text style={[styles.smallActionText, styles.smallSuccessText]}>{configured ? 'Cambiar firma' : 'Agregar firma'}</Text>
        </Pressable>
        <Pressable style={[styles.smallActionButton, styles.smallDangerButton]} onPress={onDelete}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#B4232D" />
          <Text style={[styles.smallActionText, styles.smallDangerText]}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PerfilForm({
  form,
  lookup,
  saving,
  onChange,
  onReset,
  onSelectAvatar,
  onSelectInitialsAvatar,
  onSelectPresetAvatar,
  onSave,
}: {
  form: PerfilFormState;
  lookup: PerfilLookup | null;
  saving: boolean;
  onChange: <K extends keyof PerfilFormState>(key: K, value: PerfilFormState[K]) => void;
  onReset: () => void;
  onSelectAvatar: () => void;
  onSelectInitialsAvatar: () => void;
  onSelectPresetAvatar: (avatar: string) => void;
  onSave: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const tiposCliente = lookup?.tiposCliente.length ? lookup.tiposCliente : [
    { tclCodigo: 1, descripcion: 'Persona Natural' },
    { tclCodigo: 2, descripcion: 'Persona Juridica' },
  ];
  const identificaciones = lookup?.tiposIdentificacion ?? [];
  const esEmpresa = form.tipoCliente === 2;
  const selectedAvatar = form.avatarUrl.toLowerCase().includes('images/avatars/') ? form.avatarUrl.split('/').pop() || 'Avatar-Boy.jpg' : '';
  const initials = getInitials(form.nombres, form.apellidos, form.nombreEmpresa);
  const usesInitials = isInitialsAvatar(form.avatarUrl);
  const usesPersonalPhoto = isPersonalPhoto(form.avatarUrl);
  const displayName = esEmpresa
    ? form.nombreEmpresa || 'Empresa'
    : [form.nombres, form.apellidos].filter(Boolean).join(' ') || 'Usuario';
  const identificationLabel = identificaciones.find((item) => item.idTipoIdentificacion === form.idTipoIdentificacion)?.descripcion
    ?? identificaciones.find((item) => item.idTipoIdentificacion === form.idTipoIdentificacion)?.nombreTipo
    ?? 'Identificacion';

  if (!editing) {
    return (
      <View style={styles.profileOverview}>
        <View style={styles.profileHeroCard}>
          <View style={styles.profileHeroTop}>
            {usesInitials ? (
              <InitialsAvatar initials={initials} size={88} />
            ) : (
              <Image source={{ uri: resolveImageUrl(form.avatarUrl) }} style={styles.profileHeroImage} />
            )}
            <View style={styles.profileHeroCopy}>
              <Text style={styles.profileHeroEyebrow}>{getTipoClienteLabel(form.tipoCliente) || 'Perfil E-FACT'}</Text>
              <Text style={styles.profileHeroName} numberOfLines={2}>{displayName}</Text>
              <Text style={styles.profileHeroMeta} numberOfLines={1}>{form.email || 'Correo no registrado'}</Text>
            </View>
          </View>
          <View style={styles.profileHeroActions}>
            <Pressable style={styles.profileMainAction} onPress={() => setEditing(true)}>
              <MaterialCommunityIcons name="account-edit-outline" size={19} color="#FFFFFF" />
              <Text style={styles.profileMainActionText}>Editar perfil</Text>
            </Pressable>
            <Pressable style={styles.profileSecondaryAction} onPress={onSelectAvatar}>
              <MaterialCommunityIcons name="camera-outline" size={18} color={EFACT_THEME.colors.primary} />
              <Text style={styles.profileSecondaryActionText}>Foto</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.profileInfoGrid}>
          <ProfileInfoTile icon="card-account-details-outline" label={identificationLabel} value={form.identificacion || 'Sin identificacion'} />
          <ProfileInfoTile icon="cellphone" label="Celular" value={form.celular || 'Sin celular'} />
          <ProfileInfoTile icon="map-marker-outline" label="Direccion" value={form.direccionEmpresa || 'Sin direccion'} full />
        </View>

        <View style={styles.profileSecurityCard}>
          <View style={styles.profileSecurityIcon}>
            <MaterialCommunityIcons name="shield-check-outline" size={22} color={EFACT_THEME.colors.success} />
          </View>
          <View style={styles.profileSecurityCopy}>
            <Text style={styles.profileSecurityTitle}>Cuenta protegida</Text>
            <Text style={styles.profileSecurityText}>Tu clave no se muestra. Puedes cambiarla desde editar perfil.</Text>
          </View>
        </View>

        <View style={styles.infoNotice}>
          <View style={styles.infoNoticeIcon}>
            <Text style={styles.infoNoticeIconText}>i</Text>
          </View>
          <View style={styles.infoNoticeBody}>
            <Text style={styles.infoNoticeTitle}>Datos para facturacion</Text>
            <Text style={styles.infoNoticeText}>Esta informacion se utilizara para emitir correctamente tus comprobantes.</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.clientFormCard}>
      <View style={styles.profileEditHeader}>
        <View style={styles.profileEditTitleBlock}>
          <Text style={styles.clientFormTitle}>Editar perfil</Text>
          <Text style={styles.profileEditHint}>Actualiza solo los datos que necesites cambiar.</Text>
        </View>
        <Pressable style={styles.profileCloseEditButton} onPress={() => setEditing(false)}>
          <MaterialCommunityIcons name="close" size={20} color={EFACT_THEME.colors.primary} />
        </Pressable>
      </View>

      <View style={styles.profileAvatarPanel}>
        {usesInitials ? (
          <InitialsAvatar initials={initials} size={82} />
        ) : (
          <Image source={{ uri: resolveImageUrl(form.avatarUrl) }} style={styles.profileAvatarImage} />
        )}
        <View style={styles.profileAvatarInfo}>
          <Text style={styles.profileAvatarName} numberOfLines={2}>{displayName}</Text>
          <Text style={styles.profileAvatarMeta}>{usesPersonalPhoto ? 'Foto personal cargada' : usesInitials ? 'Iniciales del nombre' : 'Avatar seleccionado'}</Text>
          <Text style={styles.profileAvatarCount}>{AVATARS.length} avatares disponibles</Text>
          <Pressable style={styles.profileUploadButton} onPress={onSelectAvatar}>
            <Text style={styles.profileUploadText}>Subir foto propia</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarStrip}>
        <Pressable
          style={[styles.avatarChoice, usesInitials && styles.avatarChoiceActive]}
          onPress={onSelectInitialsAvatar}
        >
          <InitialsAvatar initials={initials} size={42} />
        </Pressable>
        {AVATARS.map((avatar) => (
          <Pressable
            key={`perfil-${avatar}`}
            style={[styles.avatarChoice, !usesPersonalPhoto && selectedAvatar === avatar && styles.avatarChoiceActive]}
            onPress={() => onSelectPresetAvatar(avatar)}
          >
            <Image source={avatarImageSource(avatar)} style={styles.avatarChoiceImage} />
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.infoNotice}>
        <View style={styles.infoNoticeIcon}>
          <Text style={styles.infoNoticeIconText}>i</Text>
        </View>
        <View style={styles.infoNoticeBody}>
          <Text style={styles.infoNoticeTitle}>Datos para facturacion</Text>
          <Text style={styles.infoNoticeText}>Esta informacion se utilizara para emitir correctamente tus comprobantes.</Text>
        </View>
      </View>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Cuenta</Text>
        <Field label="Correo Electronico" value={form.email} onChangeText={(value) => onChange('email', value)} autoCapitalize="none" keyboardType="email-address" />
        <DropdownField
          label="Tipo de cliente *"
          options={tiposCliente.map((tipo) => ({ label: getTipoClienteLabel(tipo.tclCodigo), value: tipo.tclCodigo }))}
          value={form.tipoCliente || null}
          placeholder="-- Seleccione Tipo --"
          allowClear
          onChange={(value) => onChange('tipoCliente', value ?? 0)}
        />
        <DropdownField
          label="Tipo identificacion *"
          options={identificaciones.map((item) => ({ label: item.descripcion || item.nombreTipo, value: item.idTipoIdentificacion }))}
          value={form.idTipoIdentificacion}
          placeholder="-- Seleccione --"
          allowClear
          onChange={(value) => onChange('idTipoIdentificacion', value)}
        />
        <Field label="Identificacion *" value={form.identificacion} onChangeText={(value) => onChange('identificacion', value)} />
      </View>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Datos personales</Text>
        {esEmpresa ? (
          <Field label="Razon social *" value={form.nombreEmpresa} onChangeText={(value) => onChange('nombreEmpresa', value)} />
        ) : (
          <>
            <Field label="Nombres *" value={form.nombres} onChangeText={(value) => onChange('nombres', value)} />
            <Field label="Apellidos *" value={form.apellidos} onChangeText={(value) => onChange('apellidos', value)} />
          </>
        )}
      </View>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Contacto</Text>
        <Field label="Celular" value={form.celular} onChangeText={(value) => onChange('celular', value)} keyboardType="phone-pad" />
        <Field label="Direccion *" value={form.direccionEmpresa} onChangeText={(value) => onChange('direccionEmpresa', value)} />
      </View>

      <View style={styles.formSectionBox}>
        <View style={styles.securityHeaderRow}>
          <View style={styles.securityTitleBlock}>
            <Text style={styles.clientFormSubtitle}>Seguridad</Text>
            <Text style={styles.clientFormTitle}>Clave de acceso</Text>
          </View>
          <View style={styles.securityToggleRow}>
            <Text style={styles.securityStablePill}>{form.cambiarClave ? 'Cambio' : 'Estable'}</Text>
            <Pressable
              style={[styles.securitySwitch, form.cambiarClave && styles.securitySwitchActive]}
              onPress={() => {
                const next = !form.cambiarClave;
                onChange('cambiarClave', next);
                if (!next) {
                  onChange('nuevaPassword', '');
                  onChange('confirmarPassword', '');
                }
              }}
            >
              <View style={[styles.securitySwitchKnob, form.cambiarClave && styles.securitySwitchKnobActive]} />
            </Pressable>
            <Text style={styles.securityToggleText}>Cambiar</Text>
          </View>
        </View>
        {form.cambiarClave ? (
          <>
            <Field label="Nueva clave" value={form.nuevaPassword} onChangeText={(value) => onChange('nuevaPassword', value)} secureTextEntry />
            <Field label="Confirmar clave" value={form.confirmarPassword} onChangeText={(value) => onChange('confirmarPassword', value)} secureTextEntry />
          </>
        ) : (
          <View style={styles.securityNoChangeBox}>
            <View style={styles.infoNoticeIcon}>
              <Text style={styles.infoNoticeIconText}>✓</Text>
            </View>
            <Text style={styles.securityNoChangeText}>Sin cambios en contraseña</Text>
          </View>
        )}
      </View>

      <View style={styles.formActions}>
        <SecondaryButton label="Cancelar" onPress={() => {
          onReset();
          setEditing(false);
        }} />
        <PrimaryButton label="Guardar cambios" loading={saving} onPress={onSave} />
      </View>
    </View>
  );
}

function ProfileInfoTile({
  icon,
  label,
  value,
  full,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <View style={[styles.profileInfoTile, full && styles.profileInfoTileFull]}>
      <View style={styles.profileInfoIcon}>
        <MaterialCommunityIcons name={icon} size={19} color={EFACT_THEME.colors.primary} />
      </View>
      <View style={styles.profileInfoCopy}>
        <Text style={styles.profileInfoLabel}>{label}</Text>
        <Text style={styles.profileInfoValue} numberOfLines={full ? 2 : 1}>{value}</Text>
      </View>
    </View>
  );
}

function PuntoEmisionForm({
  form,
  mode,
  saving,
  establecimiento,
  onCancel,
  onChange,
  onReset,
  onSave,
}: {
  form: PuntoFormState;
  mode: Exclude<PuntoFormMode, null>;
  saving: boolean;
  establecimiento?: string | null;
  onCancel: () => void;
  onChange: <K extends keyof PuntoFormState>(key: K, value: PuntoFormState[K]) => void;
  onReset: () => void;
  onSave: () => void;
}) {
  const punto = normalizeSerieCode(form.puntoEmision);

  return (
    <View style={styles.clientFormCard}>
      <Text style={styles.clientFormTitle}>{mode === 'edit' ? 'Editar punto de emision' : 'Nuevo punto de emision'}</Text>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Serie</Text>
        <View style={styles.clientDetailGrid}>
          <View style={styles.clientDetailItem}>
            <Text style={styles.clientDetailLabel}>Establecimiento</Text>
            <Text style={styles.clientDetailValue}>{establecimiento || '001'}</Text>
          </View>
          <View style={styles.clientDetailItem}>
            <Text style={styles.clientDetailLabel}>Serie</Text>
            <Text style={styles.clientDetailValue}>{`${establecimiento || '001'}-${punto || '000'}`}</Text>
          </View>
        </View>
        <Field
          label="Punto de emision *"
          value={form.puntoEmision}
          onChangeText={(value) => onChange('puntoEmision', value.replace(/\D/g, '').slice(0, 3))}
          keyboardType="number-pad"
        />
      </View>
      <View style={styles.formActions}>
        <SecondaryButton label="Limpiar formulario" onPress={onReset} />
        <SecondaryButton label="Cancelar" onPress={onCancel} />
        <PrimaryButton label={mode === 'edit' ? 'Guardar' : 'Crear punto'} loading={saving} onPress={onSave} />
      </View>
    </View>
  );
}

function PuntoEmisionCard({
  punto,
  canDelete,
  onEdit,
  onDelete,
  onMakePrincipal,
}: {
  punto: PuntoEmision;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMakePrincipal: () => void;
}) {
  const serie = getPuntoSerie(punto);

  return (
    <View style={[styles.clientCard, punto.esPrincipal && styles.puntoCardPrincipal]}>
      <View style={styles.clientCardHeader}>
        <View style={styles.clientAvatar}>
          <Text style={styles.clientAvatarText}>P</Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{punto.esPrincipal ? 'Caja principal' : `Caja ${punto.numCaja ?? punto.puntoEmision ?? ''}`}</Text>
          <Text style={styles.clientMeta}>{serie || 'Serie no configurada'}</Text>
        </View>
        {punto.esPrincipal ? (
          <View style={styles.systemPill}>
            <Text style={styles.systemPillText}>Principal</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.clientDetailGrid}>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>Serie factura</Text>
          <Text style={styles.clientDetailValue}>{punto.serieFactura || serie || 'Sin serie'}</Text>
        </View>
        <View style={styles.clientDetailItem}>
          <Text style={styles.clientDetailLabel}>Estado</Text>
          <Text style={styles.clientDetailValue}>{punto.estado === false ? 'Inactivo' : 'Activo'}</Text>
        </View>
      </View>

      <View style={styles.clientActions}>
        {!punto.esPrincipal ? (
          <Pressable style={styles.smallActionButton} onPress={onMakePrincipal}>
            <Text style={styles.smallActionText}>Principal</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.smallActionButton} onPress={onEdit}>
          <Text style={styles.smallActionText}>Editar</Text>
        </Pressable>
        {canDelete ? (
          <Pressable style={[styles.smallActionButton, styles.smallDangerButton]} onPress={onDelete}>
            <Text style={[styles.smallActionText, styles.smallDangerText]}>Eliminar</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function SmoothPressable({ children, style, ...props }: React.ComponentProps<typeof Pressable>) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReducedMotion();

  const animateScale = (toValue: number) => {
    Animated.spring(scale, {
      toValue: reduceMotion ? 1 : toValue,
      speed: 28,
      bounciness: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...props}
      style={[style as object, { transform: [{ scale }] }]}
      onPressIn={(event) => {
        animateScale(0.985);
        props.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateScale(1);
        props.onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}

function ScreenTransition({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: reduceMotion ? 0 : 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: reduceMotion ? 0 : 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, reduceMotion, translateY]);

  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

function AppLaunchScreen() {
  const wave = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      wave.setValue(0);
      progress.setValue(1);
      return;
    }

    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(wave, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    const progressAnimation = Animated.timing(progress, {
      toValue: 1,
      duration: LAUNCH_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    waveLoop.start();
    progressAnimation.start();

    return () => {
      waveLoop.stop();
      progressAnimation.stop();
    };
  }, [progress, reduceMotion, wave]);

  const handRotate = wave.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-5deg', '6deg', '-5deg'] });
  const handTranslateY = wave.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, -2, 1] });
  const waveOpacity = wave.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.7] });
  const waveScale = wave.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.05] });
  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['4%', '100%'] });

  return (
    <SafeAreaView style={styles.launchScreen}>
      <View style={styles.launchOrbTop} />
      <View style={styles.launchOrbBottom} />
      <View style={styles.launchHeaderBrand}>
        <Image source={require('./assets/logo-numerica.png')} style={styles.launchLogoImage} />
        <Text style={styles.launchBrandText}>NUMÉRICA SOFTWARE</Text>
      </View>
      <View style={styles.launchContent}>
        <View style={styles.launchRobotWrap}>
          <Animated.Image
            source={require('./assets/numi-standing.png')}
            style={styles.launchRobotImage}
            resizeMode="contain"
          />
          <Animated.Image
            source={require('./assets/numi-wave-hand.png')}
            style={[styles.launchWaveHandImage, { transform: [{ translateY: handTranslateY }, { rotate: handRotate }] }]}
            resizeMode="contain"
          />
          <Animated.View style={[styles.launchWaveSignal, styles.launchWaveSignalOne, { opacity: waveOpacity, transform: [{ scale: waveScale }] }]} />
          <Animated.View style={[styles.launchWaveSignal, styles.launchWaveSignalTwo, { opacity: waveOpacity, transform: [{ scale: waveScale }] }]} />
          <Animated.Text style={[styles.launchWaveText, { opacity: waveOpacity, transform: [{ scale: waveScale }] }]}>Hola</Animated.Text>
        </View>
        <View style={styles.launchTextBlock}>
          <Text style={styles.launchEyebrow}>Hola, soy Numi</Text>
          <Text style={styles.launchTitle}>Bienvenido</Text>
          <Text style={styles.launchSubtitle}>Preparando tu espacio de facturacion movil</Text>
        </View>
        <View style={styles.launchProgressTrack}>
          <Animated.View style={[styles.launchProgressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.launchStatusText}>Preparando todo...</Text>
        <Text style={styles.launchFooterText}>Seguro  -  Rapido  -  Facil</Text>
      </View>
      <StatusBar style="light" backgroundColor="#07305E" translucent={false} />
    </SafeAreaView>
  );
}
function LoadingScreen() {
  return (
    <SafeAreaView style={styles.loadingScreen}>
      <View style={styles.loadingCard}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingDigits}>= 4 =</Text>
          <Text style={styles.loadingDigitsSmall}>7 · =</Text>
        </View>
        <Text style={styles.loadingTitle}>Validando Credenciales</Text>
        <Text style={styles.loadingSubtitle}>Iniciando entorno seguro de Numérica...</Text>
        <ActivityIndicator color="#6E94B4" style={styles.loadingSpinner} />
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

function ScreenFrame({ children, centered }: { children: React.ReactNode; centered?: boolean }) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0} style={styles.flex}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[styles.canvas, centered && styles.canvasCentered, styles.authScrollContent]}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          <View style={styles.blueGlow} />
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="light" backgroundColor="#07305E" translucent={false} />
    </SafeAreaView>
  );
}

function AuthCard({ children, wide, login }: { children: React.ReactNode; wide?: boolean; login?: boolean }) {
  return <ScreenTransition><View style={[styles.card, login && styles.loginCard, wide && styles.cardWide]}>{children}</View></ScreenTransition>;
}

function BrandMark() {
  return (
    <View style={styles.logoBadge}>
      <Image source={require('./assets/logo-numerica.png')} style={styles.logoImage} />
    </View>
  );
}

function BrandLockup() {
  return (
    <View style={styles.brandLockup}>
      <BrandMark />
      <Text style={styles.brandText}>Numérica{'\n'}software</Text>
    </View>
  );
}

function BiometricSetupModal({ label, onChoose }: { label: string; onChoose: (enable: boolean) => void }) {
  return (
    <Modal transparent animationType="fade" statusBarTranslucent>
      <View style={styles.biometricModalBackdrop}>
        <View style={styles.biometricModalCard}>
          <View style={styles.biometricModalIcon}><Text style={styles.biometricModalGlyph}>⌁</Text></View>
          <Text style={styles.biometricModalTitle}>Acceso más rápido y seguro</Text>
          <Text style={styles.biometricModalText}>Activa {label} para entrar a e-fact sin escribir tu contraseña la próxima vez.</Text>
          <PrimaryButton label={`Activar ${label}`} loading={false} onPress={() => onChoose(true)} />
          <Pressable style={styles.biometricLaterButton} onPress={() => onChoose(false)}><Text style={styles.biometricLaterText}>Más tarde</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pdfPositionCard: { backgroundColor: '#F7FBF9', borderColor: ERUBRICA_COLORS.border, borderRadius: 14, borderWidth: 1, gap: 12, marginTop: 4, padding: 12 },
  pdfPositionHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  pdfPositionCopy: { flex: 1, gap: 3 },
  pdfPositionBadge: { alignItems: 'center', backgroundColor: ERUBRICA_COLORS.light, borderRadius: 8, flexDirection: 'row', gap: 4, paddingHorizontal: 8, paddingVertical: 6 },
  pdfPositionBadgeText: { color: ERUBRICA_COLORS.primary, fontSize: 9, fontWeight: '900' },
  pdfPageToolbar: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  pdfPageLabel: { color: '#607887', fontSize: 11, fontWeight: '800', marginRight: 2 },
  pdfPageButton: { alignItems: 'center', backgroundColor: ERUBRICA_COLORS.light, borderRadius: 8, height: 30, justifyContent: 'center', width: 30 },
  pdfPageButtonDisabled: { backgroundColor: '#EDF1EF' },
  pdfPageNumber: { color: ERUBRICA_COLORS.text, fontSize: 13, fontWeight: '900', minWidth: 18, textAlign: 'center' },
  pdfPageStage: { alignItems: 'center', backgroundColor: '#E7EFEA', borderRadius: 10, minHeight: 370, padding: 10 },
  pdfPage: { backgroundColor: '#FFFFFF', borderColor: '#D7E1DC', borderRadius: 2, borderWidth: 1, elevation: 2, overflow: 'hidden', padding: 18, shadowColor: '#789184', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.16, shadowRadius: 4 },
  pdfPageBrandLine: { backgroundColor: ERUBRICA_COLORS.primary, height: 10, marginBottom: 20, width: '34%' },
  pdfPageTitleLine: { backgroundColor: '#294638', height: 8, marginBottom: 8, width: '67%' },
  pdfPageSubtitleLine: { backgroundColor: '#C7D5CD', height: 5, marginBottom: 22, width: '46%' },
  pdfPageTable: { borderColor: '#E0E8E3', borderTopWidth: 1, gap: 13, paddingTop: 14 },
  pdfPageTextLine: { backgroundColor: '#D9E3DE', height: 5, width: '82%' },
  pdfPageTextLineShort: { width: '52%' },
  pdfPageFooterLine: { backgroundColor: '#D9E3DE', bottom: 20, height: 5, left: 18, position: 'absolute', width: '38%' },
  pdfSignatureMarker: { alignItems: 'center', backgroundColor: '#E7F8EE', borderColor: ERUBRICA_COLORS.primary, borderRadius: 7, borderStyle: 'dashed', borderWidth: 2, justifyContent: 'center', position: 'absolute' },
  pdfSignatureMarkerText: { color: ERUBRICA_COLORS.primary, fontSize: 9, fontWeight: '900', marginTop: 2 },
  pdfPositionInfo: { alignItems: 'center', backgroundColor: ERUBRICA_COLORS.light, borderRadius: 8, flexDirection: 'row', gap: 7, paddingHorizontal: 10, paddingVertical: 8 },
  pdfPositionInfoText: { color: ERUBRICA_COLORS.text, flex: 1, fontSize: 11, fontWeight: '800' },
  launchScreen: {
    alignItems: 'center',
    backgroundColor: '#020C22',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  launchOrbTop: {
    backgroundColor: '#123D7A',
    borderRadius: 999,
    height: 280,
    left: -165,
    opacity: 0.44,
    position: 'absolute',
    top: -120,
    width: 280,
  },
  launchOrbBottom: {
    backgroundColor: '#1A64BE',
    borderRadius: 999,
    bottom: -130,
    height: 250,
    opacity: 0.3,
    position: 'absolute',
    right: -140,
    width: 250,
  },
  launchHeaderBrand: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  launchBrandText: {
    color: '#F5FAFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 7,
  },
  launchContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 36,
    width: '100%',
  },
  launchRobotWrap: {
    alignItems: 'center',
    height: 285,
    justifyContent: 'center',
    marginBottom: 18,
    width: 300,
  },
  launchRobotImage: {
    height: 285,
    width: 230,
    zIndex: 2,
  },
  launchWaveHandImage: {
    height: 82,
    position: 'absolute',
    right: 61,
    top: 88,
    width: 82,
    zIndex: 1,
  },
  launchWaveSignal: {
    borderColor: '#56D9FF',
    borderRadius: 999,
    borderRightWidth: 2,
    borderTopWidth: 2,
    position: 'absolute',
    zIndex: 3,
  },
  launchWaveSignalOne: {
    height: 24,
    right: 32,
    top: 100,
    width: 24,
  },
  launchWaveSignalTwo: {
    height: 38,
    right: 16,
    top: 86,
    width: 38,
  },
  launchWaveText: {
    color: '#78E6FF',
    fontSize: 12,
    fontWeight: '900',
    position: 'absolute',
    right: 20,
    top: 68,
    zIndex: 3,
  },
  launchTextBlock: {
    alignItems: 'center',
    marginBottom: 26,
  },
  launchLogoImage: {
    height: 70,
    width: 70,
  },
  launchEyebrow: {
    color: '#58CFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 6,
  },
  launchTitle: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
    textAlign: 'center',
  },
  launchSubtitle: {
    color: '#B9D5F4',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  launchProgressTrack: {
    backgroundColor: 'rgba(14, 69, 125, 0.48)',
    borderColor: '#3FD7FF',
    borderRadius: 999,
    borderWidth: 1,
    height: 18,
    maxWidth: 330,
    overflow: 'hidden',
    padding: 2,
    width: '100%',
  },
  launchProgressFill: {
    backgroundColor: '#19D9FF',
    borderRadius: 999,
    height: '100%',
    shadowColor: '#1EF1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  launchStatusText: {
    color: '#A8C8EC',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 18,
  },
  launchFooterText: {
    color: '#7696C4',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 34,
  },  safeArea: {
    flex: 1,
    backgroundColor: '#07305E',
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: '#8FB3CE',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(244, 250, 255, 0.92)',
    borderColor: 'rgba(255,255,255,0.65)',
    borderRadius: 22,
    borderWidth: 1,
    maxWidth: 430,
    paddingHorizontal: 30,
    paddingVertical: 34,
    shadowColor: '#335D7B',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.24,
    shadowRadius: 26,
    width: '100%',
    elevation: 8,
  },
  loadingIcon: {
    alignItems: 'center',
    borderColor: '#8DB0CB',
    borderRadius: 999,
    borderWidth: 3,
    height: 78,
    justifyContent: 'center',
    marginBottom: 20,
    width: 78,
  },
  loadingDigits: {
    color: '#7B9FBC',
    fontSize: 18,
    fontWeight: '900',
  },
  loadingDigitsSmall: {
    color: '#7B9FBC',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 3,
  },
  loadingTitle: {
    color: '#617C95',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
  },
  loadingSubtitle: {
    color: '#68839B',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 10,
    textAlign: 'center',
  },
  loadingSpinner: {
    marginTop: 18,
  },
  flex: {
    flex: 1,
  },
  canvas: {
    flexGrow: 1,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  canvasCentered: {
    justifyContent: 'center',
  },
  authScrollContent: {
    paddingBottom: 72,
  },
  blueGlow: {
    backgroundColor: '#0E7FBE',
    borderRadius: 999,
    height: 420,
    opacity: 0.28,
    position: 'absolute',
    right: -190,
    top: -120,
    width: 420,
  },
  card: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    maxWidth: 540,
    padding: 24,
    shadowColor: '#001B35',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    width: '100%',
    elevation: 8,
  },
  loginCard: {
    borderRadius: 28,
    maxWidth: 430,
    paddingHorizontal: 28,
    paddingVertical: 30,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  cardWide: {
    marginVertical: 8,
  },
  logoBadge: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 14,
    height: 58,
    justifyContent: 'center',
    marginBottom: 14,
    width: 58,
  },
  logoImage: {
    height: 54,
    width: 54,
  },
  loginBrand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 26,
  },
  loginProductName: {
    color: '#173E61',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 27,
  },
  loginProductCaption: {
    color: '#7890A4',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  brandLockup: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  brandText: {
    color: '#263A4F',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 20,
  },
  title: {
    color: '#20252B',
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 31,
    textAlign: 'center',
  },
  subtitle: {
    color: '#7D8792',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'center',
  },
  loginTitle: {
    fontSize: 27,
    letterSpacing: -0.4,
  },
  loginSubtitle: {
    marginTop: 7,
  },
  loginActionTiles: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
  },
  loginActionTile: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E2EB',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 96,
    paddingHorizontal: 5,
    paddingVertical: 12,
  },
  loginActionTileActive: {
    backgroundColor: '#F0F8FD',
    borderColor: '#0072BD',
    shadowColor: '#0072BD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  loginActionLabel: {
    color: '#526577',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
    textAlign: 'center',
  },
  loginActionLabelActive: {
    color: '#005A91',
  },
  externalLink: {
    alignSelf: 'center',
    marginTop: 22,
  },
  externalLinkText: {
    color: '#0072BD',
    fontSize: 13,
    fontWeight: '900',
  },
  form: {
    gap: 14,
    marginTop: 22,
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#34465B',
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#F4F8FC',
    borderColor: '#E0E9F2',
    borderRadius: 12,
    borderWidth: 1,
    color: '#24384C',
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  inputShell: {
    position: 'relative',
  },
  inputWithAction: {
    paddingRight: 50,
  },
  passwordToggle: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 9,
    top: 8,
    width: 36,
  },
  searchCard: {
    backgroundColor: '#F8FBFE',
    borderColor: '#CFE2F0',
    borderRadius: 18,
    borderWidth: 1,
    gap: 11,
    padding: 14,
    shadowColor: '#002C50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  searchHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  searchTitleBlock: {
    flex: 1,
    gap: 2,
  },
  searchEyebrow: {
    color: '#0072BD',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  searchTitle: {
    color: '#263A4F',
    fontSize: 15,
    fontWeight: '900',
  },
  searchCountBadge: {
    alignItems: 'center',
    backgroundColor: '#E4F3FC',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 11,
  },
  searchCountText: {
    color: '#00649D',
    fontSize: 11,
    fontWeight: '900',
  },
  searchInputShell: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#B9D8EE',
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    minHeight: 54,
    overflow: 'hidden',
    paddingLeft: 13,
  },
  searchIcon: {
    color: '#0072BD',
    fontSize: 23,
    fontWeight: '900',
    marginRight: 8,
  },
  searchInput: {
    color: '#24384C',
    flex: 1,
    fontSize: 15,
    minHeight: 52,
    paddingVertical: 0,
  },
  searchClearButton: {
    alignItems: 'center',
    backgroundColor: '#EAF2F8',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    marginHorizontal: 9,
    width: 32,
  },
  searchClearText: {
    color: '#536476',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  searchSubmitButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#00649D',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  searchSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  searchHelper: {
    color: '#687A8C',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  checkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    minHeight: 36,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CAD4DE',
    borderRadius: 5,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: '#0076BC',
    borderColor: '#0076BC',
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
    textAlign: 'center',
  },
  rememberText: {
    color: '#526577',
    fontSize: 13,
    fontWeight: '700',
  },
  mutedText: {
    color: '#7B8793',
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    color: '#006DFF',
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#00649D',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 54,
    shadowColor: '#00649D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 4,
    paddingHorizontal: 18,
  },
  disabledButton: {
    opacity: 0.72,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  biometricButton: {
    alignItems: 'center',
    backgroundColor: '#F2F9FD',
    borderColor: '#B8DCEF',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 52,
  },
  biometricButtonText: {
    color: '#00649D',
    fontSize: 14,
    fontWeight: '900',
  },
  biometricModalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(3, 24, 48, 0.62)',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  biometricModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    gap: 14,
    maxWidth: 420,
    padding: 26,
    width: '100%',
  },
  biometricModalIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E7F5FC',
    borderRadius: 999,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  biometricModalGlyph: {
    color: '#00649D',
    fontSize: 40,
    fontWeight: '900',
  },
  biometricModalTitle: {
    color: '#20374B',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  biometricModalText: {
    color: '#64788A',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  biometricLaterButton: {
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  biometricLaterText: {
    color: '#64788A',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F1F8FE',
    borderColor: '#A9CFEA',
    borderRadius: 7,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#0072BD',
    fontSize: 15,
    fontWeight: '600',
  },
  inlineSwitch: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  section: {
    borderColor: '#E4ECF3',
    borderRadius: 17,
    borderWidth: 1,
    gap: 14,
    marginTop: 18,
    padding: 16,
  },
  stepper: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  registerProgress: {
    gap: 8,
    marginTop: 20,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
    width: 72,
  },
  stepLabel: {
    color: '#8191A0',
    fontSize: 11,
    fontWeight: '800',
  },
  stepLabelActive: {
    color: '#00649D',
  },
  stepProgressTrack: {
    backgroundColor: '#E7EFF5',
    borderRadius: 4,
    height: 5,
    marginHorizontal: 36,
    overflow: 'hidden',
  },
  stepProgressFill: {
    backgroundColor: '#0072BD',
    borderRadius: 4,
    height: '100%',
  },
  stepProgressCaption: {
    color: '#72879A',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  stepDot: {
    alignItems: 'center',
    backgroundColor: '#EEF4F9',
    borderColor: '#DCE8F1',
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  stepDotActive: {
    backgroundColor: '#0072BD',
    borderColor: '#0072BD',
  },
  stepDotText: {
    color: '#6B7C8D',
    fontSize: 13,
    fontWeight: '900',
  },
  stepDotTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    color: '#34465B',
    fontSize: 13,
    fontWeight: '900',
  },
  sectionHint: {
    color: '#718497',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  fieldGroupHint: {
    color: '#536C80',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  documentOptions: {
    gap: 10,
  },
  documentOptionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  passwordHint: {
    color: '#718497',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: -5,
  },
  recoveryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  recoveryIcon: {
    alignItems: 'center',
    backgroundColor: '#EAF5FC',
    borderColor: '#B9D8EE',
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  recoveryHeaderCopy: {
    flex: 1,
    gap: 3,
  },
  recoveryEyebrow: {
    color: '#0072BD',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  recoveryInfoCard: {
    alignItems: 'flex-start',
    backgroundColor: '#F3F8FC',
    borderColor: '#D5E5F0',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
    padding: 12,
  },
  recoveryInfoText: {
    color: '#536C80',
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  changeSecurityCard: {
    alignItems: 'center',
    backgroundColor: '#F3F8FC',
    borderColor: '#D5E5F0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 11,
    marginTop: 16,
    padding: 13,
  },
  changeSecurityIcon: {
    alignItems: 'center',
    backgroundColor: '#EAF5FC',
    borderColor: '#B9D8EE',
    borderRadius: 20,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  changeSecurityCopy: {
    flex: 1,
    gap: 3,
  },
  changeSecurityTitle: {
    color: '#34465B',
    fontSize: 12,
    fontWeight: '900',
  },
  changeSecurityText: {
    color: '#536C80',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  changeFieldsCard: {
    backgroundColor: '#F8FBFE',
    borderColor: '#DCE8F1',
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  changeFieldsEyebrow: {
    color: '#0072BD',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  changeFieldsHint: {
    color: '#718497',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: -9,
  },
  changePasswordHint: {
    color: '#718497',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: -5,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    alignItems: 'center',
    backgroundColor: '#F6F9FC',
    borderColor: '#E1EAF2',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#EAF5FC',
    borderColor: '#0A75B6',
  },
  segmentText: {
    color: '#536476',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  segmentTextActive: {
    color: '#00649D',
  },
  avatarPreview: {
    alignItems: 'center',
    backgroundColor: '#EEF6FF',
    borderColor: '#DDEAF5',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  avatarInfo: {
    flex: 1,
  },
  avatarTile: {
    alignItems: 'center',
    backgroundColor: '#21BF73',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarQuestion: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  avatarTileImage: {
    borderRadius: 12,
    height: 56,
    width: 56,
  },
  avatarTitle: {
    color: '#34465B',
    fontSize: 14,
    fontWeight: '900',
  },
  avatarTapHint: {
    color: '#0072BD',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
  },
  avatarStrip: {
    gap: 9,
    paddingVertical: 4,
  },
  avatarChoice: {
    alignItems: 'center',
    backgroundColor: '#F7FAFD',
    borderColor: '#DCE8F1',
    borderRadius: 14,
    borderWidth: 1,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  avatarChoiceActive: {
    borderColor: '#0072BD',
    borderWidth: 2,
  },
  avatarChoiceImage: {
    borderRadius: 11,
    height: 42,
    width: 42,
  },
  avatarGalleryButton: {
    alignItems: 'center',
    backgroundColor: '#F3F8FC',
    borderColor: '#B9D8EE',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 12,
  },
  avatarGalleryButtonCopy: {
    flex: 1,
    gap: 2,
  },
  avatarGalleryButtonTitle: {
    color: '#00649D',
    fontSize: 13,
    fontWeight: '900',
  },
  avatarGalleryButtonText: {
    color: '#718497',
    fontSize: 11,
    fontWeight: '700',
  },
  avatarGalleryButtonArrow: {
    color: '#0072BD',
    fontSize: 26,
    fontWeight: '400',
  },
  avatarModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  avatarModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 24, 48, 0.54)',
  },
  avatarModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    gap: 8,
    maxHeight: '82%',
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  avatarModalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avatarModalEyebrow: {
    color: '#0072BD',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  avatarModalTitle: {
    color: '#263A4F',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 3,
  },
  avatarModalClose: {
    alignItems: 'center',
    backgroundColor: '#EEF5F9',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  avatarModalCloseText: {
    color: '#38566D',
    fontSize: 23,
    lineHeight: 25,
  },
  avatarModalHint: {
    color: '#718497',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  avatarCategoryTabs: {
    gap: 8,
    paddingBottom: 4,
  },
  avatarCategoryTab: {
    alignItems: 'center',
    backgroundColor: '#F3F7FA',
    borderColor: '#DCE8F1',
    borderRadius: 999,
    borderWidth: 1,
    flexShrink: 0,
    height: 42,
    justifyContent: 'center',
    minWidth: 78,
    paddingHorizontal: 13,
  },
  avatarCategoryTabActive: {
    backgroundColor: '#0072BD',
    borderColor: '#0072BD',
  },
  avatarCategoryText: {
    color: '#62798B',
    fontSize: 11,
    fontWeight: '900',
    includeFontPadding: false,
    lineHeight: 16,
  },
  avatarCategoryTextActive: {
    color: '#FFFFFF',
  },
  avatarGalleryGrid: {
    columnGap: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingBottom: 28,
    paddingTop: 6,
  },
  avatarGalleryScroll: {
    flexGrow: 0,
    maxHeight: 450,
  },
  avatarGalleryItem: {
    alignItems: 'center',
    backgroundColor: '#F7FAFD',
    borderColor: '#DCE8F1',
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    flexGrow: 0,
    flexShrink: 0,
    height: 116,
    marginBottom: 12,
    padding: 9,
    width: '30%',
  },
  avatarGalleryImage: {
    borderRadius: 14,
    height: 62,
    width: 62,
  },
  avatarGalleryLabel: {
    color: '#536C80',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  initialsAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initialsAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  registerActions: {
    gap: 10,
    marginTop: 16,
  },
  message: {
    borderRadius: 14,
    marginTop: 16,
    padding: 14,
  },
  message_success: {
    backgroundColor: '#E8F7EF',
  },
  message_error: {
    backgroundColor: '#FDEBEC',
  },
  message_info: {
    backgroundColor: '#EAF4FE',
  },
  messageText: {
    color: '#244153',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  securityNotice: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 18,
    padding: 0,
  },
  securityIcon: {
    color: '#18B889',
    fontSize: 14,
    fontWeight: '900',
  },
  securityText: {
    color: '#5C6D80',
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  workspaceSafeArea: {
    backgroundColor: EFACT_THEME.colors.primaryDark,
    flex: 1,
  },
  portalSafeArea: {
    backgroundColor: EFACT_THEME.colors.primaryDark,
  },
  workspaceCanvas: {
    flexGrow: 1,
    padding: 12,
    paddingBottom: 22,
  },
  workspaceCanvasWithBottomNav: {
    paddingBottom: 86,
  },
  workspaceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  workspaceHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  workspaceBrand: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  workspaceBrandText: {
    flex: 1,
  },
  workspaceTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  workspaceSubtitle: {
    color: '#B8D6EC',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  dashboardHeader: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.primaryDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 12,
  },
  dashboardBrandBlock: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  dashboardBrandText: {
    flex: 1,
    minWidth: 0,
  },
  dashboardBrandTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25,
  },
  dashboardBrandName: {
    color: '#B8D6EC',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  dashboardHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  dashboardIconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: EFACT_THEME.radius.button,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  dashboardBellDome: {
    borderColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 3,
    height: 22,
    width: 20,
  },
  dashboardBellBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 3,
    marginTop: -4,
    width: 25,
  },
  dashboardBellClapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 5,
    marginTop: 2,
    width: 5,
  },
  dashboardNotificationDot: {
    backgroundColor: '#21BF73',
    borderColor: EFACT_THEME.colors.primaryDark,
    borderWidth: 1,
    borderRadius: 999,
    height: 9,
    position: 'absolute',
    right: 12,
    top: 12,
    width: 9,
  },
  dashboardMenuGlyph: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
  },
  portalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  portalUserBlock: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 14,
    minWidth: 0,
  },
  portalUserText: {
    flex: 1,
    minWidth: 0,
  },
  portalGreeting: {
    color: '#08235E',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  portalGreetingName: {
    color: '#2867FF',
  },
  portalSubtitle: {
    color: '#52658F',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  portalHeaderAvatarImage: {
    borderColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 2,
    height: 54,
    shadowColor: EFACT_THEME.shadow.color,
    shadowOffset: EFACT_THEME.shadow.offset,
    shadowOpacity: 0.12,
    shadowRadius: EFACT_THEME.shadow.radius,
    width: 54,
    elevation: 3,
  },
  portalHeaderLogo: {
    height: 58,
    width: 58,
  },
  portalHeaderAvatarFallback: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.primary,
    borderColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 2,
    height: 54,
    justifyContent: 'center',
    shadowColor: EFACT_THEME.shadow.color,
    shadowOffset: EFACT_THEME.shadow.offset,
    shadowOpacity: 0.12,
    shadowRadius: EFACT_THEME.shadow.radius,
    width: 54,
    elevation: 3,
  },
  portalHeaderAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  portalNotificationButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#EEF3FF',
    borderRadius: 17,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    shadowColor: '#B8C7E6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    width: 64,
    elevation: 8,
  },
  portalBellShape: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  portalBellDome: {
    borderColor: '#43527C',
    borderRadius: 12,
    borderWidth: 3,
    height: 22,
    width: 20,
  },
  portalBellBase: {
    backgroundColor: '#43527C',
    borderRadius: 999,
    height: 3,
    marginTop: -4,
    width: 25,
  },
  portalBellClapper: {
    backgroundColor: '#43527C',
    borderRadius: 999,
    height: 5,
    marginTop: 2,
    width: 5,
  },
  portalNotificationDot: {
    backgroundColor: '#FF4B3E',
    borderRadius: 999,
    height: 11,
    position: 'absolute',
    right: 13,
    top: 14,
    width: 11,
  },
  menuButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    position: 'relative',
    width: 42,
  },
  menuButtonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 14,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  menuOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  menuBackdrop: {
    backgroundColor: 'rgba(4, 24, 44, 0.5)',
    flex: 1,
  },
  menuBackdropWrap: {
    flex: 1,
  },
  menuDrawer: {
    backgroundColor: EFACT_THEME.colors.surface,
    height: '100%',
    maxWidth: 330,
    padding: 0,
    shadowColor: '#001B35',
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    width: '82%',
    elevation: 10,
  },
  menuHeader: {
    alignItems: 'flex-start',
    backgroundColor: EFACT_THEME.colors.primaryDark,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 18,
    paddingTop: 48,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  menuSubtitle: {
    color: '#B8D6EC',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  menuCloseButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  menuCloseText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },
  menuList: {
    gap: 8,
    padding: 14,
    paddingBottom: 16,
  },
  menuSection: {
    gap: 6,
  },
  menuChildren: {
    borderLeftColor: EFACT_THEME.colors.border,
    borderLeftWidth: 1,
    gap: 6,
    marginLeft: 14,
    paddingLeft: 10,
  },
  menuItem: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.surfaceSoft,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  menuItemInset: {
    backgroundColor: '#FFFFFF',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  menuItemActive: {
    backgroundColor: EFACT_THEME.colors.primary,
    borderColor: EFACT_THEME.colors.primary,
  },
  menuItemDisabled: {
    opacity: 0.52,
  },
  menuItemText: {
    color: EFACT_THEME.colors.textSecondary,
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  menuItemTextActive: {
    color: '#FFFFFF',
  },
  menuItemCount: {
    backgroundColor: EFACT_THEME.colors.primaryLight,
    borderRadius: 999,
    color: EFACT_THEME.colors.primary,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 10,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  menuItemCountActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    color: '#FFFFFF',
  },
  menuItemChevron: {
    color: EFACT_THEME.colors.textMuted,
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 8,
  },
  menuItemChevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  menuLogoutButton: {
    alignItems: 'center',
    backgroundColor: '#FDEBEC',
    borderRadius: 12,
    justifyContent: 'center',
    marginHorizontal: 14,
    marginTop: 4,
    minHeight: 48,
  },
  menuLogoutText: {
    color: '#B4232D',
    fontSize: 14,
    fontWeight: '900',
  },
  dashboardStack: {
    gap: 16,
  },
  dashboardHome: {
    backgroundColor: EFACT_THEME.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: EFACT_THEME.spacing.lg,
    marginHorizontal: 0,
    marginTop: 2,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  dashboardIntro: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: EFACT_THEME.spacing.md,
    justifyContent: 'space-between',
  },
  dashboardIntroText: {
    flex: 1,
    minWidth: 0,
  },
  dashboardEyebrow: {
    color: EFACT_THEME.colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  dashboardGreeting: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: 3,
  },
  dashboardIntroCopy: {
    color: EFACT_THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 4,
  },
  dashboardSmallIconButton: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: EFACT_THEME.radius.button,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  dashboardSummaryPanel: {
    backgroundColor: EFACT_THEME.colors.primaryDark,
    borderRadius: EFACT_THEME.radius.card,
    gap: EFACT_THEME.spacing.md,
    padding: EFACT_THEME.spacing.lg,
    shadowColor: EFACT_THEME.shadow.color,
    shadowOffset: EFACT_THEME.shadow.offset,
    shadowOpacity: 0.14,
    shadowRadius: EFACT_THEME.shadow.radius,
    elevation: 4,
  },
  dashboardSummaryHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: EFACT_THEME.spacing.md,
    justifyContent: 'space-between',
  },
  dashboardPanelLabel: {
    color: '#B8D6EC',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  dashboardSummaryTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 2,
  },
  dashboardMoneyValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  dashboardSummaryDivider: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    height: 1,
  },
  dashboardSummaryStats: {
    flexDirection: 'row',
    gap: EFACT_THEME.spacing.sm,
    justifyContent: 'space-between',
  },
  dashboardMetric: {
    flex: 1,
    minWidth: 0,
  },
  dashboardMetricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  dashboardMetricLabel: {
    color: '#B8D6EC',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  dashboardHero: {
    backgroundColor: '#062A92',
    borderColor: '#243BEF',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 178,
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#2542C8',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 24,
    elevation: 10,
  },
  dashboardHeroCompact: {
    minHeight: 0,
  },
  dashboardHeroCopy: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  dashboardHeroTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 29,
  },
  dashboardHeroName: {
    color: '#1FB6FF',
  },
  dashboardHeroSubtitle: {
    color: '#D7E6FF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 10,
  },
  dashboardHeroRule: {
    backgroundColor: '#28C9FF',
    borderRadius: 999,
    height: 3,
    marginTop: 16,
    width: 58,
  },
  dashboardHeroText: {
    color: '#D7E6FF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 16,
  },
  dashboardFavoritesBlock: {
    gap: 10,
  },
  dashboardFavoritesHint: {
    color: EFACT_THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  dashboardFavoritesRow: {
    gap: 10,
    paddingRight: 12,
  },
  dashboardFavorite: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    minHeight: 64,
    paddingHorizontal: 11,
    width: 164,
  },
  dashboardFavoritePressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  dashboardFavoriteIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  dashboardFavoriteLabel: {
    color: '#122A54',
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
  },
  dashboardFavoriteArrow: {
    fontSize: 22,
    fontWeight: '400',
  },
  dashboardHeroDevice: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    width: 104,
  },
  dashboardHeroPhone: {
    alignItems: 'center',
    backgroundColor: '#07142F',
    borderColor: '#5B7CFF',
    borderRadius: 18,
    borderWidth: 2,
    height: 116,
    justifyContent: 'center',
    paddingTop: 12,
    transform: [{ rotate: '8deg' }],
    width: 66,
  },
  dashboardHeroChartCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    marginTop: -42,
    marginLeft: 34,
    width: 62,
  },
  dashboardHeroChartBars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 5,
    height: 36,
  },
  dashboardHeroChartBar: {
    backgroundColor: '#28C9FF',
    borderRadius: 999,
    width: 9,
  },
  dashboardSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dashboardSectionTitle: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  dashboardPeriodPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  dashboardPeriodText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  dashboardPeriodChevron: {
    color: '#0B255E',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 16,
  },
  dashboardStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  dashboardStatsGridCompact: {
    gap: 8,
  },
  dashboardStatCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EEF3FF',
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    minHeight: 118,
    padding: 11,
    shadowColor: '#B8C7E6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    width: '48%',
    elevation: 6,
  },
  dashboardStatCardCompact: {
    minHeight: 108,
    padding: 10,
    width: '48%',
  },
  dashboardStatIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  dashboardStatIconText: {
    fontSize: 18,
    fontWeight: '900',
  },
  dashboardStatValue: {
    color: '#0B255E',
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 25,
  },
  dashboardStatLabel: {
    color: '#0B255E',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  dashboardStatTrend: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  dashboardInsightRow: {
    gap: 12,
  },
  dashboardActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: EFACT_THEME.spacing.sm,
  },
  dashboardActionRowCompact: {
    flexDirection: 'column',
  },
  dashboardPrimaryAction: {
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: EFACT_THEME.radius.card,
    borderWidth: 1,
    flexBasis: '31%',
    flexGrow: 1,
    gap: 5,
    minHeight: 104,
    padding: EFACT_THEME.spacing.md,
  },
  dashboardPrimaryActionMain: {
    backgroundColor: EFACT_THEME.colors.primary,
    borderColor: EFACT_THEME.colors.primary,
  },
  dashboardPrimaryActionIcon: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.primaryLight,
    borderRadius: 11,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  dashboardPrimaryActionIconMain: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dashboardPrimaryActionLabel: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
  },
  dashboardPrimaryActionLabelMain: {
    color: '#FFFFFF',
  },
  dashboardPrimaryActionText: {
    color: EFACT_THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  dashboardPrimaryActionTextMain: {
    color: '#DDF0FA',
  },
  dashboardChartCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EEF3FF',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#B8C7E6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 7,
  },
  dashboardPanelTitle: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  dashboardChartArea: {
    backgroundColor: '#F3F7FF',
    borderRadius: 14,
    flexDirection: 'row',
    height: 132,
    marginTop: 12,
    overflow: 'hidden',
    paddingHorizontal: 10,
  },
  dashboardChartColumn: {
    borderBottomColor: '#DCE7FB',
    borderBottomWidth: 1,
    flex: 1,
    position: 'relative',
  },
  dashboardChartPoint: {
    backgroundColor: '#176DFF',
    borderColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 2,
    height: 12,
    left: '35%',
    position: 'absolute',
    width: 12,
  },
  dashboardChartBar: {
    alignSelf: 'center',
    backgroundColor: '#BFE6FA',
    borderRadius: 999,
    bottom: 0,
    position: 'absolute',
    width: 10,
  },
  dashboardChartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dashboardChartLabel: {
    color: '#52658F',
    fontSize: 11,
    fontWeight: '800',
  },
  dashboardQuickCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EEF3FF',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 14,
    shadowColor: '#B8C7E6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 7,
  },
  dashboardQuickAction: {
    alignItems: 'center',
    backgroundColor: '#F4F7FF',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 10,
  },
  dashboardQuickIcon: {
    alignItems: 'center',
    borderRadius: 9,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  dashboardQuickIconText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  dashboardQuickLabel: {
    color: '#0B255E',
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  dashboardQuickArrow: {
    color: '#52658F',
    fontSize: 22,
    fontWeight: '900',
  },
  dashboardViewAll: {
    color: EFACT_THEME.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  dashboardModulesGrid: {
    gap: 10,
  },
  dashboardModuleTile: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#EEF3FF',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 88,
    padding: 12,
    width: '100%',
  },
  dashboardModuleIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  dashboardModuleIconText: {
    fontSize: 15,
    fontWeight: '900',
  },
  dashboardModuleCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  dashboardModuleTitle: {
    color: '#0B255E',
    fontSize: 13,
    fontWeight: '900',
  },
  dashboardModuleText: {
    color: '#52658F',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  dashboardModuleProgress: {
    borderRadius: 999,
    height: 3,
    marginTop: 3,
    width: 24,
  },
  dashboardModuleArrow: {
    color: '#52658F',
    fontSize: 20,
    fontWeight: '900',
  },
  dashboardActivityCard: {
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  dashboardActivityPanel: {
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: EFACT_THEME.radius.card,
    borderWidth: 1,
    gap: EFACT_THEME.spacing.md,
    padding: EFACT_THEME.spacing.lg,
  },
  dashboardActivityItem: {
    alignItems: 'center',
    borderTopColor: EFACT_THEME.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
  },
  dashboardActivityIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  dashboardActivityIconText: {
    fontSize: 16,
    fontWeight: '900',
  },
  dashboardActivityCopy: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
  },
  dashboardActivityTitle: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  dashboardActivityText: {
    color: EFACT_THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  dashboardActivityAmount: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    minWidth: 72,
    textAlign: 'right',
  },
  dashboardActivityStatus: {
    backgroundColor: '#E8F7EF',
    borderRadius: 999,
    color: EFACT_THEME.colors.success,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dashboardServiceList: {
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: EFACT_THEME.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dashboardServiceRow: {
    alignItems: 'center',
    borderBottomColor: EFACT_THEME.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: EFACT_THEME.spacing.md,
    minHeight: 72,
    paddingHorizontal: EFACT_THEME.spacing.md,
    paddingVertical: EFACT_THEME.spacing.sm,
  },
  dashboardServiceIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  dashboardServiceCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  dashboardServiceTitle: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  dashboardServiceText: {
    color: EFACT_THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  portalStack: {
    backgroundColor: EFACT_THEME.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: EFACT_THEME.spacing.lg,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  portalShowcase: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: EFACT_THEME.colors.border,
    borderRadius: EFACT_THEME.radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  portalShowcaseIcon: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.primaryDark,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  portalShowcaseCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  portalShowcaseTitle: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  portalShowcaseText: {
    color: EFACT_THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  portalHeroPanel: {
    backgroundColor: EFACT_THEME.colors.primaryDark,
    borderRadius: EFACT_THEME.radius.card,
    flexDirection: 'row',
    gap: EFACT_THEME.spacing.md,
    minHeight: 132,
    overflow: 'hidden',
    padding: EFACT_THEME.spacing.lg,
    shadowColor: EFACT_THEME.shadow.color,
    shadowOffset: EFACT_THEME.shadow.offset,
    shadowOpacity: 0.14,
    shadowRadius: EFACT_THEME.shadow.radius,
    elevation: 4,
  },
  portalMetrics: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: EFACT_THEME.radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 78,
    paddingHorizontal: 8,
    shadowColor: EFACT_THEME.shadow.color,
    shadowOffset: EFACT_THEME.shadow.offset,
    shadowOpacity: 0.08,
    shadowRadius: EFACT_THEME.shadow.radius,
    elevation: 2,
  },
  portalMetricItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  portalMetricValue: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  portalMetricLabel: {
    color: EFACT_THEME.colors.textSecondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  portalMetricDivider: {
    backgroundColor: EFACT_THEME.colors.border,
    height: 32,
    width: 1,
  },
  portalHeroCopy: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  portalHeroBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: EFACT_THEME.radius.card,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 76,
    minWidth: 82,
    paddingHorizontal: EFACT_THEME.spacing.md,
  },
  portalHeroBadgeText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 31,
  },
  portalHeroBadgeLabel: {
    color: '#B8D6EC',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  portalHeroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
  },
  portalHeroAccent: {
    color: '#31C9FF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
    marginTop: 2,
  },
  portalHeroText: {
    color: '#DDF0FA',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 8,
  },
  portalHeroDevice: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 112,
  },
  portalPhone: {
    alignItems: 'center',
    backgroundColor: '#081633',
    borderColor: '#4E83FF',
    borderRadius: 20,
    borderWidth: 2,
    height: 134,
    paddingTop: 17,
    transform: [{ rotate: '9deg' }],
    width: 74,
  },
  portalPhoneNotch: {
    backgroundColor: '#020817',
    borderRadius: 999,
    height: 5,
    marginBottom: 20,
    width: 30,
  },
  portalAppGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'center',
    width: 50,
  },
  portalAppTile: {
    borderRadius: 7,
    height: 20,
    width: 20,
  },
  portalAppTileBlue: {
    backgroundColor: '#38BDF8',
  },
  portalAppTilePurple: {
    backgroundColor: '#A855F7',
  },
  portalAppTileGreen: {
    backgroundColor: '#14B8A6',
  },
  portalAppTileOrange: {
    backgroundColor: '#FB923C',
  },
  portalDeviceBase: {
    backgroundColor: '#2258E9',
    borderColor: '#2DE2FF',
    borderRadius: 999,
    borderWidth: 1,
    height: 14,
    marginTop: -5,
    width: 104,
  },
  portalSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  portalSectionTitleWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  portalSectionMark: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    height: 25,
    width: 25,
  },
  portalSectionDot: {
    borderRadius: 4,
    height: 10,
    width: 10,
  },
  portalSectionDotCyan: {
    backgroundColor: '#22D3EE',
  },
  portalSectionDotBlue: {
    backgroundColor: '#3B82F6',
  },
  portalSectionDotPurple: {
    backgroundColor: '#8B5CF6',
  },
  portalSectionDotGreen: {
    backgroundColor: '#2DD4BF',
  },
  portalSectionTitle: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  portalSectionAction: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: EFACT_THEME.radius.button,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  portalSectionActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    height: 26,
    width: 26,
  },
  portalSectionActionDot: {
    borderColor: '#2469FF',
    borderRadius: 4,
    borderWidth: 2,
    height: 11,
    width: 11,
  },
  portalServiceList: {
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: EFACT_THEME.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  portalServiceCard: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.surface,
    borderBottomColor: EFACT_THEME.colors.border,
    borderBottomWidth: 1,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: 0,
    borderWidth: 0,
    flexDirection: 'row',
    gap: EFACT_THEME.spacing.md,
    minHeight: 76,
    padding: EFACT_THEME.spacing.md,
    width: '100%',
  },
  portalServiceCardDisabled: {
    opacity: 1,
  },
  portalServiceIcon: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 0,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  portalServiceCopy: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  portalServiceTitle: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 21,
  },
  portalServiceDescription: {
    color: EFACT_THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  portalServiceActionWrap: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: 6,
    justifyContent: 'center',
    minHeight: 34,
    width: 84,
  },
  portalServicePill: {
    backgroundColor: EFACT_THEME.colors.primaryLight,
    borderRadius: 999,
    borderWidth: 0,
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 7,
    textAlign: 'center',
  },
  portalServiceArrow: {
    display: 'none',
  },
  portalServiceArrowText: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  portalGlyphDocument: {
    borderColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 3,
    height: 38,
    paddingHorizontal: 6,
    paddingTop: 9,
    width: 30,
  },
  portalGlyphDocumentFold: {
    borderBottomColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderRightColor: '#FFFFFF',
    borderRightWidth: 3,
    height: 10,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 10,
  },
  portalGlyphDocumentLine: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 3,
    marginBottom: 5,
    width: 13,
  },
  portalGlyphDocumentMoney: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    position: 'absolute',
    right: 4,
    bottom: 1,
  },
  portalGlyphCalculator: {
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 3,
    gap: 5,
    height: 40,
    padding: 5,
    width: 34,
  },
  portalGlyphCalculatorScreen: {
    borderColor: '#FFFFFF',
    borderRadius: 3,
    borderWidth: 2,
    height: 9,
    width: 20,
  },
  portalGlyphCalculatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    width: 21,
  },
  portalGlyphCalculatorDot: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 5,
    width: 5,
  },
  portalGlyphPencilWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalGlyphPencil: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
  },
  portalGlyphPencilLine: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 3,
    marginTop: -6,
    width: 32,
  },
  portalGlyphBriefcase: {
    alignItems: 'center',
  },
  portalGlyphBriefcaseHandle: {
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderWidth: 3,
    height: 11,
    marginBottom: -2,
    width: 22,
  },
  portalGlyphBriefcaseBody: {
    borderColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 3,
    height: 27,
    width: 38,
  },
  portalBottomNav: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: 24,
    borderWidth: 1,
    bottom: 8,
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'space-between',
    left: 16,
    padding: 7,
    position: 'absolute',
    right: 16,
    shadowColor: EFACT_THEME.shadow.color,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 12,
  },
  portalTabButton: {
    alignItems: 'center',
    borderRadius: 18,
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 60,
  },
  portalTabButtonActive: {
    backgroundColor: EFACT_THEME.colors.primaryLight,
  },
  portalTabIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  portalTabIconBubble: {
    backgroundColor: EFACT_THEME.colors.primary,
  },
  portalTabHomeIcon: {
    alignItems: 'center',
    height: 27,
    justifyContent: 'center',
    width: 27,
  },
  portalTabHomeRoof: {
    backgroundColor: '#9CA3AF',
    borderRadius: 4,
    height: 14,
    transform: [{ rotate: '45deg' }],
    width: 14,
  },
  portalTabHomeBody: {
    backgroundColor: '#9CA3AF',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    height: 14,
    marginTop: -6,
    width: 20,
  },
  portalTabGridIcon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    height: 25,
    width: 25,
  },
  portalTabGridDot: {
    backgroundColor: '#9CA3AF',
    borderRadius: 5,
    height: 11,
    width: 11,
  },
  portalTabDocumentIcon: {
    borderColor: '#9CA3AF',
    borderRadius: 4,
    borderWidth: 2,
    gap: 4,
    height: 25,
    justifyContent: 'center',
    paddingHorizontal: 5,
    width: 22,
  },
  portalTabDocumentIconActive: {
    borderColor: '#0A69FF',
  },
  portalTabDocumentLine: {
    backgroundColor: '#9CA3AF',
    borderRadius: 999,
    height: 2,
    width: 9,
  },
  portalTabProfileIcon: {
    alignItems: 'center',
    borderColor: '#9CA3AF',
    borderRadius: 999,
    borderWidth: 2,
    height: 27,
    justifyContent: 'center',
    width: 27,
  },
  portalTabProfileHead: {
    backgroundColor: '#9CA3AF',
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  portalTabProfileBody: {
    backgroundColor: '#9CA3AF',
    borderRadius: 999,
    height: 6,
    marginTop: 3,
    width: 14,
  },
  portalTabSettingsIcon: {
    color: '#9CA3AF',
    fontSize: 24,
    fontWeight: '900',
  },
  portalTabIconActive: {
    backgroundColor: '#0A69FF',
  },
  portalTabText: {
    color: EFACT_THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  portalTabTextActive: {
    color: EFACT_THEME.colors.primary,
  },
  notificationsOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  notificationsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 24, 44, 0.58)',
  },
  notificationsPanel: {
    backgroundColor: '#071433',
    borderColor: '#244184',
    borderRadius: 22,
    borderWidth: 1,
    gap: 16,
    maxHeight: '84%',
    maxWidth: 430,
    padding: 18,
    width: '100%',
  },
  notificationsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  notificationsTitle: {
    color: '#FFFFFF',
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  notificationsSubtitle: {
    color: '#AEB9CE',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  notificationsList: {
    gap: 10,
    paddingBottom: 4,
  },
  notificationItem: {
    alignItems: 'flex-start',
    backgroundColor: '#0A1F49',
    borderColor: '#1B3470',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  notificationItemDanger: {
    backgroundColor: '#3A1117',
    borderColor: '#B4232D',
  },
  notificationItemWarning: {
    backgroundColor: '#3A2A07',
    borderColor: '#F0B429',
  },
  notificationItemSuccess: {
    backgroundColor: '#07351F',
    borderColor: '#21BF73',
  },
  notificationItemInfo: {
    backgroundColor: '#0A1F49',
    borderColor: '#1B6FB8',
  },
  notificationItemRead: {
    opacity: 0.72,
  },
  notificationBullet: {
    backgroundColor: '#2DE2FF',
    borderRadius: 999,
    height: 9,
    marginTop: 4,
    width: 9,
  },
  notificationBulletDanger: {
    backgroundColor: '#FF6B73',
  },
  notificationBulletWarning: {
    backgroundColor: '#FFD166',
  },
  notificationBulletSuccess: {
    backgroundColor: '#42D392',
  },
  notificationBulletInfo: {
    backgroundColor: '#2DE2FF',
  },
  notificationCopy: {
    flex: 1,
    gap: 3,
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  notificationText: {
    color: '#D8E7F6',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  notificationMeta: {
    color: '#8EA3C7',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  notificationsLoading: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 22,
  },
  notificationEmpty: {
    backgroundColor: '#0A1F49',
    borderColor: '#1B3470',
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  heroPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#001B35',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  heroEyebrow: {
    color: '#0072BD',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#24384C',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: 8,
  },
  heroText: {
    color: '#667789',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 8,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flex: 1,
    padding: 16,
  },
  metricValue: {
    color: '#083A63',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  metricLabel: {
    color: '#708194',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  workspaceSectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  moduleGrid: {
    gap: 10,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE8F1',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 15,
  },
  moduleCardDisabled: {
    opacity: 0.68,
  },
  moduleTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  moduleTitle: {
    color: '#263A4F',
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  moduleCount: {
    backgroundColor: '#EAF5FC',
    borderRadius: 999,
    color: '#00649D',
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  moduleDescription: {
    color: '#6F7F90',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  moduleAction: {
    color: '#0072BD',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  adminHeroCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE8F1',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  rechargePage: {
    gap: 16,
  },
  rechargeHero: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CFE2F1',
    borderRadius: 18,
    borderWidth: 1,
    gap: 18,
    padding: 18,
  },
  rechargeHeroCopy: {
    gap: 7,
  },
  rechargeEyebrow: {
    color: '#0072BD',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  rechargeTitle: {
    color: '#173E61',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  rechargeText: {
    color: '#8A9CAF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  rechargeInputs: {
    gap: 7,
  },
  rechargeHint: {
    color: '#91A2B2',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  rechargeSectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rechargeSectionTitle: {
    color: '#173E61',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 5,
  },
  rechargeVatHint: {
    color: '#91A2B2',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 3,
    textAlign: 'right',
  },
  rechargePlanGrid: {
    gap: 10,
  },
  rechargePlan: {
    borderColor: '#CFE2F1',
    borderRadius: 16,
    borderWidth: 1,
    gap: 7,
    padding: 16,
  },
  rechargePlanSelected: {
    borderColor: '#0072BD',
    borderWidth: 2,
  },
  rechargePlanBadge: {
    alignSelf: 'flex-end',
    backgroundColor: '#EAF5FC',
    borderRadius: 999,
    color: '#0072BD',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rechargePlanDocuments: {
    color: '#173E61',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  rechargePlanUnit: {
    color: '#71879B',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  rechargePlanAmount: {
    color: '#0870BE',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  rechargePlanCaption: {
    color: '#8197AA',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    minHeight: 35,
    textAlign: 'center',
  },
  rechargeSummary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE8F1',
    borderRadius: 18,
    borderWidth: 1,
    gap: 13,
    padding: 18,
  },
  rechargeSummaryTitle: {
    color: '#173E61',
    fontSize: 21,
    fontWeight: '900',
  },
  rechargeSummaryRow: {
    alignItems: 'center',
    borderBottomColor: '#E4ECF3',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  rechargeSummaryLabel: {
    color: '#6A8196',
    fontSize: 13,
    fontWeight: '800',
  },
  rechargeSummaryValue: {
    color: '#0072BD',
    fontSize: 20,
    fontWeight: '900',
  },
  rechargeSummaryTotal: {
    color: '#0072BD',
    fontSize: 24,
    fontWeight: '900',
  },
  rechargeSecure: {
    color: '#7890A4',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 17,
  },
  adminTabs: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE8F1',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 6,
  },
  adminTab: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 14,
  },
  adminTabActive: {
    backgroundColor: '#0072BD',
  },
  adminTabText: {
    color: '#6F7F90',
    fontSize: 13,
    fontWeight: '900',
  },
  adminTabTextActive: {
    color: '#FFFFFF',
  },
  adminSearchHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  adminSearchTitleBlock: {
    flex: 1,
  },
  adminActionPill: {
    backgroundColor: '#0072BD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  adminActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  bottomNav: {
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    maxHeight: 66,
    shadowColor: EFACT_THEME.shadow.color,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomNavContent: {
    gap: 8,
    padding: 6,
  },
  navButton: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minWidth: 82,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  navButtonActive: {
    backgroundColor: '#0072BD',
  },
  navButtonText: {
    color: '#5C6D80',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  navButtonTextActive: {
    color: '#FFFFFF',
  },
  directoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    gap: 15,
    padding: 16,
    shadowColor: '#001B35',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 8,
  },
  viewToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#EAF5FC',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#00649D',
    fontSize: 12,
    fontWeight: '900',
  },
  viewToolbarTitle: {
    color: '#263A4F',
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  directoryTabs: {
    backgroundColor: '#EEF4F9',
    borderRadius: 14,
    flexDirection: 'row',
    padding: 5,
  },
  directoryTab: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  directoryTabActive: {
    backgroundColor: '#0072BD',
  },
  directoryTabText: {
    color: '#536476',
    fontSize: 14,
    fontWeight: '900',
  },
  directoryTabTextActive: {
    color: '#FFFFFF',
  },
  directoryStats: {
    alignItems: 'center',
    backgroundColor: '#F4F8FC',
    borderColor: '#E0E9F2',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  statValue: {
    color: '#083A63',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  statLabel: {
    color: '#718192',
    fontSize: 12,
    fontWeight: '800',
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: '#EAF5FC',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 12,
  },
  refreshButtonText: {
    color: '#00649D',
    fontSize: 12,
    fontWeight: '900',
  },
  directoryLoading: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  actionRow: {
    gap: 10,
  },
  clientFormCard: {
    backgroundColor: '#F8FBFE',
    borderColor: '#DDEAF5',
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  clientFormTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  clientFormBackButton: {
    alignItems: 'center',
    backgroundColor: '#EAF5FC',
    borderColor: '#CFE4F2',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 36,
    paddingHorizontal: 12,
  },
  clientFormBackText: {
    color: '#00649D',
    fontSize: 12,
    fontWeight: '900',
  },
  clientFormDiscardButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: 6,
  },
  clientFormDiscardText: {
    color: '#6B7D8C',
    fontSize: 12,
    fontWeight: '800',
  },
  clientFormTitle: {
    color: '#263A4F',
    fontSize: 15,
    fontWeight: '900',
  },
  clientFormSubtitle: {
    color: '#34465B',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  formSectionBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3ECF4',
    borderRadius: 14,
    borderWidth: 1,
    gap: 9,
    padding: 10,
  },
  invoiceHeroCard: {
    gap: 10,
    padding: 12,
  },
  invoiceHeroText: {
    gap: 2,
  },
  invoiceHeaderActions: {
    gap: 10,
  },
  invoiceHeaderBox: {
    backgroundColor: '#F6F9FC',
    borderColor: '#B9D8EE',
    borderRadius: 12,
    borderWidth: 1,
    gap: 3,
    padding: 10,
  },
  invoiceMiniLabel: {
    color: '#315A7A',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  invoiceHeaderValue: {
    color: '#062E52',
    fontSize: 16,
    fontWeight: '900',
  },
  invoiceSectionHelp: {
    color: '#58728A',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  invoiceSteps: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE8F1',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  invoiceStepItem: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
  },
  invoiceStepNumber: {
    alignItems: 'center',
    backgroundColor: '#EEF4F8',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  invoiceStepNumberActive: {
    backgroundColor: '#0072BD',
  },
  invoiceStepNumberText: {
    color: '#718497',
    fontSize: 12,
    fontWeight: '900',
  },
  invoiceStepNumberTextActive: {
    color: '#FFFFFF',
  },
  invoiceStepLabel: {
    color: '#718497',
    fontSize: 11,
    fontWeight: '800',
  },
  invoiceStepLabelActive: {
    color: '#0072BD',
  },
  invoicePanel: {
    padding: 10,
    overflow: 'hidden',
  },
  invoicePanelHeader: {
    backgroundColor: '#0072BD',
    gap: 8,
    marginHorizontal: -10,
    marginTop: -10,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  invoicePanelTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  invoicePanelPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DDF1FF',
    borderRadius: 999,
    color: '#00649D',
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  invoiceGrid: {
    gap: 9,
  },
  invoiceChargeBox: {
    backgroundColor: '#F8FBFE',
    borderColor: '#E3ECF4',
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  invoiceReferenceHeader: {
    gap: 8,
  },
  invoiceLineCard: {
    backgroundColor: '#F8FBFE',
    borderColor: '#D8EAF7',
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  invoiceLineTotal: {
    color: '#0072BD',
    fontSize: 15,
    fontWeight: '900',
  },
  invoiceBottomGrid: {
    gap: 12,
  },
  invoiceFrequentBox: {
    borderLeftColor: '#0072BD',
    borderLeftWidth: 4,
  },
  invoiceFrequentItem: {
    backgroundColor: '#F8FBFE',
    borderColor: '#B9D8EE',
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  invoiceSummaryBox: {
    gap: 0,
  },
  invoiceSummaryRow: {
    alignItems: 'center',
    borderBottomColor: '#E4ECF4',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 34,
    gap: 12,
  },
  invoiceSummaryLabel: {
    color: '#163B5B',
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  invoiceSummaryValue: {
    color: '#062E52',
    fontSize: 12,
    fontWeight: '900',
  },
  invoiceSummaryDanger: {
    color: '#C62828',
  },
  invoiceTotalRow: {
    alignItems: 'center',
    backgroundColor: '#0072BD',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 13,
  },
  invoiceTotalLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  invoiceTotalValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  logoPreviewBox: {
    alignItems: 'center',
    backgroundColor: '#F6F9FC',
    borderColor: '#E1EAF2',
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  logoPreviewImage: {
    height: 82,
    width: '100%',
  },
  dropdownField: {
    gap: 8,
  },
  dropdownButton: {
    alignItems: 'center',
    backgroundColor: '#F6F9FC',
    borderColor: '#E1EAF2',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  dropdownButtonText: {
    color: '#536476',
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  dropdownPlaceholder: {
    color: '#8B98A6',
  },
  dropdownChevron: {
    color: '#00649D',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 10,
  },
  dropdownOverlay: {
    backgroundColor: 'rgba(4, 24, 44, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  dropdownSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    maxHeight: '72%',
    padding: 14,
  },
  dropdownTitle: {
    color: '#263A4F',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  dropdownList: {
    maxHeight: 420,
  },
  dropdownListContent: {
    gap: 8,
    paddingBottom: 6,
  },
  dropdownOption: {
    backgroundColor: '#F6F9FC',
    borderColor: '#E1EAF2',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dropdownOptionActive: {
    backgroundColor: '#EAF5FC',
    borderColor: '#0A75B6',
  },
  dropdownOptionText: {
    color: '#536476',
    fontSize: 14,
    fontWeight: '800',
  },
  dropdownOptionTextActive: {
    color: '#00649D',
  },
  toggleRow: {
    alignItems: 'center',
    backgroundColor: '#F4F8FC',
    borderColor: '#E0E9F2',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  toggleBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CAD4DE',
    borderRadius: 7,
    borderWidth: 1.5,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  toggleBoxActive: {
    backgroundColor: '#0072BD',
    borderColor: '#0072BD',
  },
  toggleCheck: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  toggleTextBlock: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    color: '#263A4F',
    fontSize: 14,
    fontWeight: '900',
  },
  toggleHelp: {
    color: '#718192',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  inlineFieldRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  inlineFieldGrow: {
    flex: 1,
  },
  compactFieldRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  compactFieldGrow: {
    flexBasis: 145,
    flexGrow: 1,
    minWidth: 0,
  },
  smallDangerButtonSolid: {
    alignItems: 'center',
    backgroundColor: '#FDEBEC',
    borderRadius: 9,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 10,
  },
  smallDangerSolidText: {
    color: '#B4232D',
    fontSize: 12,
    fontWeight: '900',
  },
  formActions: {
    gap: 10,
  },
  listStack: {
    gap: 12,
  },
  resultCollection: {
    backgroundColor: '#EFF6FB',
    borderColor: '#D5E5F0',
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 9,
  },
  resultCollectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingTop: 3,
  },
  resultCollectionTitle: {
    color: '#263A4F',
    fontSize: 15,
    fontWeight: '900',
  },
  resultCollectionMeta: {
    color: '#617A90',
    fontSize: 11,
    fontWeight: '800',
  },
  loadMoreButton: {
    alignItems: 'center',
    backgroundColor: '#EAF5FC',
    borderColor: '#B9D8EE',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: 14,
  },
  loadMoreText: {
    color: '#00649D',
    fontSize: 13,
    fontWeight: '900',
  },
  loadMoreMeta: {
    color: '#688096',
    fontSize: 11,
    fontWeight: '800',
  },
  paginationBar: {
    alignItems: 'center',
    borderTopColor: '#DCE8F1',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingTop: 10,
  },
  paginationPages: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  paginationButton: {
    alignItems: 'center',
    backgroundColor: '#EAF5FC',
    borderColor: '#B9D8EE',
    borderRadius: 9,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationButtonText: {
    color: '#00649D',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  paginationPage: {
    alignItems: 'center',
    borderRadius: 9,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  paginationPageActive: {
    backgroundColor: '#0072BD',
  },
  paginationPageText: {
    color: '#617A90',
    fontSize: 12,
    fontWeight: '900',
  },
  registerReviewCard: {
    backgroundColor: '#F3F8FC',
    borderColor: '#D5E5F0',
    borderRadius: 13,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  registerReviewTitle: {
    color: '#0072BD',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  registerReviewValue: {
    color: '#263A4F',
    fontSize: 14,
    fontWeight: '900',
  },
  registerReviewMeta: {
    color: '#687E91',
    fontSize: 11,
    fontWeight: '700',
  },
  paginationPageTextActive: {
    color: '#FFFFFF',
  },
  detailModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  detailModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 35, 60, 0.48)',
  },
  detailModalCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#B9D8EE',
    borderRadius: 22,
    borderWidth: 1,
    gap: 18,
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#002C50',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  clientDirectoryCard: {
    backgroundColor: '#F4F8FC',
    borderRadius: 24,
    gap: 14,
    padding: 10,
    shadowColor: '#001B35',
    shadowOpacity: 0.2,
    shadowRadius: 22,
  },
  detailModalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  detailModalTitleWrap: {
    flex: 1,
    gap: 4,
  },
  detailModalEyebrow: {
    color: '#0072BD',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  detailModalTitle: {
    color: '#263A4F',
    fontSize: 19,
    fontWeight: '900',
  },
  detailModalClose: {
    alignItems: 'center',
    backgroundColor: '#EEF5F9',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  detailModalCloseText: {
    color: '#38566D',
    fontSize: 23,
    lineHeight: 25,
  },
  detailModalBody: {
    backgroundColor: '#F5F9FC',
    borderColor: '#E0EAF2',
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  detailModalRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 9,
  },
  detailModalMarker: {
    backgroundColor: '#00A8D6',
    borderRadius: 4,
    height: 8,
    marginTop: 5,
    width: 8,
  },
  detailModalValue: {
    color: '#405C72',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  detailModalEmpty: {
    color: '#72879A',
    fontSize: 13,
    fontWeight: '700',
  },
  detailModalButton: {
    alignItems: 'center',
    backgroundColor: '#0072BD',
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  detailModalButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  clientCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE8F1',
    borderRadius: 16,
    borderWidth: 1,
    gap: 11,
    padding: 14,
    shadowColor: '#002C50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  clientBankSummary: {
    backgroundColor: '#06295A',
    borderRadius: 20,
    gap: 18,
    overflow: 'hidden',
    padding: 18,
    position: 'relative',
  },
  clientBankSummaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientHeroTitleBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  clientHeroCopy: {
    flex: 1,
    minWidth: 0,
  },
  clientHeroIcon: {
    alignItems: 'center',
    backgroundColor: '#123E78',
    borderColor: '#2B5B94',
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  clientBankEyebrow: {
    color: '#68D9F6',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  clientBankTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 4,
  },
  clientHeroSubtitle: {
    color: '#B9D9F2',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  clientHeroAddButton: {
    alignItems: 'center',
    backgroundColor: '#0A74C9',
    borderColor: '#3B98DF',
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#001B35',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    width: 48,
    zIndex: 2,
  },
  clientHeroAddGlyph: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 31,
  },
  clientBankTotal: {
    alignItems: 'flex-end',
  },
  clientBankTotalValue: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
  },
  clientBankTotalLabel: {
    color: '#A9CBE6',
    fontSize: 10,
    fontWeight: '800',
  },
  clientBankMetrics: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 11,
  },
  clientBankMetricSlot: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  clientBankMetric: {
    alignItems: 'center',
    flex: 1,
  },
  clientBankMetricValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  clientBankMetricLabel: {
    color: '#B5D3E8',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  clientBankMetricDivider: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    height: 26,
    width: 1,
  },
  clientToolsPanel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D6E6F1',
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  clientToolsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  clientToolsEyebrow: {
    color: '#0072BD',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  clientToolsTitle: {
    color: '#173E61',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  clientSearchBar: {
    alignItems: 'center',
    backgroundColor: '#F7FAFD',
    borderColor: '#DCE8F1',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  clientSearchInput: {
    color: '#263A4F',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 10,
  },
  clientSearchCount: {
    alignItems: 'center',
    backgroundColor: '#EAF5FC',
    borderRadius: 999,
    justifyContent: 'center',
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  clientSearchCountText: {
    color: '#00649D',
    fontSize: 11,
    fontWeight: '900',
  },
  clientFilterResetButton: {
    alignItems: 'center',
    backgroundColor: '#EAF5FC',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 11,
  },
  clientExportButton: {
    backgroundColor: '#EAF8F0',
    borderColor: '#BEE8CF',
    borderWidth: 1,
  },
  clientExportText: {
    color: '#128A46',
  },
  clientFilterPanel: {
    gap: 9,
  },
  clientFilterLine: {
    gap: 6,
  },
  clientFilterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientFilterTitle: {
    color: '#263A4F',
    fontSize: 13,
    fontWeight: '900',
  },
  clientFilterClear: {
    color: '#0072BD',
    fontSize: 11,
    fontWeight: '900',
  },
  clientFilterLabel: {
    color: '#315A7A',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  clientFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  clientFilterChip: {
    backgroundColor: '#F6FAFD',
    borderColor: '#D6E6F1',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  clientFilterChipActive: {
    backgroundColor: '#0072BD',
    borderColor: '#0072BD',
  },
  clientFilterChipText: {
    color: '#587086',
    fontSize: 11,
    fontWeight: '800',
  },
  clientFilterChipTextActive: {
    color: '#FFFFFF',
  },
  clientListPanel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE8F1',
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  clientListHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  clientListActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  clientListEyebrow: {
    color: '#0072BD',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  clientListTitle: {
    color: '#173E61',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  clientListCount: {
    backgroundColor: '#0072BD',
    borderRadius: 999,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    minWidth: 34,
    overflow: 'hidden',
    paddingHorizontal: 11,
    paddingVertical: 7,
    textAlign: 'center',
  },
  clientCardSystem: {
    backgroundColor: '#F4F8FC',
    borderColor: '#B9D8EE',
  },
  clientCardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  clientAvatar: {
    alignItems: 'center',
    backgroundColor: '#0072BD',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  clientAvatarSystem: {
    backgroundColor: '#5D82A1',
  },
  clientAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  clientInfo: {
    flex: 1,
    gap: 2,
  },
  clientName: {
    color: '#263A4F',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
  },
  clientMeta: {
    color: '#6F7F90',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  clientBadgeStack: {
    alignItems: 'flex-end',
    gap: 6,
  },
  clientCardChevron: {
    marginTop: 6,
  },
  systemPill: {
    backgroundColor: '#EAF5FC',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  systemPillText: {
    color: '#00649D',
    fontSize: 11,
    fontWeight: '900',
  },
  clientDetailGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  clientDetailItem: {
    backgroundColor: '#F7FBFE',
    borderColor: '#E3ECF4',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    minHeight: 56,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  clientDetailLabel: {
    color: '#7A8794',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  clientDetailValue: {
    color: '#263A4F',
    fontSize: 12,
    fontWeight: '800',
  },
  clientStatsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  clientStatItem: {
    backgroundColor: '#F2F8FC',
    borderRadius: 12,
    flex: 1,
    gap: 4,
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  clientStatValue: {
    color: '#07305E',
    fontSize: 14,
    fontWeight: '900',
  },
  systemNotice: {
    backgroundColor: '#EAF5FC',
    borderRadius: 12,
    padding: 10,
  },
  systemNoticeCompact: {
    backgroundColor: '#EAF5FC',
    borderRadius: 11,
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 10,
  },
  systemNoticeText: {
    color: '#46657D',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  clientActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  smallActionButton: {
    alignItems: 'center',
    backgroundColor: '#EAF5FC',
    borderColor: '#D6E6F1',
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  smallDangerButton: {
    backgroundColor: '#FDEBEC',
    borderColor: '#F7D4D8',
  },
  smallSuccessButton: {
    backgroundColor: '#EAF8F0',
    borderColor: '#BEE8CF',
  },
  smallActionText: {
    color: '#00649D',
    fontSize: 12,
    fontWeight: '900',
  },
  smallDangerText: {
    color: '#B4232D',
  },
  smallSuccessText: {
    color: '#128A46',
  },
  documentActionWrap: {
    alignItems: 'flex-end',
    position: 'relative',
    zIndex: 10,
  },
  documentActionTrigger: {
    alignItems: 'center',
    backgroundColor: '#F1F6FA',
    borderColor: '#DCE8F1',
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  documentActionMenu: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE8F1',
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    marginTop: 8,
    minWidth: 210,
    padding: 8,
    position: 'absolute',
    right: 0,
    top: 42,
    shadowColor: '#123B58',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  documentActionItem: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    minHeight: 40,
    paddingHorizontal: 10,
  },
  documentActionIcon: {
    alignItems: 'center',
    backgroundColor: '#F2F7FB',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  documentActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
    borderColor: '#E0E9F2',
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
  },
  emptyTitle: {
    color: '#263A4F',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    color: '#718192',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },
  profileBox: {
    backgroundColor: '#F4F8FC',
    borderColor: '#E0E9F2',
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
    marginTop: 22,
    padding: 16,
  },
  profileLabel: {
    color: '#7A8794',
    fontSize: 12,
    fontWeight: '800',
  },
  profileValue: {
    color: '#24384C',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  profileOverview: {
    gap: EFACT_THEME.spacing.lg,
  },
  profileHeroCard: {
    backgroundColor: EFACT_THEME.colors.primaryDark,
    borderRadius: EFACT_THEME.radius.card,
    gap: EFACT_THEME.spacing.lg,
    padding: EFACT_THEME.spacing.lg,
  },
  profileHeroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: EFACT_THEME.spacing.md,
  },
  profileHeroImage: {
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 22,
    borderWidth: 2,
    height: 88,
    width: 88,
  },
  profileHeroCopy: {
    flex: 1,
    minWidth: 0,
  },
  profileHeroEyebrow: {
    color: '#B8D6EC',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  profileHeroName: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 26,
    marginTop: 4,
  },
  profileHeroMeta: {
    color: '#DDF0FA',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  profileHeroActions: {
    flexDirection: 'row',
    gap: EFACT_THEME.spacing.sm,
  },
  profileMainAction: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.primary,
    borderRadius: EFACT_THEME.radius.button,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: EFACT_THEME.spacing.md,
  },
  profileMainActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  profileSecondaryAction: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: EFACT_THEME.radius.button,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: EFACT_THEME.spacing.md,
  },
  profileSecondaryActionText: {
    color: EFACT_THEME.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  profileInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: EFACT_THEME.spacing.sm,
  },
  profileInfoTile: {
    backgroundColor: EFACT_THEME.colors.surface,
    borderColor: EFACT_THEME.colors.border,
    borderRadius: EFACT_THEME.radius.card,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    gap: EFACT_THEME.spacing.sm,
    minHeight: 76,
    padding: EFACT_THEME.spacing.md,
  },
  profileInfoTileFull: {
    flexBasis: '100%',
  },
  profileInfoIcon: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.primaryLight,
    borderRadius: 11,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  profileInfoCopy: {
    flex: 1,
    minWidth: 0,
  },
  profileInfoLabel: {
    color: EFACT_THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  profileInfoValue: {
    color: EFACT_THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    marginTop: 4,
  },
  profileSecurityCard: {
    alignItems: 'center',
    backgroundColor: '#F3FCF7',
    borderColor: '#BDEED2',
    borderRadius: EFACT_THEME.radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: EFACT_THEME.spacing.md,
    padding: EFACT_THEME.spacing.md,
  },
  profileSecurityIcon: {
    alignItems: 'center',
    backgroundColor: '#E8F7EF',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  profileSecurityCopy: {
    flex: 1,
    minWidth: 0,
  },
  profileSecurityTitle: {
    color: '#145A36',
    fontSize: 14,
    fontWeight: '900',
  },
  profileSecurityText: {
    color: '#32724E',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 2,
  },
  profileEditHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: EFACT_THEME.spacing.md,
    justifyContent: 'space-between',
  },
  profileEditTitleBlock: {
    flex: 1,
  },
  profileEditHint: {
    color: EFACT_THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 3,
  },
  profileCloseEditButton: {
    alignItems: 'center',
    backgroundColor: EFACT_THEME.colors.primaryLight,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  profileAvatarPanel: {
    alignItems: 'center',
    backgroundColor: '#EEF6FF',
    borderColor: '#B9D8EE',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  profileAvatarImage: {
    borderRadius: 16,
    height: 76,
    width: 76,
  },
  profileAvatarInfo: {
    flex: 1,
    gap: 4,
  },
  profileAvatarName: {
    color: '#263A4F',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },
  profileAvatarMeta: {
    color: '#6F7F90',
    fontSize: 12,
    fontWeight: '800',
  },
  profileAvatarCount: {
    alignSelf: 'flex-start',
    backgroundColor: '#DFF1FB',
    borderRadius: 999,
    color: '#00649D',
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  profileUploadButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#9BCBE9',
    borderRadius: 9,
    borderWidth: 1,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  profileUploadText: {
    color: '#00649D',
    fontSize: 12,
    fontWeight: '900',
  },
  infoNotice: {
    alignItems: 'center',
    backgroundColor: '#EAFBF3',
    borderColor: '#BDEED2',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  infoNoticeIcon: {
    alignItems: 'center',
    backgroundColor: '#16A163',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  infoNoticeIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  infoNoticeBody: {
    flex: 1,
    gap: 2,
  },
  infoNoticeTitle: {
    color: '#145A36',
    fontSize: 14,
    fontWeight: '900',
  },
  infoNoticeText: {
    color: '#32724E',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  puntoHero: {
    backgroundColor: '#0876BE',
    borderRadius: 18,
    gap: 8,
    overflow: 'hidden',
    padding: 16,
  },
  puntoHeroEyebrow: {
    color: '#BFE7FF',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  puntoHeroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 27,
  },
  puntoHeroText: {
    color: '#D5EEFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  puntoHeroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  puntoHeroBadgeLabel: {
    color: '#CFEFFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  puntoHeroBadgeValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  puntoCardPrincipal: {
    borderColor: '#72B7F2',
    borderWidth: 1.5,
  },
  securityHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  securityTitleBlock: {
    flex: 1,
  },
  securityToggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  securityStablePill: {
    backgroundColor: '#EAF5FC',
    borderRadius: 999,
    color: '#00649D',
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  securitySwitch: {
    backgroundColor: '#A8D6F1',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 58,
  },
  securitySwitchActive: {
    backgroundColor: '#0072BD',
  },
  securitySwitchKnob: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 24,
    width: 24,
  },
  securitySwitchKnobActive: {
    alignSelf: 'flex-end',
  },
  securityToggleText: {
    color: '#263A4F',
    fontSize: 13,
    fontWeight: '900',
  },
  securityNoChangeBox: {
    alignItems: 'center',
    backgroundColor: '#EAF5FC',
    borderColor: '#A8D6F1',
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  securityNoChangeText: {
    color: '#263A4F',
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  botScreen: { backgroundColor: '#F7FAFD', borderColor: '#B9D8EE', borderRadius: 18, borderWidth: 2, flex: 1, minHeight: 560, overflow: 'hidden' },
  botHero: { alignItems: 'center', backgroundColor: '#06295A', flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  botAvatar: { backgroundColor: '#FFFFFF', borderColor: '#68D9F6', borderRadius: 28, borderWidth: 2, height: 56, width: 56 },
  botHeroCopy: { flex: 1 },
  botHeroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  botHeroText: { color: '#C8E4F7', fontSize: 12, fontWeight: '700', marginTop: 2 },
  botStatusPill: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, flexDirection: 'row', gap: 5, marginTop: 7, paddingHorizontal: 9, paddingVertical: 5 },
  botStatusDot: { backgroundColor: '#42D392', borderRadius: 5, height: 9, width: 9 },
  botHeroStatus: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  botOnlineDot: { backgroundColor: '#42D392', borderColor: '#FFFFFF', borderRadius: 8, borderWidth: 2, height: 14, width: 14 },
  botMessages: { flex: 1 },
  botMessagesContent: { flexGrow: 1, gap: 12, justifyContent: 'flex-start', padding: 16, paddingBottom: 18 },
  botHint: { color: '#73879A', fontSize: 12, lineHeight: 17, marginBottom: 4 },
  botAssistantRow: { alignItems: 'flex-end', alignSelf: 'stretch', flexDirection: 'row', gap: 8 },
  botUserRow: { alignItems: 'flex-end', alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'flex-end' },
  botMessageAvatar: { backgroundColor: '#FFFFFF', borderColor: '#68D9F6', borderRadius: 18, borderWidth: 1, height: 36, width: 36 },
  botBubble: { borderRadius: 16, flexShrink: 1, maxWidth: '82%', paddingHorizontal: 13, paddingVertical: 11 },
  botAssistantBubble: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderColor: '#DCE8F1', borderWidth: 1 },
  botUserBubble: { alignSelf: 'flex-end', backgroundColor: '#0072BD' },
  botBubbleText: { color: '#263A4F', flexShrink: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  botMessageRow: { alignItems: 'flex-end', flexDirection: 'row', gap: 8 },
  botUserBubbleText: { color: '#FFFFFF' },
  botAudioButton: { alignItems: 'center', backgroundColor: '#EAF5FC', borderRadius: 999, height: 28, justifyContent: 'center', width: 28 },
  botBubbleFeedback: { alignItems: 'center', alignSelf: 'flex-end', borderTopColor: '#EDF4F9', borderTopWidth: 1, flexDirection: 'row', gap: 6, marginTop: 8, paddingTop: 6 },
  botFeedbackButton: { alignItems: 'center', backgroundColor: '#F4F8FC', borderRadius: 999, height: 26, justifyContent: 'center', width: 26 },
  botFeedbackButtonActive: { backgroundColor: '#0878C9' },
  botTypingBubble: { minWidth: 58, paddingVertical: 8 },
  typingDots: { alignItems: 'center', flexDirection: 'row', gap: 3, justifyContent: 'center' },
  typingDotText: { color: '#0878C9', fontSize: 24, fontWeight: '900', lineHeight: 24 },
  botSuggestions: { gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  botSuggestion: { backgroundColor: '#E7F4FC', borderColor: '#B9E0F5', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  botSuggestionText: { color: '#0867A9', fontSize: 12, fontWeight: '800' },
  botError: { color: '#B42318', fontSize: 12, paddingHorizontal: 16, paddingBottom: 6 },
  botComposer: { alignItems: 'flex-end', backgroundColor: '#FFFFFF', borderTopColor: '#DCEAF3', borderTopWidth: 1, flexDirection: 'row', gap: 6, padding: 10 },
  botEmojiTray: { backgroundColor: '#FFFFFF', borderTopColor: '#DCEAF3', borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 10, paddingVertical: 8 },
  botEmojiChip: { backgroundColor: '#EAF5FC', borderColor: '#B9E0F5', borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  botEmojiText: { color: '#0867A9', fontSize: 12, fontWeight: '900' },
  botToolButton: { alignItems: 'center', borderColor: '#DCEAF3', borderRadius: 12, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
  botToolButtonActive: { backgroundColor: '#0878C9', borderColor: '#0878C9' },
  botVoiceButton: { alignItems: 'center', backgroundColor: '#E7F4FC', borderColor: '#B9E0F5', borderRadius: 14, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  botVoiceButtonActive: { backgroundColor: '#F15A29', borderColor: '#F15A29' },
  botInput: { backgroundColor: '#F3F7FA', borderColor: '#DCEAF3', borderRadius: 14, borderWidth: 1, color: '#263A4F', flex: 1, maxHeight: 90, minHeight: 44, paddingHorizontal: 12, paddingVertical: 10 },
  botSendButton: { alignItems: 'center', backgroundColor: '#0878C9', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 },
  botSendButtonDisabled: { backgroundColor: '#AFC8D8' },
  botSendText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  firmaHero: { alignItems: 'flex-start', backgroundColor: '#F1F8FD', borderColor: '#CFE5F4', borderRadius: 22, borderWidth: 1, flexDirection: 'row', gap: 14, justifyContent: 'space-between', marginBottom: 18, padding: 20 },
  firmaHeroCopy: { flex: 1, gap: 6 },
  firmaHeroEyebrow: { color: '#0072BD', fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  firmaHeroTitle: { color: '#173E61', fontSize: 23, fontWeight: '900', lineHeight: 29 },
  firmaHeroText: { color: '#668198', fontSize: 13, fontWeight: '600', lineHeight: 19 },
  firmaRefreshButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#B8D8EA', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: 11, paddingVertical: 9 },
  firmaRefreshText: { color: '#0072BD', fontSize: 11, fontWeight: '900' },
  firmaCard: { backgroundColor: '#FFFFFF', borderColor: '#D8EAF4', borderLeftColor: '#0072BD', borderLeftWidth: 5, borderRadius: 20, borderWidth: 1, gap: 16, padding: 18, shadowColor: '#123B58', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 3 },
  firmaCompactGrid: { flexWrap: 'wrap' },
  firmaDetailGrid: { flexWrap: 'wrap', gap: 10 },
  firmaDetailItem: { flexBasis: '46%', flexGrow: 1, minWidth: 130 },
});




