import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, AppState, Easing, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import * as Speech from 'expo-speech';
import type * as SpeechRecognition from 'expo-speech-recognition';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiError } from '../../services/apiClient';
import { clearBotHistory, loadBotHistory, saveBotHistory, sendBotMessage } from '../../services/botService';
import type { BotFacturaDraft, BotSelectionOption, BotSessionScope, BotWorkflowState } from '../../services/botService';
import type { BotFeedbackState, BotMessage, BotProgressStep } from '../../types/bot';
import { NumiThinkingIndicator } from './NumiThinkingIndicator';
import { styles } from '../../styles/appStyles';

type SpeechRecognitionBindings = typeof SpeechRecognition;
type VoiceOverlayState = 'listening' | 'review' | 'processing' | 'response';
type VoiceFlowState = 'idle' | 'listening' | 'processing' | 'speaking' | 'awaitingConfirmation' | 'error';

let speechRecognitionBindings: SpeechRecognitionBindings | null = null;
try {
  speechRecognitionBindings = require('expo-speech-recognition') as SpeechRecognitionBindings;
} catch {
  // Expo Go no incluye este módulo nativo; el development build sí lo carga.
}

const ExpoSpeechRecognitionModule = speechRecognitionBindings?.ExpoSpeechRecognitionModule ?? null;
const useSpeechRecognitionEvent: SpeechRecognitionBindings['useSpeechRecognitionEvent'] = speechRecognitionBindings?.useSpeechRecognitionEvent ?? (() => undefined);
const voiceRecognitionAvailable = ExpoSpeechRecognitionModule !== null;
export const botVoiceRecognitionAvailable = voiceRecognitionAvailable;
const speechContext = [
  'Númi', 'e-fact', 'Jordy Prado', 'Jordy', 'Prado', 'factura', 'facturación', 'RUC', 'cédula', 'identificación',
  'cliente', 'proveedor', 'producto', 'servicio', 'cantidad', 'precio', 'descuento', 'IVA', 'subtotal', 'impuesto', 'total',
  'retención', 'guía de remisión', 'nota de crédito', 'nota de débito', 'emitir', 'anular', 'cancelar', 'confirmar', 'confirmado',
  'contado', 'crédito', 'efectivo', 'transferencia', 'tarjeta', 'débito', 'cheque', 'banco', 'plazo', 'vencimiento',
  'modificar IVA', 'cambiar IVA', 'IVA cero', 'IVA quince', 'quitar IVA', 'aplicar IVA',
  'modificar precio', 'cambiar precio', 'subir precio', 'bajar precio', 'precio unitario',
  'modificar cantidad', 'cambiar cantidad', 'agregar cantidad', 'quitar cantidad',
  'aplicar descuento', 'quitar descuento', 'descuento porcentual', 'descuento en dólares',
  'un producto', 'varios productos', 'todos los productos', 'cada producto', 'este producto', 'ese producto',
  'crear factura', 'nueva factura', 'hacer factura', 'preparar factura', 'resumen de factura',
  'buscar cliente', 'seleccionar cliente', 'cliente existente', 'crear cliente', 'datos del cliente',
  'buscar producto', 'seleccionar producto', 'producto existente', 'crear producto', 'catálogo de productos',
  'agregar producto', 'eliminar producto', 'quitar producto', 'reemplazar producto', 'duplicar producto',
  'costo', 'valor', 'valor unitario', 'importe', 'importe total', 'base imponible', 'sin IVA',
  'cero por ciento', 'cinco por ciento', 'ocho por ciento', 'quince por ciento',
  'descuento global', 'descuento por producto', 'porcentaje', 'por ciento', 'dólares',
  'pagar en efectivo', 'pagar con tarjeta', 'pagar por transferencia', 'pago a crédito', 'días de crédito',
  'editar factura', 'corregir factura', 'revisar factura', 'continuar', 'volver', 'siguiente', 'anterior',
  'opción uno', 'opción dos', 'opción tres', 'primera opción', 'segunda opción', 'tercera opción',
  'NC', 'nota de crédito', 'anular factura', 'devolución', 'corrección de factura',
  'ND', 'nota de débito', 'recargo', 'intereses', 'valor adicional',
  'liquidación', 'liquidación de compra', 'proveedor', 'compra', 'comprobante de compra',
  'retención', 'comprobante de retención', 'retener', 'impuesto retenido', 'SRI',
  'guía de remisión', 'traslado', 'destinatario', 'punto de partida', 'punto de llegada',
  'XML', 'PDF', 'autorización', 'clave de acceso', 'documento electrónico', 'comprobante electrónico',
  'COT', 'cotización', 'proforma', 'presupuesto', 'oferta comercial', 'pedido',
  'GR', 'guía de remisión', 'remitente', 'transportista', 'placa', 'fecha de traslado',
  'factura de compra', 'documento de sustento', 'sustento tributario', 'reembolso',
  'ver documentos', 'documentos generados', 'historial de documentos', 'consultar comprobantes',
];

const supportedBotRoutes = new Set([
  '/dashboard', '/facturacion', '/facturacion/nueva', '/facturacion/nota-credito', '/cotizaciones',
  '/facturacion/notas-credito', '/facturacion/notas-credito-generadas', '/facturacion/nota-debito',
  '/facturacion/notas-debito', '/facturacion/notas-debito-generadas', '/facturacion/retenciones',
  '/facturacion/retenciones-generadas', '/facturacion/guia-remision', '/compras/importar-xml',
  '/compras/nueva-liquidacion', '/compras/liquidaciones-generadas', '/facturas', '/clientes', '/productos',
  '/categorias', '/notas-credito', '/notas-debito', '/guias-remision', '/compras', '/proveedores', '/perfil',
  '/reportes', '/reportes/documentos', '/e-rubrica', '/cuentas-cobrar', '/estado-cuenta', '/recargas',
  '/comprar-documentos', '/centro-normativo', '/emisor', '/nuevo-emisor', '/firma', '/nueva-firma',
  '/punto-emision', '/e-rubrica/configuracion/firma', '/e-rubrica/mis-firmas', '/solicitud/pagos',
  '/e-rubrica/configuracion/plan', '/e-rubrica/plan-disponible', '/solicitud/nueva', '/e-rubrica/documentos',
  '/e-rubrica/documentos-por-firmar', '/e-rubrica/documentos/por-firmar', '/e-rubrica/documentos/firmar', '/e-rubrica/documentos/validar-firma',
]);

export type BotVoiceControls = {
  available: boolean;
  start: () => Promise<void>;
  startHandsFree: () => void;
  stop: () => void;
  dismiss: () => void;
};

