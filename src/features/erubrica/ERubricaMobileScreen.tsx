import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
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
import { ApiError, getAuthSessionCookie } from '../../services/apiClient';
import { loadBotHistory, saveBotHistory, sendBotMessage } from '../../services/botService';
import { API_BASE_URL } from '../../config/api';
import { AdminMobileItem, getAdminMobileModule } from '../../services/adminMobileService';
import { changePassword, checkAuth, login, recoverPassword, register } from '../../services/authService';
import { createCategoria, createSubcategoria, deleteCategoria, deleteSubcategoria, getCategorias, getSubcategorias, updateCategoria, updateSubcategoria } from '../../services/categoriasService';
import { createCliente, deleteCliente, getCiudades, getClienteLookups, getClientes, getProvincias, updateCliente } from '../../services/clientesService';
import { consultarEmisorSri, createEmisor, deleteEmisor, getEmisor, getEmisores, getFirmaEstado, updateEmisor, uploadFirmaArchivo } from '../../services/emisoresService';
import { anularFactura, buscarFacturaClientes, buscarFacturaProductos, enviarFacturaCorreo, FacturaListItem, FacturaPreparacion, FacturaProducto, getFacturaDetalle, getFacturaPdf, getFacturas, getFacturaPreparacion, getFacturaXml, guardarFactura, reintentarFacturaSri } from '../../services/facturasMobileService';
import { anularGuiaRemision, buscarGuiaClientes, buscarGuiaFacturas, buscarGuiaProductos, buscarGuiaTransportistas, emitirGuiaRemision, enviarGuiaRemisionCorreo, getGuiaRemisionPdf, getGuiaRemisionPreparacion, getGuiasRemision, getGuiaRemisionXml, guardarGuiaRemision, GuiaRemisionListItem } from '../../services/guiasRemisionMobileService';
import { getMenusByRol, hasMenusByRolEndpoint } from '../../services/menuService';
import { buscarLiquidacionProductos, buscarLiquidacionProveedores, emitirLiquidacionCompra, enviarLiquidacionCompraCorreo, getLiquidacionCompraPdf, getLiquidacionCompraPreparacion, getLiquidacionesCompra, getLiquidacionCompraXml, guardarLiquidacionCompra, LiquidacionCompraListItem } from '../../services/liquidacionesCompraMobileService';
import { anularNotaCredito, buscarNotaCreditoFacturas, emitirNotaCredito, emitirNotaCreditoAutomatica, enviarNotaCreditoCorreo, getNotaCreditoDetallesDisponibles, getNotaCreditoPdf, getNotaCreditoPreparacion, getNotasCredito, getNotaCreditoXml, guardarNotaCredito, NotaCreditoListItem } from '../../services/notasCreditoMobileService';
import { anularNotaDebito, buscarNotaDebitoFacturas, emitirNotaDebito, enviarNotaDebitoCorreo, getNotaDebitoDetallesFactura, getNotaDebitoPdf, getNotaDebitoPreparacion, getNotasDebito, getNotaDebitoXml, guardarNotaDebito, NotaDebitoListItem } from '../../services/notasDebitoMobileService';
import { clearNotificaciones, dismissNotificacion, getNotificaciones, NotificacionItem } from '../../services/notificacionesService';
import { syncDeviceNotifications } from '../../services/deviceNotificationsService';
import { CompraDocumentosEstado, CompraDocumentosTransferenciaInput, createOperationalItem, deleteOperationalItem, getCompraDocumentosEstado, getEstadoCuentaDetalle, getEstadoCuentaExcel, getEstadoCuentaListadoExcel, getEstadoCuentaPdf, getOperationalMobileModule, getOperationalModuleConfig, iniciarPagoCompraDocumentos, OperationalMobileItem, OperationalModule, registrarTransferenciaCompraDocumentos, updateOperationalItem } from '../../services/operationalMobileService';
import { getPerfil, updatePerfil, uploadPerfilAvatar } from '../../services/perfilService';
import { createPuntoEmision, deletePuntoEmision, getPuntoEmisionSiguienteSecuencial, getPuntosEmision, markPuntoPrincipal, PuntoDocumentoKey, savePuntoEmisionSecuenciaInicial, updatePuntoEmision } from '../../services/puntosEmisionService';
import { createProducto, deleteProducto, getProducto, getProductoLookups, getProductos, getProductoSubcategorias, updateProducto } from '../../services/productosService';
import { emitirRetencionSri, enviarRetencionCorreo, getRetencionPdf, getRetenciones, getRetencionXml, RetencionListItem } from '../../services/retencionesMobileService';
import { ERubricaDashboard, ERubricaDocumentoFirmado, ERubricaDocumentoPendiente, ERubricaEmisor, ERubricaFirmaEstado, buscarERubricaSolicitudesProveedor, cargarERubricaDocumentoPendiente, configurarERubricaFirma, crearERubricaSolicitud, descargarERubricaFirmaP12, eliminarERubricaDocumentoPendiente, enviarTransferenciaERubricaSolicitud, firmarERubricaDocumento, getERubricaDashboard, getERubricaDocumentosFirmados, getERubricaDocumentosPendientes, getERubricaEmisores, getERubricaFirmaEstado, getERubricaPlan, getERubricaProductos, getERubricaRenovacion, getERubricaSaldo, iniciarPagoERubricaSolicitud, sincronizarERubricaPendientes, sincronizarERubricaSolicitud, validarERubricaFirmaPdf, validarERubricaFirmaTemporal, validarERubricaQr } from '../../services/erubricaMobileService';
import { ERubricaTab, getERubricaTabTitle, SOLICITUD_FILES_INITIAL, SOLICITUD_FORM_INITIAL, SolicitudDocumentoKey } from './erubricaTypes';
import { ChangePasswordRequest, DynamicMenu, LoginResponse, RegisterRequest, ServiceAccess, TipoDocumento } from '../../types/auth';
import { CategoriaCatalogo, CiudadLookup, Cliente, ClienteLookups, Emisor, FirmaEstado, PerfilLookup, PerfilUsuario, Producto, ProductoLookups, ProductoTipo, ProvinciaLookup, PuntoEmision, PuntosEmisionData, SubcategoriaCatalogo, SubcategoriaLookup } from '../../types/business';
import {
  sanitizeIdentificacion,
  validateChangePassword,
  validateEmail,
  validateLogin,
  validateRegisterForm,
} from '../../utils/authValidation';
import { ItemDetailModal, ResultCollection } from '../../components/data/ResultCollection';
import { ExternalLink, Field, InlineSwitch, LoginActionTiles, MessageBox, PrimaryButton, SearchField, SecondaryButton, SecurityNotice, SegmentButton, TextLink } from '../../components/ui/FormControls';
import type { BotFeedbackState, BotMessage } from '../../types/bot';
import { GlobalSearchModal as ExtractedGlobalSearchModal } from '../../components/search/GlobalSearchModal';
import type { GlobalSearchResult as ExtractedGlobalSearchResult } from '../../types/globalSearch';
import { InvoiceProgressSteps as SharedInvoiceProgressSteps, InvoiceSummaryRow } from '../../components/facturacion/InvoiceShared';
import { styles } from '../../styles/appStyles';
import { DocumentActionsMenu } from '../../components/documents/DocumentActionsMenu';
import { EfactBotScreen } from '../../components/bot/EfactBotScreen';
import type { BotVoiceControls } from '../../components/bot/EfactBotScreen';
import { InitialSequenceModal } from '../../components/documentos/InitialSequenceModal';
import { PuntosEmisionScreen } from '../../components/puntos/PuntosEmisionScreen';
import { DirectoryTabButton, DropdownField, FormTopBar, ToggleRow } from '../../components/ui/FormShared';
import { DashboardActivityItem, DashboardChartCard, DashboardFavorite, DashboardMetric, DashboardPrimaryAction, DashboardQuickAction, DashboardServiceRow, DashboardStatCard } from '../../components/dashboard/DashboardWidgets';
import { ModuleCard, NavButton, PortalBottomNav, PortalHeaderAvatar } from '../../components/portal/PortalNavigation';
import { CatalogCard, SubcategoriaCard } from '../../components/catalog/CatalogCards';
import { InitialsAvatar, MenuItem } from '../../components/ui/MenuItem';
import { BiometricSetupModal, BrandLockup, BrandMark, LoadingScreen, ScreenFrame } from '../../components/auth/AuthWidgets';
import { EFACT_THEME, ERUBRICA_COLORS } from '../../styles/theme';
import { getDocumentSerieOptions, getEffectiveDocumentSerie, getNextSequence, getNextSequenceFromOptions, getPuntoDocumentSequences, getPuntoSerie, getSelectedDocumentSerieOption, getSerieCodemisorFromOptions, getSerieLabel, getSerieLabelFromOptions, getSerieValue, normalizeSerieCode, normalizeSerieDisplay, serieNeedsInitialSequence, usePreferredDocumentSerie } from '../../utils/documentSeries';
import type { NuevaFacturaFormState, NuevaFacturaLinea } from '../../types/invoices';
import { formatDocumentDate, formatMoney, listItemKey } from '../../utils/documentFormatting';

