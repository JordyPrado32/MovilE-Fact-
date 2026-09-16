import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as IntentLauncher from 'expo-intent-launcher';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Speech from 'expo-speech';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
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
import { ApiError, clearAuthSession, getAuthSessionCookie, setAuthFailureHandler } from './src/services/apiClient';
import { clearBotHistory, loadBotHistory, saveBotHistory, sendBotMessage } from './src/services/botService';
import { API_BASE_URL } from './src/config/api';
import { AdminMobileItem, getAdminMobileModule } from './src/services/adminMobileService';
import { changePassword, checkAuth, login, logout as logoutSession, recoverPassword, register } from './src/services/authService';
import { createCategoria, createSubcategoria, deleteCategoria, deleteSubcategoria, getCategorias, getSubcategorias, updateCategoria, updateSubcategoria } from './src/services/categoriasService';
import { createCliente, deleteCliente, getCiudades, getClienteLookups, getClientes, getProvincias, updateCliente } from './src/services/clientesService';
import { consultarEmisorSri, createEmisor, deleteEmisor, getEmisor, getEmisores, getFirmaEstado, updateEmisor, uploadFirmaArchivo } from './src/services/emisoresService';
import { anularFactura, buscarFacturaClientes, buscarFacturaProductos, enviarFacturaCorreo, FacturaDetalle, FacturaListItem, FacturaPreparacion, FacturaProducto, getFacturaDetalle, getFacturaPdf, getFacturas, getFacturaPreparacion, getFacturaXml, guardarFactura, reintentarFacturaSri } from './src/services/facturasMobileService';
import { anularGuiaRemision, buscarGuiaClientes, buscarGuiaFacturas, buscarGuiaProductos, buscarGuiaTransportistas, emitirGuiaRemision, enviarGuiaRemisionCorreo, getGuiaRemisionPdf, getGuiaRemisionPreparacion, getGuiasRemision, getGuiaRemisionXml, guardarGuiaRemision, GuiaRemisionDetalleInput, GuiaRemisionListItem } from './src/services/guiasRemisionMobileService';
import { getMenusByRol, hasMenusByRolEndpoint } from './src/services/menuService';
import { buscarLiquidacionProductos, buscarLiquidacionProveedores, emitirLiquidacionCompra, enviarLiquidacionCompraCorreo, getLiquidacionCompraPdf, getLiquidacionCompraPreparacion, getLiquidacionesCompra, getLiquidacionCompraXml, guardarLiquidacionCompra, getLiquidacionCodigoPorcentaje, LiquidacionCompraListItem } from './src/services/liquidacionesCompraMobileService';
import { anularNotaCredito, buscarNotaCreditoFacturas, emitirNotaCredito, emitirNotaCreditoAutomatica, enviarNotaCreditoCorreo, getNotaCreditoDetallesDisponibles, getNotaCreditoPdf, getNotaCreditoPreparacion, getNotasCredito, getNotaCreditoXml, guardarNotaCredito, NotaCreditoListItem } from './src/services/notasCreditoMobileService';
import { anularNotaDebito, buscarNotaDebitoFacturas, emitirNotaDebito, enviarNotaDebitoCorreo, getNotaDebitoPdf, getNotaDebitoPreparacion, getNotasDebito, getNotaDebitoXml, guardarNotaDebito, NotaDebitoListItem } from './src/services/notasDebitoMobileService';
import { clearNotificaciones, dismissNotificacion, getNotificaciones, NotificacionItem } from './src/services/notificacionesService';
import { syncDeviceNotifications } from './src/services/deviceNotificationsService';
import { CompraDocumentosEstado, CompraDocumentosTransferenciaInput, createOperationalItem, deleteOperationalItem, getCompraDocumentosEstado, getEstadoCuentaDetalle, getEstadoCuentaExcel, getEstadoCuentaListadoExcel, getEstadoCuentaPdf, getOperationalMobileModule, getOperationalModuleConfig, iniciarPagoCompraDocumentos, OperationalMobileItem, OperationalModule, registrarTransferenciaCompraDocumentos, updateOperationalItem } from './src/services/operationalMobileService';
import { getPerfil, updatePerfil, uploadPerfilAvatar } from './src/services/perfilService';
import { createPuntoEmision, deletePuntoEmision, getPuntoEmisionSiguienteSecuencial, getPuntosEmision, markPuntoPrincipal, PuntoDocumentoKey, savePuntoEmisionSecuenciaInicial, updatePuntoEmision } from './src/services/puntosEmisionService';
import { createProducto, deleteProducto, getProducto, getProductoLookups, getProductos, getProductoSubcategorias, updateProducto } from './src/services/productosService';
import { crearRetencionDesdeLiquidacion, emitirRetencionSri, enviarRetencionCorreo, getRetencionCatalogo, getRetencionPdf, getRetenciones, getRetencionXml, LiquidacionRetencionInput, RetencionCatalogItem, RetencionListItem } from './src/services/retencionesMobileService';
import { ERubricaDashboard, ERubricaDocumentoFirmado, ERubricaDocumentoPendiente, ERubricaEmisor, ERubricaFirmaEstado, appendERubricaFile, buscarERubricaSolicitudesProveedor, cargarERubricaDocumentoPendiente, configurarERubricaFirma, crearERubricaSolicitud, descargarERubricaFirmaP12, eliminarERubricaDocumentoPendiente, enviarTransferenciaERubricaSolicitud, firmarERubricaDocumento, getERubricaDashboard, getERubricaDocumentosFirmados, getERubricaDocumentosPendientes, getERubricaEmisores, getERubricaFirmaEstado, getERubricaPlan, getERubricaProductos, getERubricaRenovacion, getERubricaSaldo, iniciarPagoERubricaSolicitud, sincronizarERubricaPendientes, sincronizarERubricaSolicitud, validarERubricaFirmaPdf, validarERubricaFirmaTemporal, validarERubricaQr } from './src/services/erubricaMobileService';
import { ChangePasswordRequest, DynamicMenu, LoginResponse, RegisterRequest, ServiceAccess, TipoDocumento } from './src/types/auth';
import { CategoriaCatalogo, CiudadLookup, Cliente, ClienteLookups, Emisor, FirmaEstado, PerfilLookup, PerfilUsuario, Producto, ProductoLookups, ProductoTipo, ProvinciaLookup, PuntoEmision, PuntosEmisionData, SubcategoriaCatalogo, SubcategoriaLookup } from './src/types/business';
import {
  sanitizeIdentificacion,
  validateChangePassword,
  validateEmail,
  validateIdentificacion,
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
import type { BotVoiceControls } from './src/components/bot/EfactBotScreen';
import { InitialSequenceModal } from './src/components/documentos/InitialSequenceModal';
import { PuntosEmisionScreen } from './src/components/puntos/PuntosEmisionScreen';
import { DirectoryTabButton, DropdownField, FormTopBar, ToggleRow } from './src/components/ui/FormShared';
import { DashboardActivityItem, DashboardChartCard, DashboardPrimaryAction, DashboardServiceRow } from './src/components/dashboard/DashboardWidgets';
import { EmptyState } from './src/components/ui/FeedbackStates';
import { NuevaFacturaMobileScreen } from './src/components/facturacion/NuevaFacturaMobileScreen';
import { ModuleCard, NavButton, PortalBottomNav, PortalHeaderAvatar } from './src/components/portal/PortalNavigation';
import { CatalogCard, SubcategoriaCard } from './src/components/catalog/CatalogCards';
import { InitialsAvatar, MenuItem } from './src/components/ui/MenuItem';
import { BiometricSetupModal, BrandLockup, BrandMark, LoadingScreen, ScreenFrame } from './src/components/auth/AuthWidgets';
import { AdminModuleScreen, getAdminModuleConfig, getAdminModuleSlug, isAdminMobileView } from './src/components/admin/AdminModuleScreen';
import { EFACT_THEME, ERUBRICA_COLORS } from './src/styles/theme';
import { getDocumentSerieOptions, getEffectiveDocumentSerie, getNextSequence, getNextSequenceFromOptions, getPuntoDocumentSequences, getPuntoSerie, getSelectedDocumentSerieOption, getSerieCodemisorFromOptions, getSerieLabel, getSerieLabelFromOptions, getSerieValue, normalizeSerieCode, normalizeSerieDisplay, serieNeedsInitialSequence, usePreferredDocumentSerie } from './src/utils/documentSeries';
import type { NuevaFacturaFormState, NuevaFacturaLinea } from './src/types/invoices';
import { NuevaNotaCreditoMobileScreen } from './src/components/facturacion/NuevaNotaCreditoMobileScreen';
import { NuevaNotaDebitoMobileScreen } from './src/components/facturacion/NuevaNotaDebitoMobileScreen';
import { MisNotasDebitoMobileScreen } from './src/components/documents/MisNotasDebitoMobileScreen';
import { formatDocumentDate, formatMoney, listItemKey } from './src/utils/documentFormatting';
import { getClienteDisplayName, getClienteEmail, getClienteIdentification, getClienteKey } from './src/utils/clientDisplay';
import { getIvaOptionValue, getIvaOptions } from './src/utils/facturaOptions';
import { parseDocumentNumber, validateDateRange, validateFiscalLine, validatePositiveTotal } from './src/utils/documentValidation';
import { InvoiceHistoryMetric, getInvoiceStatusStyle, getInvoiceStatusTextStyle } from './src/components/documents/DocumentHistoryShared';

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

function getDocumentAssetUrl(response: { url?: string | null } | string) {
  const value = typeof response === 'string' ? response : response.url;
  if (!value) return '';
  return value.startsWith('http') ? value : `${API_BASE_URL.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
}

const PDFJS_VIEWER_URI = Image.resolveAssetSource(require('./assets/pdfjs/pdf.min.pdf')).uri;
const PDFJS_WORKER_URI = Image.resolveAssetSource(require('./assets/pdfjs/pdf.worker.min.pdf')).uri;

function usePdfJsSource(uri: string) {
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const value = uri.startsWith('file:') ? await FileSystem.readAsStringAsync(uri) : await (await fetch(uri)).text();
        if (mounted) setSource(value);
      } catch {
        if (mounted) setSource('');
      }
    };
    void load();
    return () => { mounted = false; };
  }, [uri]);

  return source;
}

type WorkspaceView =
  | 'portal'
  | 'dashboard'
  | 'perfil'
  | 'perfil-e-rubrica'
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
  | 'nueva-categoria'
  | 'nueva-subcategoria'
  | 'nuevo-emisor'
  | 'nueva-firma'
  | 'nuevo-punto-emision'
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
type ERubricaTab =
  | 'inicio'
  | 'solicitudes'
  | 'firmas'
  | 'documentos-por-firmar'
  | 'historial-documentos'
  | 'validar-firma'
  | 'firmar'
  | 'validar'
  | 'nueva-solicitud'
  | 'historial-solicitudes'
  | 'ver-mis-firmas'
  | 'plan-disponible'
  | 'firma-config'
  | 'renovacion'
  | 'proveedor'
  | 'catalogos'
  | 'soporte';

function getERubricaTabTitle(tab: ERubricaTab) {
  const titles: Record<ERubricaTab, string> = {
    inicio: 'Inicio', solicitudes: 'Solicitudes', firmas: 'Firmas', 'documentos-por-firmar': 'Documentos por firmar',
    'historial-documentos': 'Historial documentos', 'validar-firma': 'Validar firma', firmar: 'Firmar PDF', validar: 'Validar documento',
    'nueva-solicitud': 'Solicitar firma', 'historial-solicitudes': 'Historial de solicitudes', 'ver-mis-firmas': 'Mis firmas',
    'plan-disponible': 'Plan disponible', 'firma-config': 'Configurar firma', renovacion: 'Renovación', proveedor: 'Proveedor',
    catalogos: 'Catálogos', soporte: 'Soporte',
  };
  return titles[tab];
}
type SolicitudDocumentoKey =
  | 'cedulaFrontal'
  | 'cedulaPosterior'
  | 'selfieCedula'
  | 'videoAceptacion'
  | 'rucFile'
  | 'nombramiento'
  | 'constitucion'
  | 'cedulaRepresentante'
  | 'autorizacion'
  | 'aceptacionNombramiento'
  | 'archivoAdicional';
const SOLICITUD_FORM_INITIAL = {
  tipoDocumento: '',
  identificacion: '',
  codigoDactilar: '',
  poseeRuc: false,
  ruc: '',
  nombres: '',
  primerApellido: '',
  segundoApellido: '',
  fechaNacimiento: '',
  sexo: '',
  nacionalidad: 'ECUATORIANA',
  celular: '',
  correo: '',
  telefonoSecundario: '',
  correoSecundario: '',
  provincia: '',
  canton: '',
  direccion: '',
  razonSocialEmpresa: '',
  departamento: '',
  cargo: '',
  motivoFirma: '',
  representanteTipoDocumento: '',
  representanteIdentificacion: '',
  representanteNombres: '',
  representanteApellidos: '',
};
const SOLICITUD_FILES_INITIAL: Record<SolicitudDocumentoKey, DocumentPicker.DocumentPickerAsset | null> = {
  cedulaFrontal: null,
  cedulaPosterior: null,
  selfieCedula: null,
  videoAceptacion: null,
  rucFile: null,
  nombramiento: null,
  constitucion: null,
  cedulaRepresentante: null,
  autorizacion: null,
  aceptacionNombramiento: null,
  archivoAdicional: null,
};
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
  registraInformacionBancariaProveedor: boolean;
  bancoProveedor: string;
  tipoCuentaProveedor: string;
  numeroCuentaProveedor: string;
};
type MessageState = {
  type: 'success' | 'error' | 'info';
  text: string;
} | null;
type OperationalFormState = {
  codigo: string;
  facturaId: string;
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
  observacion: string;
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
  registraInformacionBancariaProveedor: false,
  bancoProveedor: '',
  tipoCuentaProveedor: '',
  numeroCuentaProveedor: '',
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
  observacion: '',
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
  facturaId: '',
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
  descripcion: '',
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
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  activeWhen?: boolean;
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

const VIEW_ROUTE_ALIASES: Partial<Record<Exclude<WorkspaceView, 'portal' | 'dashboard' | 'no-autorizado' | 'nuevo-cliente' | 'nuevo-producto' | 'nueva-categoria' | 'nueva-subcategoria' | 'nuevo-emisor' | 'nueva-firma' | 'nuevo-punto-emision'>, string[]>> = {
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

function normalizeSriState(value?: string | null) {
  const normalized = (value ?? '').trim().toUpperCase().replace(/-/g, '_');
  if (normalized === 'AUTORIZADO' || normalized === 'AUTHORIZED') return 'AUTORIZADO';
  if (normalized === 'I' || normalized === 'ENVIADO') return 'PENDIENTE';
  if (normalized === 'ANULADO' || normalized === 'CANCELADO') return 'ANULADO';
  if (normalized === 'ERROR' || normalized === 'FALLIDO' || normalized === 'FAILED') return 'ERROR';
  if (['RECHAZADO', 'DEVUELTA', 'NO_AUTORIZADO', 'NO AUTORIZADO', 'REJECTED'].includes(normalized)) return 'RECHAZADO';
  return normalized === 'PENDIENTE' ? 'PENDIENTE' : normalized;
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
  if (normalized.includes('fact')) return { kind: 'efact', accent: EFACT_THEME.colors.primary, surface: '#CFEAFF' };
  if (normalized.includes('rubrica') || normalized.includes('sign')) return { kind: 'rubrica', accent: ERUBRICA_COLORS.primary, surface: '#CFF2DE' };
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

function buildDeviceFileName(filename: string, extension: string) {
  const normalizedExtension = extension.startsWith('.') ? extension : `.${extension}`;
  const safeName = filename.replace(/[^a-z0-9._-]/gi, '-');
  const withoutExtension = safeName.toLowerCase().endsWith(normalizedExtension.toLowerCase())
    ? safeName.slice(0, -normalizedExtension.length)
    : safeName;
  return `${withoutExtension}-${Date.now()}${normalizedExtension}`;
}

async function saveFileToDevice(sourceUri: string, fileName: string, mimeType: string) {
  if (Platform.OS === 'android') {
    const storage = FileSystem.StorageAccessFramework;
    const permissions = await storage.requestDirectoryPermissionsAsync(storage.getUriForDirectoryInRoot('Download'));
    if (!permissions.granted) return null;

    const target = await storage.createFileAsync(permissions.directoryUri, fileName, mimeType);
    const base64 = await FileSystem.readAsStringAsync(sourceUri, { encoding: FileSystem.EncodingType.Base64 });
    await FileSystem.writeAsStringAsync(target, base64, { encoding: FileSystem.EncodingType.Base64 });
    return target;
  }

  const documentDirectory = FileSystem.documentDirectory;
  if (!documentDirectory) throw new Error('missing-directory');
  const target = `${documentDirectory}${fileName}`;
  await FileSystem.copyAsync({ from: sourceUri, to: target });
  return target;
}

async function saveBinaryFileToDevice(bytes: ArrayBuffer, fileName: string, mimeType: string) {
  const extension = /\.[a-z0-9]+$/i.exec(fileName)?.[0] ?? '.bin';
  const safeName = buildDeviceFileName(fileName, extension);
  const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDirectory) throw new Error('missing-directory');

  const sourceUri = `${baseDirectory}${safeName}`;
  await FileSystem.writeAsStringAsync(sourceUri, arrayBufferToBase64(bytes), { encoding: FileSystem.EncodingType.Base64 });
  const savedUri = await saveFileToDevice(sourceUri, safeName, mimeType);
  return savedUri ? { name: safeName, uri: savedUri, shareUri: sourceUri } : null;
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
  const fileName = buildDeviceFileName(filename, '.csv');
  const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDirectory) {
    Alert.alert('Exportar Excel', 'No se encontró almacenamiento disponible en el dispositivo.');
    return;
  }
  try {
    const uri = `${baseDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(uri, csv);
    const savedUri = await saveFileToDevice(uri, fileName, 'text/csv');
    Alert.alert(
      savedUri ? 'Excel guardado' : 'Exportar Excel',
      savedUri ? `Archivo guardado en el dispositivo: ${fileName}` : 'Selecciona una carpeta para guardar el archivo.',
    );
  } catch {
    Alert.alert('Exportar Excel', 'No se pudo guardar el archivo en el dispositivo.');
  }
}

function menuMatchesView(menu: DynamicMenu, view: Exclude<WorkspaceView, 'portal' | 'dashboard' | 'no-autorizado' | 'nuevo-cliente' | 'nuevo-producto' | 'nueva-categoria' | 'nueva-subcategoria' | 'nuevo-emisor' | 'nueva-firma' | 'nuevo-punto-emision'>) {
  const normalizedRoute = normalizeText(menu.ruta);
  if (ADMIN_ROUTE_VIEW_MAP[normalizedRoute] === view) return true;

  const source = `${normalizedRoute} ${normalizeText(menu.nombre)} ${normalizeText(menu.descripcion)}`;
  return (VIEW_ROUTE_ALIASES[view] ?? []).some((alias) => source.includes(alias));
}

function getAuthorizedViews(menus: DynamicMenu[]) {
  const activeMenus = flattenMenus(menus).filter(isMenuEnabled);
  const views = new Set<WorkspaceView>();

  EFACT_MODULES.forEach((module) => {
    if (activeMenus.some((menu) => menuMatchesView(menu, module.view as Exclude<WorkspaceView, 'portal' | 'dashboard' | 'no-autorizado' | 'nuevo-cliente' | 'nuevo-producto' | 'nueva-categoria' | 'nueva-subcategoria' | 'nuevo-emisor' | 'nueva-firma' | 'nuevo-punto-emision'>))) {
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
    registraInformacionBancariaProveedor: cliente.registraInformacionBancariaProveedor ?? false,
    bancoProveedor: cliente.bancoProveedor ?? '',
    tipoCuentaProveedor: cliente.tipoCuentaProveedor ?? '',
    numeroCuentaProveedor: cliente.numeroCuentaProveedor ?? '',
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
    registraInformacionBancariaProveedor: form.esProveedor && form.registraInformacionBancariaProveedor,
    bancoProveedor: form.esProveedor && form.registraInformacionBancariaProveedor ? form.bancoProveedor.trim() : null,
    tipoCuentaProveedor: form.esProveedor && form.registraInformacionBancariaProveedor ? form.tipoCuentaProveedor.trim() : null,
    numeroCuentaProveedor: form.esProveedor && form.registraInformacionBancariaProveedor ? form.numeroCuentaProveedor.trim() : null,
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
    observacion: producto.observacion ?? '',
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
    observacion: form.observacion.trim() || null,
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
    Observacion: form.observacion.trim() || null,
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

  const tone: 'success' | 'warning' | 'danger' = unlimitedPlan || saldo >= 5 ? 'success' : saldo > 0 ? 'warning' : 'danger';
  return {
    unlimited: Boolean(unlimitedPlan),
    label: unlimitedPlan ? 'Ilimitado' : Number.isFinite(saldo) ? String(saldo) : '-',
    caption: unlimitedPlan ? (expires ? `Vence: ${formatDocumentDate(expires)}` : 'Plan activo') : 'Documentos disponibles',
    tone,
  };
}

const EXPORT_GREEN = '#18B889';

function getFirmaSummary(emisores: Emisor[], estados: Record<number, FirmaEstado>) {
  const configured = emisores.filter((emisor) => hasFirmaConfigured(emisor) || estados[emisor.codigo]?.tieneCertificado === true);
  const valid = configured.find((emisor) => estados[emisor.codigo]?.esValida);
  const fallback = valid ?? configured[0];
  const estado = fallback ? estados[fallback.codigo] : undefined;
  const hasInvalidState = Boolean(fallback && estado && estado.esValida === false);
  const active = Boolean(valid || (fallback && !estado && hasFirmaConfigured(fallback)));

  const tone: 'success' | 'warning' | 'danger' = active ? 'success' : hasInvalidState ? 'danger' : 'warning';
  return {
    active,
    label: active ? 'Activa' : hasInvalidState ? 'Caducada' : 'Pendiente',
    caption: estado?.fechaExpiracion ? `Vence: ${formatDocumentDate(estado.fechaExpiracion)}` : fallback ? 'Certificado configurado' : 'Sin firma',
    tone,
  };
}

function statusToneStyles(tone: 'success' | 'warning' | 'danger') {
  if (tone === 'danger') return { card: styles.unifiedStatusCardDanger, icon: styles.unifiedStatusIconDanger, color: '#D92D3A' };
  if (tone === 'warning') return { card: styles.unifiedStatusCardWarning, icon: styles.unifiedStatusIconWarning, color: '#D77416' };
  return { card: styles.unifiedStatusCardSuccess, icon: styles.unifiedStatusIconSuccess, color: '#0F9D58' };
}

function GlobalWorkspaceHeader({
  title,
  subtitle,
  unreadNotifications,
  documentPlan,
  firmaSummary,
  portalMode = false,
  erubricaMode = false,
  onSearch,
  onNotifications,
  onMenu,
  onDocuments,
  onFirma,
  onLogout,
}: {
  title: string;
  subtitle: string;
  unreadNotifications: number;
  documentPlan: ReturnType<typeof getDocumentPlanStatus>;
  firmaSummary: ReturnType<typeof getFirmaSummary>;
  portalMode?: boolean;
  erubricaMode?: boolean;
  onSearch: () => void;
  onNotifications: () => void;
  onMenu: () => void;
  onDocuments: () => void;
  onFirma: () => void;
  onLogout?: () => void;
}) {
  const documentTone = statusToneStyles(documentPlan.tone);
  const firmaTone = statusToneStyles(firmaSummary.tone);
  return (
    <View style={[styles.unifiedTopBar, erubricaMode && styles.erubricaTopBar]}>
      <View style={styles.unifiedHeaderRow}>
        <View style={styles.unifiedBrandBlock}>
          <PortalHeaderAvatar service={erubricaMode ? 'erubrica' : 'efact'} />
          <View style={styles.unifiedTitleBlock}>
            <Text style={styles.unifiedTitle} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
            {subtitle ? <Text style={[styles.unifiedSubtitle, erubricaMode && styles.erubricaHeaderSubtitle]} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
        </View>
        {!portalMode ? (
          <View style={styles.unifiedHeaderActions}>
            {!erubricaMode ? (
              <>
                <Pressable style={styles.unifiedIconButton} onPress={onSearch} accessibilityLabel="Buscar en toda la operación">
                  <MaterialCommunityIcons name="magnify" size={22} color="#FFFFFF" />
                </Pressable>
                <Pressable style={styles.unifiedIconButton} onPress={onNotifications} accessibilityLabel="Notificaciones">
                  <MaterialCommunityIcons name="bell-outline" size={22} color="#FFFFFF" />
                  {unreadNotifications > 0 ? <View style={styles.dashboardNotificationDot} /> : null}
                </Pressable>
              </>
            ) : null}
            <Pressable style={styles.unifiedIconButton} onPress={onMenu} accessibilityLabel="Menu">
              <MaterialCommunityIcons name="menu" size={25} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.portalLogoutButton} onPress={onLogout} accessibilityLabel="Salir">
            <MaterialCommunityIcons name="door-open" size={20} color="#FFFFFF" />
            <Text style={styles.portalLogoutText}>Salir</Text>
          </Pressable>
        )}
      </View>
      {!portalMode ? <View style={styles.unifiedStatusGrid}>
        {!erubricaMode ? <Pressable style={[styles.unifiedStatusCard, documentTone.card]} onPress={onDocuments}>
          <View style={[styles.unifiedStatusIcon, documentTone.icon]}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={documentTone.color} />
          </View>
          <View style={styles.unifiedStatusCopy}>
            <Text style={styles.unifiedStatusLabel}>Total documentos</Text>
            <Text style={[styles.unifiedStatusValue, { color: documentTone.color }]}>{documentPlan.label}</Text>
            <Text style={styles.unifiedStatusCaption}>{documentPlan.caption}</Text>
          </View>
        </Pressable> : null}
        <Pressable style={[styles.unifiedStatusCard, erubricaMode && styles.unifiedStatusCardFull, firmaTone.card]} onPress={onFirma}>
          <View style={[styles.unifiedStatusIcon, styles.unifiedFirmaIcon, firmaTone.icon]}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color={firmaTone.color} />
          </View>
          <View style={styles.unifiedStatusCopy}>
            <Text style={styles.unifiedStatusLabel}>{erubricaMode ? 'Estado de firma' : 'Firma electronica'}</Text>
            <Text style={[styles.unifiedStatusValue, { color: firmaTone.color }]}>{firmaSummary.label}</Text>
            <Text style={styles.unifiedStatusCaption}>{firmaSummary.caption}</Text>
          </View>
        </Pressable>
      </View> : null}
    </View>
  );
}

function operationalItemToForm(item: OperationalMobileItem): OperationalFormState {
  return {
    codigo: item.id ?? '',
    facturaId: '',
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
    const facturaId = Number(form.facturaId.trim());
    return {
      idCliente: Number.isFinite(codigo) ? codigo : 0,
      idFactura: Number.isFinite(facturaId) ? facturaId : 0,
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
  const [loginMethod, setLoginMethod] = useState<'password' | 'biometric'>('password');

  const [registerForm, setRegisterForm] = useState<RegisterRequest>(initialRegisterForm);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [changeForm, setChangeForm] = useState<ChangePasswordRequest>(initialChangeForm);

  const resetLocalSession = (removeBiometric = false) => {
    const activeUserId = currentUser?.idUsuario ?? 0;
    if (activeUserId > 0) void clearBotHistory(activeUserId);
    clearAuthSession();
    setCurrentUser(null);
    setPassword('');
    setMessage(null);
    setMode('login');
    setBiometricPendingLogin(null);
    if (removeBiometric) {
      const accountUserId = currentUser ? getClaimNumber(currentUser, 'idJefe') ?? activeUserId : activeUserId;
      if (accountUserId > 0) void SecureStore.deleteItemAsync(`${INVOICE_DRAFT_KEY_PREFIX}.${accountUserId}`);
      void SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      setBiometricCredentials(null);
    }
  };

  useEffect(() => {
    setAuthFailureHandler(() => resetLocalSession(false));
    return () => setAuthFailureHandler(null);
  }, [currentUser]);

  useEffect(() => {
    let mounted = true;
    const minSplash = delay(LAUNCH_DURATION_MS);

    const authCheck = checkAuth()
      .then((response) => {
        if (!mounted || !response.authenticated) return;
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
          void logoutSession().catch(() => undefined).finally(() => resetLocalSession(true));
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
                <Text style={styles.loginProductName}>NUMÉRICA SOFTWARE</Text>
                <Text style={styles.loginProductCaption}>Soluciones digitales</Text>
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
            <View style={styles.loginBrand}>
              <BrandMark />
              <View>
                <Text style={styles.loginProductName}>NUMÉRICA SOFTWARE</Text>
                <Text style={styles.loginProductCaption}>Soluciones digitales</Text>
              </View>
            </View>
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
  const botVoiceControlsRef = useRef<BotVoiceControls | null>(null);
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
  const [clienteEstadoFiltro, setClienteEstadoFiltro] = useState<'activos' | 'inactivos' | 'todos'>('activos');
  const [productoTipoFiltro, setProductoTipoFiltro] = useState<'todos' | ProductoTipo>('todos');
  const [productoCategoriaFiltro, setProductoCategoriaFiltro] = useState<number | null>(null);
  const [productoSubcategoriaFiltro, setProductoSubcategoriaFiltro] = useState<number | null>(null);
  const [productoEstadoFiltro, setProductoEstadoFiltro] = useState<'activos' | 'inactivos' | 'todos'>('activos');
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
  const savingFacturaRef = useRef(false);
  const pendingFacturaRetryRef = useRef<{ startedAt: number; expectedTotal: number; identificacion: string } | null>(null);
  const pendingGuiaRetryRef = useRef<number | null>(null);
  const pendingNotaDebitoRetryRef = useRef<number | null>(null);
  const pendingRetencionEmitRef = useRef<number | null>(null);
  const [facturaForm, setFacturaForm] = useState<NuevaFacturaFormState>(initialNuevaFacturaForm);
  const [facturaCliente, setFacturaCliente] = useState<Cliente | null>(null);
  const [facturaClientes, setFacturaClientes] = useState<Cliente[]>([]);
  const [facturaProductos, setFacturaProductos] = useState<FacturaProducto[]>([]);
  const [facturaLineas, setFacturaLineas] = useState<NuevaFacturaLinea[]>([]);
  const [invoiceDraftReady, setInvoiceDraftReady] = useState(false);
  const [invoiceDraftSaved, setInvoiceDraftSaved] = useState(false);
  const invoiceDraftStorageRef = useRef<Promise<void>>(Promise.resolve());
  const facturaRequestIdRef = useRef<string | null>(null);
  const [notaCreditoPreparacion, setNotaCreditoPreparacion] = useState<FacturaPreparacion | null>(null);
  const [notasCreditoList, setNotasCreditoList] = useState<NotaCreditoListItem[]>([]);
  const [notaCreditoFacturas, setNotaCreditoFacturas] = useState<FacturaListItem[]>([]);
  const [notaCreditoFactura, setNotaCreditoFactura] = useState<FacturaListItem | null>(null);
  const [notaCreditoCliente, setNotaCreditoCliente] = useState<Cliente | null>(null);
  const [notaCreditoClientes, setNotaCreditoClientes] = useState<Cliente[]>([]);
  const [notaCreditoForm, setNotaCreditoForm] = useState<NotaCreditoFormState>(initialNotaCreditoForm);
  const [notaCreditoLineas, setNotaCreditoLineas] = useState<NuevaFacturaLinea[]>([]);
  const [loadingNotasCredito, setLoadingNotasCredito] = useState(false);
  const [savingNotaCredito, setSavingNotaCredito] = useState(false);
  const [processingNotaCreditoAutomatica, setProcessingNotaCreditoAutomatica] = useState(false);
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
  const [liquidacionRetencion, setLiquidacionRetencion] = useState<LiquidacionCompraListItem | null>(null);
  const [retencionesIvaCatalogo, setRetencionesIvaCatalogo] = useState<RetencionCatalogItem[]>([]);
  const [retencionesRentaCatalogo, setRetencionesRentaCatalogo] = useState<RetencionCatalogItem[]>([]);
  const [loadingLiquidacionRetencion, setLoadingLiquidacionRetencion] = useState(false);
  const [savingLiquidacionRetencion, setSavingLiquidacionRetencion] = useState(false);
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
  const [loadingGuiaSearch, setLoadingGuiaSearch] = useState(false);
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
  const [subcategoriaCategoriaFiltro, setSubcategoriaCategoriaFiltro] = useState<number | null>(null);
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
  const [consultandoSriEmisor, setConsultandoSriEmisor] = useState(false);
  const [perfilForm, setPerfilForm] = useState<PerfilFormState>(initialPerfilForm);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [puntoFormMode, setPuntoFormMode] = useState<PuntoFormMode>(null);
  const [selectedPunto, setSelectedPunto] = useState<PuntoEmision | null>(null);
  const [puntoForm, setPuntoForm] = useState<PuntoFormState>(initialPuntoForm);
  const [savingPunto, setSavingPunto] = useState(false);
  const [botMessages, setBotMessages] = useState<BotMessage[]>([]);
  const [botDraft, setBotDraft] = useState('');
  const [botFeedbackByMessage, setBotFeedbackByMessage] = useState<BotFeedbackState>({});
  const botHistoryReadyRef = useRef(false);
  const [portalServiceQuery, setPortalServiceQuery] = useState('');

  const userId = getClaimNumber(currentUser, 'idUsuario') ?? 0;
  const catalogUserId = getClaimNumber(currentUser, 'idJefe') ?? userId;
  const queueInvoiceDraftStorage = (operation: () => Promise<void>) => {
    const queued = invoiceDraftStorageRef.current.then(operation);
    invoiceDraftStorageRef.current = queued.catch(() => undefined);
    return queued;
  };
  const idTipoUsuario = getClaimNumber(currentUser, 'idTipoUsuario');
  const authorizedViews = useMemo(() => getAuthorizedViews(menus), [menus]);
  const canUseEfact = authorizedViews.has('dashboard');
  const services = useMemo(() => getServicesFromUser(currentUser, menus), [currentUser, menus]);
  const canUseERubrica = isSuperAdmin(currentUser) || authorizedViews.has('e-rubrica') || services.some(isERubricaService);
  const canUseFirma = userId > 0;
  const canUsePortal = userId > 0;
  const portalFirstName = getDisplayFirstName(currentUser, perfilData?.perfil);
  const portalAvatarUrl = getProfileAvatarUrl(currentUser, perfilData?.perfil);
  const portalServiceCards = useMemo(() => [
    {
      title: 'E-FACT',
      description: 'Facturación electrónica móvil y más.',
      enabled: canUseEfact,
      onPress: () => openView('dashboard'),
    },
    {
      title: 'E-RÚBRICA',
      description: 'Firma y valida documentos de forma segura.',
      enabled: canUseERubrica,
      onPress: () => openView('e-rubrica'),
    },
  ], [canUseEfact, canUseERubrica]);
  const filteredPortalServiceCards = useMemo(() => {
    const query = normalizeText(portalServiceQuery);
    if (!query) return portalServiceCards;
    return portalServiceCards.filter((service) => normalizeText(`${service.title} ${service.description}`).includes(query));
  }, [portalServiceCards, portalServiceQuery]);
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
    const preparedSequence = kind === 'liquidacion'
      ? getNextSequenceFromOptions(preparacion?.series ?? [], effectiveSerie, '')
      : '';
    const knownSequence = preparedSequence || getNextSequenceFromOptions(serieOptions, effectiveSerie, '');
    if (!sameSerie(serie)) {
      setForm((current) => sameSerie(current.serie) ? current : { ...current, serie: effectiveSerie });
    }
    if (preparedSequence) {
      setForm((current) => sameSerie(current.serie) && current.numeroFactura !== preparedSequence ? { ...current, serie: effectiveSerie, numeroFactura: preparedSequence } : current);
      setSequencePrompt((current) => current?.documento === documento && current?.serie === effectiveSerie ? null : current);
      return () => {
        mounted = false;
      };
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
          queueInvoiceDraftStorage(() => SecureStore.deleteItemAsync(draftKey));
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
      queueInvoiceDraftStorage(() => SecureStore.setItemAsync(draftKey, JSON.stringify({ form: facturaForm, cliente: facturaCliente, lineas: facturaLineas }))).then(() => setInvoiceDraftSaved(true)).catch(() => undefined);
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
    let mounted = true;
    botHistoryReadyRef.current = false;
    setBotMessages([]);
    setBotFeedbackByMessage({});
    if (!userId) {
      botHistoryReadyRef.current = true;
      return () => { mounted = false; };
    }
    void loadBotHistory(userId).then((history) => {
      if (!mounted) return;
      if (history?.messages.length) {
        setBotMessages((current) => current.length <= 1 && current[0]?.id === 'welcome' ? history.messages : [...history.messages, ...current]);
        setBotFeedbackByMessage((current) => ({ ...history.feedbackByMessage, ...current }));
      }
      botHistoryReadyRef.current = true;
    }).catch(() => {
      if (mounted) botHistoryReadyRef.current = true;
    });
    return () => { mounted = false; };
  }, [userId]);

  useEffect(() => {
    if (!userId || !botHistoryReadyRef.current) return;
    void saveBotHistory(userId, botMessages, botFeedbackByMessage);
  }, [userId, botMessages, botFeedbackByMessage]);

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

    if (activeView === 'nueva-factura') {
      getFacturaPreparacion(catalogUserId)
        .then((data) => {
          if (!mounted) return;
          setFacturaPreparacion(data);
          const serie = getSerieValue(data.series?.[0]) || data.caja?.serieFactura || '';
          const formaPago = data.formasPago?.[0]?.codigo == null ? '' : String(data.formasPago[0].codigo);
          setFacturaForm((current) => ({ ...current, serie, formaPago }));
        })
        .catch((error) => {
          const text = error instanceof ApiError ? error.message : 'No se pudo cargar facturacion.';
          if (mounted) setDirectoryMessage({ type: 'error', text });
        })
        .finally(() => {
          if (mounted) setLoadingFacturas(false);
        });
    } else {
      getFacturas(catalogUserId, 0)
        .then((data) => {
          if (mounted) setFacturasList(data ?? []);
        })
        .catch((error) => {
          const text = error instanceof ApiError ? error.message : 'No se pudo cargar facturacion.';
          if (mounted) setDirectoryMessage({ type: 'error', text });
        })
        .finally(() => {
          if (mounted) setLoadingFacturas(false);
        });

      getNotasCredito(catalogUserId, 0)
        .then((data) => {
          if (mounted) setNotasCreditoList(data ?? []);
        })
        .catch(() => {
          if (mounted) {
            setNotasCreditoList([]);
            setDirectoryMessage({ type: 'info', text: 'Las facturas se cargaron, pero no se pudieron consultar las notas de credito.' });
          }
        });
    }

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
          setGuiaForm((current) => ({ ...current, serie, direccionOrigen: current.direccionOrigen || data.direccionOrigen || '' }));
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
      activeView !== 'nueva-categoria' &&
      activeView !== 'nueva-subcategoria' &&
      activeView !== 'nuevo-emisor' &&
      activeView !== 'nueva-firma' &&
      activeView !== 'nuevo-punto-emision' &&
       !(['e-rubrica', 'perfil-e-rubrica'].includes(activeView) ? canUseERubrica : activeView === 'firma' ? canUseFirma : authorizedViews.has(activeView))
    ) {
      setActiveView('no-autorizado');
    }
  }, [activeView, authorizedViews, canUseEfact, canUseERubrica, canUseFirma, canUsePortal, loadingMenus]);

  useEffect(() => {
    if (!userId || !authorizedViews.has('clientes') || activeView !== 'clientes') return;

    let mounted = true;
    setLoadingClientes(true);
    setDirectoryMessage(null);

    getClientes(userId, true)
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
  }, [activeView, authorizedViews, reloadKey, userId]);

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

    getProductos(catalogUserId, true)
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
    if (!userId || (!authorizedViews.has('perfil') && !canUseERubrica)) return;

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
  }, [authorizedViews, canUseERubrica, reloadKey, userId]);

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
    const isInsideEfact = activeView !== 'portal' && activeView !== 'e-rubrica' && activeView !== 'perfil-e-rubrica' && activeView !== 'no-autorizado';
    if (!catalogUserId || (!canUseFirma && !authorizedViews.has('emisor')) || !isInsideEfact) return;

    let mounted = true;
    setLoadingFirma(true);
    setDirectoryMessage(null);

    Promise.allSettled(
      emisores
        .filter(hasFirmaConfigured)
        .map(async (emisor) => [emisor.codigo, await getFirmaEstado(catalogUserId, emisor.codigo)] as const),
    )
      .then((results) => {
        if (!mounted) return;
        const estados: Record<number, FirmaEstado> = {};
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            const [codigo, estado] = result.value;
            estados[codigo] = estado;
          }
        });
        setFirmaEstados(estados);
      })
      .catch((error) => {
        if (mounted) {
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
  }, [activeView, authorizedViews, canUseFirma, catalogUserId, emisores, reloadKey]);

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
    getProductoSubcategorias(catalogUserId, productoForm.categoria)
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
      (clienteProveedorFiltro === 'todos' || cliente.esProveedor === true) &&
      (clienteEstadoFiltro === 'todos' || (clienteEstadoFiltro === 'activos' ? cliente.estado !== false : cliente.estado === false)),
    );
  }, [clientes, search, clienteTipoFiltro, clienteProveedorFiltro, clienteEstadoFiltro]);

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
      (productoSubcategoriaFiltro === null || producto.subcategoria === productoSubcategoriaFiltro) &&
      (productoEstadoFiltro === 'todos' || (productoEstadoFiltro === 'activos' ? producto.estado !== false : producto.estado === false)),
    );
  }, [productoCategoriaFiltro, productoEstadoFiltro, productoSubcategoriaFiltro, productoTipoFiltro, productosConCatalogos]);

  const filteredCategorias = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categorias;

    return categorias.filter((categoria) => categoria.descripcion.toLowerCase().includes(term));
  }, [categorias, search]);

  const filteredSubcategorias = useMemo(() => {
    const term = search.trim().toLowerCase();
    return subcategorias.filter((subcategoria) =>
      (subcategoriaCategoriaFiltro === null || subcategoria.idCategoria === subcategoriaCategoriaFiltro) &&
      (!term || [subcategoria.descripcion, subcategoria.categoriaDescripcion]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))),
    );
  }, [subcategoriaCategoriaFiltro, subcategorias, search]);

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

  const consultarSriEmisor = async () => {
    const ruc = emisorForm.ruc.replace(/\D/g, '');
    if (ruc.length !== 13) {
      setDirectoryMessage({ type: 'error', text: 'El RUC debe tener 13 digitos para consultar al SRI.' });
      return;
    }

    setConsultandoSriEmisor(true);
    setDirectoryMessage(null);
    try {
      const resultado = await consultarEmisorSri(ruc);
      if (!resultado.found) {
        setDirectoryMessage({ type: 'info', text: resultado.mensaje || 'El SRI no devolvio informacion para este RUC.' });
        return;
      }

      setEmisorForm((current) => ({
        ...current,
        ruc: resultado.ruc ?? ruc,
        razonSocial: resultado.razonSocial ?? current.razonSocial,
        nomComercial: resultado.nomComercial ?? current.nomComercial,
        dirEstablecimiento: resultado.dirEstablecimiento ?? current.dirEstablecimiento,
        direccionMatriz: resultado.direccionMatriz ?? current.direccionMatriz,
        codEstablecimiento: resultado.codEstablecimiento ?? current.codEstablecimiento,
        llevaContabilidad: resultado.llevaContabilidad === 'SI' ? 'SI' : 'NO',
        retenciones: resultado.retenciones ?? 'NO',
      }));
      setDirectoryMessage({ type: 'success', text: resultado.mensaje || 'Datos del SRI cargados correctamente.' });
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo consultar el RUC en el SRI.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setConsultandoSriEmisor(false);
    }
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

    const identificacionLookup = clienteLookups?.identificaciones.find((item) => item.ideSec === clienteForm.tipoidentificacion);
    const identificacionError = validateClientIdentification(
      identificacionLookup?.ideCodigo ?? clienteForm.tipoidentificacion,
      identificacionLookup?.ideDescripcion,
      clienteForm.numeroidentificacion,
    );
    if (identificacionError) {
      setDirectoryMessage({ type: 'error', text: identificacionError });
      return;
    }

    if (clienteForm.direccion.trim().length < 5 || clienteForm.direccion.trim().length > 100) {
      setDirectoryMessage({ type: 'error', text: 'La direccion debe tener entre 5 y 100 caracteres.' });
      return;
    }

    if (clienteForm.tipoContactoTelefonico === 'CELULAR' && clienteForm.celular.trim() && !/^[0-9+()\-\s]{7,20}$/.test(clienteForm.celular.trim())) {
      setDirectoryMessage({ type: 'error', text: 'El celular no tiene un formato válido.' });
      return;
    }

    if (clienteForm.tipoContactoTelefonico === 'CONVENCIONAL' && clienteForm.telefonoconvencional.trim() && !/^[0-9+()\-\s]{7,20}$/.test(clienteForm.telefonoconvencional.trim())) {
      setDirectoryMessage({ type: 'error', text: 'El telefono convencional no tiene un formato válido.' });
      return;
    }

    for (const correo of clienteForm.correosAdicionales) {
      if (correo.trim() && !validateEmail(correo).valid) {
        setDirectoryMessage({ type: 'error', text: 'Uno de los correos adicionales no tiene un formato válido.' });
        return;
      }
    }
    const correosAdicionales = clienteForm.correosAdicionales.map((correo) => correo.trim().toLowerCase()).filter(Boolean);
    const correoPrincipal = clienteForm.correo.trim().toLowerCase();
    if (correosAdicionales.includes(correoPrincipal) || new Set(correosAdicionales).size !== correosAdicionales.length) {
      setDirectoryMessage({ type: 'error', text: 'Los correos adicionales no pueden repetirse ni coincidir con el correo principal.' });
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
    openView('nueva-categoria');
  };

  const openEditCategoria = (categoria: CategoriaCatalogo) => {
    setSelectedCategoria(categoria);
    setCategoriaForm(categoriaToForm(categoria));
    setCategoriaFormMode('edit');
    setDirectoryMessage(null);
    openView('nueva-categoria');
  };

  const closeCategoriaForm = () => {
    setSelectedCategoria(null);
    setCategoriaForm(initialCategoriaForm);
    setCategoriaFormMode(null);
    openView('categorias');
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
    openView('nueva-subcategoria');
  };

  const openEditSubcategoria = (subcategoria: SubcategoriaCatalogo) => {
    setSelectedSubcategoria(subcategoria);
    setSubcategoriaForm(subcategoriaToForm(subcategoria));
    setSubcategoriaFormMode('edit');
    setDirectoryMessage(null);
    openView('nueva-subcategoria');
  };

  const closeSubcategoriaForm = () => {
    setSelectedSubcategoria(null);
    setSubcategoriaForm(initialSubcategoriaForm);
    setSubcategoriaFormMode(null);
    openView('categorias');
  };

  const saveSubcategoria = async () => {
    if (!catalogUserId || savingCategoria) return;

    if (!subcategoriaForm.descripcion.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Completa la descripcion de la subcategoria.' });
      return;
    }

    if (!subcategoriaForm.idCategoria) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona la categoria de la subcategoria.' });
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
    openView('nuevo-punto-emision');
  };

  const openEditPunto = (punto: PuntoEmision) => {
    setSelectedPunto(punto);
    setPuntoForm(puntoToForm(punto));
    setPuntoFormMode('edit');
    setDirectoryMessage(null);
    openView('nuevo-punto-emision');
  };

  const closePuntoForm = () => {
    setSelectedPunto(null);
    setPuntoForm(initialPuntoForm);
    setPuntoFormMode(null);
    openView('punto-emision');
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
    openView('nuevo-emisor');
  };

  const openEditEmisor = async (emisor: Emisor) => {
    setSelectedEmisor(emisor);
    setEmisorForm(emisorToForm(emisor));
    setEmisorFormMode('edit');
    setDirectoryMessage(null);
    openView('nuevo-emisor');

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
    openView(activeView === 'nueva-firma' ? 'firma' : 'emisor');
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

    if (activeView === 'firma' || activeView === 'nueva-firma') {
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

      if ((activeView === 'firma' || activeView === 'nueva-firma') && selectedEmisor && emisorForm.firmaArchivoUri) {
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
        setDirectoryMessage({ type: 'success', text: activeView === 'firma' || activeView === 'nueva-firma' ? 'Firma guardada correctamente.' : 'Emisor actualizado correctamente.' });
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
    openView('nueva-firma');
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
      facturaId: String(getAccountStatementNumber(item, ['idFactura', 'IdFactura', 'codFactura', 'CodFactura'], 0) || ''),
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

    if (context.module === 'cuentas-cobrar' && context.tab === 'Abonos') {
      if (!(Number(operationalForm.codigo) > 0) || !(Number(operationalForm.facturaId) > 0)) {
        setDirectoryMessage({ type: 'error', text: 'Selecciona un cliente y una factura para registrar el abono.' });
        return;
      }
      if (!(Number(operationalForm.valor.replace(',', '.')) > 0)) {
        setDirectoryMessage({ type: 'error', text: 'Ingresa un monto de abono mayor a cero.' });
        return;
      }
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

  const mapProductoToFacturaProducto = (producto: Producto): FacturaProducto => ({
    codproducto: producto.codproducto,
    codprincipal: producto.codigo ?? null,
    descripcion: producto.nombre,
    precioUnitario: getProductoPrice(producto),
    costo: getProductoPrice(producto),
    tarifaIva: producto.tarifa ?? (producto.iva ? 12 : 0),
  });

  const searchLocalFacturaProductos = (rawFilter: string) => {
    const term = normalizeText(rawFilter.trim());
    if (!term) return [];
    return productos
      .filter((producto) => producto.estado !== false)
      .filter((producto) => [
        producto.nombre,
        producto.codigo,
        producto.tipo,
        producto.categoriaDescripcion,
        producto.subcategoriaDescripcion,
        producto.tarifaDescripcion,
      ].some((value) => normalizeText(value).includes(term)))
      .slice(0, 20)
      .map(mapProductoToFacturaProducto);
  };

  const getUsableFacturaProductos = (items: FacturaProducto[]) =>
    items.filter((producto) => {
      const descripcion = normalizeText(producto.descripcion);
      return Boolean(producto.codprincipal || producto.codauxiliar || (producto.codproducto && producto.codproducto > 0) || (descripcion && descripcion !== 'producto'));
    });

  const ensureFacturaProducto = (producto: FacturaProducto): FacturaProducto => ({
    ...producto,
    codproducto: producto.codproducto || 0,
    codprincipal: producto.codprincipal || producto.codauxiliar || null,
    descripcion: producto.descripcion || producto.codprincipal || producto.codauxiliar || 'Producto',
    precioUnitario: producto.precioUnitario ?? 0,
    tarifaIva: producto.tarifaIva ?? 0,
  });

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
      const remoteProductos = await buscarFacturaProductos(catalogUserId, facturaForm.productoBusqueda);
      const usableRemote = getUsableFacturaProductos(remoteProductos);
      setFacturaProductos(usableRemote.length > 0 ? usableRemote : searchLocalFacturaProductos(facturaForm.productoBusqueda));
    } catch (error) {
      const localProductos = searchLocalFacturaProductos(facturaForm.productoBusqueda);
      if (localProductos.length > 0) {
        setFacturaProductos(localProductos);
        return;
      }
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar productos.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingFacturas(false);
    }
  };

  const addFacturaProducto = (producto: FacturaProducto) => {
    const selectedProduct = ensureFacturaProducto(producto);
    if (!selectedProduct.descripcion?.trim()) {
      setDirectoryMessage({ type: 'error', text: 'El producto seleccionado no tiene datos completos.' });
      return;
    }
    setFacturaLineas((current) => [
      ...current,
      {
        producto: selectedProduct,
        cantidad: '1',
        precio: String(selectedProduct.precioUnitario ?? 0),
        descuento: '0',
        tarifa: String(selectedProduct.tarifaIva ?? 0),
        detalle: '',
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
    facturaRequestIdRef.current = null;
    if (catalogUserId) queueInvoiceDraftStorage(() => SecureStore.deleteItemAsync(`${INVOICE_DRAFT_KEY_PREFIX}.${catalogUserId}`));
    setDirectoryMessage(null);
  };

  const tryAuthorizeAfterSave = async (emit: () => Promise<{ estado?: string; mensaje?: string }>) => {
    try {
      return { sri: await emit(), failed: false };
    } catch {
      return { sri: null, failed: true };
    }
  };

  const getSriEmissionMessage = (documentLabel: string, estado?: string, failed = false) => {
    const normalized = normalizeSriState(estado);
    if (failed) return `${documentLabel} guardada, pero no se pudo confirmar la respuesta del SRI.`;
    if (normalized === 'AUTORIZADO') return `${documentLabel} autorizada por el SRI.`;
    if (normalized === 'ANULADO') return `${documentLabel} anulada.`;
    if (normalized === 'ERROR') return `${documentLabel} presentó un error en el SRI.`;
    if (normalized === 'RECHAZADO') return `${documentLabel} rechazada por el SRI.`;
    return `${documentLabel} emitida, pendiente de autorización SRI.`;
  };

  const getSriMessageType = (estado?: string, failed = false): NonNullable<MessageState>['type'] => {
    const normalized = normalizeSriState(estado);
    if (failed || !normalized || normalized === 'PENDIENTE') return 'info';
    if (normalized === 'AUTORIZADO') return 'success';
    return normalized === 'RECHAZADO' || normalized === 'ERROR' ? 'error' : 'info';
  };

  const validateEmissionPrerequisites = async () => {
    if (loadingFirma) return 'Espera a que termine la validación de la firma electrónica.';
    if (!Object.values(firmaEstados).some((estado) => estado.esValida === true)) {
      return 'No se puede emitir: configura una firma electrónica válida y vigente.';
    }

    let documentosEstado = compraDocumentosEstado;
    if (!documentosEstado && catalogUserId) {
      try {
        documentosEstado = await getCompraDocumentosEstado(catalogUserId);
        setCompraDocumentosEstado(documentosEstado);
      } catch {
        return 'No se pudo verificar el saldo de documentos. Intenta nuevamente.';
      }
    }

    const saldoDocumentos = Number(documentosEstado?.saldoDocumentos);
    if (!getDocumentPlanStatus(documentosEstado).unlimited && (!Number.isFinite(saldoDocumentos) || saldoDocumentos < 1)) {
      return 'No se puede emitir: no tienes documentos disponibles. Compra o recarga documentos para continuar.';
    }

    return null;
  };

  const validateFacturaDraft = () => {
    const parse = parseDocumentNumber;
    const correoPrincipal = (facturaForm.correoPrincipal.trim() || facturaCliente?.correo?.trim() || '').toLowerCase();
    const correoAdicional = facturaForm.correoAdicional.trim().toLowerCase();
    const direccion = facturaForm.direccion.trim() || facturaCliente?.direccion?.trim() || '';

    if (!facturaForm.serie.trim()) return 'Selecciona una serie antes de emitir la factura.';
    const clienteError = facturaCliente ? validateDocumentClientFields(facturaForm, facturaCliente) : 'Selecciona un cliente para la factura.';
    if (clienteError) return clienteError;
    if (!direccion) return 'Ingresa la dirección del cliente antes de emitir la factura.';
    if (direccion.length > 100) return 'La dirección del cliente no puede superar 100 caracteres.';
    if (!facturaForm.formaPago.trim()) return 'Selecciona la forma de pago antes de emitir la factura.';
    if (correoPrincipal && !validateEmail(correoPrincipal).valid) return 'El correo principal no tiene un formato válido.';
    if (correoAdicional && !validateEmail(correoAdicional).valid) return 'El correo adicional no tiene un formato válido.';
    if (correoPrincipal && correoAdicional && correoPrincipal === correoAdicional) return 'El correo adicional debe ser diferente al correo principal.';
    if (facturaForm.referencia.trim().split(/\s+/).filter(Boolean).length > 100) return 'Las observaciones no pueden superar 100 palabras.';

    let total = 0;
    const allowedIva = getIvaOptions(facturaPreparacion).map((item) => item.value);
    for (const [index, linea] of facturaLineas.entries()) {
      const cantidad = parse(linea.cantidad);
      const precio = parse(linea.precio);
      const descuento = parse(linea.descuento);
      const tarifa = parse(linea.tarifa);
      const base = cantidad * precio;

      if (!linea.producto || linea.producto.codproducto <= 0) return `El producto de la línea ${index + 1} no es válido.`;
      if (!Number.isFinite(cantidad) || cantidad <= 0 || !Number.isInteger(cantidad)) return `La cantidad de la línea ${index + 1} debe ser un número entero mayor que cero.`;
      if (!Number.isFinite(precio) || precio <= 0) return `El precio de la línea ${index + 1} debe ser mayor que cero.`;
      if (!Number.isFinite(descuento) || descuento < 0 || descuento > base) return `El descuento de la línea ${index + 1} no es válido.`;
      if (!Number.isFinite(tarifa) || tarifa < 0 || tarifa > 100) return `El IVA de la línea ${index + 1} no es válido.`;
      if (allowedIva.length > 0 && !allowedIva.includes(tarifa)) return `La tarifa de IVA de la línea ${index + 1} no está disponible.`;

      const subtotal = base - descuento;
      total += subtotal + subtotal * (tarifa / 100);
    }

    return total > 0 ? null : 'El total de la factura debe ser mayor que cero.';
  };

  const findFacturaSavedAfterTimeout = async (startedAt: number, expectedTotal: number, cliente: Cliente) => {
    const identificacion = normalizeText(cliente.numeroidentificacion);
    if (!identificacion) return null;
    const facturas = await getFacturas(catalogUserId ?? 0, 0);
    return facturas.find((factura) => {
      const fecha = factura.fechaEmision ? Date.parse(factura.fechaEmision) : NaN;
      const reciente = Number.isFinite(fecha) && fecha >= startedAt - 120000 && fecha <= Date.now() + 120000;
      return reciente && normalizeText(factura.identificacionCliente) === identificacion && Math.abs(Number(factura.total ?? 0) - expectedTotal) < 0.01;
    }) ?? null;
  };

  const showAuthorizationAlert = (documentLabel: string, destinationView: WorkspaceView, destinationLabel: string) => {
    Alert.alert(
      `${documentLabel} autorizada`,
      `Tu ${documentLabel.toLowerCase()} se ha autorizado correctamente por el SRI.`,
      [
        { text: 'Continuar en la vista', style: 'cancel' },
        { text: `Ir a ${destinationLabel}`, onPress: () => openView(destinationView) },
      ],
    );
  };

  const saveNuevaFactura = async () => {
    if (!catalogUserId || savingFacturaRef.current) return;
    if (!facturaCliente) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona un cliente para la factura.' });
      return;
    }
    if (facturaLineas.length === 0) {
      setDirectoryMessage({ type: 'error', text: 'Agrega al menos un producto o servicio.' });
      return;
    }
    const validationError = validateFacturaDraft();
    if (validationError) {
      setDirectoryMessage({ type: 'error', text: validationError });
      return;
    }
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }

    const parse = (value: string) => Number(value.replace(',', '.'));
    const expectedTotal = facturaLineas.reduce((sum, linea) => {
      const cantidad = parse(linea.cantidad);
      const precio = parse(linea.precio);
      const descuento = parse(linea.descuento);
      const tarifa = parse(linea.tarifa);
      const subtotal = cantidad * precio - descuento;
      return sum + subtotal + subtotal * (tarifa / 100);
    }, 0);
    const saveStartedAt = Date.now();
    const requestId = facturaRequestIdRef.current ?? `factura-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    facturaRequestIdRef.current = requestId;
    const correoPrincipal = (facturaForm.correoPrincipal.trim() || facturaCliente.correo?.trim() || '').toLowerCase();
    const correoAdicional = facturaForm.correoAdicional.trim().toLowerCase();
    const pendingRetry = pendingFacturaRetryRef.current;
    if (pendingRetry && pendingRetry.identificacion === normalizeText(facturaCliente.numeroidentificacion) && Math.abs(pendingRetry.expectedTotal - expectedTotal) < 0.01) {
      try {
        const facturaGuardada = await findFacturaSavedAfterTimeout(pendingRetry.startedAt, pendingRetry.expectedTotal, facturaCliente);
        if (facturaGuardada) {
          pendingFacturaRetryRef.current = null;
          clearFacturaForm();
          setDirectoryMessage({
            type: 'info',
            text: `La factura ${facturaGuardada.numeroCompleto ?? facturaGuardada.numfactura ?? ''} ya fue guardada. No la vuelvas a emitir.`.trim(),
          });
          setReloadKey((value) => value + 1);
          return;
        }
      } catch {
        setDirectoryMessage({ type: 'info', text: 'No se pudo confirmar el intento anterior. Verifica el historial antes de volver a emitir.' });
        return;
      }
      pendingFacturaRetryRef.current = null;
    }

    savingFacturaRef.current = true;
    setSavingFactura(true);
    setDirectoryMessage(null);
    try {
      const result = await guardarFactura({
        idUsuario: catalogUserId,
        requestId,
        cliente: {
          ...facturaCliente,
          tipoidentificacion: getTipoIdentificacionCode(facturaForm.tipoIdentificacion) || facturaCliente.tipoidentificacion || null,
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
        correos: correoAdicional && correoAdicional !== correoPrincipal ? [correoAdicional] : [],
        detalles: facturaLineas.map((linea) => ({
          producto: linea.producto,
          cantidad: parse(linea.cantidad),
          precio: parse(linea.precio),
          descuento: parse(linea.descuento),
          tarifa: parse(linea.tarifa),
          detalle: linea.detalle,
        })),
      });
      clearFacturaForm();
      pendingFacturaRetryRef.current = null;
      const sriEstado = result.sri?.estado?.toUpperCase();
      setDirectoryMessage({
        type: getSriMessageType(sriEstado),
        text: `${result.mensaje ?? 'Factura guardada.'} ${result.numeroComprobante ?? ''} ${getSriEmissionMessage('Factura', sriEstado)}`.trim(),
      });
      setReloadKey((value) => value + 1);
      if (sriEstado === 'AUTORIZADO') {
        showAuthorizationAlert('Factura', 'mis-facturas', 'Mis Facturas');
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 0) {
        pendingFacturaRetryRef.current = {
          startedAt: saveStartedAt,
          expectedTotal,
          identificacion: normalizeText(facturaCliente.numeroidentificacion),
        };
        try {
          const facturaGuardada = await findFacturaSavedAfterTimeout(saveStartedAt, expectedTotal, facturaCliente);
          if (facturaGuardada) {
            pendingFacturaRetryRef.current = null;
            clearFacturaForm();
            setDirectoryMessage({
              type: 'info',
              text: `La factura ${facturaGuardada.numeroCompleto ?? facturaGuardada.numfactura ?? ''} ya fue guardada. No la vuelvas a emitir.`.trim(),
            });
            setReloadKey((value) => value + 1);
            return;
          }
        } catch {
          // Se conserva el error original si la consulta de confirmación también falla.
        }
      }
      const text = error instanceof ApiError ? error.message : 'No se pudo guardar la factura.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      savingFacturaRef.current = false;
      setSavingFactura(false);
    }
  };

  const getDocumentAssetUrl = (response: { url?: string | null } | string) => {
    const value = typeof response === 'string' ? response : response.url;
    if (!value) return '';
    return value.startsWith('http') ? value : `${API_BASE_URL.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
  };

  const openFacturaAsset = async (loader: () => Promise<{ url?: string | null } | string>) => {
    try {
      const response = await loader();
      const url = getDocumentAssetUrl(response);
      if (!url) throw new Error('empty-url');
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

  const fillNotaCreditoCliente = (cliente: Cliente) => {
    setNotaCreditoCliente(cliente);
    setNotaCreditoClientes([]);
    setNotaCreditoForm((current) => ({
      ...current,
      clienteBusqueda: getClienteDisplayName(cliente),
      correoPrincipal: getClienteEmail(cliente),
      tipoIdentificacion: getTipoIdentificacionLabel(cliente.tipoidentificacion),
      numeroIdentificacion: getClienteIdentification(cliente),
      tipoCliente: String(cliente.tipoCliente ?? ''),
      obligadoContabilidad: cliente.oblgconta ?? '',
      direccion: cliente.direccion ?? '',
      telefono: cliente.celular || cliente.telefonoconvencional || '',
    }));
  };

  const searchNotaCreditoClientes = async () => {
    if (!catalogUserId || !notaCreditoForm.clienteBusqueda.trim()) return;
    setLoadingNotasCredito(true);
    setDirectoryMessage(null);
    try {
      setNotaCreditoClientes(await buscarFacturaClientes(catalogUserId, notaCreditoForm.clienteBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar clientes.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingNotasCredito(false);
    }
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
    setNotaCreditoLineas([]);
    setNotaCreditoFacturas([]);
    setNotaCreditoForm((current) => ({
      ...current,
      facturaBusqueda: factura.numeroCompleto ?? factura.numfactura ?? '',
      clienteBusqueda: getClienteDisplayName(cliente),
      correoPrincipal: getClienteEmail(cliente),
      tipoIdentificacion: getTipoIdentificacionLabel(cliente.tipoidentificacion),
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
      const detalleRows = detallesDisponibles;
      setNotaCreditoFactura(facturaCompleta);
      setNotaCreditoCliente(clienteCompleto);
      setNotaCreditoForm((current) => ({
        ...current,
        facturaBusqueda: facturaCompleta.numeroCompleto ?? facturaCompleta.numfactura ?? '',
        clienteBusqueda: getClienteDisplayName(clienteCompleto),
        correoPrincipal: getClienteEmail(clienteCompleto),
        tipoIdentificacion: getTipoIdentificacionLabel(clienteCompleto.tipoidentificacion),
        numeroIdentificacion: getClienteIdentification(clienteCompleto),
        tipoCliente: String(clienteCompleto.tipoCliente ?? ''),
        obligadoContabilidad: clienteCompleto.oblgconta ?? '',
        direccion: clienteCompleto.direccion ?? '',
        telefono: clienteCompleto.celular || clienteCompleto.telefonoconvencional || '',
      }));
      setNotaCreditoLineas(detalleRows.map((row) => detalleFacturaToNotaCreditoLinea(row as Record<string, unknown>)));
      if (detalleRows.length === 0) {
        setDirectoryMessage({ type: 'info', text: 'La factura no tiene cantidades disponibles para generar una nota de crédito.' });
      }
    } catch (error) {
      setNotaCreditoLineas([]);
      const text = error instanceof ApiError ? error.message : 'No se pudo cargar el detalle completo de la factura.';
      setDirectoryMessage({ type: 'error', text });
    }
  };

  const retryFacturaSri = async (factura: FacturaListItem) => {
    if (!catalogUserId) return;
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }
    try {
      const result = await reintentarFacturaSri(catalogUserId, factura.codfactura);
      const estado = normalizeSriState(result.estado);
      setDirectoryMessage({ type: getSriMessageType(estado), text: result.mensaje?.trim() || getSriEmissionMessage('Factura', estado) });
      setReloadKey((value) => value + 1);
      if (estado === 'AUTORIZADO') {
        showAuthorizationAlert('Factura', 'mis-facturas', 'Mis Facturas');
      }
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo reintentar la emision de la factura.';
      setDirectoryMessage({ type: 'error', text });
    }
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
    setNotaCreditoClientes([]);
    setNotaCreditoFacturas([]);
    setNotaCreditoLineas([]);
    setDirectoryMessage(null);
  };

  const emitirNotaCreditoAutomaticaDesdeFactura = async (factura: FacturaListItem) => {
    if (!catalogUserId || processingNotaCreditoAutomatica) return;
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }

    setProcessingNotaCreditoAutomatica(true);
    setDirectoryMessage({ type: 'info', text: 'Generando y autorizando la nota de credito automatica...' });
    try {
      const result = await emitirNotaCreditoAutomatica(catalogUserId, factura.codfactura);
      if (!result.success) {
        setDirectoryMessage({ type: 'error', text: result.message || 'No se pudo emitir la nota de credito automatica.' });
        return;
      }

      const estadoSri = normalizeSriState(result.estadoSri || (result.autorizada ? 'AUTORIZADO' : undefined));
      setDirectoryMessage({
        type: getSriMessageType(estadoSri),
        text: [
          result.message || 'Nota de credito automatica procesada.',
          result.numeroCompleto || result.numeroNotaCredito ? `NC: ${result.numeroCompleto || result.numeroNotaCredito}` : '',
          getSriEmissionMessage('Nota de crédito', estadoSri),
          result.numeroAutorizacion ? `Autorizacion: ${result.numeroAutorizacion}` : '',
        ].filter(Boolean).join(' '),
      });
      setReloadKey((value) => value + 1);
      if (estadoSri === 'AUTORIZADO') {
        showAuthorizationAlert('Nota de credito', 'mis-notas-credito', 'Mis Notas de Credito');
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 0 && error.message.includes('tardo demasiado')) {
        setDirectoryMessage({
          type: 'info',
          text: 'La solicitud tardó más de lo esperado. La nota de crédito puede seguir procesándose; no la vuelvas a emitir y revisa Mis notas de crédito en unos instantes.',
        });
        setReloadKey((value) => value + 1);
        return;
      }
      const text = error instanceof ApiError ? error.message : 'No se pudo emitir la nota de credito automatica.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setProcessingNotaCreditoAutomatica(false);
    }
  };

  const openFacturaCuentasCobrar = (factura: FacturaListItem) => {
    setSearch(factura.numeroCompleto ?? factura.numfactura ?? '');
    setActiveView('cuentas-cobrar');
  };

  const saveNuevaNotaCredito = async () => {
    if (!catalogUserId) return;
    if (!notaCreditoFactura) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona la factura que será modificada para generar la nota de crédito.' });
      return;
    }
    const facturaParaGuardar = notaCreditoFactura;
    if (!notaCreditoCliente) {
      setDirectoryMessage({ type: 'error', text: 'No se pudo cargar el cliente de la factura seleccionada. Vuelve a seleccionarla.' });
      return;
    }
    if (notaCreditoLineas.length === 0) {
      setDirectoryMessage({ type: 'error', text: 'Agrega al menos un detalle para la nota de credito.' });
      return;
    }

    if (!notaCreditoForm.serie.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona una serie antes de emitir la nota de crédito.' });
      return;
    }
    const clienteError = validateDocumentClientFields(notaCreditoForm, notaCreditoCliente);
    if (clienteError) {
      setDirectoryMessage({ type: 'error', text: clienteError });
      return;
    }
    if (!['Anular operaciones', 'Devolucion parcial', 'Descuento o bonificacion', 'Correccion de valores'].includes(notaCreditoForm.motivo.trim())) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona un motivo válido para la nota de crédito.' });
      return;
    }
    if (notaCreditoForm.observacion.length > 250) {
      setDirectoryMessage({ type: 'error', text: 'La observación no puede superar 250 caracteres.' });
      return;
    }

    const parse = parseDocumentNumber;
    const correoPrincipal = (notaCreditoForm.correoPrincipal.trim() || notaCreditoCliente.correo?.trim() || '').toLowerCase();
    const correoAdicional = notaCreditoForm.correoAdicional.trim().toLowerCase();
    if (correoPrincipal && !validateEmail(correoPrincipal).valid) {
      setDirectoryMessage({ type: 'error', text: 'El correo principal de la nota de crédito no tiene un formato válido.' });
      return;
    }
    if (correoAdicional && !validateEmail(correoAdicional).valid) {
      setDirectoryMessage({ type: 'error', text: 'El correo adicional de la nota de crédito no tiene un formato válido.' });
      return;
    }
    if (correoPrincipal && correoPrincipal === correoAdicional) {
      setDirectoryMessage({ type: 'error', text: 'El correo adicional debe ser diferente al correo principal.' });
      return;
    }

    const detalles = notaCreditoLineas.map((linea) => {
      const cantidad = parse(linea.cantidad);
      const precio = parse(linea.precio);
      const descuento = parse(linea.descuento);
      const tarifa = parse(linea.tarifa);
      return {
        linea,
        cantidad,
        precio,
        descuento,
        tarifa,
        total: Math.max(cantidad * precio - descuento, 0) * (1 + tarifa / 100),
      };
    });
    const allowedIva = getIvaOptions(notaCreditoPreparacion).map((option) => option.value);
    for (const [index, item] of detalles.entries()) {
      const disponible = item.linea.cantidadDisponible === undefined ? null : parse(item.linea.cantidadDisponible);
      if (!item.linea.producto.codproducto || item.linea.producto.codproducto <= 0) {
        setDirectoryMessage({ type: 'error', text: `La línea ${index + 1} no corresponde a un detalle válido de la factura original.` });
        return;
      }
      if (disponible !== null && (!Number.isFinite(disponible) || item.cantidad > disponible)) {
        setDirectoryMessage({ type: 'error', text: `La cantidad de la línea ${index + 1} supera la disponible en la factura original.` });
        return;
      }
      const fiscalError = validateFiscalLine({
        quantity: item.cantidad,
        price: item.precio,
        discount: item.descuento,
        iva: item.tarifa,
        allowedIva: allowedIva.length > 0 ? allowedIva : undefined,
        requireIntegerQuantity: true,
      });
      if (fiscalError) {
        setDirectoryMessage({ type: 'error', text: `La línea ${index + 1}: ${fiscalError}` });
        return;
      }
    }
    const totalError = validatePositiveTotal(detalles.reduce((sum, item) => sum + item.total, 0), 'la nota de crédito');
    if (totalError) {
      setDirectoryMessage({ type: 'error', text: totalError });
      return;
    }
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }

    const clienteParaGuardar: Cliente = {
      ...notaCreditoCliente,
      nombrerazonsocial: notaCreditoForm.clienteBusqueda.trim() || notaCreditoCliente.nombrerazonsocial || null,
      tipoidentificacion: getTipoIdentificacionCode(notaCreditoForm.tipoIdentificacion) || notaCreditoCliente.tipoidentificacion || null,
      numeroidentificacion: notaCreditoForm.numeroIdentificacion.trim() || notaCreditoCliente.numeroidentificacion || null,
      tipoCliente: Number(notaCreditoForm.tipoCliente) || notaCreditoCliente.tipoCliente || null,
      oblgconta: notaCreditoForm.obligadoContabilidad.trim() || notaCreditoCliente.oblgconta || null,
      direccion: notaCreditoForm.direccion.trim() || notaCreditoCliente.direccion || null,
      celular: notaCreditoForm.telefono.trim() || notaCreditoCliente.celular || null,
      correo: correoPrincipal || notaCreditoCliente.correo || null,
    };

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
        correos: correoAdicional ? [correoAdicional] : [],
        detalles: detalles.map((item) => ({
          producto: item.linea.producto,
          cantidad: item.cantidad,
          precio: item.precio,
          descuento: item.descuento,
          tarifa: item.tarifa,
          detalle: item.linea.detalle,
        })),
      });
      const secNotaCredito = result.codNotaCredito ?? result.sec;
      const sriResult = secNotaCredito
        ? await tryAuthorizeAfterSave(() => emitirNotaCredito(catalogUserId, secNotaCredito))
        : { sri: null, failed: true };
      clearNotaCreditoForm();
      setDirectoryMessage({
        type: getSriMessageType(sriResult.sri?.estado, sriResult.failed),
        text: `${result.mensaje ?? 'Nota de credito guardada.'} ${getSriEmissionMessage('Nota de crédito', sriResult.sri?.estado, sriResult.failed)}`.trim(),
      });
      setReloadKey((value) => value + 1);
      if (!sriResult.failed && sriResult.sri?.estado?.toUpperCase() === 'AUTORIZADO') {
        showAuthorizationAlert('Nota de credito', 'mis-notas-credito', 'Mis Notas de Credito');
      }
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
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }
    try {
      const result = await emitirNotaCredito(catalogUserId, nota.codNotaCredito);
      const estado = normalizeSriState(result.estado);
      setDirectoryMessage({ type: getSriMessageType(estado), text: result.mensaje?.trim() || getSriEmissionMessage('Nota de crédito', estado) });
      setReloadKey((value) => value + 1);
      if (estado === 'AUTORIZADO') {
        showAuthorizationAlert('Nota de credito', 'mis-notas-credito', 'Mis Notas de Credito');
      }
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
      tipoIdentificacion: getTipoIdentificacionLabel(cliente.tipoidentificacion),
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
      setNotaDebitoFactura(facturaCompleta);
      setNotaDebitoCliente(clienteCompleto);
      setNotaDebitoForm((current) => ({
        ...current,
        facturaBusqueda: facturaCompleta.numeroCompleto ?? facturaCompleta.numfactura ?? '',
        clienteBusqueda: getClienteDisplayName(clienteCompleto),
        correoPrincipal: getClienteEmail(clienteCompleto),
        tipoIdentificacion: getTipoIdentificacionLabel(clienteCompleto.tipoidentificacion),
        numeroIdentificacion: getClienteIdentification(clienteCompleto),
        tipoCliente: String(clienteCompleto.tipoCliente ?? ''),
        obligadoContabilidad: clienteCompleto.oblgconta ?? '',
        direccion: clienteCompleto.direccion ?? '',
        telefono: clienteCompleto.celular || clienteCompleto.telefonoconvencional || '',
      }));
      setNotaDebitoLineas([initialNotaDebitoLinea]);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo cargar el detalle completo de la factura.';
      setDirectoryMessage({ type: 'info', text });
    }
  };

  const openKnownDocumentAsset = async (urlOrPath?: string | null) => {
    if (!urlOrPath) {
      setDirectoryMessage({ type: 'error', text: 'No se encontro la ruta del documento.' });
      return;
    }

    try {
      await Linking.openURL(getDocumentAssetUrl(urlOrPath));
    } catch {
      setDirectoryMessage({ type: 'error', text: 'No se pudo abrir el documento.' });
    }
  };

  const importNotaCreditoXml = async (uri: string) => {
    try {
      const parsed = parseFacturaXml(await FileSystem.readAsStringAsync(uri));
      if (!parsed) {
        setDirectoryMessage({ type: 'error', text: 'No se pudo leer la informacion de la factura en el XML.' });
        return;
      }
      setNotaCreditoFactura(parsed.factura);
      setNotaCreditoCliente(parsed.cliente);
      setNotaCreditoFacturas([]);
      setNotaCreditoLineas(parsed.detalles.length ? parsed.detalles : []);
      setNotaCreditoForm((current) => ({
        ...current,
        facturaBusqueda: parsed.factura.numeroCompleto ?? parsed.factura.numfactura ?? '',
        clienteBusqueda: getClienteDisplayName(parsed.cliente),
        correoPrincipal: getClienteEmail(parsed.cliente),
        tipoIdentificacion: getTipoIdentificacionLabel(parsed.cliente.tipoidentificacion),
        numeroIdentificacion: getClienteIdentification(parsed.cliente),
        tipoCliente: String(parsed.cliente.tipoCliente ?? ''),
        obligadoContabilidad: parsed.cliente.oblgconta ?? '',
        direccion: parsed.cliente.direccion ?? '',
        telefono: parsed.cliente.celular || parsed.cliente.telefonoconvencional || '',
      }));
      setDirectoryMessage({ type: 'success', text: 'XML cargado correctamente. Revisa los datos antes de guardar.' });
    } catch {
      setDirectoryMessage({ type: 'error', text: 'No se pudo procesar el XML seleccionado.' });
    }
  };

  const importNotaDebitoXml = async (uri: string) => {
    try {
      const parsed = parseFacturaXml(await FileSystem.readAsStringAsync(uri));
      if (!parsed) {
        setDirectoryMessage({ type: 'error', text: 'No se pudo leer la informacion de la factura en el XML.' });
        return;
      }
      setNotaDebitoFactura(parsed.factura);
      setNotaDebitoCliente(parsed.cliente);
      setNotaDebitoFacturas([]);
      setNotaDebitoLineas([initialNotaDebitoLinea]);
      setNotaDebitoForm((current) => ({
        ...current,
        facturaBusqueda: parsed.factura.numeroCompleto ?? parsed.factura.numfactura ?? '',
        clienteBusqueda: getClienteDisplayName(parsed.cliente),
        correoPrincipal: getClienteEmail(parsed.cliente),
        tipoIdentificacion: getTipoIdentificacionLabel(parsed.cliente.tipoidentificacion),
        numeroIdentificacion: getClienteIdentification(parsed.cliente),
        tipoCliente: String(parsed.cliente.tipoCliente ?? ''),
        obligadoContabilidad: parsed.cliente.oblgconta ?? '',
        direccion: parsed.cliente.direccion ?? '',
        telefono: parsed.cliente.celular || parsed.cliente.telefonoconvencional || '',
      }));
      setDirectoryMessage({ type: 'success', text: 'XML cargado correctamente. Revisa los datos antes de guardar.' });
    } catch {
      setDirectoryMessage({ type: 'error', text: 'No se pudo procesar el XML seleccionado.' });
    }
  };

  const updateNotaDebitoLinea = (index: number, field: keyof NotaDebitoLinea, value: string) => {
    setNotaDebitoLineas((current) => current.map((linea, currentIndex) => currentIndex === index ? { ...linea, [field]: value } : linea));
  };

  const clearNotaDebitoForm = () => {
    setNotaDebitoForm(initialNotaDebitoForm);
    setNotaDebitoFactura(null);
    setNotaDebitoCliente(null);
    setNotaDebitoFacturas([]);
    setNotaDebitoLineas([initialNotaDebitoLinea]);
    pendingNotaDebitoRetryRef.current = null;
    setDirectoryMessage(null);
  };

  const saveNuevaNotaDebito = async () => {
    if (!catalogUserId || savingNotaDebito) return;
    if (pendingNotaDebitoRetryRef.current) {
      Alert.alert(
        'Nota de debito posiblemente guardada',
        'La solicitud anterior tardo demasiado. Revisa el historial antes de volver a emitir para evitar duplicados.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver historial', onPress: () => { pendingNotaDebitoRetryRef.current = null; openView('mis-notas-debito'); } },
          { text: 'Emitir otra vez', style: 'destructive', onPress: () => { pendingNotaDebitoRetryRef.current = null; void saveNuevaNotaDebito(); } },
        ],
      );
      return;
    }
    if (!notaDebitoFactura) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona la factura autorizada que será modificada.' });
      return;
    }
    if (!notaDebitoCliente) {
      setDirectoryMessage({ type: 'error', text: 'No se pudo cargar el cliente de la factura seleccionada.' });
      return;
    }
    if (notaDebitoLineas.length === 0) {
      setDirectoryMessage({ type: 'error', text: 'Agrega al menos un motivo para la nota de debito.' });
      return;
    }

    if (!notaDebitoForm.serie.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona una serie antes de emitir la nota de débito.' });
      return;
    }
    const clienteError = validateDocumentClientFields(notaDebitoForm, notaDebitoCliente);
    if (clienteError) {
      setDirectoryMessage({ type: 'error', text: clienteError });
      return;
    }
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }

    const parse = parseDocumentNumber;
    const correoPrincipal = (notaDebitoForm.correoPrincipal.trim() || notaDebitoCliente.correo?.trim() || '').toLowerCase();
    const correoAdicional = notaDebitoForm.correoAdicional.trim().toLowerCase();
    if (correoPrincipal && !validateEmail(correoPrincipal).valid) {
      setDirectoryMessage({ type: 'error', text: 'El correo principal no tiene un formato válido.' });
      return;
    }
    if (correoAdicional && !validateEmail(correoAdicional).valid) {
      setDirectoryMessage({ type: 'error', text: 'El correo adicional no tiene un formato válido.' });
      return;
    }
    if (correoPrincipal && correoPrincipal === correoAdicional) {
      setDirectoryMessage({ type: 'error', text: 'El correo adicional debe ser diferente al principal.' });
      return;
    }

    const clienteParaGuardar: Cliente = {
      ...notaDebitoCliente,
      nombrerazonsocial: notaDebitoForm.clienteBusqueda.trim() || notaDebitoCliente.nombrerazonsocial || null,
      tipoidentificacion: getTipoIdentificacionCode(notaDebitoForm.tipoIdentificacion) || notaDebitoCliente.tipoidentificacion || null,
      numeroidentificacion: notaDebitoForm.numeroIdentificacion.trim() || notaDebitoCliente.numeroidentificacion || null,
      tipoCliente: Number(notaDebitoForm.tipoCliente) || notaDebitoCliente.tipoCliente || null,
      oblgconta: notaDebitoForm.obligadoContabilidad.trim() || notaDebitoCliente.oblgconta || null,
      direccion: notaDebitoForm.direccion.trim() || notaDebitoCliente.direccion || null,
      celular: notaDebitoForm.telefono.trim() || notaDebitoCliente.celular || null,
      correo: correoPrincipal || notaDebitoCliente.correo || null,
    };
    if (!clienteParaGuardar.numeroidentificacion || !clienteParaGuardar.direccion || !clienteParaGuardar.oblgconta) {
      setDirectoryMessage({ type: 'error', text: 'Completa identificacion, direccion y obligado a llevar contabilidad del cliente.' });
      return;
    }

    const detalles = notaDebitoLineas.map((linea) => ({
      linea,
      precio: parse(linea.precio),
      tarifa: parse(linea.tarifa),
      valorIce: parse(linea.valorIce),
    }));
    const configuredIva = getIvaOptions(notaDebitoPreparacion).map((option) => option.value);
    const allowedIva = configuredIva.length > 0 ? configuredIva : [0, 5, 8, 12, 13, 14, 15];
    for (const [index, item] of detalles.entries()) {
      if (!item.linea.descripcion.trim()) {
        setDirectoryMessage({ type: 'error', text: `Ingresa la descripcion del motivo ${index + 1}.` });
        return;
      }
      if (item.linea.descripcion.trim().length > 300) {
        setDirectoryMessage({ type: 'error', text: `La descripcion del motivo ${index + 1} no puede superar 300 caracteres.` });
        return;
      }
       const fiscalError = validateFiscalLine({
         price: item.precio,
         iva: item.tarifa,
          allowedIva,
         ice: item.valorIce,
       });
       if (fiscalError) {
         setDirectoryMessage({ type: 'error', text: `El motivo ${index + 1}: ${fiscalError}` });
         return;
       }
     }
    const totalNotaDebito = detalles.reduce((sum, item) => sum + item.precio + item.valorIce + (item.precio + item.valorIce) * item.tarifa / 100, 0);
    const totalNotaDebitoError = validatePositiveTotal(totalNotaDebito, 'la nota de débito');
    if (totalNotaDebitoError) {
      setDirectoryMessage({ type: 'error', text: totalNotaDebitoError });
      return;
    }

    setSavingNotaDebito(true);
    setDirectoryMessage(null);
    const saveStartedAt = Date.now();
    try {
      const result = await guardarNotaDebito({
        idUsuario: catalogUserId,
        cliente: clienteParaGuardar,
        facturaModificada: notaDebitoFactura,
        serie: notaDebitoForm.serie,
        numeroNotaDebito: notaDebitoForm.numeroFactura,
        codemisor: getSerieCodemisorFromOptions(getDocumentSerieOptions(notaDebitoPreparacion, puntosData, 'notaDebito'), notaDebitoForm.serie, notaDebitoPreparacion),
        correos: correoAdicional ? [correoAdicional] : [],
        detalles: detalles.map((item) => ({
          descripcion: item.linea.descripcion.trim(),
          precio: item.precio,
          tarifa: item.tarifa,
          impuestoIce: item.linea.impuestoIce,
          valorIce: item.valorIce,
        })),
      });
      const secNotaDebito = result.codNotaDebito;
      pendingNotaDebitoRetryRef.current = null;
      const sriResult = secNotaDebito
        ? await tryAuthorizeAfterSave(() => emitirNotaDebito(catalogUserId, secNotaDebito))
        : { sri: null, failed: true };
      clearNotaDebitoForm();
      setDirectoryMessage({
        type: getSriMessageType(sriResult.sri?.estado, sriResult.failed),
        text: `${result.mensaje ?? 'Nota de debito guardada.'} ${getSriEmissionMessage('Nota de débito', sriResult.sri?.estado, sriResult.failed)}`.trim(),
      });
      setReloadKey((value) => value + 1);
      if (!sriResult.failed && sriResult.sri?.estado?.toUpperCase() === 'AUTORIZADO') {
        showAuthorizationAlert('Nota de debito', 'mis-notas-debito', 'Mis Notas de Debito');
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 0) {
        pendingNotaDebitoRetryRef.current = saveStartedAt;
        setDirectoryMessage({ type: 'info', text: 'La solicitud tardo mas de lo esperado. La nota puede haberse guardado; revisa el historial antes de volver a emitir.' });
        setReloadKey((value) => value + 1);
        return;
      }
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
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }
    try {
      const result = await emitirNotaDebito(catalogUserId, nota.codNotaDebito);
      const estado = normalizeSriState(result.estado);
      setDirectoryMessage({ type: getSriMessageType(estado), text: result.mensaje?.trim() || getSriEmissionMessage('Nota de débito', estado) });
      setReloadKey((value) => value + 1);
      if (estado === 'AUTORIZADO') {
        showAuthorizationAlert('Nota de debito', 'mis-notas-debito', 'Mis Notas de Debito');
      }
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
      const remoteProductos = await buscarLiquidacionProductos(catalogUserId, liquidacionForm.productoBusqueda);
      const usableRemote = getUsableFacturaProductos(remoteProductos);
      setLiquidacionProductos(usableRemote.length > 0 ? usableRemote : searchLocalFacturaProductos(liquidacionForm.productoBusqueda));
    } catch (error) {
      const localProductos = searchLocalFacturaProductos(liquidacionForm.productoBusqueda);
      if (localProductos.length > 0) {
        setLiquidacionProductos(localProductos);
        return;
      }
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
      tipoIdentificacion: getTipoIdentificacionLabel(proveedor.tipoidentificacion),
      numeroIdentificacion: getClienteIdentification(proveedor),
      direccion: proveedor.direccion ?? '',
      telefono: proveedor.celular || proveedor.telefonoconvencional || '',
      correoPrincipal: getClienteEmail(proveedor),
    }));
  };

  const addLiquidacionProducto = (producto: FacturaProducto) => {
    const selectedProduct = ensureFacturaProducto(producto);
    setLiquidacionLineas((current) => [...current, {
      producto: selectedProduct,
      cantidad: '1',
      precio: String(selectedProduct.precioUnitario ?? 0),
      descuento: '0',
      tarifa: String(selectedProduct.tarifaIva ?? 15),
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

  const prepararRetencionLiquidacion = async (liquidacion: LiquidacionCompraListItem) => {
    const autorizado = liquidacion.autorizado || String(liquidacion.estadoSri ?? '').toUpperCase().includes('AUTORIZ');
    if (!autorizado) {
      setDirectoryMessage({ type: 'error', text: 'La liquidacion debe estar autorizada por el SRI antes de generar la retencion.' });
      return;
    }
    if (liquidacion.retencionDisponible) {
      setDirectoryMessage({ type: 'info', text: 'La liquidacion seleccionada ya tiene una retencion registrada.' });
      return;
    }

    setLiquidacionRetencion(liquidacion);
    setLoadingLiquidacionRetencion(true);
    try {
      const [iva, renta] = await Promise.all([getRetencionCatalogo('IVA'), getRetencionCatalogo('RENTA')]);
      setRetencionesIvaCatalogo(iva);
      setRetencionesRentaCatalogo(renta);
    } catch (error) {
      setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudieron cargar los catalogos de retencion.' });
    } finally {
      setLoadingLiquidacionRetencion(false);
    }
  };

  const continuarRetencionLiquidacion = (liquidacion: LiquidacionCompraListItem) => {
    setActiveView('nueva-liquidacion-compra');
    void prepararRetencionLiquidacion(liquidacion);
  };

  const saveRetencionLiquidacion = async (retencion: LiquidacionRetencionInput) => {
    if (!catalogUserId || !liquidacionRetencion) return;
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }

    setSavingLiquidacionRetencion(true);
    setDirectoryMessage(null);
    try {
      const result = await crearRetencionDesdeLiquidacion(catalogUserId, liquidacionRetencion.codLiquidacion, retencion);
      const codRetencion = result.codRetencion;
      if (!codRetencion) throw new Error('No se encontro la retencion generada para emitirla al SRI.');

      setLiquidacionRetencion(null);
      setDirectoryMessage({ type: 'info', text: 'Retencion generada. Enviandola al SRI...' });
      setReloadKey((value) => value + 1);
      await emitRetencionSri({ codRetencion });
    } catch (error) {
      setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo generar la retencion de la liquidacion.' });
    } finally {
      setSavingLiquidacionRetencion(false);
    }
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

    const parseDecimal = (value: string) => Number(value.replace(',', '.'));
    const detalles = liquidacionLineas.map((linea) => ({
      producto: linea.producto,
      cantidad: parseDecimal(linea.cantidad),
      precio: parseDecimal(linea.precio),
      descuento: parseDecimal(linea.descuento),
      tarifa: parseDecimal(linea.tarifa),
    }));
    const detalleInvalido = detalles.find((item) =>
      !Number.isFinite(item.cantidad) || item.cantidad <= 0 ||
      !Number.isFinite(item.precio) || item.precio <= 0 ||
      !Number.isFinite(item.descuento) || item.descuento < 0 || item.descuento > item.cantidad * item.precio ||
      !Number.isFinite(item.tarifa) || item.tarifa < 0,
    );
    if (detalleInvalido) {
      setDirectoryMessage({ type: 'error', text: 'Revisa cantidad, precio, descuento e IVA de cada detalle.' });
      return;
    }

    const correoPrincipal = liquidacionForm.correoPrincipal.trim();
    const correoAdicional = liquidacionForm.correoAdicional.trim();
    if (correoPrincipal && !validateEmail(correoPrincipal).valid) {
      setDirectoryMessage({ type: 'error', text: 'El correo del proveedor no tiene un formato valido.' });
      return;
    }
    if (correoAdicional && !validateEmail(correoAdicional).valid) {
      setDirectoryMessage({ type: 'error', text: 'El correo adicional no tiene un formato valido.' });
      return;
    }
    if (correoAdicional && correoPrincipal.toLowerCase() === correoAdicional.toLowerCase()) {
      setDirectoryMessage({ type: 'error', text: 'El correo adicional debe ser diferente al correo principal.' });
      return;
    }
    if (liquidacionForm.direccion.trim().length < 5) {
      setDirectoryMessage({ type: 'error', text: 'La direccion del proveedor debe tener al menos 5 caracteres.' });
      return;
    }
    if (!liquidacionForm.formaPago.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona una forma de pago.' });
      return;
    }
    if (liquidacionForm.numeroFactura.trim() && !/^\d{1,9}$/.test(liquidacionForm.numeroFactura.trim())) {
      setDirectoryMessage({ type: 'error', text: 'El secuencial debe contener solo numeros y tener hasta 9 digitos.' });
      return;
    }

    const total = detalles.reduce((sum, item) => {
      const base = Math.max(item.cantidad * item.precio - item.descuento, 0);
      return sum + base + base * (item.tarifa / 100);
    }, 0);
    if (total <= 0) {
      setDirectoryMessage({ type: 'error', text: 'El total de la liquidacion debe ser mayor a cero.' });
      return;
    }
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }

    const proveedor = {
      ...liquidacionProveedor,
      direccion: liquidacionForm.direccion.trim(),
      celular: liquidacionForm.telefono.trim() || liquidacionProveedor.celular,
      correo: correoPrincipal || liquidacionProveedor.correo,
    };
    setSavingLiquidacion(true);
    setDirectoryMessage(null);
    try {
      const result = await guardarLiquidacionCompra({
        idUsuario: catalogUserId,
        proveedor,
        serie: liquidacionForm.serie,
        numero: liquidacionForm.numeroFactura,
        codemisor: getSerieCodemisorFromOptions(getDocumentSerieOptions(liquidacionPreparacion, puntosData, 'liquidacion'), liquidacionForm.serie, liquidacionPreparacion),
        formaPago: liquidacionForm.formaPago,
        diasCredito: Number(liquidacionForm.diasCredito) || 0,
        correos: correoAdicional ? [correoAdicional] : [],
        correosGuardar: correoAdicional ? [correoAdicional] : [],
        detalles: detalles.map((item) => ({
          ...item,
          codigoPorcentaje: getLiquidacionCodigoPorcentaje(item.producto, item.tarifa),
          detalle: liquidacionForm.detalleLinea,
        })),
      });
      const codLiquidacion = result.codLiquidacion;
      const sriResult = codLiquidacion
        ? await tryAuthorizeAfterSave(() => emitirLiquidacionCompra(catalogUserId, codLiquidacion))
        : { sri: null, failed: true };
      const ivaLiquidacion = detalles.reduce((sum, item) => {
        const base = Math.max(item.cantidad * item.precio - item.descuento, 0);
        return sum + base * (item.tarifa / 100);
      }, 0);
      const liquidacionAutorizada: LiquidacionCompraListItem = {
        codLiquidacion: codLiquidacion ?? 0,
        numero: liquidacionForm.numeroFactura || undefined,
        fecha: new Date().toISOString(),
        proveedor: getClienteDisplayName(proveedor),
        identificacionProveedor: proveedor.numeroidentificacion,
        estadoSri: 'AUTORIZADO',
        autorizado: true,
        base: Math.max(total - ivaLiquidacion, 0),
        iva: ivaLiquidacion,
        total,
      };
      clearLiquidacionForm();
      setDirectoryMessage({
        type: sriResult.failed ? 'info' : sriResult.sri?.estado?.toUpperCase() === 'AUTORIZADO' ? 'success' : 'info',
        text: `${result.mensaje ?? 'Liquidacion guardada.'} ${getSriEmissionMessage('Liquidación de compra', sriResult.sri?.estado, sriResult.failed)}`.trim(),
      });
      setReloadKey((value) => value + 1);
      if (!sriResult.failed && sriResult.sri?.estado?.toUpperCase() === 'AUTORIZADO') {
        void prepararRetencionLiquidacion(liquidacionAutorizada);
        Alert.alert(
          'Liquidacion autorizada',
          'La liquidacion fue autorizada por el SRI. Ya puedes continuar con la retencion.',
          [
            { text: 'Continuar con retencion', onPress: () => setActiveView('nueva-liquidacion-compra') },
            { text: 'Ir a Mis Liquidaciones', onPress: () => openView('mis-liquidaciones-compra') },
            { text: 'Ahora no', style: 'cancel' },
          ],
        );
      }
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
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }
    try {
      const result = await emitirLiquidacionCompra(catalogUserId, liquidacion.codLiquidacion);
      const estado = normalizeSriState(result.estado);
      setDirectoryMessage({
        type: getSriMessageType(estado),
        text: result.mensaje?.trim() || getSriEmissionMessage('Liquidación de compra', estado),
      });
      setReloadKey((value) => value + 1);
      if (estado === 'AUTORIZADO') {
        showAuthorizationAlert('Liquidacion de compra', 'mis-liquidaciones-compra', 'Mis Liquidaciones');
      }
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
    setLoadingGuiaSearch(true);
    setDirectoryMessage(null);
    try {
      setGuiaTransportistas(await buscarGuiaTransportistas(catalogUserId, guiaForm.transportistaBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar transportistas.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingGuiaSearch(false);
    }
  };

  const searchGuiaClientes = async () => {
    if (!catalogUserId || !guiaForm.clienteBusquedaGuia.trim()) return;
    setLoadingGuiaSearch(true);
    setDirectoryMessage(null);
    try {
      setGuiaClientes(await buscarGuiaClientes(catalogUserId, guiaForm.clienteBusquedaGuia));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar clientes.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingGuiaSearch(false);
    }
  };

  const searchGuiaFacturas = async () => {
    if (!catalogUserId || !guiaForm.facturaBusqueda.trim()) return;
    setLoadingGuiaSearch(true);
    setDirectoryMessage(null);
    try {
      setGuiaFacturas(await buscarGuiaFacturas(catalogUserId, guiaForm.facturaBusqueda));
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar facturas.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingGuiaSearch(false);
    }
  };

  const searchGuiaProductos = async () => {
    if (!catalogUserId || !guiaForm.productoBusqueda.trim()) return;
    setLoadingGuiaSearch(true);
    setDirectoryMessage(null);
    try {
      const remoteProductos = await buscarGuiaProductos(catalogUserId, guiaForm.productoBusqueda);
      const usableRemote = getUsableFacturaProductos(remoteProductos);
      setGuiaProductos(usableRemote.length > 0 ? usableRemote : searchLocalFacturaProductos(guiaForm.productoBusqueda));
    } catch (error) {
      const localProductos = searchLocalFacturaProductos(guiaForm.productoBusqueda);
      if (localProductos.length > 0) {
        setGuiaProductos(localProductos);
        return;
      }
      const text = error instanceof ApiError ? error.message : 'No se pudo buscar productos.';
      setDirectoryMessage({ type: 'error', text });
    } finally {
      setLoadingGuiaSearch(false);
    }
  };

  const selectGuiaTransportista = (transportista: Cliente) => {
    setGuiaTransportista(transportista);
    setGuiaTransportistas([]);
    setGuiaForm((current) => ({
      ...current,
      transportistaBusqueda: getClienteDisplayName(transportista),
      tipoIdentificacion: getTipoIdentificacionLabel(transportista.tipoidentificacion),
      numeroIdentificacion: getClienteIdentification(transportista),
      direccion: transportista.direccion ?? current.direccion,
      telefono: transportista.celular || transportista.telefonoconvencional || current.telefono,
      correoPrincipal: getClienteEmail(transportista) || current.correoPrincipal,
    }));
  };

  const selectGuiaCliente = (cliente: Cliente) => {
    setGuiaCliente(cliente);
    setGuiaClientes([]);
    setGuiaForm((current) => ({
      ...current,
      clienteBusquedaGuia: getClienteDisplayName(cliente),
      tipoIdentificacion: getTipoIdentificacionLabel(cliente.tipoidentificacion),
      numeroIdentificacion: getClienteIdentification(cliente),
      direccion: cliente.direccion ?? current.direccion,
      telefono: cliente.celular || cliente.telefonoconvencional || current.telefono,
      correoPrincipal: getClienteEmail(cliente) || current.correoPrincipal,
    }));
  };

  const selectGuiaFactura = async (factura: FacturaListItem) => {
    if (!catalogUserId) return;
    setGuiaFactura(factura);
    setGuiaDetalles([]);
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
    if (guiaFactura) {
      setDirectoryMessage({ type: 'info', text: 'Al vincular una factura, los detalles se cargan desde esa factura.' });
      return;
    }
    setGuiaDetalles((current) => [...current, { producto: ensureFacturaProducto(producto), cantidad: '1' }]);
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
    pendingGuiaRetryRef.current = null;
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
    if (!catalogUserId || savingGuia) return;
    if (pendingGuiaRetryRef.current) {
      Alert.alert(
        'Guia posiblemente guardada',
        'La solicitud anterior tardo demasiado. Revisa el historial antes de volver a emitir para evitar duplicados.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver historial', onPress: () => { pendingGuiaRetryRef.current = null; openView('mis-guias-remision'); } },
          { text: 'Emitir otra vez', style: 'destructive', onPress: () => { pendingGuiaRetryRef.current = null; void saveNuevaGuia(); } },
        ],
      );
      return;
    }
    if (!guiaTransportista) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona un transportista para la guia.' });
      return;
    }
    if (!guiaCliente) {
      setDirectoryMessage({ type: 'error', text: 'Selecciona un destinatario con direccion valida.' });
      return;
    }
    const identificacionTransportista = getClienteIdentification(guiaTransportista).trim();
    const identificacionDestinatario = getClienteIdentification(guiaCliente).trim();
    if (!getClienteDisplayName(guiaTransportista).trim() || !identificacionTransportista || !guiaTransportista.direccion?.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Completa razon social, identificacion y direccion del transportista.' });
      return;
    }
    if (!getClienteDisplayName(guiaCliente).trim() || !identificacionDestinatario || !guiaCliente.direccion?.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Completa razon social, identificacion y direccion del destinatario.' });
      return;
    }
    if (!guiaForm.placa.trim() || !guiaForm.direccionOrigen.trim() || !guiaForm.referencia.trim()) {
      setDirectoryMessage({ type: 'error', text: 'Completa placa, direccion de origen y motivo de traslado.' });
      return;
    }
    const fechaError = validateDateRange(guiaForm.fechaInicioTraslado, guiaForm.fechaFinTraslado);
    if (!guiaForm.fechaEmision || fechaError) {
      setDirectoryMessage({ type: 'error', text: fechaError ?? 'Revisa la fecha de emisión.' });
      return;
    }
    if (guiaDetalles.length === 0) {
      setDirectoryMessage({ type: 'error', text: 'Agrega al menos un detalle de traslado.' });
      return;
    }
    const detalleKeys = new Set<string>();
    let detalles: GuiaRemisionDetalleInput[];
    try {
      detalles = guiaDetalles.map((detalle) => {
        const cantidad = parseDocumentNumber(detalle.cantidad);
        const key = `${detalle.producto.codprincipal ?? detalle.producto.codproducto}|${detalle.producto.codauxiliar ?? ''}`;
        const fiscalError = validateFiscalLine({ quantity: cantidad, requireIntegerQuantity: true });
        if (fiscalError) throw new Error(fiscalError);
        if (detalleKeys.has(key)) throw new Error('No repitas el mismo producto en los detalles de la guia.');
        detalleKeys.add(key);
        if (!detalle.producto.descripcion?.trim()) throw new Error('Cada detalle debe tener una descripcion.');
        return { producto: detalle.producto, cantidad };
      });
    } catch (error) {
      setDirectoryMessage({ type: 'error', text: error instanceof Error ? error.message : 'Revisa los detalles de la guia.' });
      return;
    }
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }
    setSavingGuia(true);
    setDirectoryMessage(null);
    const saveStartedAt = Date.now();
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
        detalles,
      });
      const secGuia = result.codGuia;
      pendingGuiaRetryRef.current = null;
      const sriResult = secGuia
        ? await tryAuthorizeAfterSave(() => emitirGuiaRemision(catalogUserId, secGuia))
        : { sri: null, failed: true };
      clearGuiaForm();
      setDirectoryMessage({
        type: getSriMessageType(sriResult.sri?.estado, sriResult.failed),
        text: `${result.mensaje ?? 'Guia de remision guardada.'} ${getSriEmissionMessage('Guía de remisión', sriResult.sri?.estado, sriResult.failed)}`.trim(),
      });
      setReloadKey((value) => value + 1);
      if (!sriResult.failed && sriResult.sri?.estado?.toUpperCase() === 'AUTORIZADO') {
        showAuthorizationAlert('Guia de remision', 'mis-guias-remision', 'Mis Guias de Remision');
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 0) {
        pendingGuiaRetryRef.current = saveStartedAt;
        setDirectoryMessage({ type: 'info', text: 'La solicitud tardo mas de lo esperado. La guia puede haberse guardado; revisa el historial antes de volver a emitir.' });
        setReloadKey((value) => value + 1);
        return;
      }
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
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }
    try {
      const result = await emitirGuiaRemision(catalogUserId, guia.codGuia);
      const estado = normalizeSriState(result.estado);
      setDirectoryMessage({ type: getSriMessageType(estado), text: result.mensaje?.trim() || getSriEmissionMessage('Guía de remisión', estado) });
      setReloadKey((value) => value + 1);
      if (estado === 'AUTORIZADO') {
        showAuthorizationAlert('Guia de remision', 'mis-guias-remision', 'Mis Guias de Remision');
      }
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
        'perfil-e-rubrica',
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

    if (view === 'firma' && canUseFirma) {
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

    if (['nueva-categoria', 'nueva-subcategoria'].includes(view) && authorizedViews.has('categorias')) {
      setActiveView(view);
      return;
    }

    if (view === 'nuevo-emisor' && authorizedViews.has('emisor')) {
      setActiveView(view);
      return;
    }

    if (view === 'nueva-firma' && canUseFirma) {
      setActiveView(view);
      return;
    }

    if (view === 'nuevo-punto-emision' && authorizedViews.has('punto-emision')) {
      setActiveView(view);
      return;
    }

    if (view === 'bot' && canUseEfact) {
      setActiveView(view);
      return;
    }

    if (view === 'e-rubrica' && canUseERubrica) {
      setErubricaTabRequest(null);
      setActiveView(view);
      return;
    }

    if (view === 'perfil-e-rubrica' && canUseERubrica) {
      setActiveView(view);
      return;
    }

    if (authorizedViews.has(view)) {
      setActiveView(view);
      return;
    }

    setActiveView('no-autorizado');
  };

  const handleBotNavigate = (route: string) => {
    const routeMap: Record<string, WorkspaceView> = {
      '/facturacion': 'facturacion',
      '/facturacion/nueva': 'nueva-factura',
      '/facturacion/notas-credito': 'nueva-nota-credito',
      '/facturacion/notas-credito-generadas': 'mis-notas-credito',
      '/facturacion/notas-debito': 'nueva-nota-debito',
      '/facturacion/retenciones': 'retenciones',
      '/e-rubrica': 'e-rubrica',
      '/cuentas-cobrar': 'cuentas-cobrar',
    };
    const normalizedRoute = route.trim().toLowerCase();
    const view = routeMap[normalizedRoute] ?? routeMap[`/${normalizedRoute.replace(/^\/+/, '')}`];
    if (view) openView(view);
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
  const menuNode = (view: WorkspaceView, label?: string, icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name']): DrawerMenuNode => {
    const module = moduleByView.get(view);
    return {
      key: `${view}-${label ?? module?.title ?? getWorkspaceTitle(view)}`,
      label: label ?? module?.title ?? getWorkspaceTitle(view),
      view,
      icon,
      count: module?.count,
      disabled: module ? !module.enabled : !authorizedViews.has(view),
    };
  };
  const efactDrawerMenu: DrawerMenuNode[] = [
    menuNode('clientes', 'Clientes / Proveedores'),
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
        menuNode('punto-emision', 'Pto. Emision'),
        menuNode('centro-normativo', 'Centro normativo'),
      ],
    },
  ];
  const openERubricaTab = (tab: ERubricaTab) => {
    setErubricaTabRequest(tab);
    setMenuOpen(false);
    setSearch('');
    if (canUseERubrica) {
      setActiveView('e-rubrica');
      return;
    }
    setActiveView('no-autorizado');
  };

  const openPdfPreview = async (loader: () => Promise<{ url?: string | null } | string>, fileName: string) => {
    try {
      const response = await loader();
      const url = getDocumentAssetUrl(response);
      if (!url) throw new Error('empty-url');
      const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!baseDirectory) throw new Error('missing-directory');
      const target = `${baseDirectory}preview-${Date.now()}-${fileName.replace(/[^a-z0-9._-]/gi, '-')}`;
      const cookie = getAuthSessionCookie();
      const download = await FileSystem.downloadAsync(url, target, cookie ? { headers: { Cookie: cookie } } : undefined);
      setPdfPreview({ uri: download.uri, name: fileName });
    } catch (error) {
      setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo cargar la previsualización del PDF.' });
    }
  };
  const downloadPdf = async (loader: () => Promise<{ url?: string | null } | string>, fileName: string) => {
    try {
      const response = await loader();
      const url = getDocumentAssetUrl(response);
      if (!url) throw new Error('empty-url');
      const safeName = buildDeviceFileName(fileName, '.pdf');
      const cacheDirectory = FileSystem.cacheDirectory;
      if (!cacheDirectory) throw new Error('missing-directory');
      const cookie = getAuthSessionCookie();
      const download = await FileSystem.downloadAsync(url, `${cacheDirectory}${safeName}`, cookie ? { headers: { Cookie: cookie } } : undefined);
      const savedUri = await saveFileToDevice(download.uri, safeName, 'application/pdf');
      setDirectoryMessage({
        type: savedUri ? 'success' : 'info',
        text: savedUri ? `PDF guardado en el dispositivo: ${safeName}` : 'Selecciona una carpeta para guardar el PDF.',
      });
    } catch (error) {
      setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo descargar el PDF.' });
    }
  };
  const openOrDownloadPdf = (loader: () => Promise<{ url?: string | null } | string>, fileName: string, descargar = false) => {
    return descargar ? downloadPdf(loader, fileName) : openPdfPreview(loader, fileName);
  };
  const openLocalPdfInDeviceViewer = async (uri: string) => {
    if (Platform.OS === 'android') {
      const contentUri = await FileSystem.getContentUriAsync(uri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        type: 'application/pdf',
        flags: 1,
      });
      return;
    }

    await Linking.openURL(uri);
  };
  const openPdfInDeviceViewer = async (loader: () => Promise<{ url?: string | null } | string>, fileName: string) => {
    try {
      const response = await loader();
      const url = getDocumentAssetUrl(response);
      if (!url) throw new Error('empty-url');
      const cacheDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!cacheDirectory) throw new Error('missing-directory');
      const cookie = getAuthSessionCookie();
      const download = await FileSystem.downloadAsync(url, `${cacheDirectory}preview-${Date.now()}-${buildDeviceFileName(fileName, '.pdf')}`, cookie ? { headers: { Cookie: cookie } } : undefined);
      await openLocalPdfInDeviceViewer(download.uri);
    } catch (error) {
      setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo previsualizar el PDF.' });
    }
  };
  const sharePdf = async (loader: () => Promise<{ url?: string | null } | string>, fileName: string) => {
    try {
      const response = await loader();
      const url = getDocumentAssetUrl(response);
      if (!url) throw new Error('empty-url');
      if (!(await Sharing.isAvailableAsync())) {
        setDirectoryMessage({ type: 'error', text: 'No hay aplicaciones disponibles para compartir el PDF.' });
        return;
      }
      const cacheDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!cacheDirectory) throw new Error('missing-directory');
      const cookie = getAuthSessionCookie();
      const safeName = buildDeviceFileName(fileName, '.pdf');
      const download = await FileSystem.downloadAsync(url, `${cacheDirectory}${safeName}`, cookie ? { headers: { Cookie: cookie } } : undefined);
      await Sharing.shareAsync(download.uri, { mimeType: 'application/pdf', dialogTitle: `Compartir ${fileName}` });
    } catch (error) {
      setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo compartir el PDF.' });
    }
  };
  const openPdfWithExternalViewer = async () => {
    if (!pdfPreview) return;

    try {
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(pdfPreview.uri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          type: 'application/pdf',
          flags: 1,
        });
        return;
      }

      await Linking.openURL(pdfPreview.uri);
    } catch {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfPreview.uri, { mimeType: 'application/pdf', dialogTitle: 'Abrir PDF con otra aplicación' });
        return;
      }

      setDirectoryMessage({ type: 'error', text: 'No hay una aplicación disponible para visualizar este PDF.' });
    }
  };
  const downloadEstadoCuentaFile = async (item: OperationalMobileItem, format: 'pdf' | 'excel') => {
    if (!catalogUserId) return;
    const idCliente = Number(item.id);
    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      setDirectoryMessage({ type: 'error', text: 'No se pudo identificar el cliente del estado de cuenta.' });
      return;
    }

    try {
      const response = format === 'pdf'
        ? await getEstadoCuentaPdf(catalogUserId, idCliente)
        : await getEstadoCuentaExcel(catalogUserId, idCliente);
      const saved = await saveBinaryFileToDevice(
        response.bytes,
        `estado-cuenta-${idCliente}.${format === 'pdf' ? 'pdf' : 'xlsx'}`,
        format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      setDirectoryMessage({
        type: saved ? 'success' : 'info',
        text: saved ? `Archivo guardado en el dispositivo: ${saved.name}` : 'Selecciona una carpeta para guardar el archivo.',
      });
    } catch (error) {
      setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo guardar el archivo del estado de cuenta.' });
    }
  };
  const sendRetencionCorreo = async (retencion: RetencionListItem) => {
    if (!catalogUserId) return;
    try {
      await enviarRetencionCorreo(catalogUserId, retencion.codRetencion);
      setDirectoryMessage({ type: 'success', text: 'Correo de retencion enviado correctamente.' });
    } catch (error) {
      setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo enviar el correo de la retencion.' });
    }
  };
  const emitRetencionSri = async (retencion: RetencionListItem) => {
    if (!catalogUserId) return;
    const prerequisitesError = await validateEmissionPrerequisites();
    if (prerequisitesError) {
      setDirectoryMessage({ type: 'error', text: prerequisitesError });
      return;
    }
    if (pendingRetencionEmitRef.current === retencion.codRetencion) {
      Alert.alert(
        'Emisión no confirmada',
        'La solicitud anterior tardó demasiado. Revisa el historial antes de volver a enviarla.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Actualizar historial', onPress: () => setReloadKey((value) => value + 1) },
          { text: 'Emitir otra vez', style: 'destructive', onPress: () => { pendingRetencionEmitRef.current = null; void emitRetencionSri(retencion); } },
        ],
      );
      return;
    }
    pendingRetencionEmitRef.current = retencion.codRetencion;
    try {
      const result = await emitirRetencionSri(catalogUserId, retencion.codRetencion);
      const estado = normalizeSriState(result.estado);
      pendingRetencionEmitRef.current = null;
      setDirectoryMessage({ type: getSriMessageType(estado), text: result.mensaje?.trim() || getSriEmissionMessage('Retención', estado) });
      setReloadKey((value) => value + 1);
      if (estado === 'AUTORIZADO') {
        showAuthorizationAlert('Retencion', 'retenciones', 'Mis Retenciones');
      }
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 0)) pendingRetencionEmitRef.current = null;
      setDirectoryMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'No se pudo emitir la retencion.' });
    }
  };
  const isERubricaWorkspace = activeView === 'e-rubrica' || activeView === 'perfil-e-rubrica';
  const renovacionFirma = erubricaData?.renovacion as { esValida?: boolean; EsValida?: boolean; estado?: string; Estado?: string; diasRestantes?: number | null; DiasRestantes?: number | null; fechaExpiracion?: string | null; FechaExpiracion?: string | null; mensaje?: string; Mensaje?: string } | null | undefined;
  const estadoFirmaERubrica = renovacionFirma?.estado ?? renovacionFirma?.Estado;
  const diasFirmaERubrica = renovacionFirma?.diasRestantes ?? renovacionFirma?.DiasRestantes;
  const fechaFirmaERubrica = renovacionFirma?.fechaExpiracion ?? renovacionFirma?.FechaExpiracion;
  const vigenciaFirmaERubrica = diasFirmaERubrica !== undefined && diasFirmaERubrica !== null
    ? `${diasFirmaERubrica} días restantes${fechaFirmaERubrica ? ` · Vence: ${formatDocumentDate(fechaFirmaERubrica)}` : ''}`
    : null;
  const firmaResumenVisible = isERubricaWorkspace
    ? {
        active: Boolean(renovacionFirma?.esValida ?? renovacionFirma?.EsValida),
        label: renovacionFirma ? (renovacionFirma.esValida ?? renovacionFirma.EsValida) ? estadoFirmaERubrica || 'Vigente' : estadoFirmaERubrica || 'Requiere revisión' : 'Sin firma configurada',
        caption: vigenciaFirmaERubrica ?? renovacionFirma?.mensaje ?? renovacionFirma?.Mensaje ?? 'Configura tu certificado .p12 y su clave.',
        tone: ((renovacionFirma?.esValida ?? renovacionFirma?.EsValida) ? 'success' : renovacionFirma ? 'warning' : 'danger') as 'success' | 'warning' | 'danger',
      }
    : firmaSummary;
  const drawerMenu: DrawerMenuNode[] = isERubricaWorkspace ? [
    {
      key: 'erubrica-documentos',
      label: 'Documentos Electrónicos',
      icon: 'file-document-multiple',
      children: [
        { key: 'erubrica-firmar-pdf', label: 'Firmar PDF', icon: 'file-sign', activeWhen: erubricaTabRequest === 'firmar', action: () => openERubricaTab('firmar') },
        { key: 'erubrica-historial-documentos', label: 'Historial Documentos Firmados', icon: 'file-clock-outline', activeWhen: erubricaTabRequest === 'historial-documentos', action: () => openERubricaTab('historial-documentos') },
        { key: 'erubrica-validar-firma', label: 'Validar Firma', icon: 'file-check-outline', activeWhen: erubricaTabRequest === 'validar-firma', action: () => openERubricaTab('validar-firma') },
        { key: 'erubrica-documentos-por-firmar', label: 'Documentos por Firmar', icon: 'file-document-edit-outline', activeWhen: erubricaTabRequest === 'documentos-por-firmar', action: () => openERubricaTab('documentos-por-firmar') },
      ],
    },
    {
      key: 'erubrica-firma-electronica',
      label: 'Firma Electrónica',
      icon: 'draw-pen',
      children: [
        { key: 'erubrica-nueva-solicitud', label: 'Nueva Solicitud', icon: 'file-plus-outline', activeWhen: erubricaTabRequest === 'nueva-solicitud', action: () => openERubricaTab('nueva-solicitud') },
        { key: 'erubrica-historial-solicitudes', label: 'Historial de solicitudes', icon: 'history', activeWhen: erubricaTabRequest === 'historial-solicitudes', action: () => openERubricaTab('historial-solicitudes') },
      ],
    },
    {
      key: 'erubrica-configuracion',
      label: 'Configuracion',
      icon: 'cog-outline',
      children: [
        { key: 'erubrica-perfil', label: 'Perfil', view: 'perfil-e-rubrica', icon: 'account-cog-outline', disabled: !canUseERubrica },
        { key: 'erubrica-plan', label: 'Plan disponible', icon: 'card-text-outline', activeWhen: erubricaTabRequest === 'plan-disponible', action: () => openERubricaTab('plan-disponible') },
        { key: 'erubrica-firma-config', label: 'Firma', icon: 'file-certificate-outline', activeWhen: erubricaTabRequest === 'firma-config', action: () => openERubricaTab('firma-config') },
      ],
    },
  ] : efactDrawerMenu;
  const isDrawerNodeActive = (node: DrawerMenuNode): boolean => Boolean(
    node.activeWhen || node.view === activeView || node.children?.some(isDrawerNodeActive),
  );
  const renderDrawerNode = (node: DrawerMenuNode, inset = false) => {
    const active = isDrawerNodeActive(node);
    const enabledChildren = node.children?.filter((child) => !child.disabled) ?? [];
    const disabled = node.disabled && enabledChildren.length === 0;
    const hasChildren = Boolean(node.children?.length);
    const expanded = hasChildren && (expandedMenus.has(node.key) || (!isERubricaWorkspace && active));

    return (
      <View key={node.key} style={node.children?.length ? styles.menuSection : undefined}>
        <MenuItem
          accentColor={isERubricaWorkspace ? ERUBRICA_COLORS.primary : undefined}
          active={active}
          disabled={disabled}
          expanded={expanded}
          hasChildren={hasChildren}
          icon={node.icon}
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
    <SafeAreaView edges={['top', 'bottom']} style={[styles.workspaceSafeArea, activeView === 'portal' && styles.portalSafeArea, isERubricaWorkspace && styles.erubricaSafeArea]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <View style={styles.workspaceChrome}>
        <GlobalWorkspaceHeader
          title={activeView === 'e-rubrica' ? getERubricaTabTitle(erubricaTabRequest ?? 'inicio') : getWorkspaceTitle(activeView)}
          subtitle={activeView === 'firma' ? 'Gestiona tu firma y certificados' : activeView === 'portal' ? 'Selecciona tu servicio' : activeView === 'e-rubrica' ? 'E-Rúbrica' : activeView === 'perfil-e-rubrica' ? 'Mi cuenta de firma electronica' : ''}
          unreadNotifications={unreadNotifications}
          documentPlan={documentPlan}
          firmaSummary={firmaResumenVisible}
          portalMode={activeView === 'portal'}
          erubricaMode={isERubricaWorkspace}
          onSearch={() => { setGlobalSearchQuery(''); setGlobalSearchOpen(true); }}
          onNotifications={() => setNotificationsOpen(true)}
          onMenu={() => setMenuOpen(true)}
          onDocuments={() => openView('comprar-documentos')}
          onFirma={() => isERubricaWorkspace ? openERubricaTab('nueva-solicitud') : openView('firma')}
          onLogout={onLogout}
        />

        <View style={styles.workspaceBodyFrame}>
        <ScrollView
          style={styles.workspaceBodyScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.workspaceCanvasWithBottomNav, activeView === 'dashboard' && styles.efactHomeWorkspaceCanvas, { paddingBottom: activeView === 'portal' ? 20 + insets.bottom : 88 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          nestedScrollEnabled
          automaticallyAdjustKeyboardInsets={activeView !== 'bot'}
          horizontal={false}
          bounces={false}
          alwaysBounceHorizontal={false}
          directionalLockEnabled
          overScrollMode="never"
          refreshControl={<RefreshControl refreshing={loadingMenus} onRefresh={() => setReloadKey((value) => value + 1)} tintColor={isERubricaWorkspace ? ERUBRICA_COLORS.primary : EFACT_THEME.colors.primary} colors={[isERubricaWorkspace ? ERUBRICA_COLORS.primary : EFACT_THEME.colors.primary]} />}
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
            <View style={styles.portalServicesPanel}>
              <View style={styles.portalWebHero}>
                <View style={styles.portalWebHeroShapeTop} />
                <View style={styles.portalWebHeroShapeBottom} />
                <View style={styles.portalWebTitleRow}>
                  <View style={styles.portalWebLogoShell}>
                    <Image source={{ uri: resolveImageUrl(portalAvatarUrl) }} style={styles.portalWebLogo} />
                  </View>
                  <View style={styles.portalWebTitleCopy}>
                    <Text style={styles.portalWelcomeEyebrow}>Numerica Software</Text>
                    <Text style={styles.portalWebTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.76}>Bienvenida, {portalFirstName}</Text>
                    <Text style={styles.portalWebSubtitle}>Tus servicios activos estan listos para usarse</Text>
                  </View>
                </View>
              </View>

              <View style={styles.portalServicesHeader}>
                <Text style={styles.portalServicesTitle}>Mis servicios</Text>
                <View style={styles.portalSearchPill}>
                  <MaterialCommunityIcons name="magnify" size={19} color="#61738A" />
                  <TextInput
                    style={styles.portalSearchInput}
                    value={portalServiceQuery}
                    onChangeText={setPortalServiceQuery}
                    placeholder="Buscar servicio..."
                    placeholderTextColor="#63758B"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                </View>
              </View>

              <View style={styles.portalServiceGrid}>
                {filteredPortalServiceCards.map((service, index) => (
                  <PortalServiceCard
                    key={service.title}
                    title={service.title}
                    description={service.description}
                    enabled={service.enabled}
                    onPress={service.onPress}
                    index={index}
                  />
                ))}
              </View>
              {filteredPortalServiceCards.length === 0 ? <Text style={styles.portalEmptySearchText}>No encontramos servicios con ese nombre.</Text> : null}
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
            facturas={facturasList}
            clientesCount={clientes.length}
            productosCount={productos.length}
            modules={modules}
            onOpenView={(view) => openView(view as WorkspaceView)}
            onOpenVoice={() => botVoiceControlsRef.current?.startHandsFree()}
          />
        ) : null}

        {!loadingMenus && activeView === 'e-rubrica' ? (
          <ERubricaMobileScreen
            data={erubricaData}
            initialPdf={erubricaInitialPdf}
            requestedTab={erubricaTabRequest}
            loading={loadingErubrica}
            message={directoryMessage}
            onTabChange={setErubricaTabRequest}
            onRefresh={() => setReloadKey((value) => value + 1)}
            onPreviewPdf={(file) => setPdfPreview({ uri: file.uri, name: file.name || 'Documento PDF' })}
            onPreviewRemotePdf={(urlOrPath, fileName) => openPdfPreview(async () => urlOrPath, fileName)}
            onDownloadRemotePdf={(urlOrPath, fileName) => downloadPdf(async () => urlOrPath, fileName)}
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
                   userId={userId}
                   voiceControlsRef={botVoiceControlsRef}
                   onNavigate={handleBotNavigate}
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
                     <Pressable style={styles.clientFilterResetButton} onPress={() => { setClienteTipoFiltro('todos'); setClienteProveedorFiltro('todos'); setClienteEstadoFiltro('activos'); setSearch(''); }}>
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
                     <View style={styles.clientFilterLine}>
                       <Text style={styles.clientFilterLabel}>Estado</Text>
                       <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clientFilterRow}>
                        {([['activos', 'Activos'], ['inactivos', 'Inactivos'], ['todos', 'Todos']] as const).map(([value, label]) => (
                          <Pressable key={value} style={[styles.clientFilterChip, clienteEstadoFiltro === value && styles.clientFilterChipActive]} onPress={() => setClienteEstadoFiltro(value)}>
                            <Text style={[styles.clientFilterChipText, clienteEstadoFiltro === value && styles.clientFilterChipTextActive]}>{label}</Text>
                          </Pressable>
                        ))}
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
                    resetKey={`${search}-${clienteTipoFiltro}-${clienteProveedorFiltro}-${clienteEstadoFiltro}`}
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
                        setProductoEstadoFiltro('activos');
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
                    <View style={styles.clientFilterLine}>
                      <Text style={styles.clientFilterLabel}>Estado</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clientFilterRow}>
                        {([['activos', 'Activos'], ['inactivos', 'Inactivos'], ['todos', 'Todos']] as const).map(([value, label]) => (
                          <Pressable key={value} style={[styles.clientFilterChip, productoEstadoFiltro === value && styles.clientFilterChipActive]} onPress={() => setProductoEstadoFiltro(value)}>
                            <Text style={[styles.clientFilterChipText, productoEstadoFiltro === value && styles.clientFilterChipTextActive]}>{label}</Text>
                          </Pressable>
                        ))}
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
                    resetKey={`${productoTipoFiltro}-${productoCategoriaFiltro ?? 'todas'}-${productoSubcategoriaFiltro ?? 'todas'}-${productoEstadoFiltro}`}
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

            {activeView === 'nueva-categoria' ? (
              <CategoriaForm
                form={categoriaForm}
                mode={categoriaFormMode ?? 'create'}
                saving={savingCategoria}
                onCancel={closeCategoriaForm}
                onChange={updateCategoriaForm}
                onReset={() => setCategoriaForm(initialCategoriaForm)}
                onSave={saveCategoria}
              />
            ) : null}

            {activeView === 'nueva-subcategoria' ? (
              <SubcategoriaForm
                form={subcategoriaForm}
                mode={subcategoriaFormMode ?? 'create'}
                saving={savingCategoria}
                categorias={categorias}
                onCancel={closeSubcategoriaForm}
                onChange={updateSubcategoriaForm}
                onReset={() => setSubcategoriaForm(initialSubcategoriaForm)}
                onSave={saveSubcategoria}
              />
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
                  {categoriaTab === 'subcategorias' ? (
                    <View style={styles.clientFilterLine}>
                      <Text style={styles.clientFilterLabel}>Categoria</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clientFilterRow}>
                        <Pressable style={[styles.clientFilterChip, subcategoriaCategoriaFiltro === null && styles.clientFilterChipActive]} onPress={() => setSubcategoriaCategoriaFiltro(null)}>
                          <Text style={[styles.clientFilterChipText, subcategoriaCategoriaFiltro === null && styles.clientFilterChipTextActive]}>Todas</Text>
                        </Pressable>
                        {categorias.map((categoria) => {
                          const active = subcategoriaCategoriaFiltro === categoria.idCategoria;
                          return (
                            <Pressable key={`subcategoria-filtro-${categoria.idCategoria}`} style={[styles.clientFilterChip, active && styles.clientFilterChipActive]} onPress={() => setSubcategoriaCategoriaFiltro(categoria.idCategoria)}>
                              <Text style={[styles.clientFilterChipText, active && styles.clientFilterChipTextActive]} numberOfLines={1}>{categoria.descripcion}</Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>
                  ) : null}
                  <SearchField
                    label={categoriaTab === 'categorias' ? 'Buscar categorias' : 'Buscar subcategorias'}
                    placeholder="Escribe una descripcion"
                    value={search}
                    onChangeText={setSearch}
                    resultCount={categoriaTab === 'categorias' ? filteredCategorias.length : filteredSubcategorias.length}
                    totalCount={categoriaTab === 'categorias' ? categorias.length : subcategorias.length}
                  />
                </View>
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

            {activeView === 'nuevo-emisor' ? (
              <EmisorForm
                form={emisorForm}
                mode={emisorFormMode ?? 'create'}
                saving={savingEmisor}
                onCancel={closeEmisorForm}
                onChange={updateEmisorForm}
                onReset={() => setEmisorForm(selectedEmisor ? emisorToForm(selectedEmisor) : initialEmisorForm)}
                onSelectLogo={selectEmisorLogo}
                onConsultarSri={consultarSriEmisor}
                consultandoSri={consultandoSriEmisor}
                onSave={saveEmisor}
              />
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
                {emisorFormMode ? (
                  <EmisorForm
                    form={emisorForm}
                    mode={emisorFormMode}
                    saving={savingEmisor}
                    onCancel={closeEmisorForm}
                    onChange={updateEmisorForm}
                    onReset={() => setEmisorForm(selectedEmisor ? emisorToForm(selectedEmisor) : initialEmisorForm)}
                    onSelectLogo={selectEmisorLogo}
                    onConsultarSri={consultarSriEmisor}
                    consultandoSri={consultandoSriEmisor}
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
                {!loadingEmisores && emisores.length === 0 ? (
                  <EmptyState title="Sin emisores para mostrar" text="Cuando existan registros, apareceran aqui." />
                ) : null}
                <View style={styles.clientListPanel}>
                  <View style={styles.clientListHeader}>
                    <View>
                      <Text style={styles.clientListEyebrow}>Listado</Text>
                      <Text style={styles.clientListTitle}>Emisores</Text>
                    </View>
                    <Text style={styles.clientListCount}>{emisores.length}</Text>
                  </View>
                  <ResultCollection
                    items={emisores}
                    variant="plain"
                    resetKey={`emisor-${reloadKey}`}
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

            {activeView === 'nueva-firma' && selectedEmisor ? (
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

            {activeView === 'firma' ? (
              <>
                <DirectoryHero
                  eyebrow="SEGURIDAD TRIBUTARIA"
                  title="Firma electronica"
                  subtitle="Certificados, vigencia y clave para comprobantes"
                  icon="file-certificate-outline"
                  metrics={[
                    { value: emisores.length, label: 'Emisores' },
                    { value: emisores.filter(hasFirmaConfigured).length, label: 'Firmas' },
                    { value: Object.values(firmaEstados).filter((estado) => estado.esValida).length, label: 'Vigentes' },
                  ]}
                  onCreate={!hasConfiguredFirma ? openAddFirma : undefined}
                  createLabel="Agregar firma"
                />
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
                {!loadingEmisores && emisores.length === 0 ? (
                  <EmptyState title="Sin emisores para firma" text="Primero registra los datos del emisor." />
                ) : null}
                <View style={styles.clientListPanel}>
                  <View style={styles.clientListHeader}>
                    <View>
                      <Text style={styles.clientListEyebrow}>Listado</Text>
                      <Text style={styles.clientListTitle}>Firmas</Text>
                    </View>
                    <Text style={styles.clientListCount}>{emisores.length}</Text>
                  </View>
                  <ResultCollection
                    items={emisores}
                    variant="plain"
                    resetKey={`firma-${reloadKey}`}
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

            {(activeView === 'perfil' || activeView === 'perfil-e-rubrica') ? (
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
                    service={activeView === 'perfil-e-rubrica' ? 'erubrica' : 'efact'}
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

            {(activeView === 'punto-emision' || activeView === 'nuevo-punto-emision') ? (
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
                    tipoIdentificacion: getTipoIdentificacionLabel(cliente.tipoidentificacion),
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
                onHistory={() => openView('mis-facturas')}
                onSave={saveNuevaFactura}
              />
            ) : null}

            {activeView === 'mis-facturas' ? (
              <MisFacturasMobileScreen
                facturas={facturasList}
                notasCredito={notasCreditoList}
                 loading={loadingFacturas}
                 message={directoryMessage}
                 onRefresh={() => setReloadKey((value) => value + 1)}
                 onDetail={(factura) => catalogUserId ? getFacturaDetalle(catalogUserId, factura.codfactura) : Promise.reject(new Error('missing-user'))}
                 onPdf={(factura, descargar = false) => catalogUserId && (descargar
                   ? openOrDownloadPdf(() => getFacturaPdf(catalogUserId, factura.codfactura, 'A4'), `${factura.numeroCompleto ?? 'factura'}.pdf`, true)
                   : openPdfInDeviceViewer(() => getFacturaPdf(catalogUserId, factura.codfactura, 'A4'), `${factura.numeroCompleto ?? 'factura'}.pdf`))}
                 onSharePdf={(factura) => catalogUserId && sharePdf(() => getFacturaPdf(catalogUserId, factura.codfactura, 'A4'), `${factura.numeroCompleto ?? 'factura'}.pdf`)}
                 onXml={(factura) => catalogUserId && openFacturaAsset(() => getFacturaXml(catalogUserId, factura.codfactura))}
                onEmail={sendFacturaCorreo}
                onRetrySri={retryFacturaSri}
                onAnular={confirmAnularFactura}
                onCuentasCobrar={openFacturaCuentasCobrar}
                 onNotaCredito={emitirNotaCreditoAutomaticaDesdeFactura}
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
                clientes={notaCreditoClientes}
                lineas={notaCreditoLineas}
                loading={loadingNotasCredito}
                saving={savingNotaCredito}
                message={directoryMessage}
                onChange={updateNotaCreditoForm}
                onSearchClientes={searchNotaCreditoClientes}
                onSelectCliente={fillNotaCreditoCliente}
                onSearchFacturas={searchNotaCreditoFacturas}
                onSelectFactura={selectNotaCreditoFactura}
                onImportXml={importNotaCreditoXml}
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
                 onPdf={(nota, descargar = false) => catalogUserId && (descargar ? openOrDownloadPdf(() => getNotaCreditoPdf(catalogUserId, nota.codNotaCredito, 'A4'), 'nota-credito.pdf', true) : openPdfInDeviceViewer(() => getNotaCreditoPdf(catalogUserId, nota.codNotaCredito, 'A4'), 'nota-credito.pdf'))}
                 onSharePdf={(nota) => catalogUserId && sharePdf(() => getNotaCreditoPdf(catalogUserId, nota.codNotaCredito, 'A4'), 'nota-credito.pdf')}
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
                onImportXml={importNotaDebitoXml}
                onUpdateLinea={updateNotaDebitoLinea}
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
                 onPdf={(nota, descargar = false) => catalogUserId && (descargar ? openOrDownloadPdf(() => getNotaDebitoPdf(catalogUserId, nota.codNotaDebito, 'A4'), 'nota-debito.pdf', true) : openPdfInDeviceViewer(() => getNotaDebitoPdf(catalogUserId, nota.codNotaDebito, 'A4'), 'nota-debito.pdf'))}
                 onSharePdf={(nota) => catalogUserId && sharePdf(() => getNotaDebitoPdf(catalogUserId, nota.codNotaDebito, 'A4'), 'nota-debito.pdf')}
                 onXml={(nota) => catalogUserId && openFacturaAsset(() => getNotaDebitoXml(catalogUserId, nota.codNotaDebito))}
                 onExportCsv={exportRowsToCsv}
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
                retencionLiquidacion={liquidacionRetencion}
                retencionesIva={retencionesIvaCatalogo}
                retencionesRenta={retencionesRentaCatalogo}
                loadingRetencion={loadingLiquidacionRetencion}
                savingRetencion={savingLiquidacionRetencion}
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
                onSaveRetencion={saveRetencionLiquidacion}
                onCloseRetencion={() => setLiquidacionRetencion(null)}
              />
            ) : null}

            {activeView === 'mis-liquidaciones-compra' ? (
              <MisLiquidacionesCompraMobileScreen
                liquidaciones={liquidacionesList}
                loading={loadingLiquidaciones}
                message={directoryMessage}
                 onRefresh={() => setReloadKey((value) => value + 1)}
                 onPdf={(liquidacion, descargar = false) => catalogUserId && (descargar ? openOrDownloadPdf(() => getLiquidacionCompraPdf(catalogUserId, liquidacion.codLiquidacion, 'A4'), 'liquidacion-compra.pdf', true) : openPdfInDeviceViewer(() => getLiquidacionCompraPdf(catalogUserId, liquidacion.codLiquidacion, 'A4'), 'liquidacion-compra.pdf'))}
                 onSharePdf={(liquidacion) => catalogUserId && sharePdf(() => getLiquidacionCompraPdf(catalogUserId, liquidacion.codLiquidacion, 'A4'), 'liquidacion-compra.pdf')}
                 onXml={(liquidacion) => catalogUserId && openFacturaAsset(() => getLiquidacionCompraXml(catalogUserId, liquidacion.codLiquidacion))}
                 onEmail={sendLiquidacionCorreo}
                 onEmitir={emitLiquidacionSri}
                 onRetenciones={() => setActiveView('retenciones')}
                 onContinuarRetencion={continuarRetencionLiquidacion}
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
                loadingSearch={loadingGuiaSearch}
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
                 onPdf={(guia, descargar = false) => catalogUserId && (descargar ? openOrDownloadPdf(() => getGuiaRemisionPdf(catalogUserId, guia.codGuia, 'A4'), 'guia-remision.pdf', true) : openPdfInDeviceViewer(() => getGuiaRemisionPdf(catalogUserId, guia.codGuia, 'A4'), 'guia-remision.pdf'))}
                 onSharePdf={(guia) => catalogUserId && sharePdf(() => getGuiaRemisionPdf(catalogUserId, guia.codGuia, 'A4'), 'guia-remision.pdf')}
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
                 onPdf={(retencion, descargar = false) => catalogUserId && (descargar ? openOrDownloadPdf(() => retencion.pdfUrl ? Promise.resolve({ url: retencion.pdfUrl }) : getRetencionPdf(catalogUserId, retencion.codRetencion, 'A4'), 'retencion.pdf', true) : openPdfInDeviceViewer(() => retencion.pdfUrl ? Promise.resolve({ url: retencion.pdfUrl }) : getRetencionPdf(catalogUserId, retencion.codRetencion, 'A4'), 'retencion.pdf'))}
                 onSharePdf={(retencion) => sharePdf(() => retencion.pdfUrl ? Promise.resolve({ url: retencion.pdfUrl }) : catalogUserId ? getRetencionPdf(catalogUserId, retencion.codRetencion, 'A4') : Promise.reject(new Error('missing-user')), 'retencion.pdf')}
                 onXml={(retencion) => retencion.xmlUrl ? openKnownDocumentAsset(retencion.xmlUrl) : catalogUserId && openFacturaAsset(() => getRetencionXml(catalogUserId, retencion.codRetencion))}
                onEmail={sendRetencionCorreo}
                onEmitir={emitRetencionSri}
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
                onView={showAdminItemDetail}
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
                onDownloadStatementFile={downloadEstadoCuentaFile}
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
      {activeView !== 'bot' && canUseEfact && !isERubricaWorkspace ? (
        <EfactBotScreen
          voiceOnly
          userName={portalFirstName}
          userId={userId}
          voiceControlsRef={botVoiceControlsRef}
          onNavigate={handleBotNavigate}
          messages={botMessages}
          setMessages={setBotMessages}
          draft={botDraft}
          setDraft={setBotDraft}
          feedbackByMessage={botFeedbackByMessage}
          setFeedbackByMessage={setBotFeedbackByMessage}
        />
      ) : null}
      {activeView !== 'portal' ? (
        <PortalBottomNav
          bottomInset={insets.bottom}
           activeView={activeView === 'e-rubrica' ? `e-rubrica-${erubricaTabRequest ?? 'inicio'}` : activeView}
           mode={isERubricaWorkspace ? 'erubrica' : 'efact'}
           onServices={() => canUsePortal ? openView('portal') : setMenuOpen(true)}
          onHome={() => isERubricaWorkspace ? openView('e-rubrica') : openView('dashboard')}
          onNew={() => openView('nueva-factura')}
          onFirma={() => isERubricaWorkspace ? setMenuOpen(true) : openView('firma')}
          onProfile={() => isERubricaWorkspace ? openView('perfil-e-rubrica') : openView('perfil')}
          onMenu={() => setMenuOpen(true)}
          onSolicitudes={() => openERubricaTab('nueva-solicitud')}
          onFirmar={() => openERubricaTab('firmar')}
          onValidar={() => openERubricaTab('validar')}
        />
      ) : null}
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
            <View style={[styles.menuHeader, isERubricaWorkspace && styles.erubricaMenuHeader]}>
              <View>
                <Text style={styles.menuTitle}>Menu</Text>
                <Text style={[styles.menuSubtitle, isERubricaWorkspace && styles.erubricaMenuSubtitle]}>{isERubricaWorkspace ? 'E-Rubrica' : 'Numérica Software'}</Text>
              </View>
              <Pressable accessibilityLabel="Cerrar menu" accessibilityRole="button" hitSlop={6} style={[styles.menuCloseButton, isERubricaWorkspace && styles.erubricaMenuCloseButton]} onPress={() => setMenuOpen(false)}>
                <Text style={styles.menuCloseText}>×</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.menuList} showsVerticalScrollIndicator={false}>
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
              <SecondaryButton label="Compartir PDF" onPress={async () => {
                if (!pdfPreview || !(await Sharing.isAvailableAsync())) return;
                await Sharing.shareAsync(pdfPreview.uri, { mimeType: 'application/pdf', dialogTitle: 'Compartir PDF' });
              }} />
              <PrimaryButton label="Abrir con otra app" loading={false} onPress={openPdfWithExternalViewer} />
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
    'perfil-e-rubrica': 'Mi perfil',
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
    'nueva-categoria': 'Categorias',
    'nueva-subcategoria': 'Categorias',
    'nuevo-emisor': 'Emisor',
    'nueva-firma': 'Firma electronica',
    'nuevo-punto-emision': 'Punto de emision',
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

function percentageValue(value: unknown) {
  const parsed = numberValue(value);
  return parsed > 0 && parsed <= 1 ? parsed * 100 : parsed;
}

function getProductoPrice(producto: Producto) {
  return [producto.precioBase, ...(producto.precios ?? [])]
    .map((value) => numberValue(value))
    .find((value) => value > 0) ?? 0;
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
  const facturaClienteRow = isPlainRecord(pickRecordValue(facturaRow, ['cliente', 'Cliente']))
    ? pickRecordValue(facturaRow, ['cliente', 'Cliente']) as Record<string, unknown>
    : null;
  const valueFromClienteOrFactura = (keys: string[]) => pickRecordValue(clienteRow, keys) ?? pickRecordValue(facturaClienteRow, keys) ?? pickRecordValue(facturaRow, keys);
  return {
    ...(cliente ?? {}),
    codcliente: numberValue(cliente?.codcliente ?? valueFromClienteOrFactura(['codcliente', 'Codcliente', 'CodCliente', 'codclientes', 'Codclientes', 'codClientes', 'CodClientes'])),
    nombrerazonsocial: (cliente?.nombrerazonsocial ?? textValue(valueFromClienteOrFactura(['nombrerazonsocial', 'NombreRazonSocial', 'razonSocial', 'RazonSocial', 'nombreCliente', 'NombreCliente']) ?? factura.cliente)) || null,
    numeroidentificacion: (cliente?.numeroidentificacion ?? textValue(valueFromClienteOrFactura(['numeroidentificacion', 'NumeroIdentificacion', 'ruc', 'Ruc', 'identificacionCliente', 'IdentificacionCliente']) ?? factura.identificacionCliente)) || null,
    tipoidentificacion: getTipoIdentificacionLabel(cliente?.tipoidentificacion ?? textValue(valueFromClienteOrFactura(['tipoidentificacion', 'Tipoidentificacion', 'tipoIdentificacion', 'TipoIdentificacion']))) || null,
    direccion: (cliente?.direccion ?? textValue(valueFromClienteOrFactura(['direccion', 'Direccion', 'direccionCliente', 'DireccionCliente']))) || null,
    celular: (cliente?.celular ?? textValue(valueFromClienteOrFactura(['celular', 'Celular', 'telefono', 'Telefono']))) || null,
    telefonoconvencional: (cliente?.telefonoconvencional ?? textValue(valueFromClienteOrFactura(['telefonoconvencional', 'TelefonoConvencional']))) || null,
    correo: (cliente?.correo ?? textValue(valueFromClienteOrFactura(['correo', 'Correo', 'email', 'Email']))) || null,
    tipoCliente: normalizeTipoCliente(cliente?.tipoCliente ?? valueFromClienteOrFactura(['tipoCliente', 'TipoCliente', 'tipoClienteCodigo', 'TipoClienteCodigo', 'tclCodigo', 'TclCodigo', 'tipoClienteDescripcion', 'TipoClienteDescripcion'])),
    oblgconta: normalizeObligadoContabilidad(cliente?.oblgconta ?? valueFromClienteOrFactura(['oblgconta', 'Oblgconta', 'obligadoContabilidad', 'ObligadoContabilidad', 'obligado', 'Obligado'])),
  };
}

function normalizeObligadoContabilidad(value: unknown) {
  if (typeof value === 'boolean') return value ? 'SI' : 'NO';
  const normalized = normalizeText(textValue(value));
  if (['si', 's', 'true', '1', 'obligado'].includes(normalized)) return 'SI';
  if (['no', 'n', 'false', '0', 'no-obligado'].includes(normalized)) return 'NO';
  return textValue(value);
}

function normalizeTipoCliente(value: unknown) {
  const numeric = numberValue(value);
  if (numeric > 0) return numeric;
  const normalized = normalizeText(textValue(value));
  if (normalized.includes('juridica') || normalized.includes('empresa')) return 2;
  if (normalized.includes('natural') || normalized.includes('persona')) return 1;
  return null;
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
  const productoRow = isPlainRecord(row.producto) ? row.producto : row;
  const precioRaw = pickRecordValue(row, ['precio', 'Precio', 'preciounitario', 'Preciounitario', 'precioUnitario', 'PrecioUnitario', 'precioVenta', 'PrecioVenta', 'valorUnitario', 'ValorUnitario']) ?? pickRecordValue(productoRow, ['precioUnitario', 'PrecioUnitario', 'precioVenta', 'PrecioVenta', 'precio', 'Precio']);
  const tarifaRaw = pickRecordValue(row, ['tarifa', 'Tarifa', 'iva', 'Iva', 'tarifaIva', 'TarifaIva', 'porcentajeIva', 'PorcentajeIva']) ?? pickRecordValue(productoRow, ['tarifaIva', 'TarifaIva', 'tarifa', 'Tarifa', 'iva', 'Iva']);
  return {
    producto: {
      codproducto: numberValue(pickRecordValue(productoRow, ['codproducto', 'Codproducto', 'codProducto', 'CodProducto'])),
      codprincipal: textValue(pickRecordValue(productoRow, ['codprincipal', 'Codprincipal', 'codPrincipal', 'CodPrincipal', 'codigoPrincipal', 'CodigoPrincipal'])) || null,
      codauxiliar: textValue(pickRecordValue(productoRow, ['codauxiliar', 'Codauxiliar', 'codAuxiliar', 'CodAuxiliar', 'codigoAuxiliar', 'CodigoAuxiliar'])) || null,
      descripcion: textValue(pickRecordValue(productoRow, ['descripproducto', 'Descripproducto', 'descripcion', 'Descripcion', 'nombre', 'Nombre'])) || null,
      precioUnitario: numberValue(precioRaw),
      tarifaIva: percentageValue(tarifaRaw),
    },
    cantidad: String(numberValue(pickRecordValue(row, ['cantproducto', 'Cantproducto', 'cantidad', 'Cantidad'])) || numberValue(pickRecordValue(productoRow, ['cantidad', 'Cantidad'])) || 1),
  };

}

function detalleFacturaToNotaCreditoLinea(row: Record<string, unknown>): NuevaFacturaLinea {
  const productoRow = isPlainRecord(row.producto) ? row.producto : row;
  const precioRaw = pickRecordValue(row, ['precio', 'Precio', 'preciounitario', 'Preciounitario', 'precioUnitario', 'PrecioUnitario', 'precioVenta', 'PrecioVenta']) ?? pickRecordValue(productoRow, ['precioUnitario', 'PrecioUnitario', 'precioVenta', 'PrecioVenta', 'precio', 'Precio']);
  const tarifaRaw = pickRecordValue(row, ['tarifa', 'Tarifa', 'iva', 'Iva', 'tarifaIva', 'TarifaIva']) ?? pickRecordValue(productoRow, ['tarifaIva', 'TarifaIva', 'tarifa', 'Tarifa', 'iva', 'Iva']);
  return {
    producto: {
      codproducto: numberValue(pickRecordValue(productoRow, ['codproducto', 'Codproducto', 'codProducto', 'CodProducto'])),
      codprincipal: textValue(pickRecordValue(productoRow, ['codprincipal', 'Codprincipal', 'codPrincipal', 'CodPrincipal', 'codigoPrincipal', 'CodigoPrincipal'])) || null,
      codauxiliar: textValue(pickRecordValue(productoRow, ['codauxiliar', 'Codauxiliar', 'codAuxiliar', 'CodAuxiliar', 'codigoAuxiliar', 'CodigoAuxiliar'])) || null,
      descripcion: textValue(pickRecordValue(productoRow, ['descripproducto', 'Descripproducto', 'descripcion', 'Descripcion', 'nombre', 'Nombre'])) || null,
      precioUnitario: numberValue(precioRaw),
      tarifaIva: percentageValue(tarifaRaw),
    },
    cantidad: String(numberValue(pickRecordValue(row, ['cantidadDisponible', 'CantidadDisponible', 'cantproducto', 'Cantproducto', 'cantidad', 'Cantidad'])) || 1),
    cantidadDisponible: String(numberValue(pickRecordValue(row, ['cantidadDisponible', 'CantidadDisponible', 'cantproducto', 'Cantproducto', 'cantidad', 'Cantidad'])) || 0),
    precio: String(numberValue(precioRaw)),
    descuento: String(numberValue(pickRecordValue(row, ['descuento', 'Descuento']))),
    tarifa: String(percentageValue(tarifaRaw)),
    detalle: textValue(pickRecordValue(row, ['detalle', 'Detalle', 'detalleAdicional', 'DetalleAdicional'])) || '',
  };
}

function manualClienteFromForm(form: NuevaFacturaFormState): Cliente {
  return {
    codcliente: 0,
    nombrerazonsocial: form.clienteBusqueda.trim() || 'Cliente manual',
    numeroidentificacion: form.numeroIdentificacion.trim() || null,
    tipoidentificacion: getTipoIdentificacionCode(form.tipoIdentificacion) || null,
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

function getTipoIdentificacionLabel(value?: string | number | null) {
  const normalized = String(value ?? '').trim().toLowerCase();
  const map: Record<string, string> = {
    '04': 'RUC',
    '4': 'RUC',
    '05': 'CÉDULA',
    '5': 'CÉDULA',
    '06': 'PASAPORTE',
    '6': 'PASAPORTE',
    '07': 'CONSUMIDOR FINAL',
    '7': 'CONSUMIDOR FINAL',
    '08': 'IDENTIFICACIÓN DEL EXTERIOR',
    '8': 'IDENTIFICACIÓN DEL EXTERIOR',
  };
  if (map[normalized]) return map[normalized];
  if (normalized.includes('cedula') || normalized.includes('cédula')) return 'CÉDULA';
  if (normalized.includes('ruc')) return 'RUC';
  if (normalized.includes('pasaporte')) return 'PASAPORTE';
  if (normalized.includes('consumidor')) return 'CONSUMIDOR FINAL';
  return String(value ?? '');
}

function validateClientIdentification(value: string | number | null | undefined, description: string | null | undefined, identification: string) {
  const rawValue = String(value ?? '').trim();
  const type = normalizeText(`${rawValue} ${description ?? ''}`);
  const normalizedIdentification = identification.trim();

  if (type.includes('ruc') || rawValue === '1' || rawValue === '04') {
    const validation = validateIdentificacion('RUC', normalizedIdentification);
    return validation.valid ? null : validation.message ?? 'El RUC no es válido.';
  }

  if (type.includes('cedula') || rawValue === '2' || rawValue === '05' || rawValue === '5') {
    const validation = validateIdentificacion('CEDULA', normalizedIdentification);
    return validation.valid ? null : validation.message ?? 'La cédula no es válida.';
  }

  if (type.includes('consumidor')) {
    return normalizedIdentification === '9999999999999' ? null : 'La identificación de consumidor final no es válida.';
  }

  if (type.includes('pasaporte') || type.includes('exterior') || rawValue === '3' || rawValue === '06' || rawValue === '6' || rawValue === '4' || rawValue === '08' || rawValue === '8') {
    return /^[a-z0-9]{3,20}$/i.test(normalizedIdentification) ? null : 'La identificación debe tener entre 3 y 20 caracteres alfanuméricos.';
  }

  if (!type.trim()) return 'Selecciona el tipo de identificación.';
  return normalizedIdentification ? null : 'La identificación es obligatoria.';
}

function validateDocumentClientFields(form: Pick<NuevaFacturaFormState, 'clienteBusqueda' | 'tipoIdentificacion' | 'numeroIdentificacion' | 'tipoCliente' | 'obligadoContabilidad' | 'direccion'>, cliente: Cliente) {
  const name = form.clienteBusqueda.trim() || getClienteDisplayName(cliente).trim();
  if (!name) return 'El nombre o razón social del cliente es obligatorio.';

  const identificationType = form.tipoIdentificacion.trim() || getTipoIdentificacionLabel(cliente.tipoidentificacion);
  const identification = form.numeroIdentificacion.trim() || getClienteIdentification(cliente).trim();
  const identificationError = validateClientIdentification(identificationType, undefined, identification);
  if (identificationError) return identificationError;

  if (!(Number(form.tipoCliente) || cliente.tipoCliente || 0)) return 'Selecciona el tipo de cliente.';

  const obliged = (form.obligadoContabilidad.trim() || cliente.oblgconta?.trim() || '').toUpperCase();
  if (obliged !== 'SI' && obliged !== 'NO') return 'Indica si el cliente está obligado a llevar contabilidad.';

  const address = form.direccion.trim() || cliente.direccion?.trim() || '';
  if (!address) return 'Ingresa la dirección del cliente antes de emitir.';
  if (address.length > 100) return 'La dirección del cliente no puede superar 100 caracteres.';

  return null;
}

function getTipoIdentificacionCode(value?: string | number | null) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return '';
  const map: Record<string, string> = {
    '04': '04',
    '4': '04',
    ruc: '04',
    '05': '05',
    '5': '05',
    cedula: '05',
    'cédula': '05',
    '06': '06',
    '6': '06',
    pasaporte: '06',
    '07': '07',
    '7': '07',
    'consumidor final': '07',
    '08': '08',
    '8': '08',
    'identificacion del exterior': '08',
    'identificación del exterior': '08',
  };
  return map[normalized] ?? String(value ?? '');
}

function decodeXmlValue(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}

function xmlTag(source: string, tag: string) {
  const match = source.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXmlValue(match[1]) : '';
}

function xmlSections(source: string, tag: string) {
  return Array.from(source.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))).map((match) => match[1]);
}

function numberFromXml(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseFacturaXml(xml: string) {
  const estab = xmlTag(xml, 'estab');
  const ptoEmi = xmlTag(xml, 'ptoEmi');
  const secuencial = xmlTag(xml, 'secuencial');
  const numeroCompleto = [estab, ptoEmi, secuencial].filter(Boolean).join('-');
  const razonSocial = xmlTag(xml, 'razonSocialComprador');
  const identificacion = xmlTag(xml, 'identificacionComprador');
  if (!razonSocial && !identificacion && !numeroCompleto) return null;

  const cliente: Cliente = {
    codcliente: 0,
    tipoidentificacion: getTipoIdentificacionLabel(xmlTag(xml, 'tipoIdentificacionComprador')) || null,
    numeroidentificacion: identificacion || null,
    nombrerazonsocial: razonSocial || null,
    nombrecomercial: razonSocial || null,
    direccion: xmlTag(xml, 'direccionComprador') || null,
    correo: xmlTag(xml, 'email') || xmlTag(xml, 'correo') || null,
    oblgconta: '',
  } as Cliente;
  const factura: FacturaListItem = {
    codfactura: 0,
    numfactura: secuencial || numeroCompleto || null,
    numeroCompleto: numeroCompleto || secuencial || null,
    serie: [estab, ptoEmi].filter(Boolean).join('-') || null,
    fechaEmision: xmlTag(xml, 'fechaEmision') || null,
    total: numberFromXml(xmlTag(xml, 'importeTotal') || xmlTag(xml, 'valorModificacion')),
    cliente: razonSocial || null,
    identificacionCliente: identificacion || null,
    autorizado: true,
  };
  const detalles = xmlSections(xml, 'detalle')
    .filter((section) => xmlTag(section, 'descripcion'))
    .map((section, index) => {
      const precio = numberFromXml(xmlTag(section, 'precioUnitario'));
      const tarifa = numberFromXml(xmlTag(section, 'tarifa'));
      const producto: FacturaProducto = {
        codproducto: 0,
        codprincipal: xmlTag(section, 'codigoPrincipal') || `XML-${index + 1}`,
        codauxiliar: xmlTag(section, 'codigoAuxiliar') || null,
        descripcion: xmlTag(section, 'descripcion') || 'Producto XML',
        precioUnitario: precio,
        tarifaIva: tarifa,
      };
      return {
        producto,
        cantidad: String(numberFromXml(xmlTag(section, 'cantidad')) || 1),
        precio: String(precio),
        descuento: String(numberFromXml(xmlTag(section, 'descuento'))),
        tarifa: String(tarifa),
      };
    });

  return { cliente, factura, detalles };
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
    producto.observacion ? `Observacion: ${producto.observacion}` : '',
  ].filter(Boolean);
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

function MisNotasCreditoMobileScreen({
  notas,
  loading,
  message,
  onRefresh,
  onPdf,
  onSharePdf,
  onXml,
  onEmail,
  onEmitir,
  onAnular,
}: {
  notas: NotaCreditoListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (nota: NotaCreditoListItem, descargar?: boolean) => void;
  onSharePdf: (nota: NotaCreditoListItem) => void;
  onXml: (nota: NotaCreditoListItem) => void;
  onEmail: (nota: NotaCreditoListItem) => void;
  onEmitir: (nota: NotaCreditoListItem) => void;
  onAnular: (nota: NotaCreditoListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const [selectedNota, setSelectedNota] = useState<NotaCreditoListItem | null>(null);
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
          <SecondaryButton label="Descargar Excel" accentColor={EXPORT_GREEN} onPress={() => exportRowsToCsv('notas-credito.csv', visibleNotas.map((nota) => ({
            Nota: nota.numeroNota ?? '',
            FacturaModificada: nota.facturaModificada ?? '',
            Cliente: nota.cliente ?? '',
            Identificacion: nota.identificacionCliente ?? '',
            FechaSustento: formatDocumentDate(nota.fechaSustento),
            Estado: nota.estadoSri ?? (nota.autorizado ? 'AUTORIZADO' : 'NO AUTORIZADO'),
            Total: formatMoney(nota.total),
          })))} />
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
          const statusLabel = nota.estadoSri ?? (nota.autorizado ? 'AUTORIZADO' : 'NO AUTORIZADO');
          const isAuthorized = nota.autorizado || String(nota.estadoSri ?? '').toUpperCase().includes('AUTORIZ');
          return (
            <View key={notaKey} style={styles.invoiceHistoryCard}>
              <View style={styles.invoiceHistoryCardHeader}>
                <View style={styles.invoiceHistoryIdentityRow}>
                  <View style={styles.invoiceHistoryDocIcon}>
                    <MaterialCommunityIcons name="file-undo-outline" size={21} color="#0072BD" />
                  </View>
                  <View style={styles.invoiceHistoryCardInfo}>
                    <Text style={styles.invoiceHistoryNumber} numberOfLines={1} adjustsFontSizeToFit>{nota.numeroNota ?? `Nota ${nota.codNotaCredito}`}</Text>
                    <View style={[styles.invoiceHistoryStatusPill, getInvoiceStatusStyle(statusLabel)]}>
                      <Text style={[styles.invoiceHistoryStatusText, getInvoiceStatusTextStyle(statusLabel)]}>{statusLabel}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.invoiceHistoryClientBlock}>
                  <Text style={styles.invoiceHistoryClient} numberOfLines={1}>{nota.cliente ?? 'Consumidor final'}</Text>
                  <Text style={styles.invoiceHistoryId}>{nota.identificacionCliente ?? 'Sin identificacion'}</Text>
                  <Text style={styles.invoiceHistoryId}>Factura modificada: {nota.numeroDocModificado ?? nota.facturaModificada ?? '-'}</Text>
                </View>
              </View>
              <View style={styles.invoiceHistoryDetailGrid}>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Fecha sustento</Text>
                  <Text style={styles.invoiceHistoryDetailValue}>{formatDocumentDate(nota.fechaSustento)}</Text>
                </View>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Total</Text>
                  <Text style={styles.invoiceHistoryAmount}>{formatMoney(nota.total)}</Text>
                </View>
              </View>
              <View style={styles.invoiceHistoryDetailGrid}>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Subtotal</Text>
                  <Text style={styles.invoiceHistoryDetailValue}>{formatMoney(nota.subtotal)}</Text>
                </View>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Descuentos</Text>
                  <Text style={styles.invoiceHistoryDetailValue}>{formatMoney(nota.descuentos)}</Text>
                </View>
              </View>
              <View style={styles.invoiceHistoryDetailGrid}>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>IVA</Text>
                  <Text style={styles.invoiceHistoryDetailValue}>{formatMoney(nota.iva)}</Text>
                </View>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>ICE</Text>
                  <Text style={styles.invoiceHistoryDetailValue}>{formatMoney(nota.ice)}</Text>
                </View>
              </View>
              <View style={styles.invoiceHistoryAuthorization}>
                <View style={styles.invoiceHistoryAuthorizationTextBlock}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Motivo</Text>
                  <Text style={styles.invoiceHistoryAuthorizationText} numberOfLines={2}>{nota.motivo ?? 'No disponible'}</Text>
                </View>
                <DocumentActionsMenu actions={[
                  { label: 'Detalle', icon: 'information-outline', tone: 'primary', onPress: () => setSelectedNota(nota) },
                  { label: 'Compartir PDF', icon: 'share-variant-outline', tone: 'primary', onPress: () => onSharePdf(nota) },
                  { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(nota) },
                  { label: 'Descargar PDF A4', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(nota, true) },
                  { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(nota) },
                  ...(!isAuthorized ? [{ label: 'Emitir SRI', icon: 'send-check-outline', tone: 'primary' as const, onPress: () => onEmitir(nota) }] : []),
                  { label: 'Anular', icon: 'trash-can-outline', tone: 'danger', onPress: () => onAnular(nota) },
                ]} />
              </View>
            </View>
          );
        })}
      </View>
      <ItemDetailModal
        visible={Boolean(selectedNota)}
        title={selectedNota?.numeroNota ?? 'Detalle de nota de credito'}
        values={selectedNota ? [
          `Serie: ${selectedNota.serie ?? '-'}`,
          `Factura modificada: ${selectedNota.numeroDocModificado ?? selectedNota.facturaModificada ?? '-'}`,
          `Cliente: ${selectedNota.cliente ?? 'Consumidor final'}`,
          `Identificacion: ${selectedNota.identificacionCliente ?? 'Sin identificacion'}`,
          `Fecha sustento: ${formatDocumentDate(selectedNota.fechaSustento)}`,
          `Estado SRI: ${selectedNota.estadoSri ?? (selectedNota.autorizado ? 'AUTORIZADO' : 'NO AUTORIZADO')}`,
          `Motivo: ${selectedNota.motivo ?? 'No disponible'}`,
          `Subtotal: ${formatMoney(selectedNota.subtotal)}`,
          `Descuentos: ${formatMoney(selectedNota.descuentos)}`,
          `IVA: ${formatMoney(selectedNota.iva)}`,
          `ICE: ${formatMoney(selectedNota.ice)}`,
          selectedNota.numeroAutorizacion ? `Autorización: ${selectedNota.numeroAutorizacion}` : '',
          selectedNota.fechaAutorizacion ? `Fecha autorización: ${formatDocumentDate(selectedNota.fechaAutorizacion)}` : '',
          selectedNota.claveAcceso ? `Clave de acceso: ${selectedNota.claveAcceso}` : '',
          selectedNota.mensajeSri ? `Mensaje SRI: ${selectedNota.mensajeSri}` : '',
          `Total: ${formatMoney(selectedNota.total)}`,
        ] : []}
        onClose={() => setSelectedNota(null)}
      />
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
  retencionLiquidacion,
  retencionesIva,
  retencionesRenta,
  loadingRetencion,
  savingRetencion,
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
  onSaveRetencion,
  onCloseRetencion,
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
  retencionLiquidacion: LiquidacionCompraListItem | null;
  retencionesIva: RetencionCatalogItem[];
  retencionesRenta: RetencionCatalogItem[];
  loadingRetencion: boolean;
  savingRetencion: boolean;
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
  onSaveRetencion: (retencion: LiquidacionRetencionInput) => void;
  onCloseRetencion: () => void;
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
  const ivaOptions = getIvaOptions(preparacion);
  const serieLabel = getSerieLabelFromOptions(serieOptions, effectiveSerie, getSerieLabel(preparacion, effectiveSerie, '001-002'));
  const optionLiquidacionNumber = getNextSequenceFromOptions(preparacion?.series ?? [], effectiveSerie, '') || getNextSequenceFromOptions(serieOptions, effectiveSerie, '');
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
      {retencionLiquidacion ? (
        <RetencionLiquidacionMobileScreen
          liquidacion={retencionLiquidacion}
          ivaCatalogo={retencionesIva}
          rentaCatalogo={retencionesRenta}
          loading={loadingRetencion}
          saving={savingRetencion}
          onSave={onSaveRetencion}
          onClose={onCloseRetencion}
        />
      ) : null}
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
              <View style={styles.invoiceLineFieldsGrid}>
                <View style={styles.invoiceLineField}><Field label="Cantidad" value={linea.cantidad} onChangeText={(value) => onUpdateLinea(index, 'cantidad', value)} keyboardType="decimal-pad" /></View>
                <View style={styles.invoiceLineField}><Field label="Precio" value={linea.precio} onChangeText={(value) => onUpdateLinea(index, 'precio', value)} keyboardType="decimal-pad" /></View>
              </View>
              <View style={styles.invoiceLineFieldsGrid}>
                <View style={styles.invoiceLineField}><Field label="Descuento" value={linea.descuento} onChangeText={(value) => onUpdateLinea(index, 'descuento', value)} keyboardType="decimal-pad" /></View>
                <View style={styles.invoiceLineField}>
                {ivaOptions.length > 0 ? (
                  <DropdownField label="IVA" options={ivaOptions} value={getIvaOptionValue(ivaOptions, toNumber(linea.tarifa))} onChange={(value) => onUpdateLinea(index, 'tarifa', value === null ? '0' : String(value))} allowClear />
                ) : (
                  <Field label="IVA %" value={linea.tarifa} onChangeText={(value) => onUpdateLinea(index, 'tarifa', value)} keyboardType="decimal-pad" />
                )}
                </View>
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
        <PrimaryButton label="Generar Liquidacion" loading={saving} onPress={onSave} />
        <SecondaryButton label="Volver a datos" onPress={() => setStep(1)} />
        <SecondaryButton label="Cancelar / limpiar" onPress={handleClear} />
      </View>
      </> : null}
    </>
  );
}

function RetencionLiquidacionMobileScreen({
  liquidacion,
  ivaCatalogo,
  rentaCatalogo,
  loading,
  saving,
  onSave,
  onClose,
}: {
  liquidacion: LiquidacionCompraListItem;
  ivaCatalogo: RetencionCatalogItem[];
  rentaCatalogo: RetencionCatalogItem[];
  loading: boolean;
  saving: boolean;
  onSave: (retencion: LiquidacionRetencionInput) => void;
  onClose: () => void;
}) {
  const [tipo, setTipo] = useState<'IVA' | 'RENTA'>('IVA');
  const [codigoIndex, setCodigoIndex] = useState(0);
  const [base, setBase] = useState(String(Number(liquidacion.iva ?? 0) || Number(liquidacion.base ?? 0)));
  const catalogo = tipo === 'IVA' ? ivaCatalogo : rentaCatalogo;
  const codigo = catalogo[codigoIndex - 1];
  const porcentaje = Number(codigo?.valor ?? 0);
  const baseNumerica = Number(base.replace(',', '.')) || 0;
  const valorRetenido = baseNumerica * porcentaje / 100;

  useEffect(() => {
    setCodigoIndex(catalogo.length ? 1 : 0);
  }, [tipo, catalogo.length]);

  const cambiarTipo = (value: number | null) => {
    const nuevoTipo = value === 2 ? 'RENTA' : 'IVA';
    setTipo(nuevoTipo);
    setBase(String(Number(nuevoTipo === 'IVA' ? liquidacion.iva ?? 0 : liquidacion.base ?? 0)));
  };

  const guardar = () => {
    const idRet = Number(String(codigo?.codigo ?? '').replace(/\D/g, ''));
    if (!codigo || idRet <= 0) {
      Alert.alert('Codigo requerido', 'Selecciona un codigo de retencion valido.');
      return;
    }
    if (baseNumerica <= 0 || porcentaje <= 0) {
      Alert.alert('Datos incompletos', 'La base y el porcentaje de retencion deben ser mayores que cero.');
      return;
    }
    onSave({
      tipo,
      idRet,
      codigoRetencion: codigo.codigo,
      descripcionRet: codigo.descripcion,
      base: baseNumerica,
      porcentajeRetencion: porcentaje,
      valorRetenido,
      valor: porcentaje,
    });
  };

  return (
    <View style={[styles.formSectionBox, styles.invoicePanel]}>
      <View style={styles.invoicePanelHeader}>
        <View>
          <Text style={styles.invoicePanelTitle}>Retencion de la liquidacion autorizada</Text>
          <Text style={styles.invoiceSectionHelp}>Completa la retencion asociada a esta liquidacion sin salir de esta pantalla.</Text>
        </View>
        <SecondaryButton label="Cerrar" onPress={onClose} />
      </View>
      <View style={styles.clientDetailGrid}>
        <View style={styles.clientDetailItem}><Text style={styles.clientDetailLabel}>Liquidacion</Text><Text style={styles.clientDetailValue}>{liquidacion.numero ?? liquidacion.codLiquidacion}</Text></View>
        <View style={styles.clientDetailItem}><Text style={styles.clientDetailLabel}>Proveedor</Text><Text style={styles.clientDetailValue}>{liquidacion.proveedor ?? 'Proveedor'}</Text></View>
        <View style={styles.clientDetailItem}><Text style={styles.clientDetailLabel}>Total</Text><Text style={styles.invoiceHistoryAmount}>{formatMoney(liquidacion.total)}</Text></View>
      </View>
      {loading ? (
        <View style={styles.directoryLoading}><ActivityIndicator color="#0072BD" /><Text style={styles.mutedText}>Cargando codigos de retencion...</Text></View>
      ) : (
        <>
          <View style={styles.invoiceGrid}>
            <DropdownField label="Tipo de retencion" options={[{ label: 'IVA', value: 1 }, { label: 'Renta', value: 2 }]} value={tipo === 'IVA' ? 1 : 2} onChange={cambiarTipo} />
            <DropdownField label="Codigo de retencion" options={catalogo.map((item, index) => ({ label: `${item.codigo} · ${item.descripcion} (${Number(item.valor ?? 0).toFixed(2)}%)`, value: index + 1 }))} value={codigoIndex || null} onChange={(value) => setCodigoIndex(value ?? 0)} allowClear />
          </View>
          <View style={styles.invoiceGrid}>
            <Field label="Base imponible" value={base} onChangeText={setBase} keyboardType="decimal-pad" />
            <Field label="Porcentaje" value={`${porcentaje.toFixed(2)}%`} onChangeText={() => undefined} />
          </View>
          <View style={styles.invoiceTotalRow}>
            <Text style={styles.invoiceTotalLabel}>Valor retenido</Text>
            <Text style={styles.invoiceTotalValue}>{formatMoney(valorRetenido)}</Text>
          </View>
          <View style={styles.formActions}>
            <SecondaryButton label="Cancelar" onPress={onClose} />
            <PrimaryButton label="Generar y emitir retencion" loading={saving} onPress={guardar} />
          </View>
        </>
      )}
    </View>
  );
}

function MisLiquidacionesCompraMobileScreen({
  liquidaciones,
  loading,
  message,
  onRefresh,
  onPdf,
  onSharePdf,
  onXml,
  onEmail,
  onEmitir,
  onRetenciones,
  onContinuarRetencion,
}: {
  liquidaciones: LiquidacionCompraListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (liquidacion: LiquidacionCompraListItem, descargar?: boolean) => void;
  onSharePdf: (liquidacion: LiquidacionCompraListItem) => void;
  onXml: (liquidacion: LiquidacionCompraListItem) => void;
  onEmail: (liquidacion: LiquidacionCompraListItem) => void;
  onEmitir: (liquidacion: LiquidacionCompraListItem) => void;
  onRetenciones: () => void;
  onContinuarRetencion: (liquidacion: LiquidacionCompraListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const [selectedLiquidacion, setSelectedLiquidacion] = useState<LiquidacionCompraListItem | null>(null);
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
          <SecondaryButton label="Descargar Excel" accentColor={EXPORT_GREEN} onPress={() => exportRowsToCsv('liquidaciones-compra.csv', visibleLiquidaciones.map((liquidacion) => ({
            Numero: liquidacion.numero ?? '',
            Fecha: formatDocumentDate(liquidacion.fecha),
            Proveedor: liquidacion.proveedor ?? '',
            Identificacion: liquidacion.identificacionProveedor ?? '',
            Estado: liquidacion.estadoSri ?? (liquidacion.autorizado ? 'AUTORIZADO' : 'NO AUTORIZADO'),
            Base: formatMoney(liquidacion.base),
            IVA: formatMoney(liquidacion.iva),
            Total: formatMoney(liquidacion.total),
          })))} />
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
          const statusLabel = liquidacion.estadoSri ?? (liquidacion.autorizado ? 'AUTORIZADO' : 'NO AUTORIZADO');
          const isAuthorized = liquidacion.autorizado || String(liquidacion.estadoSri ?? '').toUpperCase().includes('AUTORIZ');
          return (
            <View key={key} style={styles.invoiceHistoryCard}>
              <View style={styles.invoiceHistoryCardHeader}>
                <View style={styles.invoiceHistoryIdentityRow}>
                  <View style={styles.invoiceHistoryDocIcon}>
                    <MaterialCommunityIcons name="file-percent-outline" size={21} color="#0072BD" />
                  </View>
                  <View style={styles.invoiceHistoryCardInfo}>
                    <Text style={styles.invoiceHistoryNumber} numberOfLines={1} adjustsFontSizeToFit>{liquidacion.numero ?? `Liquidacion ${liquidacion.codLiquidacion}`}</Text>
                    <View style={[styles.invoiceHistoryStatusPill, getInvoiceStatusStyle(statusLabel)]}>
                      <Text style={[styles.invoiceHistoryStatusText, getInvoiceStatusTextStyle(statusLabel)]}>{statusLabel}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.invoiceHistoryClientBlock}>
                  <Text style={styles.invoiceHistoryClient} numberOfLines={1}>{liquidacion.proveedor ?? 'Proveedor'}</Text>
                  <Text style={styles.invoiceHistoryId}>{liquidacion.identificacionProveedor ?? 'Sin identificacion'}</Text>
                </View>
              </View>
              <View style={styles.invoiceHistoryDetailGrid}>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Fecha</Text>
                  <Text style={styles.invoiceHistoryDetailValue}>{formatDocumentDate(liquidacion.fecha)}</Text>
                </View>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Total</Text>
                  <Text style={styles.invoiceHistoryAmount}>{formatMoney(liquidacion.total)}</Text>
                </View>
              </View>
              <View style={styles.clientDetailGrid}>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>Base</Text>
                  <Text style={styles.clientDetailValue}>{formatMoney(liquidacion.base)}</Text>
                </View>
                <View style={styles.clientDetailItem}>
                  <Text style={styles.clientDetailLabel}>IVA</Text>
                  <Text style={styles.clientDetailValue}>{formatMoney(liquidacion.iva)}</Text>
                </View>
              </View>
              <View style={styles.invoiceHistoryAuthorization}>
                <View style={styles.invoiceHistoryAuthorizationTextBlock}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Autorizacion</Text>
                  <Text style={styles.invoiceHistoryAuthorizationText} numberOfLines={2}>{liquidacion.numeroAutorizacion || (liquidacion.autorizado ? 'Autorizado sin numero registrado' : 'Pendiente de autorizacion')} · Retencion {liquidacion.retencionDisponible ? `disponible${liquidacion.numeroRetencion ? ` (${liquidacion.numeroRetencion})` : ''}` : 'no disponible'}</Text>
                </View>
                <DocumentActionsMenu actions={[
                  { label: 'Detalle', icon: 'information-outline', tone: 'primary', onPress: () => setSelectedLiquidacion(liquidacion) },
                  { label: 'Compartir PDF', icon: 'share-variant-outline', tone: 'primary', onPress: () => onSharePdf(liquidacion) },
                  { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(liquidacion) },
                  { label: 'Descargar PDF A4', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(liquidacion, true) },
                  { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(liquidacion) },
                   ...(liquidacion.retencionDisponible ? [{ label: 'Ver retenciones', icon: 'file-percent-outline', tone: 'success' as const, onPress: onRetenciones }] : []),
                   ...(!liquidacion.retencionDisponible && isAuthorized ? [{ label: 'Continuar con retencion', icon: 'receipt-text-plus-outline', tone: 'success' as const, onPress: () => onContinuarRetencion(liquidacion) }] : []),
                  ...(!isAuthorized ? [{ label: 'Emitir SRI', icon: 'send-check-outline', tone: 'primary' as const, onPress: () => onEmitir(liquidacion) }] : []),
                ]} />
              </View>
            </View>
          );
        })}
      </View>
      <ItemDetailModal
        visible={Boolean(selectedLiquidacion)}
        title={selectedLiquidacion?.numero ?? 'Detalle de liquidacion'}
        values={selectedLiquidacion ? [
          `Proveedor: ${selectedLiquidacion.proveedor ?? 'Proveedor'}`,
          `Identificacion: ${selectedLiquidacion.identificacionProveedor ?? 'Sin identificacion'}`,
          `Fecha: ${formatDocumentDate(selectedLiquidacion.fecha)}`,
          `Estado SRI: ${selectedLiquidacion.estadoSri ?? (selectedLiquidacion.autorizado ? 'AUTORIZADO' : 'NO AUTORIZADO')}`,
          selectedLiquidacion.numeroAutorizacion ? `Autorización: ${selectedLiquidacion.numeroAutorizacion}` : '',
          selectedLiquidacion.numeroRetencion ? `Retención: ${selectedLiquidacion.numeroRetencion}` : '',
          selectedLiquidacion.mensajeSri ? `Mensaje SRI: ${selectedLiquidacion.mensajeSri}` : '',
          `Base: ${formatMoney(selectedLiquidacion.base)}`,
          `IVA: ${formatMoney(selectedLiquidacion.iva)}`,
          `Total: ${formatMoney(selectedLiquidacion.total)}`,
          `Retencion: ${selectedLiquidacion.retencionDisponible ? 'Disponible' : 'No disponible'}`,
        ] : []}
        onClose={() => setSelectedLiquidacion(null)}
      />
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
  loadingSearch,
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
  loadingSearch: boolean;
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
  onHistory: () => void;
  onSave: () => void;
}) {
  const serieOptions = getDocumentSerieOptions(preparacion, puntosData, 'guia');
  usePreferredDocumentSerie(serieOptions, form.serie, (serie) => onChange('serie', serie));
  const effectiveSerie = getEffectiveDocumentSerie(serieOptions, form.serie) || form.serie;
  const serieLabel = getSerieLabelFromOptions(serieOptions, effectiveSerie, getSerieLabel(preparacion, effectiveSerie, '001-002'));
  const optionGuiaNumber = getNextSequenceFromOptions(serieOptions, effectiveSerie, '');
  const guiaNumber = effectiveSerie ? form.numeroFactura || optionGuiaNumber || (puntosData?.cajas?.length ? '' : getNextSequence(preparacion, effectiveSerie)) : '';
  const totals = detalles.reduce(
    (acc, item) => {
      const cantidad = parseDocumentNumber(item.cantidad);
      const precio = Number(item.producto.precioUnitario ?? item.producto.costo ?? 0) || 0;
      const base = cantidad * precio;
      const iva = base * ((Number(item.producto.tarifaIva) || 0) / 100);
      return { cantidad: acc.cantidad + cantidad, subtotal: acc.subtotal + base, iva: acc.iva + iva, total: acc.total + base + iva };
    },
    { cantidad: 0, subtotal: 0, iva: 0, total: 0 },
  );
  const totalDocumento = totals.total > 0 ? totals.total : Number(factura?.total ?? 0) || 0;
  const subtotalDocumento = totals.subtotal > 0 ? totals.subtotal : Math.max(totalDocumento - totals.iva, 0);
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
        <SearchField label="Encontrar transportista" placeholder="Identificacion o razon social" value={form.transportistaBusqueda} onChangeText={(value) => onChange('transportistaBusqueda', value)} resultCount={transportistas.length} loading={loadingSearch} onSubmit={onSearchTransportistas} predictive suggestions={transportistas.slice(0, 5).map((item, index) => ({ id: `guia-transportista-${getClienteKey(item, index)}`, title: getClienteDisplayName(item), subtitle: getClienteIdentification(item) || 'Sin identificacion' }))} onSelectSuggestion={(suggestion) => { const item = transportistas.find((candidate, index) => `guia-transportista-${getClienteKey(candidate, index)}` === suggestion.id); if (item) onSelectTransportista(item); }} />
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
        <SearchField label="Encontrar destinatario" placeholder="Identificacion o nombre del cliente" value={form.clienteBusquedaGuia} onChangeText={(value) => onChange('clienteBusquedaGuia', value)} resultCount={clientes.length} loading={loadingSearch} onSubmit={onSearchClientes} predictive suggestions={clientes.slice(0, 5).map((item, index) => ({ id: `guia-cliente-${getClienteKey(item, index)}`, title: getClienteDisplayName(item), subtitle: getClienteIdentification(item) || 'Sin identificacion' }))} onSelectSuggestion={(suggestion) => { const item = clientes.find((candidate, index) => `guia-cliente-${getClienteKey(candidate, index)}` === suggestion.id); if (item) onSelectCliente(item); }} />
        <SearchField label="Vincular factura (opcional)" placeholder="Numero completo o secuencial" value={form.facturaBusqueda} onChangeText={(value) => onChange('facturaBusqueda', value)} resultCount={facturas.length} loading={loadingSearch} onSubmit={onSearchFacturas} predictive suggestions={facturas.slice(0, 5).map((item, index) => ({ id: `guia-factura-${item.codfactura}-${index}`, title: item.numeroCompleto ?? item.numfactura ?? `Factura ${item.codfactura}`, subtitle: item.cliente ?? 'Consumidor final' }))} onSelectSuggestion={(suggestion) => { const item = facturas.find((candidate, index) => `guia-factura-${candidate.codfactura}-${index}` === suggestion.id); if (item) onSelectFactura(item); }} />
        <View style={styles.invoiceGrid}>
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
        {factura ? <Text style={styles.invoiceSectionHelp}>Los detalles se cargaron desde la factura vinculada. Solo puedes ajustar cantidades.</Text> : <>
          <SearchField label="Encontrar producto o detalle" placeholder="Codigo, nombre o descripcion" value={form.productoBusqueda} onChangeText={(value) => onChange('productoBusqueda', value)} resultCount={productos.length} loading={loadingSearch} onSubmit={onSearchProductos} predictive suggestions={productos.slice(0, 5).map((item) => ({ id: `guia-producto-${item.codproducto}`, title: item.descripcion ?? item.codprincipal ?? 'Producto', subtitle: item.codprincipal ?? 'Sin codigo' }))} onSelectSuggestion={(suggestion) => { const item = productos.find((candidate) => `guia-producto-${candidate.codproducto}` === suggestion.id); if (item) onAddProducto(item); }} />
          <View style={styles.formActions}>
            <SecondaryButton label="Agregar detalle" onPress={onSearchProductos} />
          </View>
        </>}
        {detalles.length === 0 ? <EmptyState title="Sin detalles" text="Agrega productos del catalogo o registra un detalle manual." /> : null}
        {detalles.map((detalle, index) => (
          <View key={`guia-detalle-${index}`} style={styles.invoiceLineCard}>
            <Text style={styles.clientName} numberOfLines={2}>{detalle.producto.descripcion ?? detalle.producto.codprincipal}</Text>
            <View style={styles.invoiceLineFieldsGrid}>
              <View style={styles.clientDetailItem}>
                <Text style={styles.clientDetailLabel}>Codigo interno</Text>
                <Text style={styles.clientDetailValue}>{detalle.producto.codprincipal ?? detalle.producto.codproducto}</Text>
              </View>
              <View style={styles.invoiceLineField}><Field label="Cantidad" value={detalle.cantidad} onChangeText={(value) => onUpdateDetalle(index, value)} keyboardType="number-pad" /></View>
            </View>
            <SecondaryButton label="Quitar detalle" onPress={() => onRemoveDetalle(index)} />
          </View>
        ))}
      </View>
      <View style={[styles.formSectionBox, styles.invoiceSummaryBox]}>
        <Text style={styles.clientFormSubtitle}>Resumen</Text>
        <Text style={styles.invoiceSectionHelp}>Totales del traslado</Text>
         <InvoiceSummaryRow label="Subtotal bruto" value={subtotalDocumento} />
         <InvoiceSummaryRow label="Subtotal con descuento" value={subtotalDocumento} />
         <InvoiceSummaryRow label="IVA" value={totals.iva} />
         <InvoiceSummaryRow label="Total documento" value={totalDocumento} />
         <View style={styles.invoiceTotalRow}>
           <Text style={styles.invoiceTotalLabel}>Total items</Text>
           <Text style={styles.invoiceTotalValue}>{totals.cantidad.toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.formActions}>
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
  onSharePdf,
  onXml,
  onEmail,
  onEmitir,
  onAnular,
}: {
  guias: GuiaRemisionListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (guia: GuiaRemisionListItem, descargar?: boolean) => void;
  onSharePdf: (guia: GuiaRemisionListItem) => void;
  onXml: (guia: GuiaRemisionListItem) => void;
  onEmail: (guia: GuiaRemisionListItem) => void;
  onEmitir: (guia: GuiaRemisionListItem) => void;
  onAnular: (guia: GuiaRemisionListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const [selectedGuia, setSelectedGuia] = useState<GuiaRemisionListItem | null>(null);
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
          <SecondaryButton label="Descargar Excel" accentColor={EXPORT_GREEN} onPress={() => exportRowsToCsv('guias-remision.csv', visibleGuias.map((guia) => ({
            Guia: guia.numero ?? '',
            Fecha: formatDocumentDate(guia.fecha),
            Destinatario: guia.destinatario ?? '',
            Identificacion: guia.identificacionDestinatario ?? '',
            Transportista: guia.transportista ?? '',
            Traslado: formatDocumentDate(guia.fechaTraslado),
            Estado: guia.estadoSri ?? (guia.autorizado ? 'AUTORIZADO' : 'PENDIENTE'),
          })))} />
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
          const statusLabel = guia.estadoSri ?? (guia.autorizado ? 'AUTORIZADO' : 'PENDIENTE');
          const isAuthorized = guia.autorizado || String(guia.estadoSri ?? '').toUpperCase().includes('AUTORIZ');
          return (
            <View key={key} style={styles.invoiceHistoryCard}>
              <View style={styles.invoiceHistoryCardHeader}>
                <View style={styles.invoiceHistoryIdentityRow}>
                  <View style={styles.invoiceHistoryDocIcon}>
                    <MaterialCommunityIcons name="truck-delivery-outline" size={21} color="#0072BD" />
                  </View>
                  <View style={styles.invoiceHistoryCardInfo}>
                    <Text style={styles.invoiceHistoryNumber} numberOfLines={1} adjustsFontSizeToFit>{guia.numero ?? `Guia ${guia.codGuia}`}</Text>
                    <View style={[styles.invoiceHistoryStatusPill, getInvoiceStatusStyle(statusLabel)]}>
                      <Text style={[styles.invoiceHistoryStatusText, getInvoiceStatusTextStyle(statusLabel)]}>{statusLabel}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.invoiceHistoryClientBlock}>
                  <Text style={styles.invoiceHistoryClient} numberOfLines={1}>{guia.destinatario ?? 'Destinatario'}</Text>
                  <Text style={styles.invoiceHistoryId}>{guia.identificacionDestinatario ?? 'Sin identificacion'}</Text>
                </View>
              </View>
              <View style={styles.invoiceHistoryDetailGrid}>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Fecha</Text>
                  <Text style={styles.invoiceHistoryDetailValue}>{formatDocumentDate(guia.fecha)}</Text>
                </View>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Traslado</Text>
                  <Text style={styles.invoiceHistoryDetailValue}>{formatDocumentDate(guia.fechaTraslado)}</Text>
                </View>
              </View>
              <View style={styles.invoiceHistoryAuthorization}>
                <View style={styles.invoiceHistoryAuthorizationTextBlock}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Transportista</Text>
                  <Text style={styles.invoiceHistoryAuthorizationText} numberOfLines={2}>{guia.transportista ?? 'No disponible'}</Text>
                </View>
                <DocumentActionsMenu actions={[
                  { label: 'Detalle', icon: 'information-outline', tone: 'primary', onPress: () => setSelectedGuia(guia) },
                  { label: 'Compartir PDF', icon: 'share-variant-outline', tone: 'primary', onPress: () => onSharePdf(guia) },
                  { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(guia) },
                  { label: 'Descargar PDF A4', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(guia, true) },
                  { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(guia) },
                  ...(!isAuthorized ? [{ label: 'Emitir SRI', icon: 'send-check-outline', tone: 'primary' as const, onPress: () => onEmitir(guia) }] : []),
                  { label: 'Anular', icon: 'trash-can-outline', tone: 'danger', onPress: () => onAnular(guia) },
                ]} />
              </View>
            </View>
          );
        })}
      </View>
      <ItemDetailModal
        visible={Boolean(selectedGuia)}
        title={selectedGuia?.numero ?? 'Detalle de guia de remision'}
        values={selectedGuia ? [
          `Destinatario: ${selectedGuia.destinatario ?? 'Destinatario'}`,
          `Identificacion: ${selectedGuia.identificacionDestinatario ?? 'Sin identificacion'}`,
          `Transportista: ${selectedGuia.transportista ?? 'No disponible'}`,
          `Fecha: ${formatDocumentDate(selectedGuia.fecha)}`,
          `Traslado: ${formatDocumentDate(selectedGuia.fechaTraslado)}`,
          `Estado SRI: ${selectedGuia.estadoSri ?? (selectedGuia.autorizado ? 'AUTORIZADO' : 'PENDIENTE')}`,
          selectedGuia.numeroAutorizacion ? `Autorización: ${selectedGuia.numeroAutorizacion}` : '',
          selectedGuia.mensajeSri ? `Mensaje SRI: ${selectedGuia.mensajeSri}` : '',
        ] : []}
        onClose={() => setSelectedGuia(null)}
      />
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
  const primaryMetric = metrics[0];
  return (
    <View style={styles.invoiceHistoryHeader}>
      <View style={styles.invoiceHistoryHeaderTop}>
        <View style={styles.invoiceHistoryHeaderIcon}>
          <MaterialCommunityIcons name="file-document-multiple-outline" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.invoiceHistoryHeaderCopy}>
          <Text style={styles.invoiceHistoryEyebrow}>LISTADO</Text>
          <Text style={styles.invoiceHistoryTitle}>{title}</Text>
          <Text style={styles.invoiceHistoryText}>{description}</Text>
        </View>
        {primaryMetric ? (
          <View style={styles.invoiceHistoryRecordsControl}>
            <Text style={styles.invoiceHistoryRecordsLabel}>Ver</Text>
            <Text style={styles.invoiceHistoryRecordsValue}>{primaryMetric.value}</Text>
            <Text style={styles.invoiceHistoryRecordsLabel}>registros</Text>
          </View>
        ) : null}
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
  onSharePdf,
  onXml,
  onEmail,
  onEmitir,
}: {
  retenciones: RetencionListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onPdf: (retencion: RetencionListItem, descargar?: boolean) => void;
  onSharePdf: (retencion: RetencionListItem) => void;
  onXml: (retencion: RetencionListItem) => void;
  onEmail: (retencion: RetencionListItem) => void;
  onEmitir: (retencion: RetencionListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const [selectedRetencion, setSelectedRetencion] = useState<RetencionListItem | null>(null);
  const visibleRetenciones = retenciones.filter((retencion) => {
    const term = filter.trim().toLowerCase();
    const matchesText = !term || [retencion.numero, retencion.documentoSustento, retencion.proveedor, retencion.identificacionProveedor, retencion.estadoSri].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    const estado = normalizeSriState(retencion.estadoSri);
    const matchesStatus = statusFilter === 1
      || (statusFilter === 2 && estado === 'AUTORIZADO')
      || (statusFilter === 3 && estado === 'PENDIENTE')
      || (statusFilter === 4 && estado === 'RECHAZADO')
      || (statusFilter === 5 && estado === 'ERROR');
    return matchesText && matchesStatus;
  });
  const base = visibleRetenciones.reduce((sum, item) => sum + Number(item.base ?? 0), 0);
  const autorizadas = visibleRetenciones.filter((item) => normalizeSriState(item.estadoSri) === 'AUTORIZADO').length;

  return (
    <>
      <DocumentHistoryHero eyebrow="Retenciones emitidas" title="Mis retenciones" text="Busca por proveedor, comprobante o documento sustento, revisa el estado y exporta la consulta visible." metrics={[{ value: visibleRetenciones.length, label: 'Retenciones filtradas' }, { value: formatMoney(base), label: 'Base filtrada' }, { value: autorizadas, label: 'Autorizadas' }]} />
      <View style={styles.invoiceHistoryFilterPanel}>
        <Text style={styles.clientFormSubtitle}>Busqueda y control</Text>
        <Text style={styles.clientName}>Retenciones generadas</Text>
        <SearchField label="Buscar retenciones" placeholder="Numero, sustento, proveedor o identificacion" value={filter} onChangeText={setFilter} resultCount={visibleRetenciones.length} totalCount={retenciones.length} />
        <DropdownField
          label="Estado SRI"
          options={[{ label: 'Todos', value: 1 }, { label: 'Autorizadas', value: 2 }, { label: 'Pendientes', value: 3 }, { label: 'Rechazadas', value: 4 }, { label: 'Errores', value: 5 }]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value ?? 1)}
        />
        <View style={styles.formActions}>
          <SecondaryButton label="Descargar Excel" accentColor={EXPORT_GREEN} onPress={() => exportRowsToCsv('retenciones.csv', visibleRetenciones.map((retencion) => ({
            Numero: retencion.numero ?? '',
            Fecha: formatDocumentDate(retencion.fecha),
            DocumentoSustento: retencion.documentoSustento ?? '',
            Proveedor: retencion.proveedor ?? '',
            Identificacion: retencion.identificacionProveedor ?? '',
            Estado: normalizeSriState(retencion.estadoSri),
            Base: formatMoney(retencion.base),
            Retenido: formatMoney(retencion.retenido),
          })))} />
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
          const statusLabel = normalizeSriState(retencion.estadoSri);
          const isAuthorized = statusLabel === 'AUTORIZADO';
          return (
            <View key={key} style={styles.invoiceHistoryCard}>
              <View style={styles.invoiceHistoryCardHeader}>
                <View style={styles.invoiceHistoryIdentityRow}>
                  <View style={styles.invoiceHistoryDocIcon}>
                    <MaterialCommunityIcons name="file-check-outline" size={21} color="#0072BD" />
                  </View>
                  <View style={styles.invoiceHistoryCardInfo}>
                    <Text style={styles.invoiceHistoryNumber} numberOfLines={1} adjustsFontSizeToFit>{retencion.numero ?? `Retencion ${retencion.codRetencion}`}</Text>
                    <View style={[styles.invoiceHistoryStatusPill, getInvoiceStatusStyle(statusLabel)]}>
                      <Text style={[styles.invoiceHistoryStatusText, getInvoiceStatusTextStyle(statusLabel)]}>{statusLabel}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.invoiceHistoryClientBlock}>
                  <Text style={styles.invoiceHistoryClient} numberOfLines={1}>{retencion.proveedor ?? 'Proveedor'}</Text>
                  <Text style={styles.invoiceHistoryId}>{retencion.identificacionProveedor ?? 'Sin identificacion'}</Text>
                </View>
              </View>
              <View style={styles.invoiceHistoryDetailGrid}>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Fecha</Text>
                  <Text style={styles.invoiceHistoryDetailValue}>{formatDocumentDate(retencion.fecha)}</Text>
                </View>
                <View style={styles.invoiceHistoryDetailItem}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Retenido</Text>
                  <Text style={styles.invoiceHistoryAmount}>{formatMoney(retencion.retenido)}</Text>
                </View>
              </View>
              <View style={styles.invoiceHistoryAuthorization}>
                <View style={styles.invoiceHistoryAuthorizationTextBlock}>
                  <Text style={styles.invoiceHistoryDetailLabel}>Documento sustento</Text>
                  <Text style={styles.invoiceHistoryAuthorizationText} numberOfLines={2}>{retencion.numeroAutorizacion || (isAuthorized ? 'Autorizado sin numero registrado' : 'Pendiente de autorizacion')} · Sustento {retencion.documentoSustento ?? 'No disponible'} · Base {formatMoney(retencion.base)}</Text>
                </View>
                {!isAuthorized ? <SecondaryButton label="Emitir retención" accentColor="#0072BD" onPress={() => onEmitir(retencion)} /> : null}
                <DocumentActionsMenu actions={[
                  { label: 'Detalle', icon: 'information-outline', tone: 'primary', onPress: () => setSelectedRetencion(retencion) },
                  { label: 'Compartir PDF', icon: 'share-variant-outline', tone: 'primary', onPress: () => onSharePdf(retencion) },
                  { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(retencion) },
                  { label: 'Descargar PDF A4', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(retencion, true) },
                  { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(retencion) },
                  ...(!isAuthorized ? [{ label: 'Emitir retención', icon: 'send-check-outline', tone: 'primary' as const, onPress: () => onEmitir(retencion) }] : []),
                ]} />
              </View>
            </View>
          );
        })}
      </View>
      <ItemDetailModal
        visible={Boolean(selectedRetencion)}
        title={selectedRetencion?.numero ?? 'Detalle de retencion'}
        values={selectedRetencion ? [
          `Documento sustento: ${selectedRetencion.documentoSustento ?? 'No disponible'}`,
          `Proveedor: ${selectedRetencion.proveedor ?? 'Proveedor'}`,
          `Identificacion: ${selectedRetencion.identificacionProveedor ?? 'Sin identificacion'}`,
          `Fecha: ${formatDocumentDate(selectedRetencion.fecha)}`,
          `Estado SRI: ${normalizeSriState(selectedRetencion.estadoSri)}`,
          selectedRetencion.numeroAutorizacion ? `Autorización: ${selectedRetencion.numeroAutorizacion}` : '',
          selectedRetencion.mensajeSri ? `Mensaje SRI: ${selectedRetencion.mensajeSri}` : '',
          `Base: ${formatMoney(selectedRetencion.base)}`,
          `Retenido: ${formatMoney(selectedRetencion.retenido)}`,
        ] : []}
        onClose={() => setSelectedRetencion(null)}
      />
    </>
  );
}

function MisFacturasMobileScreen({
  facturas,
  notasCredito,
  loading,
  message,
  onRefresh,
  onDetail,
  onPdf,
  onSharePdf,
  onXml,
  onEmail,
  onRetrySri,
  onAnular,
  onCuentasCobrar,
  onNotaCredito,
}: {
  facturas: FacturaListItem[];
  notasCredito: NotaCreditoListItem[];
  loading: boolean;
  message?: MessageState;
  onRefresh: () => void;
  onDetail: (factura: FacturaListItem) => Promise<FacturaDetalle>;
  onPdf: (factura: FacturaListItem, descargar?: boolean) => void;
  onSharePdf: (factura: FacturaListItem) => void;
  onXml: (factura: FacturaListItem) => void;
  onEmail: (factura: FacturaListItem) => void;
  onRetrySri: (factura: FacturaListItem) => void;
  onAnular: (factura: FacturaListItem) => void;
  onCuentasCobrar: (factura: FacturaListItem) => void;
  onNotaCredito: (factura: FacturaListItem) => void;
}) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);
  const [page, setPage] = useState(1);
  const [selectedFactura, setSelectedFactura] = useState<FacturaListItem | null>(null);
  const [selectedFacturaDetail, setSelectedFacturaDetail] = useState<FacturaDetalle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
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

  useEffect(() => {
    setPage(1);
  }, [filter, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const viewFactura = async (factura: FacturaListItem) => {
    setSelectedFactura(factura);
    setSelectedFacturaDetail(null);
    setDetailError(null);
    setLoadingDetail(true);
    try {
      setSelectedFacturaDetail(await onDetail(factura));
    } catch (error) {
      setDetailError(error instanceof ApiError ? error.message : 'No se pudo cargar el detalle de la factura.');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <>
      <View style={styles.invoiceHistoryHeader}>
        <View style={styles.invoiceHistoryHeaderTop}>
          <View style={styles.invoiceHistoryHeaderIcon}>
            <MaterialCommunityIcons name="file-document-multiple-outline" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.invoiceHistoryHeaderCopy}>
            <Text style={styles.invoiceHistoryEyebrow}>LISTADO</Text>
            <Text style={styles.invoiceHistoryTitle}>Mis facturas</Text>
            <Text style={styles.invoiceHistoryText}>Consulta tus comprobantes emitidos y ejecuta acciones del documento.</Text>
          </View>
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
          <SecondaryButton label="Descargar Excel" accentColor={EXPORT_GREEN} onPress={() => exportRowsToCsv('facturas.csv', filteredFacturas.map((factura) => ({
            Numero: factura.numeroCompleto ?? factura.numfactura ?? '',
            Fecha: formatDocumentDate(factura.fechaEmision),
            Cliente: factura.cliente ?? '',
            Identificacion: factura.identificacionCliente ?? '',
            Estado: factura.estadoSri ?? (factura.autorizado ? 'AUTORIZADO' : 'PENDIENTE'),
            Total: formatMoney(factura.total),
            SaldoPendiente: formatMoney(factura.saldoPendiente),
          })))} />
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
          const isAuthorized = factura.autorizado || String(factura.estadoSri ?? '').toUpperCase().includes('AUTORIZ');
          const totalNotasCredito = notasCredito
            .filter((nota) => nota.documentoModificadoId === factura.codfactura && nota.estado !== false && (
              nota.autorizado || String(nota.estadoSri ?? '').toUpperCase().includes('AUTORIZ')
            ))
            .reduce((sum, nota) => sum + Number(nota.total ?? 0), 0);
          const paymentType = normalizeText(String(factura.tipopago ?? ''));
          const isCredit = paymentType === '19' || paymentType.includes('credito') || paymentType.includes('credit');
          const totalFactura = Number(factura.total ?? 0);
          const saldoFactura = Math.max(Number(factura.saldoPendiente ?? (totalFactura - Number(factura.totalAbonado ?? 0))), 0);
          const puedeCuentasCobrar = isCredit && saldoFactura - totalNotasCredito > 0.005;
          const puedeGenerarNotaCreditoAutomatica = isAuthorized && Number(factura.total ?? 0) - totalNotasCredito > 0.005;

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
                { label: 'Ver factura', icon: 'information-outline', tone: 'primary', onPress: () => { void viewFactura(factura); } },
                ...(puedeCuentasCobrar ? [{ label: 'Cuentas por cobrar', icon: 'cash-check', tone: 'success' as const, onPress: () => onCuentasCobrar(factura) }] : []),
                ...(puedeGenerarNotaCreditoAutomatica ? [{ label: 'NC automática', icon: 'file-undo-outline', tone: 'primary' as const, onPress: () => onNotaCredito(factura) }] : []),
                { label: 'Compartir PDF', icon: 'share-variant-outline', tone: 'primary', onPress: () => onSharePdf(factura) },
                { label: 'Descargar XML', icon: 'file-code-outline', tone: 'success', onPress: () => onXml(factura) },
                { label: 'Descargar PDF A4', icon: 'file-pdf-box', tone: 'danger', onPress: () => onPdf(factura, true) },
                { label: 'Reenviar correo', icon: 'email-outline', tone: 'warning', onPress: () => onEmail(factura) },
                ...(!isAuthorized ? [{ label: 'Reenviar al SRI', icon: 'send-check-outline', tone: 'primary' as const, onPress: () => onRetrySri(factura) }] : []),
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
        values={loadingDetail ? ['Cargando detalle de la factura...'] : detailError ? [detailError] : selectedFactura ? [
          `Cliente: ${selectedFactura.cliente ?? 'Consumidor final'}`,
          `Identificación: ${selectedFactura.identificacionCliente ?? 'Sin identificación'}`,
          `Fecha de emisión: ${formatDocumentDate(selectedFactura.fechaEmision)}`,
          `Total: ${formatMoney(selectedFactura.total)}`,
          `Estado SRI: ${selectedFactura.estadoSri ?? (selectedFactura.autorizado ? 'AUTORIZADO' : 'PENDIENTE')}`,
          `Estado de pago: ${selectedFactura.estadoPago ?? 'Sin información'}`,
          `Detalles: ${selectedFacturaDetail?.detalles?.length ?? 0}`,
          selectedFactura.numeroAutorizacion ? `Autorización: ${selectedFactura.numeroAutorizacion}` : '',
          selectedFactura.mensajeSri ? `Mensaje SRI: ${selectedFactura.mensajeSri}` : '',
        ].filter(Boolean) : []}
        onClose={() => setSelectedFactura(null)}
      />
    </>
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
  onDownloadStatementFile,
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
  onDownloadStatementFile?: (item: OperationalMobileItem, format: 'pdf' | 'excel') => void;
}) {
  const module = getOperationalModuleSlug(view);
  const config = module ? getOperationalScreenConfig(view, module) : null;
  const selectedTab = module ? activeTab ?? getOperationalDefaultTab(view, module) : activeTab;
  const capabilities = getOperationalCapabilities(view, selectedTab ?? '');
  const [detailItem, setDetailItem] = useState<OperationalMobileItem | null>(null);

  if (!config) return null;

  if (formMode && view !== 'cuentas-cobrar') {
    return (
      <OperationalForm
        title={formMode === 'edit' ? `Editar ${selectedTab}` : `Registrar ${selectedTab}`}
        form={form}
        saving={saving}
        onCancel={onCancel}
        onChange={onChange}
        onSave={onSave}
      />
    );
  }

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
        onDownloadFile={onDownloadStatementFile}
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

  if (view === 'centro-normativo') {
    return (
      <CentroNormativoMobileScreen
        search={search}
        items={items}
        loading={loading}
        message={message}
        placeholder={config.placeholder}
        onRefresh={onRefresh}
        onSearch={onSearch}
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
  onDownloadFile,
}: {
  search: string;
  items: OperationalMobileItem[];
  loading: boolean;
  message?: MessageState;
  placeholder: string;
  onRefresh: () => void;
  onSearch: (value: string) => void;
  onRegisterPayment?: (item: OperationalMobileItem) => void;
  onDownloadFile?: (item: OperationalMobileItem, format: 'pdf' | 'excel') => void;
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
        onDownloadFile={(format) => {
          if (detailItem) onDownloadFile?.(detailItem, format);
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

function AccountStatementDetailModal({ item, onClose, onRegister, onDownloadFile }: { item: OperationalMobileItem | null; onClose: () => void; onRegister: () => void; onDownloadFile: (format: 'pdf' | 'excel') => void }) {
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
            <Pressable style={styles.accountModalActionButton} onPress={() => onDownloadFile('pdf')}>
              <MaterialCommunityIcons name="download-outline" size={17} color="#315A7A" />
              <Text style={styles.accountModalActionText}>Descargar PDF</Text>
            </Pressable>
            <Pressable style={styles.accountModalActionButton} onPress={() => onDownloadFile('excel')}>
              <MaterialCommunityIcons name="file-excel-outline" size={17} color="#128A46" />
              <Text style={styles.accountModalActionText}>Descargar Excel</Text>
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

function CentroNormativoMobileScreen({
  search,
  items,
  loading,
  message,
  placeholder,
  onRefresh,
  onSearch,
}: {
  search: string;
  items: OperationalMobileItem[];
  loading: boolean;
  message?: MessageState;
  placeholder: string;
  onRefresh: () => void;
  onSearch: (value: string) => void;
}) {
  const [detailItem, setDetailItem] = useState<OperationalMobileItem | null>(null);
  const detailCategory = detailItem ? getOperationalRawText(detailItem, ['categoria', 'Categoria'], detailItem.subtitle || 'Normativa') : '';
  const detailCode = detailItem ? getOperationalRawText(detailItem, ['codigo', 'Codigo', 'numero', 'Numero'], detailItem.id) : '';
  const detailVerified = detailItem ? getOperationalRawText(detailItem, ['fechaActualizacion', 'FechaActualizacion', 'fecha', 'Fecha']) : '';
  const detailSourceRaw = detailItem ? getOperationalRawText(detailItem, ['urlOficial', 'UrlOficial', 'url', 'Url', 'fuenteUrl', 'FuenteUrl', 'urlFuente', 'UrlFuente', 'link', 'Link', 'enlace', 'Enlace', 'fuenteOficial', 'FuenteOficial', 'referenciaUrl', 'ReferenciaUrl']) : '';
  const detailSourceUrl = /^https?:\/\//i.test(detailSourceRaw) ? detailSourceRaw : 'https://www.sri.gob.ec/';
  const detailArticles = detailItem ? getNormativeArticles(detailItem) : [];

  return (
    <>
      <View style={styles.normativeHero}>
        <View style={styles.normativeHeroCopy}>
          <Text style={styles.normativeEyebrow}>BASE LEGAL DE E-FACT</Text>
          <Text style={styles.normativeTitle}>Centro normativo</Text>
          <Text style={styles.normativeText}>Encuentra en un solo lugar las disposiciones que respaldan tus comprobantes electronicos.</Text>
          <View style={styles.normativeBenefits}>
            <NormativeBenefit icon="check-decagram" label="Contenido organizado" />
            <NormativeBenefit icon="link-variant" label="Fuentes oficiales" />
            <NormativeBenefit icon="refresh" label="Consulta actualizada" />
          </View>
        </View>
        <View style={styles.normativeHeroIcon}>
          <MaterialCommunityIcons name="scale-balance" size={42} color="#FFFFFF" />
        </View>
      </View>
      <View style={styles.normativeLibrary}>
        <View style={styles.adminSearchHeader}>
          <View style={styles.adminSearchTitleBlock}>
            <Text style={styles.clientFormSubtitle}>Biblioteca normativa</Text>
            <Text style={styles.clientFormTitle}>¿Que necesitas consultar?</Text>
          </View>
          <Pressable style={styles.adminActionPill} onPress={onRefresh}>
            <Text style={styles.adminActionText}>Refrescar</Text>
          </Pressable>
        </View>
        <SearchField label="Buscar normativa" placeholder={placeholder} value={search} onChangeText={onSearch} resultCount={items.length} loading={loading} />
        {message ? <MessageBox message={message} /> : null}
        {loading ? <EmptyState title="Cargando normativas" text="Consultando la biblioteca normativa..." /> : null}
        {!loading && !message && items.length === 0 ? <EmptyState title="Sin normativas" text="Cuando existan normas publicadas, apareceran aqui." /> : null}
      </View>
      {!loading && items.length > 0 ? (
        <View style={styles.normativeCardsGrid}>
          {items.map((item, index) => {
            const category = getOperationalRawText(item, ['categoria', 'Categoria'], item.subtitle || 'Normativa');
            const code = getOperationalRawText(item, ['codigo', 'Codigo', 'numero', 'Numero'], item.id);
            const rawSourceUrl = getOperationalRawText(item, ['urlOficial', 'UrlOficial', 'url', 'Url', 'fuenteUrl', 'FuenteUrl', 'urlFuente', 'UrlFuente', 'link', 'Link', 'enlace', 'Enlace', 'fuenteOficial', 'FuenteOficial', 'referenciaUrl', 'ReferenciaUrl']);
            const sourceUrl = /^https?:\/\//i.test(rawSourceUrl) ? rawSourceUrl : 'https://www.sri.gob.ec/';
            const status = item.status || getOperationalRawText(item, ['estadoNorma', 'EstadoNorma'], 'Vigente');
            return (
              <View key={`normativa-${item.id || index}`} style={styles.normativeCard}>
                <View style={styles.normativeCardTop}>
                  <Text style={styles.normativeCategoryPill}>{category}</Text>
                  <View style={[styles.invoiceHistoryStatusPill, getInvoiceStatusStyle(status)]}>
                    <Text style={[styles.invoiceHistoryStatusText, getInvoiceStatusTextStyle(status)]}>{status}</Text>
                  </View>
                </View>
                <View style={styles.normativeCardBody}>
                  <View style={styles.normativeCardIcon}>
                    <MaterialCommunityIcons name={index % 2 === 0 ? 'file-document-outline' : 'book-open-page-variant-outline'} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.normativeCardCopy}>
                    <Text style={styles.normativeCode}># {code || 'Sin codigo'}</Text>
                    <Text style={styles.normativeCardTitle}>{item.title}</Text>
                  </View>
                </View>
                {item.detail ? <Text style={styles.normativeCardText} numberOfLines={3}>{item.detail}</Text> : null}
                <View style={styles.normativeCardActions}>
                  <Pressable style={styles.normativeDetailButton} onPress={() => setDetailItem(item)}>
                    <MaterialCommunityIcons name="book-open-outline" size={15} color="#0072BD" />
                    <Text style={styles.normativeDetailButtonText}>Ver detalle</Text>
                  </Pressable>
                  <Pressable style={styles.normativeSourceButton} onPress={() => Linking.openURL(sourceUrl)}>
                    <Text style={styles.normativeSourceText}>Fuente oficial</Text>
                    <MaterialCommunityIcons name="open-in-new" size={14} color="#0072BD" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
      <Modal visible={Boolean(detailItem)} transparent animationType="fade" onRequestClose={() => setDetailItem(null)}>
        <View style={styles.normativeModalOverlay}>
          <View style={styles.normativeModalCard}>
            <View style={styles.normativeModalHeader}>
              <View style={styles.normativeModalTitleBlock}>
                <Text style={styles.normativeCategoryPill}>{detailCategory}</Text>
                <Text style={styles.normativeModalTitle}>{detailItem?.title || 'Detalle normativo'}</Text>
                {detailCode ? <Text style={styles.normativeCode}># {detailCode}</Text> : null}
              </View>
              <Pressable style={styles.normativeModalClose} onPress={() => setDetailItem(null)}>
                <MaterialCommunityIcons name="close" size={20} color="#31516D" />
              </Pressable>
            </View>
            <ScrollView style={styles.normativeModalScroll} contentContainerStyle={styles.normativeModalContent} showsVerticalScrollIndicator={false}>
              {detailItem?.detail ? <Text style={styles.normativeModalLead}>{detailItem.detail}</Text> : null}
              {detailArticles.map((article, index) => (
                <View key={`normative-article-${index}`} style={styles.normativeArticleRow}>
                  <View style={styles.normativeArticleBadge}>
                    <Text style={styles.normativeArticleBadgeText}>{article.label}</Text>
                  </View>
                  <Text style={styles.normativeArticleText}>{article.text}</Text>
                </View>
              ))}
              {!detailItem?.detail && detailArticles.length === 0 ? <Text style={styles.normativeModalLead}>No hay detalle adicional registrado para esta normativa.</Text> : null}
            </ScrollView>
            <View style={styles.normativeModalFooter}>
              {detailVerified ? <Text style={styles.normativeVerifiedText}>Verificada: {formatDocumentDate(detailVerified)}</Text> : <View />}
              <Pressable style={styles.normativeSourceButton} onPress={() => Linking.openURL(detailSourceUrl)}>
                <Text style={styles.normativeSourceText}>Fuente oficial</Text>
                <MaterialCommunityIcons name="open-in-new" size={14} color="#0072BD" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function NormativeBenefit({ icon, label }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string }) {
  return (
    <View style={styles.normativeBenefit}>
      <MaterialCommunityIcons name={icon} size={13} color="#0072BD" />
      <Text style={styles.normativeBenefitText}>{label}</Text>
    </View>
  );
}

function getOperationalRawText(item: OperationalMobileItem, keys: string[], fallback?: string | null) {
  const row = item.raw ?? {};
  const normalizedKeys = keys.map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const entry = Object.entries(row).find(([key, value]) => value !== null && value !== undefined && normalizedKeys.includes(key.toLowerCase().replace(/[^a-z0-9]/g, '')));
  return entry?.[1] !== null && entry?.[1] !== undefined ? String(entry[1]) : fallback ?? '';
}

function getNormativeArticles(item: OperationalMobileItem) {
  const row = item.raw ?? {};
  const content = getOperationalRawText(item, ['contenido', 'Contenido']);
  if (content.trim()) {
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf('.-');
        if (separator <= 0) return { label: 'Detalle', text: line };
        return { label: line.slice(0, separator + 2).trim(), text: line.slice(separator + 2).trim() };
      });
  }

  const articleSource = Object.entries(row).find(([key, value]) => value !== null && value !== undefined && ['articulos', 'detallearticulos', 'requisitos', 'caracteristicas'].includes(key.toLowerCase().replace(/[^a-z0-9]/g, '')))?.[1];
  const records = Array.isArray(articleSource) ? articleSource : [];
  const fromRecords = records
    .map((record, index) => {
      if (!record) return null;
      if (typeof record !== 'object' || Array.isArray(record)) return { label: `Art. ${index + 1}.`, text: String(record) };
      const articleItem: OperationalMobileItem = { id: '', title: '', raw: record as Record<string, unknown> };
      const label = getOperationalRawText(articleItem, ['articulo', 'Articulo', 'numero', 'Numero', 'titulo', 'Titulo', 'codigo', 'Codigo'], `Art. ${index + 1}.`);
      const text = getOperationalRawText(articleItem, ['descripcion', 'Descripcion', 'detalle', 'Detalle', 'texto', 'Texto', 'contenido', 'Contenido'], '');
      return text ? { label, text } : null;
    })
    .filter((article): article is { label: string; text: string } => Boolean(article));

  if (fromRecords.length > 0) return fromRecords;

  return Object.entries(row)
    .filter(([key, value]) => value !== null && value !== undefined && /^art(iculo)?\d+/i.test(key.replace(/[^a-z0-9]/gi, '')))
    .map(([key, value]) => ({ label: key.replace(/_/g, ' '), text: String(value) }));
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
      style={[styles.portalServiceCard, { backgroundColor: visual.surface, borderColor: visual.accent }, !enabled && styles.portalServiceCardDisabled]}
      onPress={onPress}
    >
      <View style={styles.portalServiceLogoPlate}>
        {visual.kind === 'efact' ? <Image source={require('./assets/logo-numerica.png')} style={styles.portalServiceLogo} /> : null}
        {visual.kind === 'orange' ? <Image source={require('./assets/logo-numerica-naranja.png')} style={styles.portalServiceLogo} /> : null}
        {visual.kind === 'green' ? <Image source={require('./assets/logo-numerica-verde.png')} style={styles.portalServiceLogo} /> : null}
        {visual.kind === 'purple' ? <Image source={require('./assets/logo-numerica-morado.png')} style={styles.portalServiceLogo} /> : null}
        {visual.kind === 'rubrica' ? <Image source={require('./assets/logo-numerica-rubrica.png')} style={styles.portalServiceLogoWide} /> : null}
        {['document', 'calculator', 'pencil', 'briefcase'].includes(visual.kind) ? <PortalServiceGlyph kind={visual.kind} /> : null}
      </View>
      <View style={styles.portalServiceCopy}>
        <Text style={styles.portalServiceTitle}>{title}</Text>
        <Text style={styles.portalServiceDescription}>{description}</Text>
        <View style={[styles.portalServiceButton, { backgroundColor: enabled ? visual.surface : '#EEF3F7' }]}>
          <Text style={[styles.portalServiceButtonText, { color: enabled ? visual.accent : '#7A8A99' }]}>{enabled ? 'Ingresar' : 'No disponible'}</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={enabled ? visual.accent : '#7A8A99'} />
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
    </View>
  );
}

function PdfSignaturePositionPicker({
  pdfUri,
  page,
  pageCount,
  position,
  pageSize,
  onPageChange,
  onPageCountChange,
  onPositionChange,
  onPageSizeChange,
}: {
  pdfUri: string;
  page: number;
  pageCount: number;
  position: { x: number; y: number };
  pageSize: { widthMm: number; heightMm: number };
  onPageChange: (page: number) => void;
  onPageCountChange: (pageCount: number) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onPageSizeChange: (size: { widthMm: number; heightMm: number }) => void;
}) {
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState(false);
  const pdfJsViewerSource = usePdfJsSource(PDFJS_VIEWER_URI);
  const pdfJsWorkerSource = usePdfJsSource(PDFJS_WORKER_URI);
  const pdfJsSource = pdfJsViewerSource && pdfJsWorkerSource ? `${pdfJsViewerSource}\n${pdfJsWorkerSource}` : null;
  useEffect(() => {
    if (pdfJsViewerSource === '' || pdfJsWorkerSource === '') setViewerError(true);
  }, [pdfJsViewerSource, pdfJsWorkerSource]);
  useEffect(() => {
    let mounted = true;
    setViewerError(false);
    setPdfBase64(null);
    FileSystem.readAsStringAsync(pdfUri, { encoding: FileSystem.EncodingType.Base64 })
      .then((value) => { if (mounted) setPdfBase64(value); })
      .catch(() => { if (mounted) setPdfBase64(null); });
    return () => { mounted = false; };
  }, [pdfUri]);

  const pdfHtml = pdfBase64 && pdfJsSource ? `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" /><style>html,body{margin:0;background:#eef3f7;font-family:Arial}#stage{position:relative;width:100%;min-height:100vh;display:flex;justify-content:center;align-items:flex-start;padding:10px;box-sizing:border-box}#canvas{max-width:100%;height:auto;background:#fff;box-shadow:0 2px 8px #8293a555}#marker{position:absolute;width:92px;height:42px;border:2px solid #0878c9;background:#dff2ffdd;color:#0878c9;font-weight:bold;font-size:12px;display:flex;align-items:center;justify-content:center;pointer-events:none;box-sizing:border-box;border-radius:4px}</style></head><body><div id="stage"><canvas id="canvas"></canvas><div id="marker">FIRMA AQUÍ</div></div><script>${pdfJsSource}</script><script>try{const raw=atob('${pdfBase64}');const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const pageNumber=${page};const posX=${position.x};const posY=${position.y};pdfjsLib.getDocument({data:bytes,disableWorker:true}).promise.then(pdf=>{window.ReactNativeWebView.postMessage(JSON.stringify({type:'pages',count:pdf.numPages}));if(pageNumber>pdf.numPages)throw new Error('page-out-of-range');return pdf.getPage(pageNumber)}).then(page=>{const base=page.getViewport({scale:1});const widthMm=base.width*25.4/72;const heightMm=base.height*25.4/72;window.ReactNativeWebView.postMessage(JSON.stringify({type:'size',widthMm,heightMm}));const maxWidth=Math.min(window.innerWidth-20,680);const viewport=page.getViewport({scale:maxWidth/base.width});const canvas=document.getElementById('canvas');canvas.width=viewport.width;canvas.height=viewport.height;canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';page.render({canvasContext:canvas.getContext('2d'),viewport}).promise}).then(()=>{const marker=document.getElementById('marker');marker.style.left=(10+posX*document.getElementById('canvas').width-46)+'px';marker.style.top=(10+posY*document.getElementById('canvas').height-21)+'px';document.getElementById('canvas').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();window.ReactNativeWebView.postMessage(JSON.stringify({type:'position',x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}))}}).catch(()=>window.ReactNativeWebView.postMessage(JSON.stringify({type:'error'})))}catch(e){window.ReactNativeWebView.postMessage(JSON.stringify({type:'error'}))}</script></body></html>` : '<html><body style="font-family:Arial;text-align:center;padding:24px;color:#637587">Cargando previsualización del PDF…</body></html>';

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
        <Text style={styles.pdfPageNumber}>{page} / {pageCount}</Text>
        <Pressable accessibilityLabel="Página siguiente" disabled={page >= pageCount} style={[styles.pdfPageButton, page >= pageCount && styles.pdfPageButtonDisabled]} onPress={() => onPageChange(Math.min(pageCount, page + 1))}>
          <MaterialCommunityIcons name="chevron-right" size={20} color={page >= pageCount ? EFACT_THEME.colors.disabled : ERUBRICA_COLORS.primary} />
        </Pressable>
      </View>
      <View style={styles.pdfPageStage}>
        <WebView
          originWhitelist={['*']}
          source={{ html: pdfHtml }}
          javaScriptEnabled
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          style={styles.pdfWebView}
          onMessage={(event: { nativeEvent: { data: string } }) => {
            try {
              const result = JSON.parse(event.nativeEvent.data) as { type?: string; x?: number; y?: number; widthMm?: number; heightMm?: number; count?: number };
              if (result.type === 'position' && typeof result.x === 'number' && typeof result.y === 'number') onPositionChange({ x: result.x, y: result.y });
              if (result.type === 'size' && typeof result.widthMm === 'number' && typeof result.heightMm === 'number') onPageSizeChange({ widthMm: result.widthMm, heightMm: result.heightMm });
              if (result.type === 'pages' && typeof result.count === 'number') onPageCountChange(result.count);
              if (result.type === 'error') setViewerError(true);
            } catch { /* ignore malformed viewer messages */ }
          }}
        />
      </View>
      {viewerError ? <Text style={styles.pdfViewerError}>No se pudo cargar la previsualización. Vuelve a seleccionar el PDF.</Text> : null}
      <View style={styles.pdfPositionInfo}>
        <MaterialCommunityIcons name="information-outline" size={18} color={ERUBRICA_COLORS.primary} />
        <Text style={styles.pdfPositionInfoText}>Página {page} · posición horizontal {Math.round(position.x * 100)}% · vertical {Math.round(position.y * 100)}%</Text>
      </View>
    </View>
  );
}

function PdfDocumentPreview({ uri }: { uri: string }) {
  const [base64, setBase64] = useState<string | null>(null);
  const pdfJsViewerSource = usePdfJsSource(PDFJS_VIEWER_URI);
  const pdfJsWorkerSource = usePdfJsSource(PDFJS_WORKER_URI);
  const pdfJsSource = pdfJsViewerSource && pdfJsWorkerSource ? `${pdfJsViewerSource}\n${pdfJsWorkerSource}` : null;
  useEffect(() => {
    let mounted = true;
    setBase64(null);
    FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
      .then((value) => { if (mounted) setBase64(value); })
      .catch(() => { if (mounted) setBase64(''); });
    return () => { mounted = false; };
  }, [uri]);

  const html = base64 && pdfJsSource ? `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><style>html,body{margin:0;background:#eef3f7}#canvas{display:block;margin:12px auto;background:#fff;max-width:calc(100% - 24px);box-shadow:0 2px 8px #63758755}</style></head><body><canvas id="canvas"></canvas><script>${pdfJsSource}</script><script>try{const r=atob('${base64}'),b=new Uint8Array(r.length);for(let i=0;i<r.length;i++)b[i]=r.charCodeAt(i);pdfjsLib.getDocument({data:b,disableWorker:true}).promise.then(p=>p.getPage(1)).then(p=>{const v=p.getViewport({scale:1}),s=Math.min((innerWidth-24)/v.width,1.5),q=p.getViewport({scale:s}),c=document.getElementById('canvas');c.width=q.width;c.height=q.height;p.render({canvasContext:c.getContext('2d'),viewport:q})}).catch(()=>document.body.innerHTML='<p style="padding:24px;text-align:center;font-family:Arial;color:#637587">No se pudo mostrar el PDF.</p>')}catch(e){document.body.innerHTML='<p style="padding:24px;text-align:center;font-family:Arial;color:#637587">No se pudo mostrar el PDF.</p>'}</script></body></html>` : '<p style="padding:24px;text-align:center;font-family:Arial;color:#637587">Cargando PDF…</p>';
  return <WebView originWhitelist={['*']} source={{ html }} javaScriptEnabled style={styles.pdfDocumentWebView} />;
}

function ERubricaMobileScreen({
  data,
  initialPdf,
  requestedTab,
  loading,
  message,
  onTabChange,
  onRefresh,
  onPreviewPdf,
  onPreviewRemotePdf,
  onDownloadRemotePdf,
  onSync,
}: {
  data: ERubricaDashboard | null;
  initialPdf?: { uri: string; name: string; mimeType?: string } | null;
  requestedTab?: ERubricaTab | null;
  loading: boolean;
  message: MessageState;
  onTabChange: (tab: ERubricaTab) => void;
  onRefresh: () => void;
  onPreviewPdf: (file: { uri: string; name: string; mimeType?: string }) => void;
  onPreviewRemotePdf: (urlOrPath: string, fileName: string) => void;
  onDownloadRemotePdf: (urlOrPath: string, fileName: string) => void;
  onSync: () => Promise<void>;
}) {
  const [tab, setTab] = useState<ERubricaTab>('inicio');
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
  const [planDisponible, setPlanDisponible] = useState<unknown>(null);
  const [proveedorItems, setProveedorItems] = useState<unknown[]>([]);
  const [documentosPendientes, setDocumentosPendientes] = useState<ERubricaDocumentoPendiente[]>([]);
  const [loadingDocumentosPendientes, setLoadingDocumentosPendientes] = useState(false);
  const [documentoPendienteSeleccionado, setDocumentoPendienteSeleccionado] = useState<string | null>(null);
  const [documentosFirmados, setDocumentosFirmados] = useState<ERubricaDocumentoFirmado[]>([]);
  const [loadingDocumentosFirmados, setLoadingDocumentosFirmados] = useState(false);
  const [firmaEmisores, setFirmaEmisores] = useState<ERubricaEmisor[]>([]);
  const [firmaEmisoresCargados, setFirmaEmisoresCargados] = useState(false);
  const [firmaDetalleActiva, setFirmaDetalleActiva] = useState<ERubricaFirmaEstado | null>(null);
  const [loadingFirmaDetalle, setLoadingFirmaDetalle] = useState(false);
  const [validandoFirmaTemporal, setValidandoFirmaTemporal] = useState(false);
  const [savingConfiguredSignature, setSavingConfiguredSignature] = useState(false);
  const [signedDocumentsModalOpen, setSignedDocumentsModalOpen] = useState(false);
  const [loadingSignedDocument, setLoadingSignedDocument] = useState(false);
  const [historialQuery, setHistorialQuery] = useState('');
  const [historialDate, setHistorialDate] = useState('');
  const [historialStatus, setHistorialStatus] = useState('');
  const [historialSolicitudesPage, setHistorialSolicitudesPage] = useState(1);
  const [syncingSolicitudId, setSyncingSolicitudId] = useState<number | null>(null);
  const [signaturePage, setSignaturePage] = useState(1);
  const [signaturePageCount, setSignaturePageCount] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState({ x: 0.68, y: 0.82 });
  const [signaturePageSize, setSignaturePageSize] = useState({ widthMm: 210, heightMm: 297 });
  const [solicitudStep, setSolicitudStep] = useState(1);
  const [solicitudPlan, setSolicitudPlan] = useState({ label: '7 días', price: 9 });
  const [solicitudPersona, setSolicitudPersona] = useState('Persona natural con cédula');
  const [solicitudForm, setSolicitudForm] = useState(SOLICITUD_FORM_INITIAL);
  const [showSolicitudBirthDate, setShowSolicitudBirthDate] = useState(false);
  const [solicitudFiles, setSolicitudFiles] = useState(SOLICITUD_FILES_INITIAL);
  const [solicitudId, setSolicitudId] = useState<number | null>(null);
  const [solicitudSaving, setSolicitudSaving] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'deuna' | 'transferencia'>('deuna');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [transferForm, setTransferForm] = useState({ banco: '', titular: '', cuenta: '', comprobante: '' });
  const [transferReceipt, setTransferReceipt] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const selectTab = (nextTab: ERubricaTab) => {
    setTab(nextTab);
    onTabChange(nextTab);
  };
  useEffect(() => {
    if (initialPdf) {
      setPdfFile(initialPdf);
      selectTab('firmar');
    }
  }, [initialPdf]);
  useEffect(() => {
    setTab(requestedTab ?? 'inicio');
  }, [requestedTab]);
  const dashboardRecord = data as (ERubricaDashboard & Record<string, unknown>) | null;
  const dashboardPayload = (dashboardRecord?.data ?? dashboardRecord?.Data ?? dashboardRecord) as (ERubricaDashboard & Record<string, unknown>) | null;
  const solicitudesData = dashboardPayload?.solicitudes ?? dashboardPayload?.Solicitudes;
  const firmasData = dashboardPayload?.firmas ?? dashboardPayload?.Firmas;
  const menusData = dashboardPayload?.menus ?? dashboardPayload?.Menus;
  const solicitudes = Array.isArray(solicitudesData) ? solicitudesData : [];
  const firmas = Array.isArray(firmasData) ? firmasData : [];
  const menus = Array.isArray(menusData) ? menusData : [];
  const label = (item: unknown, keys: string[], fallback: string) => {
    if (!item || typeof item !== 'object') return fallback;
    const record = item as Record<string, unknown>;
    const value = keys.map((key) => record[key]).find((candidate) => candidate !== null && candidate !== undefined && String(candidate).trim());
    return value === undefined ? fallback : String(value);
  };
  const itemValue = (item: unknown, keys: string[]) => {
    if (!item || typeof item !== 'object') return '';
    const record = item as Record<string, unknown>;
    const value = keys.map((key) => record[key]).find((candidate) => candidate !== null && candidate !== undefined && String(candidate).trim());
    return value === undefined ? '' : String(value);
  };
  const buildSolicitudTitular = (item: unknown, fallback = 'Titular') => {
    const composed = `${itemValue(item, ['solNombres', 'SolNombres'])} ${itemValue(item, ['solPrimerApellido', 'SolPrimerApellido'])} ${itemValue(item, ['solSegundoApellido', 'SolSegundoApellido'])}`.trim();
    return composed || label(item, ['titular', 'nombreTitular', 'solicitante', 'nombres', 'nombre', 'cliente', 'razonSocial'], fallback);
  };
  const renovacionActual = planDisponible ?? renovacion ?? dashboardPayload?.renovacion ?? dashboardPayload?.Renovacion;
  const activeFirma = firmas[0] ?? null;
  const firmaEfact = firmaEmisores.find((item) => item.tieneCertificado && item.tieneClave) ?? null;
  const firmaEfactValida = Boolean(firmaDetalleActiva?.esValida ?? firmaEfact?.esValida);
  const firmaTitular = firmaDetalleActiva?.nombreTitular || buildSolicitudTitular(activeFirma, 'Sin firma activa');
  const firmaIdentificacion = firmaDetalleActiva?.identificacion || label(activeFirma, ['identificacion', 'solIdentificacion', 'SolIdentificacion', 'ruc', 'cedula', 'documento'], 'Sin dato');
  const firmaEstado = firmaDetalleActiva?.estadoVigencia || label(activeFirma, ['estado', 'estadoVigencia', 'status'], firmaEfact ? 'Configurada' : 'Sin firma');
  const firmaEmision = firmaDetalleActiva?.fechaEmision ? formatDocumentDate(firmaDetalleActiva.fechaEmision) : label(activeFirma, ['fechaEmision', 'solFechaAprobacion', 'SolFechaAprobacion', 'emitida', 'fechaInicio'], 'Sin dato');
  const firmaExpira = firmaDetalleActiva?.fechaExpiracion ? formatDocumentDate(firmaDetalleActiva.fechaExpiracion) : label(activeFirma, ['fechaExpiracion', 'solFechaActualizacion', 'SolFechaActualizacion', 'expira', 'fechaFin'], 'Sin dato');
  const firmaEfactExpira = firmaDetalleActiva?.fechaExpiracion ? formatDocumentDate(firmaDetalleActiva.fechaExpiracion) : firmaEfact?.fechaExpiracion ? formatDocumentDate(firmaEfact.fechaExpiracion) : firmaExpira;
  const firmaDiasRestantes = firmaDetalleActiva?.diasRestantes !== undefined && firmaDetalleActiva?.diasRestantes !== null ? `${firmaDetalleActiva.diasRestantes} días` : label(activeFirma, ['diasRestantes', 'vigenciaRestante'], 'Sin dato');
  const firmaAutoridad = firmaDetalleActiva?.emisor || label(activeFirma, ['autoridadEmisora', 'emisor', 'ca'], 'Sin dato');
  const firmaSerie = firmaDetalleActiva?.numeroSerie || label(activeFirma, ['numeroSerie', 'serie', 'serial'], 'Sin dato');
  const firmaHuella = firmaDetalleActiva?.huellaDigital || label(activeFirma, ['huellaDigital', 'fingerprint', 'huella'], 'Sin dato');
  const planDiasRestantes = label(renovacionActual, ['diasRestantes', 'vigenciaRestante', 'dias'], firmaDiasRestantes);
  const planFechaVencimiento = label(renovacionActual, ['fechaVencimiento', 'fechaExpiracion', 'vence'], firmaExpira);
  const planEstado = label(renovacionActual, ['estado', 'estadoAcceso', 'status'], firmaEstado);
  const formatSignedDate = (item: unknown) => {
    const raw = itemValue(item, ['fechaFirma', 'solFechaSolicitud', 'SolFechaSolicitud', 'solFechaAprobacion', 'SolFechaAprobacion', 'fecha', 'fechaCreacion', 'createdAt', 'signedAt']);
    if (!raw) return { date: 'Sin fecha', time: '' };
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return { date: raw.split('T')[0] || raw, time: raw.includes('T') ? raw.split('T')[1]?.slice(0, 8) ?? '' : '' };
    return {
      date: parsed.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: parsed.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
    };
  };
  const historialDocumentos = documentosFirmados.length ? documentosFirmados : firmas;
  const signedMonthCount = historialDocumentos.filter((item) => {
    const parsed = new Date(itemValue(item, ['fechaFirma', 'solFechaSolicitud', 'SolFechaSolicitud', 'solFechaAprobacion', 'SolFechaAprobacion', 'fecha', 'fechaCreacion', 'createdAt', 'signedAt']));
    const now = new Date();
    return !Number.isNaN(parsed.getTime()) && parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear();
  }).length;
  const filteredFirmas = historialDocumentos.filter((item) => {
    const content = JSON.stringify(item).toLowerCase();
    const status = label(item, ['estado', 'status', 'estadoFirma', 'estadoSolicitud', 'EstadoSolicitud'], 'valido').toLowerCase();
    const rawDate = itemValue(item, ['fechaFirma', 'solFechaSolicitud', 'SolFechaSolicitud', 'solFechaAprobacion', 'SolFechaAprobacion', 'fecha', 'fechaCreacion', 'createdAt', 'signedAt']).toLowerCase();
    return (!historialQuery.trim() || content.includes(historialQuery.trim().toLowerCase()))
      && (!historialDate.trim() || rawDate.includes(historialDate.trim().toLowerCase()))
      && (!historialStatus.trim() || status.includes(historialStatus.trim().toLowerCase()));
  });
  const documentosPorFirmar = solicitudes.filter((item) => {
    const status = label(item, ['estado', 'status', 'solEstado', 'estadoSolicitud', 'EstadoSolicitud'], 'pendiente').toLowerCase();
    return !status.includes('firmad') && !status.includes('valid');
  });
  const filteredDocumentosPorFirmar = documentosPorFirmar.filter((item) => {
    const content = JSON.stringify(item).toLowerCase();
    const status = label(item, ['estado', 'status', 'solEstado', 'estadoSolicitud', 'EstadoSolicitud'], 'pendiente').toLowerCase();
    const rawDate = itemValue(item, ['fecha', 'fechaCreacion', 'createdAt', 'fechaSolicitud', 'solFechaSolicitud', 'SolFechaSolicitud']).toLowerCase();
    return (!historialQuery.trim() || content.includes(historialQuery.trim().toLowerCase()))
      && (!historialDate.trim() || rawDate.includes(historialDate.trim().toLowerCase()))
      && (!historialStatus.trim() || status.includes(historialStatus.trim().toLowerCase()));
  });
  const historialSolicitudes = solicitudes.filter((item) => {
    const status = label(item, ['estado', 'status', 'solEstado', 'estadoSolicitud', 'EstadoSolicitud'], '').toLowerCase();
    return Boolean(status) && (status.includes('firmad') || status.includes('aprob') || status.includes('caduc') || status.includes('rechaz'));
  });
  const solicitudHistoryItems = historialSolicitudes.length ? historialSolicitudes : solicitudes;
  const filteredHistorialSolicitudes = solicitudHistoryItems.filter((item) => {
    const content = JSON.stringify(item).toLowerCase();
    const status = label(item, ['estado', 'status', 'solEstado', 'estadoSolicitud', 'EstadoSolicitud', 'estadoUanataca', 'SolUanatacaStatusText', 'estadoPago'], '').toLowerCase();
    const rawDate = itemValue(item, ['fecha', 'fechaCreacion', 'createdAt', 'fechaSolicitud', 'solFechaSolicitud', 'SolFechaSolicitud']).toLowerCase();
    return (!historialQuery.trim() || content.includes(historialQuery.trim().toLowerCase()))
      && (!historialDate.trim() || rawDate.includes(historialDate.trim().toLowerCase()))
      && (!historialStatus.trim() || status.includes(historialStatus.trim().toLowerCase()));
  });
  const solicitudesPagadas = solicitudHistoryItems.filter((item) => {
    const status = label(item, ['estadoPago', 'pago', 'estado', 'status', 'estadoSolicitud', 'EstadoSolicitud'], '').toLowerCase();
    return status.includes('pag') || status.includes('aprob');
  }).length;
  const solicitudesPendientes = solicitudHistoryItems.filter((item) => {
    const status = label(item, ['estadoPago', 'pago', 'estado', 'status', 'estadoSolicitud', 'EstadoSolicitud'], 'pendiente').toLowerCase();
    return status.includes('pend');
  }).length;
  const totalHistorialSolicitudesPages = Math.max(1, Math.ceil(filteredHistorialSolicitudes.length / 10));
  const paginaHistorialSolicitudes = Math.min(historialSolicitudesPage, totalHistorialSolicitudesPages);
  const historialSolicitudesPagina = filteredHistorialSolicitudes.slice((paginaHistorialSolicitudes - 1) * 10, paginaHistorialSolicitudes * 10);
  const cargarFirmaActiva = async (mostrarError = false) => {
    try {
      setLoadingFirmaDetalle(true);
      const emisores = (await getERubricaEmisores()).filter((item) => item.id > 0);
      setFirmaEmisores(emisores);
      const emisorActivo = emisores.find((item) => item.tieneCertificado && item.tieneClave) ?? null;
      setFirmaDetalleActiva(emisorActivo ? await getERubricaFirmaEstado(emisorActivo.id) : null);
    } catch (error) {
      setFirmaDetalleActiva(null);
      if (mostrarError) Alert.alert('No se pudo actualizar la firma', error instanceof ApiError ? error.message : 'Intenta nuevamente.');
    } finally {
      setFirmaEmisoresCargados(true);
      setLoadingFirmaDetalle(false);
    }
  };
  useEffect(() => {
    if ((tab === 'catalogos' || tab === 'plan-disponible' || tab === 'nueva-solicitud') && catalogos.length === 0) {
      void Promise.all([getERubricaProductos(), getERubricaSaldo()]).then(([items, balance]) => {
        setCatalogos(items ?? []);
        setSaldo(Number(balance?.balance ?? 0));
      }).catch(() => undefined);
    }
    if ((tab === 'renovacion' || tab === 'plan-disponible' || tab === 'nueva-solicitud') && renovacion === null) void getERubricaRenovacion().then(setRenovacion).catch(() => undefined);
    if (tab === 'plan-disponible' && planDisponible === null) void getERubricaPlan().then(setPlanDisponible).catch(() => undefined);
    if (tab === 'firma-config' && !firmaEmisoresCargados) void cargarFirmaActiva();
  }, [catalogos.length, firmaEmisoresCargados, renovacion, tab]);
  const cargarDocumentosFirmados = async () => {
    try {
      setLoadingDocumentosFirmados(true);
      setDocumentosFirmados(await getERubricaDocumentosFirmados());
    } catch (error) {
      Alert.alert('No se pudo cargar el historial', error instanceof ApiError ? error.message : 'Intenta nuevamente.');
    } finally {
      setLoadingDocumentosFirmados(false);
    }
  };
  useEffect(() => {
    if (tab === 'historial-documentos' || tab === 'validar-firma') void cargarDocumentosFirmados();
  }, [tab]);
  const cargarDocumentosPendientes = async () => {
    try {
      setLoadingDocumentosPendientes(true);
      setDocumentosPendientes(await getERubricaDocumentosPendientes());
    } catch (error) {
      Alert.alert('No se pudieron cargar los documentos', error instanceof ApiError ? error.message : 'Intenta nuevamente.');
    } finally {
      setLoadingDocumentosPendientes(false);
    }
  };
  useEffect(() => {
    if (tab === 'documentos-por-firmar') void cargarDocumentosPendientes();
  }, [tab]);
  const useSignedDocumentForValidation = async (item: unknown) => {
    const documentName = label(item, ['nombreDocumento', 'documento', 'archivo', 'fileName'], 'Documento firmado.pdf');
    const documentUrl = itemValue(item, ['url', 'downloadUrl', 'documentoUrl', 'ruta', 'archivoUrl']);
    if (!documentUrl) {
      Alert.alert('Documento no disponible', 'No se encontró el archivo PDF para validar.');
      return;
    }

    try {
      setLoadingSignedDocument(true);
      const url = documentUrl.startsWith('http')
        ? documentUrl
        : `${API_BASE_URL.replace(/\/$/, '')}/${documentUrl.replace(/^\//, '')}`;
      if (!url) throw new Error('empty-url');
      const directory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!directory) throw new Error('missing-directory');
      const safeName = buildDeviceFileName(documentName, '.pdf');
      const cookie = getAuthSessionCookie();
      const download = await FileSystem.downloadAsync(url, `${directory}validar-${Date.now()}-${safeName}`, cookie ? { headers: { Cookie: cookie } } : undefined);
      setPdfFile({ uri: download.uri, name: documentName, mimeType: 'application/pdf' });
      setPdfValidation(null);
      setSignedDocumentsModalOpen(false);
      return true;
    } catch (error) {
      Alert.alert('No se pudo cargar el documento', error instanceof ApiError ? error.message : 'No se pudo descargar el PDF firmado.');
      return false;
    } finally {
      setLoadingSignedDocument(false);
    }
  };
  const validarDocumentoFirmado = async (item: ERubricaDocumentoFirmado) => {
    if (await useSignedDocumentForValidation(item)) selectTab('validar-firma');
  };
  const sincronizarSolicitudHistorial = async (solicitudId: number) => {
    try {
      setSyncingSolicitudId(solicitudId);
      await sincronizarERubricaSolicitud(solicitudId);
      onRefresh();
    } catch (error) {
      Alert.alert('No se pudo actualizar la solicitud', error instanceof ApiError ? error.message : 'Intenta nuevamente.');
    } finally {
      setSyncingSolicitudId(null);
    }
  };
  const descargarFirmaSolicitud = async (solicitudId: number) => {
    try {
      const result = await descargarERubricaFirmaP12(solicitudId);
      const uri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}firma-${solicitudId}.p12`;
      await FileSystem.writeAsStringAsync(uri, arrayBufferToBase64(result.bytes), { encoding: FileSystem.EncodingType.Base64 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/x-pkcs12', dialogTitle: 'Guardar firma .p12' });
    } catch (error) {
      Alert.alert('No se pudo descargar la firma', error instanceof ApiError ? error.message : 'La firma aún no está disponible.');
    }
  };
  const usarDocumentoPendiente = async (documento: ERubricaDocumentoPendiente) => {
    try {
      setLoadingDocumentosPendientes(true);
      const url = getDocumentAssetUrl(documento.url);
      const directory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!url || !directory) throw new Error('missing-document');
      const cookie = getAuthSessionCookie();
      const download = await FileSystem.downloadAsync(url, `${directory}firmar-${Date.now()}-${buildDeviceFileName(documento.nombreDocumento, '.pdf')}`, cookie ? { headers: { Cookie: cookie } } : undefined);
      setPdfFile({ uri: download.uri, name: documento.nombreDocumento, mimeType: 'application/pdf' });
      setDocumentoPendienteSeleccionado(documento.nombreArchivo);
      setSignedFileUri(null);
      setSignaturePage(1);
      setSignaturePageCount(1);
      setSignaturePosition({ x: 0.68, y: 0.82 });
      selectTab('firmar');
    } catch (error) {
      Alert.alert('No se pudo abrir el documento', error instanceof ApiError ? error.message : 'No se pudo descargar el PDF seleccionado.');
    } finally {
      setLoadingDocumentosPendientes(false);
    }
  };
  const cargarNuevoDocumentoPendiente = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (result.canceled) return;
    const file = result.assets[0];
    if (!file.name.toLowerCase().endsWith('.pdf') || (file.size ?? 0) > 10 * 1024 * 1024) {
      Alert.alert('Archivo no válido', 'Selecciona un PDF de máximo 10 MB.');
      return;
    }
    try {
      setLoadingDocumentosPendientes(true);
      const uploaded = await cargarERubricaDocumentoPendiente(file);
      setDocumentosPendientes((current) => [uploaded, ...current]);
    } catch (error) {
      Alert.alert('No se pudo cargar el documento', error instanceof ApiError ? error.message : 'Intenta nuevamente.');
    } finally {
      setLoadingDocumentosPendientes(false);
    }
  };
  const eliminarDocumentoPendiente = async (documento: ERubricaDocumentoPendiente) => {
    Alert.alert('Eliminar documento', `¿Deseas eliminar ${documento.nombreDocumento}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: () => {
          void eliminarERubricaDocumentoPendiente(documento.nombreArchivo)
            .then(() => setDocumentosPendientes((current) => current.filter((item) => item.nombreArchivo !== documento.nombreArchivo)))
            .catch((error) => Alert.alert('No se pudo eliminar', error instanceof ApiError ? error.message : 'Intenta nuevamente.'));
        },
      },
    ]);
  };
  const saveConfiguredSignature = async () => {
    const emisorId = firmaEmisores[0]?.id;
    if (!certificateFile || !certificatePassword.trim()) {
      if (firmaEfact) {
        Alert.alert(firmaEfactValida ? 'Firma vigente' : 'Firma configurada', firmaEfactValida ? 'Ya estás usando la firma configurada en E-Fact.' : 'La firma existente requiere revisión antes de usarla.');
        return;
      }
      Alert.alert('Datos incompletos', 'Selecciona el archivo .p12 e ingresa la clave.');
      return;
    }
    if (!emisorId) {
      Alert.alert('Emisor no disponible', 'No existe un emisor activo para configurar la firma.');
      return;
    }
    try {
      setSavingConfiguredSignature(true);
      await configurarERubricaFirma(emisorId, certificateFile, certificatePassword.trim());
      setCertificateFile(null);
      setCertificatePassword('');
      await cargarFirmaActiva();
      onRefresh();
      Alert.alert('Firma configurada', 'El certificado fue validado y guardado correctamente.');
    } catch (error) {
      Alert.alert('No se pudo guardar la firma', error instanceof ApiError ? error.message : 'Verifica el certificado y su clave.');
    } finally {
      setSavingConfiguredSignature(false);
    }
  };
  const validarFirmaTemporal = async () => {
    if (!certificateFile || !certificatePassword.trim()) {
      Alert.alert('Datos incompletos', 'Selecciona el archivo .p12 e ingresa la clave.');
      return;
    }
    try {
      setValidandoFirmaTemporal(true);
      const resultado = await validarERubricaFirmaTemporal(certificateFile, certificatePassword.trim());
      Alert.alert(resultado.esValida ? 'Firma válida' : 'Firma no válida', resultado.mensaje || (resultado.esValida ? 'La firma y la clave son correctas. El archivo no fue guardado.' : 'Verifica el archivo y su clave.'));
    } catch (error) {
      Alert.alert('No se pudo validar la firma', error instanceof ApiError ? error.message : 'Verifica el archivo y su clave.');
    } finally {
      setCertificateFile(null);
      setCertificatePassword('');
      setValidandoFirmaTemporal(false);
    }
  };
  const pickPdfToSign = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (!result.canceled) {
      const file = result.assets[0];
      if (!file.name.toLowerCase().endsWith('.pdf') || (file.size ?? 0) > 15 * 1024 * 1024) {
        Alert.alert('Archivo no válido', 'Selecciona un PDF de máximo 15 MB.');
        return;
      }
      setPdfFile(file);
      setDocumentoPendienteSeleccionado(null);
      setSignedFileUri(null);
      setSignaturePage(1);
      setSignaturePageCount(1);
      setSignaturePosition({ x: 0.68, y: 0.82 });
    }
  };
  const pickCertificate = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/x-pkcs12', 'application/pkcs12', 'application/octet-stream'], copyToCacheDirectory: true });
    if (!result.canceled) {
      const file = result.assets[0];
      if (!file.name.toLowerCase().endsWith('.p12') || (file.size ?? 0) > 5 * 1024 * 1024) {
        Alert.alert('Certificado no válido', 'Selecciona un archivo .p12 de máximo 5 MB.');
        return;
      }
      setCertificateFile(file);
    }
  };
  const signPdfDocument = async (preview = false) => {
    if (!pdfFile) {
      Alert.alert('Datos incompletos', 'Selecciona un PDF válido.');
      return;
    }
    setSigning(true);
    setSignedFileUri(null);
    try {
      const form = new FormData();
      appendERubricaFile(form, 'pdf', { uri: pdfFile.uri, name: pdfFile.name || 'documento.pdf' });
      form.append('pagina', String(signaturePage));
      const signatureWidthMm = 60;
      const signatureHeightMm = 35;
      const xMm = Math.min(Math.max(0, signaturePageSize.widthMm - signatureWidthMm), Math.max(0, signaturePosition.x * signaturePageSize.widthMm - signatureWidthMm / 2));
      const yMm = Math.min(Math.max(0, signaturePageSize.heightMm - signatureHeightMm), Math.max(0, signaturePosition.y * signaturePageSize.heightMm - signatureHeightMm / 2));
      form.append('xMm', xMm.toFixed(2));
      form.append('yMm', yMm.toFixed(2));
      form.append('anchoMm', '60');
      if (documentoPendienteSeleccionado) form.append('documentoPendiente', documentoPendienteSeleccionado);
      const result = await firmarERubricaDocumento(form);
      const base64 = arrayBufferToBase64(result.bytes);
      const uri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}documento-firmado-${Date.now()}.pdf`;
      await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
      if (preview) {
        onPreviewPdf({ uri, name: `${pdfFile.name.replace(/\.pdf$/i, '')}-vista-previa-firmada.pdf`, mimeType: 'application/pdf' });
      } else {
        setSignedFileUri(uri);
        if (documentoPendienteSeleccionado) {
          setDocumentosPendientes((current) => current.filter((item) => item.nombreArchivo !== documentoPendienteSeleccionado));
          setDocumentoPendienteSeleccionado(null);
        }
        Alert.alert('Documento firmado', 'El PDF se firmó correctamente. Ya puedes compartirlo.');
      }
    } catch (error) {
      Alert.alert('No se pudo firmar', error instanceof ApiError ? error.message : 'Verifica los archivos y la clave del certificado.');
    } finally { setSigning(false); }
  };
  const validatePdfSignature = async () => {
    if (!pdfFile) {
      Alert.alert('Selecciona un PDF', 'Carga primero el documento que deseas validar.');
      return;
    }
    setValidatingPdf(true);
    setPdfValidation(null);
    try { setPdfValidation(await validarERubricaFirmaPdf(pdfFile)); }
    catch (error) { setPdfValidation({ mensaje: error instanceof ApiError ? error.message : 'No se pudo validar el PDF.' }); }
    finally { setValidatingPdf(false); }
  };
  const shareSignedDocument = async () => {
    if (!signedFileUri) return;
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('No disponible', 'Este dispositivo no permite compartir archivos.');
      return;
    }
    await Sharing.shareAsync(signedFileUri, { mimeType: 'application/pdf', dialogTitle: 'Compartir documento firmado', UTI: 'com.adobe.pdf' });
  };
  const solicitudSubtotal = solicitudPlan.price;
  const solicitudIva = Number((solicitudSubtotal * 0.15).toFixed(2));
  const solicitudTotal = Number((solicitudSubtotal + solicitudIva).toFixed(2));
  const parseSolicitudAge = () => {
    const parts = solicitudForm.fechaNacimiento.trim().split(/[/-]/).map((part) => Number(part));
    if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return 0;
    const [day, month, year] = parts[0] > 31 ? [parts[2], parts[1], parts[0]] : parts;
    const birth = new Date(year, month - 1, day);
    if (Number.isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (birth > new Date(today.getFullYear() - age, today.getMonth(), today.getDate())) age -= 1;
    return age;
  };
  const solicitudDocumentoItems = [
    { key: 'cedulaFrontal' as SolicitudDocumentoKey, label: 'Documento de identificación frontal *', types: ['image/*', 'application/pdf'] },
    { key: 'cedulaPosterior' as SolicitudDocumentoKey, label: 'Documento de identificación posterior *', types: ['image/*', 'application/pdf'] },
    { key: 'selfieCedula' as SolicitudDocumentoKey, label: 'Selfie sosteniendo su documento *', types: ['image/*'] },
    ...(parseSolicitudAge() >= 65 ? [{ key: 'videoAceptacion' as SolicitudDocumentoKey, label: 'Video de aceptación *', types: ['video/*'] }] : []),
    ...(solicitudForm.poseeRuc || solicitudPersona === 'Representante legal' ? [{ key: 'rucFile' as SolicitudDocumentoKey, label: 'Archivo RUC *', types: ['application/pdf'] }] : []),
    ...(solicitudPersona === 'Representante legal' ? [
      { key: 'nombramiento' as SolicitudDocumentoKey, label: 'Nombramiento *', types: ['application/pdf'] },
      { key: 'constitucion' as SolicitudDocumentoKey, label: 'Constitución *', types: ['application/pdf'] },
      { key: 'cedulaRepresentante' as SolicitudDocumentoKey, label: 'Cédula del representante *', types: ['image/*', 'application/pdf'] },
      { key: 'autorizacion' as SolicitudDocumentoKey, label: 'Autorización *', types: ['application/pdf'] },
      { key: 'aceptacionNombramiento' as SolicitudDocumentoKey, label: 'Aceptación de nombramiento *', types: ['application/pdf'] },
    ] : []),
    { key: 'archivoAdicional' as SolicitudDocumentoKey, label: 'Documento adicional', types: ['image/*', 'application/pdf'] },
  ];
  const pickSolicitudFile = async (key: SolicitudDocumentoKey, types: string[]) => {
    const result = await DocumentPicker.getDocumentAsync({ type: types, copyToCacheDirectory: true });
    if (!result.canceled) {
      const file = result.assets[0];
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      const allowedExtensions = key === 'videoAceptacion'
        ? ['mp4', 'mov', 'avi', 'webm']
        : key === 'selfieCedula'
          ? ['jpg', 'jpeg', 'png']
          : ['jpg', 'jpeg', 'png', 'pdf'];
      const mustBePdf = ['rucFile', 'nombramiento', 'constitucion', 'autorizacion', 'aceptacionNombramiento'].includes(key);
      const maxBytes = key === 'videoAceptacion' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (!allowedExtensions.includes(extension) || (mustBePdf && extension !== 'pdf') || (file.size ?? 0) <= 0 || (file.size ?? 0) > maxBytes) {
        Alert.alert('Archivo no válido', key === 'videoAceptacion'
          ? 'Selecciona un video MP4, MOV, AVI o WEBM de máximo 50 MB.'
          : mustBePdf
            ? 'Selecciona un PDF válido de máximo 10 MB.'
            : 'Selecciona un archivo válido de máximo 10 MB.');
        return;
      }
      setSolicitudId(null);
      setSolicitudFiles((current) => ({ ...current, [key]: file }));
    }
  };
  const appendSolicitudFile = (form: FormData, key: SolicitudDocumentoKey, fieldName: string) => {
    const file = solicitudFiles[key];
    if (!file) return;
    form.append(fieldName, { uri: file.uri, name: file.name || `${fieldName}.jpg`, type: file.mimeType || 'application/octet-stream' } as unknown as Blob);
  };
  const buildSolicitudFormData = () => {
    const form = new FormData();
    form.append('vigencia', solicitudPlan.label);
    form.append('tipoPersona', solicitudPersona);
    form.append('tipoDocumento', solicitudForm.tipoDocumento);
    form.append('identificacion', solicitudForm.identificacion);
    form.append('codigoDactilar', solicitudForm.codigoDactilar);
    form.append('poseeRuc', String(solicitudPersona === 'Representante legal' || solicitudForm.poseeRuc));
    form.append('ruc', solicitudForm.ruc);
    form.append('nombres', solicitudForm.nombres);
    form.append('primerApellido', solicitudForm.primerApellido);
    form.append('segundoApellido', solicitudForm.segundoApellido);
    form.append('fechaNacimiento', solicitudForm.fechaNacimiento);
    form.append('sexo', solicitudForm.sexo);
    form.append('nacionalidad', solicitudForm.nacionalidad);
    form.append('celular', solicitudForm.celular);
    form.append('correo', solicitudForm.correo);
    form.append('telefonoSecundario', solicitudForm.telefonoSecundario);
    form.append('correoSecundario', solicitudForm.correoSecundario);
    form.append('provincia', solicitudForm.provincia);
    form.append('canton', solicitudForm.canton);
    form.append('direccion', solicitudForm.direccion);
    form.append('razonSocialEmpresa', solicitudForm.razonSocialEmpresa);
    form.append('departamento', solicitudForm.departamento);
    form.append('cargo', solicitudForm.cargo);
    form.append('motivoFirma', solicitudForm.motivoFirma);
    form.append('representanteTipoDocumento', solicitudForm.representanteTipoDocumento);
    form.append('representanteIdentificacion', solicitudForm.representanteIdentificacion);
    form.append('representanteNombres', solicitudForm.representanteNombres);
    form.append('representanteApellidos', solicitudForm.representanteApellidos);
    appendSolicitudFile(form, 'cedulaFrontal', 'cedulaFrontal');
    appendSolicitudFile(form, 'cedulaPosterior', 'cedulaPosterior');
    appendSolicitudFile(form, 'selfieCedula', 'selfieCedula');
    appendSolicitudFile(form, 'videoAceptacion', 'videoAceptacion');
    appendSolicitudFile(form, 'rucFile', 'rucFile');
    appendSolicitudFile(form, 'nombramiento', 'nombramiento');
    appendSolicitudFile(form, 'constitucion', 'constitucion');
    appendSolicitudFile(form, 'cedulaRepresentante', 'cedulaRepresentante');
    appendSolicitudFile(form, 'autorizacion', 'autorizacion');
    appendSolicitudFile(form, 'aceptacionNombramiento', 'aceptacionNombramiento');
    appendSolicitudFile(form, 'archivoAdicional', 'archivoAdicional');
    return form;
  };
  const validateSolicitudBeforePayment = () => {
    if (!solicitudForm.tipoDocumento.trim() || !solicitudForm.identificacion.trim() || !solicitudForm.codigoDactilar.trim() || !solicitudForm.nombres.trim() || !solicitudForm.primerApellido.trim() || !solicitudForm.fechaNacimiento.trim() || !solicitudForm.sexo.trim() || !solicitudForm.celular.trim() || !solicitudForm.correo.trim() || !solicitudForm.provincia.trim() || !solicitudForm.canton.trim() || !solicitudForm.direccion.trim()) {
      Alert.alert('Datos incompletos', 'Completa los datos obligatorios del solicitante.');
      return false;
    }
    if (parseSolicitudAge() < 18) {
      Alert.alert('Edad no válida', 'El solicitante debe ser mayor de edad.');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(solicitudForm.correo.trim())) {
      Alert.alert('Correo no válido', 'Ingresa un correo principal válido.');
      return false;
    }
    if (/c[eé]dula/i.test(solicitudForm.tipoDocumento) && !/^\d{10}$/.test(solicitudForm.identificacion.trim())) {
      Alert.alert('Identificación no válida', 'La cédula debe contener 10 dígitos.');
      return false;
    }
    if ((solicitudPersona === 'Representante legal' || solicitudForm.poseeRuc) && !/^\d{13}$/.test(solicitudForm.ruc.trim())) {
      Alert.alert('RUC no válido', 'Ingresa un RUC de 13 dígitos.');
      return false;
    }
    if (solicitudPersona === 'Representante legal' && (!solicitudForm.razonSocialEmpresa.trim() || !solicitudForm.departamento.trim() || !solicitudForm.cargo.trim() || !solicitudForm.motivoFirma.trim() || !solicitudForm.representanteTipoDocumento.trim() || !solicitudForm.representanteIdentificacion.trim() || !solicitudForm.representanteNombres.trim() || !solicitudForm.representanteApellidos.trim())) {
      Alert.alert('Datos incompletos', 'Completa los datos de empresa y representante legal.');
      return false;
    }
    const missingFile = solicitudDocumentoItems.find((item) => item.label.includes('*') && !solicitudFiles[item.key]);
    if (missingFile) {
      Alert.alert('Documento pendiente', `Adjunta: ${missingFile.label.replace(' *', '')}.`);
      return false;
    }
    return true;
  };
  const openPaymentSummary = async () => {
    if (!validateSolicitudBeforePayment()) return;
    setSolicitudSaving(true);
    try {
      const response = await crearERubricaSolicitud(buildSolicitudFormData());
      const createdId = Number((response as Record<string, unknown>).solicitudId);
      if (!createdId) throw new Error('empty-solicitud-id');
      setSolicitudId(createdId);
      setPaymentModalOpen(true);
    } catch (error) {
      Alert.alert('No se pudo crear la solicitud', error instanceof ApiError ? error.message : 'Revisa los datos y documentos adjuntos.');
    } finally {
      setSolicitudSaving(false);
    }
  };
  const pickTransferReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.82 });
    const asset = !result.canceled ? result.assets[0] : null;
    if (!asset) return;
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      Alert.alert('Comprobante no valido', 'Selecciona una imagen JPG o PNG de maximo 5MB.');
      return;
    }
    setTransferReceipt(asset);
  };
  const payERubricaRequest = async () => {
    setPaymentLoading(true);
    try {
      if (!solicitudId) {
        Alert.alert('Solicitud pendiente', 'Primero crea la solicitud para continuar con el pago.');
        return;
      }
      if (paymentMethod === 'deuna') {
        const payment = await iniciarPagoERubricaSolicitud(solicitudId);
        const url = payment.paymentUrl ?? payment.checkoutUrl ?? payment.url;
        if (!url) throw new Error('empty-payment-url');
        await Linking.openURL(url);
        setPaymentModalOpen(false);
        Alert.alert('Pago en línea', 'Checkout abierto. La solicitud se acreditará al aprobarse el pago.');
        return;
      }
      if (!transferForm.banco || !transferForm.titular.trim() || !transferForm.cuenta.trim() || !transferForm.comprobante.trim() || !transferReceipt) {
        Alert.alert('Transferencia incompleta', 'Completa los datos de pago y adjunta el comprobante.');
        return;
      }
      const form = new FormData();
      form.append('solicitudId', String(solicitudId));
      form.append('banco', transferForm.banco);
      form.append('titularCuenta', transferForm.titular.trim());
      form.append('cuentaOrigen', transferForm.cuenta.trim());
      form.append('numeroComprobante', transferForm.comprobante.trim());
      form.append('comprobante', { uri: transferReceipt.uri, name: transferReceipt.fileName || 'comprobante.jpg', type: transferReceipt.mimeType || 'image/jpeg' } as unknown as Blob);
      await enviarTransferenciaERubricaSolicitud(form);
      setPaymentModalOpen(false);
      Alert.alert('Transferencia enviada', 'Tu comprobante fue enviado para validación.');
    } catch (error) {
      Alert.alert('No se pudo procesar el pago', error instanceof ApiError ? error.message : 'Revisa la información e intenta nuevamente.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <View style={styles.portalStack}>
      {message ? <MessageBox message={message} /> : null}

      {tab === 'inicio' ? (
        <View style={styles.clientCard}>
          <Text style={styles.clientDetailLabel}>Resumen de E-Rúbrica</Text>
          <Text style={styles.clientMeta}>Abre el menú hamburguesa para ingresar a cada módulo de E-Rúbrica.</Text>
        </View>
      ) : null}

      {loading ? <View style={styles.directoryLoading}><ActivityIndicator color={ERUBRICA_COLORS.primary} /><Text style={styles.mutedText}>Cargando E-Rúbrica...</Text></View> : null}
      {tab === 'firmar' ? (
        <View style={styles.erubricaSignFlow}>
          <View style={styles.erubricaSignCard}>
            <View style={styles.erubricaSignHeader}>
              <View style={styles.erubricaSignTitleBlock}>
                <Text style={styles.erubricaSignStep}>1. PDF a estampar</Text>
                <Text style={styles.erubricaSignHint}>Selecciona el archivo PDF que recibirá el sello.</Text>
              </View>
              {pdfFile ? (
                <View style={styles.erubricaLoadedBadge}>
                  <MaterialCommunityIcons name="folder-check-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.erubricaLoadedBadgeText}>Cargado</Text>
                </View>
              ) : null}
            </View>
            <Pressable style={styles.erubricaDropzone} onPress={pickPdfToSign}>
              <View style={styles.erubricaDropIcon}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={24} color={ERUBRICA_COLORS.primary} />
              </View>
              <Text style={styles.erubricaDropTitle}>{pdfFile ? pdfFile.name : 'Arrastra tu archivo PDF aquí'}</Text>
              <Text style={styles.erubricaDropText}>o selecciona un archivo</Text>
              <View style={styles.erubricaDropButton}>
                <MaterialCommunityIcons name="file-pdf-box" size={18} color="#FFFFFF" />
                <Text style={styles.erubricaDropButtonText}>Seleccionar PDF</Text>
              </View>
              <Text style={styles.erubricaDropMeta}>Formato PDF · Máx. 10 MB</Text>
            </Pressable>
          </View>

          <View style={styles.erubricaSignCard}>
            <View style={styles.erubricaSignHeader}>
              <View style={styles.erubricaSignTitleBlock}>
                <Text style={styles.erubricaSignStep}>2. Ubicación de la firma</Text>
                <Text style={styles.erubricaSignHint}>Haz clic o arrastra para mover la firma. El ancho se mantiene fijo en 60 mm.</Text>
              </View>
            </View>
            <View style={styles.erubricaValidationStrip}>
              <MaterialCommunityIcons name="information-outline" size={16} color={ERUBRICA_COLORS.primary} />
              <Text style={styles.erubricaValidationStripText}>Haz clic o arrastra en el documento para seleccionar la posición de la firma.</Text>
            </View>
            {pdfFile ? (
              <PdfSignaturePositionPicker pdfUri={pdfFile.uri} page={signaturePage} pageCount={signaturePageCount} position={signaturePosition} pageSize={signaturePageSize} onPageChange={setSignaturePage} onPageCountChange={setSignaturePageCount} onPositionChange={setSignaturePosition} onPageSizeChange={setSignaturePageSize} />
            ) : (
              <View style={styles.erubricaEmptyPreview}>
                <View style={styles.erubricaPreviewSidebar}>
                  <View style={styles.erubricaPreviewThumb}>
                    <View style={styles.erubricaPreviewLine} />
                    <View style={[styles.erubricaPreviewLine, styles.erubricaPreviewLineShort]} />
                  </View>
                  <Text style={styles.erubricaPreviewPage}>1</Text>
                </View>
                <View style={styles.erubricaPreviewCenter}>
                  <MaterialCommunityIcons name="robot-happy-outline" size={42} color={ERUBRICA_COLORS.primary} />
                  <Text style={styles.erubricaPreviewTitle}>Vista previa del documento</Text>
                  <Text style={styles.erubricaPreviewText}>Después de cargar el PDF, haz clic sobre la página.</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.erubricaAdviceCard}>
            <View style={styles.erubricaAdviceHeader}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#D77416" />
              <Text style={styles.erubricaAdviceTitle}>Consejos y validación</Text>
            </View>
            {['Coloca la firma en un área visible del documento.', 'Evita márgenes y textos importantes.', 'El ancho de la firma se mantiene fijo en 60 mm.', 'Asegúrate de que el área seleccionada sea visible al imprimir.'].map((tip) => (
              <View key={tip} style={styles.erubricaAdviceRow}>
                <MaterialCommunityIcons name="check-circle-outline" size={15} color={ERUBRICA_COLORS.primary} />
                <Text style={styles.erubricaAdviceText}>{tip}</Text>
              </View>
            ))}
          </View>

          {validatingPdf ? <ActivityIndicator color={ERUBRICA_COLORS.primary} /> : null}
          {pdfValidation ? <Text style={styles.clientDetailValue}>{JSON.stringify(pdfValidation, null, 2)}</Text> : null}

          <View style={styles.erubricaSignActions}>
            <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Limpiar formulario" onPress={() => {
              setPdfFile(null);
              setCertificateFile(null);
              setCertificatePassword('');
              setSignedFileUri(null);
              setDocumentoPendienteSeleccionado(null);
              setPdfValidation(null);
              setSignaturePage(1);
              setSignaturePageCount(1);
              setSignaturePosition({ x: 0.68, y: 0.82 });
            }} />
            <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Estampar PDF" loading={signing} onPress={signPdfDocument} />
          </View>
          {signedFileUri ? <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Compartir documento firmado" loading={false} onPress={shareSignedDocument} /> : null}
        </View>
      ) : null}
      {tab === 'validar-firma' ? (
        <View style={styles.erubricaSignFlow}>
          <View style={styles.erubricaValidatePanel}>
            <View style={styles.erubricaValidateHeader}>
              <View style={styles.erubricaValidateTitleRow}>
                <MaterialCommunityIcons name="file-lock-outline" size={18} color={ERUBRICA_COLORS.text} />
                <Text style={styles.erubricaSignStep}>Documento firmado en PDF</Text>
              </View>
              <Pressable style={styles.erubricaSignedDocsButton} onPress={() => setSignedDocumentsModalOpen(true)}>
                <MaterialCommunityIcons name="folder-lock-outline" size={15} color="#FFFFFF" />
                <Text style={styles.erubricaSignedDocsText}>Documentos Firmados</Text>
              </Pressable>
            </View>

            <Pressable style={styles.erubricaDropzone} onPress={pickPdfToSign}>
              <View style={styles.erubricaDropIcon}>
                <MaterialCommunityIcons name="file-pdf-box" size={27} color={ERUBRICA_COLORS.primary} />
              </View>
              <Text style={styles.erubricaDropTitle}>{pdfFile ? pdfFile.name : 'Arrastra tu archivo PDF aquí'}</Text>
              <Text style={styles.erubricaDropText}>o selecciona un archivo desde tu dispositivo</Text>
              <View style={styles.erubricaDropButton}>
                <MaterialCommunityIcons name="file-upload-outline" size={18} color="#FFFFFF" />
                <Text style={styles.erubricaDropButtonText}>Seleccionar PDF</Text>
              </View>
              <View style={styles.erubricaValidateMetaRow}>
                <View style={styles.erubricaValidateMetaItem}>
                  <MaterialCommunityIcons name="file-pdf-box" size={18} color={ERUBRICA_COLORS.primary} />
                  <Text style={styles.erubricaDropMeta}>Formato: PDF</Text>
                </View>
                <View style={styles.erubricaValidateMetaItem}>
                  <MaterialCommunityIcons name="clock-outline" size={18} color={ERUBRICA_COLORS.primary} />
                  <Text style={styles.erubricaDropMeta}>Máximo: 10 MB</Text>
                </View>
                <View style={styles.erubricaValidateMetaItem}>
                  <MaterialCommunityIcons name="file-document-outline" size={18} color={ERUBRICA_COLORS.primary} />
                  <Text style={styles.erubricaDropMeta}>Páginas: ilimitado</Text>
                </View>
              </View>
            </Pressable>

            {pdfFile ? <PdfDocumentPreview uri={pdfFile.uri} /> : (
              <View style={styles.erubricaEmptyPreview}>
                <View style={styles.erubricaPreviewCenter}>
                  <MaterialCommunityIcons name="file-pdf-box" size={34} color={ERUBRICA_COLORS.primary} />
                  <Text style={styles.erubricaPreviewTitle}>Previsualización del PDF</Text>
                  <Text style={styles.erubricaPreviewText}>Selecciona un documento firmado para verlo aquí.</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.erubricaValidatePrimaryAction}>
            <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Analizar firma digital" loading={validatingPdf} onPress={validatePdfSignature} />
          </View>

          <View style={styles.erubricaAdviceCard}>
            <View style={styles.erubricaAdviceHeader}>
              <MaterialCommunityIcons name="shield-search" size={18} color={ERUBRICA_COLORS.primary} />
              <Text style={styles.erubricaAdviceTitle}>Qué se verificará</Text>
            </View>
            {['Integridad del documento', 'Certificado digital', 'Revocación OCSP/CRL', 'Sello de tiempo RFC 3161', 'Validez legal'].map((item) => (
              <View key={item} style={styles.erubricaAdviceRow}>
                <MaterialCommunityIcons name="check-decagram-outline" size={16} color={ERUBRICA_COLORS.primary} />
                <Text style={styles.erubricaAdviceText}>{item}</Text>
              </View>
            ))}
          </View>
          {pdfValidation ? (() => {
            const unwrap = (input: unknown): Record<string, unknown> => {
              if (typeof input === 'string') { try { return unwrap(JSON.parse(input)); } catch { return {}; } }
              return input && typeof input === 'object' ? input as Record<string, unknown> : {};
            };
            const root = unwrap(pdfValidation);
            const payload = unwrap(root.data ?? root.Data ?? root);
            const validation = unwrap(payload.validation ?? payload.Validation ?? payload);
            const firmasRaw = validation.firmas ?? validation.Firmas ?? payload.firmas ?? payload.Firmas;
            const firmasValidacion = Array.isArray(firmasRaw) ? firmasRaw.map(unwrap) : [];
            const value = (source: Record<string, unknown>, ...keys: string[]) => {
              const raw = keys.map((key) => source[key]).find((item) => item !== null && item !== undefined && item !== '');
              return raw === true ? 'Sí' : raw === false ? 'No' : String(raw ?? 'No disponible');
            };
            const esValida = Boolean(validation.valido ?? validation.Valido ?? firmasValidacion.every((item) => Boolean(item.valida ?? item.Valida)));
            return <View style={styles.erubricaSignCard}>
              <View style={styles.erubricaConfigStatusCard}><MaterialCommunityIcons name={esValida ? 'check-circle-outline' : 'alert-circle-outline'} size={22} color={esValida ? ERUBRICA_COLORS.primary : '#B7791F'} /><View style={styles.erubricaPendingDocCopy}><Text style={styles.erubricaConfigStatusTitle}>{esValida ? 'Firma válida' : 'Firma con validación inconclusa'}</Text><Text style={styles.erubricaConfigStatusText}>{esValida ? 'El PDF tiene firma digital válida.' : value(validation, 'resumen', 'Resumen', 'mensaje', 'Mensaje')}</Text></View></View>
              <View style={styles.erubricaSignatureInfoGrid}>{[['Firmas', value(validation, 'cantidadFirmas', 'CantidadFirmas')], ['Documento completo', value(validation, 'documentoCompletoCubierto', 'DocumentoCompletoCubierto')]].map(([title, detail]) => <View key={title} style={styles.erubricaSignatureInfoCell}><Text style={styles.erubricaHistoryMetricLabel}>{title}</Text><Text style={styles.erubricaRequestHistoryValue}>{detail}</Text></View>)}</View>
              {firmasValidacion.map((firma, index) => { const certificado = firma.certificadoDesde || firma.CertificadoDesde ? `Vigente: ${formatDocumentDate(String(firma.certificadoDesde ?? firma.CertificadoDesde))} - ${formatDocumentDate(String(firma.certificadoHasta ?? firma.CertificadoHasta))}` : value(firma, 'certificadoVigente', 'CertificadoVigente'); return <View key={`firma-validacion-${index}`} style={styles.erubricaHistoryPanel}><Text style={styles.erubricaSignStep}>Firma {index + 1}</Text><View style={styles.erubricaSignatureInfoGrid}>{[['Firmante', value(firma, 'firmante', 'Firmante')], ['Integridad', value(firma, 'integridadValida', 'IntegridadValida') === 'Sí' ? 'OK' : 'No'], ['Certificado', certificado], ['Revocación', value(firma, 'estadoRevocacion', 'EstadoRevocacion')], ['Sello de tiempo', value(firma, 'selloTiempoValido', 'SelloTiempoValido')]].map(([title, detail]) => <View key={title} style={styles.erubricaSignatureInfoCell}><Text style={styles.erubricaHistoryMetricLabel}>{title}</Text><Text style={styles.erubricaRequestHistoryValue}>{detail}</Text></View>)}</View></View>; })}
            </View>;
          })() : null}
        </View>
      ) : null}
      {tab === 'documentos-por-firmar' ? (
        <View style={styles.erubricaHistoryStack}>
          <View style={styles.erubricaPendingHeader}>
            <View style={styles.erubricaHistoryHeroCopy}>
              <Text style={styles.erubricaHistoryEyebrow}>DOCUMENTOS ELECTRÓNICOS</Text>
              <Text style={styles.erubricaHistoryTitle}>Documentos por Firmar</Text>
              <Text style={styles.erubricaHistorySubtitle}>Administra los PDF subidos y elige el documento que vas a firmar.</Text>
            </View>
            <Pressable style={styles.erubricaPendingLoadButton} onPress={() => void cargarNuevoDocumentoPendiente()}>
              <MaterialCommunityIcons name="folder-upload-outline" size={15} color={ERUBRICA_COLORS.text} />
              <Text style={styles.erubricaPendingLoadText}>{loadingDocumentosPendientes ? 'Cargando...' : 'Cargar documento'}</Text>
            </Pressable>
          </View>


          <View style={styles.erubricaHistoryPanel}>
            <View style={styles.erubricaHistoryFilters}>
              <View style={styles.erubricaHistorySearchBox}>
                <MaterialCommunityIcons name="magnify" size={19} color="#5C748A" />
                <TextInput
                  value={historialQuery}
                  onChangeText={(value) => { setHistorialQuery(value); setHistorialSolicitudesPage(1); }}
                  placeholder="Buscar por nombre de documento..."
                  placeholderTextColor="#8AA0B5"
                  style={styles.erubricaHistoryInput}
                />
              </View>
              <View style={styles.erubricaHistoryFilterRow}>
                <TextInput value={historialDate} onChangeText={setHistorialDate} placeholder="mm/dd/yyyy" placeholderTextColor="#8AA0B5" style={styles.erubricaHistorySmallInput} />
                <TextInput value={historialStatus} onChangeText={setHistorialStatus} placeholder="Todos los estados" placeholderTextColor="#8AA0B5" style={styles.erubricaHistorySmallInput} />
              </View>
              <Pressable style={styles.erubricaHistoryClearButton} onPress={() => { setHistorialQuery(''); setHistorialDate(''); setHistorialStatus(''); }}>
                <MaterialCommunityIcons name="filter-remove-outline" size={15} color={ERUBRICA_COLORS.primary} />
                <Text style={styles.erubricaHistoryClearText}>Limpiar filtros</Text>
              </Pressable>
            </View>
            {documentosPendientes.length === 0 ? <EmptyState title="Sin documentos por firmar" text="Carga un PDF para prepararlo y firmarlo." /> : documentosPendientes.slice(0, 10).map((item, index) => {
              const documentName = item.nombreDocumento;
              const documentCode = item.codigo || `DOC-${index + 1}`;
              const signedDate = formatDocumentDate(item.fecha);
              const status = item.estado || 'Pendiente';
              const previewUrl = item.url;
              return (
                <View key={`erubrica-pendiente-${index}`} style={styles.erubricaPendingRow}>
                  <View style={styles.erubricaPendingPdfBadge}>
                    <Text style={styles.erubricaPendingPdfText}>PDF</Text>
                  </View>
                  <View style={styles.erubricaPendingDocCopy}>
                    <Text style={styles.erubricaHistoryDocName} numberOfLines={2}>{documentName}</Text>
                    <Text style={styles.erubricaHistoryDocMeta} numberOfLines={1}>{documentCode}</Text>
                    <Text style={styles.erubricaHistoryDetailText}>{signedDate}</Text>
                  </View>
                  <View style={styles.erubricaPendingSide}>
                    <View style={styles.erubricaPendingStatusPill}>
                      <Text style={styles.erubricaPendingStatusText}>{status}</Text>
                    </View>
                    <View style={styles.erubricaPendingActionRow}>
                      <Pressable style={styles.erubricaPendingPreviewButton} onPress={() => onPreviewRemotePdf(previewUrl, documentName)}>
                        <MaterialCommunityIcons name="eye-outline" size={17} color={ERUBRICA_COLORS.primary} />
                      </Pressable>
                      <Pressable style={styles.erubricaPendingPreviewButton} onPress={() => eliminarDocumentoPendiente(item)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={17} color="#B4232D" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
            <Text style={styles.erubricaHistoryFooter}>Mostrando {Math.min(documentosPendientes.length, 10)} de {documentosPendientes.length} documentos</Text>
          </View>
        </View>
      ) : null}
      {tab === 'nueva-solicitud' ? (
        <View style={styles.erubricaRequestStack}>
          <View style={styles.erubricaPendingHeader}>
            <View style={styles.erubricaHistoryHeroCopy}>
              <Text style={styles.erubricaHistoryEyebrow}>FIRMA ELECTRÓNICA</Text>
              <Text style={styles.erubricaHistoryTitle}>Nueva solicitud de firma</Text>
              <Text style={styles.erubricaHistorySubtitle}>Completa la información para generar tu solicitud de firma electrónica.</Text>
            </View>
            <Pressable style={styles.erubricaPendingLoadButton} onPress={() => selectTab('historial-solicitudes')}>
              <MaterialCommunityIcons name="account-group-outline" size={15} color={ERUBRICA_COLORS.text} />
              <Text style={styles.erubricaPendingLoadText}>Solicitudes de clientes</Text>
            </Pressable>
          </View>

          <View style={styles.erubricaRequestSteps}>
            {['Configuración', 'Titular', 'Información', 'Revisión', 'Confirmación'].map((step, index) => {
              const active = solicitudStep >= index + 1;
              return (
                <Pressable key={step} style={styles.erubricaRequestStep} onPress={() => setSolicitudStep(index + 1)}>
                  <View style={[styles.erubricaRequestStepCircle, active && styles.erubricaRequestStepCircleActive]}>
                    <Text style={[styles.erubricaRequestStepNumber, active && styles.erubricaRequestStepNumberActive]}>{index + 1}</Text>
                  </View>
                  <Text style={styles.erubricaRequestStepLabel}>{step}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.erubricaRequestPanel}>
            <Text style={styles.erubricaSignStep}>Configura tu firma electrónica</Text>
            <Text style={styles.erubricaSignHint}>Selecciona el formato y la vigencia antes de completar los datos del titular.</Text>
            <View style={styles.erubricaRequestOptionActive}>
              <MaterialCommunityIcons name="file-certificate-outline" size={19} color="#FFFFFF" />
              <View style={styles.erubricaPendingDocCopy}>
                <Text style={styles.erubricaRequestOptionTitle}>Archivo .P12</Text>
                <Text style={styles.erubricaRequestOptionText}>Descargable para usarlo desde tu equipo.</Text>
              </View>
              <MaterialCommunityIcons name="check-circle" size={18} color={ERUBRICA_COLORS.primary} />
            </View>

            <View style={styles.erubricaRequestPlanGrid}>
              {[
                { label: '7 días', price: 9 },
                { label: '30 días', price: 12 },
                { label: '1 año', price: 21 },
                { label: '2 años', price: 31 },
                { label: '3 años', price: 40 },
                { label: '4 años', price: 49 },
                { label: '5 años', price: 57 },
              ].map((plan) => {
                const active = solicitudPlan.label === plan.label;
                return (
                  <Pressable key={plan.label} style={[styles.erubricaRequestPlan, active && styles.erubricaRequestPlanActive]} onPress={() => { setSolicitudPlan(plan); setSolicitudId(null); }}>
                    <Text style={styles.erubricaRequestPlanTitle}>{plan.label}</Text>
                    <Text style={styles.erubricaRequestPlanPrice}>${plan.price.toFixed(2)}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.erubricaRequestTaxNote}>Precios sin IVA. El total final se mostrará en el pago con el IVA correspondiente.</Text>
          </View>

          <View style={styles.erubricaRequestPersonGrid}>
            {['Persona natural con cédula', 'Persona natural con RUC', 'Representante legal'].map((option) => {
              const active = solicitudPersona === option;
              return (
              <Pressable key={option} style={[styles.erubricaRequestPerson, active && styles.erubricaRequestPersonActive]} onPress={() => { setSolicitudPersona(option); setSolicitudForm((current) => ({ ...current, poseeRuc: option !== 'Persona natural con cédula', ruc: option === 'Persona natural con cédula' ? '' : current.ruc })); setSolicitudId(null); }}>
                  <MaterialCommunityIcons name={active ? 'check-circle' : 'card-account-details-outline'} size={18} color={active ? ERUBRICA_COLORS.primary : '#607887'} />
                  <Text style={styles.erubricaRequestOptionTitle}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.erubricaRequestPanel}>
            <Text style={styles.erubricaHistoryEyebrow}>DATOS PERSONALES</Text>
            <Text style={styles.erubricaSignStep}>Completa la información del solicitante</Text>
            <Text style={styles.clientDetailLabel}>Tipo de documento *</Text>
            <View style={styles.erubricaHistorySearchBox}>
              <Picker selectedValue={solicitudForm.tipoDocumento} style={{ flex: 1, color: ERUBRICA_COLORS.text }} onValueChange={(value) => setSolicitudForm((current) => ({ ...current, tipoDocumento: String(value), identificacion: '' }))}>
                <Picker.Item label="Selecciona un documento" value="" />
                <Picker.Item label="Cédula" value="CEDULA" />
                <Picker.Item label="Pasaporte" value="PASAPORTE" />
              </Picker>
            </View>
            <Field label="Identificación *" value={solicitudForm.identificacion} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, identificacion: value }))} />
            <Field label="Código dactilar *" value={solicitudForm.codigoDactilar} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, codigoDactilar: value }))} autoCapitalize="characters" />
            <Text style={styles.clientDetailLabel}>¿Posee RUC?{solicitudPersona === 'Representante legal' ? ' *' : ''}</Text>
            <View style={styles.erubricaPendingActionRow}>
              <Pressable style={[styles.erubricaRequestPerson, (solicitudPersona === 'Representante legal' || solicitudForm.poseeRuc) && styles.erubricaRequestPersonActive]} onPress={() => setSolicitudForm((current) => ({ ...current, poseeRuc: true }))}>
                <MaterialCommunityIcons name={(solicitudPersona === 'Representante legal' || solicitudForm.poseeRuc) ? 'check-circle' : 'circle-outline'} size={18} color={ERUBRICA_COLORS.primary} /><Text style={styles.erubricaRequestOptionTitle}>Sí</Text>
              </Pressable>
              <Pressable disabled={solicitudPersona === 'Representante legal'} style={[styles.erubricaRequestPerson, !(solicitudPersona === 'Representante legal' || solicitudForm.poseeRuc) && styles.erubricaRequestPersonActive]} onPress={() => setSolicitudForm((current) => ({ ...current, poseeRuc: false, ruc: '' }))}>
                <MaterialCommunityIcons name={!(solicitudPersona === 'Representante legal' || solicitudForm.poseeRuc) ? 'check-circle' : 'circle-outline'} size={18} color={ERUBRICA_COLORS.primary} /><Text style={styles.erubricaRequestOptionTitle}>No</Text>
              </Pressable>
            </View>
            {(solicitudPersona === 'Representante legal' || solicitudForm.poseeRuc) ? <Field label="RUC *" value={solicitudForm.ruc} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, ruc: value.replace(/\D/g, '') }))} keyboardType="number-pad" /> : null}
            <Field label="Nombres *" value={solicitudForm.nombres} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, nombres: value }))} />
            <Field label="Primer apellido *" value={solicitudForm.primerApellido} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, primerApellido: value }))} />
            <Field label="Segundo apellido" value={solicitudForm.segundoApellido} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, segundoApellido: value }))} />
            <Text style={styles.clientDetailLabel}>Fecha de nacimiento *</Text>
            <Pressable style={styles.erubricaHistorySearchBox} onPress={() => setShowSolicitudBirthDate(true)}><Text style={[styles.erubricaHistoryInput, !solicitudForm.fechaNacimiento && { color: '#8AA0B5' }]}>{solicitudForm.fechaNacimiento || 'Seleccionar fecha'}</Text><MaterialCommunityIcons name="calendar" size={19} color={ERUBRICA_COLORS.primary} /></Pressable>
            {showSolicitudBirthDate ? <DateTimePicker value={solicitudForm.fechaNacimiento ? new Date(`${solicitudForm.fechaNacimiento}T12:00:00`) : new Date(1990, 0, 1)} mode="date" maximumDate={new Date()} onChange={(_, date) => { setShowSolicitudBirthDate(Platform.OS === 'ios'); if (date) setSolicitudForm((current) => ({ ...current, fechaNacimiento: date.toISOString().slice(0, 10) })); }} /> : null}
            <Text style={styles.clientDetailLabel}>Sexo *</Text>
            <View style={styles.erubricaHistorySearchBox}><Picker selectedValue={solicitudForm.sexo} style={{ flex: 1, color: ERUBRICA_COLORS.text }} onValueChange={(value) => setSolicitudForm((current) => ({ ...current, sexo: String(value) }))}><Picker.Item label="Selecciona" value="" /><Picker.Item label="Femenino" value="F" /><Picker.Item label="Masculino" value="M" /></Picker></View>
            <Field label="Nacionalidad *" value={solicitudForm.nacionalidad} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, nacionalidad: value }))} />
            <Field label="Celular *" value={solicitudForm.celular} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, celular: value }))} keyboardType="phone-pad" />
            <Field label="Correo principal *" value={solicitudForm.correo} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, correo: value }))} autoCapitalize="none" keyboardType="email-address" />
            <Field label="Teléfono secundario" value={solicitudForm.telefonoSecundario} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, telefonoSecundario: value }))} keyboardType="phone-pad" />
            <Field label="Correo secundario" value={solicitudForm.correoSecundario} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, correoSecundario: value }))} autoCapitalize="none" keyboardType="email-address" />
            <Field label="Provincia *" value={solicitudForm.provincia} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, provincia: value }))} />
            <Field label="Cantón *" value={solicitudForm.canton} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, canton: value }))} />
            <Field label="Dirección *" value={solicitudForm.direccion} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, direccion: value }))} />
          </View>

          {solicitudPersona === 'Representante legal' ? (
            <>
              <View style={styles.erubricaRequestPanel}>
                <Text style={styles.erubricaHistoryEyebrow}>DATOS DE LA EMPRESA</Text>
                <Text style={styles.erubricaSignStep}>Información corporativa</Text>
                <Field label="Razón social de la empresa *" value={solicitudForm.razonSocialEmpresa} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, razonSocialEmpresa: value }))} />
                <Field label="Departamento" value={solicitudForm.departamento} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, departamento: value }))} />
                <Field label="Cargo *" value={solicitudForm.cargo} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, cargo: value }))} />
                <Field label="Motivo de firma *" value={solicitudForm.motivoFirma} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, motivoFirma: value }))} />
              </View>
              <View style={styles.erubricaRequestPanel}>
                <Text style={styles.erubricaHistoryEyebrow}>REPRESENTANTE LEGAL</Text>
                <Text style={styles.erubricaSignStep}>Información del representante</Text>
                <Field label="Tipo de documento *" value={solicitudForm.representanteTipoDocumento} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, representanteTipoDocumento: value }))} />
                <Field label="Identificación *" value={solicitudForm.representanteIdentificacion} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, representanteIdentificacion: value }))} />
                <Field label="Nombres del representante *" value={solicitudForm.representanteNombres} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, representanteNombres: value }))} />
                <Field label="Apellidos del representante *" value={solicitudForm.representanteApellidos} onChangeText={(value) => setSolicitudForm((current) => ({ ...current, representanteApellidos: value }))} />
              </View>
            </>
          ) : null}

          <View style={styles.erubricaRequestPanel}>
            <Text style={styles.erubricaHistoryEyebrow}>DOCUMENTOS DE SOPORTE</Text>
            <Text style={styles.erubricaSignStep}>Adjunta los archivos requeridos</Text>
            {solicitudDocumentoItems.map((item) => {
              const file = solicitudFiles[item.key];
              return (
                <Pressable key={item.key} style={styles.erubricaRequestDocument} onPress={() => pickSolicitudFile(item.key, item.types)}>
                  <MaterialCommunityIcons name={file ? 'check-circle' : 'cloud-upload-outline'} size={20} color={file ? ERUBRICA_COLORS.primary : '#607887'} />
                  <View style={styles.erubricaPendingDocCopy}>
                    <Text style={styles.erubricaRequestOptionTitle}>{item.label}</Text>
                    <Text style={styles.erubricaRequestOptionText}>{file?.name || 'JPG, JPEG, PNG o PDF. Máximo 10 MB.'}</Text>
                  </View>
                  <Text style={styles.erubricaRequestDocumentAction}>{file ? 'Cambiar' : 'Subir'}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.erubricaSignActions}>
            <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Limpiar formulario" onPress={() => { setSolicitudForm(SOLICITUD_FORM_INITIAL); setSolicitudFiles(SOLICITUD_FILES_INITIAL); setSolicitudId(null); }} />
            <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Siguiente" loading={solicitudSaving} onPress={openPaymentSummary} />
          </View>
        </View>
      ) : null}
      {tab === 'historial-solicitudes' ? (
        <View style={styles.erubricaHistoryStack}>
          <View style={styles.erubricaRequestHistoryHeader}>
            <View style={styles.erubricaHistoryHeroCopy}>
              <Text style={styles.erubricaHistoryEyebrow}>FIRMA ELECTRÓNICA</Text>
              <Text style={styles.erubricaHistoryTitle}>Historial de solicitudes</Text>
              <Text style={styles.erubricaHistorySubtitle}>Consulta el pago y el estado actualizado de tus solicitudes enviadas a Uanataca.</Text>
            </View>
            <View style={styles.erubricaRequestHistoryCounters}>
              <View style={styles.erubricaRequestHistoryCounter}><Text style={styles.erubricaRequestHistoryCounterText}>Total: {solicitudHistoryItems.length}</Text></View>
              <View style={styles.erubricaRequestHistoryCounter}><Text style={styles.erubricaRequestHistoryCounterText}>Pagados: {solicitudesPagadas}</Text></View>
              <View style={[styles.erubricaRequestHistoryCounter, styles.erubricaRequestHistoryCounterPending]}><Text style={styles.erubricaRequestHistoryCounterText}>Pendientes: {solicitudesPendientes}</Text></View>
            </View>
          </View>

          <View style={styles.erubricaRequestHistoryNotice}>
            <MaterialCommunityIcons name="email-fast-outline" size={17} color={ERUBRICA_COLORS.primary} />
            <Text style={styles.erubricaRequestHistoryNoticeText}>Recuerda: lo mejor es responder al correo desde tu computador.</Text>
          </View>

          <View style={styles.erubricaHistoryPanel}>
            <View style={styles.erubricaHistoryFilters}>
              <View style={styles.erubricaHistorySearchBox}>
                <MaterialCommunityIcons name="magnify" size={19} color="#5C748A" />
                <TextInput
                  value={historialQuery}
                  onChangeText={setHistorialQuery}
                  placeholder="Buscar por titular o referencia..."
                  placeholderTextColor="#8AA0B5"
                  style={styles.erubricaHistoryInput}
                />
              </View>
              <View style={styles.erubricaHistoryFilterRow}>
                <TextInput value={historialStatus} onChangeText={(value) => { setHistorialStatus(value); setHistorialSolicitudesPage(1); }} placeholder="Pago: todos" placeholderTextColor="#8AA0B5" style={styles.erubricaHistorySmallInput} />
                <TextInput value={historialDate} onChangeText={(value) => { setHistorialDate(value); setHistorialSolicitudesPage(1); }} placeholder="Solicitud: todos" placeholderTextColor="#8AA0B5" style={styles.erubricaHistorySmallInput} />
              </View>
              <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Consultar estado" loading={false} onPress={onSync} />
            </View>
            <Text style={styles.erubricaHistoryFooter}>{filteredHistorialSolicitudes.length} resultado(s)</Text>
            {filteredHistorialSolicitudes.length === 0 ? <EmptyState title="Sin historial" text="No hay solicitudes registradas con los filtros actuales." /> : historialSolicitudesPagina.map((item, index) => {
              const date = formatSignedDate(item);
              const titular = buildSolicitudTitular(item);
              const firma = label(item, ['firma', 'formato', 'solFormatoFirma', 'SolFormatoFirma', 'producto', 'descripcion'], 'Archivo .P12');
              const vigencia = label(item, ['vigencia', 'duracion', 'plan', 'solVigencia', 'SolVigencia'], '');
              const monto = Number(itemValue(item, ['subtotal', 'subTotal', 'valorSubtotal', 'solMontoPago', 'SolMontoPago']));
              const subtotal = Number.isFinite(monto) ? `$${monto.toFixed(2).replace('.', ',')}` : '$0,00';
              const iva = label(item, ['iva', 'valorIva'], '$0,00');
              const total = Number.isFinite(monto) ? `$${monto.toFixed(2).replace('.', ',')}` : label(item, ['total', 'valorTotal', 'monto'], '$0,00');
              const pago = label(item, ['estadoPago', 'pago', 'referenciaPago', 'solPagoExitoso', 'SolPagoExitoso'], 'Pendiente');
              const estadoSolicitud = label(item, ['estadoSolicitud', 'EstadoSolicitud', 'estado', 'status', 'solEstado'], 'Pendiente');
              const estadoUanataca = label(item, ['estadoUanataca', 'solUanatacaStatusText', 'SolUanatacaStatusText', 'uanataca', 'estadoProveedor'], 'Pendiente de pago');
              const soporte = label(item, ['soporte', 'ultimaNotificacion', 'UltimaNotificacion', 'observacion', 'mensaje'], 'Sin avisos');
              const solicitudId = Number(itemValue(item, ['solId', 'SolId', 'id']));
              const pagada = /^(true|1|si|sí)$/i.test(itemValue(item, ['solPagoExitoso', 'SolPagoExitoso', 'pagoExitoso']));
              return (
                <View key={`erubrica-historial-solicitud-${index}`} style={styles.erubricaRequestHistoryRow}>
                  <View style={styles.erubricaRequestHistoryRowTop}>
                    <View style={styles.erubricaPendingDocCopy}>
                      <Text style={styles.erubricaHistoryDocName} numberOfLines={2}>{titular}</Text>
                      <Text style={styles.erubricaHistoryDocMeta}>{date.date} {date.time}</Text>
                    </View>
                    <View style={styles.erubricaPendingStatusPill}>
                      <Text style={styles.erubricaPendingStatusText}>{estadoSolicitud}</Text>
                    </View>
                  </View>
                  <View style={styles.erubricaRequestHistoryGrid}>
                    <View style={styles.erubricaRequestHistoryCell}><Text style={styles.erubricaHistoryMetricLabel}>FIRMA</Text><Text style={styles.erubricaRequestHistoryValue}>{firma}{vigencia ? `\n${vigencia}` : ''}</Text></View>
                    <View style={styles.erubricaRequestHistoryCell}><Text style={styles.erubricaHistoryMetricLabel}>SUBTOTAL</Text><Text style={styles.erubricaRequestHistoryValue}>{subtotal}</Text></View>
                    <View style={styles.erubricaRequestHistoryCell}><Text style={styles.erubricaHistoryMetricLabel}>IVA</Text><Text style={styles.erubricaRequestHistoryValue}>{iva}</Text></View>
                    <View style={styles.erubricaRequestHistoryCell}><Text style={styles.erubricaHistoryMetricLabel}>TOTAL</Text><Text style={styles.erubricaRequestHistoryValue}>{total}</Text></View>
                  </View>
                  <View style={styles.erubricaRequestHistoryStatusGrid}>
                    <View style={styles.erubricaRequestHistoryPaymentPill}><Text style={styles.erubricaRequestHistoryPaymentText}>• {pago}</Text></View>
                    <View style={styles.erubricaRequestHistoryUanatacaPill}><Text style={styles.erubricaRequestHistoryUanatacaText}>• {estadoUanataca}</Text></View>
                    <Text style={styles.erubricaHistorySigner}>{soporte}</Text>
                  </View>
                  {solicitudId > 0 ? <View style={styles.erubricaPendingActionRow}>
                    <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label={syncingSolicitudId === solicitudId ? 'Actualizando...' : 'Actualizar estado'} onPress={() => void sincronizarSolicitudHistorial(solicitudId)} />
                    {pagada ? <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Descargar .p12" onPress={() => void descargarFirmaSolicitud(solicitudId)} /> : null}
                  </View> : null}
                </View>
              );
            })}
            <View style={styles.erubricaPendingActionRow}>
              <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Anterior" onPress={() => setHistorialSolicitudesPage((page) => Math.max(1, page - 1))} />
              <Text style={styles.erubricaHistoryFooter}>Página {paginaHistorialSolicitudes} de {totalHistorialSolicitudesPages}</Text>
              <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Siguiente" onPress={() => setHistorialSolicitudesPage((page) => Math.min(totalHistorialSolicitudesPages, page + 1))} />
            </View>
          </View>
        </View>
      ) : null}
      {tab === 'renovacion' ? (
        <View style={styles.clientCard}>
          <Text style={styles.clientDetailLabel}>Renovación de firma</Text>
          <Text style={styles.clientMeta}>Consulta la vigencia de tus certificados y las renovaciones pendientes.</Text>
          <Text style={styles.clientDetailValue}>{renovacionActual ? JSON.stringify(renovacionActual, null, 2) : 'Cargando información de renovación...'}</Text>
        </View>
      ) : null}
      {tab === 'catalogos' ? (
        <View style={styles.clientCard}>
          <Text style={styles.clientDetailLabel}>Productos y saldo</Text>
          <Text style={styles.clientMeta}>Saldo disponible: {saldo === null ? 'Cargando...' : saldo}</Text>
          {catalogos.length === 0 ? <EmptyState title="Sin productos" text="No hay productos disponibles para tu cuenta." /> : catalogos.slice(0, 20).map((item, index) => <Text key={`erubrica-producto-${index}`} style={styles.clientDetailValue}>{label(item, ['nombre', 'descripcion', 'name'], 'Producto')}</Text>)}
        </View>
      ) : null}
      {tab === 'plan-disponible' ? (
        <View style={styles.erubricaPlanStack}>
          <View style={styles.erubricaPlanHeader}>
            <View style={styles.erubricaPlanHeaderTop}>
              <View style={styles.erubricaPlanHeaderBadge}>
                <MaterialCommunityIcons name="card-account-details-star-outline" size={15} color={ERUBRICA_COLORS.primary} />
                <Text style={styles.erubricaPlanHeaderEyebrow}>CONFIGURACIÓN</Text>
              </View>
              <Pressable style={styles.erubricaPlanBackButton} onPress={() => selectTab('inicio')}>
                <MaterialCommunityIcons name="arrow-left" size={15} color={ERUBRICA_COLORS.text} />
                <Text style={styles.erubricaPendingLoadText}>Volver al inicio</Text>
              </Pressable>
            </View>
            <Text style={styles.erubricaPlanHeaderTitle}>Mi Plan Disponible</Text>
            <Text style={styles.erubricaPlanHeaderSubtitle}>Consulta los detalles de tu suscripción activa para firma y validación de documentos electrónicos.</Text>
            <View style={styles.erubricaPlanHeaderStatusRow}>
              <View style={styles.erubricaPlanHeaderStatusPill}>
                <MaterialCommunityIcons name="check-circle-outline" size={14} color={ERUBRICA_COLORS.primary} />
                <Text style={styles.erubricaPlanHeaderStatusText}>{planEstado}</Text>
              </View>
              <Text style={styles.erubricaPlanHeaderDate}>Vence: {planFechaVencimiento}</Text>
            </View>
          </View>

          <View style={styles.erubricaPlanCard}>
            <View style={styles.erubricaPlanHero}>
              <View style={styles.erubricaPlanPills}>
              <Text style={styles.erubricaPlanPill}>{label(planDisponible, ['tieneFirmaPagada'], 'false') === 'true' && planEstado.toLowerCase() === 'activo' ? 'Firma vigente' : 'Sin firma vigente'}</Text>
                <Text style={styles.erubricaPlanPillAlt}>Servicio: E-Rúbrica</Text>
              </View>
              <View style={styles.erubricaPlanHeroBody}>
                <View style={styles.erubricaPlanIcon}>
                  <MaterialCommunityIcons name="key-variant" size={25} color="#CFF8D8" />
                </View>
                <View style={styles.erubricaHistoryHeroCopy}>
                  <Text style={styles.erubricaHistoryEyebrow}>TU ACCESO DIGITAL</Text>
                  <Text style={styles.erubricaPlanTitle}>Plan de E-Rúbrica</Text>
                  <Text style={styles.erubricaPlanText}>Firma, valida y protege tus documentos con respaldo legal.</Text>
                </View>
              </View>
              <View style={styles.erubricaPlanDaysCircle}>
                <Text style={styles.erubricaPlanDays}>{planDiasRestantes}</Text>
                <Text style={styles.erubricaPlanDaysLabel}>DÍAS RESTANTES</Text>
              </View>
            </View>
            <View style={styles.erubricaPlanDetails}>
              <View style={styles.erubricaRequestHistoryCell}><Text style={styles.erubricaHistoryMetricLabel}>FECHA DE VENCIMIENTO</Text><Text style={styles.erubricaRequestHistoryValue}>{planFechaVencimiento}</Text></View>
              <View style={styles.erubricaRequestHistoryCell}><Text style={styles.erubricaHistoryMetricLabel}>ESTADO DEL ACCESO</Text><Text style={[styles.erubricaRequestHistoryValue, { color: ERUBRICA_COLORS.primary }]}>{planEstado}</Text></View>
            </View>
            <View style={styles.erubricaPendingActionRow}>
              <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label={planEstado.toLowerCase() === 'activo' ? 'Renovar firma' : 'Solicitar Nueva Firma'} loading={false} onPress={() => selectTab('nueva-solicitud')} />
              <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Ver Mis Trámites" onPress={() => selectTab('historial-solicitudes')} />
            </View>
          </View>

          <View style={styles.erubricaBenefitsCard}>
            <Text style={styles.erubricaSignStep}>Beneficios Incluidos</Text>
            {[
              ['Firmado de PDF ilimitado', 'Firma digitalmente todos los contratos y documentos que necesites.'],
              ['Estándar XAdES / PAdES', 'Garantiza plena validez legal ante el SRI, aduanas y juzgados del Ecuador.'],
              ['Seguridad y Respaldo', 'Tus firmas y contraseñas no se almacenan, garantizando confidencialidad.'],
              ['Soporte Prioritario', 'Atención técnica preferencial para resolver bloqueos o dudas del certificado.'],
            ].map(([title, text]) => (
              <View key={title} style={styles.erubricaBenefitRow}>
                <MaterialCommunityIcons name="check-circle-outline" size={18} color={ERUBRICA_COLORS.primary} />
                <View style={styles.erubricaPendingDocCopy}>
                  <Text style={styles.erubricaRequestOptionTitle}>{title}</Text>
                  <Text style={styles.erubricaRequestOptionText}>{text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {tab === 'firma-config' ? (
        <View style={styles.erubricaConfigStack}>
          <View style={styles.erubricaConfigIntroCard}>
            <View style={styles.erubricaConfigIntroIcon}>
              <MaterialCommunityIcons name="file-check-outline" size={31} color={ERUBRICA_COLORS.primary} />
              <View style={styles.erubricaConfigShieldBadge}>
                <MaterialCommunityIcons name="shield-check-outline" size={18} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.erubricaConfigIntroAccent} />
            <View style={styles.erubricaConfigIntroCopy}>
              <Text style={styles.erubricaConfigTitle}>Configura tu firma electrónica</Text>
              <Text style={styles.erubricaConfigSubtitle}>Carga tu certificado digital y configura su clave de acceso para firmar documentos de forma segura.</Text>
            </View>
          </View>

      <View style={styles.erubricaConfigStatusCard}>
            <MaterialCommunityIcons name="shield-check-outline" size={19} color={ERUBRICA_COLORS.primary} />
            <View style={styles.erubricaPendingDocCopy}>
              <Text style={styles.erubricaConfigStatusTitle}>{firmaEfactValida ? 'Firma vigente en E-Fact' : firmaEfact ? 'Firma configurada en E-Fact' : 'Firma pendiente'}</Text>
              <Text style={styles.erubricaConfigStatusText}>{firmaEfactValida ? `${firmaEfact?.diasRestantes ?? 'Sin dato'} días para renovar. Expira el ${firmaEfactExpira}.` : firmaEfact?.mensaje ?? 'Carga un certificado .p12 para habilitar la firma electrónica.'}</Text>
            </View>
          </View>

          <View style={styles.erubricaConfigStepCard}>
            <View style={styles.erubricaConfigStepHeader}>
              <View style={styles.erubricaConfigStepNumber}><Text style={styles.erubricaConfigStepNumberText}>1</Text></View>
              <View style={styles.erubricaPendingDocCopy}>
                <Text style={styles.erubricaConfigStepTitle}>Certificado digital</Text>
                <Text style={styles.erubricaConfigStepHint}>{firmaEfact ? 'Ya se detectó la firma configurada en E-Fact. Selecciona otro archivo solo para reemplazarla.' : 'Selecciona tu archivo de certificado digital en formato .p12'}</Text>
              </View>
              <Pressable style={styles.erubricaConfigSelectButton} onPress={pickCertificate}>
                <MaterialCommunityIcons name="file-upload-outline" size={15} color="#FFFFFF" />
                <Text style={styles.erubricaConfigSelectText}>{firmaEfact ? 'Reemplazar' : 'Seleccionar'}</Text>
              </Pressable>
            </View>
            <Pressable style={styles.erubricaConfigFileRow} onPress={pickCertificate}>
              <View style={styles.erubricaDropIcon}>
                <MaterialCommunityIcons name="file-lock-outline" size={20} color={ERUBRICA_COLORS.primary} />
              </View>
              <View style={styles.erubricaPendingDocCopy}>
                <Text style={styles.erubricaRequestHistoryValue} numberOfLines={1}>{certificateFile ? certificateFile.name : firmaEfact ? 'Certificado configurado en E-Fact' : 'Selecciona tu certificado .p12'}</Text>
                <Text style={styles.erubricaRequestOptionText}>{firmaEfact ? (firmaEfactValida ? 'Validado automáticamente' : 'Requiere validación') : 'Formato .p12'}</Text>
              </View>
              {certificateFile ? <MaterialCommunityIcons name="check-circle" size={18} color={ERUBRICA_COLORS.primary} /> : null}
              {certificateFile ? (
                <Pressable style={styles.erubricaConfigDeleteButton} onPress={() => setCertificateFile(null)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={17} color="#5C748A" />
                </Pressable>
              ) : null}
            </Pressable>
          </View>

          <View style={styles.erubricaConfigStepCard}>
            <View style={styles.erubricaConfigStepHeader}>
              <View style={styles.erubricaConfigStepNumber}><Text style={styles.erubricaConfigStepNumberText}>2</Text></View>
              <View style={styles.erubricaPendingDocCopy}>
                <Text style={styles.erubricaConfigStepTitle}>Clave de acceso</Text>
                <Text style={styles.erubricaConfigStepHint}>Ingresa la clave del certificado (.p12) para habilitar la firma electrónica.</Text>
              </View>
            </View>
            <Field label="Clave del certificado" value={certificatePassword} onChangeText={setCertificatePassword} secureTextEntry />
            {certificatePassword.trim() ? (
              <View style={styles.erubricaConfigSuccessRow}>
                <MaterialCommunityIcons name="shield-check-outline" size={15} color={ERUBRICA_COLORS.primary} />
                <Text style={styles.erubricaConfigSuccessText}>Clave configurada correctamente.</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.erubricaConfigSideGrid}>
            <View style={styles.erubricaConfigSideCard}>
              <Text style={styles.erubricaConfigSideTitle}>Resumen de validación</Text>
              {[
                ['file-check-outline', certificateFile || firmaEfact ? 'Archivo detectado' : 'Archivo pendiente', certificateFile?.name ?? (firmaEfact ? 'Certificado de E-Fact' : 'Selecciona el certificado .p12')],
                ['check-circle-outline', certificateFile || firmaEfactValida ? 'Formato válido' : 'Formato por validar', firmaEfactValida ? 'Certificado validado en E-Fact' : 'Certificado .p12 reconocido'],
                ['key-outline', certificatePassword.trim() || firmaEfact ? 'Clave configurada' : 'Clave pendiente', certificatePassword.trim() || firmaEfact ? 'Configurada' : 'Requerida para guardar'],
                ['circle', certificateFile && certificatePassword.trim() || firmaEfactValida ? 'Lista para usar' : 'Pendiente de completar', firmaEfactValida ? 'Disponible para firmar' : 'Guarda para confirmar'],
              ].map(([icon, title, text]) => (
                <View key={title} style={styles.erubricaConfigSummaryRow}>
                  <View style={styles.erubricaDropIcon}><MaterialCommunityIcons name={icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={17} color={ERUBRICA_COLORS.primary} /></View>
                  <View style={styles.erubricaPendingDocCopy}>
                    <Text style={styles.erubricaRequestOptionTitle}>{title}</Text>
                    <Text style={styles.erubricaRequestOptionText} numberOfLines={1}>{text}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.erubricaConfigSideCard}>
              <View style={styles.erubricaConfigProtectedHeader}>
                <View style={styles.erubricaPendingDocCopy}>
                  <Text style={styles.erubricaConfigSideTitle}>Tu información está protegida</Text>
                  <Text style={styles.erubricaRequestOptionText}>Usamos cifrado de nivel empresarial para proteger tu certificado y clave de acceso.</Text>
                </View>
                <View style={styles.erubricaConfigProtectedIcon}>
                  <MaterialCommunityIcons name="shield-check-outline" size={23} color="#FFFFFF" />
                </View>
              </View>
              {['La clave no se almacena en texto plano', 'Conexiones seguras y cifradas', 'Cumplimos estándares de seguridad'].map((item) => (
                <View key={item} style={styles.erubricaAdviceRow}>
                  <MaterialCommunityIcons name="check-circle-outline" size={15} color={ERUBRICA_COLORS.primary} />
                  <Text style={styles.erubricaAdviceText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.erubricaConfigActionBar}>
            <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label={loadingFirmaDetalle ? "Validando..." : "Validar ahora"} onPress={() => void cargarFirmaActiva(true)} />
            <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Cancelar" onPress={() => selectTab('inicio')} />
            <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Limpiar" onPress={() => { setCertificateFile(null); setCertificatePassword(''); }} />
            <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Guardar firma" loading={savingConfiguredSignature} onPress={() => void saveConfiguredSignature()} />
          </View>
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
              <Text style={styles.clientDetailLabel}>{label(item, ['solId', 'SolId', 'id', 'numero', 'solicitud'], 'Solicitud de firma')}</Text>
              <Text style={styles.clientMeta}>{label(item, ['estado', 'status', 'solEstado', 'estadoSolicitud', 'EstadoSolicitud'], 'Pendiente')}</Text>
            </View>
            <MaterialCommunityIcons name="file-sign" size={25} color={ERUBRICA_COLORS.primary} />
          </View>
              <Text style={styles.clientDetailValue}>{label(item, ['solFormatoFirma', 'SolFormatoFirma', 'formato', 'producto', 'descripcion'], 'Solicitud E-Rúbrica')}</Text>
              {Number(label(item, ['solId', 'SolId', 'id'], '0')) > 0 ? <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Descargar firma .p12" onPress={async () => {
                try {
              const solId = Number(label(item, ['solId', 'SolId', 'id'], '0'));
                  const result = await descargarERubricaFirmaP12(solId);
                  const uri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}firma-${solId}.p12`;
                  await FileSystem.writeAsStringAsync(uri, arrayBufferToBase64(result.bytes), { encoding: FileSystem.EncodingType.Base64 });
                  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/x-pkcs12', dialogTitle: 'Compartir firma .p12' });
                } catch (error) { Alert.alert('No se pudo descargar', error instanceof ApiError ? error.message : 'La firma no está disponible.'); }
              }} /> : null}
        </View>
      ))}

      {tab === 'historial-documentos' ? (
        <View style={styles.erubricaHistoryStack}>
          <View style={styles.erubricaHistoryHero}>
            <View style={styles.erubricaHistoryHeroCopy}>
              <Text style={styles.erubricaHistoryEyebrow}>DOCUMENTOS ELECTRÓNICOS</Text>
              <Text style={styles.erubricaHistoryTitle}>Historial documentos</Text>
              <Text style={styles.erubricaHistorySubtitle}>Consulta, descarga o valida los PDF que has firmado electrónicamente.</Text>
            </View>
            <View style={styles.erubricaHistoryHeroActions}>
              <Pressable style={styles.erubricaHistoryValidateButton} onPress={() => void cargarDocumentosFirmados()} disabled={loadingDocumentosFirmados}>
                <MaterialCommunityIcons name="refresh" size={14} color={ERUBRICA_COLORS.text} />
                <Text style={styles.erubricaHistoryValidateText}>{loadingDocumentosFirmados ? 'Actualizando...' : 'Actualizar'}</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.erubricaHistoryPanel}>
            <View style={styles.erubricaHistoryFilters}>
              <View style={styles.erubricaHistorySearchBox}>
                <TextInput
                  value={historialQuery}
                  onChangeText={setHistorialQuery}
                  placeholder="Buscar por nombre de documento..."
                  placeholderTextColor="#8AA0B5"
                  style={styles.erubricaHistoryInput}
                />
                <MaterialCommunityIcons name="magnify" size={19} color="#5C748A" />
              </View>
              <View style={styles.erubricaHistoryFilterRow}>
                <TextInput value={historialDate} onChangeText={setHistorialDate} placeholder="mm/dd/yyyy" placeholderTextColor="#8AA0B5" style={styles.erubricaHistorySmallInput} />
                <TextInput value={historialStatus} onChangeText={setHistorialStatus} placeholder="Todos los estados" placeholderTextColor="#8AA0B5" style={styles.erubricaHistorySmallInput} />
              </View>
              <Pressable style={styles.erubricaHistoryClearButton} onPress={() => { setHistorialQuery(''); setHistorialDate(''); setHistorialStatus(''); }}>
                <MaterialCommunityIcons name="filter-remove-outline" size={15} color={ERUBRICA_COLORS.primary} />
                <Text style={styles.erubricaHistoryClearText}>Limpiar filtros</Text>
              </Pressable>
            </View>
            {filteredFirmas.length === 0 ? (
              <EmptyState title="Sin documentos firmados" text="No se encontraron documentos con los filtros actuales." />
            ) : filteredFirmas.slice(0, 10).map((item, index) => {
              const signedDate = formatSignedDate(item);
              const documentName = label(item, ['nombreDocumento', 'documento', 'archivo', 'fileName', 'solFormatoFirma', 'SolFormatoFirma', 'nombre', 'descripcion'], 'Documento firmado');
              const signedBy = buildSolicitudTitular(item, 'Usuario');
              const signerEmail = label(item, ['email', 'correo', 'correoUsuario', 'solCorreo1', 'SolCorreo1'], '');
              const size = label(item, ['tamano', 'tamaño', 'size', 'peso'], 'No disponible');
              const status = label(item, ['estado', 'status', 'estadoFirma', 'estadoSolicitud', 'EstadoSolicitud'], 'Válido');
              const previewUrl = itemValue(item, ['previewUrl', 'url', 'downloadUrl', 'documentoUrl', 'ruta', 'archivoUrl']);
              const downloadUrl = itemValue(item, ['downloadUrl', 'url', 'documentoUrl', 'ruta', 'archivoUrl']);
              return (
                <View key={`erubrica-historial-${index}`} style={styles.erubricaHistoryRow}>
                  <View style={styles.erubricaHistoryDocIcon}>
                    <MaterialCommunityIcons name="file-pdf-box" size={19} color="#5C748A" />
                  </View>
                  <View style={styles.erubricaHistoryDocCopy}>
                    <Text style={styles.erubricaHistoryDocName} numberOfLines={2}>{documentName}</Text>
                    <Text style={styles.erubricaHistoryDocMeta} numberOfLines={1}>PDF firmado desde e-rubrica</Text>
                    <View style={styles.erubricaHistoryDocDetails}>
                      <Text style={styles.erubricaHistoryDetailText}>{signedDate.date} {signedDate.time}</Text>
                      <Text style={styles.erubricaHistoryDetailText}>{size}</Text>
                    </View>
                    <Text style={styles.erubricaHistorySigner} numberOfLines={1}>{signedBy}{signerEmail ? ` · ${signerEmail}` : ''}</Text>
                  </View>
                  <View style={styles.erubricaHistoryRowSide}>
                    <View style={styles.erubricaHistoryStatusPill}>
                      <Text style={styles.erubricaHistoryStatusText}>✓ {status}</Text>
                    </View>
                    <View style={styles.erubricaHistoryActionRow}>
                      <Pressable style={styles.erubricaHistoryIconButton} onPress={() => downloadUrl ? onDownloadRemotePdf(downloadUrl, documentName) : Alert.alert('Descarga no disponible', 'Este registro no incluye un PDF para descargar.')}>
                        <MaterialCommunityIcons name="download-outline" size={17} color="#5C748A" />
                      </Pressable>
                      <Pressable style={styles.erubricaHistoryIconButton} onPress={() => previewUrl ? onPreviewRemotePdf(previewUrl, documentName) : Alert.alert('Compartir no disponible', 'Este registro no incluye un PDF para compartir.')}>
                        <MaterialCommunityIcons name="share-variant-outline" size={17} color={ERUBRICA_COLORS.primary} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
            <Text style={styles.erubricaHistoryFooter}>Mostrando {Math.min(filteredFirmas.length, 10)} de {filteredFirmas.length} documentos</Text>
          </View>
        </View>
      ) : null}

      {tab === 'ver-mis-firmas' && !loading ? (
        <View style={styles.erubricaSignatureStack}>
          <View style={styles.erubricaSignatureHero}>
            <View style={styles.erubricaSignatureHeroCopy}>
              <Text style={styles.erubricaSignatureEyebrow}>SEGURIDAD DE FIRMA</Text>
              <Text style={styles.erubricaSignatureTitle}>Tu firma electrónica, clara y bajo control</Text>
              <Text style={styles.erubricaSignatureText}>Consulta la firma activa de tu cuenta o valida temporalmente otro archivo sin reemplazar tu configuración.</Text>
              <Pressable style={styles.erubricaSignatureRefreshButton} onPress={() => void cargarFirmaActiva(true)} disabled={loadingFirmaDetalle}>
                <MaterialCommunityIcons name="refresh" size={14} color={ERUBRICA_COLORS.text} />
                <Text style={styles.erubricaPendingLoadText}>{loadingFirmaDetalle ? 'Actualizando...' : 'Actualizar información'}</Text>
              </Pressable>
            </View>
            <View style={styles.erubricaSignatureStatusPanel}>
              <View style={styles.erubricaSignatureStatusIcon}>
                <MaterialCommunityIcons name="check-decagram" size={29} color="#88F0B1" />
              </View>
              <Text style={styles.erubricaSignatureStatusLabel}>ESTADO ACTUAL</Text>
              <Text style={styles.erubricaSignatureStatusText}>{firmaEfact ? firmaEfactValida ? 'Firma válida y vigente' : 'Firma requiere revisión' : 'Sin firma activa'}</Text>
              <Text style={styles.erubricaSignatureStatusName} numberOfLines={2}>{firmaTitular}</Text>
            </View>
          </View>

          <View style={styles.erubricaSignatureGrid}>
            <View style={styles.erubricaSignatureCard}>
              <View style={styles.erubricaAdviceHeader}>
                <View style={styles.erubricaDropIcon}>
                  <MaterialCommunityIcons name="card-account-details-outline" size={20} color={ERUBRICA_COLORS.primary} />
                </View>
                <View style={styles.erubricaPendingDocCopy}>
                  <Text style={styles.erubricaHistoryEyebrow}>FIRMA ACTIVA DE LA CUENTA</Text>
                  <Text style={styles.erubricaSignStep}>Información del certificado</Text>
                  <Text style={styles.erubricaSignHint}>Datos obtenidos directamente desde la API de validación de firma.</Text>
                </View>
              </View>
              {!firmaEfact ? <EmptyState title="Sin firma configurada" text="Configura un certificado .p12 para consultar su vigencia y sus datos." /> : (
                <>
                  <View style={styles.erubricaSignatureVerified}>
                    <MaterialCommunityIcons name="check-circle" size={19} color={ERUBRICA_COLORS.primary} />
                    <View style={styles.erubricaPendingDocCopy}>
                      <Text style={styles.erubricaHistoryMetricLabel}>CERTIFICADO VERIFICADO</Text>
                      <Text style={styles.erubricaRequestHistoryValue}>{firmaTitular}</Text>
                      <Text style={styles.erubricaRequestOptionText}>{firmaDetalleActiva?.mensaje || (firmaEfactValida ? 'La firma configurada es correcta y se encuentra vigente.' : 'La firma configurada requiere revisión.')}</Text>
                    </View>
                    <Text style={styles.erubricaSignatureValidPill}>{firmaEstado}</Text>
                  </View>
                  <View style={styles.erubricaSignatureInfoGrid}>
                    {[
                      ['Titular', firmaTitular],
                      ['Identificación', firmaIdentificacion],
                      ['Emitida', firmaEmision],
                      ['Expira', firmaExpira],
                      ['Vigencia restante', firmaDiasRestantes],
                      ['Autoridad emisora', firmaAutoridad],
                      ['Número de serie', firmaSerie],
                      ['Huella digital', firmaHuella],
                    ].map(([title, value]) => (
                      <View key={title} style={styles.erubricaSignatureInfoCell}>
                        <Text style={styles.erubricaHistoryMetricLabel}>{title}</Text>
                        <Text style={styles.erubricaRequestHistoryValue} numberOfLines={title === 'Huella digital' ? 3 : 2}>{value}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>

            <View style={styles.erubricaSignatureCard}>
              <View style={styles.erubricaAdviceHeader}>
                <View style={styles.erubricaDropIcon}>
                  <MaterialCommunityIcons name="shield-check-outline" size={20} color={ERUBRICA_COLORS.primary} />
                </View>
                <View style={styles.erubricaPendingDocCopy}>
                  <Text style={styles.erubricaHistoryEyebrow}>VALIDACIÓN TEMPORAL</Text>
                  <Text style={styles.erubricaSignStep}>Comprueba un archivo y su clave</Text>
                  <Text style={styles.erubricaSignHint}>El archivo se usa una sola vez y no modifica la firma activa.</Text>
                </View>
              </View>
              <View style={styles.erubricaValidationStrip}>
                <MaterialCommunityIcons name="incognito" size={16} color={ERUBRICA_COLORS.primary} />
                <Text style={styles.erubricaValidationStripText}>Ni el archivo ni la clave se guardan después de la validación.</Text>
              </View>
              <Pressable style={styles.erubricaDropzone} onPress={pickCertificate}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={24} color={ERUBRICA_COLORS.primary} />
                <Text style={styles.erubricaDropTitle}>{certificateFile ? certificateFile.name : 'Selecciona tu archivo .p12'}</Text>
                <Text style={styles.erubricaDropText}>Haz clic para buscar · Máximo 5 MB</Text>
              </Pressable>
              <Field label="Clave del certificado" value={certificatePassword} onChangeText={setCertificatePassword} secureTextEntry />
              <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Validar archivo y clave" loading={validandoFirmaTemporal} onPress={() => void validarFirmaTemporal()} />
            </View>
          </View>
        </View>
      ) : null}

      {tab === 'firmas' && !loading && firmas.length === 0 ? <EmptyState title="Sin firmas" text="No hay certificados o firmas disponibles." /> : null}
      {tab === 'firmas' && !loading && firmas.slice(0, 8).map((item, index) => (
        <View key={`erubrica-firma-${index}`} style={[styles.clientCard, { borderLeftColor: ERUBRICA_COLORS.primary, borderColor: ERUBRICA_COLORS.border }]}>
          <Text style={styles.clientDetailLabel}>{label(item, ['nombreTitular', 'titular', 'razonSocial'], 'Firma electrónica')}</Text>
          <Text style={styles.clientMeta}>{label(item, ['estado', 'estadoVigencia', 'status'], 'Estado no disponible')}</Text>
          <Text style={styles.clientDetailValue}>{label(item, ['fechaExpiracion', 'diasRestantes', 'numeroSerie'], 'Sin detalle adicional')}</Text>
        </View>
      ))}

      {['solicitudes', 'historial-solicitudes', 'proveedor'].includes(tab) ? <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Sincronizar solicitudes pendientes" loading={false} onPress={onSync} /> : null}
      <Modal visible={signedDocumentsModalOpen} transparent animationType="fade" onRequestClose={() => setSignedDocumentsModalOpen(false)}>
        <View style={styles.erubricaPaymentOverlay}>
          <View style={styles.erubricaPaymentModal}>
            <View style={styles.erubricaPaymentHeader}>
              <View style={styles.erubricaHistoryHeroCopy}>
                <Text style={styles.erubricaHistoryEyebrow}>HISTORIAL DE DOCUMENTOS</Text>
                <Text style={styles.erubricaPaymentTitle}>Seleccionar documento firmado</Text>
              </View>
              <Pressable style={styles.erubricaPaymentClose} onPress={() => setSignedDocumentsModalOpen(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#1787D5" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.portalStack}>
              {documentosFirmados.length === 0 ? <EmptyState title="Sin documentos firmados" text="Cuando firmes un PDF, aparecerá aquí para validarlo." /> : documentosFirmados.map((item, index) => {
                const documentName = label(item, ['nombreDocumento', 'documento', 'archivo', 'fileName'], 'Documento firmado.pdf');
                const signedDate = formatSignedDate(item);
                const size = label(item, ['tamano', 'tamaño', 'size', 'peso'], '');
                return (
                  <View key={`validar-firmado-${index}`} style={styles.erubricaHistoryRow}>
                    <View style={styles.erubricaHistoryDocIcon}><MaterialCommunityIcons name="file-pdf-box" size={19} color="#5C748A" /></View>
                    <View style={styles.erubricaHistoryDocCopy}>
                      <Text style={styles.erubricaHistoryDocName} numberOfLines={2}>{documentName}</Text>
                      <Text style={styles.erubricaHistoryDetailText}>{signedDate.date} {signedDate.time}{size ? ` · ${size}` : ''}</Text>
                    </View>
                    <Pressable style={styles.erubricaSignedDocsButton} disabled={loadingSignedDocument} onPress={() => void useSignedDocumentForValidation(item)}>
                      {loadingSignedDocument ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.erubricaSignedDocsText}>Usar</Text>}
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal visible={paymentModalOpen} transparent animationType="fade" onRequestClose={() => setPaymentModalOpen(false)}>
        <View style={styles.erubricaPaymentOverlay}>
          <View style={styles.erubricaPaymentModal}>
            <View style={styles.erubricaPaymentHeader}>
              <View style={styles.erubricaHistoryHeroCopy}>
                <Text style={styles.erubricaHistoryEyebrow}>RESUMEN DE PAGO</Text>
                <Text style={styles.erubricaPaymentTitle}>Firma electrónica {solicitudPlan.label}</Text>
                <Text style={styles.erubricaHistorySubtitle}>Elige pagar en línea o registrar una transferencia para aprobación.</Text>
              </View>
              <Pressable style={styles.erubricaPaymentClose} onPress={() => setPaymentModalOpen(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#1787D5" />
              </Pressable>
            </View>
            <View style={styles.erubricaPaymentSummaryGrid}>
              <View style={styles.erubricaPaymentSummaryBox}><Text style={styles.erubricaHistoryMetricLabel}>SERVICIO</Text><Text style={styles.erubricaPaymentSummaryValue}>e-Rúbrica</Text></View>
              <View style={styles.erubricaPaymentSummaryBox}><Text style={styles.erubricaHistoryMetricLabel}>SUBTOTAL</Text><Text style={styles.erubricaPaymentSummaryValue}>USD {solicitudSubtotal.toFixed(2)}</Text></View>
              <View style={styles.erubricaPaymentSummaryBox}><Text style={styles.erubricaHistoryMetricLabel}>IVA 15%</Text><Text style={styles.erubricaPaymentSummaryValue}>USD {solicitudIva.toFixed(2)}</Text></View>
              <View style={[styles.erubricaPaymentSummaryBox, styles.erubricaPaymentTotalBox]}><Text style={styles.erubricaHistoryMetricLabel}>TOTAL</Text><Text style={styles.erubricaPaymentSummaryValue}>USD {solicitudTotal.toFixed(2)}</Text></View>
            </View>
            <View style={styles.erubricaPaymentMethodGrid}>
              <Pressable style={[styles.erubricaPaymentMethod, paymentMethod === 'deuna' && styles.erubricaPaymentMethodActive]} onPress={() => setPaymentMethod('deuna')}>
                <MaterialCommunityIcons name="cellphone-check" size={22} color="#1787D5" />
                <View style={styles.erubricaPendingDocCopy}><Text style={styles.erubricaRequestOptionTitle}>DeUna / Pago en línea</Text><Text style={styles.erubricaRequestOptionText}>Abre el checkout seguro y se acredita al aprobarse.</Text></View>
              </Pressable>
              <Pressable style={[styles.erubricaPaymentMethod, paymentMethod === 'transferencia' && styles.erubricaPaymentMethodActive]} onPress={() => setPaymentMethod('transferencia')}>
                <MaterialCommunityIcons name="bank-outline" size={22} color="#1787D5" />
                <View style={styles.erubricaPendingDocCopy}><Text style={styles.erubricaRequestOptionTitle}>Transferencia bancaria</Text><Text style={styles.erubricaRequestOptionText}>Se valida manualmente en un plazo máximo de 24 horas.</Text></View>
              </Pressable>
            </View>
            {paymentMethod === 'transferencia' ? (
              <View style={styles.erubricaPaymentTransferGrid}>
                <View style={styles.erubricaRequestPanel}>
                  <Text style={styles.erubricaPaymentTitle}>Información de pago</Text>
                  <Text style={styles.clientFilterLabel}>Banco *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clientFilterRow}>
                    {['Banco Pichincha', 'Banco Guayaquil', 'Banco Internacional', 'Banco Pacifico', 'Banco Produbanco', 'Banco Bolivariano', 'Cooperativa JEP', 'Otra institucion'].map((banco) => (
                      <Pressable key={banco} style={[styles.clientFilterChip, transferForm.banco === banco && styles.clientFilterChipActive]} onPress={() => setTransferForm((current) => ({ ...current, banco }))}><Text style={[styles.clientFilterChipText, transferForm.banco === banco && styles.clientFilterChipTextActive]}>{banco}</Text></Pressable>
                    ))}
                  </ScrollView>
                  <Field label="Banco *" value={transferForm.banco} onChangeText={(value) => setTransferForm((current) => ({ ...current, banco: value }))} />
                  <Field label="Titular de la cuenta *" value={transferForm.titular} onChangeText={(value) => setTransferForm((current) => ({ ...current, titular: value }))} />
                  <Field label="N. cuenta de origen *" value={transferForm.cuenta} onChangeText={(value) => setTransferForm((current) => ({ ...current, cuenta: value.replace(/\D/g, '') }))} keyboardType="number-pad" />
                  <Field label="N. comprobante *" value={transferForm.comprobante} onChangeText={(value) => setTransferForm((current) => ({ ...current, comprobante: value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 50) }))} autoCapitalize="characters" />
                  <Pressable style={styles.erubricaDropzone} onPress={pickTransferReceipt}>
                    <MaterialCommunityIcons name="image-plus" size={24} color="#1787D5" />
                    <Text style={styles.erubricaDropTitle}>{transferReceipt?.fileName ?? 'Arrastra o selecciona el comprobante'}</Text>
                    <Text style={styles.erubricaDropText}>JPG o PNG. Máximo 5MB.</Text>
                  </Pressable>
                </View>
                <View style={styles.erubricaPaymentBankBox}>
                  <Text style={styles.erubricaRequestOptionTitle}>Total a pagar</Text>
                  <Text style={styles.erubricaPaymentBankText}>Subtotal USD {solicitudSubtotal.toFixed(2)}{`\n`}IVA 15% USD {solicitudIva.toFixed(2)}{`\n`}Total USD {solicitudTotal.toFixed(2)}</Text>
                  <Text style={styles.erubricaRequestOptionTitle}>Pagar a</Text>
                  <Text style={styles.erubricaPaymentBankText}>Banco: Banco Pichincha{`\n`}Tipo de cuenta: Cuenta corriente{`\n`}Número de cuenta: 2100346647{`\n`}RUC: 1793233799001{`\n`}Nombre: NUMERICASOFTWARE S.A.S.{`\n`}e-mail: contabilidad@numericasoftware.com</Text>
                </View>
              </View>
            ) : null}
            <View style={styles.erubricaPaymentActions}>
              <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Cancelar" onPress={() => setPaymentModalOpen(false)} />
              <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label={paymentMethod === 'deuna' ? 'Pagar con DeUna' : 'Enviar transferencia'} loading={paymentLoading} onPress={payERubricaRequest} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DashboardHomeScreen({
  clientesCount,
  productosCount,
  facturas,
  modules,
  onOpenView,
  onOpenVoice,
}: {
  clientesCount: number;
  productosCount: number;
  facturas: FacturaListItem[];
  modules: MobileModule[];
  onOpenView: (view: WorkspaceView) => void;
  onOpenVoice: () => void;
}) {
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const ventasTotal = facturas.reduce((sum, factura) => sum + Number(factura.total ?? 0), 0);
  const latestFacturas = facturas.slice(0, 3);
  const mainModules = modules
    .filter((module) => ['mis-facturas', 'clientes', 'productos', 'emisor', 'punto-emision'].includes(module.view))
    .slice(0, 5);
  const recentFactura = facturas[0];
  const openConsultas = () => {
    Alert.alert('Consultas con Númi', '¿Cómo quieres hacer tu consulta?', [
      { text: 'Chat', onPress: () => onOpenView('bot') },
      { text: 'Comando de voz', onPress: onOpenVoice },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.dashboardHome}>
      <Pressable style={styles.dashboardNumiPanel} onPress={openConsultas}>
        <View style={styles.dashboardNumiAccentPanel} />
        <View style={styles.dashboardNumiConfettiDotLarge} />
        <View style={styles.dashboardNumiConfettiDotSmall} />
        <View style={styles.dashboardNumiConfettiRing} />
        <View style={styles.dashboardNumiHeader}>
          <View style={styles.dashboardNumiCopy}>
            <Text style={styles.dashboardNumiName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.86}>Númi</Text>
            <Text style={styles.dashboardNumiSubtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>Tu asistente inteligente</Text>
            <View style={styles.dashboardNumiBubble}>
              <Text style={styles.dashboardNumiBubbleText} numberOfLines={4} adjustsFontSizeToFit minimumFontScale={0.86}>¡Hola! Soy Númi, tu asistente. Estoy aquí para ayudarte en lo que necesites.</Text>
            </View>
          </View>
          <Image source={require('./assets/numi-home.png')} style={styles.dashboardNumiImage} resizeMode="contain" />
        </View>
        <View style={styles.dashboardNumiActions}>
          <View style={styles.dashboardNumiAction}>
            <MaterialCommunityIcons name="message-processing-outline" size={24} color="#49D7FF" />
            <View style={styles.dashboardNumiActionCopy}>
              <Text style={styles.dashboardNumiActionTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>Consultas</Text>
              <Text style={styles.dashboardNumiActionText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>Haz tus preguntas</Text>
            </View>
          </View>
          <View style={styles.dashboardNumiAction}>
            <MaterialCommunityIcons name="lightning-bolt-outline" size={24} color="#49D7FF" />
            <View style={styles.dashboardNumiActionCopy}>
              <Text style={styles.dashboardNumiActionTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>Ayuda rápida</Text>
              <Text style={styles.dashboardNumiActionText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>Guías y pasos</Text>
            </View>
          </View>
          <View style={styles.dashboardNumiAction}>
            <MaterialCommunityIcons name="headset" size={24} color="#49D7FF" />
            <View style={styles.dashboardNumiActionCopy}>
              <Text style={[styles.dashboardNumiActionTitle, styles.dashboardNumiSupportTitle]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>Soporte</Text>
              <Text style={styles.dashboardNumiActionText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>Te acompañamos</Text>
            </View>
          </View>
        </View>
      </Pressable>

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
      <FormTopBar onBack={onCancel} onDiscard={() => { onReset(); onCancel(); }} />
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
        {form.precios.length < 3 ? (
          <SecondaryButton label="Agregar precio" onPress={() => onChange('precios', [...form.precios, ''])} />
        ) : null}
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
          label="Categoria *"
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
        <ToggleRow
          label="Producto activo"
          text={form.estado ? 'Disponible para facturacion y operaciones.' : 'No disponible para nuevas operaciones.'}
          value={form.estado}
          onChange={(value) => onChange('estado', value)}
        />
        <Field label="Observacion (opcional)" value={form.observacion} onChangeText={(value) => onChange('observacion', value.slice(0, 250))} />
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
      <FormTopBar onBack={onCancel} onDiscard={() => { onReset(); onCancel(); }} />
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
      <FormTopBar onBack={onCancel} onDiscard={() => { onReset(); onCancel(); }} />
      <Text style={styles.clientFormTitle}>{mode === 'edit' ? 'Editar subcategoria' : 'Nueva subcategoria'}</Text>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Operacion</Text>
        <Field label="Descripcion *" value={form.descripcion} onChangeText={(value) => onChange('descripcion', value)} />
        <DropdownField
          label="Categoria (opcional)"
          options={categorias.map((categoria) => ({ label: categoria.descripcion, value: categoria.idCategoria }))}
          value={form.idCategoria}
          placeholder="-- Seleccione --"
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
  onConsultarSri,
  consultandoSri,
  onSave,
}: {
  form: EmisorFormState;
  mode: Exclude<EmisorFormMode, null>;
  saving: boolean;
  onCancel: () => void;
  onChange: <K extends keyof EmisorFormState>(key: K, value: EmisorFormState[K]) => void;
  onReset: () => void;
  onSelectLogo: () => void;
  onConsultarSri: () => void;
  consultandoSri: boolean;
  onSave: () => void;
}) {
  return (
    <View style={styles.clientFormCard}>
      <FormTopBar onBack={onCancel} onDiscard={() => { onReset(); onCancel(); }} />
      <Text style={styles.clientFormTitle}>{mode === 'edit' ? 'Editar emisor' : 'Registrar emisor'}</Text>

      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>Informacion fiscal</Text>
        <Field label="Razon Social *" value={form.razonSocial} onChangeText={(value) => onChange('razonSocial', value)} />
        <Field label="RUC *" value={form.ruc} onChangeText={(value) => onChange('ruc', value.replace(/\D/g, ''))} keyboardType="number-pad" />
        <PrimaryButton label="Consultar en SRI" loading={consultandoSri} onPress={onConsultarSri} />
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
      <FormTopBar onBack={onCancel} onDiscard={() => { onClear(); onCancel(); }} />
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
  service = 'efact',
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
  service?: 'efact' | 'erubrica';
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
  const erubrica = service === 'erubrica';
  const accentColor = erubrica ? ERUBRICA_COLORS.primary : EFACT_THEME.colors.primary;
  const profileLabel = erubrica ? 'Perfil E-RUBRICA' : getTipoClienteLabel(form.tipoCliente) || 'Perfil E-FACT';
  const identificationLabel = identificaciones.find((item) => item.idTipoIdentificacion === form.idTipoIdentificacion)?.descripcion
    ?? identificaciones.find((item) => item.idTipoIdentificacion === form.idTipoIdentificacion)?.nombreTipo
    ?? 'Identificacion';

  if (!editing) {
    return (
      <View style={styles.profileOverview}>
        <View style={[styles.profileHeroCard, erubrica && styles.erubricaProfileHeroCard]}>
          <View style={styles.profileHeroTop}>
            {usesInitials ? (
              <InitialsAvatar initials={initials} size={88} />
            ) : (
              <Image source={{ uri: resolveImageUrl(form.avatarUrl) }} style={styles.profileHeroImage} />
            )}
            <View style={styles.profileHeroCopy}>
              <Text style={[styles.profileHeroEyebrow, erubrica && styles.erubricaProfileHeroEyebrow]}>{profileLabel}</Text>
              <Text style={styles.profileHeroName} numberOfLines={2}>{displayName}</Text>
              <Text style={styles.profileHeroMeta} numberOfLines={1}>{form.email || 'Correo no registrado'}</Text>
            </View>
          </View>
          <View style={styles.profileHeroActions}>
            <Pressable style={[styles.profileMainAction, erubrica && styles.erubricaProfileMainAction]} onPress={() => setEditing(true)}>
              <MaterialCommunityIcons name="account-edit-outline" size={19} color="#FFFFFF" />
              <Text style={styles.profileMainActionText}>Editar perfil</Text>
            </Pressable>
            <Pressable style={styles.profileSecondaryAction} onPress={onSelectAvatar}>
              <MaterialCommunityIcons name="camera-outline" size={18} color={accentColor} />
              <Text style={[styles.profileSecondaryActionText, erubrica && styles.erubricaProfileSecondaryActionText]}>Foto</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.profileInfoGrid}>
          <ProfileInfoTile icon="card-account-details-outline" label={identificationLabel} value={form.identificacion || 'Sin identificacion'} />
          <ProfileInfoTile icon="cellphone" label="Celular" value={form.celular || 'Sin celular'} />
          <ProfileInfoTile icon="map-marker-outline" label="Direccion" value={form.direccionEmpresa || 'Sin direccion'} full />
        </View>

        <View style={[styles.profileSecurityCard, erubrica && styles.erubricaProfileSecurityCard]}>
          <View style={[styles.profileSecurityIcon, erubrica && styles.erubricaProfileSecurityIcon]}>
            <MaterialCommunityIcons name="shield-check-outline" size={22} color={accentColor} />
          </View>
          <View style={styles.profileSecurityCopy}>
            <Text style={[styles.profileSecurityTitle, erubrica && styles.erubricaProfileSecurityTitle]}>Cuenta protegida</Text>
            <Text style={[styles.profileSecurityText, erubrica && styles.erubricaProfileSecurityText]}>Tu clave y tus accesos de firma se mantienen separados de tus comprobantes.</Text>
          </View>
        </View>
        <View style={styles.infoNotice}>
          <View style={styles.infoNoticeIcon}>
            <Text style={styles.infoNoticeIconText}>i</Text>
          </View>
          <View style={styles.infoNoticeBody}>
            <Text style={styles.infoNoticeTitle}>{erubrica ? 'Datos para firma electronica' : 'Datos para facturacion'}</Text>
            <Text style={styles.infoNoticeText}>{erubrica ? 'Esta informacion se utilizara para validar tu identidad dentro de E-Rubrica.' : 'Esta informacion se utilizara para emitir correctamente tus comprobantes.'}</Text>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.clientFormCard}>
      <View style={styles.profileEditHeader}>
        <View style={styles.profileEditTitleBlock}>
          <Text style={styles.clientFormTitle}>{erubrica ? 'Editar perfil E-Rubrica' : 'Editar perfil'}</Text>
          <Text style={styles.profileEditHint}>Actualiza solo los datos que necesites cambiar.</Text>
        </View>
        <Pressable style={styles.profileCloseEditButton} onPress={() => setEditing(false)}>
          <MaterialCommunityIcons name="close" size={20} color={accentColor} />
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
          <Text style={styles.infoNoticeTitle}>{erubrica ? 'Datos para firma electronica' : 'Datos para facturacion'}</Text>
          <Text style={styles.infoNoticeText}>{erubrica ? 'Esta informacion se utilizara para validar tu identidad dentro de E-Rubrica.' : 'Esta informacion se utilizara para emitir correctamente tus comprobantes.'}</Text>
        </View>
      </View>
      <View style={styles.formSectionBox}>
        <Text style={styles.clientFormSubtitle}>{erubrica ? 'Cuenta E-Rubrica' : 'Cuenta'}</Text>
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