export function EfactBotScreen({
  userName,
  userId,
  onNavigate,
  onUiAction,
  voiceControlsRef,
  voiceOnly = false,
  embedded = false,
  bottomInset = 0,
  reduceMotion = false,
  messages,
  setMessages,
  draft,
  setDraft,
  feedbackByMessage,
  setFeedbackByMessage,
  assistantContext,
  welcomeText,
  quickActions,
  theme = 'efact',
  sessionScope = 'efact',
  viewKey,
  workflow,
  onWorkflowChange,
}: {
  userName: string;
  userId: number;
  onNavigate?: (route: string) => void;
  onUiAction?: (action: string) => void;
  voiceControlsRef?: MutableRefObject<BotVoiceControls | null>;
  voiceOnly?: boolean;
  embedded?: boolean;
  bottomInset?: number;
  reduceMotion?: boolean;
  messages: BotMessage[];
  setMessages: Dispatch<SetStateAction<BotMessage[]>>;
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>;
  feedbackByMessage: BotFeedbackState;
  setFeedbackByMessage: Dispatch<SetStateAction<BotFeedbackState>>;
  assistantContext?: string;
  welcomeText?: string;
  quickActions?: Array<{ label: string; command: string }>;
  theme?: 'efact' | 'erubrica';
  sessionScope?: BotSessionScope;
  viewKey?: string;
  workflow?: BotWorkflowState | null;
  onWorkflowChange?: (workflow: BotWorkflowState | null) => void;
}) {
  const erubricaTheme = theme === 'erubrica';
  const [sending, setSending] = useState(false);
  const [thinkingRequest, setThinkingRequest] = useState('');
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [invoiceDraft, setInvoiceDraft] = useState<BotFacturaDraft | null>(null);
  const [missingData, setMissingData] = useState<string[]>([]);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [invoiceState, setInvoiceState] = useState('');
  const [selectionOptions, setSelectionOptions] = useState<BotSelectionOption[]>([]);
  const [progress, setProgress] = useState<BotProgressStep[]>([]);
  const [configurationRoutes, setConfigurationRoutes] = useState<string[]>([]);
  const [pendingOperation, setPendingOperation] = useState<{ tipo?: string; resumen?: string; expiraEn?: string | null } | null>(null);
  const [retryRequest, setRetryRequest] = useState<{ text: string; modo: 'texto' | 'voz'; requestId: string } | null>(null);
  const [workflowStale, setWorkflowStale] = useState(false);
  const [voiceOverlayState, setVoiceOverlayState] = useState<VoiceOverlayState | null>(null);
  const [voiceResponse, setVoiceResponse] = useState('');
  const [handsFreeEnabled, setHandsFreeEnabled] = useState(false);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);
  const [chatTop, setChatTop] = useState<number | null>(null);
  const voiceHolding = useRef(false);
  const voiceShouldSubmit = useRef(false);
  const voiceRecognitionStarted = useRef(false);
  const voiceTranscriptRef = useRef('');
  const handsFreeEnabledRef = useRef(false);
  const handsFreeAwaitingConfirmationRef = useRef(false);
  const handsFreeResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceNavigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceFlowStateRef = useRef<VoiceFlowState>('idle');
  const voiceStartInFlightRef = useRef(false);
  const voicePermissionGrantedRef = useRef(false);
  const voiceLanguageRef = useRef('es-EC');
  const voiceLocalesResolvedRef = useRef(false);
  const speechVoicePromiseRef = useRef<Promise<string | undefined> | null>(null);
  const voiceAppStateRef = useRef(AppState.currentState);
  const voiceConfidenceRef = useRef(0);
  const handsFreeNoSpeechCountRef = useRef(0);
  const speechGenerationRef = useRef(0);
  const speechMutedRef = useRef(false);
  const requestGenerationRef = useRef(0);
  const sendingRef = useRef(false);
  const queuedRequestsRef = useRef<Array<{ text: string; modo: 'texto' | 'voz'; requestId?: string; messageAdded: boolean }>>([]);
  const botRequestAbortRef = useRef<AbortController | null>(null);
  const messageSequenceRef = useRef(0);
  const messagesScrollRef = useRef<ScrollView>(null);
  const botContainerRef = useRef<View>(null);
  const voiceInputRef = useRef<TextInput>(null);
  const scopedHistoryReadyRef = useRef(sessionScope !== 'erubrica');
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const compactLayout = windowWidth < 360;
  const windowHeightRef = useRef(windowHeight);

  useEffect(() => {
    if (workflow === undefined) return;
    setInvoiceDraft(workflow?.invoiceDraft ?? null);
    setMissingData(workflow?.missingData ?? []);
    setRequiresConfirmation(workflow?.requiresConfirmation ?? false);
    setInvoiceState(workflow?.invoiceState ?? '');
    setSelectionOptions(workflow?.selectionOptions ?? []);
    setProgress(workflow?.progress ?? []);
    setConfigurationRoutes(workflow?.configurationRoutes ?? []);
    setPendingOperation(workflow?.pendingOperation ?? null);
    setWorkflowStale(workflow?.workflowStale ?? false);
  }, [workflow]);

  useEffect(() => {
    if (sessionScope !== 'erubrica' || !userId) return undefined;
    let mounted = true;
    scopedHistoryReadyRef.current = false;
    void loadBotHistory(userId, sessionScope).then((history) => {
      if (!mounted) return;
      if (history?.messages.length) {
        setMessages((current) => {
          const currentWithoutWelcome = current.filter((message) => message.id !== 'welcome');
          if (!currentWithoutWelcome.length) return history.messages;
          const currentIds = new Set(currentWithoutWelcome.map((message) => message.id));
          return [...history.messages.filter((message) => !currentIds.has(message.id)), ...currentWithoutWelcome];
        });
        setFeedbackByMessage((current) => ({ ...history.feedbackByMessage, ...current }));
      }
      scopedHistoryReadyRef.current = true;
    }).catch(() => {
      if (mounted) scopedHistoryReadyRef.current = true;
    });
    return () => { mounted = false; };
  }, [sessionScope, userId, setMessages, setFeedbackByMessage]);

  useEffect(() => {
    if (sessionScope !== 'erubrica' || !userId || !scopedHistoryReadyRef.current) return;
    void saveBotHistory(userId, messages, feedbackByMessage, null, sessionScope);
  }, [sessionScope, userId, messages, feedbackByMessage]);

  useEffect(() => {
    const messageIds = new Set(messages.map((message) => message.id));
    setFeedbackByMessage((current) => {
      const next = Object.fromEntries(Object.entries(current).filter(([id]) => messageIds.has(id))) as BotFeedbackState;
      const same = Object.keys(current).length === Object.keys(next).length
        && Object.entries(current).every(([id, value]) => next[id] === value);
      return same ? current : next;
    });
  }, [messages, setFeedbackByMessage]);

  const clearVoiceTimers = () => {
    if (voiceNavigationTimerRef.current) clearTimeout(voiceNavigationTimerRef.current);
    voiceNavigationTimerRef.current = null;
    if (handsFreeResumeTimerRef.current) clearTimeout(handsFreeResumeTimerRef.current);
    handsFreeResumeTimerRef.current = null;
  };

  const transitionVoice = (state: VoiceFlowState, overlay: VoiceOverlayState | null) => {
    voiceFlowStateRef.current = state;
    setVoiceOverlayState(overlay);
  };

  const showVoiceError = (message: string) => {
    setError(message);
    setVoiceResponse(message);
    transitionVoice('error', voiceOnly || handsFreeEnabledRef.current ? 'response' : null);
  };

  const disableHandsFreeState = () => {
    clearVoiceTimers();
    handsFreeEnabledRef.current = false;
    handsFreeAwaitingConfirmationRef.current = false;
    setHandsFreeEnabled(false);
  };

  const stopBotSpeech = async () => {
    speechGenerationRef.current += 1;
    try {
      await Speech.stop();
    } catch {
      // Detener una locución previa no debe impedir la siguiente acción.
    }
  };

  const abortBotRequest = () => {
    botRequestAbortRef.current?.abort();
    botRequestAbortRef.current = null;
  };

  const cancelPendingRequest = () => {
    requestGenerationRef.current += 1;
    queuedRequestsRef.current = [];
    abortBotRequest();
    sendingRef.current = false;
    setSending(false);
    setThinkingRequest('');
    setRetryRequest(null);
    setError('');
    clearVoiceTimers();
    disableHandsFreeState();
    void stopBotSpeech();
    if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.abort();
    setListening(false);
    transitionVoice('idle', null);
  };

  const createMessageId = (role: BotMessage['role']) => `${role}-${Date.now()}-${messageSequenceRef.current += 1}`;

  const speakCurrentBotText = (text: string) => {
    if (speechMutedRef.current) return Promise.resolve(false);
    const generation = ++speechGenerationRef.current;
    const speechVoice = speechVoicePromiseRef.current ??= resolveSpanishMaleVoice();
    return speechVoice.then((voice) => {
      if (speechGenerationRef.current !== generation) return false;
      return speakBotText(text, () => speechGenerationRef.current !== generation, voice);
    });
  };

  const toggleSpeechMuted = () => {
    const nextMuted = !speechMutedRef.current;
    speechMutedRef.current = nextMuted;
    setSpeechMuted(nextMuted);
    if (nextMuted) void stopBotSpeech();
  };

  const startNewConversation = async () => {
    Alert.alert('Nueva conversación', 'Se limpiará el chat actual y se iniciará una nueva sesión con Númi.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Continuar', style: 'destructive', onPress: () => void resetConversation() },
    ]);
  };

  const resetConversation = async () => {
    requestGenerationRef.current += 1;
    queuedRequestsRef.current = [];
    abortBotRequest();
    sendingRef.current = false;
    setSending(false);
    setThinkingRequest('');
    void stopBotSpeech();
    clearVoiceTimers();
    voiceHolding.current = false;
    voiceShouldSubmit.current = false;
    handsFreeEnabledRef.current = false;
    handsFreeAwaitingConfirmationRef.current = false;
    setHandsFreeEnabled(false);
    if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.abort();
    await clearBotHistory(userId, sessionScope);
    setMessages([]);
    setDraft('');
    setFeedbackByMessage({});
    onWorkflowChange?.(null);
    setError('');
    setVoiceTranscript('');
    setInvoiceDraft(null);
    setMissingData([]);
    setRequiresConfirmation(false);
    setInvoiceState('');
    setSelectionOptions([]);
    setProgress([]);
    setConfigurationRoutes([]);
    setPendingOperation(null);
    setRetryRequest(null);
    setWorkflowStale(false);
    transitionVoice('idle', handsFreeEnabledRef.current ? 'listening' : null);
    setVoiceResponse('');
    setQuickActionsOpen(false);
  };

  useEffect(() => {
    windowHeightRef.current = windowHeight;
  }, [windowHeight]);

  useEffect(() => () => {
    requestGenerationRef.current += 1;
    queuedRequestsRef.current = [];
    abortBotRequest();
    clearVoiceTimers();
    void stopBotSpeech();
    if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.abort();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      voiceAppStateRef.current = nextState;
      if (nextState !== 'active') {
        clearVoiceTimers();
        void stopBotSpeech();
        if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.abort();
        setListening(false);
        if (handsFreeEnabledRef.current) transitionVoice('idle', null);
        return;
      }

      if (handsFreeEnabledRef.current && !sending) scheduleHandsFreeResume(700);
    });

    return () => subscription.remove();
  }, [sending]);

  const measureChatTop = () => {
    requestAnimationFrame(() => {
      const container = botContainerRef.current;
      if (!container || typeof container.measureInWindow !== 'function') return;
      container.measureInWindow((_x: number, y: number) => {
        if (Number.isFinite(y)) setChatTop(y);
      });
    });
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardVisible(true);
      const nextKeyboardTop = event.endCoordinates?.screenY ?? windowHeightRef.current - (event.endCoordinates?.height ?? 0);
      setKeyboardTop(nextKeyboardTop);
      measureChatTop();
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardTop(null);
      measureChatTop();
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollMessagesToEnd = (animated = true) => {
    requestAnimationFrame(() => messagesScrollRef.current?.scrollToEnd({ animated }));
  };

  useEffect(() => {
    scrollMessagesToEnd(false);
  }, [messages.length, sending]);

  useSpeechRecognitionEvent('start', () => {
    voiceRecognitionStarted.current = true;
    setListening(true);
    transitionVoice('listening', 'listening');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const result = selectVoiceResult(event.results ?? [], selectionOptions);
    const transcript = result?.transcript.trim() ?? '';
    if (!transcript) return;
    handsFreeNoSpeechCountRef.current = 0;
    voiceConfidenceRef.current = result?.confidence ?? 0;
    voiceTranscriptRef.current = transcript;
    setVoiceTranscript(transcript);
  });

  useSpeechRecognitionEvent('error', (event) => {
    voiceRecognitionStarted.current = false;
    setListening(false);
    if (event.error === 'aborted') return;
    transitionVoice('idle', null);
    const permanentError = event.error === 'not-allowed'
      || event.error === 'service-not-allowed'
      || event.error === 'language-not-supported';
    if (permanentError) {
      voicePermissionGrantedRef.current = false;
      disableHandsFreeState();
    }
    if (event.error === 'no-speech' && handsFreeEnabledRef.current) {
      handsFreeNoSpeechCountRef.current += 1;
      if (handsFreeNoSpeechCountRef.current >= 3) {
        clearVoiceTimers();
        handsFreeEnabledRef.current = false;
        handsFreeAwaitingConfirmationRef.current = false;
        voiceHolding.current = false;
        voiceShouldSubmit.current = false;
        setHandsFreeEnabled(false);
        const voiceMessage = 'No detecté una orden. Pausaré el modo manos libres; puedes activarlo nuevamente cuando quieras.';
        setVoiceResponse(voiceMessage);
        transitionVoice('error', 'response');
        void speakCurrentBotText(voiceMessage);
        return;
      }
      transitionVoice(handsFreeAwaitingConfirmationRef.current ? 'awaitingConfirmation' : 'listening', handsFreeAwaitingConfirmationRef.current ? 'response' : 'listening');
      if (!handsFreeAwaitingConfirmationRef.current) scheduleHandsFreeResume(700);
    }
    if (event.error !== 'no-speech') {
      voiceHolding.current = false;
      voiceShouldSubmit.current = false;
      const message = event.message || 'No se pudo reconocer la voz. Repetiré la escucha.';
      showVoiceError(message);
      if (handsFreeEnabledRef.current && !permanentError) {
        const voiceError = 'No pude entenderte bien. Repetiré la escucha; puedes decir la orden nuevamente.';
        setVoiceResponse(voiceError);
        transitionVoice('error', 'response');
        void speakCurrentBotText(voiceError).then((completed) => {
          if (completed) scheduleHandsFreeResume(1400);
        });
      }
    }
  });

  useSpeechRecognitionEvent('end', () => {
    voiceRecognitionStarted.current = false;
    setListening(false);
    const shouldProcessTranscript = voiceShouldSubmit.current || voiceHolding.current;
    voiceHolding.current = false;
    if (!shouldProcessTranscript) {
      if (handsFreeEnabledRef.current && voiceAppStateRef.current === 'active') {
        transitionVoice(handsFreeAwaitingConfirmationRef.current ? 'awaitingConfirmation' : 'listening', handsFreeAwaitingConfirmationRef.current ? 'response' : 'listening');
        scheduleHandsFreeResume(500);
      } else {
        transitionVoice('idle', null);
      }
      return;
    }
    voiceShouldSubmit.current = false;
    const transcript = voiceTranscriptRef.current.trim();
    if (transcript) {
      if (handsFreeEnabledRef.current) {
        if (handsFreeAwaitingConfirmationRef.current) {
          if (isExplicitConfirmation(transcript)) {
            transitionVoice('processing', 'processing');
            void send(pendingOperation ? 'confirmar' : 'emitir', 'voz');
          } else if (isExplicitCancellation(transcript)) {
            transitionVoice('processing', 'processing');
            void send('cancelar', 'voz');
          } else {
            const voiceMessage = 'Para ejecutar esta operación di “confirmado” o pulsa el botón Confirmar.';
            setVoiceResponse(voiceMessage);
            transitionVoice('awaitingConfirmation', 'response');
            void speakCurrentBotText(voiceMessage).then((completed) => {
              if (completed) scheduleHandsFreeResume(350);
            });
          }
        } else {
          if ((voiceConfidenceRef.current > 0 && voiceConfidenceRef.current < 0.45) || isLikelyAmbientVoice(transcript)) {
            const voiceMessage = 'No estoy suficientemente segura de lo que entendí. Repetiré la escucha.';
            setVoiceResponse(voiceMessage);
            transitionVoice('error', 'response');
            void speakCurrentBotText(voiceMessage).then((completed) => {
              if (completed) scheduleHandsFreeResume(350);
            });
            return;
          }
          transitionVoice('processing', 'processing');
          const command = normalizeVoiceSelectionCommand(transcript, selectionOptions);
          void send(command, 'voz');
        }
      } else {
        setDraft(transcript);
        transitionVoice('idle', 'review');
      }
    } else {
      transitionVoice('idle', handsFreeEnabledRef.current ? 'listening' : null);
    }
  });

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', text: welcomeText ?? `Hola ${userName || ''}. Soy Númi, tu asistente de E-FACT. ¿En qué te ayudo hoy?` }]);
    }
  }, [messages.length, setMessages, userName, welcomeText]);

  const send = async (preset?: string, modo: 'texto' | 'voz' = 'texto', requestIdOverride?: string, messageAlreadyAdded = false) => {
    const text = (preset ?? draft).trim();
    if (!text) return;
    if (sendingRef.current) {
      const messageAdded = !requestIdOverride;
      if (messageAdded) setMessages((current) => [...current, { id: createMessageId('user'), role: 'user', text }]);
      queuedRequestsRef.current.push({ text, modo, requestId: requestIdOverride, messageAdded });
      setDraft('');
      return;
    }
    const voiceRequest = modo === 'voz';
    const requestGeneration = requestGenerationRef.current + 1;
    requestGenerationRef.current = requestGeneration;
    if (voiceRequest) {
      clearVoiceTimers();
      transitionVoice('processing', 'processing');
      setVoiceResponse('');
    }
    setDraft('');
    setError('');
    setRetryRequest(null);
    setWorkflowStale(false);
    if (!requestIdOverride && !messageAlreadyAdded) {
      setMessages((current) => [...current, { id: createMessageId('user'), role: 'user', text }]);
    }
    setThinkingRequest(text);
    sendingRef.current = true;
    setSending(true);
    const requestId = requestIdOverride ?? `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const requestController = new AbortController();
    botRequestAbortRef.current = requestController;
    try {
      const botResult = await sendBotMessage({
        message: text,
        userId,
        requestId,
        modo,
        sessionScope,
        contexto: assistantContext ?? 'asistente de facturación: ayuda a crear facturas, buscar clientes y productos, completar datos faltantes, revisar subtotal, IVA y total, confirmar o cancelar la emisión. Cuando la persona pida una lista de clientes o productos, muestra únicamente los 3 primeros resultados y ofrece continuar con los siguientes. Usa datos reales del usuario y no inventes información. Usa lenguaje neutral; no asumas el género de la persona ni uses bienvenido/bienvenida.',
        signal: requestController.signal,
      });
      if (requestGeneration !== requestGenerationRef.current) return;
      const navigationRequested = isExplicitNavigationRequest(text)
        || isDocumentWorkflowRequest(text)
        || (sessionScope === 'erubrica' && isErubricaActionRequest(text));
      if (botResult.uiAction && (navigationRequested || sessionScope === 'erubrica')) onUiAction?.(botResult.uiAction);
      const catalogListRequest = isCatalogListRequest(text);
      const visibleSelectionOptions = catalogListRequest ? botResult.selectionOptions.slice(0, 3) : botResult.selectionOptions;
      const presentationAnswer = botResult.draft?.cliente || botResult.draft?.items?.length
        ? buildVoiceResponse(limitCatalogListAnswer(botResult.answer, text), botResult.draft ?? null, botResult.missing)
        : limitCatalogListAnswer(botResult.answer, text);
      setMessages((current) => [...current, { id: createMessageId('assistant'), role: 'assistant', text: presentationAnswer }]);
      setInvoiceDraft(botResult.draft ?? null);
      setMissingData(botResult.missing);
      setRequiresConfirmation(botResult.requiresConfirmation);
      setInvoiceState(botResult.estado ?? '');
      setSelectionOptions(visibleSelectionOptions);
      setProgress(botResult.progress);
      setPendingOperation(botResult.pendingOperation);
      setWorkflowStale(false);
      const suggestedRoutes = normalizeSuggestedRoutes(botResult.suggestedRoutes ?? []);
      const configurationRoutes = Array.from(new Set([
        ...suggestedRoutes,
        ...(botResult.errorCode === 'emission_configuration_required' && botResult.suggestedRoute && isSupportedBotRoute(botResult.suggestedRoute) ? [normalizeBotRoute(botResult.suggestedRoute)] : []),
      ]));
      setConfigurationRoutes(configurationRoutes);
      onWorkflowChange?.({
        invoiceDraft: botResult.draft ?? null,
        missingData: botResult.missing,
        requiresConfirmation: botResult.requiresConfirmation,
        invoiceState: botResult.estado ?? '',
        selectionOptions: visibleSelectionOptions,
        progress: botResult.progress,
        configurationRoutes,
        pendingOperation: botResult.pendingOperation,
        workflowStale: false,
      });
      handsFreeAwaitingConfirmationRef.current = botResult.missing.length === 0
        && (!botResult.pendingOperation || hasActiveOperationExpiry(botResult.pendingOperation.expiraEn))
        && Boolean(botResult.pendingOperation || botResult.requiresConfirmation);
      const shouldSpeakResponse = voiceRequest || handsFreeEnabledRef.current;
      if (shouldSpeakResponse) {
        const voiceAnswer = `${buildSpeechResponse(presentationAnswer, visibleSelectionOptions)}${sessionScope === 'erubrica' ? getErubricaRouteVoiceHint(botResult.suggestedRoute) : ''}`.trim();
        setVoiceResponse(voiceAnswer);
        transitionVoice(handsFreeAwaitingConfirmationRef.current ? 'awaitingConfirmation' : 'speaking', 'response');
        void speakCurrentBotText(voiceAnswer).then((completed) => {
          if (!handsFreeAwaitingConfirmationRef.current) transitionVoice('idle', handsFreeEnabledRef.current ? 'listening' : null);
          if (handsFreeEnabledRef.current) scheduleHandsFreeResume(completed ? 350 : 150);
          if (navigationRequested && shouldSpeakResponse && botResult.suggestedRoute && isSupportedBotRoute(botResult.suggestedRoute)) {
            voiceNavigationTimerRef.current = setTimeout(() => {
              if (requestGeneration === requestGenerationRef.current) onNavigate?.(normalizeBotRoute(botResult.suggestedRoute as string));
            }, completed ? 150 : 0);
          }
        });
        }
      if (navigationRequested && !shouldSpeakResponse && botResult.suggestedRoute && isSupportedBotRoute(botResult.suggestedRoute)) {
        voiceNavigationTimerRef.current = setTimeout(() => {
          if (requestGeneration === requestGenerationRef.current) onNavigate?.(normalizeBotRoute(botResult.suggestedRoute as string));
        }, 900);
      }
    } catch (err) {
      if (requestGeneration !== requestGenerationRef.current || requestController.signal.aborted) return;
      setRetryRequest({ text, modo, requestId });
      setWorkflowStale(true);
      onWorkflowChange?.({
        invoiceDraft,
        missingData,
        requiresConfirmation,
        invoiceState,
        selectionOptions,
        progress,
        configurationRoutes,
        pendingOperation,
        workflowStale: true,
      });
      if (voiceRequest) {
        clearVoiceTimers();
        const voiceError = 'No pude completar la operación. Repetiré la escucha para que puedas intentarlo nuevamente.';
        setVoiceResponse(voiceError);
        transitionVoice('error', handsFreeEnabledRef.current ? 'response' : null);
        if (handsFreeEnabledRef.current) void speakCurrentBotText(voiceError).then((completed) => {
          if (completed) scheduleHandsFreeResume(500);
        });
      }
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'No se pudo contactar al bot.');
    } finally {
      if (botRequestAbortRef.current === requestController) botRequestAbortRef.current = null;
      if (requestGeneration === requestGenerationRef.current) {
        sendingRef.current = false;
        setSending(false);
        setThinkingRequest('');
        const nextRequest = queuedRequestsRef.current.shift();
        if (nextRequest) {
          setTimeout(() => void send(nextRequest.text, nextRequest.modo, nextRequest.requestId, nextRequest.messageAdded), 0);
        }
      }
    }
  };

  const startVoiceInput = async () => {
    if (voiceStartInFlightRef.current || voiceAppStateRef.current !== 'active') return;
    if (voiceRecognitionStarted.current) {
      if (handsFreeEnabledRef.current) scheduleHandsFreeResume(400);
      return;
    }
    if (!ExpoSpeechRecognitionModule) {
      showVoiceError('El reconocimiento de voz requiere abrir la app en un development build, no en Expo Go.');
      return;
    }
    setError('');
    setVoiceTranscript('');
    voiceTranscriptRef.current = '';
    voiceConfidenceRef.current = 0;
    voiceHolding.current = true;
    voiceShouldSubmit.current = false;
    voiceStartInFlightRef.current = true;
    try {
      await stopBotSpeech();
      const permission = voicePermissionGrantedRef.current
        ? { granted: true }
        : await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        voicePermissionGrantedRef.current = false;
        voiceHolding.current = false;
        disableHandsFreeState();
        showVoiceError('Necesito permiso para usar el micrófono y reconocer tu voz. Actívalo desde los ajustes del dispositivo si ya lo habías denegado.');
        return;
      }
      voicePermissionGrantedRef.current = true;
      if (!voiceHolding.current) {
        voiceShouldSubmit.current = false;
        transitionVoice('idle', null);
        return;
      }
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        voiceHolding.current = false;
        disableHandsFreeState();
        showVoiceError('El reconocimiento de voz no está disponible en este dispositivo. Verifica el asistente de voz del dispositivo.');
        return;
      }
      let language = voiceLanguageRef.current;
      if (!voiceLocalesResolvedRef.current) {
        try {
          const supported = await ExpoSpeechRecognitionModule.getSupportedLocales({});
          const locales = supported.locales ?? [];
          language = locales.find((locale) => locale.toLowerCase() === 'es-ec')
            ?? locales.find((locale) => locale.toLowerCase().startsWith('es-'))
            ?? language;
          voiceLanguageRef.current = language;
        } catch {
          // El motor puede no exponer sus locales; es-EC sigue siendo válido para el reconocimiento en línea.
        } finally {
          voiceLocalesResolvedRef.current = true;
        }
      }
      if (!voiceHolding.current) {
        voiceShouldSubmit.current = false;
        transitionVoice('idle', null);
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults: true,
        maxAlternatives: 3,
        continuous: !handsFreeEnabledRef.current,
        addsPunctuation: false,
        contextualStrings: [
          ...speechContext,
          invoiceDraft?.cliente?.nombre,
          ...(invoiceDraft?.items?.map((item) => item.descripcion) ?? []),
          ...selectionOptions.map((option) => option.etiqueta),
        ].filter((value): value is string => Boolean(value?.trim())).slice(0, 40),
        iosTaskHint: selectionOptions.length > 0 || handsFreeAwaitingConfirmationRef.current ? 'confirmation' : 'dictation',
        androidIntentOptions: selectionOptions.length > 0 || handsFreeAwaitingConfirmationRef.current
          ? { EXTRA_LANGUAGE_MODEL: 'web_search' }
          : undefined,
      });
    } catch (err) {
      voiceHolding.current = false;
      disableHandsFreeState();
      showVoiceError(err instanceof Error ? err.message : 'No se pudo iniciar el micrófono.');
    } finally {
      voiceStartInFlightRef.current = false;
    }
  };

  const contextualActions = assistantContext
    ? [
      { label: 'Estado de mi firma', command: '¿Cuál es el estado de mi firma electrónica?', icon: 'shield-check-outline' as const },
      { label: 'Validar documento', command: '¿Cómo valido una firma electrónica?', icon: 'file-check-outline' as const },
      { label: 'Nueva solicitud', command: '¿Qué necesito para solicitar una firma electrónica?', icon: 'file-plus-outline' as const },
    ]
    : Boolean(pendingOperation || (requiresConfirmation && invoiceState === 'EsperandoConfirmacion'))
    ? [
      { label: pendingOperation ? 'Confirmar operación' : 'Emitir factura', command: pendingOperation ? 'confirmar' : 'emitir', icon: 'check' as const },
      { label: pendingOperation ? 'Cancelar operación' : 'Cancelar emisión', command: 'cancelar', icon: 'close' as const },
    ]
    : invoiceDraft?.items?.length
      ? [
        { label: 'Agregar producto', command: 'Agrega otro producto', icon: 'plus' as const },
        { label: 'Ver resumen', command: 'Muéstrame el resumen', icon: 'file-document-outline' as const },
        { label: 'Cambiar pago', command: 'Quiero cambiar la forma de pago', icon: 'cash' as const },
      ]
      : invoiceDraft?.cliente
        ? [
          { label: 'Agregar producto', command: 'Agrega un producto', icon: 'plus' as const },
          { label: 'Qué falta', command: 'Qué falta para completar la factura', icon: 'clipboard-alert-outline' as const },
          { label: 'Ver resumen', command: 'Muéstrame el resumen', icon: 'file-document-outline' as const },
        ]
        : [
          { label: 'Crear factura', command: 'Quiero crear una factura', icon: 'file-plus-outline' as const },
          { label: 'Consultar facturas', command: 'Muéstrame mis facturas', icon: 'file-document-outline' as const },
          { label: 'Ver cartera', command: 'Muéstrame mis cuentas por cobrar', icon: 'cash-multiple' as const },
        ];

  const resumeHandsFreeListening = async () => {
    if (!handsFreeEnabledRef.current || sending || sendingRef.current) return;
    try {
      if (await Speech.isSpeakingAsync()) {
        scheduleHandsFreeResume(250);
        return;
      }
    } catch {
      // Si el motor de audio no informa su estado, se respeta igualmente la espera prudente.
    }
    if (handsFreeEnabledRef.current && voiceAppStateRef.current === 'active') void startVoiceInput();
  };

  const scheduleHandsFreeResume = (delay = 350) => {
    if (handsFreeResumeTimerRef.current) clearTimeout(handsFreeResumeTimerRef.current);
    handsFreeResumeTimerRef.current = setTimeout(() => {
      handsFreeResumeTimerRef.current = null;
      void resumeHandsFreeListening();
    }, delay);
  };

  const stopVoiceInput = () => {
    voiceHolding.current = false;
    voiceShouldSubmit.current = true;
    if (voiceRecognitionStarted.current) {
      ExpoSpeechRecognitionModule?.stop();
    } else {
      voiceShouldSubmit.current = false;
      transitionVoice('idle', null);
    }
  };

  const stopHandsFreeMode = () => {
    clearVoiceTimers();
    handsFreeEnabledRef.current = false;
    handsFreeAwaitingConfirmationRef.current = false;
    setHandsFreeEnabled(false);
    voiceHolding.current = false;
    voiceShouldSubmit.current = false;
    if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.abort();
    setListening(false);
    transitionVoice('idle', null);
  };

  const toggleHandsFreeMode = () => {
    if (!voiceRecognitionAvailable) {
      showVoiceError('El modo manos libres requiere abrir la app en un development build, no en Expo Go.');
      return;
    }
    if (handsFreeEnabledRef.current) {
      stopHandsFreeMode();
      return;
    }
    setError('');
    handsFreeEnabledRef.current = true;
    handsFreeAwaitingConfirmationRef.current = false;
    handsFreeNoSpeechCountRef.current = 0;
    setHandsFreeEnabled(true);
    void startVoiceInput();
  };

  const startHandsFree = () => {
    if (handsFreeEnabledRef.current) {
      void startVoiceInput();
      return;
    }
    toggleHandsFreeMode();
  };

  const startHandsFreeConfirmation = () => {
    clearVoiceTimers();
    handsFreeEnabledRef.current = true;
    handsFreeAwaitingConfirmationRef.current = true;
    handsFreeNoSpeechCountRef.current = 0;
    setHandsFreeEnabled(true);
    setVoiceResponse('');
    transitionVoice('idle', 'listening');
    void startVoiceInput();
  };

  const cancelVoiceInput = () => {
    requestGenerationRef.current += 1;
    abortBotRequest();
    sendingRef.current = false;
    setSending(false);
    setThinkingRequest('');
    setRetryRequest(null);
    setError('');
    clearVoiceTimers();
    void stopBotSpeech();
    if (voiceOverlayState === 'review') setDraft('');
    handsFreeEnabledRef.current = false;
    handsFreeAwaitingConfirmationRef.current = false;
    setHandsFreeEnabled(false);
    voiceHolding.current = false;
    voiceShouldSubmit.current = false;
    if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.abort();
    setListening(false);
    transitionVoice('idle', null);
    setVoiceResponse('');
    setVoiceTranscript('');
  };

  useEffect(() => {
    if (!voiceControlsRef) return undefined;
    voiceControlsRef.current = {
      available: voiceRecognitionAvailable,
      start: startVoiceInput,
      startHandsFree,
      stop: stopVoiceInput,
        dismiss: cancelVoiceInput,
    };
    return () => {
      if (voiceControlsRef.current?.start === startVoiceInput) voiceControlsRef.current = null;
    };
  }, [voiceControlsRef, startHandsFree, startVoiceInput, stopVoiceInput]);

  const renderVoiceOverlay = () => voiceOverlayState ? (
    <VoiceInteractionOverlay
      state={voiceOverlayState}
      transcript={voiceTranscript}
      response={voiceResponse}
      draft={invoiceDraft}
      missing={missingData}
      pendingOperation={pendingOperation}
      requiresConfirmation={requiresConfirmation}
      invoiceState={invoiceState}
        progress={progress}
        configurationRoutes={configurationRoutes}
        reduceMotion={reduceMotion}
        stale={workflowStale}
      selectionOptions={selectionOptions}
      showWorkflow={voiceOnly}
      handsFreeEnabled={handsFreeEnabled}
      onChangeTranscript={(value) => {
        voiceTranscriptRef.current = value;
        setVoiceTranscript(value);
        setDraft(value);
      }}
      onCancel={cancelVoiceInput}
      onReviewEdit={() => {
        transitionVoice('idle', null);
        requestAnimationFrame(() => voiceInputRef.current?.focus());
      }}
      onReviewSend={() => void send(voiceTranscriptRef.current, 'voz')}
      onStartConfirmationVoice={startHandsFreeConfirmation}
        onNavigate={onNavigate}
      onCommand={(command) => {
        clearVoiceTimers();
        voiceHolding.current = false;
        voiceShouldSubmit.current = false;
        if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.abort();
        setListening(false);
        void send(command, 'voz');
      }}
    />
  ) : null;

  if (voiceOnly) {
    return voiceOverlayState ? <View style={styles.botVoiceOnlyRoot} pointerEvents="box-none">{renderVoiceOverlay()}</View> : null;
  }

  return (
    <View ref={botContainerRef} onLayout={measureChatTop} style={[styles.botScreen, bottomInset > 0 && { paddingBottom: bottomInset }, !embedded && { minHeight: Math.min(560, Math.max(420, windowHeight - 300)) }, embedded && styles.botScreenEmbedded, erubricaTheme && styles.erubricaBotScreen, keyboardVisible && styles.botScreenKeyboard, keyboardVisible && keyboardTop !== null && chatTop !== null ? { height: Math.max(1, keyboardTop - chatTop - 36) } : null]}>
      <KeyboardAvoidingView style={styles.botScreenInner} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      <View style={[styles.botWidgetHeader, erubricaTheme && styles.erubricaBotWidgetHeader]}>
        <Image source={require('../../../assets/numi-chat-avatar.jpg')} style={styles.botWidgetAvatar} />
        <View style={styles.botWidgetCopy}>
          <Text style={[styles.botWidgetKicker, erubricaTheme && styles.erubricaBotWidgetKicker]}>Chat con</Text>
          <Text style={styles.botWidgetTitle}>Númi</Text>
          <View style={styles.botWidgetStatusRow}>
            <View style={[styles.botWidgetStatusDot, erubricaTheme && styles.erubricaBotWidgetStatusDot]} />
            <Text style={[styles.botWidgetStatus, erubricaTheme && styles.erubricaBotWidgetStatus]}>Estamos en línea</Text>
          </View>
        </View>
        <View style={styles.botWidgetHeaderActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Iniciar nueva conversación" onPress={() => void startNewConversation()} hitSlop={8} disabled={sending} style={[styles.botHeaderActionButton, sending && styles.botHeaderActionDisabled]}>
            <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={speechMuted ? 'Activar lectura en voz alta' : 'Silenciar lectura en voz alta'} onPress={toggleSpeechMuted} hitSlop={8} style={styles.botHeaderActionButton}>
            <MaterialCommunityIcons name={speechMuted ? 'volume-off' : 'volume-high'} size={19} color="#FFFFFF" />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver al inicio" onPress={() => onNavigate?.('/dashboard')} hitSlop={8} style={styles.botHeaderActionButton}>
             <MaterialCommunityIcons name="home-outline" size={19} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
      <ScrollView
        ref={messagesScrollRef}
        style={styles.botMessages}
        contentContainerStyle={styles.botMessagesContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        nestedScrollEnabled
        showsVerticalScrollIndicator
        onContentSizeChange={() => scrollMessagesToEnd()}
      >
        {messages.map((message) => (
          <View key={message.id} style={message.role === 'user' ? styles.botUserRow : styles.botAssistantRow}>
            {message.role === 'assistant' ? <Image source={require('../../../assets/numi-chat-avatar.jpg')} style={[styles.botMessageAvatar, erubricaTheme && styles.erubricaBotMessageAvatar]} /> : null}
            <View style={[styles.botBubble, message.role === 'user' ? styles.botUserBubble : styles.botAssistantBubble, erubricaTheme && message.role === 'user' && styles.erubricaBotUserBubble]}>
              <View style={styles.botMessageRow}>
                <Text style={[styles.botBubbleText, message.role === 'user' && styles.botUserBubbleText]}>{message.text}</Text>
                {message.role === 'assistant' ? <Pressable accessibilityRole="button" accessibilityLabel={speechMuted ? 'Lectura silenciada' : 'Escuchar respuesta'} style={styles.botAudioButton} onPress={() => { if (!speechMuted) void speakCurrentBotText(message.text); }} hitSlop={8}><MaterialCommunityIcons name={speechMuted ? 'volume-off' : 'volume-high'} size={16} color="#0878C9" /></Pressable> : null}
              </View>
              {message.role === 'assistant' ? (
                <View style={styles.botBubbleFeedback}>
                  <Pressable accessibilityLabel="Respuesta util" hitSlop={6} style={[styles.botFeedbackButton, feedbackByMessage[message.id] === 'like' && styles.botFeedbackButtonActive]} onPress={() => setFeedbackByMessage((current) => {
                    const next = { ...current };
                    if (next[message.id] === 'like') delete next[message.id];
                    else next[message.id] = 'like';
                    return next;
                  })}>
                    <MaterialCommunityIcons name={feedbackByMessage[message.id] === 'like' ? 'thumb-up' : 'thumb-up-outline'} size={15} color={feedbackByMessage[message.id] === 'like' ? '#FFFFFF' : '#6E94B4'} />
                  </Pressable>
                  <Pressable accessibilityLabel="Respuesta no util" hitSlop={6} style={[styles.botFeedbackButton, feedbackByMessage[message.id] === 'dislike' && styles.botFeedbackButtonActive]} onPress={() => setFeedbackByMessage((current) => {
                    const next = { ...current };
                    if (next[message.id] === 'dislike') delete next[message.id];
                    else next[message.id] = 'dislike';
                    return next;
                  })}>
                    <MaterialCommunityIcons name={feedbackByMessage[message.id] === 'dislike' ? 'thumb-down' : 'thumb-down-outline'} size={15} color={feedbackByMessage[message.id] === 'dislike' ? '#FFFFFF' : '#6E94B4'} />
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        ))}
        {messages.length === 1 && messages[0]?.id === 'welcome' ? (
          <View style={[styles.botQuickActions, erubricaTheme && styles.erubricaBotQuickActions]}>
            <Text style={[styles.botQuickActionsTitle, erubricaTheme && styles.erubricaBotQuickActionsTitle]}>Puedes comenzar con:</Text>
            <View style={styles.botQuickActionsGrid}>
              {(quickActions ?? [
                { label: 'Crear factura', command: 'Quiero crear una factura' },
                { label: 'Consultar facturas', command: 'Muéstrame mis facturas' },
                { label: 'Ver cartera', command: 'Muéstrame mis cuentas por cobrar' },
                { label: 'Qué puedes hacer', command: '¿Qué puedes hacer?' },
              ]).map((action) => (
                <Pressable accessibilityRole="button" accessibilityLabel={action.label} key={action.label} style={[styles.botQuickAction, erubricaTheme && styles.erubricaBotQuickAction]} onPress={() => void send(action.command)} disabled={sending}>
                  <Text style={[styles.botQuickActionText, erubricaTheme && styles.erubricaBotQuickActionText]}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
        <BotInvoiceWorkflowCard
          draft={invoiceDraft}
          missing={missingData}
          requiresConfirmation={requiresConfirmation}
          state={invoiceState}
          progress={progress}
          configurationRoutes={configurationRoutes}
          reduceMotion={reduceMotion}
          selectionOptions={selectionOptions}
          pendingOperation={pendingOperation}
          stale={workflowStale}
          sending={sending}
          onNavigate={onNavigate}
          onCommand={(command) => void send(command)}
        />
      </ScrollView>
      {sending ? (
        <View style={styles.botPendingResponse} accessibilityLiveRegion="polite">
          <View style={styles.botAssistantRow}>
            <Image source={require('../../../assets/numi-chat-avatar.jpg')} style={styles.botMessageAvatar} />
            <NumiThinkingIndicator request={thinkingRequest} />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancelar solicitud" onPress={cancelPendingRequest}>
            <Text style={styles.botRetryText}>Cancelar</Text>
          </Pressable>
        </View>
      ) : null}
      {voiceTranscript && !voiceOverlayState ? <View style={styles.botVoiceTranscript}><MaterialCommunityIcons name="waveform" size={16} color="#0878C9" /><Text style={styles.botVoiceTranscriptText}>{voiceTranscript}</Text></View> : null}
      {error ? (
        <View style={styles.botErrorRow}>
          <Text style={styles.botError}>{error}</Text>
          {retryRequest ? <Pressable accessibilityRole="button" accessibilityLabel="Reintentar solicitud" onPress={() => void send(retryRequest.text, retryRequest.modo, retryRequest.requestId)} disabled={sending}><Text style={styles.botRetryText}>Reintentar</Text></Pressable> : null}
        </View>
      ) : null}
      {handsFreeEnabled ? (
        <View style={styles.botHandsFreeBanner}>
          <MaterialCommunityIcons name="headset" size={16} color="#0878C9" />
          <Text style={styles.botHandsFreeBannerText}>Manos libres activo · Númi esperará antes de volver a escuchar</Text>
          <Pressable accessibilityLabel="Desactivar modo manos libres" onPress={stopHandsFreeMode} hitSlop={8}><Text style={styles.botHandsFreeBannerAction}>Detener</Text></Pressable>
        </View>
      ) : null}
      {quickActionsOpen ? (
        <View style={styles.botQuickActionsTray}>
          {contextualActions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={styles.botQuickActionChip}
              onPress={() => {
                setQuickActionsOpen(false);
                void send(action.command);
              }}
              disabled={sending}
            >
              <MaterialCommunityIcons name={action.icon} size={15} color="#0867A9" />
              <Text style={styles.botQuickActionText}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={[styles.botComposer, compactLayout && styles.botComposerCompact]}>
        <Pressable accessibilityRole="button" accessibilityLabel={handsFreeEnabled ? 'Desactivar modo manos libres' : 'Activar modo manos libres'} style={[styles.botToolButton, compactLayout && styles.botToolButtonCompact, handsFreeEnabled && styles.botToolButtonActive]} disabled={sending || !voiceRecognitionAvailable} onPress={toggleHandsFreeMode}>
          <MaterialCommunityIcons name="headset" size={19} color={handsFreeEnabled ? '#FFFFFF' : '#6E94B4'} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={listening ? 'Detener reconocimiento de voz' : 'Hablar con Númi'}
          style={[styles.botVoiceButton, compactLayout && styles.botVoiceButtonCompact, listening && styles.botVoiceButtonActive]}
          disabled={!voiceRecognitionAvailable}
          onPress={() => {
            if (listening || voiceRecognitionStarted.current) stopVoiceInput();
            else void startVoiceInput();
          }}
        >
          <MaterialCommunityIcons name={listening ? 'stop' : 'microphone-outline'} size={20} color={listening ? '#FFFFFF' : '#0878C9'} />
        </Pressable>
        <TextInput ref={voiceInputRef} value={draft} onChangeText={(value) => { setDraft(value); if (retryRequest && value.trim() !== retryRequest.text) setRetryRequest(null); }} placeholder={listening ? 'Escuchando... toca para detener' : voiceRecognitionAvailable ? 'Escribe o toca el micrófono para hablar...' : 'Escribe tu orden...'} placeholderTextColor="#8DA1B4" style={[styles.botInput, compactLayout && styles.botInputCompact]} editable={!listening} multiline maxLength={800} returnKeyType="send" blurOnSubmit accessibilityLabel="Escribe una instrucción para Númi" onFocus={() => { setTimeout(() => scrollMessagesToEnd(), 80); }} onSubmitEditing={() => void send()} />
        <Pressable accessibilityRole="button" accessibilityLabel="Mostrar acciones rápidas" style={[styles.botToolButton, compactLayout && styles.botToolButtonCompact, quickActionsOpen && styles.botToolButtonActive]} disabled={sending || listening} onPress={() => setQuickActionsOpen((value) => !value)}>
          <MaterialCommunityIcons name="lightning-bolt-outline" size={19} color={quickActionsOpen ? '#FFFFFF' : '#6E94B4'} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Enviar instrucción" style={[styles.botSendButton, compactLayout && styles.botSendButtonCompact, !draft.trim() && styles.botSendButtonDisabled]} onPress={() => send()} disabled={!draft.trim()}>
          <Text style={styles.botSendText}>➤</Text>
        </Pressable>
      </View>
      </KeyboardAvoidingView>
      {renderVoiceOverlay()}
    </View>
  );
}

function VoiceInteractionOverlay({ state, transcript, response, draft, missing, pendingOperation, requiresConfirmation, invoiceState, progress, configurationRoutes, reduceMotion, stale, selectionOptions, showWorkflow, handsFreeEnabled, onChangeTranscript, onCancel, onReviewEdit, onReviewSend, onStartConfirmationVoice, onNavigate, onCommand }: {
  state: VoiceOverlayState;
  transcript: string;
  response: string;
  draft: BotFacturaDraft | null;
  missing: string[];
  pendingOperation: { tipo?: string; resumen?: string; expiraEn?: string | null } | null;
  requiresConfirmation: boolean;
  invoiceState: string;
  progress: BotProgressStep[];
  configurationRoutes: string[];
  reduceMotion: boolean;
  stale: boolean;
  selectionOptions: BotSelectionOption[];
  showWorkflow: boolean;
  handsFreeEnabled: boolean;
  onChangeTranscript: (value: string) => void;
  onCancel: () => void;
  onReviewEdit: () => void;
  onReviewSend: () => void;
  onStartConfirmationVoice: () => void;
  onNavigate?: (route: string) => void;
  onCommand: (command: string) => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const confirmationExpiryInvalid = Boolean(pendingOperation && (!pendingOperation.expiraEn || getRemainingSeconds(pendingOperation.expiraEn) === null));
  const confirmationExpired = invoiceState === 'ConfirmacionExpirada' || Boolean(pendingOperation && getRemainingSeconds(pendingOperation.expiraEn) === 0);
  const confirmationBlocked = confirmationExpired || confirmationExpiryInvalid;
  const actualMissing = missing.filter((item) => !normalizeVoiceCommand(item).includes('confirm'));
  const needsConfirmation = state === 'response'
    && !confirmationBlocked
    && actualMissing.length === 0
    && (Boolean(pendingOperation) || (requiresConfirmation && invoiceState === 'EsperandoConfirmacion'));

  useEffect(() => {
    pulse.stopAnimation();
    pulse.setValue(1);
    if (reduceMotion || state === 'response' || state === 'review') return undefined;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [pulse, reduceMotion, state]);

  const title = state === 'listening' ? 'Númi está escuchando' : state === 'review' ? 'Revisa lo que entendí' : state === 'processing' ? 'Procesando comando' : confirmationExpiryInvalid ? 'Confirmación no disponible' : confirmationExpired ? 'Confirmación vencida' : needsConfirmation ? 'Revisa antes de continuar' : 'Númi respondió';
  const subtitle = state === 'listening' ? 'Habla con claridad; volveré a escuchar cuando termines.' : state === 'review' ? 'Corrige cualquier palabra antes de enviarla.' : state === 'processing' ? 'Estoy revisando tus datos y preparando el siguiente paso.' : confirmationExpiryInvalid ? 'La operación no tiene una vigencia válida. Solicítala nuevamente.' : confirmationExpired ? 'La operación no se ejecutó. Solicítala nuevamente para generar una nueva confirmación.' : needsConfirmation ? 'Di “confirmado” para ejecutar o usa el botón Confirmar.' : 'Esta respuesta también se guardó en el chat.';
  const icon = state === 'listening' ? 'microphone' : state === 'review' ? 'text-box-check-outline' : state === 'processing' ? 'loading' : confirmationBlocked ? 'alert-circle-outline' : needsConfirmation ? 'shield-check-outline' : 'check-circle-outline';

  return (
    <View style={styles.botVoiceOverlayLayer} pointerEvents="box-none">
      <Pressable accessibilityRole="button" accessibilityLabel="Cerrar respuesta de Númi" style={styles.botVoiceOverlayBackdrop} onPress={onCancel} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0} style={styles.botVoiceOverlayKeyboardAvoider}>
      <View style={[styles.botVoiceOverlayCard, { maxHeight: Math.min(viewportHeight * 0.58, 520), width: Math.max(0, Math.min(viewportWidth - 24, 390)) }]}>
       <View style={styles.botVoiceOverlayHandle} />
       <ScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" showsVerticalScrollIndicator={showWorkflow}>
        <View style={styles.botVoiceOverlayHeader}>
          <Image source={require('../../../assets/numi-chat-avatar.jpg')} style={styles.botVoiceOverlayAvatar} />
          <View style={styles.botVoiceOverlayHeaderCopy}>
            <Text style={styles.botVoiceOverlayTitle}>{title}</Text>
            <Text style={styles.botVoiceOverlaySubtitle}>{subtitle}</Text>
          </View>
        </View>
        <Animated.View style={[styles.botVoiceOverlayOrb, state !== 'response' && { transform: [{ scale: pulse }] }]}>
          <MaterialCommunityIcons name={icon} size={34} color="#FFFFFF" />
        </Animated.View>
        {state === 'listening' ? <Text style={styles.botVoiceOverlayTranscript}>{transcript || 'Te escucho…'}</Text> : null}
        {state === 'review' ? <TextInput autoFocus value={transcript} onChangeText={onChangeTranscript} multiline maxLength={800} style={styles.botVoiceOverlayEdit} /> : null}
        {state === 'processing' ? <Text style={styles.botVoiceOverlayTranscript}>Analizando: “{transcript}”</Text> : null}
        {state === 'response' ? <Text style={styles.botVoiceOverlayResponse}>{response}</Text> : null}
        {pendingOperation && state === 'response' && !showWorkflow ? <View style={styles.botVoiceOverlayOperation}><Text style={styles.botVoiceOverlayOperationLabel}>Operación pendiente</Text><Text style={styles.botVoiceOverlayOperationText}>{pendingOperation.resumen || 'Operación que requiere confirmación'}</Text></View> : null}
        {showWorkflow && state === 'response' ? <BotInvoiceWorkflowCard draft={draft} missing={missing} requiresConfirmation={requiresConfirmation} state={invoiceState} progress={progress} configurationRoutes={configurationRoutes} reduceMotion={reduceMotion} stale={stale} selectionOptions={selectionOptions} pendingOperation={pendingOperation} sending={false} showActions={false} onNavigate={onNavigate} onCommand={onCommand} /> : null}
        {state === 'review' ? (
          <>
            <View style={styles.botVoiceOverlayActions}>
              <Pressable style={styles.botVoiceOverlayCancelButton} onPress={onCancel}><Text style={styles.botVoiceOverlayCancelText}>Cancelar</Text></Pressable>
              <Pressable style={[styles.botVoiceOverlayConfirmButton, !transcript.trim() && styles.botVoiceOverlayConfirmButtonDisabled]} onPress={onReviewSend} disabled={!transcript.trim()}><MaterialCommunityIcons name="send" size={16} color="#FFFFFF" /><Text style={styles.botVoiceOverlayConfirmText}>Enviar</Text></Pressable>
            </View>
            <Pressable style={styles.botVoiceOverlayCloseButton} onPress={onReviewEdit}><Text style={styles.botVoiceOverlayCloseText}>Editar en el chat</Text></Pressable>
          </>
        ) : needsConfirmation ? (
          <>
            <View style={styles.botVoiceOverlayActions}>
              <Pressable style={styles.botVoiceOverlayCancelButton} onPress={() => onCommand('cancelar')}><Text style={styles.botVoiceOverlayCancelText}>Cancelar</Text></Pressable>
              {handsFreeEnabled ? <Pressable style={styles.botVoiceOverlayContinueButton} onPress={onStartConfirmationVoice}><MaterialCommunityIcons name="microphone" size={16} color="#FFFFFF" /><Text style={styles.botVoiceOverlayContinueText}>Decir confirmado</Text></Pressable> : null}
            </View>
            <Pressable style={styles.botVoiceOverlayConfirmButtonFull} onPress={() => onCommand(pendingOperation ? 'confirmar' : 'emitir')}><MaterialCommunityIcons name="check" size={17} color="#FFFFFF" /><Text style={styles.botVoiceOverlayConfirmText}>Confirmar con botón</Text></Pressable>
          </>
        ) : state === 'response' ? (
          <View style={styles.botVoiceOverlayActions}>
            <Pressable style={styles.botVoiceOverlayCloseButton} onPress={onCancel}><Text style={styles.botVoiceOverlayCloseText}>Cerrar</Text></Pressable>
          </View>
        ) : <Pressable style={styles.botVoiceOverlayCloseButton} onPress={onCancel}><Text style={styles.botVoiceOverlayCloseText}>Cancelar</Text></Pressable>}
       </ScrollView>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function BotInvoiceWorkflowCard({ draft, missing, requiresConfirmation, state, progress, configurationRoutes, reduceMotion, stale, selectionOptions, pendingOperation, sending, showActions = true, onNavigate, onCommand }: {
  draft: BotFacturaDraft | null;
  missing: string[];
  requiresConfirmation: boolean;
  state: string;
  progress: BotProgressStep[];
  configurationRoutes: string[];
  reduceMotion: boolean;
  stale: boolean;
  selectionOptions: BotSelectionOption[];
  pendingOperation: { tipo?: string; resumen?: string; expiraEn?: string | null } | null;
  sending: boolean;
  showActions?: boolean;
  onNavigate?: (route: string) => void;
  onCommand: (command: string) => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() => getRemainingSeconds(pendingOperation?.expiraEn));
  const actualMissing = missing.filter((item) => !item.toLowerCase().includes('confirm'));
  const isCompleted = state === 'FacturaEmitida';
  const isCancelled = state === 'Cancelado';
  const isExpired = state === 'ConfirmacionExpirada';
  const needsConfirmation = !isCompleted
    && !isCancelled
    && actualMissing.length === 0
    && Boolean(pendingOperation || (requiresConfirmation && state === 'EsperandoConfirmacion'));
  const operationExpiryInvalid = Boolean(needsConfirmation && pendingOperation && (!pendingOperation.expiraEn || remainingSeconds === null));
  const operationExpired = isExpired || Boolean(needsConfirmation && pendingOperation && remainingSeconds === 0);
  const operationBlocked = operationExpired || operationExpiryInvalid;
  const hasCalculatedValues = Boolean(draft?.items?.length && (draft.subtotal !== undefined || draft.impuesto !== undefined || draft.total !== undefined));
  const hasPayment = Boolean(draft?.formaPago);
  const fallbackSteps: BotProgressStep[] = [
    { id: 'cliente', label: 'Cliente', status: draft?.cliente ? 'completed' : 'warning' },
    { id: 'items', label: 'Productos', status: draft?.items?.length ? 'completed' : 'warning' },
    { id: 'pago', label: 'Pago', status: hasPayment ? 'completed' : undefined },
    { id: 'confirmacion', label: 'Confirmar', status: isCompleted ? 'completed' : undefined },
  ];
  const hasDraftWorkflow = Boolean(draft?.cliente || draft?.items?.length || hasCalculatedValues || actualMissing.length || needsConfirmation || pendingOperation);
  const workflowSteps = progress.length ? progress : hasDraftWorkflow ? fallbackSteps : [];
  const currentStep = Math.max(0, workflowSteps.findIndex((step) => step.status === 'pending' || step.status === 'warning'));
  const hasWorkflow = isCompleted || isCancelled || operationBlocked || actualMissing.length > 0 || needsConfirmation || selectionOptions.length > 0 || configurationRoutes.length > 0 || progress.length > 0 || Boolean(draft?.cliente || draft?.items?.length) || hasCalculatedValues || Boolean(pendingOperation);
  const workflowTone = isCompleted
    ? { backgroundColor: '#E8F7EF', borderColor: '#8FD1AA', color: '#0F6B32' }
    : isCancelled
      ? { backgroundColor: '#F4F6F8', borderColor: '#C9D3DC', color: '#62798B' }
      : operationBlocked
        ? { backgroundColor: '#FFF1F0', borderColor: '#F3B7A8', color: '#B42318' }
        : needsConfirmation
    ? { backgroundColor: '#E8F7EF', borderColor: '#B8E4C9', color: '#0F8A4B' }
    : actualMissing.length
      ? { backgroundColor: '#FFF8E8', borderColor: '#F5D78B', color: '#A66A00' }
      : { backgroundColor: '#F1F8FD', borderColor: '#D8ECF7', color: '#0878C9' };

  useEffect(() => {
    setRemainingSeconds(getRemainingSeconds(pendingOperation?.expiraEn));
    if (!pendingOperation?.expiraEn) return undefined;
    const initialRemaining = getRemainingSeconds(pendingOperation.expiraEn);
    if (initialRemaining === null || initialRemaining <= 0) return undefined;
    const timer = setInterval(() => {
      const nextRemaining = getRemainingSeconds(pendingOperation.expiraEn);
      setRemainingSeconds(nextRemaining);
      if (nextRemaining !== null && nextRemaining <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [pendingOperation?.expiraEn]);

  useEffect(() => {
    if (reduceMotion || !needsConfirmation || operationBlocked) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return undefined;
    }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.015, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [pulse, reduceMotion, needsConfirmation, operationBlocked]);

  if (!hasWorkflow) return null;

  return (
    <Animated.View
      style={[styles.botWorkflowCard, { borderColor: workflowTone.borderColor }, needsConfirmation && !operationBlocked && { transform: [{ scale: pulse }] }]}
    >
      <View style={styles.botWorkflowHeader}>
        <View style={[styles.botWorkflowIcon, { backgroundColor: workflowTone.backgroundColor, borderColor: workflowTone.borderColor }]}><MaterialCommunityIcons name={isCompleted ? 'check-circle-outline' : isCancelled ? 'close-circle-outline' : operationBlocked ? 'alert-circle-outline' : needsConfirmation ? 'check-decagram-outline' : 'clipboard-alert-outline'} size={20} color={workflowTone.color} /></View>
        <View style={styles.botWorkflowHeaderCopy}>
          <Text style={styles.botWorkflowTitle}>{isCompleted ? 'Operación completada' : isCancelled ? 'Operación cancelada' : operationExpiryInvalid ? 'Confirmación no disponible' : operationExpired ? 'Confirmación vencida' : pendingOperation ? 'Confirma la operación' : needsConfirmation ? 'Confirma la emisión' : actualMissing.length ? 'Datos pendientes' : 'Resultados encontrados'}</Text>
          <Text style={styles.botWorkflowSubtitle}>{stale ? 'La última solicitud no terminó de responder. Reinténtala para actualizar este estado.' : isCompleted ? 'La operación se ejecutó correctamente.' : isCancelled ? 'No se ejecutó la operación pendiente.' : operationExpiryInvalid ? 'La operación no tiene una vigencia válida. Solicítala nuevamente antes de confirmar.' : operationExpired ? 'Solicita nuevamente la operación para generar una nueva confirmación.' : pendingOperation ? 'No se ejecutará nada sin tu autorización explícita.' : needsConfirmation ? 'Revisa el resumen y elige cómo continuar.' : actualMissing.length ? 'Te indico lo que falta y cómo continuar.' : 'Númi verificó los datos y calculó los valores.'}</Text>
        </View>
      </View>
      {workflowSteps.length > 0 ? (
        <View style={styles.botWorkflowProgress} accessibilityLabel="Progreso de la factura">
          {workflowSteps.map((step, index) => {
            const complete = step.status === 'completed' || (isCompleted && index === workflowSteps.length - 1);
            return (
            <View key={step.label} style={styles.botWorkflowProgressStep}>
              <View style={[styles.botWorkflowProgressCircle, complete && styles.botWorkflowProgressCircleComplete, !complete && index === currentStep && styles.botWorkflowProgressCircleCurrent]}>
                {complete ? <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" /> : <Text style={styles.botWorkflowProgressNumber}>{index + 1}</Text>}
              </View>
              <Text style={[styles.botWorkflowProgressLabel, complete && styles.botWorkflowProgressLabelComplete]}>{step.label}</Text>
              {index < workflowSteps.length - 1 ? <View style={[styles.botWorkflowProgressLine, complete && styles.botWorkflowProgressLineComplete]} /> : null}
            </View>
            );
          })}
        </View>
      ) : null}
      {pendingOperation ? <View style={styles.botWorkflowClient}><Text style={styles.botWorkflowLabel}>Operación pendiente</Text><Text style={styles.botWorkflowValue}>{pendingOperation.resumen || 'Operación que requiere confirmación'}</Text></View> : null}
      {pendingOperation ? <View style={styles.botWorkflowExpiry}><MaterialCommunityIcons name="timer-outline" size={15} color={operationBlocked ? '#B42318' : '#7A5A00'} /><Text style={styles.botWorkflowExpiryText}>{operationExpiryInvalid ? 'Vigencia no disponible' : remainingSeconds === 0 ? 'La confirmación expiró' : `Expira en ${formatRemainingTime(remainingSeconds)}`}</Text></View> : null}
      {actualMissing.length > 0 ? (
        <View style={styles.botWorkflowMissingBox}>
          <Text style={styles.botWorkflowSectionTitle}>Falta completar</Text>
          {actualMissing.map((item) => <Text key={item} style={styles.botWorkflowMissingItem}>• {item}</Text>)}
        </View>
      ) : null}
      {draft?.cliente ? (
        <View style={styles.botWorkflowClient}>
          <Text style={styles.botWorkflowLabel}>Cliente confirmado</Text>
          <Text style={styles.botWorkflowValue}>{draft.cliente.nombre || 'Cliente'}{draft.cliente.identificacion ? ` · ${draft.cliente.identificacion}` : ''}</Text>
        </View>
      ) : null}
      {draft?.items?.length ? (
        <View style={styles.botWorkflowItems}>
          <Text style={styles.botWorkflowSectionTitle}>{draft.items.length === 1 ? 'Producto encontrado' : 'Productos encontrados'}</Text>
          {draft.items.map((item, index) => (
            <View key={item.id || `${item.descripcion}-${index}`} style={styles.botWorkflowItemRow}>
              <Text style={styles.botWorkflowItemText}>{item.cantidad ?? 0} × {item.descripcion || 'Producto'}</Text>
              <Text style={styles.botWorkflowItemAmount}>{formatMoney(item.total ?? 0)}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {draft?.items?.length && (draft.subtotal !== undefined || draft.impuesto !== undefined || draft.total !== undefined) ? (
        <View style={styles.botWorkflowTotals}>
          <Text style={styles.botWorkflowSectionTitle}>Total calculado</Text>
          <Text style={styles.botWorkflowTotalText}>Subtotal {formatMoney(draft.subtotal ?? 0)}</Text>
          <Text style={styles.botWorkflowTotalText}>IVA {formatMoney(draft.impuesto ?? 0)}</Text>
          <Text style={styles.botWorkflowTotalStrong}>Total {formatMoney(draft.total ?? 0)}</Text>
        </View>
      ) : null}
      {hasPayment ? <View style={styles.botWorkflowClient}><Text style={styles.botWorkflowLabel}>Forma de pago confirmada</Text><Text style={styles.botWorkflowValue}>{draft?.formaPago}</Text></View> : null}
      {selectionOptions.length > 0 ? (
        <View style={styles.botWorkflowOptions}>
          <Text style={styles.botWorkflowSectionTitle}>Selecciona una opción</Text>
          {selectionOptions.map((option) => <Pressable key={`${option.tipo}-${option.indice}`} disabled={sending} style={[styles.botWorkflowOption, sending && styles.botWorkflowActionDisabled]} onPress={() => onCommand(String(option.indice))}><Text style={styles.botWorkflowOptionTitle}>{option.indice}. {option.etiqueta}</Text><Text style={styles.botWorkflowOptionDescription}>{option.descripcion || 'Toca para seleccionar'}</Text></Pressable>)}
        </View>
      ) : null}
      {configurationRoutes.length > 0 ? (
        <View style={styles.botWorkflowOptions}>
          <Text style={styles.botWorkflowSectionTitle}>{configurationRoutes.every(isConfigurationRoute) ? 'Configuración necesaria' : 'Secciones sugeridas'}</Text>
          {configurationRoutes.map((route) => <Pressable key={route} accessibilityRole="button" accessibilityLabel={configurationRouteLabel(route)} disabled={sending || !onNavigate} style={[styles.botWorkflowOption, (sending || !onNavigate) && styles.botWorkflowActionDisabled]} onPress={() => onNavigate?.(route)}><Text style={styles.botWorkflowOptionTitle}>{configurationRouteLabel(route)}</Text><Text style={styles.botWorkflowOptionDescription}>{isConfigurationRoute(route) ? 'Completa este requisito para continuar.' : 'Abre la sección relacionada.'}</Text></Pressable>)}
        </View>
      ) : null}
      {actualMissing.some(isMissingProduct) ? (
        <View style={styles.botWorkflowActions}>
          <Pressable disabled={sending} style={[styles.botWorkflowCancelButton, sending && styles.botWorkflowActionDisabled]} onPress={() => onCommand('ayúdame a crear el producto')}><Text style={styles.botWorkflowCancelText}>Ayúdame a crearlo</Text></Pressable>
          <Pressable disabled={sending} style={[styles.botWorkflowConfirmButton, sending && styles.botWorkflowActionDisabled]} onPress={() => onCommand('continuar')}><Text style={styles.botWorkflowConfirmText}>Seguir</Text></Pressable>
        </View>
      ) : null}
      {operationBlocked ? <Text style={styles.botWorkflowExpiredHint}>Solicita nuevamente la operación para generar una nueva confirmación.</Text> : null}
      {showActions && needsConfirmation && !stale ? (
        <View style={styles.botWorkflowActions}>
          <Pressable accessibilityRole="button" accessibilityLabel={pendingOperation ? 'Cancelar operación' : 'Cancelar emisión'} disabled={sending} style={[styles.botWorkflowCancelButton, sending && styles.botWorkflowActionDisabled]} onPress={() => onCommand('cancelar')}><Text style={styles.botWorkflowCancelText}>{pendingOperation ? 'Cancelar operación' : 'Cancelar emisión'}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={pendingOperation ? 'Confirmar operación' : 'Emitir factura'} accessibilityState={{ disabled: sending || operationBlocked }} disabled={sending || operationBlocked} style={[styles.botWorkflowConfirmButton, styles.botWorkflowConfirmButtonProminent, (sending || operationBlocked) && styles.botWorkflowActionDisabled]} onPress={() => onCommand(pendingOperation ? 'confirmar' : 'emitir')}><MaterialCommunityIcons name="check" size={18} color="#FFFFFF" /><Text style={styles.botWorkflowConfirmText}>{pendingOperation && operationBlocked ? 'Solicita nueva confirmación' : pendingOperation ? 'Confirmar operación' : 'Emitir factura'}</Text></Pressable>
        </View>
      ) : null}
      {state === 'FacturaEmitida' ? <Text style={styles.botWorkflowSuccess}>Factura emitida correctamente.</Text> : null}
      {isCancelled ? <Text style={styles.botWorkflowCancelled}>La operación quedó cancelada.</Text> : null}
      {isExpired ? <Text style={styles.botWorkflowExpiredHint}>La confirmación anterior ya no es válida; vuelve a solicitar la operación.</Text> : null}
    </Animated.View>
  );
}

function configurationRouteLabel(route: string) {
  const labels: Record<string, string> = {
    '/firma': 'Configurar firma electrónica',
    '/emisor': 'Configurar emisor',
    '/punto-emision': 'Configurar punto de emisión',
    '/estado-cuenta': 'Ver estado de cuenta',
    '/cuentas-cobrar': 'Ver cuentas por cobrar',
    '/recargas': 'Ver recargas',
    '/comprar-documentos': 'Comprar documentos',
    '/centro-normativo': 'Abrir centro normativo',
    '/facturas': 'Ver mis facturas',
    '/clientes': 'Abrir clientes',
    '/productos': 'Abrir productos',
  };
  return labels[route] ?? 'Abrir sección relacionada';
}

function normalizeBotRoute(route: string) {
  return route.trim().toLowerCase().split('?')[0].replace(/\/+$/, '') || '/';
}

function isSupportedBotRoute(route: string) {
  return supportedBotRoutes.has(normalizeBotRoute(route));
}

function normalizeSuggestedRoutes(routes: string[]) {
  return Array.from(new Set(routes.filter(isSupportedBotRoute).map(normalizeBotRoute)));
}

function isConfigurationRoute(route: string) {
  return ['/firma', '/emisor', '/punto-emision'].includes(route);
}

function getRemainingSeconds(expiraEn?: string | null) {
  if (!expiraEn) return null;
  const expiration = Date.parse(expiraEn);
  if (!Number.isFinite(expiration)) return null;
  return Math.max(0, Math.ceil((expiration - Date.now()) / 1000));
}

function hasActiveOperationExpiry(expiraEn?: string | null) {
  const remaining = getRemainingSeconds(expiraEn);
  return remaining !== null && remaining > 0;
}

function formatRemainingTime(seconds: number | null) {
  if (seconds === null) return 'unos minutos';
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function formatMoney(value: number) {
  return `$ ${Number(value || 0).toFixed(2)}`;
}

function isMissingProduct(value: string) {
  const normalized = normalizeVoiceCommand(value);
  return normalized.includes('producto') || normalized.includes('articulo');
}

function isCatalogListRequest(value: string) {
  const normalized = normalizeVoiceCommand(value);
  return /\b(lista|listar|muestra|mostrar|muestreme|ver|cuales|dame|ensen(a|ame))\b/.test(normalized)
    && /\b(clientes?|productos?)\b/.test(normalized);
}

function isExplicitNavigationRequest(value: string) {
  const normalized = normalizeVoiceCommand(value);
  return /\b(llevame|llevarme|abre|abrir|ir a|ve a|navega|navegar|muestrame la pantalla)\b/.test(normalized);
}

function isDocumentWorkflowRequest(value: string) {
  const normalized = normalizeVoiceCommand(value);
  return /\b(?:nc|nota de credito|nd|nota de debito|liq|liquidacion|ret|retencion|gr|guia de remision|cot|cotizacion|proforma|importar xml)\b/.test(normalized);
}

function isErubricaActionRequest(value: string) {
  const normalized = normalizeVoiceCommand(value);
  return /\b(firmar|firma|validar|solicitar|comprar|renovar|documentos por firmar|mis firmas)\b/.test(normalized);
}

function getErubricaRouteVoiceHint(route?: string | null) {
  switch (normalizeBotRoute(route ?? '')) {
    case '/e-rubrica/configuracion/firma':
      return ' La clave del certificado ya debe estar configurada; aquí solo revisaremos su estado.';
    case '/e-rubrica/documentos/firmar':
    case '/e-rubrica/documentos-por-firmar':
      return ' En la siguiente pantalla selecciona el PDF y toca el documento para ubicar la firma.';
    case '/e-rubrica/documentos/validar-firma':
      return ' En la siguiente pantalla selecciona el PDF que deseas validar.';
    default:
      return '';
  }
}

function limitCatalogListAnswer(answer: string, request: string) {
  if (!isCatalogListRequest(request)) return answer;
  const lines = answer.split(/\r?\n/);
  const itemIndexes = lines
    .map((line, index) => /^\s*(?:[-•*]|\d+[.)-])\s+/.test(line) ? index : -1)
    .filter((index) => index >= 0);
  if (itemIndexes.length <= 3) return answer;
  const firstItemIndex = itemIndexes[0];
  const prefix = lines.slice(0, firstItemIndex).filter((line) => line.trim());
  const firstItems = itemIndexes.slice(0, 3).map((index) => lines[index]);
  return [...prefix, ...firstItems, '¿Quieres que te muestre los siguientes 3 resultados?'].join('\n');
}

function buildVoiceResponse(answer: string, draft: BotFacturaDraft | null, missing: string[]) {
  const details: string[] = [];
  if (draft?.cliente?.nombre) details.push(`Cliente ${draft.cliente.nombre} encontrado.`);
  const products = draft?.items?.map((item) => item.descripcion).filter((value): value is string => Boolean(value?.trim())) ?? [];
  if (products.length === 1) details.push(`Producto ${products[0]} encontrado.`);
  else if (products.length > 1) details.push(`${products.length} productos encontrados.`);
  if (draft?.items?.length && (draft.subtotal !== undefined || draft.impuesto !== undefined || draft.total !== undefined)) {
    details.push(`Valores calculados: subtotal ${formatMoney(draft.subtotal ?? 0)}, IVA ${formatMoney(draft.impuesto ?? 0)} y total ${formatMoney(draft.total ?? 0)}.`);
  }
  const unresolved = missing.filter((item) => !normalizeVoiceCommand(item).includes('confirm'));
  if (unresolved.length) details.push(`Te falta completar ${unresolved.join(', ')}. Puedo ayudarte a crearlo o puedes decir continuar.`);
  const compactAnswer = /cliente:|subtotal|descuento|impuestos|iva|total/i.test(answer)
    ? answer.split(/\r?\n/).filter((line) => !/^(cliente:|-\s|subtotal|descuento|impuestos|iva|total)/i.test(line.trim())).join(' ').trim()
    : answer.trim();
  return [...details, compactAnswer].filter(Boolean).join(' ');
}

function normalizeVoiceCommand(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function isLikelyAmbientVoice(value: string) {
  return /^(ah+|eh+|mmm+|mm+|ok(?:ay)?|hola|gracias|si)$/i.test(normalizeVoiceCommand(value));
}

function normalizeVoiceSelectionCommand(value: string, options: BotSelectionOption[]) {
  if (options.length === 0) return value;

  const normalized = normalizeVoiceCommand(value);
  const numberWords: Record<string, number> = {
    uno: 1,
    primero: 1,
    primera: 1,
    dos: 2,
    segundo: 2,
    segunda: 2,
    tres: 3,
    tercero: 3,
    tercera: 3,
    cuatro: 4,
    cuarto: 4,
    cuarta: 4,
    cinco: 5,
    quinto: 5,
    quinta: 5,
    seis: 6,
    sexto: 6,
    sexta: 6,
    siete: 7,
    septimo: 7,
    septima: 7,
    ocho: 8,
    octavo: 8,
    octava: 8,
    nueve: 9,
    noveno: 9,
    novena: 9,
    diez: 10,
    decimo: 10,
    decima: 10,
  };
  const match = normalized.match(/\b(?:opcion|alternativa|numero|el|la)?\s*(\d+|uno|primero|primera|dos|segundo|segunda|tres|tercero|tercera|cuatro|cuarto|cuarta|cinco|quinto|quinta|seis|sexto|sexta|siete|septimo|septima|ocho|octavo|octava|nueve|noveno|novena|diez|decimo|decima)\b/);
  if (!match) return value;

  const index = Number(match[1]) || numberWords[match[1]];
  return options.some((option) => option.indice === index) ? String(index) : value;
}

function selectVoiceResult<T extends { transcript: string; confidence: number }>(results: T[], options: BotSelectionOption[]) {
  const primary = results[0];
  if (!primary || options.length === 0) return primary;

  return results.find((result) => {
    const command = normalizeVoiceSelectionCommand(result.transcript, options);
    return /^\d+$/.test(command);
  }) ?? primary;
}

function buildSpeechResponse(answer: string, options: BotSelectionOption[] = []) {
  const compact = sanitizeSpeechText(answer)
    .replace(/\s+/g, ' ')
    .replace(/\s*•\s*/g, '')
    .replace(/\s*-\s+(?=[A-ZÁÉÍÓÚÑ])/g, ' ')
    .trim();
  const optionsText = options.length > 0
    ? ` Opciones: ${options.slice(0, 3).map((option) => `${option.indice}, ${option.etiqueta}`).join('; ')}.`
    : '';
  const withOptions = `${compact}${optionsText}`.trim();
  if (withOptions.length <= 520) return withOptions;

  const cutoff = withOptions.lastIndexOf('.', 500);
  return `${withOptions.slice(0, cutoff > 180 ? cutoff + 1 : 500).trim()} Para continuar, dime qué deseas hacer.`;
}

function isExplicitConfirmation(value: string) {
  return /\b(confirmado|confirmo)\b/.test(normalizeVoiceCommand(value));
}

function sanitizeSpeechText(value: string) {
  return value
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, 'el correo registrado')
    .replace(/\b\d{10,13}\b/g, 'la identificación registrada')
    .replace(/\b(cliente|producto|proveedor)\s+[^.;\n]+\s+encontrado(?:s)?/gi, '$1 encontrado')
    .replace(/\b(cliente|producto|proveedor)\s*:\s*[^.;\n]+/gi, '$1 registrado')
    .replace(/\b(subtotal|iva|impuesto|total)\s*:?\s*\$?\s*[\d.,]+/gi, '$1 disponible');
}

function isExplicitCancellation(value: string) {
  return /\b(cancelar|cancelo|anular|anulo)\b/.test(normalizeVoiceCommand(value));
}

async function speakBotText(text: string, shouldCancel: () => boolean = () => false, voice?: string) {
  const maxChunkLength = Number.isFinite(Speech.maxSpeechInputLength)
    ? Math.min(Math.max(Speech.maxSpeechInputLength, 500), 3500)
    : 3500;
  const chunks: string[] = [];
  let chunk = '';
  for (const word of text.trim().split(/\s+/)) {
    if (chunk && `${chunk} ${word}`.length > maxChunkLength) {
      chunks.push(chunk);
      chunk = word;
    } else {
      chunk = chunk ? `${chunk} ${word}` : word;
    }
  }
  if (chunk) chunks.push(chunk);
  if (!chunks.length) return true;
  try {
    await Speech.stop();
  } catch {
    // Detener una locución previa no debe impedir la respuesta actual.
  }
  for (const part of chunks) {
    if (shouldCancel()) return false;
    const completed = await new Promise<boolean>((resolve) => {
      Speech.speak(part, {
        language: 'es-EC',
        voice,
        pitch: 0.9,
        rate: 0.94,
        useApplicationAudioSession: false,
        onDone: () => resolve(true),
        onStopped: () => resolve(false),
        onError: () => resolve(false),
      });
    });
    if (!completed || shouldCancel()) return false;
  }
  return true;
}

async function resolveSpanishMaleVoice() {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const spanishVoices = voices.filter((item) => /^es(?:-|_)/i.test(item.language));
    const maleVoice = spanishVoices.find((item) => /jorge|diego|carlos|miguel|juan|pablo|enrique|hombre|masculin|male/i.test(`${item.name} ${item.identifier}`));
    const enhancedVoice = spanishVoices.find((item) => item.quality === Speech.VoiceQuality.Enhanced);
    return (maleVoice ?? enhancedVoice ?? spanishVoices[0])?.identifier;
  } catch {
    return undefined;
  }
}