type WorkspaceView = string;
type MobileModule = {
  view: WorkspaceView;
  title: string;
  description: string;
};

const PDFJS_VIEWER_URI = Image.resolveAssetSource(require('../../assets/pdfjs/pdf.min.pdf')).uri;
const PDFJS_WORKER_URI = Image.resolveAssetSource(require('../../assets/pdfjs/pdf.worker.min.pdf')).uri;

function usePdfJsSource(uri: string) {
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const value = uri.startsWith('file:')
          ? await FileSystem.readAsStringAsync(uri)
          : await (await fetch(uri)).text();
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

function EmptyState({ title, text }: { title: string; text: string }) {
  return <View style={styles.emptyState}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>;
}

type MessageState = {
  type: 'success' | 'error' | 'info';
  text: string;
} | null;

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
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

function getDocumentAssetUrl(response: { url?: string | null } | string) {
  const value = typeof response === 'string' ? response : response.url;
  if (!value) return '';
  return value.startsWith('http') ? value : `${API_BASE_URL.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
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

export function PdfDocumentPreview({ uri }: { uri: string }) {
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

export function ERubricaMobileScreen({
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
  const historialSolicitudesPageActual = Math.min(historialSolicitudesPage, totalHistorialSolicitudesPages);
  const historialSolicitudesPagina = filteredHistorialSolicitudes.slice((historialSolicitudesPageActual - 1) * 10, historialSolicitudesPageActual * 10);
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
    if ((tab === 'firma-config' || tab === 'ver-mis-firmas') && !firmaEmisoresCargados) void cargarFirmaActiva();
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
      form.append('pdf', { uri: pdfFile.uri, name: pdfFile.name || 'documento.pdf', type: pdfFile.mimeType || 'application/pdf' } as unknown as Blob);
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
  const previewPdfDocument = () => {
    if (!pdfFile) {
      Alert.alert('Selecciona un PDF', 'Carga primero el documento que deseas previsualizar.');
      return;
    }
    onPreviewPdf(pdfFile);
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
    ...(solicitudPersona !== 'Persona natural con cédula' ? [{ key: 'rucFile' as SolicitudDocumentoKey, label: 'Archivo RUC *', types: ['application/pdf'] }] : []),
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
    if (solicitudPersona === 'Representante legal' && (!solicitudForm.ruc.trim() || !solicitudForm.razonSocialEmpresa.trim() || !solicitudForm.departamento.trim() || !solicitudForm.cargo.trim() || !solicitudForm.motivoFirma.trim() || !solicitudForm.representanteTipoDocumento.trim() || !solicitudForm.representanteIdentificacion.trim() || !solicitudForm.representanteNombres.trim() || !solicitudForm.representanteApellidos.trim())) {
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
            <SecondaryButton accentColor={ERUBRICA_COLORS.primary} label="Previsualizar documento" onPress={previewPdfDocument} />
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
              <Text style={styles.erubricaHistoryFooter}>Página {historialSolicitudesPage} de {totalHistorialSolicitudesPages}</Text>
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
                <Text style={styles.erubricaPlanPill}>Firma vigente</Text>
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
              <PrimaryButton accentColor={ERUBRICA_COLORS.primary} label="Solicitar Nueva Firma" loading={false} onPress={() => selectTab('nueva-solicitud')} />
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
              <Text style={styles.erubricaConfigStatusOwner}>{firmaEfact ? `Emisor: ${firmaEfact.razonSocial ?? firmaEfact.ruc ?? 'E-Fact'}` : `Titular: ${firmaTitular}`}</Text>
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
            <Pressable style={styles.erubricaHistoryValidateButton} onPress={() => selectTab('validar-firma')}>
              <MaterialCommunityIcons name="shield-check-outline" size={14} color={ERUBRICA_COLORS.text} />
              <Text style={styles.erubricaHistoryValidateText}>Validar firma</Text>
            </Pressable>
            <Pressable style={styles.erubricaHistoryValidateButton} onPress={() => void cargarDocumentosFirmados()} disabled={loadingDocumentosFirmados}>
              <MaterialCommunityIcons name="refresh" size={14} color={ERUBRICA_COLORS.text} />
              <Text style={styles.erubricaHistoryValidateText}>{loadingDocumentosFirmados ? 'Actualizando...' : 'Actualizar'}</Text>
            </Pressable>
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
                      <Pressable style={styles.erubricaHistoryIconButton} onPress={() => previewUrl ? onPreviewRemotePdf(previewUrl, documentName) : Alert.alert('Vista previa no disponible', 'Este registro no incluye un PDF para mostrar.')}>
                        <MaterialCommunityIcons name="eye-outline" size={17} color="#5C748A" />
                      </Pressable>
                      <Pressable style={styles.erubricaHistoryIconButton} onPress={() => downloadUrl ? onDownloadRemotePdf(downloadUrl, documentName) : Alert.alert('Descarga no disponible', 'Este registro no incluye un PDF para descargar.')}>
                        <MaterialCommunityIcons name="download-outline" size={17} color="#5C748A" />
                      </Pressable>
                      <Pressable style={styles.erubricaHistoryIconButton} onPress={() => void validarDocumentoFirmado(item)}>
                        <MaterialCommunityIcons name="shield-check-outline" size={17} color={ERUBRICA_COLORS.primary} />
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
          <Image source={require('../../assets/numi-home.png')} style={styles.dashboardNumiImage} resizeMode="contain" />
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
