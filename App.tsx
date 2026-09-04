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
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiError, setSessionToken } from './src/services/apiClient';
import { sendBotMessage } from './src/services/botService';
import { API_BASE_URL } from './src/config/api';
import { AdminMobileItem, getAdminMobileModule } from './src/services/adminMobileService';
import { changePassword, checkAuth, login, recoverPassword, register } from './src/services/authService';
import { createCategoria, createSubcategoria, deleteCategoria, deleteSubcategoria, getCategorias, getSubcategorias, updateCategoria, updateSubcategoria } from './src/services/categoriasService';
import { createCliente, deleteCliente, getCiudades, getClienteLookups, getClientes, getProvincias, updateCliente } from './src/services/clientesService';
import { createEmisor, deleteEmisor, getEmisor, getEmisores, updateEmisor, uploadFirmaArchivo } from './src/services/emisoresService';
import { anularFactura, buscarFacturaClientes, buscarFacturaProductos, enviarFacturaCorreo, FacturaListItem, FacturaPreparacion, FacturaProducto, getFacturaDetalle, getFacturaPdf, getFacturas, getFacturaPreparacion, getFacturaXml, guardarFactura, reintentarFacturaSri } from './src/services/facturasMobileService';
import { anularGuiaRemision, buscarGuiaClientes, buscarGuiaFacturas, buscarGuiaProductos, buscarGuiaTransportistas, emitirGuiaRemision, enviarGuiaRemisionCorreo, getGuiaRemisionPdf, getGuiaRemisionPreparacion, getGuiasRemision, getGuiaRemisionXml, guardarGuiaRemision, GuiaRemisionListItem } from './src/services/guiasRemisionMobileService';
import { getMenusByRol, hasMenusByRolEndpoint } from './src/services/menuService';
import { buscarLiquidacionProductos, buscarLiquidacionProveedores, emitirLiquidacionCompra, enviarLiquidacionCompraCorreo, getLiquidacionCompraPdf, getLiquidacionCompraPreparacion, getLiquidacionesCompra, getLiquidacionCompraXml, guardarLiquidacionCompra, LiquidacionCompraListItem } from './src/services/liquidacionesCompraMobileService';
import { anularNotaCredito, buscarNotaCreditoFacturas, emitirNotaCredito, enviarNotaCreditoCorreo, getNotaCreditoDetallesDisponibles, getNotaCreditoPdf, getNotaCreditoPreparacion, getNotasCredito, getNotaCreditoXml, guardarNotaCredito, NotaCreditoListItem } from './src/services/notasCreditoMobileService';
import { anularNotaDebito, buscarNotaDebitoFacturas, emitirNotaDebito, enviarNotaDebitoCorreo, getNotaDebitoDetallesFactura, getNotaDebitoPdf, getNotaDebitoPreparacion, getNotasDebito, getNotaDebitoXml, guardarNotaDebito, NotaDebitoListItem } from './src/services/notasDebitoMobileService';
import { clearNotificaciones, dismissNotificacion, getNotificaciones, NotificacionItem } from './src/services/notificacionesService';
import { syncDeviceNotifications } from './src/services/deviceNotificationsService';
import { CompraDocumentosEstado, createOperationalItem, deleteOperationalItem, getCompraDocumentosEstado, getOperationalMobileModule, getOperationalModuleConfig, iniciarPagoCompraDocumentos, OperationalMobileItem, OperationalModule, updateOperationalItem } from './src/services/operationalMobileService';
import { getPerfil, updatePerfil, uploadPerfilAvatar } from './src/services/perfilService';
import { createPuntoEmision, deletePuntoEmision, getPuntoEmisionSiguienteSecuencial, getPuntosEmision, markPuntoPrincipal, PuntoDocumentoKey, savePuntoEmisionSecuenciaInicial, updatePuntoEmision } from './src/services/puntosEmisionService';
import { createProducto, deleteProducto, getProducto, getProductoLookups, getProductos, getProductoSubcategorias, updateProducto } from './src/services/productosService';
import { enviarRetencionCorreo, getRetencionPdf, getRetenciones, getRetencionXml, RetencionListItem } from './src/services/retencionesMobileService';
import { ERubricaDashboard, ERubricaEmisor, buscarERubricaSolicitudesProveedor, descargarERubricaFirmaP12, firmarERubricaDocumento, getERubricaDashboard, getERubricaEmisores, getERubricaFirmaEstado, getERubricaProductos, getERubricaRenovacion, getERubricaSaldo, sincronizarERubricaPendientes, validarERubricaFirmaPdf, validarERubricaQr } from './src/services/erubricaMobileService';
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
import type { BotFeedbackState, BotMessage } from './src/types/bot';
import { GlobalSearchModal as ExtractedGlobalSearchModal } from './src/components/search/GlobalSearchModal';
import type { GlobalSearchResult as ExtractedGlobalSearchResult } from './src/types/globalSearch';
import { InvoiceProgressSteps as SharedInvoiceProgressSteps, InvoiceSummaryRow } from './src/components/facturacion/InvoiceShared';
import { styles } from './src/styles/appStyles';
import { DocumentActionsMenu } from './src/components/documents/DocumentActionsMenu';
import { EfactBotScreen } from './src/components/bot/EfactBotScreen';
import { InitialSequenceModal } from './src/components/documentos/InitialSequenceModal';
import { PuntosEmisionScreen } from './src/components/puntos/PuntosEmisionScreen';
import { DirectoryTabButton, DropdownField, FormTopBar, ToggleRow } from './src/components/ui/FormShared';
import { DashboardActivityItem, DashboardChartCard, DashboardFavorite, DashboardMetric, DashboardPrimaryAction, DashboardQuickAction, DashboardServiceRow, DashboardStatCard } from './src/components/dashboard/DashboardWidgets';
import { ModuleCard, NavButton, PortalBottomNav, PortalHeaderAvatar } from './src/components/portal/PortalNavigation';
import { CatalogCard, SubcategoriaCard } from './src/components/catalog/CatalogCards';
import { InitialsAvatar, MenuItem } from './src/components/ui/MenuItem';
import { BiometricSetupModal, BrandLockup, BrandMark, LoadingScreen, ScreenFrame } from './src/components/auth/AuthWidgets';
import { EFACT_THEME, ERUBRICA_COLORS } from './src/styles/theme';
import { getDocumentSerieOptions, getEffectiveDocumentSerie, getNextSequence, getNextSequenceFromOptions, getPuntoDocumentSequences, getPuntoSerie, getSelectedDocumentSerieOption, getSerieCodemisorFromOptions, getSerieLabel, getSerieLabelFromOptions, getSerieValue, normalizeSerieCode, normalizeSerieDisplay, serieNeedsInitialSequence, usePreferredDocumentSerie } from './src/utils/documentSeries';
import type { NuevaFacturaFormState, NuevaFacturaLinea } from './src/types/invoices';
import { formatDocumentDate, formatMoney, listItemKey } from './src/utils/documentFormatting';

type AuthMode = 'login' | 'register' | 'forgot' | 'change';

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
  | 'configuracion'
  | 'soporte'
  | 'bot'
  | 'tutoriales'
  | 'centro-normativo'
  | 'no-autorizado';
type ERubricaTab = 'solicitudes' | 'firmas' | 'firmar' | 'validar' | 'renovacion' | 'proveedor' | 'catalogos' | 'soporte';
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

type SequencePromptState = {
  documento: PuntoDocumentoKey;
  documentLabel: string;
  serie: string;
  codemisor?: number | null;
  form: 'factura' | 'notaCredito' | 'notaDebito' | 'liquidacion' | 'guia';
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
const INVOICE_DRAFT_KEY_PREFIX = 'efact.invoice.draft';

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
  numeroIdentificacion: '',
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
  action?: () => void;
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

const VIEW_ROUTE_ALIASES: Partial<Record<Exclude<WorkspaceView, 'portal' | 'dashboard' | 'no-autorizado' | 'nuevo-cliente' | 'nuevo-producto'>, string[]>> = {
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
  if (normalized.includes('fact')) return { kind: 'efact', accent: EFACT_THEME.colors.primary, surface: '#EAF7FF' };
  if (normalized.includes('rubrica') || normalized.includes('sign')) return { kind: 'rubrica', accent: ERUBRICA_COLORS.primary, surface: '#EAFBF4' };
  if (normalized.includes('cont')) return { kind: 'green', accent: '#08A889', surface: '#E8FBF7' };
  if (normalized.includes('declara')) return { kind: 'purple', accent: '#6847FF', surface: '#F0EDFF' };
  if (normalized.includes('people') || normalized.includes('talento') || normalized.includes('rrhh')) return { kind: 'orange', accent: '#F97316', surface: '#FFF3E8' };
  if (normalized.includes('back')) return { kind: 'purple', accent: '#6847FF', surface: '#F0EDFF' };

  const palette = [
    { kind: 'purple', accent: '#6847FF', surface: '#F0EDFF' },
    { kind: 'orange', accent: '#F97316', surface: '#FFF3E8' },
    { kind: 'green', accent: '#08A889', surface: '#E8FBF7' },
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

function getNotificationView(notification: NotificacionItem): WorkspaceView | null {
  const source = normalizeText(`${notification.view ?? ''} ${notification.route ?? ''} ${notification.module ?? ''} ${notification.type ?? ''} ${notification.title} ${notification.text}`);
  const routeMap: Array<[WorkspaceView, string[]]> = [
    ['mis-notas-credito', ['nota-credito', 'notas-credito', 'credito']],
    ['mis-notas-debito', ['nota-debito', 'notas-debito', 'debito']],
    ['mis-liquidaciones-compra', ['liquidacion', 'liquidaciones', 'compra']],
    ['mis-guias-remision', ['guia-remision', 'guias-remision', 'remision']],
    ['retenciones', ['retencion', 'retenciones']],
    ['mis-facturas', ['factura', 'facturas']],
    ['clientes', ['cliente', 'clientes', 'proveedor', 'proveedores']],
    ['productos', ['producto', 'productos', 'categoria', 'subcategoria']],
    ['firma', ['firma', 'certificado']],
    ['punto-emision', ['punto-emision', 'puntos-emision', 'caja', 'serie', 'secuencia']],
    ['cuentas-cobrar', ['cuentas-cobrar', 'cobrar', 'saldo']],
    ['e-rubrica', ['rubrica', 'e-sign']],
    ['bot', ['numi', 'bot', 'asistente']],
  ];
  return routeMap.find(([, terms]) => terms.some((term) => source.includes(term)))?.[0] ?? null;
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

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
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
  return (VIEW_ROUTE_ALIASES[view] ?? []).some((alias) => source.includes(alias));
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

  const unique = new Map<string, ServiceAccess>();
  [...explicit, ...fromMenus, ...fallbackServices]
    .filter((service) => service.estado !== false && service.habilitado !== false)
    .forEach((service) => {
      const key = normalizeText(getServiceDisplayName(service));
      if (!unique.has(key)) unique.set(key, service);
    });

  return Array.from(unique.values());
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

function getCajaSerieForDocument(preparacion: FacturaPreparacion | null, kind: 'factura' | 'notaCredito' | 'notaDebito' | 'liquidacion' | 'guia') {
  const caja = preparacion?.caja;
  if (!caja) return '';

  if (kind === 'notaCredito') return caja.serieNotasCred || caja.serieFactura || '';
  if (kind === 'notaDebito') return caja.serieNotasDeb || caja.serieFactura || '';
  if (kind === 'liquidacion') return caja.serieLiquidacion || caja.serieLiquidacionCompra || caja.serieFactura || '';
  if (kind === 'guia') return caja.serieGuia || caja.serieFactura || '';
  return caja.serieFactura || '';
}

function clienteToForm(cliente: Cliente): ClienteFormState {
  return {
    tipoCliente: cliente.tipoCliente ?? 0,
    tipoidentificacion: Number(cliente.tipoidentificacion) || 2,
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

function getDocumentPlanStatus(data: CompraDocumentosEstado | null) {
  const historial = Array.isArray(data?.historial) ? data.historial : [];
  const unlimitedPlan = historial.find((item) => {
    const row = item as Record<string, unknown>;
    const estado = textValue(pickRecordValue(row, ['estado', 'Estado'])).toLowerCase();
    return Boolean(pickRecordValue(row, ['esIlimitado', 'EsIlimitado']))
      && (Boolean(pickRecordValue(row, ['saldoAplicado', 'SaldoAplicado'])) || estado.includes('apro') || estado.includes('pag'));
  }) as Record<string, unknown> | undefined;
  const expires = textValue(pickRecordValue(unlimitedPlan, ['vigenciaHasta', 'VigenciaHasta', 'fechaVence', 'FechaVence', 'fecha', 'Fecha']));
  const saldo = Number(data?.saldoDocumentos ?? 0);

  return {
    unlimited: Boolean(unlimitedPlan),
    label: unlimitedPlan ? 'Ilimitado' : Number.isFinite(saldo) ? String(saldo) : '-',
    caption: unlimitedPlan ? (expires ? `Vence: ${formatDocumentDate(expires)}` : 'Plan activo') : 'Documentos disponibles',
  };
}

function getFirmaSummary(emisores: Emisor[], estados: Record<number, FirmaEstado>) {
  const configured = emisores.filter((emisor) => hasFirmaConfigured(emisor) || estados[emisor.codigo]?.tieneCertificado === true);
  const valid = configured.find((emisor) => estados[emisor.codigo]?.esValida) ?? configured[0];
  const estado = valid ? estados[valid.codigo] : undefined;

  return {
    active: Boolean(valid && (estado?.esValida || hasFirmaConfigured(valid))),
    label: valid && (estado?.esValida || hasFirmaConfigured(valid)) ? 'Activa' : 'Pendiente',
    caption: estado?.fechaExpiracion ? `Vence: ${formatDocumentDate(estado.fechaExpiracion)}` : valid ? 'Certificado configurado' : 'Sin firma',
  };
}

function GlobalWorkspaceHeader({
  title,
  subtitle,
  unreadNotifications,
  documentPlan,
  firmaSummary,
  onSearch,
  onNotifications,
  onMenu,
  onDocuments,
  onFirma,
}: {
  title: string;
  subtitle: string;
  unreadNotifications: number;
  documentPlan: ReturnType<typeof getDocumentPlanStatus>;
  firmaSummary: ReturnType<typeof getFirmaSummary>;
  onSearch: () => void;
  onNotifications: () => void;
  onMenu: () => void;
  onDocuments: () => void;
  onFirma: () => void;
}) {
  return (
    <View style={styles.unifiedTopBar}>
      <View style={styles.unifiedHeaderRow}>
        <View style={styles.unifiedBrandBlock}>
          <PortalHeaderAvatar />
          <View style={styles.unifiedTitleBlock}>
            <Text style={styles.unifiedTitle} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
            <Text style={styles.unifiedSubtitle} numberOfLines={1}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.unifiedHeaderActions}>
          <Pressable style={styles.unifiedIconButton} onPress={onSearch} accessibilityLabel="Buscar en toda la operación">
            <MaterialCommunityIcons name="magnify" size={22} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.unifiedIconButton} onPress={onNotifications} accessibilityLabel="Notificaciones">
            <MaterialCommunityIcons name="bell-outline" size={22} color="#FFFFFF" />
            {unreadNotifications > 0 ? <View style={styles.dashboardNotificationDot} /> : null}
          </Pressable>
          <Pressable style={styles.unifiedIconButton} onPress={onMenu} accessibilityLabel="Menu">
            <MaterialCommunityIcons name="menu" size={25} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
      <View style={styles.unifiedStatusGrid}>
        <Pressable style={styles.unifiedStatusCard} onPress={onDocuments}>
          <View style={styles.unifiedStatusIcon}>
            <MaterialCommunityIcons name="file-document-outline" size={22} color={EFACT_THEME.colors.primary} />
          </View>
          <View style={styles.unifiedStatusCopy}>
            <Text style={styles.unifiedStatusLabel}>Total documentos</Text>
            <Text style={styles.unifiedStatusValue}>{documentPlan.label}</Text>
            <Text style={styles.unifiedStatusCaption}>{documentPlan.caption}</Text>
          </View>
        </Pressable>
        <Pressable style={styles.unifiedStatusCard} onPress={onFirma}>
          <View style={[styles.unifiedStatusIcon, styles.unifiedFirmaIcon]}>
            <MaterialCommunityIcons name="shield-check-outline" size={22} color="#15A85B" />
          </View>
          <View style={styles.unifiedStatusCopy}>
            <Text style={styles.unifiedStatusLabel}>Firma electronica</Text>
            <Text style={[styles.unifiedStatusValue, firmaSummary.active && styles.unifiedStatusOk]}>{firmaSummary.label}</Text>
            <Text style={styles.unifiedStatusCaption}>{firmaSummary.caption}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
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
  const [activeView, setActiveView] = useState<WorkspaceView>(() => {
    if (isSuperAdmin(currentUser)) return 'portal';
    return getAuthorizedViews(getInitialMenus(currentUser)).has('dashboard') ? 'dashboard' : 'e-rubrica';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerProgress = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificacionItem[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(new Set());
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
  const [pdfPreview, setPdfPreview] = useState<{ uri: string; name: string } | null>(null);
  const [erubricaTabRequest, setErubricaTabRequest] = useState<ERubricaTab | null>(null);
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
  const [compraDocumentosEstado, setCompraDocumentosEstado] = useState<CompraDocumentosEstado | null>(null);
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
  const [invoiceDraftReady, setInvoiceDraftReady] = useState(false);
  const [invoiceDraftSaved, setInvoiceDraftSaved] = useState(false);
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
  const [sequencePrompt, setSequencePrompt] = useState<SequencePromptState | null>(null);
  const [sequencePromptSaving, setSequencePromptSaving] = useState(false);
  const [sequencePromptMessage, setSequencePromptMessage] = useState<string | null>(null);
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
  const [botMessages, setBotMessages] = useState<BotMessage[]>([]);
  const [botDraft, setBotDraft] = useState('');
  const [botFeedbackByMessage, setBotFeedbackByMessage] = useState<BotFeedbackState>({});

  const userId = getClaimNumber(currentUser, 'idUsuario') ?? 0;
  const catalogUserId = getClaimNumber(currentUser, 'idJefe') ?? userId;
  const idTipoUsuario = getClaimNumber(currentUser, 'idTipoUsuario');
  const authorizedViews = useMemo(() => getAuthorizedViews(menus), [menus]);
  const canUseEfact = authorizedViews.has('dashboard');
  const services = useMemo(() => getServicesFromUser(currentUser, menus), [currentUser, menus]);
  const canUseERubrica = isSuperAdmin(currentUser) || authorizedViews.has('e-rubrica') || services.some(isERubricaService);
  const canUsePortal = isSuperAdmin(currentUser) || services.length > 0;
  const portalFirstName = getDisplayFirstName(currentUser, perfilData?.perfil);
  const portalAvatarUrl = getProfileAvatarUrl(currentUser, perfilData?.perfil);
  const visibleNotifications = useMemo(() => notifications.filter((notification) => !dismissedNotificationIds.has(notification.id)), [dismissedNotificationIds, notifications]);
  const unreadNotifications = visibleNotifications.filter((notification) => !notification.read).length;

  const syncDocumentSequence = (
    expectedView: WorkspaceView,
    documento: PuntoDocumentoKey,
    documentLabel: string,
    kind: 'factura' | 'notaCredito' | 'notaDebito' | 'liquidacion' | 'guia',
    serie: string,
    preparacion: FacturaPreparacion | null,
    setForm: (updater: (current: any) => any) => void,
  ) => {
    if (activeView !== expectedView || !catalogUserId) return () => undefined;

    let mounted = true;
    const serieOptions = getDocumentSerieOptions(preparacion, puntosData, kind);
    const effectiveSerie = getEffectiveDocumentSerie(serieOptions, serie) || serie;
    if (!effectiveSerie) return () => undefined;
    const sameSerie = (value?: string) => normalizeSerieDisplay(value) === normalizeSerieDisplay(effectiveSerie);
    const knownSequence = getNextSequenceFromOptions(serieOptions, effectiveSerie, '');
    if (!sameSerie(serie)) {
      setForm((current) => sameSerie(current.serie) ? current : { ...current, serie: effectiveSerie });
    }
    const codemisor = getSerieCodemisorFromOptions(serieOptions, effectiveSerie, preparacion);
    const openInitialPrompt = () => {
      setForm((current) => sameSerie(current.serie) && current.numeroFactura ? { ...current, serie: effectiveSerie, numeroFactura: '' } : current);
      setSequencePrompt((current) => (
        current?.documento === documento && current?.serie === effectiveSerie
          ? current
          : { documento, documentLabel, serie: effectiveSerie, codemisor, form: kind }
      ));
    };

    getPuntoEmisionSiguienteSecuencial(catalogUserId, documento, effectiveSerie, codemisor)
      .then((response) => {
        if (!mounted) return;
        const proximo = response.inicializada ? response.proximo?.trim() ?? '' : '';
        setForm((current) => sameSerie(current.serie) && current.numeroFactura !== proximo ? { ...current, serie: effectiveSerie, numeroFactura: proximo } : current);
        if (response.requiereConfiguracionInicial && !knownSequence) {
          openInitialPrompt();
        } else {
          setSequencePrompt((current) => current?.documento === documento && current?.serie === effectiveSerie ? null : current);
        }
      })
      .catch(() => {
        if (mounted && !knownSequence && serieNeedsInitialSequence(serieOptions, effectiveSerie)) openInitialPrompt();
      });

    return () => {
      mounted = false;
    };
  };

  useEffect(
    () => syncDocumentSequence('nueva-factura', 'factura', 'facturas', 'factura', facturaForm.serie, facturaPreparacion, setFacturaForm),
    [activeView, catalogUserId, facturaForm.serie, facturaPreparacion, puntosData, reloadKey],
  );

  useEffect(
    () => syncDocumentSequence('nueva-nota-credito', 'nota-credito', 'notas de crédito', 'notaCredito', notaCreditoForm.serie, notaCreditoPreparacion, setNotaCreditoForm),
    [activeView, catalogUserId, notaCreditoForm.serie, notaCreditoPreparacion, puntosData, reloadKey],
  );

  useEffect(
    () => syncDocumentSequence('nueva-nota-debito', 'nota-debito', 'notas de débito', 'notaDebito', notaDebitoForm.serie, notaDebitoPreparacion, setNotaDebitoForm),
    [activeView, catalogUserId, notaDebitoForm.serie, notaDebitoPreparacion, puntosData, reloadKey],
  );

  useEffect(
    () => syncDocumentSequence('nueva-liquidacion-compra', 'liquidacion-compra', 'liquidaciones de compra', 'liquidacion', liquidacionForm.serie, liquidacionPreparacion, setLiquidacionForm),
    [activeView, catalogUserId, liquidacionForm.serie, liquidacionPreparacion, puntosData, reloadKey],
  );

  useEffect(
    () => syncDocumentSequence('nueva-guia-remision', 'guia-remision', 'guías de remisión', 'guia', guiaForm.serie, guiaPreparacion, setGuiaForm),
    [activeView, catalogUserId, guiaForm.serie, guiaPreparacion, puntosData, reloadKey],
  );

  useEffect(() => {
    if (activeView !== 'nueva-factura' || !catalogUserId) return;
    let mounted = true;
    const draftKey = `${INVOICE_DRAFT_KEY_PREFIX}.${catalogUserId}`;
    setInvoiceDraftReady(false);
    setInvoiceDraftSaved(false);
    SecureStore.getItemAsync(draftKey).then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          const draft = JSON.parse(raw) as { form?: NuevaFacturaFormState; cliente?: Cliente | null; lineas?: NuevaFacturaLinea[] };
          if (draft.form) setFacturaForm(draft.form);
          if (draft.cliente) setFacturaCliente(draft.cliente);
          if (draft.lineas) setFacturaLineas(draft.lineas);
          setInvoiceDraftSaved(Boolean(draft.form || draft.lineas?.length));
        } catch {
          SecureStore.deleteItemAsync(draftKey).catch(() => undefined);
        }
      }
      setInvoiceDraftReady(true);
    }).catch(() => {
      if (mounted) setInvoiceDraftReady(true);
    });
    return () => { mounted = false; };
  }, [activeView, catalogUserId]);

  useEffect(() => {
    if (activeView !== 'nueva-factura' || !catalogUserId || !invoiceDraftReady) return;
    const draftKey = `${INVOICE_DRAFT_KEY_PREFIX}.${catalogUserId}`;
    const timer = setTimeout(() => {
      const hasDraft = Boolean(facturaCliente || facturaLineas.length || facturaForm.clienteBusqueda || facturaForm.productoBusqueda || facturaForm.referencia || facturaForm.correoAdicional);
      if (!hasDraft) return;
      SecureStore.setItemAsync(draftKey, JSON.stringify({ form: facturaForm, cliente: facturaCliente, lineas: facturaLineas })).then(() => setInvoiceDraftSaved(true)).catch(() => undefined);
    }, 650);
    return () => clearTimeout(timer);
  }, [activeView, catalogUserId, facturaCliente, facturaForm, facturaLineas, invoiceDraftReady]);
  const globalSearchResults = useMemo<ExtractedGlobalSearchResult[]>(() => {
    const term = globalSearchQuery.trim().toLowerCase();
    if (!term) return [];
    const matches = (value: unknown) => String(value ?? '').toLowerCase().includes(term);
    const clientResults = clientes.filter((cliente) => [getClienteDisplayName(cliente), cliente.numeroidentificacion, cliente.correo].some(matches)).slice(0, 5).map((cliente) => ({
      id: `cliente-${cliente.codcliente ?? cliente.numeroidentificacion}`,
      title: getClienteDisplayName(cliente),
      subtitle: `${cliente.numeroidentificacion ?? 'Sin identificación'} · Cliente`,
      icon: 'account-outline' as const,
      view: 'clientes' as WorkspaceView,
    }));
    const productResults = productos.filter((producto) => [producto.nombre, producto.codigo, producto.tipo].some(matches)).slice(0, 5).map((producto) => ({
      id: `producto-${producto.codproducto ?? producto.codigo}`,
      title: producto.nombre || producto.codigo || 'Producto',
      subtitle: `${producto.codigo ?? 'Sin código'} · Producto`,
      icon: 'package-variant-closed' as const,
      view: 'productos' as WorkspaceView,
    }));
    const invoiceResults = facturasList.filter((factura) => [factura.numeroCompleto, factura.numfactura, factura.cliente, factura.identificacionCliente].some(matches)).slice(0, 5).map((factura) => ({
      id: `factura-${factura.codfactura ?? factura.numeroCompleto}`,
      title: factura.numeroCompleto ?? factura.numfactura ?? 'Factura',
      subtitle: `${factura.cliente ?? 'Cliente'} · Factura`,
      icon: 'file-document-outline' as const,
      view: 'mis-facturas' as WorkspaceView,
    }));
    return [...clientResults, ...productResults, ...invoiceResults].slice(0, 12);
  }, [clientes, facturasList, globalSearchQuery, productos]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setReloadKey((value) => value + 1);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (activeView !== 'bot') {
      void Speech.stop();
    }
  }, [activeView]);

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
          const serie = getSerieValue(data.series?.[0]) || data.caja?.serieFactura || '';
          const formaPago = data.formasPago?.[0]?.codigo == null ? '' : String(data.formasPago[0].codigo);
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
          const serie = getSerieValue(data.series?.[0]) || data.caja?.serieFactura || '';
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
          const serie = getSerieValue(data.series?.[0]) || getCajaSerieForDocument(data, 'liquidacion') || '';
          const formaPago = data.formasPago?.[0]?.codigo == null ? '' : String(data.formasPago[0].codigo);
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
          const serie = getSerieValue(data.series?.[0]) || getCajaSerieForDocument(data, 'notaDebito') || '';
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
          const serie = getSerieValue(data.series?.[0]) || getCajaSerieForDocument(data, 'notaCredito') || '';
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
    const views: WorkspaceView[] = ['cuentas-cobrar', 'estado-cuenta', 'comprar-documentos', 'recargas', 'centro-normativo'];

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
    if (!catalogUserId || !authorizedViews.has('recargas')) return;

    let mounted = true;
    getCompraDocumentosEstado(catalogUserId)
      .then((data) => {
        if (mounted) setCompraDocumentosEstado(data);
      })
      .catch(() => {
        if (mounted) setCompraDocumentosEstado(null);
      });

    return () => {
      mounted = false;
    };
  }, [authorizedViews, catalogUserId, reloadKey]);

  useEffect(() => {
    if (!canUseERubrica || activeView !== 'e-rubrica') return;

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
  }, [activeView, authorizedViews, canUseERubrica, reloadKey]);

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
       !(activeView === 'e-rubrica' ? canUseERubrica : authorizedViews.has(activeView))
    ) {
      setActiveView('no-autorizado');
    }
  }, [activeView, authorizedViews, canUseEfact, canUseERubrica, canUsePortal, loadingMenus]);

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
    const needsPuntos = authorizedViews.has('punto-emision') || ['nueva-factura', 'nueva-nota-credito', 'nueva-nota-debito', 'nueva-liquidacion-compra', 'nueva-guia-remision'].includes(activeView);
    if (!catalogUserId || !needsPuntos) return;

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
  }, [activeView, authorizedViews, catalogUserId, reloadKey]);

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

  const openNewProveedor = () => {
    setSelectedCliente(null);
    setClienteForm({ ...initialClienteForm, esProveedor: true });
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

  const openAccountPaymentFromStatement = (item: OperationalMobileItem) => {
    setSelectedOperationalItem(null);
    setOperationalForm({
      ...initialOperationalForm,
      codigo: getAccountStatementClientId(item),
      descripcion: item.title ? `Abono de ${item.title}` : 'Abono de cliente',
      observacion: item.title ? `Cliente: ${item.title}` : '',
    });
    setOperationalFormMode('create');
    setOperationalTabByView((current) => ({ ...current, 'cuentas-cobrar': 'Abonos' }));
    setSearch('');
    setDirectoryMessage(null);
    setActiveView('cuentas-cobrar');
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
    if (!producto.codproducto || !producto.descripcion?.trim()) {
      setDirectoryMessage({ type: 'error', text: 'El producto seleccionado no tiene datos completos.' });
      return;
    }
    setFacturaLineas((current) => [
      ...current,
      {
        producto,
        cantidad: '1',
        precio: String(producto.precioUnitario ?? 0),
        descuento: '0',
        tarifa: String(producto.tarifaIva ?? 0),
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
    setInvoiceDraftSaved(false);
    if (catalogUserId) SecureStore.deleteItemAsync(`${INVOICE_DRAFT_KEY_PREFIX}.${catalogUserId}`).catch(() => undefined);
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
        cliente: {
          ...facturaCliente,
          tipoidentificacion: facturaForm.tipoIdentificacion.trim() || facturaCliente.tipoidentificacion || null,
          tipoCliente: Number(facturaForm.tipoCliente) || facturaCliente.tipoCliente || null,
          oblgconta: facturaForm.obligadoContabilidad.trim() || facturaCliente.oblgconta || null,
          direccion: facturaForm.direccion.trim() || facturaCliente.direccion || null,
          celular: facturaForm.telefono.trim() || facturaCliente.celular || null,
          correo: facturaForm.correoPrincipal.trim() || facturaCliente.correo || null,
        },
        serie: facturaForm.serie,
        codemisor: getSerieCodemisorFromOptions(getDocumentSerieOptions(facturaPreparacion, puntosData, 'factura'), facturaForm.serie, facturaPreparacion),
        formaPago: facturaForm.formaPago,
        referencia: facturaForm.referencia,
        correos: facturaForm.correoAdicional ? [facturaForm.correoAdicional] : [],
        detalles: facturaLineas.map((linea) => ({
          producto: linea.producto,
          cantidad: Number(linea.cantidad.replace(',', '.')) || 0,
          precio: Number(linea.precio.replace(',', '.')) || 0,
          descuento: Number(linea.descuento.replace(',', '.')) || 0,
          tarifa: Number(linea.tarifa.replace(',', '.')) || 0,
          detalle: facturaForm.detalleLinea,
        })),
      });
      const sriEstado = result.sri?.estado?.toUpperCase();
      setDirectoryMessage({
        type: sriEstado === 'AUTORIZADO' ? 'success' : 'info',
        text: `${result.mensaje ?? 'Factura guardada.'} ${result.numeroComprobante ?? ''} ${result.sri?.mensaje ?? 'Enviada al SRI para validacion.'}`.trim(),
      });
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

  const selectNotaCreditoFactura = async (factura: FacturaListItem) => {
    if (!catalogUserId) return;
    const cliente = buildClienteFromFactura(factura);
    setNotaCreditoFactura(factura);
    setNotaCreditoCliente(cliente);
    setNotaCreditoFacturas([]);
    setNotaCreditoForm((current) => ({
      ...current,
      facturaBusqueda: factura.numeroCompleto ?? factura.numfactura ?? '',
      clienteBusqueda: getClienteDisplayName(cliente),
      correoPrincipal: getClienteEmail(cliente),
      tipoIdentificacion: String(cliente.tipoidentificacion ?? ''),
      numeroIdentificacion: getClienteIdentification(cliente),
      tipoCliente: String(cliente.tipoCliente ?? ''),
      obligadoContabilidad: cliente.oblgconta ?? '',
      direccion: cliente.direccion ?? '',
      telefono: cliente.celular || cliente.telefonoconvencional || '',
    }));

    try {
      const detalle = await getFacturaDetalle(catalogUserId, factura.codfactura);
      const facturaCompleta = mergeFacturaDetalle(factura, detalle.factura);
      const clienteCompleto = buildClienteFromFactura(facturaCompleta, detalle.cliente, detalle.factura);
      const detallesDisponibles = await getNotaCreditoDetallesDisponibles(catalogUserId, factura.codfactura);
      const detalleRows = detallesDisponibles.length ? detallesDisponibles : detalle.detalles ?? [];
      setNotaCreditoFactura(facturaCompleta);
      setNotaCreditoCliente(clienteCompleto);
      setNotaCreditoForm((current) => ({
        ...current,
        facturaBusqueda: facturaCompleta.numeroCompleto ?? facturaCompleta.numfactura ?? '',
        clienteBusqueda: getClienteDisplayName(clienteCompleto),
        correoPrincipal: getClienteEmail(clienteCompleto),
        tipoIdentificacion: String(clienteCompleto.tipoidentificacion ?? ''),
        numeroIdentificacion: getClienteIdentification(clienteCompleto),
        tipoCliente: String(clienteCompleto.tipoCliente ?? ''),
        obligadoContabilidad: clienteCompleto.oblgconta ?? '',
        direccion: clienteCompleto.direccion ?? '',
        telefono: clienteCompleto.celular || clienteCompleto.telefonoconvencional || '',
      }));
      if (detalleRows.length) {
        setNotaCreditoLineas(detalleRows.map((row) => detalleFacturaToNotaCreditoLinea(row as Record<string, unknown>)));
      } else if (notaCreditoLineas.length === 0) {
        setNotaCreditoLineas([{
          producto: {
            codproducto: 0,
            codprincipal: 'NC',
            descripcion: `Ajuste factura ${facturaCompleta.numeroCompleto ?? facturaCompleta.numfactura ?? ''}`.trim(),
            precioUnitario: Number(facturaCompleta.total ?? 0),
            tarifaIva: 0,
          },
          cantidad: '1',
          precio: String(Number(facturaCompleta.total ?? 0)),
          descuento: '0',
          tarifa: '0',
        }]);
      }
    } catch (error) {
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
      const text = error instanceof ApiError ? error.message : 'No se pudo cargar el detalle completo de la factura.';
      setDirectoryMessage({ type: 'info', text });
    }
  };

  const retryFacturaSri = async (factura: FacturaListItem) => {
    if (!catalogUserId) return;
    try {
      await reintentarFacturaSri(catalogUserId, factura.codfactura);
      setDirectoryMessage({ type: 'success', text: 'Factura reenviada al SRI correctamente.' });
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo reintentar la emision de la factura.';
      setDirectoryMessage({ type: 'error', text });
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
    const clienteParaGuardar = notaCreditoCliente ?? manualClienteFromForm(notaCreditoForm);
    const facturaParaGuardar = notaCreditoFactura ?? manualFacturaFromForm(notaCreditoForm);
    if (!notaCreditoCliente && !notaCreditoForm.clienteBusqueda.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Ingresa el cliente o selecciona una factura para cargarlo.' });
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
        cliente: clienteParaGuardar,
        facturaModificada: facturaParaGuardar,
        serie: notaCreditoForm.serie,
        codemisor: getSerieCodemisorFromOptions(getDocumentSerieOptions(notaCreditoPreparacion, puntosData, 'notaCredito'), notaCreditoForm.serie, notaCreditoPreparacion),
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
      const secNotaCredito = result.codNotaCredito;
      const sri = secNotaCredito ? await emitirNotaCredito(catalogUserId, secNotaCredito) : null;
      setDirectoryMessage({ type: sri?.estado?.toUpperCase() === 'AUTORIZADO' ? 'success' : 'info', text: `${result.mensaje ?? 'Nota de credito guardada.'} ${sri?.mensaje ?? 'Enviada al SRI para validacion.'}`.trim() });
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

  const emitNotaCreditoSri = async (nota: NotaCreditoListItem) => {
    if (!catalogUserId) return;
    try {
      await emitirNotaCredito(catalogUserId, nota.codNotaCredito);
      setDirectoryMessage({ type: 'success', text: 'Nota de credito enviada al SRI correctamente.' });
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo emitir la nota de credito.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const confirmAnularNotaCredito = (nota: NotaCreditoListItem) => {
    if (!catalogUserId) return;
    Alert.alert('Anular nota de credito', `Deseas anular ${nota.numeroNota ?? 'esta nota de credito'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Anular',
        style: 'destructive',
        onPress: async () => {
          try {
            await anularNotaCredito(catalogUserId, nota.codNotaCredito);
            setDirectoryMessage({ type: 'success', text: 'Nota de credito anulada correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo anular la nota de credito.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
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

  const selectNotaDebitoFactura = async (factura: FacturaListItem) => {
    if (!catalogUserId) return;
    const cliente = buildClienteFromFactura(factura);
    setNotaDebitoFactura(factura);
    setNotaDebitoCliente(cliente);
    setNotaDebitoFacturas([]);
    setNotaDebitoForm((current) => ({
      ...current,
      facturaBusqueda: factura.numeroCompleto ?? factura.numfactura ?? '',
      clienteBusqueda: getClienteDisplayName(cliente),
      correoPrincipal: getClienteEmail(cliente),
      tipoIdentificacion: String(cliente.tipoidentificacion ?? ''),
      numeroIdentificacion: getClienteIdentification(cliente),
      tipoCliente: String(cliente.tipoCliente ?? ''),
      obligadoContabilidad: cliente.oblgconta ?? '',
      direccion: cliente.direccion ?? '',
      telefono: cliente.celular || cliente.telefonoconvencional || '',
    }));

    try {
      const detalle = await getFacturaDetalle(catalogUserId, factura.codfactura);
      const facturaCompleta = mergeFacturaDetalle(factura, detalle.factura);
      const clienteCompleto = buildClienteFromFactura(facturaCompleta, detalle.cliente, detalle.factura);
      const detalleRows = await getNotaDebitoDetallesFactura(catalogUserId, factura.codfactura);
      setNotaDebitoFactura(facturaCompleta);
      setNotaDebitoCliente(clienteCompleto);
      setNotaDebitoForm((current) => ({
        ...current,
        facturaBusqueda: facturaCompleta.numeroCompleto ?? facturaCompleta.numfactura ?? '',
        clienteBusqueda: getClienteDisplayName(clienteCompleto),
        correoPrincipal: getClienteEmail(clienteCompleto),
        tipoIdentificacion: String(clienteCompleto.tipoidentificacion ?? ''),
        numeroIdentificacion: getClienteIdentification(clienteCompleto),
        tipoCliente: String(clienteCompleto.tipoCliente ?? ''),
        obligadoContabilidad: clienteCompleto.oblgconta ?? '',
        direccion: clienteCompleto.direccion ?? '',
        telefono: clienteCompleto.celular || clienteCompleto.telefonoconvencional || '',
      }));
      if (detalleRows.length) {
        setNotaDebitoLineas(detalleRows.map((row) => ({
          descripcion: row.descripcion,
          precio: String(row.precio),
          tarifa: String(row.tarifa),
          impuestoIce: '',
          valorIce: String(row.valorIce ?? 0),
        })));
      } else if (detalle.detalles?.length) {
        setNotaDebitoLineas(detalle.detalles.map((row) => detalleFacturaToNotaDebitoLinea(row)));
      }
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo cargar el detalle completo de la factura.';
      setDirectoryMessage({ type: 'info', text });
    }
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
    const clienteParaGuardar = notaDebitoCliente ?? manualClienteFromForm(notaDebitoForm);
    const facturaParaGuardar = notaDebitoFactura ?? manualFacturaFromForm(notaDebitoForm);
    if (!notaDebitoCliente && !notaDebitoForm.clienteBusqueda.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Ingresa el cliente o selecciona una factura para cargarlo.' });
      return;
    }

    setSavingNotaDebito(true);
    setDirectoryMessage(null);
    try {
      const result = await guardarNotaDebito({
        idUsuario: catalogUserId,
        cliente: clienteParaGuardar,
        facturaModificada: facturaParaGuardar,
        serie: notaDebitoForm.serie,
        codemisor: getSerieCodemisorFromOptions(getDocumentSerieOptions(notaDebitoPreparacion, puntosData, 'notaDebito'), notaDebitoForm.serie, notaDebitoPreparacion),
        correos: notaDebitoForm.correoAdicional ? [notaDebitoForm.correoAdicional] : [],
        detalles: notaDebitoLineas.map((linea) => ({
          descripcion: linea.descripcion,
          precio: Number(linea.precio.replace(',', '.')) || 0,
          tarifa: Number(linea.tarifa.replace(',', '.')) || 0,
          impuestoIce: linea.impuestoIce,
          valorIce: Number(linea.valorIce.replace(',', '.')) || 0,
        })),
      });
      const secNotaDebito = result.codNotaDebito;
      const sri = secNotaDebito ? await emitirNotaDebito(catalogUserId, secNotaDebito) : null;
      setDirectoryMessage({ type: sri?.estado?.toUpperCase() === 'AUTORIZADO' ? 'success' : 'info', text: `${result.mensaje ?? 'Nota de debito guardada.'} ${sri?.mensaje ?? 'Enviada al SRI para validacion.'}`.trim() });
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

  const emitNotaDebitoSri = async (nota: NotaDebitoListItem) => {
    if (!catalogUserId) return;
    try {
      await emitirNotaDebito(catalogUserId, nota.codNotaDebito);
      setDirectoryMessage({ type: 'success', text: 'Nota de debito enviada al SRI correctamente.' });
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo emitir la nota de debito.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const confirmAnularNotaDebito = (nota: NotaDebitoListItem) => {
    if (!catalogUserId) return;
    Alert.alert('Anular nota de debito', `Deseas anular ${nota.numeroNota ?? 'esta nota de debito'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Anular',
        style: 'destructive',
        onPress: async () => {
          try {
            await anularNotaDebito(catalogUserId, nota.codNotaDebito);
            setDirectoryMessage({ type: 'success', text: 'Nota de debito anulada correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo anular la nota de debito.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
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
      numeroIdentificacion: getClienteIdentification(proveedor),
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
        numero: liquidacionForm.numeroFactura,
        codemisor: getSerieCodemisorFromOptions(getDocumentSerieOptions(liquidacionPreparacion, puntosData, 'liquidacion'), liquidacionForm.serie, liquidacionPreparacion),
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
      const codLiquidacion = result.codLiquidacion;
      const sri = codLiquidacion ? await emitirLiquidacionCompra(catalogUserId, codLiquidacion) : null;
      setDirectoryMessage({ type: sri?.estado?.toUpperCase() === 'AUTORIZADO' ? 'success' : 'info', text: `${result.mensaje ?? 'Liquidacion guardada.'} ${sri?.mensaje ?? 'Enviada al SRI para validacion.'}`.trim() });
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

  const emitLiquidacionSri = async (liquidacion: LiquidacionCompraListItem) => {
    if (!catalogUserId) return;
    try {
      await emitirLiquidacionCompra(catalogUserId, liquidacion.codLiquidacion);
      setDirectoryMessage({ type: 'success', text: 'Liquidacion enviada al SRI correctamente.' });
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo emitir la liquidacion.';
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
    setGuiaForm((current) => ({ ...current, clienteBusquedaGuia: getClienteDisplayName(cliente), numeroIdentificacion: getClienteIdentification(cliente) }));
  };

  const selectGuiaFactura = async (factura: FacturaListItem) => {
    if (!catalogUserId) return;
    setGuiaFactura(factura);
    setGuiaFacturas([]);
    setGuiaForm((current) => ({ ...current, facturaBusqueda: factura.numeroCompleto ?? factura.numfactura ?? '', clienteBusquedaGuia: factura.cliente ?? current.clienteBusquedaGuia }));
    if (!guiaCliente && factura.cliente) {
      setGuiaCliente(buildClienteFromFactura(factura));
    }

    try {
      const detalle = await getFacturaDetalle(catalogUserId, factura.codfactura);
      const facturaCompleta = mergeFacturaDetalle(factura, detalle.factura);
      const cliente = buildClienteFromFactura(facturaCompleta, detalle.cliente, detalle.factura);
      setGuiaFactura(facturaCompleta);
      setGuiaCliente(cliente);
      setGuiaForm((current) => ({
        ...current,
        facturaBusqueda: facturaCompleta.numeroCompleto ?? facturaCompleta.numfactura ?? '',
        clienteBusquedaGuia: getClienteDisplayName(cliente),
        numeroIdentificacion: getClienteIdentification(cliente),
      }));
      if (detalle.detalles?.length) {
        setGuiaDetalles(detalle.detalles.map((row) => detalleFacturaToGuiaDetalle(row)));
      }
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo cargar el detalle completo de la factura.';
      setDirectoryMessage({ type: 'info', text });
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

  const applySequenceNumberToForm = (form: SequencePromptState['form'], proximo: string) => {
    if (form === 'factura') setFacturaForm((current) => ({ ...current, numeroFactura: proximo }));
    if (form === 'notaCredito') setNotaCreditoForm((current) => ({ ...current, numeroFactura: proximo }));
    if (form === 'notaDebito') setNotaDebitoForm((current) => ({ ...current, numeroFactura: proximo }));
    if (form === 'liquidacion') setLiquidacionForm((current) => ({ ...current, numeroFactura: proximo }));
    if (form === 'guia') setGuiaForm((current) => ({ ...current, numeroFactura: proximo }));
  };

  const saveInitialSequence = async (input: { habiaGenerado: boolean; secuenciaAnterior: string }) => {
    if (!catalogUserId || !sequencePrompt) return;

    setSequencePromptSaving(true);
    setSequencePromptMessage(null);
    try {
      const response = await savePuntoEmisionSecuenciaInicial({
        userId: catalogUserId,
        documento: sequencePrompt.documento,
        serie: sequencePrompt.serie,
        codemisor: sequencePrompt.codemisor,
        habiaGenerado: input.habiaGenerado,
        secuenciaAnterior: input.secuenciaAnterior,
      });
      applySequenceNumberToForm(sequencePrompt.form, response.proximo?.trim() ?? '');
      setSequencePrompt(null);
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar la secuencia inicial.';
      setSequencePromptMessage(text);
    } finally {
      setSequencePromptSaving(false);
    }
  };

  const saveNuevaGuia = async () => {
    if (!catalogUserId) return;
    if (!guiaTransportista) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona un transportista para la guia.' });
      return;
    }
    if (!guiaCliente && !guiaFactura) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona un destinatario o vincula una factura para cargarlo.' });
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
        codemisor: getSerieCodemisorFromOptions(getDocumentSerieOptions(guiaPreparacion, puntosData, 'guia'), guiaForm.serie, guiaPreparacion),
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
      const secGuia = result.codGuia;
      const sri = secGuia ? await emitirGuiaRemision(catalogUserId, secGuia) : null;
      setDirectoryMessage({ type: sri?.estado?.toUpperCase() === 'AUTORIZADO' ? 'success' : 'info', text: `${result.mensaje ?? 'Guia de remision guardada.'} ${sri?.mensaje ?? 'Enviada al SRI para validacion.'}`.trim() });
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

  const emitGuiaSri = async (guia: GuiaRemisionListItem) => {
    if (!catalogUserId) return;
    try {
      await emitirGuiaRemision(catalogUserId, guia.codGuia);
      setDirectoryMessage({ type: 'success', text: 'Guia de remision enviada al SRI correctamente.' });
      setReloadKey((value) => value + 1);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo emitir la guia de remision.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const confirmAnularGuia = (guia: GuiaRemisionListItem) => {
    if (!catalogUserId) return;
    Alert.alert('Anular guia de remision', `Deseas anular ${guia.numero ?? 'esta guia de remision'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Anular',
        style: 'destructive',
        onPress: async () => {
          try {
            await anularGuiaRemision(catalogUserId, guia.codGuia);
            setDirectoryMessage({ type: 'success', text: 'Guia de remision anulada correctamente.' });
            setReloadKey((value) => value + 1);
          } catch (error) {
            const text = error instanceof ApiError ? error.message : 'No se pudo anular la guia de remision.';
            setDirectoryMessage({ type: 'error', text });
          }
        },
      },
    ]);
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
         'e-rubrica',
        'perfil',
        'punto-emision',
        'cuentas-cobrar',
        'estado-cuenta',
        'comprar-documentos',
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

    if (view === 'e-rubrica' && canUseERubrica) {
      setActiveView(view);
      return;
    }

    if (authorizedViews.has(view)) {
      setActiveView(view);
      return;
    }

    setActiveView('no-autorizado');
  };

  const dismissNotificationLocal = (notificationId: string) => {
    setDismissedNotificationIds((current) => {
      const next = new Set(current);
      next.add(notificationId);
      return next;
    });
  };

  const dismissNotification = async (notificationId: string) => {
    if (catalogUserId) {
      try {
        await dismissNotificacion(catalogUserId, notificationId);
      } catch {}
    }
    dismissNotificationLocal(notificationId);
  };

  const clearVisibleNotifications = async () => {
    if (catalogUserId) {
      try {
        await clearNotificaciones(catalogUserId);
      } catch {}
    }
    setDismissedNotificationIds((current) => {
      const next = new Set(current);
      visibleNotifications.forEach((notification) => next.add(notification.id));
      return next;
    });
  };

  const openNotificationTarget = (notification: NotificacionItem) => {
    const targetView = getNotificationView(notification);
    dismissNotificationLocal(notification.id);
    setNotificationsOpen(false);
    if (targetView) openView(targetView);
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
  const documentPlan = getDocumentPlanStatus(compraDocumentosEstado);
  const firmaSummary = getFirmaSummary(emisores, firmaEstados);
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
  const efactDrawerMenu: DrawerMenuNode[] = [
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
      ],
    },
  ];
  const openERubricaTab = (tab: ERubricaTab) => {
    setErubricaTabRequest(tab);
    openView('e-rubrica');
  };

  const openPdfPreview = async (loader: () => Promise<{ url: string }>, fileName: string) => {
    try {
      const response = await loader();
      const url = response.url?.startsWith('http') ? response.url : `${API_BASE_URL.replace(/\/$/, '')}/${response.url.replace(/^\//, '')}`;
      const target = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}preview-${Date.now()}-${fileName.replace(/[^a-z0-9._-]/gi, '-')}`;
      const download = await FileSystem.downloadAsync(url, target);
      setPdfPreview({ uri: download.uri, name: fileName });
    } catch (error) {
      setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo cargar la previsualización del PDF.' });
    }
  };
  const drawerMenu: DrawerMenuNode[] = activeView === 'e-rubrica' ? [
    { key: 'erubrica-inicio', label: 'Inicio', view: 'e-rubrica', disabled: !canUseERubrica },
    { key: 'erubrica-solicitudes', label: 'Solicitudes', action: () => openERubricaTab('solicitudes') },
    { key: 'erubrica-firmar', label: 'Firmar PDF', action: () => openERubricaTab('firmar') },
    { key: 'erubrica-firmas', label: 'Mis firmas', action: () => openERubricaTab('firmas') },
    { key: 'erubrica-validar', label: 'Validar documento', action: () => openERubricaTab('validar') },
    { key: 'erubrica-renovacion', label: 'Renovación', action: () => openERubricaTab('renovacion') },
    { key: 'erubrica-catalogos', label: 'Productos y saldo', action: () => openERubricaTab('catalogos') },
    { key: 'erubrica-proveedor', label: 'Solicitudes proveedor', action: () => openERubricaTab('proveedor') },
    { key: 'erubrica-soporte', label: 'Soporte', action: () => openERubricaTab('soporte') },
    { key: 'erubrica-volver', label: 'Volver a servicios', action: () => openView('portal'), },
  ] : efactDrawerMenu;
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
            if (node.action && !disabled) node.action();
            else if (node.view && !disabled) openView(node.view);
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <View style={styles.workspaceChrome}>
        <GlobalWorkspaceHeader
          title={getWorkspaceTitle(activeView)}
          subtitle={activeView === 'firma' ? 'Gestiona tu firma y certificados' : activeView === 'portal' ? 'Selecciona el modulo al que deseas ingresar' : 'Resumen y accesos de tu sistema'}
          unreadNotifications={unreadNotifications}
          documentPlan={documentPlan}
          firmaSummary={firmaSummary}
          onSearch={() => { setGlobalSearchQuery(''); setGlobalSearchOpen(true); }}
          onNotifications={() => setNotificationsOpen(true)}
          onMenu={() => setMenuOpen(true)}
          onDocuments={() => openView('comprar-documentos')}
          onFirma={() => openView('firma')}
        />

        <View style={styles.workspaceBodyFrame}>
        <ScrollView
          style={styles.workspaceBodyScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.workspaceCanvasWithBottomNav, { paddingBottom: 88 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          nestedScrollEnabled
          automaticallyAdjustKeyboardInsets={activeView !== 'bot'}
          horizontal={false}
          bounces={false}
          alwaysBounceHorizontal={false}
          directionalLockEnabled
          overScrollMode="never"
          refreshControl={<RefreshControl refreshing={loadingMenus} onRefresh={() => setReloadKey((value) => value + 1)} tintColor={EFACT_THEME.colors.primary} colors={[EFACT_THEME.colors.primary]} />}
        >
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
            <View style={styles.portalWebHero}>
              <View style={styles.portalWebTitleRow}>
                <View style={styles.portalWebLogoShell}>
                  <Image source={require('./assets/logo-numerica.png')} style={styles.portalWebLogo} />
                </View>
                <View style={styles.portalWebTitleCopy}>
                  <Text style={styles.portalWebTitle}>Servicios Disponibles</Text>
                  <Text style={styles.portalWebSubtitle}>Selecciona el modulo al que deseas ingresar</Text>
                </View>
              </View>
              <View style={styles.portalWebSessionCard}>
                <Image source={{ uri: resolveImageUrl(portalAvatarUrl) }} style={styles.portalWebSessionAvatar} />
                <View style={styles.portalWebSessionCopy}>
                  <Text style={styles.portalWebSessionName}>{portalFirstName}</Text>
                  <View style={styles.portalWebSessionStatusRow}>
                    <View style={styles.portalWebStatusDot} />
                    <Text style={styles.portalWebSessionStatus}>Sesion activa</Text>
                  </View>
                </View>
              </View>
              <View style={styles.portalWelcomePanel}>
                <View style={styles.portalWelcomeCopy}>
                  <Text style={styles.portalWelcomeEyebrow}>Numerica Software</Text>
                  <Text style={styles.portalWelcomeTitle}>Bienvenido, {portalFirstName}</Text>
                  <Text style={styles.portalWelcomeText}>Tus servicios activos estan listos para usarse</Text>
                </View>
                <View style={styles.portalWelcomePills}>
                  <PortalStatusPill icon="check-decagram-outline" label="Disponible" />
                  <PortalStatusPill icon="pulse" label="Actual" />
                  <PortalStatusPill icon="shield-check-outline" label="Suscripcion activa" />
                </View>
              </View>
            </View>

            <View style={styles.portalServiceGrid}>
              <PortalServiceCard
                title="E-FACT"
                description="Facturacion electronica movil segun menus asignados."
                enabled={canUseEfact}
                onPress={() => openView('dashboard')}
                index={0}
              />
              {services
                .filter((service) => {
                  const normalized = normalizeText(`${service.codigo ?? ''} ${service.nombre ?? ''}`);
                  return !normalized.includes('fact') && !normalized.includes('backoffice');
                })
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
                    enabled={canUseERubrica}
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
            requestedTab={erubricaTabRequest}
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
               <EfactBotScreen
                 userName={portalFirstName}
                 messages={botMessages}
                 setMessages={setBotMessages}
                 draft={botDraft}
                 setDraft={setBotDraft}
                 feedbackByMessage={botFeedbackByMessage}
                 setFeedbackByMessage={setBotFeedbackByMessage}
               />
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
              <PuntosEmisionScreen
                data={puntosData}
                loading={loadingPuntos}
                message={directoryMessage}
                search={search}
                form={puntoForm}
                formMode={puntoFormMode}
                saving={savingPunto}
                onSearchChange={setSearch}
                onCreate={openNewPunto}
                onCancelForm={closePuntoForm}
                onChangeForm={updatePuntoForm}
                onResetForm={() => setPuntoForm(selectedPunto ? puntoToForm(selectedPunto) : { puntoEmision: getNextPuntoCode(puntosData?.cajas ?? []) })}
                onSaveForm={savePunto}
                onEdit={openEditPunto}
                onDelete={confirmDeletePunto}
                onMakePrincipal={makePuntoPrincipal}
              />
            ) : null}

            {activeView === 'nueva-factura' ? (
              <NuevaFacturaMobileScreen
                form={facturaForm}
                preparacion={facturaPreparacion}
                puntosData={puntosData}
                cliente={facturaCliente}
                clientes={facturaClientes}
                productos={facturaProductos}
                lineas={facturaLineas}
                loading={loadingFacturas}
                saving={savingFactura}
                message={directoryMessage}
                draftSaved={invoiceDraftSaved}
                onChange={updateFacturaForm}
                onSearchClientes={searchFacturaClientes}
                onSelectCliente={(cliente) => {
                  setFacturaCliente(cliente);
                  setFacturaClientes([]);
                  setFacturaForm((current) => ({
                    ...current,
                    clienteBusqueda: getClienteDisplayName(cliente),
                    tipoIdentificacion: String(cliente.tipoidentificacion ?? ''),
                    numeroIdentificacion: getClienteIdentification(cliente),
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
                onPdf={(factura) => catalogUserId && openPdfPreview(() => getFacturaPdf(catalogUserId, factura.codfactura), `${factura.numeroCompleto ?? 'factura'}.pdf`)}
                onXml={(factura) => catalogUserId && openFacturaAsset(() => getFacturaXml(catalogUserId, factura.codfactura))}
                onEmail={sendFacturaCorreo}
                onRetrySri={retryFacturaSri}
                onAnular={confirmAnularFactura}
              />
            ) : null}

            {activeView === 'nueva-nota-credito' ? (
              <NuevaNotaCreditoMobileScreen
                form={notaCreditoForm}
                preparacion={notaCreditoPreparacion}
                puntosData={puntosData}
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
                onHistory={() => openView('mis-notas-credito')}
                onSave={saveNuevaNotaCredito}
              />
            ) : null}

            {activeView === 'mis-notas-credito' ? (
              <MisNotasCreditoMobileScreen
                notas={notasCreditoList}
                loading={loadingNotasCredito}
                message={directoryMessage}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onPdf={(nota) => catalogUserId && openPdfPreview(() => getNotaCreditoPdf(catalogUserId, nota.codNotaCredito), 'nota-credito.pdf')}
                onXml={(nota) => catalogUserId && openFacturaAsset(() => getNotaCreditoXml(catalogUserId, nota.codNotaCredito))}
                onEmail={sendNotaCreditoCorreo}
                onEmitir={emitNotaCreditoSri}
                onAnular={confirmAnularNotaCredito}
              />
            ) : null}

            {activeView === 'nueva-nota-debito' ? (
              <NuevaNotaDebitoMobileScreen
                form={notaDebitoForm}
                preparacion={notaDebitoPreparacion}
                puntosData={puntosData}
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
                onHistory={() => openView('mis-notas-debito')}
                onSave={saveNuevaNotaDebito}
              />
            ) : null}

            {activeView === 'mis-notas-debito' ? (
              <MisNotasDebitoMobileScreen
                notas={notasDebitoList}
                loading={loadingNotasDebito}
                message={directoryMessage}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onPdf={(nota) => catalogUserId && openPdfPreview(() => getNotaDebitoPdf(catalogUserId, nota.codNotaDebito), 'nota-debito.pdf')}
                onXml={(nota) => catalogUserId && openFacturaAsset(() => getNotaDebitoXml(catalogUserId, nota.codNotaDebito))}
                onEmail={sendNotaDebitoCorreo}
                onEmitir={emitNotaDebitoSri}
                onAnular={confirmAnularNotaDebito}
              />
            ) : null}

            {activeView === 'nueva-liquidacion-compra' ? (
              <NuevaLiquidacionCompraMobileScreen
                form={liquidacionForm}
                preparacion={liquidacionPreparacion}
                puntosData={puntosData}
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
                onHistory={() => openView('mis-liquidaciones-compra')}
                onSave={saveNuevaLiquidacion}
              />
            ) : null}

            {activeView === 'mis-liquidaciones-compra' ? (
              <MisLiquidacionesCompraMobileScreen
                liquidaciones={liquidacionesList}
                loading={loadingLiquidaciones}
                message={directoryMessage}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onPdf={(liquidacion) => catalogUserId && openPdfPreview(() => getLiquidacionCompraPdf(catalogUserId, liquidacion.codLiquidacion), 'liquidacion-compra.pdf')}
                onXml={(liquidacion) => catalogUserId && openFacturaAsset(() => getLiquidacionCompraXml(catalogUserId, liquidacion.codLiquidacion))}
                onEmail={sendLiquidacionCorreo}
                onEmitir={emitLiquidacionSri}
              />
            ) : null}

            {activeView === 'nueva-guia-remision' ? (
              <NuevaGuiaRemisionMobileScreen
                form={guiaForm}
                preparacion={guiaPreparacion}
                puntosData={puntosData}
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
                onNewTransportista={openNewProveedor}
                onSearchClientes={searchGuiaClientes}
                onSelectCliente={selectGuiaCliente}
                onSearchFacturas={searchGuiaFacturas}
                onSelectFactura={selectGuiaFactura}
                onSearchProductos={searchGuiaProductos}
                onAddProducto={addGuiaProducto}
                onUpdateDetalle={updateGuiaDetalle}
                onRemoveDetalle={removeGuiaDetalle}
                onClear={clearGuiaForm}
                onHistory={() => openView('mis-guias-remision')}
                onSave={saveNuevaGuia}
              />
            ) : null}

            {activeView === 'mis-guias-remision' ? (
              <MisGuiasRemisionMobileScreen
                guias={guiasList}
                loading={loadingGuias}
                message={directoryMessage}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onPdf={(guia) => catalogUserId && openPdfPreview(() => getGuiaRemisionPdf(catalogUserId, guia.codGuia), 'guia-remision.pdf')}
                onXml={(guia) => catalogUserId && openFacturaAsset(() => getGuiaRemisionXml(catalogUserId, guia.codGuia))}
                onEmail={sendGuiaCorreo}
                onEmitir={emitGuiaSri}
                onAnular={confirmAnularGuia}
              />
            ) : null}

            {activeView === 'retenciones' ? (
              <MisRetencionesMobileScreen
                retenciones={retencionesList}
                loading={loadingRetenciones}
                message={directoryMessage}
                onRefresh={() => setReloadKey((value) => value + 1)}
                onPdf={(retencion) => catalogUserId && openPdfPreview(() => getRetencionPdf(catalogUserId, retencion.codRetencion), 'retencion.pdf')}
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
                onRegisterPayment={openAccountPaymentFromStatement}
                />
              )
            ) : null}

          </View>
        ) : null}
        </ScreenTransition>

        </ScrollView>
        </View>
      </View>
      </KeyboardAvoidingView>
      <PortalBottomNav
        bottomInset={insets.bottom}
        activeView={activeView}
        onHome={() => openView('dashboard')}
        onServices={() => canUsePortal ? openView('portal') : setMenuOpen(true)}
        onBot={() => openView('firma')}
        onNewInvoice={() => openView('nueva-factura')}
        onProfile={() => openView('perfil')}
      />
      <InitialSequenceModal
        visible={Boolean(sequencePrompt)}
        documentLabel={sequencePrompt?.documentLabel ?? 'documentos'}
        serie={sequencePrompt?.serie ?? ''}
        saving={sequencePromptSaving}
        message={sequencePromptMessage}
        onClose={() => {
          setSequencePrompt(null);
          setSequencePromptMessage(null);
        }}
        onSave={saveInitialSequence}
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
                <Text style={styles.notificationsSubtitle}>{loadingNotifications ? 'Cargando actividad...' : `${visibleNotifications.length} registros del sistema`}</Text>
              </View>
              <View style={styles.notificationsHeaderActions}>
                {visibleNotifications.length > 0 ? (
                  <Pressable style={styles.notificationsClearButton} onPress={clearVisibleNotifications}>
                    <Text style={styles.notificationsClearText}>Borrar todo</Text>
                  </Pressable>
                ) : null}
                <Pressable style={styles.menuCloseButton} onPress={() => setNotificationsOpen(false)}>
                  <Text style={styles.menuCloseText}>×</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.notificationsList}>
              {notificationsMessage ? <MessageBox message={notificationsMessage} /> : null}
              {loadingNotifications ? (
                <View style={styles.notificationsLoading}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.notificationText}>Cargando notificaciones...</Text>
                </View>
              ) : null}
              {!loadingNotifications && !visibleNotifications.length && !notificationsMessage ? (
                <View style={styles.notificationEmpty}>
                  <Text style={styles.notificationTitle}>Sin notificaciones</Text>
                  <Text style={styles.notificationText}>No hay actividad pendiente para mostrar.</Text>
                </View>
              ) : null}
              {!loadingNotifications ? visibleNotifications.map((notification) => {
                const tone = getNotificationTone(notification);
                const targetView = getNotificationView(notification);
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
                    <View style={styles.notificationActions}>
                      {targetView ? (
                        <Pressable style={styles.notificationActionPrimary} onPress={() => openNotificationTarget(notification)}>
                          <Text style={styles.notificationActionPrimaryText}>Ir</Text>
                        </Pressable>
                      ) : null}
                      <Pressable style={styles.notificationActionGhost} onPress={() => dismissNotification(notification.id)}>
                        <Text style={styles.notificationActionGhostText}>Descartar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
              }) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <ExtractedGlobalSearchModal
        visible={globalSearchOpen}
        query={globalSearchQuery}
        results={globalSearchResults}
        onChangeQuery={setGlobalSearchQuery}
        onClose={() => setGlobalSearchOpen(false)}
        onOpenResult={(result) => { setGlobalSearchOpen(false); openView(result.view as WorkspaceView); }}
      />
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
      <Modal visible={Boolean(pdfPreview)} animationType="slide" transparent onRequestClose={() => setPdfPreview(null)}>
        <View style={styles.pdfPreviewOverlay}>
          <View style={styles.pdfPreviewPanel}>
            <View style={styles.pdfPreviewHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pdfPreviewEyebrow}>PREVISUALIZACIÓN</Text>
                <Text style={styles.pdfPreviewTitle} numberOfLines={1}>{pdfPreview?.name ?? 'Documento PDF'}</Text>
              </View>
              <Pressable style={styles.menuCloseButton} onPress={() => setPdfPreview(null)}><Text style={styles.menuCloseText}>×</Text></Pressable>
            </View>
            {pdfPreview ? <PdfDocumentPreview uri={pdfPreview.uri} /> : null}
            <View style={styles.pdfPreviewActions}>
              <SecondaryButton label="Cerrar" onPress={() => setPdfPreview(null)} />
              <PrimaryButton label="Compartir PDF" loading={false} onPress={async () => {
                if (!pdfPreview || !(await Sharing.isAvailableAsync())) return;
                await Sharing.shareAsync(pdfPreview.uri, { mimeType: 'application/pdf', dialogTitle: 'Compartir PDF' });
              }} />
            </View>
          </View>
        </View>
      </Modal>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

function getWorkspaceTitle(view: WorkspaceView) {
  const titles: Partial<Record<WorkspaceView, string>> = {
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
    configuracion: 'Configuracion',
     soporte: 'Soporte',
     bot: 'Númi Bot',
     tutoriales: 'Tutoriales',
    'centro-normativo': 'Centro normativo',
    'no-autorizado': 'No autorizado',
  };

  return titles[view] ?? 'No autorizado';
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

function getFacturaProductoKey(producto: FacturaProducto, index: number, prefix = 'factura-producto') {
  const identity = producto.codproducto || producto.codprincipal || producto.descripcion || 'sin-codigo';
  return `${prefix}-${String(identity).trim().replace(/\s+/g, '-').slice(0, 80)}-${index}`;
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

function textValue(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function pickRecordValue(row: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!row) return undefined;
  for (const key of keys) {
    if (row[key] !== null && row[key] !== undefined) return row[key];
  }
  const normalized = keys.map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, ''));
  return Object.entries(row).find(([key, value]) => value !== null && value !== undefined && normalized.includes(key.toLowerCase().replace(/[^a-z0-9]/g, '')))?.[1];
}

function buildClienteFromFactura(factura: FacturaListItem, cliente?: Cliente | null, facturaRow?: Record<string, unknown> | null): Cliente {
  const clienteRow = isPlainRecord(cliente) ? cliente as Cliente & Record<string, unknown> : null;
  return {
    ...(cliente ?? {}),
    codcliente: numberValue(cliente?.codcliente ?? pickRecordValue(clienteRow, ['codcliente', 'Codcliente', 'CodCliente']) ?? pickRecordValue(facturaRow, ['codclientes', 'Codclientes', 'codClientes', 'CodClientes'])),
    nombrerazonsocial: (cliente?.nombrerazonsocial ?? textValue(pickRecordValue(clienteRow, ['nombrerazonsocial', 'NombreRazonSocial', 'razonSocial', 'RazonSocial']) ?? factura.cliente)) || null,
    numeroidentificacion: (cliente?.numeroidentificacion ?? textValue(pickRecordValue(clienteRow, ['numeroidentificacion', 'NumeroIdentificacion', 'ruc', 'Ruc']) ?? factura.identificacionCliente)) || null,
    tipoidentificacion: (cliente?.tipoidentificacion ?? textValue(pickRecordValue(clienteRow, ['tipoidentificacion', 'Tipoidentificacion', 'tipoIdentificacion', 'TipoIdentificacion']))) || null,
    direccion: (cliente?.direccion ?? textValue(pickRecordValue(clienteRow, ['direccion', 'Direccion']))) || null,
    celular: (cliente?.celular ?? textValue(pickRecordValue(clienteRow, ['celular', 'Celular', 'telefono', 'Telefono']))) || null,
    telefonoconvencional: (cliente?.telefonoconvencional ?? textValue(pickRecordValue(clienteRow, ['telefonoconvencional', 'TelefonoConvencional']))) || null,
    correo: (cliente?.correo ?? textValue(pickRecordValue(clienteRow, ['correo', 'Correo', 'email', 'Email']))) || null,
    tipoCliente: cliente?.tipoCliente ?? numberValue(pickRecordValue(clienteRow, ['tipoCliente', 'TipoCliente'])),
    oblgconta: (cliente?.oblgconta ?? textValue(pickRecordValue(clienteRow, ['oblgconta', 'Oblgconta', 'obligadoContabilidad', 'ObligadoContabilidad']))) || null,
  };
}

function mergeFacturaDetalle(factura: FacturaListItem, facturaRow?: Record<string, unknown> | null): FacturaListItem {
  return {
    ...factura,
    codfactura: numberValue(pickRecordValue(facturaRow, ['codfactura', 'Codfactura', 'CodFactura']) ?? factura.codfactura) || factura.codfactura,
    numfactura: textValue(pickRecordValue(facturaRow, ['numfactura', 'Numfactura', 'NumFactura']) ?? factura.numfactura) || factura.numfactura,
    serie: textValue(pickRecordValue(facturaRow, ['serie', 'Serie']) ?? factura.serie) || factura.serie,
    fechaEmision: textValue(pickRecordValue(facturaRow, ['fechaentrega', 'Fechaentrega', 'fechaEntrega', 'FechaEntrega', 'fechaEmision', 'FechaEmision']) ?? factura.fechaEmision) || factura.fechaEmision,
    total: numberValue(pickRecordValue(facturaRow, ['valortotal', 'Valortotal', 'valorTotal', 'ValorTotal']) ?? factura.total) || factura.total,
  };
}

function detalleFacturaToGuiaDetalle(row: Record<string, unknown>): GuiaRemisionDetalle {
  return {
    producto: {
      codproducto: numberValue(pickRecordValue(row, ['codproducto', 'Codproducto', 'codProducto', 'CodProducto'])),
      codprincipal: textValue(pickRecordValue(row, ['codprincipal', 'Codprincipal', 'codPrincipal', 'CodPrincipal'])) || null,
      codauxiliar: textValue(pickRecordValue(row, ['codauxiliar', 'Codauxiliar', 'codAuxiliar', 'CodAuxiliar'])) || null,
      descripcion: textValue(pickRecordValue(row, ['descripproducto', 'Descripproducto', 'descripcion', 'Descripcion'])) || null,
    },
    cantidad: String(numberValue(pickRecordValue(row, ['cantproducto', 'Cantproducto', 'cantidad', 'Cantidad'])) || 1),
  };
}

function detalleFacturaToNotaCreditoLinea(row: Record<string, unknown>): NuevaFacturaLinea {
  return {
    producto: {
      codproducto: numberValue(pickRecordValue(row, ['codproducto', 'Codproducto', 'codProducto', 'CodProducto'])),
      codprincipal: textValue(pickRecordValue(row, ['codprincipal', 'Codprincipal', 'codPrincipal', 'CodPrincipal'])) || null,
      codauxiliar: textValue(pickRecordValue(row, ['codauxiliar', 'Codauxiliar', 'codAuxiliar', 'CodAuxiliar'])) || null,
      descripcion: textValue(pickRecordValue(row, ['descripproducto', 'Descripproducto', 'descripcion', 'Descripcion'])) || null,
      precioUnitario: numberValue(pickRecordValue(row, ['preciounitario', 'Preciounitario', 'precioUnitario', 'PrecioUnitario'])),
      tarifaIva: numberValue(pickRecordValue(row, ['iva', 'Iva', 'tarifaIva', 'TarifaIva'])),
    },
    cantidad: String(numberValue(pickRecordValue(row, ['cantidadDisponible', 'CantidadDisponible', 'cantproducto', 'Cantproducto', 'cantidad', 'Cantidad'])) || 1),
    precio: String(numberValue(pickRecordValue(row, ['preciounitario', 'Preciounitario', 'precioUnitario', 'PrecioUnitario']))),
    descuento: String(numberValue(pickRecordValue(row, ['descuento', 'Descuento']))),
    tarifa: String(numberValue(pickRecordValue(row, ['iva', 'Iva', 'tarifaIva', 'TarifaIva']))),
  };
}

function detalleFacturaToNotaDebitoLinea(row: Record<string, unknown>): NotaDebitoLinea {
  return {
    descripcion: textValue(pickRecordValue(row, ['descripproducto', 'Descripproducto', 'descripcion', 'Descripcion'])) || 'Cargo adicional',
    precio: String(numberValue(pickRecordValue(row, ['preciounitario', 'Preciounitario', 'subtotal', 'Subtotal']))),
    tarifa: String(numberValue(pickRecordValue(row, ['iva', 'Iva', 'tarifaIva', 'TarifaIva']))),
    impuestoIce: '',
    valorIce: String(numberValue(pickRecordValue(row, ['valorIce', 'ValorIce', 'ice', 'Ice']))),
  };
}

function manualClienteFromForm(form: NuevaFacturaFormState): Cliente {
  return {
    codcliente: 0,
    nombrerazonsocial: form.clienteBusqueda.trim() || 'Cliente manual',
    numeroidentificacion: form.numeroIdentificacion.trim() || null,
    tipoidentificacion: form.tipoIdentificacion.trim() || null,
    tipoCliente: Number(form.tipoCliente) || null,
    oblgconta: form.obligadoContabilidad.trim() || null,
    direccion: form.direccion.trim() || null,
    celular: form.telefono.trim() || null,
    correo: form.correoPrincipal.trim() || null,
  };
}

function manualFacturaFromForm(form: NotaCreditoFormState | NotaDebitoFormState): FacturaListItem | null {
  const numero = form.facturaBusqueda.trim() || form.numeroFactura.trim();
  if (!numero) return null;

  return {
    codfactura: 0,
    numeroCompleto: numero,
    numfactura: numero,
    cliente: form.clienteBusqueda.trim() || null,
    identificacionCliente: form.numeroIdentificacion.trim() || null,
    fechaEmision: new Date().toISOString(),
    total: 0,
  };
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

function NuevaFacturaMobileScreen({
  form,
  preparacion,
  puntosData,
  cliente,
  clientes,
  productos,
  lineas,
  loading,
  saving,
  message,
  draftSaved,
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
  puntosData: PuntosEmisionData | null;
  cliente: Cliente | null;
  clientes: Cliente[];
  productos: FacturaProducto[];
  lineas: NuevaFacturaLinea[];
  loading: boolean;
  saving: boolean;
  message?: MessageState;
  draftSaved: boolean;
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
  const serieOptions = getDocumentSerieOptions(preparacion, puntosData, 'factura');
  usePreferredDocumentSerie(serieOptions, form.serie, (serie) => onChange('serie', serie));
  const effectiveSerie = getEffectiveDocumentSerie(serieOptions, form.serie) || form.serie;
  const formaPagoOptions = preparacion?.formasPago ?? [];
  const ivaOptions = preparacion?.porcentajesIva ?? [];
  const serieLabel = getSerieLabelFromOptions(serieOptions, effectiveSerie, getSerieLabel(preparacion, effectiveSerie, '001-001'));
  const optionInvoiceNumber = getNextSequenceFromOptions(serieOptions, effectiveSerie, '');
  const invoiceNumber = effectiveSerie ? optionInvoiceNumber || (puntosData?.cajas?.length ? '' : form.numeroFactura || getNextSequence(preparacion, effectiveSerie, 1)) : '';
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
          {draftSaved ? <View style={styles.invoiceDraftStatus}><MaterialCommunityIcons name="cloud-check-outline" size={15} color="#0F8A4B" /><Text style={styles.invoiceDraftStatusText}>Borrador guardado automáticamente</Text></View> : null}
        </View>
        <View style={styles.invoiceHeaderActions}>
          <View style={styles.invoiceHeaderBox}>
            <DropdownField
              label="Serie"
              options={serieOptions.map((item, index) => ({ label: item.serieVisual || item.serieRaw || `Serie ${index + 1}`, value: index + 1 }))}
              value={Math.max(serieOptions.findIndex((item) => item.serieRaw === form.serie || item.serieVisual === form.serie) + 1, 0) || null}
              onChange={(value) => onChange('serie', value ? serieOptions[value - 1]?.serieRaw ?? serieOptions[value - 1]?.serieVisual ?? '' : '')}
              allowClear
            />
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Numero de factura</Text>
            <Text style={styles.invoiceHeaderValue}>{invoiceNumber}</Text>
          </View>
           <SecondaryButton label="Limpiar pantalla" onPress={handleClear} />
        </View>
      </View>
      <SharedInvoiceProgressSteps labels={['Cliente', 'Productos', 'Revisión']} activeIndex={step} />
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
        <SearchField label="Encontrar cliente" placeholder="Identificacion, nombres, apellidos o razon social" value={form.clienteBusqueda} onChangeText={(value) => onChange('clienteBusqueda', value)} resultCount={clientes.length} onSubmit={onSearchClientes} predictive suggestions={clientes.slice(0, 5).map((item, index) => ({ id: `factura-cliente-${getClienteKey(item, index)}`, title: getClienteDisplayName(item), subtitle: getClienteIdentification(item) || 'Sin identificacion' }))} onSelectSuggestion={(suggestion) => { const item = clientes.find((candidate, index) => `factura-cliente-${getClienteKey(candidate, index)}` === suggestion.id); if (item) onSelectCliente(item); }} />
        {cliente ? <Text style={styles.profileValue}>Seleccionado: {getClienteDisplayName(cliente)} - {cliente.numeroidentificacion}</Text> : null}
      </View>
      {cliente ? <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Informacion del Cliente</Text>
          <Text style={styles.invoicePanelPill}>Datos del cliente seleccionado</Text>
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Tipo identificacion" value={form.tipoIdentificacion} onChangeText={(value) => onChange('tipoIdentificacion', value)} />
          <Field label="Numero de identificacion" value={cliente?.numeroidentificacion ?? form.numeroIdentificacion} onChangeText={(value) => onChange('numeroIdentificacion', value)} />
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
        <SearchField label="Encontrar producto o servicio" placeholder="Codigo, nombre o descripcion" value={form.productoBusqueda} onChangeText={(value) => onChange('productoBusqueda', value)} resultCount={productos.length} onSubmit={onSearchProductos} predictive suggestions={productos.slice(0, 5).map((item, index) => ({ id: getFacturaProductoKey(item, index), title: item.descripcion ?? item.codprincipal ?? 'Producto', subtitle: item.codprincipal ?? 'Sin codigo' }))} onSelectSuggestion={(suggestion) => { const item = productos.find((candidate, index) => getFacturaProductoKey(candidate, index) === suggestion.id); if (item) onAddProducto(item); }} />
        <Text style={styles.invoiceSectionHelp}>Busca un producto, selecciónalo y ajusta cantidad o precio si hace falta.</Text>
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
                  <Text style={styles.clientName} numberOfLines={2}>{linea.producto.descripcion ?? linea.producto.codprincipal}</Text>
                  <Text style={styles.clientMeta} numberOfLines={1}>Codigo: {linea.producto.codprincipal ?? linea.producto.codproducto}</Text>
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
            options={formaPagoOptions.map((item, index) => ({ label: String(item.descripcionSri || item.descripcion || item.codigo || `Forma ${index + 1}`), value: index + 1 }))}
            value={Math.max(formaPagoOptions.findIndex((item) => String(item.codigo ?? '') === form.formaPago) + 1, 0) || null}
            onChange={(value) => onChange('formaPago', value ? String(formaPagoOptions[value - 1]?.codigo ?? '') : '')}
            allowClear
          />
        </View>
        <DropdownField
          label="Serie"
          options={serieOptions.map((item, index) => ({ label: item.serieVisual || item.serieRaw || `Serie ${index + 1}`, value: index + 1 }))}
          value={Math.max(serieOptions.findIndex((item) => item === getSelectedDocumentSerieOption(serieOptions, effectiveSerie)) + 1, 0) || (serieOptions.length ? 1 : null)}
          onChange={(value) => onChange('serie', value ? serieOptions[value - 1]?.serieRaw ?? serieOptions[value - 1]?.serieVisual ?? effectiveSerie : effectiveSerie)}
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
          {displayProductos.map((producto, index) => (
            <Pressable key={getFacturaProductoKey(producto, index, 'producto-frecuente')} style={styles.invoiceFrequentItem} onPress={() => onAddProducto(producto)}>
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

function NuevaNotaCreditoMobileScreen({
  form,
  preparacion,
  puntosData,
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
  onHistory,
  onSave,
}: {
  form: NotaCreditoFormState;
  preparacion: FacturaPreparacion | null;
  puntosData: PuntosEmisionData | null;
  factura: FacturaListItem | null;
  facturas: FacturaListItem[];
  cliente: Cliente | null;
  lineas: NuevaFacturaLinea[];
  loading: boolean;
  saving: boolean;
  message?: MessageState;
  onChange: (field: keyof NotaCreditoFormState, value: string) => void;
  onSearchFacturas: () => void;
  onSelectFactura: (factura: FacturaListItem) => void | Promise<void>;
  onAddLinea: (producto: FacturaProducto) => void;
  onUpdateLinea: (index: number, field: keyof Omit<NuevaFacturaLinea, 'producto'>, value: string) => void;
  onRemoveLinea: (index: number) => void;
  onClear: () => void;
  onHistory: () => void;
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
  const serieOptions = getDocumentSerieOptions(preparacion, puntosData, 'notaCredito');
  usePreferredDocumentSerie(serieOptions, form.serie, (serie) => onChange('serie', serie));
  const effectiveSerie = getEffectiveDocumentSerie(serieOptions, form.serie) || form.serie;
  const serieLabel = getSerieLabelFromOptions(serieOptions, effectiveSerie, getSerieLabel(preparacion, effectiveSerie, '001-002'));
  const optionNotaNumber = getNextSequenceFromOptions(serieOptions, effectiveSerie, '');
  const notaNumber = effectiveSerie ? form.numeroFactura || optionNotaNumber || (puntosData?.cajas?.length ? '' : getNextSequence(preparacion, effectiveSerie)) : '';
  const addDefaultLine = () => onAddLinea({
    codproducto: 0,
    codprincipal: 'NC',
    descripcion: factura ? `Ajuste factura ${factura.numeroCompleto ?? factura.numfactura ?? ''}`.trim() : 'Detalle nota de credito',
    precioUnitario: Number(factura?.total ?? 0.01),
    tarifaIva: 0,
  });
  const [step, setStep] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const handleClear = () => {
    onClear();
    setManualMode(false);
    setStep(0);
  };
  const selectXml = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['text/xml', 'application/xml'], copyToCacheDirectory: true });
    if (!result.canceled) Alert.alert('XML seleccionado', 'El archivo fue seleccionado, pero falta exponer en E-Fact web el endpoint móvil para leer el XML y precargar este formulario.');
  };

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
            <DropdownField
              label="Serie"
              options={serieOptions.map((item, index) => ({ label: item.serieVisual || item.serieRaw || `Serie ${index + 1}`, value: index + 1 }))}
              value={Math.max(serieOptions.findIndex((item) => item === getSelectedDocumentSerieOption(serieOptions, effectiveSerie)) + 1, 0) || (serieOptions.length ? 1 : null)}
              onChange={(value) => onChange('serie', value ? serieOptions[value - 1]?.serieRaw ?? serieOptions[value - 1]?.serieVisual ?? effectiveSerie : effectiveSerie)}
            />
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Nota de credito</Text>
            <Text style={styles.invoiceHeaderValue}>{notaNumber}</Text>
          </View>
          <SecondaryButton label="Historial" onPress={onHistory} />
          <SecondaryButton label="Limpiar pantalla" onPress={handleClear} />
        </View>
      </View>
      <SharedInvoiceProgressSteps labels={['Factura', 'Cliente', 'Detalle']} activeIndex={step} />
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando notas de credito...</Text>
        </View>
      ) : null}
      {step === 0 ? <>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Opciones de emision</Text>
        <Text style={styles.invoiceSectionHelp}>Tambien puedes emitir la nota de credito de estas formas</Text>
        <View style={styles.invoiceGrid}>
          <Pressable style={styles.invoiceHeaderBox} onPress={() => { setManualMode(true); setStep(1); }}>
            <Text style={styles.invoiceHeaderValue}>Manual</Text>
            <Text style={styles.invoiceSectionHelp}>Ingresa cliente, motivo y detalle sin partir del buscador.</Text>
          </Pressable>
          <Pressable style={styles.invoiceHeaderBox} onPress={selectXml}>
            <Text style={styles.invoiceHeaderValue}>Desde XML</Text>
            <Text style={styles.invoiceSectionHelp}>Carga el XML de la factura para precargar datos y ajustar el detalle.</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Buscador de factura</Text>
        <Text style={styles.invoiceSectionHelp}>Encuentra la Factura Modificada para emitir la nota de credito</Text>
        <SearchField label="Encontrar factura" placeholder="Numero completo o secuencial" value={form.facturaBusqueda} onChangeText={(value) => onChange('facturaBusqueda', value)} resultCount={facturas.length} onSubmit={onSearchFacturas} predictive suggestions={facturas.slice(0, 5).map((item, index) => ({ id: `nota-factura-${item.codfactura}-${index}`, title: item.numeroCompleto ?? item.numfactura ?? `Factura ${item.codfactura}`, subtitle: item.cliente ?? 'Consumidor final' }))} onSelectSuggestion={(suggestion) => { const item = facturas.find((candidate, index) => `nota-factura-${candidate.codfactura}-${index}` === suggestion.id); if (item) onSelectFactura(item); }} />
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
      <View style={styles.formActions}>
        <PrimaryButton label="Continuar con cliente" loading={false} onPress={() => factura || manualMode ? setStep(1) : Alert.alert('Factura requerida', 'Selecciona primero la factura modificada o usa modo manual.')} />
      </View>
      </> : null}
      {step === 1 ? <>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Informacion del Cliente</Text>
          <Text style={styles.invoicePanelPill}>{manualMode ? 'Ingreso manual' : 'Cargado desde factura'}</Text>
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Tipo identificacion" value={form.tipoIdentificacion} onChangeText={(value) => onChange('tipoIdentificacion', value)} />
          <Field label="Numero identificacion" value={cliente?.numeroidentificacion ?? form.numeroIdentificacion} onChangeText={(value) => onChange('numeroIdentificacion', value)} />
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
      <View style={styles.formActions}>
        <SecondaryButton label="Volver a factura" onPress={() => setStep(0)} />
        <PrimaryButton label="Continuar con detalle" loading={false} onPress={() => setStep(2)} />
      </View>
      </> : null}
      {step === 2 ? <>
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
                  <Text style={styles.clientName} numberOfLines={2}>{linea.producto.descripcion ?? linea.producto.codprincipal}</Text>
                  <Text style={styles.clientMeta} numberOfLines={1}>Codigo: {linea.producto.codprincipal ?? linea.producto.codproducto}</Text>
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
        <SecondaryButton label="Volver al cliente" onPress={() => setStep(1)} />
        <SecondaryButton label="Cancelar / limpiar" onPress={handleClear} />
        <PrimaryButton label="Generar Nota de Credito" loading={saving} onPress={onSave} />
      </View>
      </> : null}
    </>
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
  onEmitir,
  onAnular,
}: {
  notas: NotaCreditoListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (nota: NotaCreditoListItem) => void;
  onXml: (nota: NotaCreditoListItem) => void;
  onEmail: (nota: NotaCreditoListItem) => void;
  onEmitir: (nota: NotaCreditoListItem) => void;
  onAnular: (nota: NotaCreditoListItem) => void;
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
      <DocumentHistoryHero eyebrow="Ajustes emitidos" title="Mis notas de credito" text="Busca por cliente, documento modificado o motivo, exporta el resultado visible y abre el XML o PDF desde la misma vista." metrics={[{ value: visibleNotas.length, label: 'Notas filtradas' }, { value: formatMoney(total), label: 'Total filtrado' }, { value: autorizadas, label: 'Autorizadas' }]} />
      <View style={styles.invoiceHistoryFilterPanel}>
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
            <View key={notaKey} style={styles.invoiceHistoryCard}>
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
                { label: 'Emitir SRI', icon: 'send-check-outline', tone: 'primary', onPress: () => onEmitir(nota) },
                { label: 'Anular', icon: 'trash-can-outline', tone: 'danger', onPress: () => onAnular(nota) },
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
  puntosData,
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
  onHistory,
  onSave,
}: {
  form: NotaDebitoFormState;
  preparacion: FacturaPreparacion | null;
  puntosData: PuntosEmisionData | null;
  factura: FacturaListItem | null;
  facturas: FacturaListItem[];
  cliente: Cliente | null;
  lineas: NotaDebitoLinea[];
  loading: boolean;
  saving: boolean;
  message?: MessageState;
  onChange: (field: keyof NotaDebitoFormState, value: string) => void;
  onSearchFacturas: () => void;
  onSelectFactura: (factura: FacturaListItem) => void | Promise<void>;
  onAddLinea: () => void;
  onUpdateLinea: (index: number, field: keyof NotaDebitoLinea, value: string) => void;
  onRemoveLinea: (index: number) => void;
  onClear: () => void;
  onHistory: () => void;
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
  const serieOptions = getDocumentSerieOptions(preparacion, puntosData, 'notaDebito');
  usePreferredDocumentSerie(serieOptions, form.serie, (serie) => onChange('serie', serie));
  const effectiveSerie = getEffectiveDocumentSerie(serieOptions, form.serie) || form.serie;
  const serieLabel = getSerieLabelFromOptions(serieOptions, effectiveSerie, getSerieLabel(preparacion, effectiveSerie, '001-002'));
  const optionNotaNumber = getNextSequenceFromOptions(serieOptions, effectiveSerie, '');
  const notaNumber = effectiveSerie ? form.numeroFactura || optionNotaNumber || (puntosData?.cajas?.length ? '' : getNextSequence(preparacion, effectiveSerie, 1158)) : '';
  const [step, setStep] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const handleClear = () => {
    onClear();
    setManualMode(false);
    setStep(0);
  };
  const selectXml = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['text/xml', 'application/xml'], copyToCacheDirectory: true });
    if (!result.canceled) Alert.alert('XML seleccionado', 'El archivo fue seleccionado, pero falta exponer en E-Fact web el endpoint móvil para leer el XML y precargar este formulario.');
  };

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
            <DropdownField
              label="Serie"
              options={serieOptions.map((item, index) => ({ label: item.serieVisual || item.serieRaw || `Serie ${index + 1}`, value: index + 1 }))}
              value={Math.max(serieOptions.findIndex((item) => item === getSelectedDocumentSerieOption(serieOptions, effectiveSerie)) + 1, 0) || (serieOptions.length ? 1 : null)}
              onChange={(value) => onChange('serie', value ? serieOptions[value - 1]?.serieRaw ?? serieOptions[value - 1]?.serieVisual ?? effectiveSerie : effectiveSerie)}
            />
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Nota de debito</Text>
            <Text style={styles.invoiceHeaderValue}>{notaNumber}</Text>
          </View>
          <SecondaryButton label="Historial" onPress={onHistory} />
          <SecondaryButton label="Limpiar pantalla" onPress={handleClear} />
        </View>
      </View>
      <SharedInvoiceProgressSteps labels={['Factura', 'Cliente', 'Detalle']} activeIndex={step} />
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando notas de debito...</Text>
        </View>
      ) : null}
      {step === 0 ? <>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Opciones de emision</Text>
        <Text style={styles.invoiceSectionHelp}>Tambien puedes emitir la nota de debito de estas formas</Text>
        <View style={styles.invoiceGrid}>
          <Pressable style={styles.invoiceHeaderBox} onPress={() => { setManualMode(true); setStep(1); }}>
            <Text style={styles.invoiceHeaderValue}>Manual</Text>
            <Text style={styles.invoiceSectionHelp}>Ingresa cliente, factura modificada, motivo y detalle directamente.</Text>
          </Pressable>
          <Pressable style={styles.invoiceHeaderBox} onPress={selectXml}>
            <Text style={styles.invoiceHeaderValue}>Desde XML</Text>
            <Text style={styles.invoiceSectionHelp}>Carga el XML de la factura para precargar datos y editar valores.</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Buscador de factura</Text>
        <Text style={styles.invoiceSectionHelp}>Encuentra la Factura Modificada para emitir la nota de debito</Text>
        <SearchField label="Encontrar factura" placeholder="Numero completo o secuencial" value={form.facturaBusqueda} onChangeText={(value) => onChange('facturaBusqueda', value)} resultCount={facturas.length} onSubmit={onSearchFacturas} predictive suggestions={facturas.slice(0, 5).map((item, index) => ({ id: `debito-factura-${item.codfactura}-${index}`, title: item.numeroCompleto ?? item.numfactura ?? `Factura ${item.codfactura}`, subtitle: item.cliente ?? 'Consumidor final' }))} onSelectSuggestion={(suggestion) => { const item = facturas.find((candidate, index) => `debito-factura-${candidate.codfactura}-${index}` === suggestion.id); if (item) onSelectFactura(item); }} />
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
      <View style={styles.formActions}>
        <PrimaryButton label="Continuar con cliente" loading={false} onPress={() => factura || manualMode ? setStep(1) : Alert.alert('Factura requerida', 'Selecciona primero la factura modificada o usa modo manual.')} />
      </View>
      </> : null}
      {step === 1 ? <>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Informacion del Cliente</Text>
          <Text style={styles.invoicePanelPill}>{manualMode ? 'Ingreso manual' : 'Datos del documento'}</Text>
        </View>
        <View style={styles.invoiceGrid}>
          <Field label="Tipo identificacion" value={form.tipoIdentificacion} onChangeText={(value) => onChange('tipoIdentificacion', value)} />
          <Field label="Numero identificacion" value={cliente?.numeroidentificacion ?? form.numeroIdentificacion} onChangeText={(value) => onChange('numeroIdentificacion', value)} />
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
      <View style={styles.formActions}>
        <SecondaryButton label="Volver a factura" onPress={() => setStep(0)} />
        <PrimaryButton label="Continuar con detalle" loading={false} onPress={() => setStep(2)} />
      </View>
      </> : null}
      {step === 2 ? <>
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
                  <Text style={styles.clientName} numberOfLines={2}>{linea.descripcion || 'Motivo de la nota de debito'}</Text>
                  <Text style={styles.clientMeta} numberOfLines={1}>Tarifa IVA {linea.tarifa || '0'}% - ICE {formatMoney(ice)}</Text>
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
        <SecondaryButton label="Volver al cliente" onPress={() => setStep(1)} />
        <SecondaryButton label="Cancelar / limpiar" onPress={handleClear} />
        <PrimaryButton label="Generar Nota de Debito" loading={saving} onPress={onSave} />
      </View>
      </> : null}
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
  onEmitir,
  onAnular,
}: {
  notas: NotaDebitoListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (nota: NotaDebitoListItem) => void;
  onXml: (nota: NotaDebitoListItem) => void;
  onEmail: (nota: NotaDebitoListItem) => void;
  onEmitir: (nota: NotaDebitoListItem) => void;
  onAnular: (nota: NotaDebitoListItem) => void;
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
      <DocumentHistoryHero eyebrow="Cargos emitidos" title="Mis notas de debito" text="Filtra por cliente, documento modificado o motivo, exporta tu consulta y abre cada comprobante." metrics={[{ value: visibleNotas.length, label: 'Notas filtradas' }, { value: formatMoney(total), label: 'Total filtrado' }, { value: autorizadas, label: 'Autorizadas' }]} />
      <View style={styles.invoiceHistoryFilterPanel}>
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
            <View key={notaKey} style={styles.invoiceHistoryCard}>
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
                { label: 'Emitir SRI', icon: 'send-check-outline', tone: 'primary', onPress: () => onEmitir(nota) },
                { label: 'Anular', icon: 'trash-can-outline', tone: 'danger', onPress: () => onAnular(nota) },
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
  puntosData,
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
  onHistory,
  onSave,
}: {
  form: LiquidacionCompraFormState;
  preparacion: FacturaPreparacion | null;
  puntosData: PuntosEmisionData | null;
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
  onHistory: () => void;
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
  const serieOptions = getDocumentSerieOptions(preparacion, puntosData, 'liquidacion');
  usePreferredDocumentSerie(serieOptions, form.serie, (serie) => onChange('serie', serie));
  const formaPagoOptions = preparacion?.formasPago ?? [];
  const effectiveSerie = getEffectiveDocumentSerie(serieOptions, form.serie) || form.serie;
  const serieLabel = getSerieLabelFromOptions(serieOptions, effectiveSerie, getSerieLabel(preparacion, effectiveSerie, '001-002'));
  const optionLiquidacionNumber = getNextSequenceFromOptions(serieOptions, effectiveSerie, '');
  const liquidacionNumber = effectiveSerie ? form.numeroFactura || optionLiquidacionNumber || (puntosData?.cajas?.length ? '' : getNextSequence(preparacion, effectiveSerie)) : '';
  const [step, setStep] = useState(0);
  const handleClear = () => {
    onClear();
    setStep(0);
  };

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
            <DropdownField
              label="Serie"
              options={serieOptions.map((item, index) => ({ label: item.serieVisual || item.serieRaw || `Serie ${index + 1}`, value: index + 1 }))}
              value={Math.max(serieOptions.findIndex((item) => item === getSelectedDocumentSerieOption(serieOptions, effectiveSerie)) + 1, 0) || (serieOptions.length ? 1 : null)}
              onChange={(value) => onChange('serie', value ? serieOptions[value - 1]?.serieRaw ?? serieOptions[value - 1]?.serieVisual ?? effectiveSerie : effectiveSerie)}
            />
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Liquidacion</Text>
            <Text style={styles.invoiceHeaderValue}>{liquidacionNumber}</Text>
          </View>
          <SecondaryButton label="Historial" onPress={onHistory} />
          <SecondaryButton label="Limpiar pantalla" onPress={handleClear} />
        </View>
      </View>
      <SharedInvoiceProgressSteps labels={['Proveedor', 'Detalle', 'Revision']} activeIndex={step} />
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando liquidaciones...</Text>
        </View>
      ) : null}
      {step === 0 ? <>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Buscador de proveedor</Text>
        <Text style={styles.invoiceSectionHelp}>Encuentra o completa el proveedor de la liquidacion</Text>
        <SearchField label="Encontrar proveedor" placeholder="Identificacion o nombre" value={form.clienteBusqueda} onChangeText={(value) => onChange('clienteBusqueda', value)} resultCount={proveedores.length} onSubmit={onSearchProveedores} predictive suggestions={proveedores.slice(0, 5).map((item, index) => ({ id: `liquidacion-proveedor-${getClienteKey(item, index)}`, title: getClienteDisplayName(item), subtitle: getClienteIdentification(item) || 'Sin identificacion' }))} onSelectSuggestion={(suggestion) => { const item = proveedores.find((candidate, index) => `liquidacion-proveedor-${getClienteKey(candidate, index)}` === suggestion.id); if (item) onSelectProveedor(item); }} />
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
      <View style={styles.formActions}>
        <PrimaryButton label="Continuar con datos" loading={false} onPress={() => proveedor ? setStep(1) : Alert.alert('Proveedor requerido', 'Selecciona primero un proveedor.')} />
      </View>
      </> : null}
      {step === 1 ? <>
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
            options={formaPagoOptions.map((item, index) => ({ label: String(item.descripcionSri || item.descripcion || item.codigo || `Forma ${index + 1}`), value: index + 1 }))}
            value={Math.max(formaPagoOptions.findIndex((item) => String(item.codigo ?? '') === form.formaPago) + 1, 0) || null}
            onChange={(value) => onChange('formaPago', value ? String(formaPagoOptions[value - 1]?.codigo ?? '') : '')}
            allowClear
          />
          <Field label="Dias de credito" value={form.diasCredito} onChangeText={(value) => onChange('diasCredito', value.replace(/[^\d]/g, ''))} keyboardType="number-pad" />
        </View>
      </View>
      <View style={styles.formActions}>
        <SecondaryButton label="Volver a proveedor" onPress={() => setStep(0)} />
        <PrimaryButton label="Continuar con detalle" loading={false} onPress={() => setStep(2)} />
      </View>
      </> : null}
      {step === 2 ? <>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Detalle de la Liquidacion</Text>
          <Text style={styles.invoicePanelPill}>Registra los productos o servicios adquiridos.</Text>
        </View>
        <SearchField label="Encontrar producto o servicio" placeholder="Codigo, nombre o descripcion" value={form.productoBusqueda} onChangeText={(value) => onChange('productoBusqueda', value)} resultCount={productos.length} onSubmit={onSearchProductos} predictive suggestions={productos.slice(0, 5).map((item) => ({ id: `liquidacion-producto-${item.codproducto}`, title: item.descripcion ?? item.codprincipal ?? 'Producto', subtitle: item.codprincipal ?? 'Sin codigo' }))} onSelectSuggestion={(suggestion) => { const item = productos.find((candidate) => `liquidacion-producto-${candidate.codproducto}` === suggestion.id); if (item) onAddProducto(item); }} />
        <View style={styles.formActions}>
          <SecondaryButton label="Registrar nuevo producto" onPress={onSearchProductos} />
        </View>
        <View style={styles.listStack}>
          {productos.map((producto, index) => (
            <Pressable key={getFacturaProductoKey(producto, index, 'liquidacion-producto')} style={styles.clientCard} onPress={() => onAddProducto(producto)}>
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
                  <Text style={styles.clientName} numberOfLines={2}>{linea.producto.descripcion ?? linea.producto.codprincipal}</Text>
                  <Text style={styles.clientMeta} numberOfLines={1}>Codigo: {linea.producto.codprincipal ?? linea.producto.codproducto}</Text>
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
        <SecondaryButton label="Volver a datos" onPress={() => setStep(1)} />
        <SecondaryButton label="Cancelar / limpiar" onPress={handleClear} />
      </View>
      </> : null}
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
  onEmitir,
}: {
  liquidaciones: LiquidacionCompraListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (liquidacion: LiquidacionCompraListItem) => void;
  onXml: (liquidacion: LiquidacionCompraListItem) => void;
  onEmail: (liquidacion: LiquidacionCompraListItem) => void;
  onEmitir: (liquidacion: LiquidacionCompraListItem) => void;
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
      <DocumentHistoryHero eyebrow="Compras emitidas" title="Mis liquidaciones" text="Filtra por proveedor, numero o identificacion, exporta tu consulta y abre cada comprobante." metrics={[{ value: visibleLiquidaciones.length, label: 'Liquidaciones filtradas' }, { value: formatMoney(total), label: 'Total filtrado' }, { value: autorizadas, label: 'Autorizadas' }]} />
      <View style={styles.invoiceHistoryFilterPanel}>
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
            <View key={key} style={styles.invoiceHistoryCard}>
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
                { label: 'Emitir SRI', icon: 'send-check-outline', tone: 'primary', onPress: () => onEmitir(liquidacion) },
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
  puntosData,
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
  onNewTransportista,
  onSearchClientes,
  onSelectCliente,
  onSearchFacturas,
  onSelectFactura,
  onSearchProductos,
  onAddProducto,
  onUpdateDetalle,
  onRemoveDetalle,
  onClear,
  onHistory,
  onSave,
}: {
  form: GuiaRemisionFormState;
  preparacion: FacturaPreparacion | null;
  puntosData: PuntosEmisionData | null;
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
  onNewTransportista: () => void;
  onSearchClientes: () => void;
  onSelectCliente: (cliente: Cliente) => void;
  onSearchFacturas: () => void;
  onSelectFactura: (factura: FacturaListItem) => void;
  onSearchProductos: () => void;
  onAddProducto: (producto: FacturaProducto) => void;
  onUpdateDetalle: (index: number, value: string) => void;
  onRemoveDetalle: (index: number) => void;
  onClear: () => void;
  onHistory: () => void;
  onSave: () => void;
}) {
  const serieOptions = getDocumentSerieOptions(preparacion, puntosData, 'guia');
  usePreferredDocumentSerie(serieOptions, form.serie, (serie) => onChange('serie', serie));
  const effectiveSerie = getEffectiveDocumentSerie(serieOptions, form.serie) || form.serie;
  const serieLabel = getSerieLabelFromOptions(serieOptions, effectiveSerie, getSerieLabel(preparacion, effectiveSerie, '001-002'));
  const optionGuiaNumber = getNextSequenceFromOptions(serieOptions, effectiveSerie, '');
  const guiaNumber = effectiveSerie ? optionGuiaNumber || (puntosData?.cajas?.length ? '' : form.numeroFactura || getNextSequence(preparacion, effectiveSerie)) : '';
  const totalCantidad = detalles.reduce((sum, item) => sum + (Number(item.cantidad.replace(',', '.')) || 0), 0);
  const [step, setStep] = useState(0);
  const handleClear = () => {
    onClear();
    setStep(0);
  };

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
            <DropdownField
              label="Serie guia"
              options={serieOptions.map((item, index) => ({ label: item.serieVisual || item.serieRaw || `Serie ${index + 1}`, value: index + 1 }))}
              value={Math.max(serieOptions.findIndex((item) => item === getSelectedDocumentSerieOption(serieOptions, effectiveSerie)) + 1, 0) || (serieOptions.length ? 1 : null)}
              onChange={(value) => onChange('serie', value ? serieOptions[value - 1]?.serieRaw ?? serieOptions[value - 1]?.serieVisual ?? effectiveSerie : effectiveSerie)}
            />
          </View>
          <View style={styles.invoiceHeaderBox}>
            <Text style={styles.invoiceMiniLabel}>Numero de guia</Text>
            <Text style={styles.invoiceHeaderValue}>{guiaNumber}</Text>
          </View>
          <SecondaryButton label="Historial" onPress={onHistory} />
          <SecondaryButton label="Limpiar pantalla" onPress={handleClear} />
        </View>
      </View>
      <SharedInvoiceProgressSteps labels={['Transporte', 'Destino', 'Detalle']} activeIndex={step} />
      {message ? <MessageBox message={message} /> : null}
      {loading ? (
        <View style={styles.directoryLoading}>
          <ActivityIndicator color="#0072BD" />
          <Text style={styles.mutedText}>Cargando guias de remision...</Text>
        </View>
      ) : null}
      {step === 0 ? <>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Datos operativos de la guia</Text>
          <Text style={styles.invoicePanelPill}>Selecciona transportista</Text>
        </View>
        <SearchField label="Encontrar transportista" placeholder="Identificacion o razon social" value={form.transportistaBusqueda} onChangeText={(value) => onChange('transportistaBusqueda', value)} resultCount={transportistas.length} onSubmit={onSearchTransportistas} predictive suggestions={transportistas.slice(0, 5).map((item, index) => ({ id: `guia-transportista-${getClienteKey(item, index)}`, title: getClienteDisplayName(item), subtitle: getClienteIdentification(item) || 'Sin identificacion' }))} onSelectSuggestion={(suggestion) => { const item = transportistas.find((candidate, index) => `guia-transportista-${getClienteKey(candidate, index)}` === suggestion.id); if (item) onSelectTransportista(item); }} />
        <View style={styles.formActions}>
          <SecondaryButton label="Nuevo Transportista" onPress={onNewTransportista} />
        </View>
        <View style={styles.listStack}>
          {transportistas.map((item, index) => (
            <Pressable key={`guia-transportista-${getClienteKey(item, index)}`} style={styles.clientCard} onPress={() => onSelectTransportista(item)}>
              <Text style={styles.clientName}>{getClienteDisplayName(item)}</Text>
              <Text style={styles.clientMeta}>{getClienteIdentification(item) || 'Sin identificacion'}</Text>
            </Pressable>
          ))}
        </View>
        {transportista ? <Text style={styles.profileValue}>Transportista: {getClienteDisplayName(transportista)}</Text> : null}
      </View>
      <View style={styles.formActions}>
        <PrimaryButton label="Continuar con destino" loading={false} onPress={() => transportista ? setStep(1) : Alert.alert('Transportista requerido', 'Selecciona primero un transportista.')} />
      </View>
      </> : null}
      {step === 1 ? <>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Destino y traslado</Text>
          <Text style={styles.invoicePanelPill}>Cliente, factura y fechas</Text>
        </View>
        <SearchField label="Encontrar destinatario" placeholder="Identificacion o nombre del cliente" value={form.clienteBusquedaGuia} onChangeText={(value) => onChange('clienteBusquedaGuia', value)} resultCount={clientes.length} onSubmit={onSearchClientes} predictive suggestions={clientes.slice(0, 5).map((item, index) => ({ id: `guia-cliente-${getClienteKey(item, index)}`, title: getClienteDisplayName(item), subtitle: getClienteIdentification(item) || 'Sin identificacion' }))} onSelectSuggestion={(suggestion) => { const item = clientes.find((candidate, index) => `guia-cliente-${getClienteKey(candidate, index)}` === suggestion.id); if (item) onSelectCliente(item); }} />
        <SearchField label="Vincular factura (opcional)" placeholder="Numero completo o secuencial" value={form.facturaBusqueda} onChangeText={(value) => onChange('facturaBusqueda', value)} resultCount={facturas.length} onSubmit={onSearchFacturas} predictive suggestions={facturas.slice(0, 5).map((item, index) => ({ id: `guia-factura-${item.codfactura}-${index}`, title: item.numeroCompleto ?? item.numfactura ?? `Factura ${item.codfactura}`, subtitle: item.cliente ?? 'Consumidor final' }))} onSelectSuggestion={(suggestion) => { const item = facturas.find((candidate, index) => `guia-factura-${candidate.codfactura}-${index}` === suggestion.id); if (item) onSelectFactura(item); }} />
        <View style={styles.invoiceGrid}>
          <DropdownField
            label="Punto de emision"
            options={serieOptions.map((item, index) => ({ label: item.serieVisual || item.serieRaw || `Serie ${index + 1}`, value: index + 1 }))}
            value={Math.max(serieOptions.findIndex((item) => item === getSelectedDocumentSerieOption(serieOptions, effectiveSerie)) + 1, 0) || (serieOptions.length ? 1 : null)}
            onChange={(value) => onChange('serie', value ? serieOptions[value - 1]?.serieRaw ?? serieOptions[value - 1]?.serieVisual ?? effectiveSerie : effectiveSerie)}
          />
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
      <View style={styles.formActions}>
        <SecondaryButton label="Volver a transporte" onPress={() => setStep(0)} />
        <PrimaryButton label="Continuar con detalle" loading={false} onPress={() => setStep(2)} />
      </View>
      </> : null}
      {step === 2 ? <>
      <View style={[styles.formSectionBox, styles.invoicePanel]}>
        <View style={styles.invoicePanelHeader}>
          <Text style={styles.invoicePanelTitle}>Detalles de traslado</Text>
          <Text style={styles.invoicePanelPill}>Se cargan automaticamente desde la factura y puedes ajustar cantidades.</Text>
        </View>
        <SearchField label="Encontrar producto o detalle" placeholder="Codigo, nombre o descripcion" value={form.productoBusqueda} onChangeText={(value) => onChange('productoBusqueda', value)} resultCount={productos.length} onSubmit={onSearchProductos} predictive suggestions={productos.slice(0, 5).map((item) => ({ id: `guia-producto-${item.codproducto}`, title: item.descripcion ?? item.codprincipal ?? 'Producto', subtitle: item.codprincipal ?? 'Sin codigo' }))} onSelectSuggestion={(suggestion) => { const item = productos.find((candidate) => `guia-producto-${candidate.codproducto}` === suggestion.id); if (item) onAddProducto(item); }} />
        <View style={styles.formActions}>
          <SecondaryButton label="Agregar detalle" onPress={onSearchProductos} />
        </View>
        <View style={styles.listStack}>
          {productos.map((producto, index) => (
            <Pressable key={getFacturaProductoKey(producto, index, 'guia-producto')} style={styles.clientCard} onPress={() => onAddProducto(producto)}>
              <Text style={styles.clientName}>{producto.descripcion ?? producto.codprincipal ?? 'Producto'}</Text>
              <Text style={styles.clientMeta}>{producto.codprincipal ?? 'Sin codigo'}</Text>
            </Pressable>
          ))}
        </View>
        {detalles.length === 0 ? <EmptyState title="Sin detalles" text="Agrega productos del catalogo o registra un detalle manual." /> : null}
        {detalles.map((detalle, index) => (
          <View key={`guia-detalle-${index}`} style={styles.invoiceLineCard}>
            <Text style={styles.clientName} numberOfLines={2}>{detalle.producto.descripcion ?? detalle.producto.codprincipal}</Text>
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
        <SecondaryButton label="Volver al destino" onPress={() => setStep(1)} />
        <SecondaryButton label="Cancelar / limpiar" onPress={handleClear} />
        <PrimaryButton label="Generar Guia de Remision" loading={saving} onPress={onSave} />
      </View>
      </> : null}
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
  onEmitir,
  onAnular,
}: {
  guias: GuiaRemisionListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (guia: GuiaRemisionListItem) => void;
  onXml: (guia: GuiaRemisionListItem) => void;
  onEmail: (guia: GuiaRemisionListItem) => void;
  onEmitir: (guia: GuiaRemisionListItem) => void;
  onAnular: (guia: GuiaRemisionListItem) => void;
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
      <DocumentHistoryHero eyebrow="Traslados emitidos" title="Mis guias de remision" text="Filtra por destinatario, transportista o numero, exporta tu consulta y abre cada comprobante." metrics={[{ value: visibleGuias.length, label: 'Guias filtradas' }, { value: autorizadas, label: 'Autorizadas' }, { value: visibleGuias.length, label: 'Guias visibles' }]} />
      <View style={styles.invoiceHistoryFilterPanel}>
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
            <View key={key} style={styles.invoiceHistoryCard}>
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
                { label: 'Emitir SRI', icon: 'send-check-outline', tone: 'primary', onPress: () => onEmitir(guia) },
                { label: 'Anular', icon: 'trash-can-outline', tone: 'danger', onPress: () => onAnular(guia) },
              ]} />
            </View>
          );
        })}
      </View>
    </>
  );
}

function DocumentHistoryHero({
  eyebrow,
  title,
  text: description,
  metrics,
}: {
  eyebrow: string;
  title: string;
  text: string;
  metrics: Array<{ value: string | number; label: string }>;
}) {
  return (
    <View style={styles.invoiceHistoryHeader}>
      <View style={styles.invoiceHistoryHeaderTop}>
        <View style={styles.invoiceHistoryHeaderIcon}>
          <MaterialCommunityIcons name="file-document-multiple-outline" size={25} color="#FFFFFF" />
        </View>
        <View style={styles.invoiceHistoryHeaderCopy}>
          <Text style={styles.invoiceHistoryEyebrow}>{eyebrow}</Text>
          <Text style={styles.invoiceHistoryTitle}>{title}</Text>
          <Text style={styles.invoiceHistoryText}>{description}</Text>
        </View>
      </View>
      <View style={styles.invoiceHistoryStats}>
        {metrics.map((metric) => <InvoiceHistoryMetric key={metric.label} value={metric.value} label={metric.label} />)}
      </View>
    </View>
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
      <DocumentHistoryHero eyebrow="Retenciones emitidas" title="Mis retenciones" text="Busca por proveedor, comprobante o documento sustento, revisa el estado y exporta la consulta visible." metrics={[{ value: visibleRetenciones.length, label: 'Retenciones filtradas' }, { value: formatMoney(base), label: 'Base filtrada' }, { value: autorizadas, label: 'Autorizadas' }]} />
      <View style={styles.invoiceHistoryFilterPanel}>
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
            <View key={key} style={styles.invoiceHistoryCard}>
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
  onRetrySri,
  onAnular,
}: {
  facturas: FacturaListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (factura: FacturaListItem) => void;
  onXml: (factura: FacturaListItem) => void;
  onEmail: (factura: FacturaListItem) => void;
  onRetrySri: (factura: FacturaListItem) => void;
  onAnular: (factura: FacturaListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const [page, setPage] = useState(1);
  const [selectedFactura, setSelectedFactura] = useState<FacturaListItem | null>(null);
  const filteredFacturas = facturas.filter((factura) => {
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
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredFacturas.length / pageSize));
  const visibleFacturas = filteredFacturas.slice((page - 1) * pageSize, page * pageSize);
  const autorizadas = filteredFacturas.filter((factura) => factura.autorizado || String(factura.estadoSri ?? '').toUpperCase().includes('AUTORIZ')).length;
  const total = filteredFacturas.reduce((sum, factura) => sum + Number(factura.total ?? 0), 0);

  useEffect(() => {
    setPage(1);
  }, [filter, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <>
      <View style={styles.invoiceHistoryHeader}>
        <View style={styles.invoiceHistoryHeaderTop}>
          <View style={styles.invoiceHistoryHeaderIcon}>
            <MaterialCommunityIcons name="file-document-multiple-outline" size={25} color="#FFFFFF" />
          </View>
          <View style={styles.invoiceHistoryHeaderCopy}>
            <Text style={styles.invoiceHistoryEyebrow}>Panel comercial</Text>
            <Text style={styles.invoiceHistoryTitle}>Mis facturas</Text>
            <Text style={styles.invoiceHistoryText}>Consulta tus comprobantes emitidos y ejecuta acciones del documento.</Text>
          </View>
        </View>
        <View style={styles.invoiceHistoryStats}>
          <InvoiceHistoryMetric value={filteredFacturas.length} label="Filtradas" />
          <InvoiceHistoryMetric value={formatMoney(total)} label="Monto" />
          <InvoiceHistoryMetric value={autorizadas} label="Autorizadas" />
        </View>
      </View>
      <View style={styles.invoiceHistoryFilterPanel}>
        <View style={styles.adminSearchHeader}>
          <View style={styles.adminSearchTitleBlock}>
            <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
            <Text style={styles.clientFormTitle}>Facturas generadas</Text>
          </View>
          <Pressable style={styles.adminActionPill} onPress={onRefresh}>
            <Text style={styles.adminActionText}>Refrescar</Text>
          </Pressable>
        </View>
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
        <View style={styles.formActions}>
          <SecondaryButton label="Limpiar filtros" onPress={() => { setFilter(''); setStatusFilter(1); }} />
        </View>
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
          const status = factura.estadoSri ?? (factura.autorizado ? 'AUTORIZADO' : 'PENDIENTE');

          return (
          <View key={facturaKey} style={styles.invoiceHistoryCard}>
            <View style={styles.invoiceHistoryCardHeader}>
              <View style={styles.invoiceHistoryIdentityRow}>
                <View style={styles.invoiceHistoryDocIcon}>
                  <MaterialCommunityIcons name="file-document-outline" size={21} color="#0072BD" />
                </View>
                <View style={styles.invoiceHistoryCardInfo}>
                  <Text style={styles.invoiceHistoryNumber} numberOfLines={1} adjustsFontSizeToFit>{factura.numeroCompleto ?? factura.numfactura ?? `Factura ${factura.codfactura}`}</Text>
                  <View style={[styles.invoiceHistoryStatusPill, getInvoiceStatusStyle(status)]}>
                    <Text style={[styles.invoiceHistoryStatusText, getInvoiceStatusTextStyle(status)]}>{status}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.invoiceHistoryClientBlock}>
                <Text style={styles.invoiceHistoryClient} numberOfLines={1}>{factura.cliente ?? 'Consumidor final'}</Text>
                <Text style={styles.invoiceHistoryId}>{factura.identificacionCliente ?? 'Sin identificacion'}</Text>
              </View>
            </View>
            <View style={styles.invoiceHistoryDetailGrid}>
              <View style={styles.invoiceHistoryDetailItem}>
                <Text style={styles.invoiceHistoryDetailLabel}>Fecha</Text>
                <Text style={styles.invoiceHistoryDetailValue}>{formatDocumentDate(factura.fechaEmision)}</Text>
              </View>
              <View style={styles.invoiceHistoryDetailItem}>
                <Text style={styles.invoiceHistoryDetailLabel}>Total</Text>
                <Text style={styles.invoiceHistoryAmount}>{formatMoney(factura.total)}</Text>
              </View>
            </View>
            <View style={styles.invoiceHistoryAuthorization}>
              <View style={styles.invoiceHistoryAuthorizationTextBlock}>
                <Text style={styles.invoiceHistoryDetailLabel}>Autorizacion</Text>
                <Text style={styles.invoiceHistoryAuthorizationText} numberOfLines={2}>
                  {factura.numeroAutorizacion || factura.mensajeSri || (factura.autorizado ? 'Autorizado sin numero registrado' : 'No disponible')}
                </Text>
              </View>
              <DocumentActionsMenu actions={[
                { label: 'Detalle', icon: 'information-outline', tone: 'primary', onPress: () => setSelectedFactura(factura) },
                { label: 'Ver PDF', icon: 'eye-outline', tone: 'primary', onPress: () => onPdf(factura) },
                { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(factura) },
                { label: 'Descargar PDF', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(factura) },
                { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(factura) },
                { label: 'Reintentar SRI', icon: 'send-check-outline', tone: 'primary', onPress: () => onRetrySri(factura) },
                { label: 'Anular factura', icon: 'trash-can-outline', tone: 'danger', onPress: () => onAnular(factura) },
              ]} />
            </View>
          </View>
          );
        })}
      </View>
      {filteredFacturas.length > pageSize ? (
        <View style={styles.documentPagination}>
          <Pressable style={[styles.documentPaginationButton, page === 1 && styles.documentPaginationButtonDisabled]} disabled={page === 1} onPress={() => setPage((value) => Math.max(1, value - 1))}>
            <MaterialCommunityIcons name="chevron-left" size={20} color={page === 1 ? '#AFC2CF' : '#0878C9'} />
          </Pressable>
          <Text style={styles.documentPaginationText}>Página {page} de {totalPages} · {filteredFacturas.length} facturas</Text>
          <Pressable style={[styles.documentPaginationButton, page === totalPages && styles.documentPaginationButtonDisabled]} disabled={page === totalPages} onPress={() => setPage((value) => Math.min(totalPages, value + 1))}>
            <MaterialCommunityIcons name="chevron-right" size={20} color={page === totalPages ? '#AFC2CF' : '#0878C9'} />
          </Pressable>
        </View>
      ) : null}
      <ItemDetailModal
        visible={Boolean(selectedFactura)}
        title={selectedFactura?.numeroCompleto ?? selectedFactura?.numfactura ?? 'Detalle de factura'}
        values={selectedFactura ? [
          `Cliente: ${selectedFactura.cliente ?? 'Consumidor final'}`,
          `Identificación: ${selectedFactura.identificacionCliente ?? 'Sin identificación'}`,
          `Fecha de emisión: ${formatDocumentDate(selectedFactura.fechaEmision)}`,
          `Total: ${formatMoney(selectedFactura.total)}`,
          `Estado SRI: ${selectedFactura.estadoSri ?? (selectedFactura.autorizado ? 'AUTORIZADO' : 'PENDIENTE')}`,
          `Estado de pago: ${selectedFactura.estadoPago ?? 'Sin información'}`,
          selectedFactura.numeroAutorizacion ? `Autorización: ${selectedFactura.numeroAutorizacion}` : '',
          selectedFactura.mensajeSri ? `Mensaje SRI: ${selectedFactura.mensajeSri}` : '',
        ].filter(Boolean) : []}
        onClose={() => setSelectedFactura(null)}
      />
    </>
  );
}

function InvoiceHistoryMetric({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.invoiceHistoryMetric}>
      <Text style={styles.invoiceHistoryMetricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.invoiceHistoryMetricLabel}>{label}</Text>
    </View>
  );
}

function getInvoiceStatusStyle(status: string) {
  const normalized = status.toLowerCase();
  if (isInvoiceStatusRejected(normalized)) return styles.invoiceHistoryStatusDanger;
  if (normalized.includes('autoriz')) return styles.invoiceHistoryStatusOk;
  return styles.invoiceHistoryStatusPending;
}

function getInvoiceStatusTextStyle(status: string) {
  const normalized = status.toLowerCase();
  if (isInvoiceStatusRejected(normalized)) return styles.invoiceHistoryStatusTextDanger;
  if (normalized.includes('autoriz')) return styles.invoiceHistoryStatusTextOk;
  return styles.invoiceHistoryStatusTextPending;
}

function isInvoiceStatusRejected(normalizedStatus: string) {
  return normalizedStatus.includes('no autoriz')
    || normalizedStatus.includes('sin autoriz')
    || normalizedStatus.includes('anul')
    || normalizedStatus.includes('rech')
    || normalizedStatus.includes('error');
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
    <View style={styles.crudCard}>
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
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${item.title || item.id}`} style={[styles.smallActionButton, styles.crudViewAction]} onPress={onView}>
          <MaterialCommunityIcons name="eye-outline" size={16} color="#00649D" />
          <Text style={styles.smallActionText}>Ver</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${item.title || item.id}`} style={[styles.smallActionButton, styles.crudEditAction]} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color="#6847FF" />
          <Text style={styles.smallActionText}>Editar</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar ${item.title || item.id}`} style={[styles.smallActionButton, styles.smallDangerButton]} onPress={onDelete}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#B4232D" />
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
  onRegisterPayment,
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
  onRegisterPayment?: (item: OperationalMobileItem) => void;
}) {
  const module = getOperationalModuleSlug(view);
  const config = module ? getOperationalScreenConfig(view, module) : null;
  const selectedTab = module ? activeTab ?? getOperationalDefaultTab(view, module) : activeTab;
  const capabilities = getOperationalCapabilities(view, selectedTab ?? '');
  const [detailItem, setDetailItem] = useState<OperationalMobileItem | null>(null);

  if (!config) return null;

  if (view === 'cuentas-cobrar') {
    return (
      <AccountsReceivableScreen
        search={search}
        items={items}
        loading={loading}
        saving={saving}
        message={message}
        activeTab={selectedTab ?? 'Cuentas por cobrar'}
        formMode={formMode}
        form={form}
        placeholder={config.placeholder}
        onRefresh={onRefresh}
        onSearch={onSearch}
        onTabChange={(tab) => {
          onCancel();
          onTabChange(tab);
        }}
        onCreate={onCreate}
        onCancel={onCancel}
        onChange={onChange}
        onSave={onSave}
        onRegisterPayment={onRegisterPayment}
      />
    );
  }

  if (view === 'estado-cuenta') {
    return (
      <AccountStatementScreen
        search={search}
        items={items}
        loading={loading}
        message={message}
        placeholder={config.placeholder}
        onRefresh={onRefresh}
        onSearch={onSearch}
        onRegisterPayment={onRegisterPayment}
      />
    );
  }

  if (view === 'recargas' && selectedTab === 'Historial') {
    return (
      <RechargeHistoryScreen
        search={search}
        items={items}
        loading={loading}
        message={message}
        placeholder={config.placeholder}
        onRefresh={onRefresh}
        onSearch={onSearch}
        onView={onView}
      />
    );
  }

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

function AccountsReceivableScreen({
  search,
  items,
  loading,
  saving,
  message,
  activeTab,
  formMode,
  form,
  placeholder,
  onRefresh,
  onSearch,
  onTabChange,
  onCreate,
  onCancel,
  onChange,
  onSave,
  onRegisterPayment,
}: {
  search: string;
  items: OperationalMobileItem[];
  loading: boolean;
  saving: boolean;
  message?: MessageState;
  activeTab: string;
  formMode: OperationalFormMode;
  form: OperationalFormState;
  placeholder: string;
  onRefresh: () => void;
  onSearch: (value: string) => void;
  onTabChange: (tab: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  onChange: (field: keyof OperationalFormState, value: string) => void;
  onSave: () => void;
  onRegisterPayment?: (item: OperationalMobileItem) => void;
}) {
  const totalBalance = items.reduce((total, item) => total + getAccountStatementAmount(item, ['saldoPendiente', 'SaldoPendiente', 'saldoActual', 'SaldoActual', 'saldo', 'Saldo'], item.meta), 0);
  const overdueItems = items.filter((item) => normalizeText(item.status || '').includes('venc'));
  const activeClients = new Set(items.map((item) => getAccountStatementClientId(item) || item.title).filter(Boolean)).size;
  const averageDays = Math.round(items.reduce((total, item) => total + getAccountStatementNumber(item, ['diasCobro', 'DiasCobro', 'diasPromedio', 'DiasPromedio', 'diasMora', 'DiasMora'], 0), 0) / Math.max(items.length, 1));
  const selectedTab = activeTab || 'Cuentas por cobrar';
  const activeStepIndex = formMode ? 1 : 0;

  return (
    <>
      <View style={styles.receivableHeroCard}>
        <Text style={styles.heroEyebrow}>Cuentas por cobrar</Text>
        <Text style={styles.receivableHeroTitle}>Registro de abonos</Text>
        <Text style={styles.receivableHeroText}>Avance paso a paso: seleccione el cliente, registre el pago, distribuya el valor y confirme el abono.</Text>
      </View>

      <View style={styles.receivableMetricGrid}>
        <ReceivableMetricCard icon="wallet-outline" label="Saldo total por cobrar" value={formatMoney(totalBalance)} tone="blue" helper={`${items.length} factura(s) pendientes`} />
        <ReceivableMetricCard icon="calendar-alert" label="Facturas vencidas" value={formatMoney(overdueItems.reduce((total, item) => total + getAccountStatementAmount(item, ['saldoPendiente', 'SaldoPendiente', 'saldo', 'Saldo'], item.meta), 0))} tone="red" helper={`${overdueItems.length} requieren atencion`} />
        <ReceivableMetricCard icon="timer-sand" label="Facturas por vencer" value={formatMoney(Math.max(totalBalance - overdueItems.reduce((total, item) => total + getAccountStatementAmount(item, ['saldoPendiente', 'SaldoPendiente', 'saldo', 'Saldo'], item.meta), 0), 0))} tone="orange" helper="Dentro de 30 dias" />
        <ReceivableMetricCard icon="account-cash-outline" label="Clientes con saldo" value={activeClients || items.length} tone="green" helper="Cartera activa visible" />
        <ReceivableMetricCard icon="chart-line" label="Dias promedio de cobro" value={`${averageDays || 0} dias`} tone="purple" helper="Promedio general" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminTabs}>
        {['Cuentas por cobrar', 'Abonos'].map((tab) => (
          <Pressable key={tab} style={[styles.adminTab, selectedTab === tab && styles.adminTabActive]} onPress={() => onTabChange(tab)}>
            <Text style={[styles.adminTabText, selectedTab === tab && styles.adminTabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {formMode ? (
        <View style={styles.receivableFormFlow}>
          <View style={styles.receivableFormColumn}>
            <OperationalForm
              title={formMode === 'edit' ? `Editar ${selectedTab}` : `Registrar ${selectedTab}`}
              form={form}
              saving={saving}
              onCancel={onCancel}
              onChange={onChange}
              onSave={onSave}
            />
          </View>
          <AccountsReceivableSteps activeIndex={activeStepIndex} compact />
        </View>
      ) : null}

      <View style={styles.receivableSearchPanel}>
        <View style={styles.adminSearchHeader}>
          <View style={styles.adminSearchTitleBlock}>
            <Text style={styles.clientFormSubtitle}>Busqueda y filtros</Text>
            <Text style={styles.clientFormTitle}>Encuentra tu cartera rapido</Text>
          </View>
          <Pressable style={styles.adminActionPill} onPress={onRefresh}>
            <Text style={styles.adminActionText}>Refrescar</Text>
          </Pressable>
        </View>
        <SearchField label="Buscar por cedula, RUC, nombre o factura" placeholder={placeholder} value={search} onChangeText={onSearch} resultCount={items.length} loading={loading} />
        <View style={styles.receivableFilterChips}>
          {['Todas', 'Vencidas', 'Por vencer', 'Vigentes'].map((filter) => (
            <View key={filter} style={[styles.clientFilterChip, filter === 'Todas' && styles.clientFilterChipActive]}>
              <Text style={[styles.clientFilterChipText, filter === 'Todas' && styles.clientFilterChipTextActive]}>{filter}</Text>
            </View>
          ))}
        </View>
        {message ? <MessageBox message={message} /> : null}
      </View>

      <View style={styles.receivableListPanel}>
        <View style={styles.clientListHeader}>
          <View>
            <Text style={styles.clientListEyebrow}>Cartera pendiente</Text>
            <Text style={styles.clientListTitle}>{selectedTab === 'Abonos' ? 'Registro de abonos' : 'Facturas por cobrar'}</Text>
          </View>
          <Text style={styles.clientListCount}>{items.length}</Text>
        </View>
        {loading ? <EmptyState title="Cargando cartera" text="Consultando facturas pendientes..." /> : null}
        {!loading && !message && items.length === 0 ? <EmptyState title="Sin cartera para mostrar" text="Cuando existan facturas pendientes, apareceran aqui." /> : null}
        {!loading && items.length > 0 ? (
          <ResultCollection
            items={items}
            resetKey={`cuentas-cobrar-${selectedTab}-${search}`}
            keyExtractor={(item, index) => `cuenta-cobrar-${item.id || 'item'}-${index}`}
            variant="plain"
            renderItem={(item) => (
              <ReceivableInvoiceCard
                item={item}
                onRegister={() => onRegisterPayment?.(item) ?? onCreate()}
              />
            )}
          />
        ) : null}
      </View>

      {!formMode ? <AccountsReceivableSteps activeIndex={activeStepIndex} /> : null}
    </>
  );
}

function AccountsReceivableSteps({ activeIndex, compact }: { activeIndex: number; compact?: boolean }) {
  return (
    <View style={[styles.receivableSteps, compact && styles.receivableStepsCompact]}>
      {[
        ['1', 'Identificar cliente', 'Buscar por cedula, RUC o nombre'],
        ['2', 'Registrar pago', 'Monto recibido y observacion'],
        ['3', 'Distribuir', 'Aplicar el abono por factura'],
        ['4', 'Confirmar', 'Registrar el abono final'],
      ].map(([number, title, text], index) => (
        <View key={number} style={[styles.receivableStep, compact && styles.receivableStepCompact, index === activeIndex && styles.receivableStepActive]}>
          <Text style={[styles.receivableStepNumber, index === activeIndex && styles.receivableStepNumberActive]}>{number}</Text>
          <View style={styles.receivableStepCopy}>
            <Text style={styles.receivableStepTitle}>{title}</Text>
            <Text style={styles.receivableStepText}>{text}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ReceivableMetricCard({ icon, label, value, tone, helper }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string | number; tone: 'blue' | 'red' | 'orange' | 'green' | 'purple'; helper: string }) {
  const toneStyle = tone === 'red' ? styles.receivableMetricRed : tone === 'orange' ? styles.receivableMetricOrange : tone === 'green' ? styles.receivableMetricGreen : tone === 'purple' ? styles.receivableMetricPurple : styles.receivableMetricBlue;
  const iconColor = tone === 'red' ? '#D92D3A' : tone === 'orange' ? '#D77416' : tone === 'green' ? '#0C8C57' : tone === 'purple' ? '#7448D8' : '#0870BE';

  return (
    <View style={[styles.receivableMetricCard, toneStyle]}>
      <View style={styles.receivableMetricHeader}>
        <Text style={styles.receivableMetricLabel}>{label}</Text>
        <MaterialCommunityIcons name={icon} size={16} color={iconColor} />
      </View>
      <Text style={styles.receivableMetricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.receivableMetricHelper}>{helper}</Text>
    </View>
  );
}

function ReceivableInvoiceCard({ item, onRegister }: { item: OperationalMobileItem; onRegister: () => void }) {
  const invoiceNumber = getAccountStatementText(item, ['numeroFactura', 'NumeroFactura', 'numeroDocumento', 'NumeroDocumento', 'factura', 'Factura']) || item.id || 'Factura';
  const client = getAccountStatementText(item, ['cliente', 'Cliente', 'nombreCliente', 'NombreCliente']) || item.title || 'Cliente';
  const identification = getAccountStatementText(item, ['numeroIdentificacion', 'NumeroIdentificacion', 'identificacion', 'Identificacion', 'ruc', 'Ruc']) || item.subtitle || 'Sin identificacion';
  const issueDate = getAccountStatementText(item, ['fechaEmision', 'FechaEmision', 'fecha', 'Fecha']) || '-';
  const dueDate = getAccountStatementText(item, ['fechaVencimiento', 'FechaVencimiento', 'vencimiento', 'Vencimiento']) || '-';
  const total = getAccountStatementDisplayMoney(item, ['total', 'Total', 'valorFacturado', 'ValorFacturado'], item.meta);
  const balance = getAccountStatementDisplayMoney(item, ['saldoPendiente', 'SaldoPendiente', 'saldoActual', 'SaldoActual', 'saldo', 'Saldo'], item.meta);
  const status = item.status || (normalizeText(dueDate).includes('-') ? 'Vigente' : 'Pendiente');
  const isOverdue = normalizeText(status).includes('venc');

  return (
    <View style={styles.receivableInvoiceCard}>
      <View style={styles.receivableInvoiceTop}>
        <View style={styles.receivableInvoiceIcon}>
          <MaterialCommunityIcons name="file-document-outline" size={20} color="#0870BE" />
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.receivableInvoiceNumber}>{invoiceNumber}</Text>
          <Text style={styles.clientName}>{client}</Text>
          <Text style={styles.clientMeta}>{identification}</Text>
        </View>
        <View style={[styles.accountStatusPill, isOverdue ? styles.accountStatusDanger : styles.receivableStatusOk]}>
          <Text style={[styles.accountStatusText, isOverdue ? styles.accountStatusTextDanger : styles.receivableStatusOkText]}>{status}</Text>
        </View>
      </View>
      <View style={styles.accountClientGrid}>
        <AccountClientStat label="Emision" value={issueDate} />
        <AccountClientStat label="Vencimiento" value={dueDate} />
        <AccountClientStat label="Total" value={total} />
        <AccountClientStat label="Saldo" value={balance} danger={isOverdue} />
      </View>
      <View style={styles.clientActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Registrar abono de ${invoiceNumber}`} style={[styles.smallActionButton, styles.smallSuccessButton]} onPress={onRegister}>
          <MaterialCommunityIcons name="cash-plus" size={16} color="#128A46" />
          <Text style={[styles.smallActionText, styles.smallSuccessText]}>Registrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AccountStatementScreen({
  search,
  items,
  loading,
  message,
  placeholder,
  onRefresh,
  onSearch,
  onRegisterPayment,
}: {
  search: string;
  items: OperationalMobileItem[];
  loading: boolean;
  message?: MessageState;
  placeholder: string;
  onRefresh: () => void;
  onSearch: (value: string) => void;
  onRegisterPayment?: (item: OperationalMobileItem) => void;
}) {
  const [detailItem, setDetailItem] = useState<OperationalMobileItem | null>(null);
  const visibleBalance = items.reduce((total, item) => total + getAccountStatementAmount(item, ['saldoTotalCliente', 'SaldoTotalCliente', 'saldoActual', 'SaldoActual', 'saldoPendiente', 'SaldoPendiente', 'saldo', 'Saldo'], item.meta), 0);
  const visibleInvoices = items.reduce((total, item) => total + getAccountStatementNumber(item, ['facturas', 'Facturas', 'facturasPendientes', 'FacturasPendientes', 'cantidadFacturas', 'CantidadFacturas'], 0), 0);
  const visiblePayments = items.reduce((total, item) => total + getAccountStatementNumber(item, ['abonos', 'Abonos', 'cantidadAbonos', 'CantidadAbonos'], 0), 0);

  return (
    <>
      <View style={styles.accountHeroCard}>
        <View style={styles.accountHeroCopy}>
          <Text style={styles.heroEyebrow}>Cuentas por cobrar</Text>
          <Text style={styles.accountHeroTitle}>Estado de cuenta por cliente</Text>
          <Text style={styles.accountHeroText}>Facturas, abonos y saldos por cliente.</Text>
        </View>
        <View style={styles.accountMetricGrid}>
          <AccountMetricCard icon="wallet-outline" label="Saldo visible" value={formatMoney(visibleBalance)} tone="blue" />
          <AccountMetricCard icon="account-group-outline" label="Clientes visibles" value={items.length} tone="green" />
          <AccountMetricCard icon="file-document-outline" label="Facturas visibles" value={visibleInvoices || items.length} tone="purple" />
          <AccountMetricCard icon="cash-check" label="Abonos visibles" value={visiblePayments} tone="orange" />
        </View>
      </View>

      <View style={styles.formSectionBox}>
        <View style={styles.adminSearchHeader}>
          <View style={styles.adminSearchTitleBlock}>
            <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
            <Text style={styles.clientFormTitle}>Filtros de estado</Text>
          </View>
          <Pressable style={styles.adminActionPill} onPress={onRefresh}>
            <Text style={styles.adminActionText}>Refrescar</Text>
          </Pressable>
        </View>
        <SearchField label="Buscar por cliente, RUC o factura" placeholder={placeholder} value={search} onChangeText={onSearch} resultCount={items.length} loading={loading} />
        {message ? <MessageBox message={message} /> : null}
      </View>

      <View style={styles.accountListPanel}>
        <View style={styles.clientListHeader}>
          <View>
            <Text style={styles.clientListEyebrow}>Listado por cliente</Text>
            <Text style={styles.clientListTitle}>Estado de cuenta</Text>
          </View>
          <Text style={styles.clientListCount}>{items.length}</Text>
        </View>
        {loading ? <EmptyState title="Cargando estados" text="Consultando saldos y movimientos..." /> : null}
        {!loading && !message && items.length === 0 ? <EmptyState title="Sin clientes para mostrar" text="Cuando existan saldos, apareceran aqui." /> : null}
        {!loading && items.length > 0 ? (
          <ResultCollection
            items={items}
            resetKey={`estado-cuenta-${search}`}
            keyExtractor={(item, index) => `estado-cuenta-${item.id || 'cliente'}-${index}`}
            variant="plain"
            renderItem={(item) => (
              <AccountStatementClientCard
                item={item}
                onView={() => setDetailItem(item)}
                onRegister={() => onRegisterPayment?.(item)}
              />
            )}
          />
        ) : null}
      </View>

      <AccountStatementDetailModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onRegister={() => {
          if (detailItem) onRegisterPayment?.(detailItem);
          setDetailItem(null);
        }}
      />
    </>
  );
}

function AccountMetricCard({ icon, label, value, tone }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string | number; tone: 'blue' | 'green' | 'purple' | 'orange' }) {
  const toneStyle = tone === 'green' ? styles.accountMetricGreen : tone === 'purple' ? styles.accountMetricPurple : tone === 'orange' ? styles.accountMetricOrange : styles.accountMetricBlue;

  return (
    <View style={styles.accountMetricCard}>
      <View style={[styles.accountMetricIcon, toneStyle]}>
        <MaterialCommunityIcons name={icon} size={17} color={tone === 'green' ? '#0C8C57' : tone === 'purple' ? '#7448D8' : tone === 'orange' ? '#D77416' : '#0870BE'} />
      </View>
      <Text style={styles.accountMetricLabel}>{label}</Text>
      <Text style={styles.accountMetricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

function AccountStatementClientCard({ item, onView, onRegister }: { item: OperationalMobileItem; onView: () => void; onRegister: () => void }) {
  const balance = getAccountStatementDisplayMoney(item, ['saldoTotalCliente', 'SaldoTotalCliente', 'saldoActual', 'SaldoActual', 'saldoPendiente', 'SaldoPendiente', 'saldo', 'Saldo'], item.meta);
  const totalBilled = getAccountStatementDisplayMoney(item, ['totalFacturado', 'TotalFacturado', 'valorFacturado', 'ValorFacturado', 'total', 'Total'], undefined);
  const totalPayments = getAccountStatementDisplayMoney(item, ['totalAbonos', 'TotalAbonos', 'abonos', 'Abonos'], undefined);
  const invoiceCount = getAccountStatementNumber(item, ['facturas', 'Facturas', 'facturasPendientes', 'FacturasPendientes', 'cantidadFacturas', 'CantidadFacturas'], 1);
  const identification = getAccountStatementText(item, ['numeroIdentificacion', 'NumeroIdentificacion', 'identificacion', 'Identificacion', 'ruc', 'Ruc', 'cedula', 'Cedula']) || item.subtitle || 'Sin identificacion';
  const status = item.status || (getAccountStatementAmount(item, ['saldoTotalCliente', 'SaldoTotalCliente', 'saldoActual', 'SaldoActual', 'saldoPendiente', 'SaldoPendiente', 'saldo', 'Saldo'], item.meta) > 0 ? 'Pendiente' : 'Al dia');
  const isOverdue = normalizeText(status).includes('venc');

  return (
    <View style={styles.accountClientCard}>
      <View style={styles.clientCardHeader}>
        <View style={styles.accountClientAvatar}>
          <MaterialCommunityIcons name="account-cash-outline" size={22} color="#0870BE" />
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.title || 'Cliente'}</Text>
          <Text style={styles.clientMeta}>{identification}</Text>
        </View>
        <View style={[styles.accountStatusPill, isOverdue ? styles.accountStatusDanger : styles.accountStatusPending]}>
          <Text style={[styles.accountStatusText, isOverdue ? styles.accountStatusTextDanger : styles.accountStatusTextPending]}>{status}</Text>
        </View>
      </View>
      <View style={styles.accountClientGrid}>
        <AccountClientStat label="Facturas" value={invoiceCount} />
        <AccountClientStat label="Facturado" value={totalBilled} />
        <AccountClientStat label="Abonos" value={totalPayments} />
        <AccountClientStat label="Saldo" value={balance} danger />
      </View>
      <View style={styles.clientActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${item.title || item.id}`} style={[styles.smallActionButton, styles.crudViewAction]} onPress={onView}>
          <MaterialCommunityIcons name="eye-outline" size={16} color="#00649D" />
          <Text style={styles.smallActionText}>Ver</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Registrar abono de ${item.title || item.id}`} style={[styles.smallActionButton, styles.smallSuccessButton]} onPress={onRegister}>
          <MaterialCommunityIcons name="cash-plus" size={16} color="#128A46" />
          <Text style={[styles.smallActionText, styles.smallSuccessText]}>Registrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AccountClientStat({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <View style={styles.accountClientStat}>
      <Text style={styles.accountClientStatLabel}>{label}</Text>
      <Text style={[styles.accountClientStatValue, danger && styles.accountClientStatDanger]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

function AccountStatementDetailModal({ item, onClose, onRegister }: { item: OperationalMobileItem | null; onClose: () => void; onRegister: () => void }) {
  const [activeTab, setActiveTab] = useState<AccountStatementTab>('Historial');
  useEffect(() => {
    if (item) setActiveTab('Historial');
  }, [item]);
  const movements = item ? getAccountStatementMovements(item) : [];
  const invoices = item ? getAccountStatementInvoices(item) : [];
  const payments = item ? getAccountStatementPayments(item) : [];
  const balance = item ? getAccountStatementDisplayMoney(item, ['saldoTotalCliente', 'SaldoTotalCliente', 'saldoActual', 'SaldoActual', 'saldoPendiente', 'SaldoPendiente', 'saldo', 'Saldo'], item.meta) : '$ 0,00';
  const invoiceCount = item ? getAccountStatementNumber(item, ['facturas', 'Facturas', 'facturasPendientes', 'FacturasPendientes', 'cantidadFacturas', 'CantidadFacturas'], movements.length || 1) : 0;
  const lastPayment = item ? getAccountStatementDisplayMoney(item, ['ultimoAbono', 'UltimoAbono', 'ultimoPago', 'UltimoPago', 'valorUltimoAbono', 'ValorUltimoAbono'], '$ 0,00') : '$ 0,00';
  const daysOverdue = item ? getAccountStatementText(item, ['diasVencidos', 'DiasVencidos', 'diasMora', 'DiasMora']) || '0 dias' : '0 dias';
  const email = item ? getAccountStatementText(item, ['email', 'Email', 'correo', 'Correo']) : '';
  const identification = item ? getAccountStatementText(item, ['numeroIdentificacion', 'NumeroIdentificacion', 'identificacion', 'Identificacion', 'ruc', 'Ruc']) || item.subtitle : '';
  const totalBilled = item ? getAccountStatementDisplayMoney(item, ['totalFacturado', 'TotalFacturado', 'valorFacturado', 'ValorFacturado', 'total', 'Total'], balance) : '$ 0,00';
  const totalPaid = item ? getAccountStatementDisplayMoney(item, ['totalAbonos', 'TotalAbonos', 'totalAbonado', 'TotalAbonado', 'abonos', 'Abonos'], '$ 0,00') : '$ 0,00';
  const creditBalance = item ? getAccountStatementDisplayMoney(item, ['saldoFavor', 'SaldoFavor', 'saldoAFavor', 'SaldoAFavor'], '$ 0,00') : '$ 0,00';
  const settledDocuments = item ? getAccountStatementNumber(item, ['documentosSaldados', 'DocumentosSaldados', 'facturasSaldadas', 'FacturasSaldadas'], 0) : 0;

  return (
    <Modal visible={Boolean(item)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.accountModalOverlay}>
        <Pressable style={styles.detailModalBackdrop} onPress={onClose} />
        <View style={styles.accountModalCard}>
          <View style={styles.accountModalHeader}>
            <View style={styles.detailModalTitleWrap}>
              <Text style={styles.detailModalEyebrow}>ESTADO DE CUENTA</Text>
              <Text style={styles.accountModalTitle} numberOfLines={2}>{item?.title || 'Cliente'}</Text>
              <Text style={styles.clientMeta}>{identification ? `RUC/CI: ${identification}` : 'Sin identificacion'}</Text>
            </View>
            <Pressable accessibilityLabel="Cerrar detalle" style={styles.detailModalClose} onPress={onClose}>
              <Text style={styles.detailModalCloseText}>×</Text>
            </Pressable>
          </View>
          <View style={styles.accountModalChips}>
            {email ? <AccountInfoChip icon="email-outline" label={email} /> : null}
            <AccountInfoChip icon="file-document-outline" label={`${invoiceCount} factura(s)`} />
            <AccountInfoChip icon="wallet-outline" label={balance} />
          </View>
          <View style={styles.accountModalStats}>
            <AccountModalStat icon="wallet-outline" label="Saldo total" value={balance} danger />
            <AccountModalStat icon="file-document-outline" label="Facturas pendientes" value={invoiceCount} />
            <AccountModalStat icon="calendar-check-outline" label="Ultimo abono" value={lastPayment} />
            <AccountModalStat icon="clock-outline" label="Dias vencidos" value={daysOverdue} success={String(daysOverdue).startsWith('0')} />
          </View>
          <View style={styles.accountModalTabs}>
            {(['Historial', 'Facturas', 'Abonos', 'Resumen'] as AccountStatementTab[]).map((tab) => (
              <Pressable key={tab} style={[styles.accountModalTab, activeTab === tab && styles.accountModalTabActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.accountModalTabText, activeTab === tab && styles.accountModalTabTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </View>
          {activeTab === 'Historial' ? <AccountStatementHistory movements={movements} /> : null}
          {activeTab === 'Facturas' ? <AccountStatementInvoices invoices={invoices} /> : null}
          {activeTab === 'Abonos' ? <AccountStatementPayments payments={payments} /> : null}
          {activeTab === 'Resumen' ? (
            <View style={styles.accountSummaryGrid}>
              <AccountSummaryBox label="Total facturado" value={totalBilled} />
              <AccountSummaryBox label="Total abonado" value={totalPaid} />
              <AccountSummaryBox label="Saldo a favor" value={creditBalance} />
              <AccountSummaryBox label="Documentos saldados" value={settledDocuments} />
            </View>
          ) : null}
          <View style={styles.accountModalActions}>
            <Pressable style={[styles.accountModalActionButton, styles.accountModalRegisterButton]} onPress={onRegister}>
              <MaterialCommunityIcons name="cash-plus" size={17} color="#128A46" />
              <Text style={styles.accountModalRegisterText}>Registrar abono</Text>
            </Pressable>
            <Pressable style={styles.accountModalActionButton} onPress={() => Alert.alert('Estado de cuenta', 'Envio de estado de cuenta pendiente de conectar en movil.')}>
              <MaterialCommunityIcons name="email-outline" size={17} color="#315A7A" />
              <Text style={styles.accountModalActionText}>Enviar estado</Text>
            </Pressable>
            <Pressable style={styles.accountModalActionButton} onPress={() => Alert.alert('Estado de cuenta', 'Descarga PDF pendiente de conectar en movil.')}>
              <MaterialCommunityIcons name="download-outline" size={17} color="#315A7A" />
              <Text style={styles.accountModalActionText}>Descargar PDF</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type AccountStatementTab = 'Historial' | 'Facturas' | 'Abonos' | 'Resumen';

type AccountStatementMovement = {
  date: string;
  document: string;
  concept: string;
  debit?: string;
  credit?: string;
  balance: string;
  status?: string;
};

function AccountStatementHistory({ movements }: { movements: AccountStatementMovement[] }) {
  return (
    <View style={styles.accountMovementTable}>
      <View style={styles.accountMovementHeader}>
        <Text style={styles.accountMovementHeaderText}>Fecha</Text>
        <Text style={styles.accountMovementHeaderText}>Documento</Text>
        <Text style={styles.accountMovementHeaderText}>Saldo</Text>
      </View>
      {movements.map((movement, index) => (
        <View key={`movement-${index}`} style={styles.accountMovementRow}>
          <Text style={styles.accountMovementText}>{movement.date}</Text>
          <View style={styles.accountMovementDocument}>
            <Text style={styles.accountMovementTitle}>{movement.document}</Text>
            <Text style={styles.accountMovementConcept}>{movement.concept}</Text>
          </View>
          <Text style={styles.accountMovementAmount}>{movement.balance}</Text>
        </View>
      ))}
    </View>
  );
}

function AccountStatementInvoices({ invoices }: { invoices: AccountStatementMovement[] }) {
  return (
    <View style={styles.accountTabList}>
      {invoices.map((invoice, index) => (
        <View key={`invoice-${index}`} style={styles.accountDocumentCard}>
          <View style={styles.accountDocumentMain}>
            <Text style={styles.accountDocumentTitle}>{invoice.document}</Text>
            <Text style={styles.accountDocumentMeta}>{invoice.date} · vence {invoice.concept || '-'}</Text>
          </View>
          <View style={styles.accountDocumentRight}>
            <Text style={styles.accountDocumentAmount}>{invoice.balance}</Text>
            <View style={[styles.accountStatusPill, styles.accountStatusPending]}>
              <Text style={[styles.accountStatusText, styles.accountStatusTextPending]}>{invoice.status || 'Pendiente'}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function AccountStatementPayments({ payments }: { payments: AccountStatementMovement[] }) {
  if (!payments.length) {
    return <View style={styles.accountEmptyTab}><Text style={styles.accountEmptyTabText}>Sin abonos registrados para este cliente.</Text></View>;
  }

  return (
    <View style={styles.accountMovementTable}>
      <View style={styles.accountMovementHeader}>
        <Text style={styles.accountMovementHeaderText}>Fecha</Text>
        <Text style={styles.accountMovementHeaderText}>Abono</Text>
        <Text style={styles.accountMovementHeaderText}>Valor</Text>
      </View>
      {payments.map((payment, index) => (
        <View key={`payment-${index}`} style={styles.accountMovementRow}>
          <Text style={styles.accountMovementText}>{payment.date}</Text>
          <View style={styles.accountMovementDocument}>
            <Text style={styles.accountMovementTitle}>{payment.document}</Text>
            <Text style={styles.accountMovementConcept}>{payment.concept}</Text>
          </View>
          <Text style={styles.accountMovementAmount}>{payment.credit || payment.balance}</Text>
        </View>
      ))}
    </View>
  );
}

function AccountSummaryBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.accountSummaryBox}>
      <Text style={styles.accountSummaryLabel}>{label}</Text>
      <Text style={styles.accountSummaryValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

function AccountInfoChip({ icon, label }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string }) {
  return (
    <View style={styles.accountInfoChip}>
      <MaterialCommunityIcons name={icon} size={14} color="#0870BE" />
      <Text style={styles.accountInfoChipText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function AccountModalStat({ icon, label, value, danger, success }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string | number; danger?: boolean; success?: boolean }) {
  return (
    <View style={styles.accountModalStat}>
      <View style={[styles.accountMetricIcon, success ? styles.accountMetricGreen : danger ? styles.accountMetricOrange : styles.accountMetricBlue]}>
        <MaterialCommunityIcons name={icon} size={16} color={success ? '#0C8C57' : danger ? '#D92D3A' : '#0870BE'} />
      </View>
      <View style={styles.accountModalStatCopy}>
        <Text style={styles.accountMetricLabel}>{label}</Text>
        <Text style={[styles.accountModalStatValue, danger && styles.accountClientStatDanger, success && styles.accountModalStatSuccess]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      </View>
    </View>
  );
}

function getAccountStatementClientId(item: OperationalMobileItem) {
  return getAccountStatementText(item, ['idCliente', 'IdCliente', 'codCliente', 'CodCliente', 'codigoCliente', 'CodigoCliente']) || item.id || '';
}

function getAccountStatementText(item: OperationalMobileItem, keys: string[]) {
  const value = getAccountStatementRawValue(item, keys);
  return value === null || value === undefined ? '' : String(value);
}

function getAccountStatementNumber(item: OperationalMobileItem, keys: string[], fallback: number) {
  const value = getAccountStatementRawValue(item, keys);
  const numberValue = parseAccountStatementNumber(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function getAccountStatementAmount(item: OperationalMobileItem, keys: string[], fallback?: unknown) {
  const value = getAccountStatementRawValue(item, keys);
  const parsed = parseAccountStatementMoney(value);
  if (Number.isFinite(parsed)) return parsed;
  const fallbackParsed = parseAccountStatementMoney(fallback);
  return Number.isFinite(fallbackParsed) ? fallbackParsed : 0;
}

function getAccountStatementDisplayMoney(item: OperationalMobileItem, keys: string[], fallback?: unknown) {
  const value = getAccountStatementRawValue(item, keys);
  const parsed = parseAccountStatementMoney(value);
  if (Number.isFinite(parsed)) return formatMoney(parsed);
  const fallbackParsed = parseAccountStatementMoney(fallback);
  if (Number.isFinite(fallbackParsed)) return formatMoney(fallbackParsed);
  return typeof fallback === 'string' && fallback.trim() ? fallback : '$ 0,00';
}

function getAccountStatementRawValue(item: OperationalMobileItem, keys: string[]) {
  const row = item.raw ?? {};
  for (const key of keys) {
    if (row[key] !== null && row[key] !== undefined) return row[key];
  }
  const normalized = keys.map((key) => normalizeText(key));
  return Object.entries(row).find(([key, value]) => value !== null && value !== undefined && normalized.includes(normalizeText(key)))?.[1];
}

function parseAccountStatementNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return Number.NaN;
  const parsed = Number(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseAccountStatementMoney(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return Number.NaN;
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\.(?=.*\.)/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function getAccountStatementMovements(item: OperationalMobileItem) {
  const rawMovements = getAccountStatementRawValue(item, ['movimientos', 'Movimientos', 'historial', 'Historial', 'detalle', 'Detalle']);
  const rows = Array.isArray(rawMovements) ? rawMovements.filter((value): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)) : [];
  const balance = getAccountStatementDisplayMoney(item, ['saldoTotalCliente', 'SaldoTotalCliente', 'saldoActual', 'SaldoActual', 'saldoPendiente', 'SaldoPendiente', 'saldo', 'Saldo'], item.meta);
  const fallbackRow = {
    date: getAccountStatementText(item, ['fecha', 'Fecha', 'fechaEmision', 'FechaEmision', 'fechaUltimoAbono', 'FechaUltimoAbono']) || '-',
    document: getAccountStatementText(item, ['numeroFactura', 'NumeroFactura', 'numeroDocumento', 'NumeroDocumento', 'documento', 'Documento']) || item.detail || item.id || 'Factura',
    concept: 'Factura',
    balance,
  };

  if (!rows.length) return [fallbackRow];

  return rows.slice(0, 4).map((row) => {
    const movementItem: OperationalMobileItem = { id: '', title: '', raw: row };
    return {
      date: getAccountStatementText(movementItem, ['fecha', 'Fecha', 'fechaEmision', 'FechaEmision']) || '-',
      document: getAccountStatementText(movementItem, ['documento', 'Documento', 'numeroDocumento', 'NumeroDocumento', 'numeroFactura', 'NumeroFactura']) || 'Movimiento',
      concept: getAccountStatementText(movementItem, ['concepto', 'Concepto', 'tipo', 'Tipo']) || 'Movimiento',
      debit: getAccountStatementDisplayMoney(movementItem, ['debito', 'Debito', 'debe', 'Debe'], '$ 0,00'),
      credit: getAccountStatementDisplayMoney(movementItem, ['credito', 'Credito', 'haber', 'Haber'], '$ 0,00'),
      balance: getAccountStatementDisplayMoney(movementItem, ['saldo', 'Saldo', 'saldoActual', 'SaldoActual'], balance),
    };
  });
}

function getAccountStatementInvoices(item: OperationalMobileItem): AccountStatementMovement[] {
  const rawInvoices = getAccountStatementRawValue(item, ['facturasDetalle', 'FacturasDetalle', 'facturas', 'Facturas', 'documentos', 'Documentos']);
  const rows = Array.isArray(rawInvoices) ? rawInvoices.filter((value): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)) : [];
  if (!rows.length) {
    return getAccountStatementMovements(item).map((movement) => ({ ...movement, status: item.status || 'Pendiente' }));
  }

  return rows.slice(0, 4).map((row) => {
    const invoiceItem: OperationalMobileItem = { id: '', title: '', raw: row };
    return {
      date: getAccountStatementText(invoiceItem, ['fecha', 'Fecha', 'fechaEmision', 'FechaEmision']) || '-',
      document: getAccountStatementText(invoiceItem, ['numeroFactura', 'NumeroFactura', 'numeroDocumento', 'NumeroDocumento', 'documento', 'Documento']) || 'Factura',
      concept: getAccountStatementText(invoiceItem, ['fechaVencimiento', 'FechaVencimiento', 'vence', 'Vence']) || '-',
      balance: getAccountStatementDisplayMoney(invoiceItem, ['saldo', 'Saldo', 'saldoPendiente', 'SaldoPendiente', 'total', 'Total'], '$ 0,00'),
      status: getAccountStatementText(invoiceItem, ['estado', 'Estado', 'estadoPago', 'EstadoPago']) || 'Pendiente',
    };
  });
}

function getAccountStatementPayments(item: OperationalMobileItem): AccountStatementMovement[] {
  const rawPayments = getAccountStatementRawValue(item, ['abonosDetalle', 'AbonosDetalle', 'pagos', 'Pagos', 'abonos', 'Abonos']);
  const rows = Array.isArray(rawPayments) ? rawPayments.filter((value): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)) : [];

  return rows.slice(0, 4).map((row) => {
    const paymentItem: OperationalMobileItem = { id: '', title: '', raw: row };
    return {
      date: getAccountStatementText(paymentItem, ['fecha', 'Fecha', 'fechaAbono', 'FechaAbono', 'fechaPago', 'FechaPago']) || '-',
      document: getAccountStatementText(paymentItem, ['numero', 'Numero', 'comprobante', 'Comprobante', 'documento', 'Documento']) || 'Abono',
      concept: getAccountStatementText(paymentItem, ['observacion', 'Observacion', 'formaPago', 'FormaPago', 'concepto', 'Concepto']) || 'Abono registrado',
      credit: getAccountStatementDisplayMoney(paymentItem, ['valor', 'Valor', 'monto', 'Monto', 'credito', 'Credito'], '$ 0,00'),
      balance: getAccountStatementDisplayMoney(paymentItem, ['saldo', 'Saldo'], '$ 0,00'),
    };
  });
}

function RechargeHistoryScreen({
  search,
  items,
  loading,
  message,
  placeholder,
  onRefresh,
  onSearch,
  onView,
}: {
  search: string;
  items: OperationalMobileItem[];
  loading: boolean;
  message?: MessageState;
  placeholder: string;
  onRefresh: () => void;
  onSearch: (value: string) => void;
  onView: (item: OperationalMobileItem) => void;
}) {
  return (
    <>
      <View style={styles.rechargeHistoryHeader}>
        <View style={styles.rechargeHistoryHeaderIcon}>
          <MaterialCommunityIcons name="history" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.rechargeHistoryHeaderCopy}>
          <Text style={styles.rechargeHistoryHeaderEyebrow}>Mi historial de compras</Text>
          <Text style={styles.rechargeHistoryHeaderTitle}>Ultimos movimientos</Text>
          <Text style={styles.rechargeHistoryHeaderText}>Consulta tus recargas realizadas y el saldo aplicado.</Text>
        </View>
        <View style={styles.rechargeHistoryCountPill}>
          <Text style={styles.rechargeHistoryCountValue}>{items.length}</Text>
          <Text style={styles.rechargeHistoryCountLabel}>compras</Text>
        </View>
      </View>
      <View style={styles.rechargeHistoryToolbar}>
        <View style={styles.adminSearchHeader}>
          <View style={styles.adminSearchTitleBlock}>
            <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
            <Text style={styles.clientFormTitle}>Historial</Text>
          </View>
          <Pressable style={styles.adminActionPill} onPress={onRefresh}>
            <Text style={styles.adminActionText}>Refrescar</Text>
          </Pressable>
        </View>
        <SearchField label="Buscar en Historial" placeholder={placeholder} value={search} onChangeText={onSearch} resultCount={items.length} loading={loading} />
        {message ? <MessageBox message={message} /> : null}
      </View>
      {loading ? <EmptyState title="Cargando recargas" text="Consultando tu historial de compras..." /> : null}
      {!loading && !message && items.length === 0 ? <EmptyState title="Sin recargas para mostrar" text="Cuando compres documentos, apareceran aqui." /> : null}
      {!loading && items.length > 0 ? (
        <ResultCollection
          items={items}
          resetKey={`recargas-historial-${search}`}
          keyExtractor={(item, index) => `recarga-${item.id || 'item'}-${index}`}
          renderItem={(item) => <RechargeHistoryItemCard item={item} onPress={() => onView(item)} />}
        />
      ) : null}
    </>
  );
}

function RechargeHistoryItemCard({ item, onPress }: { item: OperationalMobileItem; onPress: () => void }) {
  const dateSource = getRechargeValue(item, ['fecha', 'Fecha', 'fechaCompra', 'FechaCompra', 'fechaRegistro', 'FechaRegistro', 'createdAt', 'CreatedAt']) || item.subtitle;
  const status = getRechargeStatus(item);

  return (
    <Pressable style={styles.rechargeHistoryCard} onPress={onPress}>
      <View style={styles.rechargeHistoryCardTop}>
        <View>
          <Text style={styles.rechargeHistoryDate}>{formatRechargeDate(dateSource)}</Text>
          <Text style={styles.rechargeHistoryTime}>{formatRechargeTime(dateSource)}</Text>
        </View>
        <View style={[styles.rechargeHistoryStatusPill, getRechargeStatusStyle(status)]}>
          <Text style={getRechargeStatusTextStyle(status)}>{status}</Text>
        </View>
      </View>
      <Text style={styles.rechargeHistoryTitle}>{item.title || 'Recarga documental'}</Text>
      <Text style={styles.rechargeHistorySubtitle}>Recarga documental</Text>
      <View style={styles.rechargeHistoryMetrics}>
        <View style={styles.rechargeHistoryMetric}>
          <Text style={styles.rechargeHistoryMetricLabel}>Documentos</Text>
          <Text style={styles.rechargeHistoryMetricValue}>{getRechargeDocuments(item)}</Text>
        </View>
        <View style={styles.rechargeHistoryMetric}>
          <Text style={styles.rechargeHistoryMetricLabel}>Total</Text>
          <Text style={styles.rechargeHistoryMetricValue}>{getRechargeTotal(item)}</Text>
        </View>
      </View>
      <View style={styles.rechargeHistoryFoot}>
        <RechargeHistoryDetail label="Saldo aplicado" value={getRechargeValue(item, ['saldoAplicado', 'SaldoAplicado', 'aplicado', 'Aplicado']) || 'No'} />
        <RechargeHistoryDetail label="Referencia" value={getRechargeValue(item, ['referencia', 'Referencia', 'comprobante', 'Comprobante']) || 'Sin referencia'} />
        <RechargeHistoryDetail label="Autorizacion" value={getRechargeValue(item, ['autorizacion', 'Autorizacion', 'numeroAutorizacion', 'NumeroAutorizacion']) || item.detail || 'Sin autorizacion'} />
      </View>
    </Pressable>
  );
}

function RechargeHistoryDetail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rechargeHistoryFootRow}>
      <Text style={styles.rechargeHistoryFootLabel}>{label}</Text>
      <Text style={styles.rechargeHistoryFootValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function getRechargeValue(item: OperationalMobileItem, keys: string[]) {
  const row = item.raw ?? {};
  const normalizedKeys = keys.map(normalizeRechargeKey);
  const entry = Object.entries(row).find(([key, value]) => value !== null && value !== undefined && normalizedKeys.includes(normalizeRechargeKey(key)));
  if (entry?.[1] !== null && entry?.[1] !== undefined) return String(entry[1]);
  return '';
}

function normalizeRechargeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getRechargeDocuments(item: OperationalMobileItem) {
  return getRechargeValue(item, ['documentos', 'Documentos', 'cantidadDocumentos', 'CantidadDocumentos', 'cantidad', 'Cantidad']) || item.meta || '-';
}

function getRechargeTotal(item: OperationalMobileItem) {
  const total = getRechargeValue(item, ['total', 'Total', 'monto', 'Monto', 'valor', 'Valor', 'valorRecarga', 'ValorRecarga', 'montoTotal', 'MontoTotal']);
  const parsed = Number(String(total || item.meta || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? formatMoney(parsed) : total || item.meta || '-';
}

function getRechargeStatus(item: OperationalMobileItem) {
  return getRechargeValue(item, ['estado', 'Estado', 'status', 'Status']) || item.status || 'Pendiente';
}

function getRechargeStatusStyle(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('apro') || normalized.includes('pag') || normalized.includes('aplic')) return styles.rechargeHistoryStatusOk;
  if (normalized.includes('rech') || normalized.includes('anul') || normalized.includes('error')) return styles.rechargeHistoryStatusDanger;
  return styles.rechargeHistoryStatusPending;
}

function getRechargeStatusTextStyle(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('apro') || normalized.includes('pag') || normalized.includes('aplic')) return styles.rechargeHistoryStatusTextOk;
  if (normalized.includes('rech') || normalized.includes('anul') || normalized.includes('error')) return styles.rechargeHistoryStatusTextDanger;
  return styles.rechargeHistoryStatusTextPending;
}

function formatRechargeDate(value?: string | null) {
  if (!value) return '-';
  return formatDocumentDate(value);
}

function formatRechargeTime(value?: string | null) {
  if (!value) return '--:--';
  const source = String(value);
  const dotNetMatch = /\/Date\((\d+)\)\//.exec(source);
  const date = dotNetMatch ? new Date(Number(dotNetMatch[1])) : new Date(source);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  }
  const timeMatch = /(\d{1,2}:\d{2})/.exec(source);
  return timeMatch?.[1] ?? '--:--';
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
  const unlimited = form.descripcion.toLowerCase().includes('ilimit');
  const selectedPlanKey = unlimited ? 'unlimited' : `${documents}:${amount}`;

  return (
    <View style={styles.rechargePage}>
      <View style={styles.rechargeStatusBand}>
        <View style={styles.rechargeStatusIcon}>
          <MaterialCommunityIcons name="file-document-plus-outline" size={24} color="#0072BD" />
        </View>
        <View style={styles.rechargeStatusCopy}>
          <Text style={styles.rechargeEyebrow}>Compra documentos por recarga</Text>
          <Text style={styles.rechargeStatusTitle}>Saldo acreditado al aprobarse el pago</Text>
        </View>
        <View style={styles.rechargeStatusPill}>
          <Text style={styles.rechargeStatusPillText}>IVA incluido</Text>
        </View>
      </View>

      <View style={styles.rechargeHero}>
        <View style={styles.rechargeHeroHeader}>
          <View style={styles.rechargeStepBadge}>
            <Text style={styles.rechargeStepBadgeText}>1</Text>
          </View>
          <Text style={styles.rechargeEyebrow}>Recarga personalizada</Text>
        </View>
        <View style={styles.rechargeHeroCopy}>
          <Text style={styles.rechargeTitle}>Compra por documentos o por dinero</Text>
          <Text style={styles.rechargeText}>Edita cualquiera de los dos valores y el sistema calcula automáticamente el otro.</Text>
        </View>
        <View style={styles.rechargeInputs}>
          <View style={styles.rechargeInputBlock}>
            <Field label="¿Cuántos documentos deseas comprar?" value={form.codigo} onChangeText={(value) => onChange('codigo', value)} keyboardType="number-pad" />
            <Text style={styles.rechargeHint}>Mínimo 11 documentos (equivalente a una recarga desde $5,00)</Text>
          </View>
          <View style={styles.rechargeInputBlock}>
            <Field label="Valor de la recarga" value={form.valor} onChangeText={(value) => onChange('valor', value)} keyboardType="decimal-pad" />
            <Text style={styles.rechargeHint}>Monto mínimo de recarga: $5,00</Text>
          </View>
        </View>
      </View>

      <View style={styles.rechargeSummary}>
        <Text style={styles.rechargeEyebrow}>Resumen de compra</Text>
        <Text style={styles.rechargeSummaryTitle}>{documents || amount ? 'Tu recarga' : 'Selecciona una opción'}</Text>
        <View style={styles.rechargeSummaryHero}>
          <View>
            <Text style={styles.rechargeSummaryLabel}>Total a pagar</Text>
            <Text style={styles.rechargeSummaryTotal}>USD ${total.toFixed(2)}</Text>
          </View>
          <View style={styles.rechargeDocsPill}>
            <Text style={styles.rechargeDocsPillValue}>{unlimited ? '∞' : documents || 0}</Text>
            <Text style={styles.rechargeDocsPillLabel}>{unlimited ? 'documentos' : 'docs'}</Text>
          </View>
        </View>
        <View style={styles.rechargeSummaryRow}><Text style={styles.rechargeSummaryLabel}>Documentos</Text><Text style={styles.rechargeSummaryValue}>{unlimited ? 'Ilimitados' : documents || 0}</Text></View>
        <View style={styles.rechargeSummaryRow}><Text style={styles.rechargeSummaryLabel}>Vigencia</Text><Text style={styles.rechargeSummaryValue}>{unlimited ? '1 año' : 'Saldo disponible'}</Text></View>
        {localMessage ? <MessageBox message={localMessage} /> : null}
        {message ? <MessageBox message={message} /> : null}
        <PrimaryButton label="Confirmar recarga" loading={saving} onPress={confirm} />
        <View style={styles.rechargeSecureRow}>
          <MaterialCommunityIcons name="lock-check-outline" size={17} color="#7890A4" />
          <Text style={styles.rechargeSecure}>Pago 100% seguro{`\n`}El saldo se acredita automáticamente al aprobarse el pago.</Text>
        </View>
      </View>

      <View style={styles.rechargeSectionHeader}>
        <View>
          <Text style={styles.rechargeEyebrow}>Opciones recomendadas</Text>
          <Text style={styles.rechargeSectionTitle}>Elige una recarga rápida</Text>
        </View>
        <Text style={styles.rechargeVatHint}>Precios finales con IVA incluido</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rechargePlanGrid}
        decelerationRate="fast"
      >
        {plans.map((plan) => (
          <View key={plan.unlimited ? 'unlimited' : plan.documents} style={[styles.rechargePlan, { backgroundColor: plan.color }, selectedPlanKey === (plan.unlimited ? 'unlimited' : `${plan.documents}:${plan.amount}`) ? styles.rechargePlanSelected : null]}>
            <View style={styles.rechargePlanTop}>
              <View style={styles.rechargePlanIcon}>
                <MaterialCommunityIcons name={plan.unlimited ? 'creation' : plan.recommended ? 'briefcase-check-outline' : 'file-document-multiple-outline'} size={19} color="#0072BD" />
              </View>
              {plan.recommended ? <Text style={styles.rechargePlanBadge}>Recomendado</Text> : null}
            </View>
            {plan.unlimited ? <Text style={styles.rechargePlanDocuments}>Ilimitados</Text> : <Text style={styles.rechargePlanDocuments}>{plan.documents}</Text>}
            {!plan.unlimited ? <Text style={styles.rechargePlanUnit}>documentos</Text> : <Text style={styles.rechargePlanUnit}>durante 1 año</Text>}
            <Text style={styles.rechargePlanAmount}>USD ${plan.amount.toFixed(2)}</Text>
            <Text style={styles.rechargePlanCaption}>{plan.caption}</Text>
            <SecondaryButton label="Elegir plan  →" onPress={() => selectPlan(plan)} />
          </View>
        ))}
      </ScrollView>

    </View>
  );
}

function getOperationalCapabilities(view: WorkspaceView, tab: string) {
  const readOnlyViews: WorkspaceView[] = ['estado-cuenta', 'reportes', 'centro-normativo'];
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

function PortalStatusPill({ icon, label }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string }) {
  return (
    <View style={styles.portalStatusPill}>
      <MaterialCommunityIcons name={icon} size={15} color={EFACT_THEME.colors.primary} />
      <Text style={styles.portalStatusPillText}>{label}</Text>
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
      <View style={[styles.portalServiceTop, { backgroundColor: visual.accent }]}>
        <View style={[styles.portalServiceLogoPlate, { backgroundColor: visual.surface }]}>
          {visual.kind === 'efact' ? <Image source={require('./assets/logo-numerica.png')} style={styles.portalServiceLogo} /> : null}
          {visual.kind === 'orange' ? <Image source={require('./assets/logo-numerica-naranja.png')} style={styles.portalServiceLogo} /> : null}
          {visual.kind === 'green' ? <Image source={require('./assets/logo-numerica-verde.png')} style={styles.portalServiceLogo} /> : null}
          {visual.kind === 'purple' ? <Image source={require('./assets/logo-numerica-morado.png')} style={styles.portalServiceLogo} /> : null}
          {visual.kind === 'rubrica' ? <Image source={require('./assets/logo-numerica-rubrica.png')} style={styles.portalServiceLogoWide} /> : null}
          {['document', 'calculator', 'pencil', 'briefcase'].includes(visual.kind) ? <PortalServiceGlyph kind={visual.kind} /> : null}
        </View>
      </View>
      <View style={styles.portalServiceCopy}>
        <View style={[styles.portalServiceAccentLine, { backgroundColor: visual.accent }]} />
        <Text style={styles.portalServiceTitle}>{title}</Text>
        <Text style={styles.portalServiceDescription}>{description}</Text>
        <View style={styles.portalServiceBadges}>
          <Text style={[styles.portalServicePill, { borderColor: visual.accent, color: visual.accent }]}>
            {enabled ? 'Disponible' : 'No disponible'}
          </Text>
          <Text style={styles.portalServiceSubscription}>Suscripcion activa</Text>
        </View>
        <View style={[styles.portalServiceButton, { backgroundColor: enabled ? visual.accent : '#B8C5D2' }]}>
          <Text style={styles.portalServiceButtonText}>Ingresar</Text>
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

function PdfSignaturePositionPicker({
  pdfUri,
  page,
  position,
  pageSize,
  onPageChange,
  onPositionChange,
  onPageSizeChange,
}: {
  pdfUri: string;
  page: number;
  position: { x: number; y: number };
  pageSize: { widthMm: number; heightMm: number };
  onPageChange: (page: number) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onPageSizeChange: (size: { widthMm: number; heightMm: number }) => void;
}) {
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState(false);
  useEffect(() => {
    let mounted = true;
    setViewerError(false);
    setPdfBase64(null);
    FileSystem.readAsStringAsync(pdfUri, { encoding: FileSystem.EncodingType.Base64 })
      .then((value) => { if (mounted) setPdfBase64(value); })
      .catch(() => { if (mounted) setPdfBase64(null); });
    return () => { mounted = false; };
  }, [pdfUri]);

  const pdfHtml = pdfBase64 ? `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" /><style>html,body{margin:0;background:#eef3f7;font-family:Arial}#stage{position:relative;width:100%;min-height:100vh;display:flex;justify-content:center;align-items:flex-start;padding:10px;box-sizing:border-box}#canvas{max-width:100%;height:auto;background:#fff;box-shadow:0 2px 8px #8293a555}#marker{position:absolute;width:92px;height:42px;border:2px solid #0878c9;background:#dff2ffdd;color:#0878c9;font-weight:bold;font-size:12px;display:flex;align-items:center;justify-content:center;pointer-events:none;box-sizing:border-box;border-radius:4px}</style></head><body><div id="stage"><canvas id="canvas"></canvas><div id="marker">FIRMA AQUÍ</div></div><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script><script>try{const raw=atob('${pdfBase64}');const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';const pageNumber=${page};const posX=${position.x};const posY=${position.y};pdfjsLib.getDocument({data:bytes}).promise.then(pdf=>pdf.getPage(pageNumber)).then(page=>{const base=page.getViewport({scale:1});const widthMm=base.width*25.4/72;const heightMm=base.height*25.4/72;window.ReactNativeWebView.postMessage(JSON.stringify({type:'size',widthMm,heightMm}));const maxWidth=Math.min(window.innerWidth-20,680);const viewport=page.getViewport({scale:maxWidth/base.width});const canvas=document.getElementById('canvas');canvas.width=viewport.width;canvas.height=viewport.height;canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';page.render({canvasContext:canvas.getContext('2d'),viewport});const marker=document.getElementById('marker');marker.style.left=(10+posX*viewport.width-46)+'px';marker.style.top=(10+posY*viewport.height-21)+'px';canvas.onclick=e=>{const r=canvas.getBoundingClientRect();window.ReactNativeWebView.postMessage(JSON.stringify({type:'position',x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}))}}).catch(()=>window.ReactNativeWebView.postMessage(JSON.stringify({type:'error'})))}catch(e){window.ReactNativeWebView.postMessage(JSON.stringify({type:'error'}))}</script></body></html>` : '<html><body style="font-family:Arial;text-align:center;padding:24px;color:#637587">Cargando previsualización del PDF…</body></html>';

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
        <WebView
          originWhitelist={['*']}
          source={{ html: pdfHtml }}
          javaScriptEnabled
          allowFileAccess
          style={styles.pdfWebView}
          onMessage={(event: { nativeEvent: { data: string } }) => {
            try {
              const result = JSON.parse(event.nativeEvent.data) as { type?: string; x?: number; y?: number; widthMm?: number; heightMm?: number };
              if (result.type === 'position' && typeof result.x === 'number' && typeof result.y === 'number') onPositionChange({ x: result.x, y: result.y });
              if (result.type === 'size' && typeof result.widthMm === 'number' && typeof result.heightMm === 'number') onPageSizeChange({ widthMm: result.widthMm, heightMm: result.heightMm });
              if (result.type === 'error') setViewerError(true);
            } catch { /* ignore malformed viewer messages */ }
          }}
        />
      </View>
      {viewerError ? <Text style={styles.pdfViewerError}>No se pudo cargar la previsualización. Verifica la conexión a internet y vuelve a seleccionar el PDF.</Text> : null}
      <View style={styles.pdfPositionInfo}>
        <MaterialCommunityIcons name="information-outline" size={18} color={ERUBRICA_COLORS.primary} />
        <Text style={styles.pdfPositionInfoText}>Página {page} · posición horizontal {Math.round(position.x * 100)}% · vertical {Math.round(position.y * 100)}%</Text>
      </View>
    </View>
  );
}

function PdfDocumentPreview({ uri }: { uri: string }) {
  const [base64, setBase64] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    setBase64(null);
    FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
      .then((value) => { if (mounted) setBase64(value); })
      .catch(() => { if (mounted) setBase64(''); });
    return () => { mounted = false; };
  }, [uri]);

  const html = base64 ? `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><style>html,body{margin:0;background:#eef3f7}#canvas{display:block;margin:12px auto;background:#fff;max-width:calc(100% - 24px);box-shadow:0 2px 8px #63758755}</style></head><body><canvas id="canvas"></canvas><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script><script>try{const r=atob('${base64}'),b=new Uint8Array(r.length);for(let i=0;i<r.length;i++)b[i]=r.charCodeAt(i);pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';pdfjsLib.getDocument({data:b}).promise.then(p=>p.getPage(1)).then(p=>{const v=p.getViewport({scale:1}),s=Math.min((innerWidth-24)/v.width,1.5),q=p.getViewport({scale:s}),c=document.getElementById('canvas');c.width=q.width;c.height=q.height;p.render({canvasContext:c.getContext('2d'),viewport:q})}).catch(()=>document.body.innerHTML='<p style="padding:24px;text-align:center;font-family:Arial;color:#637587">No se pudo mostrar el PDF.</p>')}catch(e){document.body.innerHTML='<p style="padding:24px;text-align:center;font-family:Arial;color:#637587">No se pudo mostrar el PDF.</p>'}</script></body></html>` : '<p style="padding:24px;text-align:center;font-family:Arial;color:#637587">Cargando PDF…</p>';
  return <WebView originWhitelist={['*']} source={{ html }} javaScriptEnabled style={styles.pdfDocumentWebView} />;
}

function ERubricaMobileScreen({
  data,
  initialPdf,
  requestedTab,
  loading,
  message,
  onRefresh,
  onSync,
}: {
  data: ERubricaDashboard | null;
  initialPdf?: { uri: string; name: string; mimeType?: string } | null;
  requestedTab?: ERubricaTab | null;
  loading: boolean;
  message: MessageState;
  onRefresh: () => void;
  onSync: () => Promise<void>;
}) {
  const [tab, setTab] = useState<ERubricaTab>('solicitudes');
  const [qrInput, setQrInput] = useState('');
  const [qrResult, setQrResult] = useState<unknown>(null);
  const [validatingQr, setValidatingQr] = useState(false);
  const [pdfFile, setPdfFile] = useState<{ uri: string; name: string; mimeType?: string } | null>(initialPdf ?? null);
  const [certificateFile, setCertificateFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [signing, setSigning] = useState(false);
  const [signedFileUri, setSignedFileUri] = useState<string | null>(null);
  const [pdfValidation, setPdfValidation] = useState<unknown>(null);
  const [validatingPdf, setValidatingPdf] = useState(false);
  const [catalogos, setCatalogos] = useState<unknown[]>([]);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [renovacion, setRenovacion] = useState<unknown>(null);
  const [proveedorItems, setProveedorItems] = useState<unknown[]>([]);
  const [signaturePage, setSignaturePage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState({ x: 0.68, y: 0.82 });
  const [signaturePageSize, setSignaturePageSize] = useState({ widthMm: 210, heightMm: 297 });
  useEffect(() => {
    if (initialPdf) {
      setPdfFile(initialPdf);
      setTab('firmar');
    }
  }, [initialPdf]);
  useEffect(() => {
    if (requestedTab) setTab(requestedTab);
  }, [requestedTab]);
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
  useEffect(() => {
    if (tab === 'catalogos' && catalogos.length === 0) {
      void Promise.all([getERubricaProductos(), getERubricaSaldo()]).then(([items, balance]) => {
        setCatalogos(items ?? []);
        setSaldo(Number(balance?.balance ?? 0));
      }).catch(() => undefined);
    }
    if (tab === 'renovacion' && renovacion === null) void getERubricaRenovacion().then(setRenovacion).catch(() => undefined);
  }, [catalogos.length, renovacion, tab]);

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
        <SegmentButton accentColor={ERUBRICA_COLORS.primary} active={tab === 'firmas'} label={`Mis firmas (${firmas.length})`} onPress={() => setTab('firmas')} />
        <SegmentButton accentColor={ERUBRICA_COLORS.primary} active={tab === 'firmar'} label="Firmar PDF" onPress={() => setTab('firmar')} />
        <SegmentButton accentColor={ERUBRICA_COLORS.primary} active={tab === 'validar'} label="Validar" onPress={() => setTab('validar')} />
      </View>

      <View style={styles.portalSectionHeader}>
        <View style={styles.portalSectionTitleWrap}><Text style={styles.portalSectionTitle}>Actividad reciente</Text></View>
        <Pressable style={styles.portalSectionAction} onPress={onRefresh}><MaterialCommunityIcons name="refresh" size={22} color={ERUBRICA_COLORS.primary} /></Pressable>
      </View>

      {loading ? <View style={styles.directoryLoading}><ActivityIndicator color={ERUBRICA_COLORS.primary} /><Text style={styles.mutedText}>Cargando E-Rúbrica...</Text></View> : null}
      {tab === 'firmar' ? (
        <View style={styles.clientCard}>
          <Text style={styles.clientDetailLabel}>Firmar documento PDF</Text>
           <Text style={styles.clientMeta}>Selecciona un PDF. Puedes usar la firma configurada en e-Fact o cargar un certificado .p12 temporal.</Text>
          <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label={pdfFile ? `PDF: ${pdfFile.name}` : 'Seleccionar PDF'} onPress={async () => {
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
            if (!result.canceled) {
              setPdfFile(result.assets[0]);
              setSignedFileUri(null);
              setSignaturePage(1);
              setSignaturePosition({ x: 0.68, y: 0.82 });
            }
          }} />
          {pdfFile ? <PdfSignaturePositionPicker pdfUri={pdfFile.uri} page={signaturePage} position={signaturePosition} pageSize={signaturePageSize} onPageChange={setSignaturePage} onPositionChange={setSignaturePosition} onPageSizeChange={setSignaturePageSize} /> : null}
           <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label={certificateFile ? `Certificado: ${certificateFile.name}` : 'Usar firma configurada / cargar .p12'} onPress={async () => {
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/x-pkcs12', copyToCacheDirectory: true });
            if (!result.canceled) setCertificateFile(result.assets[0]);
          }} />
          <Field label="Clave del certificado" value={certificatePassword} onChangeText={setCertificatePassword} secureTextEntry />
          <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Firmar documento" loading={signing} onPress={async () => {
             if (!pdfFile || (certificateFile && !certificatePassword.trim())) {
               Alert.alert('Datos incompletos', certificateFile ? 'Ingresa la clave del certificado seleccionado.' : 'Selecciona un PDF válido.');
               return;
             }
            setSigning(true);
            setSignedFileUri(null);
            try {
              const form = new FormData();
              form.append('pdf', { uri: pdfFile.uri, name: pdfFile.name || 'documento.pdf', type: pdfFile.mimeType || 'application/pdf' } as unknown as Blob);
               if (certificateFile) {
                 form.append('certificado', { uri: certificateFile.uri, name: certificateFile.name || 'certificado.p12', type: certificateFile.mimeType || 'application/x-pkcs12' } as unknown as Blob);
                 form.append('clave', certificatePassword.trim());
               }
              form.append('pagina', String(signaturePage));
               const signatureWidthMm = 60;
               const signatureHeightMm = 35;
               const xMm = Math.min(Math.max(0, signaturePageSize.widthMm - signatureWidthMm), Math.max(0, signaturePosition.x * signaturePageSize.widthMm - signatureWidthMm / 2));
               const yMm = Math.min(Math.max(0, signaturePageSize.heightMm - signatureHeightMm), Math.max(0, signaturePosition.y * signaturePageSize.heightMm - signatureHeightMm / 2));
               form.append('xMm', xMm.toFixed(2));
               form.append('yMm', yMm.toFixed(2));
               form.append('anchoMm', '60');
              const result = await firmarERubricaDocumento(form);
               const base64 = arrayBufferToBase64(result.bytes);
              const uri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}documento-firmado-${Date.now()}.pdf`;
              await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
              setSignedFileUri(uri);
              Alert.alert('Documento firmado', 'El PDF se firmó correctamente. Ya puedes compartirlo.');
            } catch (error) {
              Alert.alert('No se pudo firmar', error instanceof ApiError ? error.message : 'Verifica los archivos y la clave del certificado.');
            } finally { setSigning(false); }
           }} />
           <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Validar firma del PDF" onPress={async () => {
             if (!pdfFile) { Alert.alert('Selecciona un PDF', 'Carga primero el documento que deseas validar.'); return; }
             setValidatingPdf(true); setPdfValidation(null);
             try { setPdfValidation(await validarERubricaFirmaPdf(pdfFile)); }
             catch (error) { setPdfValidation({ mensaje: error instanceof ApiError ? error.message : 'No se pudo validar el PDF.' }); }
             finally { setValidatingPdf(false); }
           }} />
           {validatingPdf ? <ActivityIndicator color={ERUBRICA_COLORS.primary} /> : null}
           {pdfValidation ? <Text style={styles.clientDetailValue}>{JSON.stringify(pdfValidation, null, 2)}</Text> : null}
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
      {tab === 'renovacion' ? (
        <View style={styles.clientCard}>
          <Text style={styles.clientDetailLabel}>Renovación de firma</Text>
          <Text style={styles.clientMeta}>Consulta la vigencia de tus certificados y las renovaciones pendientes.</Text>
          <Text style={styles.clientDetailValue}>{renovacion ? JSON.stringify(renovacion, null, 2) : 'Cargando información de renovación...'}</Text>
        </View>
      ) : null}
      {tab === 'catalogos' ? (
        <View style={styles.clientCard}>
          <Text style={styles.clientDetailLabel}>Productos y saldo</Text>
          <Text style={styles.clientMeta}>Saldo disponible: {saldo === null ? 'Cargando...' : saldo}</Text>
          {catalogos.length === 0 ? <EmptyState title="Sin productos" text="No hay productos disponibles para tu cuenta." /> : catalogos.slice(0, 20).map((item, index) => <Text key={`erubrica-producto-${index}`} style={styles.clientDetailValue}>{label(item, ['nombre', 'descripcion', 'name'], 'Producto')}</Text>)}
        </View>
      ) : null}
      {tab === 'proveedor' ? (
        <View style={styles.clientCard}>
          <Text style={styles.clientDetailLabel}>Solicitudes del proveedor</Text>
          <Text style={styles.clientMeta}>Consulta el estado de solicitudes asociadas al proveedor de firma.</Text>
          <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Buscar solicitudes" loading={false} onPress={async () => { try { setProveedorItems(await buscarERubricaSolicitudesProveedor()); } catch (error) { Alert.alert('No se pudo consultar', error instanceof ApiError ? error.message : 'Intenta nuevamente.'); } }} />
          {proveedorItems.length === 0 ? <EmptyState title="Sin resultados" text="No se encontraron solicitudes del proveedor." /> : proveedorItems.slice(0, 20).map((item, index) => <Text key={`erubrica-proveedor-${index}`} style={styles.clientDetailValue}>{label(item, ['status', 'estado', 'uuid', 'id'], 'Solicitud')}</Text>)}
        </View>
      ) : null}
      {tab === 'soporte' ? (
        <View style={styles.clientCard}>
          <Text style={styles.clientDetailLabel}>Soporte E-Rúbrica</Text>
          <Text style={styles.clientMeta}>Para firmar: carga un PDF, usa tu firma configurada o un .p12 temporal y verifica la clave. Si el certificado está vencido, renuévalo antes de estampar.</Text>
          <Text style={styles.clientDetailValue}>El acceso web también dispone de ayuda y administración avanzada de roles, usuarios y planes.</Text>
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
              {Number(label(item, ['solId', 'id'], '0')) > 0 ? <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Descargar firma .p12" onPress={async () => {
                try {
                  const solId = Number(label(item, ['solId', 'id'], '0'));
                  const result = await descargarERubricaFirmaP12(solId);
                  const uri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}firma-${solId}.p12`;
                  await FileSystem.writeAsStringAsync(uri, arrayBufferToBase64(result.bytes), { encoding: FileSystem.EncodingType.Base64 });
                  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/x-pkcs12', dialogTitle: 'Compartir firma .p12' });
                } catch (error) { Alert.alert('No se pudo descargar', error instanceof ApiError ? error.message : 'La firma no está disponible.'); }
              }} /> : null}
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
    .filter((module) => ['mis-facturas', 'clientes', 'productos', 'emisor', 'punto-emision'].includes(module.view))
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
        <DashboardPrimaryAction icon="store-cog-outline" label="Series" text="Cajas" onPress={() => onOpenView('punto-emision')} />
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

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
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
  const sequences = getPuntoDocumentSequences(punto);
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
      <View style={styles.puntoSequencePanel}>
        <View style={styles.puntoSequenceHeader}>
          <Text style={styles.puntoSequenceTitle}>Secuencias por documento</Text>
          <Text style={styles.puntoSequenceStatus}>{punto.estado === false ? 'Inactivo' : 'Activo'}</Text>
        </View>
        <View style={styles.clientDetailGrid}>
          {sequences.map((item) => (
            <View key={`${serie}-${item.label}`} style={styles.clientDetailItem}>
              <Text style={styles.clientDetailLabel}>{item.label}</Text>
              <Text style={styles.clientDetailValue}>{item.serie}</Text>
              <Text style={styles.clientMeta}>Sec. {item.secuencia}</Text>
            </View>
          ))}
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

function AuthCard({ children, wide, login }: { children: React.ReactNode; wide?: boolean; login?: boolean }) {
  return <ScreenTransition><View style={[styles.card, login && styles.loginCard, wide && styles.cardWide]}>{children}</View></ScreenTransition>;
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
      <StatusBar style="light" />
    </SafeAreaView>
  );
}
